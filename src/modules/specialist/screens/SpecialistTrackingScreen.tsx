/**
 * SpecialistTrackingScreen - 專員即時追蹤畫面
 *
 * 功能說明：
 * - 透過 WebSocket 即時接收旅客位置更新
 * - 顯示連線狀態（已連線 / 已斷線）
 * - 列出所有旅客的位置資訊（經緯度、最後更新時間）
 * - 支援地圖顯示（需要 react-native-maps，網頁版顯示替代畫面）
 *
 * 串接的 API / WebSocket：
 * - WebSocket 連線至 API_BASE_URL
 * - 事件: traveler_location - 單一旅客位置更新
 * - 事件: active_travelers - 所有活躍旅客位置
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { useAuth, useI18n } from '../../../context/AppContext';
import { API_BASE_URL } from '../../../constants/translations';
import { LOCALE_MAP } from '../../../utils/i18n';
import { UIColors } from '../../../../constants/Colors';

// ============ 型別定義 ============

/**
 * 旅客位置資料結構
 */
interface TravelerLocation {
  travelerId: string;       // 旅客 ID
  serviceId?: number;       // 服務關係 ID（選填）
  lat: number;              // 緯度
  lng: number;              // 經度
  timestamp: string;        // 時間戳記
  travelerName?: string;    // 旅客名稱（選填）
}

