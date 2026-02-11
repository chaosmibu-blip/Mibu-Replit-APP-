/**
 * API 服務統一匯出模組
 *
 * 這是 API 服務的主要入口點，提供兩種使用方式：
 *
 * 1. 向後兼容方式（舊）：
 *    import { apiService } from '@/services/api';
 *    await apiService.getUserWithToken(token);
 *
 * 2. 模組化方式（新，推薦）：
 *    import { authApi } from '@/services/authApi';
 *    await authApi.mobileAuth({ provider: 'google', identityToken });
 *
 * @module services/api
 * @see 後端契約: contracts/APP.md v1.4.0
 *
 * ============ 架構說明 ============
 * - 各功能模組獨立維護（authApi, gachaApi, merchantApi...）
 * - 本模組負責聚合和 re-export
 * - ApiService 類別將所有方法代理到對應模組
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
import { itineraryApi } from './itineraryApi';
import { rulesApi } from './rulesApi';
import { mailboxApi } from './mailboxApi';

// ============ Re-export 模組化 API ============

// 基礎認證模組
export { authApi } from './authApi';

// 地點相關
export { locationApi } from './locationApi';

// 扭蛋系統
export { gachaApi } from './gachaApi';

// 背包/庫存
export { inventoryApi } from './inventoryApi';

// 圖鑑/收藏
export { collectionApi } from './collectionApi';

// 商家後台
export { merchantApi } from './merchantApi';

// 策劃師
export { specialistApi } from './specialistApi';

// 管理員後台
export { adminApi } from './adminApi';

// 通用功能（公告、通知、SOS）
export { commonApi } from './commonApi';

// 基礎設施
export { ApiBase, API_BASE } from './base';

// ============ Phase 5-6 新增 API ============

// 經濟系統（等級、經驗、成就）
export { economyApi } from './economyApi';

// 募資系統
export { crowdfundingApi } from './crowdfundingApi';

// 推薦系統
export { referralApi } from './referralApi';

// 用戶貢獻（回報、建議、投票）
export { contributionApi } from './contributionApi';

// ============ Phase 7 新增 API ============

// 活動系統 (sync-app #006)
export { eventApi } from './eventApi';

// 行程規劃 (sync-app #026, #027)
export { itineraryApi } from './itineraryApi';

// 素材資源（Cloudinary 託管：頭像、成就圖片等）
export { assetApi } from './assetApi';

// 規則引擎（#043 統一成就/任務/獎勵）
export { rulesApi } from './rulesApi';

// 信箱系統（#045 統一收件箱 + 優惠碼）
export { mailboxApi } from './mailboxApi';

// ============ 統一 API Service（向後兼容） ============

/**
 * 統一 API Service 類別
 *
 * 聚合所有模組的方法，讓舊的 apiService.xxx() 調用仍然有效
 * 內部將方法代理到對應的模組化 API
 *
 * @deprecated 建議新代碼直接使用模組化 API，如 authApi.mobileAuth()
 *
 * @example
 * // 舊寫法（向後兼容）
 * import { apiService } from '@/services/api';
 * await apiService.mobileAuth({ provider: 'google', identityToken: '...' });
 *
 * // 新寫法（推薦）
 * import { authApi } from '@/services/authApi';
 * await authApi.mobileAuth({ provider: 'google', identityToken: '...' });
 */
class ApiService {
  /** API 基礎網址 */
  private baseUrl = API_BASE_URL;

  // ============ Auth 認證相關 ============
  // #044: register/login 已移除，只保留 OAuth

  /** 取得當前用戶 */
  getCurrentUser = authApi.getCurrentUser.bind(authApi);
  /** 使用 Token 取得用戶資料 */
  getUserWithToken = authApi.getUserWithToken.bind(authApi);
  /** 切換用戶角色 */
  switchRole = authApi.switchRole.bind(authApi);
  /** 用戶登出 */
  logout = authApi.logout.bind(authApi);
  /** 取得用戶檔案 */
  getProfile = authApi.getProfile.bind(authApi);
  /** 更新用戶檔案 */
  updateProfile = authApi.updateProfile.bind(authApi);
  /** 刪除帳號 */
  deleteAccount = authApi.deleteAccount.bind(authApi);

  // ============ Location 地點相關 ============

  /** 取得國家列表 */
  getCountries = locationApi.getCountries.bind(locationApi);
  /** 取得地區列表 */
  getRegions = locationApi.getRegions.bind(locationApi);
  /** 取得區域列表 */
  getDistricts = locationApi.getDistricts.bind(locationApi);
  /** 更新用戶位置 */
  updateLocation = locationApi.updateLocation.bind(locationApi);
  /** 取得用戶位置 */
  getMyLocation = locationApi.getMyLocation.bind(locationApi);

