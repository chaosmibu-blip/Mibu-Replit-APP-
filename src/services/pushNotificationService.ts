/**
 * 推播通知服務
 *
 * 處理 Expo Push Notifications 的完整生命週期：
 * - 權限請求與管理
 * - Push Token 註冊與取得
 * - 通知接收與處理
 * - Badge 管理
 *
 * @module PushNotificationService
 *
 * 注意事項：
 * - 此服務需要原生模組，在 Expo Go 或 Web 環境可能無法使用
 * - 會優雅降級（graceful degradation），不影響其他功能
 * - Android 需要設定通知頻道
 * - iOS 需要在實體設備上才能運作
 *
 * 使用限制：
 * - 模擬器/Web：無法使用推播功能
 * - Expo Go：功能受限
 * - EAS Build：完整功能
 */
import { Platform } from 'react-native';
import { apiService } from './api';

// ========== 動態模組載入 ==========

/**
 * expo-notifications 模組引用
 * 動態載入以避免在不支援的環境報錯
 */
let Notifications: typeof import('expo-notifications') | null = null;

/**
 * expo-device 模組引用
 * 用於檢測是否為實體設備
 */
let Device: typeof import('expo-device') | null = null;

/** 推播通知是否可用 */
let isNotificationsAvailable = false;

// ========== 模組初始化 ==========

// 嘗試載入原生模組
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Device = require('expo-device');
  isNotificationsAvailable = true;

  // 設定通知處理行為
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,     // 顯示通知橫幅
        shouldPlaySound: true,     // 播放通知音效
        shouldSetBadge: true,      // 更新 Badge 數字
        shouldShowBanner: true,    // 顯示通知橫幅（iOS 14+）
        shouldShowList: true,      // 顯示在通知中心
      }),
    });
  }
} catch (error) {
  // 在不支援的環境（如 Web）靜默處理
  console.warn('Push notifications not available in this environment');
  isNotificationsAvailable = false;
}

// ========== 服務類別 ==========

/**
 * 推播通知服務類別
 *
 * 提供完整的推播通知管理功能
 * 支援權限請求、Token 管理、通知監聽等
 */
class PushNotificationService {
  /** Expo Push Token（格式：ExponentPushToken[xxx]） */
  private expoPushToken: string | null = null;

  // ========== 可用性檢查 ==========

  /**
   * 檢查推播通知是否可用
   *
   * 檢查原生模組是否成功載入
   *
   * @returns 是否可用
   *
   * @example
   * if (pushNotificationService.isAvailable()) {
   *   // 執行推播相關操作
   * }
   */
  isAvailable(): boolean {
    return isNotificationsAvailable && Notifications !== null && Device !== null;
  }

  // ========== Token 註冊 ==========

