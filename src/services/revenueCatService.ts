/**
 * RevenueCat 購買服務
 * 處理 IAP（應用內購買）募資功能
 *
 * @see #020 RevenueCat Webhook（IAP 募資）
 */
import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesError,
} from 'react-native-purchases';

// RevenueCat API Keys（應從環境變數或後端配置取得）
const REVENUECAT_API_KEYS = {
  ios: 'appl_YOUR_IOS_API_KEY', // 替換為實際的 iOS API Key
  android: 'goog_YOUR_ANDROID_API_KEY', // 替換為實際的 Android API Key
};

class RevenueCatService {
  private isConfigured = false;

  /**
   * 初始化 RevenueCat SDK
   * 應在 App 啟動時呼叫
   */
  async configure(userId?: string): Promise<void> {
    if (this.isConfigured) return;

    try {
      const apiKey = Platform.OS === 'ios'
        ? REVENUECAT_API_KEYS.ios
        : REVENUECAT_API_KEYS.android;

      Purchases.configure({ apiKey });

      if (userId) {
        await Purchases.logIn(userId);
      }

      this.isConfigured = true;
      console.log('RevenueCat configured successfully');
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
    }
  }

  /**
   * 登入用戶（用於購買追蹤）
   */
  async login(userId: string): Promise<CustomerInfo | null> {
    try {
      const { customerInfo } = await Purchases.logIn(userId);
      return customerInfo;
    } catch (error) {
      console.error('RevenueCat login failed:', error);
      return null;
    }
  }

  /**
   * 登出用戶
   */
  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('RevenueCat logout failed:', error);
    }
  }

  /**
   * 取得可購買的商品列表
   */
  async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current?.availablePackages) {
        return offerings.current.availablePackages;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch offerings:', error);
      return [];
    }
  }

  /**
   * 購買商品
   */
  async purchase(packageToPurchase: PurchasesPackage): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return { success: true, customerInfo };
    } catch (error) {
      const purchaseError = error as PurchasesError;

      // 用戶取消購買不視為錯誤
      if (purchaseError.userCancelled) {
        return { success: false, error: 'USER_CANCELLED' };
      }

      console.error('Purchase failed:', purchaseError);
      return {
        success: false,
        error: purchaseError.message || 'PURCHASE_FAILED',
      };
    }
  }

  /**
   * 恢復購買
   */
  async restorePurchases(): Promise<CustomerInfo | null> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      return null;
    }
  }

  /**
   * 取得用戶購買資訊
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  }

  /**
   * 檢查用戶是否擁有特定權益
   */
  async hasEntitlement(entitlementId: string): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[entitlementId] !== undefined;
    } catch (error) {
      console.error('Failed to check entitlement:', error);
      return false;
    }
  }
}

export const revenueCatService = new RevenueCatService();
