/**
 * LocationScreen - 位置選擇畫面（Web 版）
 *
 * 功能說明：
 * - Web 平台的位置畫面替代版本
 * - 顯示用戶當前座標（文字列表形式）
 * - 支援位置分享開關
 * - 顯示旅程策畫師的位置資訊
 * - 提示使用者地圖功能僅限行動裝置
 *
 * 與原生版差異：
 * - 不使用 react-native-maps（Web 不支援）
 * - 以列表方式顯示位置資訊取代地圖
 *
 * 串接的 API：
 * - POST /api/location/update - 更新用戶位置
 *
 * @see 後端合約: contracts/APP.md Phase 3
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Switch,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../constants/translations';
import { useApp } from '../../../context/AppContext';
import { UIColors } from '../../../../constants/Colors';

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

  // Refs（用於節流控制）
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

  // ============ 載入狀態 ============

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>{t.gettingLocation}</Text>
      </View>
    );
  }

  // ============ 錯誤狀態 ============

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={startLocationTracking}>
          <Text style={styles.retryButtonText}>{t.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          thumbColor={isSharingEnabled ? '#22c55e' : '#f4f4f5'}
        />
      </View>

      {/* ===== 位置資訊列表 ===== */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {/* 用戶位置卡片 */}
        <View style={styles.locationCard}>
          <View style={styles.locationIcon}>
            <Ionicons name="navigate" size={24} color="#22c55e" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>{t.yourLocation}</Text>
            <Text style={styles.locationCoords}>
              {location?.coords.latitude.toFixed(6)}, {location?.coords.longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        {/* 策畫師位置區塊 */}
        {plannerLocations.length > 0 && (
          <View style={styles.plannerSection}>
            <Text style={styles.sectionTitle}>{t.planner}</Text>
            {plannerLocations.map((planner) => (
              <View key={planner.id} style={styles.plannerCard}>
                <View style={styles.plannerIcon}>
                  <Ionicons name="person" size={20} color="#8b5cf6" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationTitle}>{planner.name}</Text>
                  <Text style={styles.locationCoords}>
                    {planner.latitude.toFixed(6)}, {planner.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ===== Web 版提示訊息 ===== */}
        <View style={styles.webNotice}>
          <Ionicons name="information-circle-outline" size={20} color={UIColors.textSecondary} />
          <Text style={styles.webNoticeText}>
            Map view is only available on mobile devices
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // 位置分享開關區
  sharingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sharingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sharingText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
  // 列表區
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  // 載入狀態
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // 位置卡片
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  locationIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#dcfce7',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 13,
    color: UIColors.textSecondary,
    fontFamily: 'monospace',
  },
  // 策畫師區塊
  plannerSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: UIColors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  plannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  plannerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f3e8ff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Web 版提示
  webNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  webNoticeText: {
    fontSize: 14,
    color: UIColors.textSecondary,
  },
});
