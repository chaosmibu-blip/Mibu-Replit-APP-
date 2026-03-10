/**
 * ============================================================
 * Merchant 模組 - 商家端
 * ============================================================
 * #074: 重寫，移除 Products / Transactions / Verify 畫面
 *
 * 更新日期：2026-03-10
 */

// Screens - 主要畫面
export { MerchantDashboardScreen } from './screens/MerchantDashboardScreen';
export { MerchantAnalyticsScreen } from './screens/MerchantAnalyticsScreen';
export { MerchantCouponsScreen } from './screens/MerchantCouponsScreen';
export { MerchantPlacesScreen } from './screens/MerchantPlacesScreen';
export { MerchantProfileScreen } from './screens/MerchantProfileScreen';

// Place Management Screens - 地點管理
export { ClaimPlaceScreen } from './screens/ClaimPlaceScreen';
export { NewPlaceScreen } from './screens/NewPlaceScreen';
export { PlaceEditScreen } from './screens/PlaceEditScreen';

// Coupon Management Screens - 優惠券管理
export { CouponFormScreen } from './screens/CouponFormScreen';

// Components - 元件
export * from './components';

// 相關 API
export { merchantApi } from '../../services/merchantApi';
