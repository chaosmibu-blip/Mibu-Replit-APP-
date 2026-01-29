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
export { GachaScreen } from '../modules/traveler/screens/GachaScreen';
export { GachaModuleScreen } from '../modules/traveler/screens/GachaModuleScreen';
export { ItemBoxScreen } from '../modules/traveler/screens/ItemBoxScreen';
export { ItemsScreen } from '../modules/traveler/screens/ItemsScreen';
export { CollectionScreen } from '../modules/traveler/screens/CollectionScreen';
export { ItineraryScreenV2 as ItineraryScreen } from '../modules/traveler/screens/ItineraryScreenV2';
export { PlannerScreen } from '../modules/traveler/screens/PlannerScreen';

// ========== Merchant ==========
export { MerchantDashboardScreen } from '../modules/merchant/screens/MerchantDashboardScreen';
export { MerchantAnalyticsScreen } from '../modules/merchant/screens/MerchantAnalyticsScreen';
export { MerchantCouponsScreen } from '../modules/merchant/screens/MerchantCouponsScreen';
export { MerchantPlacesScreen } from '../modules/merchant/screens/MerchantPlacesScreen';
export { MerchantProductsScreen } from '../modules/merchant/screens/MerchantProductsScreen';
export { MerchantProfileScreen } from '../modules/merchant/screens/MerchantProfileScreen';
export { MerchantTransactionsScreen } from '../modules/merchant/screens/MerchantTransactionsScreen';
export { MerchantVerifyScreen } from '../modules/merchant/screens/MerchantVerifyScreen';

// ========== Specialist ==========
export { SpecialistDashboardScreen } from '../modules/specialist/screens/SpecialistDashboardScreen';
export { SpecialistHistoryScreen } from '../modules/specialist/screens/SpecialistHistoryScreen';
export { SpecialistProfileScreen } from '../modules/specialist/screens/SpecialistProfileScreen';
export { SpecialistTrackingScreen } from '../modules/specialist/screens/SpecialistTrackingScreen';
export { SpecialistTravelersScreen } from '../modules/specialist/screens/SpecialistTravelersScreen';

// ========== Admin ==========
export { AdminDashboardScreen } from '../modules/admin/screens/AdminDashboardScreen';
export { AdminAnnouncementsScreen } from '../modules/admin/screens/AdminAnnouncementsScreen';
export { AdminExclusionsScreen } from '../modules/admin/screens/AdminExclusionsScreen';
export { AnnouncementManageScreen } from '../modules/admin/screens/AnnouncementManageScreen';

// ========== Shared ==========
export { AuthScreen } from '../modules/shared/screens/AuthScreen';
export { HomeScreen } from '../modules/shared/screens/HomeScreen';
export { ProfileScreen } from '../modules/shared/screens/ProfileScreen';
export { SettingsScreen } from '../modules/shared/screens/SettingsScreen';
export { ChatScreen } from '../modules/shared/screens/ChatScreen';
export { SOSScreen } from '../modules/shared/screens/SOSScreen';
export { LocationScreen } from '../modules/shared/screens/LocationScreen';
export { PendingApprovalScreen } from '../modules/shared/screens/PendingApprovalScreen';
