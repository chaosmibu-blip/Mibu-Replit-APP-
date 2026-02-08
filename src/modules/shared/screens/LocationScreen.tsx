/**
 * LocationScreen - 位置選擇畫面（原生版）
 *
 * 功能說明：
 * - 顯示用戶當前位置於地圖上
 * - 支援位置分享開關
 * - 顯示旅程策畫師的位置（如有）
 * - 即時追蹤位置變化並回報給後端
 * - 使用節流機制避免過度回報
 *
 * 串接的 API：
 * - POST /api/location/update - 更新用戶位置
 *   回應可能包含 plannerLocations 陣列
 *
 * 技術細節：
 * - 使用 react-native-maps 顯示地圖
 * - 使用 expo-location 取得位置
 * - 節流間隔：10 秒或移動 10 公尺以上
 *
 * @see 後端合約: contracts/APP.md Phase 3
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Text,
  Switch,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../constants/translations';
import { useApp } from '../../../context/AppContext';
import { MibuBrand, UIColors, SemanticColors } from '../../../../constants/Colors';

// ============ 常數定義 ============

/** 位置回報節流間隔（毫秒） */
const THROTTLE_INTERVAL = 10000;

/** 最小移動距離（公尺），超過才回報 */
const MIN_DISTANCE_METERS = 10;

// ============ 介面定義 ============

/** 策畫師位置資料 */
interface PlannerLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// ============ 輔助函數 ============

/**
 * 計算兩點間距離（公尺）
 * 使用 Haversine 公式
 */
