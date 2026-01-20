/**
 * Push Notification Service
 * 處理 Expo Push Notifications 的註冊、權限請求和 token 管理
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiService } from './api';

// 設定通知行為
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class PushNotificationService {
  private expoPushToken: string | null = null;

  /**
   * 註冊推播通知並取得 Expo Push Token
   */
  async registerForPushNotifications(): Promise<string | null> {
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
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'mibu-travel', // 與 app.json 的 slug 一致
      });

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
    if (!this.expoPushToken) {
      const token = await this.registerForPushNotifications();
      if (!token) return false;
    }

    try {
      await apiService.registerPushToken(authToken, {
        token: this.expoPushToken!,
        platform: Platform.OS,
        deviceName: Device.deviceName || undefined,
      });
      console.log('Push token registered with backend');
      return true;
    } catch (error) {
      console.error('Failed to register push token with backend:', error);
      return false;
    }
  }

  /**
   * 登出時取消註冊
   */
  async unregisterToken(authToken: string): Promise<void> {
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
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * 監聯用戶點擊通知
   */
  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * 設定 badge 數量
   */
  async setBadgeCount(count: number): Promise<void> {
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
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