  // ============ Gacha 扭蛋相關 ============

  /** AI 生成行程 */
  generateItinerary = gachaApi.generateItinerary.bind(gachaApi);
  /** 取得扭蛋獎池 */
  getGachaPool = gachaApi.getGachaPool.bind(gachaApi);
  /** 抽取扭蛋 */
  pullGacha = gachaApi.pullGacha.bind(gachaApi);
  /** 取得獎池優惠券 */
  getPrizePool = gachaApi.getPrizePool.bind(gachaApi);
  /** 排除景點 */
  excludePlace = gachaApi.excludePlace.bind(gachaApi);
  /** 取得景點優惠 */
  getPlacePromo = gachaApi.getPlacePromo.bind(gachaApi);

  // ============ Inventory 背包相關 ============

  /** 取得背包列表 */
  getInventory = inventoryApi.getInventory.bind(inventoryApi);
  /** 取得背包項目詳情 */
  getInventoryItem = inventoryApi.getInventoryItem.bind(inventoryApi);
  /** 取得背包配置 */
  getInventoryConfig = inventoryApi.getInventoryConfig.bind(inventoryApi);
  /** 取得稀有度配置 */
  getRarityConfig = inventoryApi.getRarityConfig.bind(inventoryApi);
  /** 刪除背包項目 */
  deleteInventoryItem = inventoryApi.deleteInventoryItem.bind(inventoryApi);
  /** 核銷優惠券 */
  redeemInventoryItem = inventoryApi.redeemInventoryItem.bind(inventoryApi);
  /** 取得背包數量統計 */
  getInventoryCount = inventoryApi.getInventoryCount.bind(inventoryApi);
  /** 標記背包項目已讀 */
  markInventoryItemRead = inventoryApi.markInventoryItemRead.bind(inventoryApi);
  /** 取得背包容量統計 */
  getInventoryCapacity = inventoryApi.getInventoryCapacity.bind(inventoryApi);

  // ============ Collection 圖鑑相關 ============

  /** 取得圖鑑列表 */
  getCollections = collectionApi.getCollections.bind(collectionApi);
  /** 新增收藏 */
  saveToCollection = collectionApi.saveToCollection.bind(collectionApi);
  /** 刪除收藏 */
  deleteCollection = collectionApi.deleteCollection.bind(collectionApi);
  /** 取得未讀數量 */
  getCollectionUnreadCount = collectionApi.getUnreadCount.bind(collectionApi);
  /** 標記全部已讀 */
  markCollectionRead = collectionApi.markCollectionRead.bind(collectionApi);
  /** 標記單一項目已讀 */
  markCollectionItemRead = collectionApi.markCollectionItemRead.bind(collectionApi);
  /** 取得景點優惠 */
  getPlacePromoFromCollection = collectionApi.getPlacePromo.bind(collectionApi);
  /** 取得圖鑑統計 */
  getCollectionStats = collectionApi.getCollectionStats.bind(collectionApi);
  /** 取得優惠更新通知 */
  getPromoUpdates = collectionApi.getPromoUpdates.bind(collectionApi);
  /** 標記優惠已讀 */
  markPromoRead = collectionApi.markPromoRead.bind(collectionApi);

  // ============ Merchant 商家相關 ============