function getDistanceFromLatLonInMeters(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // 地球半徑（公尺）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============ 元件本體 ============

export function LocationScreen() {
  const { t } = useApp();

  // ============ 狀態管理 ============

  const [location, setLocation] = useState<Location.LocationObject | null>(null); // 當前位置
  const [loading, setLoading] = useState(true); // 載入中
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // 錯誤訊息
  const [isSharingEnabled, setIsSharingEnabled] = useState(false); // 是否開啟位置分享
  const [plannerLocations, setPlannerLocations] = useState<PlannerLocation[]>([]); // 策畫師位置列表

  // Refs
  const mapRef = useRef<MapView | null>(null); // 地圖參照
  const lastReportedLocation = useRef<{ latitude: number; longitude: number } | null>(null); // 上次回報的位置
  const lastReportTime = useRef<number>(0); // 上次回報時間
  const locationSubscription = useRef<Location.LocationSubscription | null>(null); // 位置監聽訂閱

  // ============ API 函數 ============

  /**
   * 更新用戶位置到後端
   * @param latitude 緯度
   * @param longitude 經度
   * @param sharing 是否分享位置
   */
  const updateUserLocation = useCallback(async (latitude: number, longitude: number, sharing: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/location/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat: latitude, lng: longitude }),
      });

      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 0) {
          const data = await response.json();
          // 更新策畫師位置（如果有回傳）
          if (data.plannerLocations && Array.isArray(data.plannerLocations)) {
            setPlannerLocations(data.plannerLocations);
          }
        }
      }
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }, []);

  /**
   * 判斷是否應該回報位置
   * 條件：超過節流間隔 或 移動超過最小距離
   */
  const shouldReportLocation = useCallback((latitude: number, longitude: number): boolean => {
    const now = Date.now();
    const timeSinceLastReport = now - lastReportTime.current;

    // 超過節流間隔
    if (timeSinceLastReport >= THROTTLE_INTERVAL) {
      return true;
    }

    // 檢查移動距離
    if (lastReportedLocation.current) {
      const distance = getDistanceFromLatLonInMeters(
        lastReportedLocation.current.latitude,
        lastReportedLocation.current.longitude,
        latitude,
        longitude
      );

      if (distance >= MIN_DISTANCE_METERS) {
        return true;
      }
    }

    return false;
  }, []);

  /**
   * 處理位置更新
   * 更新本地狀態並決定是否回報後端
   */
  const handleLocationUpdate = useCallback((newLocation: Location.LocationObject) => {
    setLocation(newLocation);

    const { latitude, longitude } = newLocation.coords;

    // 檢查是否需要回報
    if (shouldReportLocation(latitude, longitude)) {
      updateUserLocation(latitude, longitude, isSharingEnabled);
      lastReportedLocation.current = { latitude, longitude };
      lastReportTime.current = Date.now();
    }
  }, [shouldReportLocation, updateUserLocation, isSharingEnabled]);

  /**
   * 開始位置追蹤
   * 請求權限、取得初始位置、設定持續監聽
   */
  const startLocationTracking = useCallback(async () => {
    try {
      // 請求位置權限
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg(t.locationPermissionRequired);
        setLoading(false);
        return;
      }

      // 取得當前位置（高精度）
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      handleLocationUpdate(currentLocation);
      setLoading(false);

      // 設定持續監聽
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // 每 5 秒檢查
          distanceInterval: 5, // 每 5 公尺檢查
        },
        handleLocationUpdate
      );
    } catch (error) {
      console.error('Location error:', error);
      setErrorMsg(t.unableToGetLocation);
      setLoading(false);
    }
  }, [handleLocationUpdate, t]);

  // ============ 生命週期 ============

  useEffect(() => {
    startLocationTracking();

    // 清理：移除位置監聽
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [startLocationTracking]);

  // ============ 事件處理 ============

  /**
   * 將地圖中心移動到用戶位置
   */
  const centerOnUser = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  }, [location]);

  // ============ 載入狀態 ============

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={SemanticColors.successDark} />
        <Text style={styles.loadingText}>{t.gettingLocation}</Text>
      </View>
    );
  }

  // ============ 錯誤狀態 ============

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location-outline" size={48} color={SemanticColors.errorDark} />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={startLocationTracking}>
          <Text style={styles.retryButtonText}>{t.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 預設地圖區域（台北）
  const initialRegion = {
    latitude: location?.coords.latitude || 25.0330,
    longitude: location?.coords.longitude || 121.5654,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // ============ 主要渲染 ============

  return (
    <View style={styles.container}>
      {/* ===== 位置分享開關 ===== */}
      <View style={styles.sharingToggle}>
        <View style={styles.sharingInfo}>
          <Ionicons name="people" size={20} color={UIColors.textSecondary} />
          <Text style={styles.sharingText}>{t.shareLocationToPlanner}</Text>
        </View>
        <Switch
          value={isSharingEnabled}
          onValueChange={setIsSharingEnabled}
          trackColor={{ false: '#d1d5db', true: '#86efac' }}
          thumbColor={isSharingEnabled ? SemanticColors.successDark : '#f4f4f5'}
        />
      </View>

      {/* ===== 地圖區域 ===== */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        rotateEnabled={true}
        pitchEnabled={true}
      >
        {/* 用戶位置標記 */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={t.yourLocation}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* 策畫師位置標記 */}
        {plannerLocations.map((planner) => (
          <Marker
            key={planner.id}
            coordinate={{
              latitude: planner.latitude,
              longitude: planner.longitude,
            }}
            title={planner.name}
            description={t.planner}
          >
            <View style={styles.plannerMarker}>
              <Ionicons name="person" size={16} color={UIColors.white} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* ===== 定位按鈕 ===== */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
        <Ionicons name="locate" size={24} color={SemanticColors.successDark} />
      </TouchableOpacity>
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
  },
  // 位置分享開關區
  sharingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UIColors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  sharingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sharingText: {
    fontSize: 15,
    color: MibuBrand.brownDark,
    fontWeight: '500',
  },
  // 地圖
  map: {
    flex: 1,
  },
  // 載入狀態
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: UIColors.textSecondary,
  },
  // 錯誤狀態
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: UIColors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: SemanticColors.successDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: UIColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // 定位按鈕
  centerButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: UIColors.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  // 用戶標記
  userMarker: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    backgroundColor: SemanticColors.successDark,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: UIColors.white,
  },
  // 策畫師標記
  plannerMarker: {
    width: 32,
    height: 32,
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: UIColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
