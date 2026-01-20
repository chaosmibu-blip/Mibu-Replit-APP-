/**
 * API Service - 統一匯出點
 *
 * 保持向後兼容：舊的 import { apiService } from '@/services/api' 仍然有效
 * 新用法可以直接 import 特定模組：import { gachaApi } from '@/services/gachaApi'
 */
import { API_BASE_URL } from '../constants/translations';
import { authApi } from './authApi';
import { locationApi } from './locationApi';
import { gachaApi } from './gachaApi';
import { inventoryApi } from './inventoryApi';
import { collectionApi } from './collectionApi';
import { merchantApi } from './merchantApi';
import { specialistApi } from './specialistApi';
import { adminApi } from './adminApi';
import { commonApi } from './commonApi';
import { economyApi } from './economyApi';
import { crowdfundingApi } from './crowdfundingApi';
import { referralApi } from './referralApi';
import { contributionApi } from './contributionApi';
import { eventApi } from './eventApi';

// Re-export 所有模組化的 API
export { authApi } from './authApi';
export { locationApi } from './locationApi';
export { gachaApi } from './gachaApi';
export { inventoryApi } from './inventoryApi';
export { collectionApi } from './collectionApi';
export { merchantApi } from './merchantApi';
export { specialistApi } from './specialistApi';
export { adminApi } from './adminApi';
export { commonApi } from './commonApi';
export { ApiBase, API_BASE } from './base';

// Phase 5-6 新增 API
export { economyApi } from './economyApi';
export { crowdfundingApi } from './crowdfundingApi';
export { referralApi } from './referralApi';
export { contributionApi } from './contributionApi';

// Phase 7 - 活動系統 (sync-app #006)
export { eventApi } from './eventApi';

/**
 * 統一 API Service（向後兼容）
 *
 * 這個 class 聚合了所有模組的方法，讓舊的 apiService.xxx() 調用仍然有效。
 * 建議新代碼直接使用模組化的 API，例如 gachaApi.generateItinerary()
 */
class ApiService {
  private baseUrl = API_BASE_URL;

  // ========== Auth ==========
  register = authApi.register.bind(authApi);
  login = authApi.login.bind(authApi);
  getCurrentUser = authApi.getCurrentUser.bind(authApi);
  getUserWithToken = authApi.getUserWithToken.bind(authApi);
  switchRole = authApi.switchRole.bind(authApi);
  logout = authApi.logout.bind(authApi);
  getProfile = authApi.getProfile.bind(authApi);
  updateProfile = authApi.updateProfile.bind(authApi);
  deleteAccount = authApi.deleteAccount.bind(authApi);

  // ========== Location ==========
  getCountries = locationApi.getCountries.bind(locationApi);
  getRegions = locationApi.getRegions.bind(locationApi);
  getDistricts = locationApi.getDistricts.bind(locationApi);
  updateLocation = locationApi.updateLocation.bind(locationApi);
  getMyLocation = locationApi.getMyLocation.bind(locationApi);

  // ========== Gacha ==========
  generateItinerary = gachaApi.generateItinerary.bind(gachaApi);
  getGachaPool = gachaApi.getGachaPool.bind(gachaApi);
  pullGacha = gachaApi.pullGacha.bind(gachaApi);
  getPrizePool = gachaApi.getPrizePool.bind(gachaApi);
  excludePlace = gachaApi.excludePlace.bind(gachaApi);
  getPlacePromo = gachaApi.getPlacePromo.bind(gachaApi);

  // ========== Inventory ==========
  getInventory = inventoryApi.getInventory.bind(inventoryApi);
  getInventoryItem = inventoryApi.getInventoryItem.bind(inventoryApi);
  getInventoryConfig = inventoryApi.getInventoryConfig.bind(inventoryApi);
  getRarityConfig = inventoryApi.getRarityConfig.bind(inventoryApi);
  deleteInventoryItem = inventoryApi.deleteInventoryItem.bind(inventoryApi);
  redeemInventoryItem = inventoryApi.redeemInventoryItem.bind(inventoryApi);
  getInventoryCount = inventoryApi.getInventoryCount.bind(inventoryApi);