  /** 取得商家資訊 */
  getMerchantMe = merchantApi.getMerchantMe.bind(merchantApi);
  /** 註冊商家 */
  registerMerchant = merchantApi.registerMerchant.bind(merchantApi);
  /** 申請商家 */
  applyMerchant = merchantApi.applyMerchant.bind(merchantApi);
  /** 驗證商家碼 */
  verifyMerchantCode = merchantApi.verifyMerchantCode.bind(merchantApi);
  /** 取得商家分析數據 */
  getMerchantAnalytics = merchantApi.getMerchantAnalytics.bind(merchantApi);
  /** 取得商家每日碼 */
  getMerchantDailyCode = merchantApi.getMerchantDailyCode.bind(merchantApi);
  /** 取得商家點數 */
  getMerchantCredits = merchantApi.getMerchantCredits.bind(merchantApi);
  /** 購買點數 */
  purchaseCredits = merchantApi.purchaseCredits.bind(merchantApi);
  /** 取得商家交易記錄 */
  getMerchantTransactions = merchantApi.getMerchantTransactions.bind(merchantApi);
  /** 取得商家核銷碼 */
  getMerchantRedemptionCode = merchantApi.getMerchantRedemptionCode.bind(merchantApi);
  /** 取得商家優惠券列表 */
  getMerchantCoupons = merchantApi.getMerchantCoupons.bind(merchantApi);
  /** 建立商家優惠券 */
  createMerchantCoupon = merchantApi.createMerchantCoupon.bind(merchantApi);
  /** 更新商家優惠券 */
  updateMerchantCoupon = merchantApi.updateMerchantCoupon.bind(merchantApi);
  /** 刪除商家優惠券 */
  deleteMerchantCoupon = merchantApi.deleteMerchantCoupon.bind(merchantApi);
  /** 搜尋可認領地點 */
  searchMerchantPlaces = merchantApi.searchMerchantPlaces.bind(merchantApi);
  /** 認領地點 */
  claimMerchantPlace = merchantApi.claimMerchantPlace.bind(merchantApi);
  /** 取得商家地點列表 */
  getMerchantPlaces = merchantApi.getMerchantPlaces.bind(merchantApi);
  /** 更新商家地點 */
  updateMerchantPlace = merchantApi.updateMerchantPlace.bind(merchantApi);
  /** 取得商家產品列表 */
  getMerchantProducts = merchantApi.getMerchantProducts.bind(merchantApi);
  /** 建立商家產品 */
  createMerchantProduct = merchantApi.createMerchantProduct.bind(merchantApi);
  /** 更新商家產品 */
  updateMerchantProduct = merchantApi.updateMerchantProduct.bind(merchantApi);
  /** 刪除商家產品 */
  deleteMerchantProduct = merchantApi.deleteMerchantProduct.bind(merchantApi);

  // ============ Specialist 策劃師相關 ============

  /** 取得策劃師資訊 */
  getSpecialistMe = specialistApi.getSpecialistMe.bind(specialistApi);
  /** 註冊策劃師 */
  registerSpecialist = specialistApi.registerSpecialist.bind(specialistApi);
  /** 切換上線狀態 */
  toggleSpecialistOnline = specialistApi.toggleSpecialistOnline.bind(specialistApi);
  /** 取得服務關係 */
  getSpecialistServices = specialistApi.getSpecialistServices.bind(specialistApi);
  /** 更新策劃師資料 */
  updateSpecialistProfile = specialistApi.updateSpecialistProfile.bind(specialistApi);
  /** 更新策劃師可接單狀態 */
  updateSpecialistAvailability = specialistApi.updateSpecialistAvailability.bind(specialistApi);
  /** 取得策劃師服務的旅客列表 */
  getSpecialistTravelers = specialistApi.getSpecialistTravelers.bind(specialistApi);

  // ============ Admin 管理員相關 ============

  /** 取得用戶列表 */
  getAdminUsers = adminApi.getAdminUsers.bind(adminApi);
  /** 取得待審核用戶 */
  getAdminPendingUsers = adminApi.getAdminPendingUsers.bind(adminApi);
  /** 審核用戶 */
  approveUser = adminApi.approveUser.bind(adminApi);
  /** 取得全域排除清單 */
  getGlobalExclusions = adminApi.getGlobalExclusions.bind(adminApi);
  /** 新增全域排除 */
  addGlobalExclusion = adminApi.addGlobalExclusion.bind(adminApi);
  /** 移除全域排除 */
  removeGlobalExclusion = adminApi.removeGlobalExclusion.bind(adminApi);
  /** 取得地點草稿 */
  getPlaceDrafts = adminApi.getPlaceDrafts.bind(adminApi);
  /** 建立地點草稿 */
  createPlaceDraft = adminApi.createPlaceDraft.bind(adminApi);
  /** 刪除地點草稿 */
  deletePlaceDraft = adminApi.deletePlaceDraft.bind(adminApi);
  /** 發佈地點草稿 */
  publishPlaceDraft = adminApi.publishPlaceDraft.bind(adminApi);
  /** 取得管理員公告列表 */
  getAdminAnnouncements = adminApi.getAdminAnnouncements.bind(adminApi);
  /** 建立公告 */
  createAnnouncement = adminApi.createAnnouncement.bind(adminApi);
  /** 更新公告 */
  updateAnnouncement = adminApi.updateAnnouncement.bind(adminApi);
  /** 刪除公告 */
  deleteAnnouncement = adminApi.deleteAnnouncement.bind(adminApi);

