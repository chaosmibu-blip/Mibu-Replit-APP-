/**
 * RevenueCat 購買服務
 *
 * 處理應用內購買（IAP）相關功能：
 * - SDK 初始化與設定
 * - 用戶登入/登出
 * - 商品列表取得
 * - 購買流程處理
 * - 購買恢復
 * - 權益檢查
 *
 * @module RevenueCatService
 * @see #020 RevenueCat Webhook（IAP 募資）
 *
 * RevenueCat 是跨平台 IAP 解決方案，提供：
 * - 統一的 iOS/Android 購買 API
 * - 收據驗證
 * - 訂閱管理
 * - 購買分析
 *
 * 使用流程：
 * 1. App 啟動時 configure()
 * 2. 用戶登入時 login()
 * 3. 顯示商品時 getOfferings()
 * 4. 購買時 purchase()
 * 5. 用戶登出時 logout()
 */
import { Platform } from 'react-native';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesError,
} from 'react-native-purchases';

// ========== API Keys ==========

/**
 * RevenueCat API Keys
 *
 * 注意：正式環境應從環境變數或後端配置取得
 * 目前為佔位符，需替換為實際的 API Key
 */
const REVENUECAT_API_KEYS = {
  ios: 'appl_YOUR_IOS_API_KEY',       // 替換為實際的 iOS API Key
  android: 'goog_YOUR_ANDROID_API_KEY', // 替換為實際的 Android API Key
};

// ========== 服務類別 ==========

/**
 * RevenueCat 購買服務類別
 *
 * 提供完整的 IAP 功能封裝
 * 簡化購買流程並處理各種邊界情況
 */
class RevenueCatService {
  /** SDK 是否已初始化 */
  private isConfigured = false;

  // ========== 初始化 ==========

  /**
   * 初始化 RevenueCat SDK
   *
   * 應在 App 啟動時呼叫（通常在 App.tsx）
   * 若已初始化則跳過，避免重複設定
   *
   * @param userId - 用戶 ID（可選，用於購買追蹤）
   *
   * @example
   * // App 啟動時
   * await revenueCatService.configure();
   *
   * // 或帶入用戶 ID
   * await revenueCatService.configure(user.id);
   */
  async configure(userId?: string): Promise<void> {
    // 避免重複初始化
    if (this.isConfigured) return;

    try {
      // 根據平台選擇對應的 API Key
      const apiKey = Platform.OS === 'ios'
        ? REVENUECAT_API_KEYS.ios
        : REVENUECAT_API_KEYS.android;

      // 初始化 SDK
      Purchases.configure({ apiKey });

      // 若有用戶 ID，進行登入
      if (userId) {
        await Purchases.logIn(userId);
      }

      this.isConfigured = true;
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
    }
  }

  // ========== 用戶管理 ==========

  /**
   * 登入用戶（用於購買追蹤）
   *
   * 將 RevenueCat 的匿名用戶與 App 用戶關聯
   * 這樣購買記錄會跟著用戶，跨裝置同步
   *
   * @param userId - App 用戶 ID
   * @returns 用戶購買資訊，失敗時回傳 null
   *
   * @example
   * // 用戶登入後
   * const customerInfo = await revenueCatService.login(user.id);
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
   *
   * 解除用戶關聯，恢復為匿名用戶
   * 應在 App 登出時呼叫
   *
   * @example
   * // 用戶登出時
   * await revenueCatService.logout();
   */
  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('RevenueCat logout failed:', error);
    }
  }

  // ========== 商品管理 ==========

  /**
   * 取得可購買的商品列表
   *
   * 從 RevenueCat 取得目前的 Offerings
   * Offerings 是商品的組合，可在 RevenueCat 後台設定
   *
   * @returns 可購買的商品包列表
   *
   * @example
   * const packages = await revenueCatService.getOfferings();
   * packages.forEach(pkg => {
   *   console.log(pkg.product.title, pkg.product.priceString);
   * });
   */
  async getOfferings(): Promise<PurchasesPackage[]> {
    try {
      const offerings = await Purchases.getOfferings();

      // 回傳目前 Offering 的可用商品
      if (offerings.current?.availablePackages) {
        return offerings.current.availablePackages;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch offerings:', error);
      return [];
    }
  }

  // ========== 購買流程 ==========

  /**
   * 購買商品
   *
   * 執行購買流程：
   * 1. 顯示系統購買對話框
   * 2. 用戶確認購買
   * 3. App Store / Google Play 處理付款
   * 4. RevenueCat 驗證收據
   * 5. 回傳購買結果
   *
   * @param packageToPurchase - 要購買的商品包
   * @returns 購買結果
   *
   * @example
   * const result = await revenueCatService.purchase(selectedPackage);
   * if (result.success) {
   *   // 購買成功，發放獎勵
   *   await grantReward(result.customerInfo);
   * } else if (result.error === 'USER_CANCELLED') {
   *   // 用戶取消，不做處理
   * } else {
   *   // 其他錯誤
   *   showError(result.error);
   * }
   */
  async purchase(packageToPurchase: PurchasesPackage): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      // 執行購買
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return { success: true, customerInfo };
    } catch (error) {
      const purchaseError = error as PurchasesError;

      // 用戶取消購買不視為錯誤
      // 這是正常流程，不需要顯示錯誤訊息
      if (purchaseError.userCancelled) {
        return { success: false, error: 'USER_CANCELLED' };
      }

      // 其他購買錯誤
      console.error('Purchase failed:', purchaseError);
      return {
        success: false,
        error: purchaseError.message || 'PURCHASE_FAILED',
      };
    }
  }

  /**
   * 恢復購買
   *
   * 恢復用戶在其他裝置或重新安裝後的購買記錄
   * 適用於：
   * - 換裝置
   * - 重新安裝 App
   * - 訂閱型商品的恢復
   *
   * @returns 用戶購買資訊，失敗時回傳 null
   *
   * @example
   * const customerInfo = await revenueCatService.restorePurchases();
   * if (customerInfo) {
   *   // 檢查恢復的權益
   *   const hasPremium = customerInfo.entitlements.active['premium'];
   * }
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

  // ========== 用戶資訊 ==========

  /**
   * 取得用戶購買資訊
   *
   * 取得用戶的完整購買記錄與權益狀態
   *
   * @returns 用戶購買資訊，失敗時回傳 null
   *
   * @example
   * const info = await revenueCatService.getCustomerInfo();
   * if (info) {
   *   console.log('活躍訂閱:', Object.keys(info.entitlements.active));
   * }
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
   *
   * 快速檢查用戶是否擁有某個權益（entitlement）
   * 權益是在 RevenueCat 後台設定的，代表用戶可享有的功能
   *
   * @param entitlementId - 權益 ID（在 RevenueCat 後台設定）
   * @returns 是否擁有該權益
   *
   * @example
   * // 檢查是否為 Premium 用戶
   * const isPremium = await revenueCatService.hasEntitlement('premium');
   * if (isPremium) {
   *   // 顯示 Premium 專屬功能
   * }
   */
  async hasEntitlement(entitlementId: string): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      // 檢查該權益是否在活躍權益中
      return customerInfo.entitlements.active[entitlementId] !== undefined;
    } catch (error) {
      console.error('Failed to check entitlement:', error);
      return false;
    }
  }
}

// ========== 匯出單例 ==========

/** RevenueCat 購買服務單例，供全域使用 */
export const revenueCatService = new RevenueCatService();