  // ========== Collection ==========
  getCollections = collectionApi.getCollections.bind(collectionApi);
  saveToCollection = collectionApi.saveToCollection.bind(collectionApi);
  deleteCollection = collectionApi.deleteCollection.bind(collectionApi);
  getCollectionUnreadCount = collectionApi.getUnreadCount.bind(collectionApi);
  markCollectionRead = collectionApi.markCollectionRead.bind(collectionApi);
  markCollectionItemRead = collectionApi.markCollectionItemRead.bind(collectionApi);
  getPlacePromoFromCollection = collectionApi.getPlacePromo.bind(collectionApi);
  getCollectionStats = collectionApi.getCollectionStats.bind(collectionApi);

  // ========== Merchant ==========
  getMerchantMe = merchantApi.getMerchantMe.bind(merchantApi);
  registerMerchant = merchantApi.registerMerchant.bind(merchantApi);
  applyMerchant = merchantApi.applyMerchant.bind(merchantApi);
  verifyMerchantCode = merchantApi.verifyMerchantCode.bind(merchantApi);
  getMerchantAnalytics = merchantApi.getMerchantAnalytics.bind(merchantApi);
  getMerchantDailyCode = merchantApi.getMerchantDailyCode.bind(merchantApi);
  getMerchantCredits = merchantApi.getMerchantCredits.bind(merchantApi);
  purchaseCredits = merchantApi.purchaseCredits.bind(merchantApi);
  getMerchantTransactions = merchantApi.getMerchantTransactions.bind(merchantApi);
  getMerchantRedemptionCode = merchantApi.getMerchantRedemptionCode.bind(merchantApi);
  getMerchantCoupons = merchantApi.getMerchantCoupons.bind(merchantApi);
  createMerchantCoupon = merchantApi.createMerchantCoupon.bind(merchantApi);
  updateMerchantCoupon = merchantApi.updateMerchantCoupon.bind(merchantApi);
  deleteMerchantCoupon = merchantApi.deleteMerchantCoupon.bind(merchantApi);
  searchMerchantPlaces = merchantApi.searchMerchantPlaces.bind(merchantApi);
  claimMerchantPlace = merchantApi.claimMerchantPlace.bind(merchantApi);
  getMerchantPlaces = merchantApi.getMerchantPlaces.bind(merchantApi);
  updateMerchantPlace = merchantApi.updateMerchantPlace.bind(merchantApi);
  getMerchantProducts = merchantApi.getMerchantProducts.bind(merchantApi);
  createMerchantProduct = merchantApi.createMerchantProduct.bind(merchantApi);
  updateMerchantProduct = merchantApi.updateMerchantProduct.bind(merchantApi);
  deleteMerchantProduct = merchantApi.deleteMerchantProduct.bind(merchantApi);

  // ========== Specialist ==========
  getSpecialistMe = specialistApi.getSpecialistMe.bind(specialistApi);
  registerSpecialist = specialistApi.registerSpecialist.bind(specialistApi);
  toggleSpecialistOnline = specialistApi.toggleSpecialistOnline.bind(specialistApi);
  getSpecialistServices = specialistApi.getSpecialistServices.bind(specialistApi);
  updateSpecialistProfile = specialistApi.updateSpecialistProfile.bind(specialistApi);

  // ========== Admin ==========
  getAdminUsers = adminApi.getAdminUsers.bind(adminApi);
  getAdminPendingUsers = adminApi.getAdminPendingUsers.bind(adminApi);
  approveUser = adminApi.approveUser.bind(adminApi);
  getGlobalExclusions = adminApi.getGlobalExclusions.bind(adminApi);
  addGlobalExclusion = adminApi.addGlobalExclusion.bind(adminApi);
  removeGlobalExclusion = adminApi.removeGlobalExclusion.bind(adminApi);
  getPlaceDrafts = adminApi.getPlaceDrafts.bind(adminApi);
  createPlaceDraft = adminApi.createPlaceDraft.bind(adminApi);
  deletePlaceDraft = adminApi.deletePlaceDraft.bind(adminApi);
  publishPlaceDraft = adminApi.publishPlaceDraft.bind(adminApi);
  getAdminAnnouncements = adminApi.getAdminAnnouncements.bind(adminApi);
  createAnnouncement = adminApi.createAnnouncement.bind(adminApi);
  updateAnnouncement = adminApi.updateAnnouncement.bind(adminApi);
  deleteAnnouncement = adminApi.deleteAnnouncement.bind(adminApi);

