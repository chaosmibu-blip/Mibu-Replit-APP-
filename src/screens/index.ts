/**
 * Screens 向後兼容匯出
 *
 * 注意：screens 已移至 src/modules/{role}/screens/
 * 這個檔案保持向後兼容，讓舊的 import 路徑繼續運作
 *
 * 建議新代碼直接從模組匯入：
 * import { GachaScreen } from '@/modules/traveler';
 */

// ========== Traveler ==========
export { default as GachaScreen } from '../modules/traveler/screens/GachaScreen';
export { default as GachaModuleScreen } from '../modules/traveler/screens/GachaModuleScreen';
export { default as ItemBoxScreen } from '../modules/traveler/screens/ItemBoxScreen';
export { default as ItemsScreen } from '../modules/traveler/screens/ItemsScreen';
export { default as CollectionScreen } from '../modules/traveler/screens/CollectionScreen';
export { default as ItineraryScreen } from '../modules/traveler/screens/ItineraryScreen';
export { default as PlannerScreen } from '../modules/traveler/screens/PlannerScreen';

// ========== Merchant ==========
export { default as MerchantDashboardScreen } from '../modules/merchant/screens/MerchantDashboardScreen';
export { default as MerchantAnalyticsScreen } from '../modules/merchant/screens/MerchantAnalyticsScreen';
export { default as MerchantCouponsScreen } from '../modules/merchant/screens/MerchantCouponsScreen';
export { default as MerchantPlacesScreen } from '../modules/merchant/screens/MerchantPlacesScreen';
export { default as MerchantProductsScreen } from '../modules/merchant/screens/MerchantProductsScreen';
export { default as MerchantProfileScreen } from '../modules/merchant/screens/MerchantProfileScreen';
export { default as MerchantTransactionsScreen } from '../modules/merchant/screens/MerchantTransactionsScreen';
export { default as MerchantVerifyScreen } from '../modules/merchant/screens/MerchantVerifyScreen';

// ========== Specialist ==========
export { default as SpecialistDashboardScreen } from '../modules/specialist/screens/SpecialistDashboardScreen';
export { default as SpecialistHistoryScreen } from '../modules/specialist/screens/SpecialistHistoryScreen';
export { default as SpecialistProfileScreen } from '../modules/specialist/screens/SpecialistProfileScreen';
export { default as SpecialistTrackingScreen } from '../modules/specialist/screens/SpecialistTrackingScreen';
export { default as SpecialistTravelersScreen } from '../modules/specialist/screens/SpecialistTravelersScreen';

// ========== Admin ==========
export { default as AdminDashboardScreen } from '../modules/admin/screens/AdminDashboardScreen';
export { default as AdminAnnouncementsScreen } from '../modules/admin/screens/AdminAnnouncementsScreen';
export { default as AdminExclusionsScreen } from '../modules/admin/screens/AdminExclusionsScreen';
export { default as AnnouncementManageScreen } from '../modules/admin/screens/AnnouncementManageScreen';

// ========== Shared ==========
export { default as AuthScreen } from '../modules/shared/screens/AuthScreen';
export { default as HomeScreen } from '../modules/shared/screens/HomeScreen';
export { default as ProfileScreen } from '../modules/shared/screens/ProfileScreen';
export { default as SettingsScreen } from '../modules/shared/screens/SettingsScreen';
export { default as ChatScreen } from '../modules/shared/screens/ChatScreen';
export { default as SOSScreen } from '../modules/shared/screens/SOSScreen';
export { default as LocationScreen } from '../modules/shared/screens/LocationScreen';
export { default as PendingApprovalScreen } from '../modules/shared/screens/PendingApprovalScreen';