  /**
   * 註冊推播通知並取得 Expo Push Token
   *
   * 完整流程：
   * 1. 檢查環境是否支援
   * 2. 檢查是否為實體設備
   * 3. 請求通知權限
   * 4. 取得 Expo Push Token
   * 5. 設定 Android 通知頻道
   *
   * @returns Expo Push Token 或 null（若無法取得）
   *
   * @example
   * const token = await pushNotificationService.registerForPushNotifications();
   * if (token) {
   *   console.log('Push Token:', token);
   * }
   */
  async registerForPushNotifications(): Promise<string | null> {
    // 檢查環境支援
    if (!this.isAvailable() || !Notifications || !Device) {
      console.warn('Push notifications not available');
      return null;
    }

    // 只在實體設備上運行（模擬器無法收到推播）
    if (!Device.isDevice) {
      console.warn('Push notifications require a physical device');
      return null;
    }

    try {
      // 檢查現有權限狀態
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 如果尚未授權，請求權限
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // 用戶拒絕授權
      if (finalStatus !== 'granted') {
        console.warn('Push notification permission denied');
        return null;
      }

      // 取得 Expo Push Token
      // 注意：在 Expo Go 中不需要 projectId，只有 EAS Build 才需要
      const tokenData = await Notifications.getExpoPushTokenAsync();

      this.expoPushToken = tokenData.data;

      // Android 需要設定通知頻道（Android 8.0+）
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,  // 最高優先級
          vibrationPattern: [0, 250, 250, 250],  // 震動模式
          lightColor: '#8B6914',  // LED 燈顏色（品牌色）
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * 向後端註冊 Push Token
   *
   * 將 Push Token 發送到後端，用於伺服器推送通知
   * 若尚未取得 Token，會先執行註冊流程
   *
   * @param authToken - 用戶認證 Token
   * @returns 是否註冊成功
   *
   * @example
   * // 登入後呼叫
   * const success = await pushNotificationService.registerTokenWithBackend(authToken);
   */
  async registerTokenWithBackend(authToken: string): Promise<boolean> {
    // 檢查環境支援
    if (!this.isAvailable()) {
      return false;
    }

    // 若尚未取得 Token，先執行註冊
    if (!this.expoPushToken) {
      const token = await this.registerForPushNotifications();
      if (!token) return false;
    }

    try {
      // 檢查 API 方法是否存在（避免未導出時報錯）
      if (typeof apiService.registerPushToken !== 'function') {
        console.warn('registerPushToken API not available yet');
        return false;
      }

      // 向後端註冊 Token
      await apiService.registerPushToken(authToken, {
        token: this.expoPushToken!,
        platform: Platform.OS as 'ios' | 'android',
      });
      return true;
    } catch (error) {
      // 靜默處理錯誤，不影響用戶體驗
      console.warn('Push token registration skipped:', error);
      return false;
    }
  }

  /**
   * 登出時取消註冊
   *
   * 清除本地 Token
   * 可擴充為呼叫後端 unregister API
   *
   * @param _authToken - 用戶認證 Token（預留參數）
   *
   * @example
   * // 登出時呼叫
   * await pushNotificationService.unregisterToken(authToken);
   */
  async unregisterToken(authToken: string): Promise<void> {
    if (!this.expoPushToken) return;

    try {
      // 呼叫後端取消註冊，讓後端移除該裝置的推播 Token
      const { commonApi } = require('./commonApi');
      if (typeof commonApi?.unregisterPushToken === 'function') {
        await commonApi.unregisterPushToken(authToken, {
          token: this.expoPushToken,
        });
      }
      this.expoPushToken = null;
    } catch (error) {
      console.error('Failed to unregister push token:', error);
      // 即使後端呼叫失敗，仍清除本地 Token
      this.expoPushToken = null;
    }
  }

  /**
   * 取得目前的 Push Token
   *
   * @returns Push Token 或 null
   *
   * @example
   * const token = pushNotificationService.getToken();
   */
  getToken(): string | null {
    return this.expoPushToken;
  }

  // ========== 通知監聽 ==========

  /**
   * 監聽收到通知
   *
   * 當 App 在前景收到通知時觸發
   * 適合用於更新 UI 或顯示自訂通知
   *
   * @param callback - 收到通知時的回呼
   * @returns 移除監聽器的函數，若不可用則回傳 null
   *
   * @example
   * const subscription = pushNotificationService.addNotificationReceivedListener(
   *   (notification) => {
   *     console.log('收到通知:', notification.request.content.title);
   *   }
   * );
   *
   * // 清理時移除監聽
   * subscription?.remove();
   */
  addNotificationReceivedListener(
    callback: (notification: any) => void
  ): { remove: () => void } | null {
    if (!this.isAvailable() || !Notifications) return null;
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * 監聽用戶點擊通知
   *
   * 當用戶點擊通知時觸發
   * 適合用於導航到特定頁面
   *
   * @param callback - 點擊通知時的回呼
   * @returns 移除監聯器的函數，若不可用則回傳 null
   *
   * @example
   * pushNotificationService.addNotificationResponseReceivedListener(
   *   (response) => {
   *     const data = response.notification.request.content.data;
   *     // 根據 data 導航到對應頁面
   *     if (data.type === 'sos') {
   *       navigation.navigate('SOSDetail', { id: data.sosId });
   *     }
   *   }
   * );
   */
  addNotificationResponseReceivedListener(
    callback: (response: any) => void
  ): { remove: () => void } | null {
    if (!this.isAvailable() || !Notifications) return null;
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // ========== Badge 管理 ==========

  /**
   * 設定 Badge 數量
   *
   * 設定 App 圖示上的未讀數字（iOS 主要）
   *
   * @param count - Badge 數量
   *
   * @example
   * // 設定未讀通知數量
   * await pushNotificationService.setBadgeCount(5);
   *
   * // 清除 Badge
   * await pushNotificationService.setBadgeCount(0);
   */
  async setBadgeCount(count: number): Promise<void> {
    if (!this.isAvailable() || !Notifications) return;
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  /**
   * 取得 Badge 數量
   *
   * 取得目前 App 圖示上的未讀數字
   *
   * @returns Badge 數量
   *
   * @example
   * const count = await pushNotificationService.getBadgeCount();
   */
  async getBadgeCount(): Promise<number> {
    if (!this.isAvailable() || !Notifications) return 0;
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }
}

// ========== 匯出單例 ==========

/** 推播通知服務單例，供全域使用 */
export const pushNotificationService = new PushNotificationService();