  // ========== Common ==========
  getAnnouncements = commonApi.getAnnouncements.bind(commonApi);
  getAnnouncementsByType = commonApi.getAnnouncementsByType.bind(commonApi);
  getNotifications = commonApi.getNotifications.bind(commonApi);
  markNotificationSeen = commonApi.markNotificationSeen.bind(commonApi);
  getUnreadCounts = commonApi.getUnreadCounts.bind(commonApi);
  getAdPlacement = commonApi.getAdPlacement.bind(commonApi);
  getChatToken = commonApi.getChatToken.bind(commonApi);
  getRegionCouponPool = commonApi.getRegionCouponPool.bind(commonApi);
  getSosEligibility = commonApi.getSosEligibility.bind(commonApi);
  sendSosAlert = commonApi.sendSosAlert.bind(commonApi);
  getSosAlerts = commonApi.getSosAlerts.bind(commonApi);
  cancelSosAlert = commonApi.cancelSosAlert.bind(commonApi);
  getSosLink = commonApi.getSosLink.bind(commonApi);

  // ========== Economy (Phase 5) ==========
  getLevelInfo = economyApi.getLevelInfo.bind(economyApi);
  getExperienceHistory = economyApi.getExperienceHistory.bind(economyApi);
  getAchievements = economyApi.getAchievements.bind(economyApi);
  claimAchievement = economyApi.claimAchievement.bind(economyApi);
  applySpecialist = economyApi.applySpecialist.bind(economyApi);

  // ========== Crowdfunding (Phase 5) ==========
  getCampaigns = crowdfundingApi.getCampaigns.bind(crowdfundingApi);
  getCampaignDetail = crowdfundingApi.getCampaignDetail.bind(crowdfundingApi);
  contribute = crowdfundingApi.contribute.bind(crowdfundingApi);
  getMyContributions = crowdfundingApi.getMyContributions.bind(crowdfundingApi);

  // ========== Referral (Phase 5) ==========
  getMyReferralCode = referralApi.getMyCode.bind(referralApi);
  generateReferralCode = referralApi.generateCode.bind(referralApi);
  validateReferralCode = referralApi.validateCode.bind(referralApi);
  applyReferralCode = referralApi.applyCode.bind(referralApi);
  getMyReferrals = referralApi.getMyReferrals.bind(referralApi);
  recommendMerchant = referralApi.recommendMerchant.bind(referralApi);
  getReferralBalance = referralApi.getBalance.bind(referralApi);
  getReferralTransactions = referralApi.getTransactions.bind(referralApi);
  withdrawReferral = referralApi.withdraw.bind(referralApi);

  // ========== Contribution (Phase 6) ==========
  reportClosed = contributionApi.reportClosed.bind(contributionApi);
  getMyReports = contributionApi.getMyReports.bind(contributionApi);
  suggestPlace = contributionApi.suggestPlace.bind(contributionApi);
  getMySuggestions = contributionApi.getMySuggestions.bind(contributionApi);
  getBlacklist = contributionApi.getBlacklist.bind(contributionApi);
  addToBlacklist = contributionApi.addToBlacklist.bind(contributionApi);
  removeFromBlacklist = contributionApi.removeFromBlacklist.bind(contributionApi);
  getPendingVotes = contributionApi.getPendingVotes.bind(contributionApi);
  votePlace = contributionApi.votePlace.bind(contributionApi);
  getPendingSuggestions = contributionApi.getPendingSuggestions.bind(contributionApi);
  voteSuggestion = contributionApi.voteSuggestion.bind(contributionApi);

  // ========== Auth - Identity Binding (Phase 6) ==========
  bindIdentity = authApi.bindIdentity.bind(authApi);
  getIdentities = authApi.getIdentities.bind(authApi);
  unlinkIdentity = authApi.unlinkIdentity.bind(authApi);

  // ========== Event (Phase 7 - sync-app #006) ==========
  getEvents = eventApi.getEvents.bind(eventApi);
  getEventById = eventApi.getEventById.bind(eventApi);
  getHomeEvents = eventApi.getHomeEvents.bind(eventApi);
}

export const apiService = new ApiService();