  // ============ Common 通用功能 ============

  /** 取得公告列表 */
  getAnnouncements = commonApi.getAnnouncements.bind(commonApi);
  /** 依類型取得公告 */
  getAnnouncementsByType = commonApi.getAnnouncementsByType.bind(commonApi);
  /** 取得紅點狀態（boolean） */
  getNotificationStatus = commonApi.getNotificationStatus.bind(commonApi);
  /** 取得通知歷史列表（分頁） */
  getNotificationList = commonApi.getNotificationList.bind(commonApi);
  /** 標記紅點已讀（依類型） */
  markNotificationSeen = commonApi.markNotificationSeen.bind(commonApi);
  /** 標記單一通知已讀 */
  markNotificationRead = commonApi.markNotificationRead.bind(commonApi);
  /** 全部標記已讀 */
  markAllNotificationsRead = commonApi.markAllNotificationsRead.bind(commonApi);
  /** 取得通知偏好設定 */
  getNotificationPreferences = commonApi.getNotificationPreferences.bind(commonApi);
  /** 更新通知偏好設定 */
  updateNotificationPreferences = commonApi.updateNotificationPreferences.bind(commonApi);
  /** 取得廣告設定 */
  getAdPlacement = commonApi.getAdPlacement.bind(commonApi);
  /** 取得聊天 Token */
  getChatToken = commonApi.getChatToken.bind(commonApi);
  /** 取得地區優惠券池 */
  getRegionCouponPool = commonApi.getRegionCouponPool.bind(commonApi);
  /** 取得 SOS 資格 */
  getSosEligibility = commonApi.getSosEligibility.bind(commonApi);
  /** 發送 SOS 警報 */
  sendSosAlert = commonApi.sendSosAlert.bind(commonApi);
  /** 取得 SOS 警報列表 */
  getSosAlerts = commonApi.getSosAlerts.bind(commonApi);
  /** 取消 SOS 警報 */
  cancelSosAlert = commonApi.cancelSosAlert.bind(commonApi);
  /** 取得 SOS 連結 */
  getSosLink = commonApi.getSosLink.bind(commonApi);
  /** 註冊推播 Token */
  registerPushToken = commonApi.registerPushToken.bind(commonApi);
  /** 取消註冊推播 Token */
  unregisterPushToken = commonApi.unregisterPushToken.bind(commonApi);

  // ============ Economy 經濟系統 (Phase 5) ============

  // #043: getAchievements / claimAchievement 已遷移到 rulesApi
  /** 申請成為策劃師 */
  applySpecialist = economyApi.applySpecialist.bind(economyApi);

  // ============ Crowdfunding 募資系統 (Phase 5) ============

  /** 取得募資活動列表 */
  getCampaigns = crowdfundingApi.getCampaigns.bind(crowdfundingApi);
  /** 取得募資活動詳情 */
  getCampaignDetail = crowdfundingApi.getCampaignDetail.bind(crowdfundingApi);
  /** 參與募資 */
  contribute = crowdfundingApi.contribute.bind(crowdfundingApi);
  /** 取得個人募資記錄 */
  getMyContributions = crowdfundingApi.getMyContributions.bind(crowdfundingApi);

  // ============ Referral 推薦系統 (Phase 5) ============

  /** 取得我的推薦碼 */
  getMyReferralCode = referralApi.getMyCode.bind(referralApi);
  /** 生成推薦碼 */
  generateReferralCode = referralApi.generateCode.bind(referralApi);
  /** 驗證推薦碼 */
  validateReferralCode = referralApi.validateCode.bind(referralApi);
  /** 使用推薦碼 */
  applyReferralCode = referralApi.applyCode.bind(referralApi);
  /** 取得推薦人列表 */
  getMyReferrals = referralApi.getMyReferrals.bind(referralApi);
  /** 推薦商家 */
  recommendMerchant = referralApi.recommendMerchant.bind(referralApi);
  /** 取得推薦餘額 */
  getReferralBalance = referralApi.getBalance.bind(referralApi);
  /** 取得推薦交易記錄 */
  getReferralTransactions = referralApi.getTransactions.bind(referralApi);
  /** 申請提現 */
  withdrawReferral = referralApi.withdraw.bind(referralApi);

  // ============ Contribution 用戶貢獻 (Phase 6) ============