// ============ 元件主體 ============
export function SpecialistTrackingScreen() {
  const { getToken } = useAuth();
  const { t, language } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams();

  // ============ 狀態變數與 Refs ============
  // socketRef: WebSocket 連線實例
  const socketRef = useRef<Socket | null>(null);
  // locations: 旅客位置 Map（以 travelerId 為 key）
  const [locations, setLocations] = useState<Map<string, TravelerLocation>>(new Map());
  // connected: WebSocket 是否已連線
  const [connected, setConnected] = useState(false);
  // loading: 是否正在載入/連線中
  const [loading, setLoading] = useState(true);

  // 元件載入時初始化 WebSocket，卸載時斷開連線
  useEffect(() => {
    initSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // ============ WebSocket 初始化 ============

  /**
   * 初始化 WebSocket 連線
   * 設定連線、斷線、錯誤等事件監聽
   */
  const initSocket = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // 建立 WebSocket 連線
      socketRef.current = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      // 連線成功事件
      socketRef.current.on('connect', () => {
        setConnected(true);
        setLoading(false);
        // 訂閱旅客位置更新
        socketRef.current?.emit('specialist_subscribe', {});
      });

      // 斷線事件
      socketRef.current.on('disconnect', () => {
        setConnected(false);
      });

      // 單一旅客位置更新事件
      socketRef.current.on('traveler_location', (data: TravelerLocation) => {
        setLocations(prev => {
          const updated = new Map(prev);
          updated.set(data.travelerId, data);
          return updated;
        });
      });

      // 所有活躍旅客位置事件
      socketRef.current.on('active_travelers', (data: { count: number; travelers: TravelerLocation[] }) => {
        const newLocations = new Map<string, TravelerLocation>();
        data.travelers.forEach(t => {
          newLocations.set(t.travelerId, t);
        });
        setLocations(newLocations);
      });

      // 連線錯誤事件
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setLoading(false);
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setLoading(false);
    }
  };

  // ============ 格式化函數 ============

  /**
   * 格式化時間顯示
   * @param timestamp - ISO 時間字串
   * @returns 格式化後的時間字串（時:分:秒）
   */
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(LOCALE_MAP[language], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 將 Map 轉為陣列以便渲染
  const locationArray = Array.from(locations.values());

  // ============ Loading 畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{t.specialist_connecting}</Text>
      </View>
    );
  }

  // ============ 主畫面 JSX ============
  return (
    <View style={styles.container}>
      {/* ============ 頁面標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{t.specialist_liveTracking}</Text>
        {/* 連線狀態標籤 */}
        <View style={[styles.connectionStatus, connected ? styles.statusConnected : styles.statusDisconnected]}>
          <View style={[styles.statusDot, connected ? styles.dotConnected : styles.dotDisconnected]} />
          <Text style={styles.statusText}>
            {connected ? t.specialist_connected : t.specialist_disconnected}
          </Text>
        </View>
      </View>

      {/* ============ 主內容區 ============ */}
      <View style={styles.content}>
        {/* ============ 地圖區域 ============ */}
        {Platform.OS === 'web' ? (
          // 網頁版：顯示替代畫面
          <View style={styles.webMapPlaceholder}>
            <Ionicons name="map-outline" size={64} color="#94a3b8" />
            <Text style={styles.webMapText}>
              {t.specialist_mapNotAvailableWeb}
            </Text>
            <Text style={styles.travelerCount}>
              {locationArray.length} {t.specialist_travelers}
            </Text>
          </View>
        ) : (
          // 原生版：地圖容器（需要 react-native-maps）
          <View style={styles.mapContainer}>
            <Text style={styles.mapPlaceholderText}>
              {t.specialist_mapRequiresNative}
            </Text>
          </View>
        )}

        {/* ============ 旅客位置列表卡片 ============ */}
        <View style={styles.travelerListCard}>
          <Text style={styles.listTitle}>
            {t.specialist_travelerLocations} ({locationArray.length})
          </Text>
          {locationArray.length === 0 ? (
            // 空狀態顯示
            <Text style={styles.noDataText}>{t.specialist_noLocations}</Text>
          ) : (
            // 旅客位置列表
            <View style={styles.travelerList}>
              {locationArray.map(loc => (
                <View key={loc.travelerId} style={styles.travelerItem}>
                  {/* 旅客圖示 */}
                  <View style={styles.travelerIcon}>
                    <Ionicons name="person-circle" size={36} color="#6366f1" />
                  </View>
                  {/* 旅客位置資訊 */}
                  <View style={styles.travelerDetails}>
                    <Text style={styles.travelerName}>
                      {loc.travelerName || `Traveler #${loc.travelerId.slice(-6)}`}
                    </Text>
                    <Text style={styles.travelerCoords}>
                      {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                    </Text>
                    <Text style={styles.travelerTime}>
                      {t.specialist_lastUpdate}: {formatTime(loc.timestamp)}
                    </Text>
                  </View>
                  {/* 定位按鈕 */}
                  <TouchableOpacity style={styles.focusButton}>
                    <Ionicons name="locate" size={20} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // 頁面標題樣式
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  // 連線狀態標籤樣式
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusConnected: {
    backgroundColor: '#dcfce7',
  },
  statusDisconnected: {
    backgroundColor: '#fef2f2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotConnected: {
    backgroundColor: '#22c55e',
  },
  dotDisconnected: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: UIColors.textSecondary,
  },
  // Loading 狀態樣式
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: UIColors.textSecondary,
    fontSize: 16,
  },
  // 主內容區樣式
  content: {
    flex: 1,
  },
  // 網頁版地圖替代畫面樣式
  webMapPlaceholder: {
    height: 200,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webMapText: {
    marginTop: 12,
    color: UIColors.textSecondary,
    fontSize: 16,
  },
  travelerCount: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  // 原生版地圖容器樣式
  mapContainer: {
    height: 300,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    color: UIColors.textSecondary,
    fontSize: 14,
  },
  // 旅客列表卡片樣式
  travelerListCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    marginTop: -20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 16,
    paddingVertical: 40,
  },
  // 旅客列表樣式
  travelerList: {
    gap: 12,
  },
  travelerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  travelerIcon: {
    marginRight: 12,
  },
  travelerDetails: {
    flex: 1,
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  // 座標文字樣式（使用等寬字體）
  travelerCoords: {
    fontSize: 12,
    color: UIColors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  travelerTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  // 定位按鈕樣式
  focusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
