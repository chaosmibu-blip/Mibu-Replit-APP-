/**
 * Socket.io 即時通訊服務
 *
 * 提供即時位置追蹤功能，包含：
 * - Socket 連線管理
 * - 用戶位置更新（旅客模式）
 * - 位置追蹤訂閱（專員模式）
 *
 * @module SocketService
 *
 * 使用場景：
 * 1. 旅客模式：用戶發送 SOS 後，持續上傳位置給專員追蹤
 * 2. 專員模式：專員訂閱旅客位置，即時掌握旅客動態
 *
 * 事件清單：
 * - connect - 連線成功
 * - disconnect - 連線中斷
 * - connect_error - 連線錯誤
 * - location_update（發送）- 上傳位置
 * - location_ack（接收）- 位置確認
 * - specialist_subscribe（發送）- 訂閱旅客位置
 * - traveler_location（接收）- 接收旅客位置
 */
import { io, Socket } from 'socket.io-client';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../constants/translations';

// ========== 模組狀態 ==========

/** Socket 連線實例（單例） */
let socket: Socket | null = null;

/** 位置追蹤訂閱（用於停止追蹤） */
let locationSubscription: Location.LocationSubscription | null = null;

// ========== 類型定義 ==========

/**
 * 旅客位置資料結構
 *
 * 專員收到的旅客位置資訊
 */
interface TravelerLocation {
  /** 旅客 ID */
  travelerId: string;
  /** 服務 ID（SOS 或行程） */
  serviceId: number;
  /** 緯度 */
  lat: number;
  /** 經度 */
  lng: number;
  /** 時間戳記 */
  timestamp: number;
}

/**
 * 位置更新資料結構
 *
 * 用戶上傳的位置資訊
 */
interface LocationUpdatePayload {
  /** 緯度 */
  lat: number;
  /** 經度 */
  lng: number;
  /** 時間戳記 */
  timestamp: number;
}

// ========== 連線管理 ==========

/**
 * 初始化 Socket 連線
 *
 * 建立與後端的 WebSocket 連線
 * 若已連線則直接回傳現有連線
 *
 * @param token - 用戶認證 Token（用於 Socket 認證）
 * @returns Socket 實例
 *
 * @example
 * const socket = initSocket(userToken);
 * socket.on('message', handleMessage);
 */
export function initSocket(token: string): Socket {
  // 若已有連線，直接回傳
  if (socket?.connected) {
    return socket;
  }

  // 建立新連線
  socket = io(API_BASE_URL, {
    auth: { token },  // 使用 Token 進行認證
    transports: ['websocket', 'polling'],  // 優先使用 WebSocket，降級為 polling
  });

  // 連線成功
  socket.on('connect', () => {
    if (__DEV__) console.log('Socket connected');
  });

  // 連線中斷
  socket.on('disconnect', () => {
    if (__DEV__) console.log('Socket disconnected');
  });

  // 連線錯誤
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

/**
 * 中斷 Socket 連線
 *
 * 關閉連線並清理資源
 * 同時停止位置追蹤
 *
 * @example
 * // 登出時呼叫
 * disconnectSocket();
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  // 同時停止位置追蹤
  stopLocationTracking();
}

/**
 * 取得 Socket 實例
 *
 * 取得目前的 Socket 連線（可能為 null）
 *
 * @returns Socket 實例或 null
 *
 * @example
 * const socket = getSocket();
 * if (socket) {
 *   socket.emit('custom_event', data);
 * }
 */
export function getSocket(): Socket | null {
  return socket;
}

// ========== 位置追蹤（旅客模式） ==========

/**
 * 開始位置追蹤
 *
 * 開始持續追蹤用戶位置並上傳至後端
 * 用於 SOS 緊急求救時的位置回報
 *
 * 追蹤設定：
 * - 精準度：高
 * - 時間間隔：5 秒
 * - 距離間隔：10 公尺
 *
 * @param onAck - 位置確認回呼（可選）
 * @returns Promise<void>
 *
 * @example
 * // 發送 SOS 後開始追蹤
 * await startLocationTracking((location) => {
 *   console.log('位置已上傳:', location);
 * });
 */
export async function startLocationTracking(
  onAck?: (data: { lat: number; lng: number; timestamp: number }) => void
): Promise<void> {
  // 檢查 Socket 是否已初始化
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  // 請求位置權限
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.error('Location permission denied');
    return;
  }

  // 監聽位置確認事件（可選）
  if (onAck) {
    socket.on('location_ack', onAck);
  }

  // 開始追蹤位置
  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,  // 高精準度
      timeInterval: 5000,  // 每 5 秒更新一次
      distanceInterval: 10,  // 移動超過 10 公尺才更新
    },
    (location) => {
      // 組裝位置資料
      const payload: LocationUpdatePayload = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        timestamp: Date.now(),
      };
      // 發送位置更新事件
      socket?.emit('location_update', payload);
    }
  );
}

/**
 * 停止位置追蹤
 *
 * 停止位置追蹤並釋放資源
 *
 * @example
 * // SOS 結束或取消時呼叫
 * stopLocationTracking();
 */
export function stopLocationTracking(): void {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
}

// ========== 位置訂閱（專員模式） ==========

/**
 * 訂閱旅客位置更新
 *
 * 專員訂閱旅客位置，用於追蹤 SOS 用戶
 * 訂閱後會持續收到旅客位置更新
 *
 * @param onLocation - 收到位置時的回呼函數
 *
 * @example
 * // 專員開始追蹤旅客
 * subscribeToTravelerLocations((location) => {
 *   updateMapMarker(location.travelerId, location.lat, location.lng);
 * });
 */
export function subscribeToTravelerLocations(
  onLocation: (data: TravelerLocation) => void
): void {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  // 發送訂閱請求
  socket.emit('specialist_subscribe', {});
  // 監聽旅客位置事件
  socket.on('traveler_location', onLocation);
}

/**
 * 取消訂閱旅客位置更新
 *
 * 停止接收旅客位置更新
 *
 * @example
 * // 專員結束追蹤
 * unsubscribeFromTravelerLocations();
 */
export function unsubscribeFromTravelerLocations(): void {
  socket?.off('traveler_location');
}
