/**
 * Push Notification Service
 * 處理 Expo Push Notifications 的註冊、權限請求和 token 管理
 *
 * 注意：此服務需要原生模組，在 Expo Go 或 Web 上可能無法使用
 * 會優雅降級，不影響其他功能
 */
import { Platform } from 'react-native';
import { apiService } from './api';

// 動態載入的模組引用
let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;
let isNotificationsAvailable = false;

// 嘗試載入原生模組
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Notifications = require('expo-notifications');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Device = require('expo-device');
  isNotificationsAvailable = true;

  // 設定通知行為
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (error) {
  console.log('Push notifications not available in this environment');
  isNotificationsAvailable = false;
}

class PushNotificationService {
  private expoPushToken: string | null = null;

  /**
   * 檢查推播通知是否可用
   */
  isAvailable(): boolean {
    return isNotificationsAvailable && Notifications !== null && Device !== null;
  }

  /**
   * 註冊推播通知並取得 Expo Push Token
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!this.isAvailable() || !Notifications || !Device) {
      console.log('Push notifications not available');
      return null;
    }

    // 只在實體設備上運行
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    try {
      // 檢查現有權限
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 如果尚未授權，請求權限
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission denied');
        return null;
      }

      // 取得 Expo Push Token
      // 注意：在 Expo Go 中不需要 projectId，只有 EAS Build 才需要
      const tokenData = await Notifications.getExpoPushTokenAsync();

      this.expoPushToken = tokenData.data;
      console.log('Expo Push Token:', this.expoPushToken);

      // Android 需要設定通知頻道
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8B6914',
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
   */
  async registerTokenWithBackend(authToken: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    if (!this.expoPushToken) {
      const token = await this.registerForPushNotifications();
      if (!token) return false;
    }

    try {
      // 檢查 API 方法是否存在（避免未導出時報錯）
      if (typeof apiService.registerPushToken !== 'function') {
        console.log('registerPushToken API not available yet');
        return false;
      }

      await apiService.registerPushToken(authToken, {
        pushToken: this.expoPushToken!,
        platform: Platform.OS as 'ios' | 'android',
      });
      console.log('Push token registered with backend');
      return true;
    } catch (error) {
      // 靜默處理錯誤，不影響用戶體驗
      console.log('Push token registration skipped:', error);
      return false;
    }
  }

  /**
   * 登出時取消註冊
   */
  async unregisterToken(_authToken: string): Promise<void> {
    if (!this.expoPushToken) return;

    try {
      // 呼叫後端取消註冊 API（如果有的話）
      // 目前後端可能沒有 unregister 端點，這裡預留
      console.log('Push token unregistered');
      this.expoPushToken = null;
    } catch (error) {
      console.error('Failed to unregister push token:', error);
    }
  }

  /**
   * 取得目前的 Push Token
   */
  getToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * 監聽收到通知
   */
  addNotificationReceivedListener(
    callback: (notification: any) => void
  ): { remove: () => void } | null {
    if (!this.isAvailable() || !Notifications) return null;
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * 監聯用戶點擊通知
   */
  addNotificationResponseReceivedListener(
    callback: (response: any) => void
  ): { remove: () => void } | null {
    if (!this.isAvailable() || !Notifications) return null;
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * 設定 badge 數量
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
   * 取得 badge 數量
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

export const pushNotificationService = new PushNotificationService();