  /** 回報歇業 */
  reportClosed = contributionApi.reportClosed.bind(contributionApi);
  /** 取得我的回報記錄 */
  getMyReports = contributionApi.getMyReports.bind(contributionApi);
  /** 建議新景點 */
  suggestPlace = contributionApi.suggestPlace.bind(contributionApi);
  /** 取得我的建議記錄 */
  getMySuggestions = contributionApi.getMySuggestions.bind(contributionApi);
  /** 取得黑名單 */
  getBlacklist = contributionApi.getBlacklist.bind(contributionApi);
  /** 加入黑名單 */
  addToBlacklist = contributionApi.addToBlacklist.bind(contributionApi);
  /** 移除黑名單 */
  removeFromBlacklist = contributionApi.removeFromBlacklist.bind(contributionApi);
  /** 取得待投票景點 */
  getPendingVotes = contributionApi.getPendingVotes.bind(contributionApi);
  /** 投票景點 */
  votePlace = contributionApi.votePlace.bind(contributionApi);
  /** 取得待投票建議 */
  getPendingSuggestions = contributionApi.getPendingSuggestions.bind(contributionApi);
  /** 投票建議 */
  voteSuggestion = contributionApi.voteSuggestion.bind(contributionApi);

  // #044: 帳號綁定 API 已移除（bindIdentity / getIdentities / unlinkIdentity）

  // ============ Event 活動系統 (Phase 7 - sync-app #006) ============

  /** 取得活動列表 */
  getEvents = eventApi.getEvents.bind(eventApi);
  /** 取得活動詳情 */
  getEventById = eventApi.getEventById.bind(eventApi);
  /** 取得首頁活動 */
  getHomeEvents = eventApi.getHomeEvents.bind(eventApi);

  // ============ Itinerary 行程規劃 (sync-app #026, #027) ============

  /** 取得行程列表 */
  getItineraries = itineraryApi.getItineraries.bind(itineraryApi);
  /** 取得行程詳情 */
  getItinerary = itineraryApi.getItinerary.bind(itineraryApi);
  /** 建立行程 */
  createItinerary = itineraryApi.createItinerary.bind(itineraryApi);
  /** 更新行程 */
  updateItinerary = itineraryApi.updateItinerary.bind(itineraryApi);
  /** 刪除行程 */
  deleteItinerary = itineraryApi.deleteItinerary.bind(itineraryApi);
  /** 取得可加入的景點 */
  getAvailablePlaces = itineraryApi.getAvailablePlaces.bind(itineraryApi);
  /** 加入景點到行程 */
  addPlacesToItinerary = itineraryApi.addPlaces.bind(itineraryApi);
  /** 從行程移除景點 */
  removePlaceFromItinerary = itineraryApi.removePlace.bind(itineraryApi);
  /** 重新排序行程景點 */
  reorderItineraryPlaces = itineraryApi.reorderPlaces.bind(itineraryApi);
  /** AI 對話式排程 */
  itineraryAiChat = itineraryApi.aiChat.bind(itineraryApi);
  /** 加入 AI 建議的景點 */
  itineraryAiAddPlaces = itineraryApi.aiAddPlaces.bind(itineraryApi);

  // ============ Rules 規則引擎 (#043) ============

  /** 取得規則列表（成就+任務+獎勵） */
  getRules = rulesApi.getRules.bind(rulesApi);
  /** 取得任務鏈詳情 */
  getRuleChain = rulesApi.getChain.bind(rulesApi);
  /** 取得規則詳情 */
  getRuleDetail = rulesApi.getRuleDetail.bind(rulesApi);
  /** 領取規則獎勵 */
  claimRuleReward = rulesApi.claimReward.bind(rulesApi);

  // ============ Mailbox 信箱系統 (#045) ============

  /** 取得信箱列表 */
  getMailboxList = mailboxApi.getList.bind(mailboxApi);
  /** 取得未讀數量 */
  getMailboxUnreadCount = mailboxApi.getUnreadCount.bind(mailboxApi);
  /** 取得信箱項目詳情 */
  getMailboxDetail = mailboxApi.getDetail.bind(mailboxApi);
  /** 領取單一信箱項目 */
  claimMailboxItem = mailboxApi.claimItem.bind(mailboxApi);
  /** 一鍵全部領取 */
  claimAllMailbox = mailboxApi.claimAll.bind(mailboxApi);
  /** 兌換優惠碼 */
  redeemPromoCode = mailboxApi.redeemPromoCode.bind(mailboxApi);
  /** 驗證優惠碼 */
  validatePromoCode = mailboxApi.validatePromoCode.bind(mailboxApi);
}

// ============ 匯出 ============

/** 統一 API Service 實例（向後兼容） */
export const apiService = new ApiService();
