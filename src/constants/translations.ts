/**
 * 多語系翻譯與應用程式配置
 *
 * 定義：
 * - 應用程式常數（等級上限、每日生成次數等）
 * - API 基礎 URL
 * - 分類顏色對應
 * - 四國語系翻譯（繁體中文、英文、日文、韓文）
 *
 * 使用方式：
 * import { TRANSLATIONS, getCategoryLabel } from '@/constants/translations';
 *
 * @example
 * const label = TRANSLATIONS['zh-TW'].appTitle; // '行程扭蛋'
 */

import { Language } from '../types';

// ========== 應用程式常數 ==========

/** 最高等級上限 */
export const MAX_LEVEL = 12;

/** 預設等級 */
export const DEFAULT_LEVEL = 5;

// #043: 移除 MAX_DAILY_GENERATIONS 常數
// 限額由後端 GET /api/gacha/quota 或 GET /api/user/perks 回傳的 dailyPullLimit 控制
// 限額單位是「卡片張數」（預設 36 張），不是生成次數

/** API 基礎 URL（從環境變數讀取，有預設值） */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://gacha-travel--s8869420.replit.app';

/**
 * 景點分類對應的顏色
 * 用於分類標籤、圖標等 UI 元素
 */
export const CATEGORY_COLORS: Record<string, string> = {
  /** 美食 - 橘色 */
  food: '#ea580c',
  /** 住宿 - 青色 */
  stay: '#0891b2',
  /** 教育 - 紫色 */
  education: '#7c3aed',
  /** 娛樂 - 粉紅色 */
  entertainment: '#db2777',
  /** 景點 - 綠色 */
  scenery: '#10b981',
  /** 購物 - 金色 */
  shopping: '#f59e0b',
  /** 體驗 - 金色 */
  experience: '#f59e0b',
  /** 活動 - 金色 */
  activity: '#f59e0b',
};

/**
 * 多語系翻譯字典
 * 支援語系：繁體中文(zh-TW)、英文(en)、日文(ja)、韓文(ko)
 */
export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  // ========== 繁體中文 ==========
  'zh-TW': {
    // 每日限制
    dailyLimitReached: '今日額度已達上限',
    dailyLimitReachedDesc: '今日抽取額度已用完，請明天再來！',

    // 應用程式標題
    appTitle: '行程扭蛋',
    appSubtitle: '今天去哪玩?老天說了算',

    // 目的地選擇
    destination: '目的地',
    selectDestination: '選擇目的地',
    city: '城市',
    selectCity: '選擇城市',

    // 扭蛋操作
    startGacha: '開始扭蛋',
    generating: '生成中...',
    findingGems: '正在尋找隱藏景點',
    tripLevel: 'Lv.{level} 之旅',
    spotsCount: '{count} 個景點',

    // 優惠券
    couponUnlocked: '獲得優惠券',
    specialPromo: '特惠活動',

    // 收藏
    noCollection: '尚未有收藏',
    startToCollect: '開始扭蛋來收集景點！',
    noCoupons: '尚未有優惠券',

    // 導航
    navHome: '首頁',
    navGacha: '扭蛋',
    navGachaModule: '行程扭蛋',
    navPlanner: '策劃師',
    navPlannerModule: '旅程策劃',
    navCollection: '圖鑑',
    navMyBox: '道具箱',
    navItems: '道具箱',
    navSettings: '設定',
    navLocation: '定位',
    navItinerary: '行程',
    navChat: '聊天',
    navService: '服務',

    // 通用操作
    back: '返回',
    loading: '載入中...',

    // 登入
    login: '登入',
    signInReplit: '使用 Replit 登入',
    guestLogin: '訪客登入',
    welcomeBack: '歡迎回來',
    backToHome: '返回首頁',

    // 景點分類
    catFood: '美食',
    catStay: '住宿',
    catScenery: '景點',
    catShopping: '購物',
    catEntertainment: '娛樂設施',
    catEducation: '生態文化教育',
    catExperience: '遊程體驗',

    // 行程節奏
    relaxed: '悠閒',
    packed: '充實',

    // 地區選擇
    selectCountry: '請選擇國家',
    selectRegion: '請選擇城市/地區',

    // 行程資訊
    itineraryPace: '行程節奏',
    stops: '站',
    viewOnMap: '在 Google 地圖中查看',
    rePull: '重新扭蛋',
    places: '個地點',
    myCollection: '我的圖鑑',
    spots: '個地點',

    // 公告與活動
    announcements: '公告',
    flashEvents: '快閃活動',
    explore: '探索',

    // 位置相關
    shareLocationToPlanner: '分享位置給策劃師',
    yourLocation: '你的位置',
    planner: '策劃師',

    // 安全中心
    safetyCenter: '安全中心',
    safetyCenterDesc: '設定緊急求救功能，確保旅途安全',
    safety: '安全',
    setupEmergencySOS: '設定緊急求救功能',

    // iOS 捷徑整合
    iosShortcutsIntegration: 'iOS 捷徑整合',
    iosShortcutsDesc: '將以下連結加入 iOS 捷徑 App，即可透過 Siri 或自動化快速觸發求救訊號',
    webhookUrl: 'Webhook URL (POST)',
    notAvailable: '尚未取得連結',
    copyLink: '複製連結',
    copied: '已複製',

    // 設定步驟
    setupSteps: '設定步驟：',
    step1: '1. 開啟 iOS 捷徑 App',
    step2: '2. 建立新捷徑，加入「取得 URL 內容」動作',
    step3: '3. 貼上上方 Webhook URL',
    step4: '4. 將方法設為「POST」',
    step5: '5. 設定 Siri 語音指令或自動化觸發',

    // 緊急求救
    emergencyNow: '立即求救',
    emergencyNowDesc: '按下按鈕立即發送求救訊號，通知您的緊急聯絡人',
    sosButton: 'SOS 求救',
    confirmSOS: '確認發送 SOS',
    confirmSOSDesc: '確定要發送緊急求救訊號嗎？',
    cancel: '取消',
    confirmSend: '確定發送',
    sent: '已發送',
    sosSuccess: 'SOS 求救訊號已成功發送',
    sendFailed: '發送失敗',
    tryAgainLater: '請稍後再試',

    // 錯誤訊息
    networkError: '網路連線錯誤，請檢查網路',
    gettingLocation: '正在取得位置...',
    locationPermissionRequired: '需要位置權限才能使用此功能',
    unableToGetLocation: '無法取得位置',
    retry: '重試',

    // 獎池
    viewPool: '查看獎池',
    poolPreview: '獎池預覽',
    pullCount: '抽取張數',
    selectDistrict: '選擇行政區',
    rareItems: '稀有道具',
    noRareItems: '此區域尚無稀有道具',
    closeModal: '關閉',
    pulls: '張',
    loadingPool: '載入獎池中...',

    // 商家
    merchant: '特約商家',

    // 生成行程
    generatingItinerary: '正在生成行程...',
    sponsorAd: '贊助商廣告 (模擬)',
    pleaseWait: '請稍候',
    almostReady: '即將完成',

    // 扭蛋結果
    gachaResults: '扭蛋結果',
    addToBackpack: '加入背包',
    addedToBackpack: '已加入背包',
    gotCoupon: '獲得優惠券！',
    partnerMerchant: '特約商家',
    rating: '評分',
    noResults: '尚無結果',
    tryGachaFirst: '先來一發扭蛋吧！',
    viewResults: '查看結果',
    exploring: '正在探索',
    reGacha: '重新扭蛋',

    // 道具箱
    emptyItemBox: '道具箱是空的',
    collectItemsFirst: '先去扭蛋收集一些景點吧！',
    totalItems: '共',
    itemsCount: '個道具',

    // ========== 共用文字（跨畫面） ==========
    common_error: '錯誤',
    common_confirm: '確定',
    common_delete: '刪除',
    common_save: '儲存',
    common_edit: '編輯',
    common_remove: '移除',
    common_done: '完成',
    common_submit: '提交',
    common_search: '搜尋',
    common_logout: '登出',
    common_success: '成功',
    common_loadFailed: '載入失敗',
    common_saveFailed: '儲存失敗',
    common_deleteFailed: '刪除失敗',
    common_createFailed: '建立失敗',
    common_updateFailed: '更新失敗',
    common_saveTryAgain: '儲存失敗，請稍後再試',
    common_notice: '提示',
    common_errorTryAgain: '發生錯誤，請稍後再試',
    common_noData: '暫無資料',
    common_fillRequired: '請填寫必要欄位',
    common_confirmDelete: '確認刪除',
    common_confirmLogout: '確認登出',
    common_confirmLogoutDesc: '確定要登出嗎？',
    common_deleteAccount: '刪除帳號',
    common_required: '必填',
    common_name: '姓名',
    common_email: 'Email',
    common_password: '密碼',
    common_phone: '電話',
    common_address: '地址',
    common_status: '狀態',
    common_place: '景點',
    common_coupon: '優惠券',
    common_pending: '待審核',
    common_approved: '已核准',
    common_rejected: '已拒絕',
    common_active: '啟用中',
    common_inactive: '已停用',
    common_verified: '已驗證',
    common_switchRole: '切換身份',
    common_roleTraveler: '旅客',
    common_roleMerchant: '商家端',
    common_roleSpecialist: '專員端',
    common_roleAdmin: '管理端',
    common_skip: '跳過',
    common_back: '上一步',
    common_next: '下一步',
    common_getStarted: '開始使用',

    // ========== Admin ==========
    admin_title: '管理後台',
    admin_pendingTab: '待審核',
    admin_usersTab: '用戶',
    admin_draftsTab: '草稿',
    admin_exclusionsTab: '排除',
    admin_announcementsTab: '公告',
    admin_approve: '核准',
    admin_reject: '拒絕',
    admin_publish: '發布',
    admin_noPending: '沒有待審核用戶',
    admin_merchant: '商家',
    admin_specialist: '專員',
    admin_traveler: '旅客',
    admin_admin: '管理員',
    admin_confirmApprove: '確定要核准這位用戶嗎？',
    admin_confirmReject: '確定要拒絕這位用戶嗎？',
    admin_confirmPublish: '確定要發布這個草稿嗎？',
    admin_confirmDelete: '確定要刪除嗎？',
    admin_penalty: '扣分',
    admin_goToAnnouncement: '前往公告管理',
    admin_announcementManage: '公告管理',
    admin_add: '新增',
    admin_type: '類型',
    admin_titleLabel: '標題',
    admin_contentLabel: '內容',
    admin_imageUrl: '圖片網址',
    admin_linkUrl: '連結網址',
    admin_priority: '優先順序',
    admin_noAnnouncements: '尚無公告',
    admin_confirmDeleteAnnouncement: '確定要刪除這則公告嗎？',
    admin_createAnnouncement: '新增公告',
    admin_editAnnouncement: '編輯公告',
    admin_fillTitleContent: '請填寫標題和內容',
    admin_enterTitle: '輸入標題',
    admin_enterContent: '輸入內容',
    admin_typeAnnouncement: '公告',
    admin_typeFlashEvent: '快閃活動',
    admin_typeHolidayEvent: '節慶活動',
    admin_startDateLabel: '開始日期',
    admin_endDateLabel: '結束日期',
    admin_isActiveLabel: '啟用',
    admin_datePlaceholder: 'YYYY-MM-DD',

    // ========== 專員模組 ==========
    specialist_dashboard: '專員後台',
    specialist_online: '上線中',
    specialist_offline: '離線',
    specialist_onlineStatus: '上線狀態',
    specialist_activeServices: '服務中旅客',
    specialist_noServices: '目前無服務中旅客',
    specialist_since: '開始於',
    specialist_region: '地區',
    specialist_activeTravelers: '服務中旅客',
    specialist_viewTravelers: '查看服務中的旅客',
    specialist_liveTracking: '即時位置追蹤',
    specialist_viewTravelersOnMap: '在地圖上查看旅客位置',
    specialist_serviceHistory: '服務歷史',
    specialist_viewPastRecords: '查看過往服務記錄',
    specialist_profile: '專員資料',
    specialist_viewEditProfile: '查看與編輯個人資料',
    specialist_filterAll: '全部',
    specialist_completed: '已完成',
    specialist_cancelled: '已取消',
    specialist_noHistory: '尚無服務記錄',
    specialist_traveler: '旅客',
    specialist_noActiveTravelers: '目前無服務中旅客',
    specialist_viewLocation: '查看位置',
    specialist_connecting: '連線中...',
    specialist_connected: '已連線',
    specialist_disconnected: '已斷線',
    specialist_noLocations: '尚無旅客位置資料',
    specialist_lastUpdate: '最後更新',
    specialist_travelers: '旅客',
    specialist_mapNotAvailableWeb: '地圖在網頁版不可用',
    specialist_mapRequiresNative: '地圖區域 - 需要 react-native-maps',
    specialist_travelerLocations: '旅客位置',
    specialist_accountStatus: '帳號狀態',
    specialist_available: '可接單',
    specialist_unavailable: '暫停接單',
    specialist_currentlyServing: '目前服務中',
    specialist_maxTravelers: '最大服務人數',
    specialist_serviceRegion: '服務地區',
    specialist_people: '人',

    // ========== SOS 緊急聯絡人 ==========
    sos_emergencyContacts: '緊急聯絡人',
    sos_limitReached: '已達上限',
    sos_limitReachedDesc: '最多只能新增 {max} 位緊急聯絡人',
    sos_incomplete: '請填寫完整',
    sos_enterNamePhone: '請輸入姓名和電話',
    sos_saveFailed: '無法儲存聯絡人',
    sos_deleteContact: '刪除聯絡人',
    sos_deleteContactConfirm: '確定要刪除「{name}」嗎？',
    sos_deleteContactFailed: '無法刪除聯絡人',
    sos_noContacts: '尚無緊急聯絡人',
    sos_tapToAdd: '點擊右上角 + 新增聯絡人',
    sos_addContact: '新增聯絡人',
    sos_editContact: '編輯聯絡人',
    sos_infoBanner: '最多可新增 {max} 位緊急聯絡人，發送 SOS 時將同時通知他們',
    sos_enterName: '輸入姓名',
    sos_enterPhone: '輸入電話號碼',
    sos_relationship: '關係',
    sos_relFamily: '家人',
    sos_relFriend: '朋友',
    sos_relColleague: '同事',
    sos_relOther: '其他',

    // ========== SOS 求救畫面 ==========
    sos_emergencySOS: '緊急求救',
    sos_holdToSend: '長按下方按鈕 3 秒發送求救訊號，我們會立即通知您的旅程策畫師',
    sos_hold3sec: '長按 3 秒',
    sos_alertHistory: '求救記錄',
    sos_alertSent: '求救訊號已發送',
    sos_willContactYou: '我們會盡快聯繫您',
    sos_sendFailed: '發送失敗',
    sos_tryAgainLater: '請稍後再試',
    sos_confirmCancel: '確認取消',
    sos_confirmCancelDesc: '確定要取消這個求救訊號嗎？',
    sos_no: '否',
    sos_yes: '是',
    sos_cancelFailed: '取消失敗',
    sos_cancelAlert: '取消求救',
    sos_featureLocked: 'SOS 功能已鎖定',
    sos_requirePurchase: '需購買旅程服務才能使用安全中心功能',
    sos_purchaseService: '購買服務',
    sos_statusPending: '等待處理',
    sos_statusAcknowledged: '已確認',
    sos_statusResolved: '已解決',
    sos_statusCancelled: '已取消',

    // ========== Auth 登入/註冊 ==========
    auth_signIn: '登入',
    auth_signUp: '註冊',
    auth_username: '帳號（Email）',
    auth_password: '密碼',
    auth_name: '姓名',
    auth_selectRole: '選擇身份',
    auth_noAccount: '還沒有帳號？',
    auth_hasAccount: '已有帳號？',
    auth_guestLogin: '以訪客身份繼續',
    auth_guestNote: '訪客模式下，資料僅保存在本機裝置',
    auth_pendingApproval: '商家和專員帳號需管理員審核後才能使用',
    auth_loginFailed: '登入失敗，請檢查帳號密碼',
    auth_registerFailed: '註冊失敗，請稍後再試',
    auth_enterUsernamePassword: '請填寫帳號和密碼',
    auth_fillAllFields: '請填寫所有欄位',
    auth_roleTraveler: '旅客',
    auth_roleMerchant: '商家',
    auth_roleSpecialist: '專員',

    // ========== Auth 等待審核 ==========
    auth_pendingTitle: '等待審核',
    auth_pendingSubtitle: '您的帳號正在等待管理員審核',
    auth_pendingDescription: '商家和專員帳號需經過審核才能使用完整功能。審核通過後會通知您。',
    auth_appliedRole: '申請身份',

    // ========== Merchant ==========
    merchant_productMgmt: '商品管理',
    merchant_myProducts: '我的商品',
    merchant_noProducts: '尚未建立任何商品',
    merchant_addProduct: '新增商品',
    merchant_productName: '商品名稱',
    merchant_productDesc: '商品描述',
    merchant_price: '原價',
    merchant_discountPrice: '優惠價',
    merchant_activeStatus: '上架中',
    merchant_inactiveStatus: '已下架',
    merchant_deleteProductConfirm: '確定要刪除此商品？',
    merchant_deleted: '已刪除',
    merchant_saved: '已儲存',
    merchant_couponAddTitle: '新增優惠券',
    merchant_couponEditTitle: '編輯優惠券',
    merchant_couponName: '優惠券名稱',
    merchant_couponNamePlaceholder: '例：滿千折百',
    merchant_rarityTier: '稀有度等級',
    merchant_tierHint: '等級越高，抽中機率越低',
    merchant_discountContent: '優惠內容',
    merchant_discountContentPlaceholder: '詳細描述優惠內容...',
    merchant_terms: '使用條款',
    merchant_termsPlaceholder: '使用限制與注意事項（選填）',
    merchant_quantity: '發放數量',
    merchant_quantityHint: '總共可發放的數量',
    merchant_validUntil: '有效期限',
    merchant_validUntilHint: '留空表示無期限',
    merchant_activateNow: '立即啟用',
    merchant_saveSuccess: '儲存成功',
    merchant_notice: '提示',
    merchant_addPlace: '新增店家',
    merchant_addPlaceSubtitle: '填寫您的店家資訊',
    merchant_placeName: '店家名稱',
    merchant_placeNamePlaceholder: '輸入店家名稱',
    merchant_category: '分類',
    merchant_selectCategory: '選擇分類',
    merchant_district: '區域',
    merchant_districtPlaceholder: '例：大安區',
    merchant_city: '城市',
    merchant_cityPlaceholder: '例：台北市',
    merchant_placeAddress: '地址',
    merchant_addressPlaceholder: '完整地址',
    merchant_placeDesc: '店家介紹',
    merchant_placeDescPlaceholder: '簡短介紹您的店家...',
    merchant_submitApplication: '提交申請',
    merchant_applicationSubmitted: '申請已提交！我們將盡快審核',
    merchant_submitError: '提交失敗，請稍後再試',
    merchant_catFood: '美食',
    merchant_catStay: '住宿',
    merchant_catScenery: '景點',
    merchant_catShopping: '購物',
    merchant_catEntertainment: '娛樂',
    merchant_catEducation: '文化教育',
    merchant_analytics: '數據分析',
    merchant_overview: '總覽',
    merchant_totalExposures: '總曝光次數',
    merchant_totalCollectors: '圖鑑收錄人數',
    merchant_couponIssued: '優惠券發放',
    merchant_couponRedeemed: '優惠券核銷',
    merchant_redemptionRate: '核銷率',
    merchant_topCoupons: '熱門優惠券',
    merchant_placeBreakdown: '各店數據',
    merchant_allPlaces: '全部店家',
    merchant_selectPlace: '選擇店家',
    merchant_noDataYet: '暫無數據',
    merchant_times: '次',
    merchant_people: '人',
    merchant_issued: '發放',
    merchant_redeemed: '核銷',
    merchant_collectionCount: '收錄數',
    merchant_7days: '7 天',
    merchant_30days: '30 天',
    merchant_90days: '90 天',
    merchant_allPeriod: '全部',
    merchant_couponMgmt: '優惠券管理',
    merchant_couponMgmtSubtitle: '創建和管理您的優惠券',
    merchant_addCoupon: '新增優惠券',
    merchant_noCoupons: '尚未創建優惠券',
    merchant_noCouponsHint: '開始創建您的第一張優惠券',
    merchant_remaining: '剩餘',
    merchant_couponActive: '啟用中',
    merchant_couponInactive: '已停用',
    merchant_couponExpired: '已過期',
    merchant_confirmDeleteCoupon: '確定要刪除此優惠券嗎？',
    merchant_deleteSuccess: '刪除成功',
    merchant_drawRate: '抽中機率',
    merchant_couponValidUntil: '有效期至',
    merchant_couponLoadFailed: '優惠券載入失敗',
    merchant_couponLoadFailedDetail: '請檢查網路連線後再試',
    merchant_verifyTitle: '驗證核銷碼',
    merchant_merchantIdLabel: '商家 ID',
    merchant_merchantIdPlaceholder: '輸入商家 ID',
    merchant_codeLabel: '核銷碼',
    merchant_codePlaceholder: '輸入核銷碼',
    merchant_verify: '驗證',
    merchant_verifying: '驗證中...',
    merchant_verifyValid: '驗證成功',
    merchant_verifyInvalid: '驗證失敗',
    merchant_errorEmpty: '請輸入商家 ID 和核銷碼',
    merchant_tryAgain: '再試一次',
    merchant_merchantIdMustBeNumber: '商家 ID 必須是數字',
    merchant_codeValid: '核銷碼有效',
    merchant_codeInvalid: '核銷碼無效',
    merchant_verifyFailed: '驗證失敗',
    merchant_claimTitle: '認領店家',
    merchant_claimSubtitle: '搜尋並認領您的店家',
    merchant_searchPlaceholder: '輸入店家名稱...',
    merchant_claim: '認領',
    merchant_claimed: '已認領',
    merchant_noSearchResults: '找不到符合的店家',
    merchant_noResultsHint: '試試其他關鍵字，或新增自有店家',
    merchant_addNewPlace: '新增自有店家',
    merchant_claimSuccess: '認領成功！',
    merchant_claimFailed: '認領失敗',
    merchant_searchHint: '輸入店家名稱開始搜尋',
    merchant_searchFailed: '搜尋失敗',
    merchant_myPlaces: '我的店家',
    merchant_myPlacesSubtitle: '管理您認領的店家',
    merchant_noPlaces: '尚未認領任何店家',
    merchant_noPlacesHint: '開始認領或新增您的店家',
    merchant_claimExisting: '認領現有店家',
    merchant_placesCount: '共 {n} 間店家',
    merchant_transactionHistory: '交易記錄',
    merchant_noTransactions: '暫無交易記錄',
    merchant_purchase: '購買點數',
    merchant_usage: '使用點數',
    merchant_refund: '退款',
    merchant_appFormTitle: '商家入駐申請',
    merchant_appFormSubtitle: '填寫以下資料，我們將在 1-3 個工作天內審核',
    merchant_ownerName: '負責人姓名 *',
    merchant_businessName: '商家名稱 *',
    merchant_taxId: '統一編號',
    merchant_businessCategoryLabel: '商家類型 *',
    merchant_merchantPhone: '市話',
    merchant_merchantMobile: '手機號碼 *',
    merchant_contactEmail: '聯絡信箱 *',
    merchant_submitAppForm: '提交申請',
    merchant_requiredFields: '請填寫所有必填欄位',
    merchant_submitSuccess: '申請已提交，請等待審核',
    merchant_submitFailed: '提交失敗，請稍後再試',
    merchant_enterOwnerName: '請輸入負責人姓名',
    merchant_enterBusinessName: '請輸入商家名稱',
    merchant_enterAddress: '請輸入商家地址',
    merchant_optional: '選填',
    merchant_catRestaurant: '餐飲',
    merchant_catRetail: '零售',
    merchant_catHotel: '住宿',
    merchant_catService: '服務',
    merchant_catOther: '其他',
    merchant_catAttraction: '景點/遊樂',
    merchant_catTransportation: '交通服務',
    merchant_catExperience: '體驗活動',
    merchant_catCulture: '文化藝術',

    // ========== 登入頁面（OAuth） ==========
    auth_notMerchant: '尚未註冊商家',
    auth_notMerchantDesc: '您尚未註冊為商家，請先申請商家帳號',
    auth_notSpecialist: '尚未註冊專員',
    auth_notSpecialistDesc: '您尚未註冊為專員，請先申請專員帳號',
    auth_wrongPortal: '入口錯誤',
    auth_wrongPortalDesc: '請切換至正確的入口登入',
    auth_permissionDenied: '權限不足',
    auth_permissionDeniedDesc: '您沒有權限存取此功能',
    auth_oauthLoginFailed: '登入失敗',
    auth_loginError: '登入錯誤',
    auth_tryAgainLater: '請稍後再試',
    auth_googleSignInFailed: '無法完成 Google 登入',
    auth_appleSignInFailed: '無法完成 Apple 登入',
    auth_cannotConnectServer: '無法連接到伺服器',
    auth_networkError: '網路錯誤',
    auth_switchPortal: '切換用戶別',
    auth_googleLogin: 'Google 登入',
    auth_switchLanguage: '切換語言',
    auth_switchTo: '切換至',
    auth_applicationSubmitted: '申請已送出！',
    auth_applicationReceivedMsg: '已收到您的申請，立馬為您處理',
    auth_applicationApprovalNote: '審核通過後，您將收到通知，届時即可使用帳號登入',
    auth_backToLogin: '返回登入頁面',
    auth_registrationFailed: '註冊失敗',
    auth_registrationError: '註冊失敗，請稍後再試',

    // ========== 商家註冊（表單） ==========
    merchant_registration: '商家註冊',
    merchant_registrationSubtitle: '填寫資料以申請成為合作商家',
    merchant_regOwnerName: '負責人姓名',
    merchant_regOwnerNamePlaceholder: '請輸入負責人姓名',
    merchant_regBusinessName: '商家名稱',
    merchant_regBusinessNamePlaceholder: '請輸入商家名稱',
    merchant_regTaxId: '統一編號（選填）',
    merchant_regTaxIdPlaceholder: '請輸入統一編號',
    merchant_regBusinessCategory: '營業類別',
    merchant_regBusinessCategoryPlaceholder: '請選擇營業類別',
    merchant_regAddress: '商家地址',
    merchant_regAddressPlaceholder: '請輸入商家地址',
    merchant_regPhone: '電話（選填）',
    merchant_regPhonePlaceholder: '請輸入電話',
    merchant_regMobile: '手機',
    merchant_regMobilePlaceholder: '請輸入手機號碼',
    merchant_regEmailPlaceholder: '請輸入 Email',
    merchant_regSubmitReview: '送審',
    merchant_regSubmitting: '提交中...',
    merchant_regSubmitSuccess: '送審成功',
    merchant_regSubmitSuccessMsg: '您的申請已提交，請等待審核通過。',
    merchant_regSubmitFailed: '提交失敗，請稍後再試',
    merchant_regFillRequired: '請填寫所有必填欄位',
    merchant_regInvalidEmail: '請輸入有效的 Email',
    merchant_regCatRestaurant: '餐飲業',
    merchant_regCatHotel: '住宿業',
    merchant_regCatAttraction: '景點/遊樂',
    merchant_regCatShopping: '購物零售',
    merchant_regCatTransportation: '交通服務',
    merchant_regCatExperience: '體驗活動',
    merchant_regCatCulture: '文化藝術',
    merchant_regCatOther: '其他',
    merchant_regEmail: 'Email（帳號）',
    merchant_regPassword: '密碼（至少6字）',
    merchant_regConfirmPassword: '確認密碼',
    merchant_regContactName: '聯絡人名稱',
    merchant_regIndustryCategory: '產業類別',
    merchant_regBusinessAddress: '營業地址',
    merchant_regOtherContact: '其他聯絡方式（選填）',
    merchant_regBackToLogin: '返回登入',
    merchant_regSelectCategory: '請選擇產業類別',
    merchant_regEnterEmail: '請輸入 Email',
    merchant_regInvalidEmailFormat: 'Email 格式不正確',
    merchant_regPasswordMinLength: '密碼至少需要6個字',
    merchant_regPasswordMismatch: '密碼不一致',
    merchant_regEnterBusinessName: '請輸入商家名稱',
    merchant_regEnterContactName: '請輸入聯絡人名稱',
    merchant_regSelectIndustry: '請選擇產業類別',
    merchant_regEnterAddress: '請輸入營業地址',
    merchant_regContactNamePlaceholder: '請輸入聯絡人姓名',
    merchant_regTaxIdShort: '統一編號',
    merchant_regLineOrPhone: 'LINE ID 或電話',
    merchant_regCatRestaurantShort: '餐飲',
    merchant_regCatHotelShort: '住宿',
    merchant_regCatAttractionShort: '景點',
    merchant_regCatShoppingShort: '購物',
    merchant_regCatActivityShort: '活動',
    merchant_regCatOtherShort: '其他',

    // ========== 專員註冊 ==========
    specialist_registration: '專員註冊',
    specialist_emailAccount: 'Email（帳號）',
    specialist_passwordMin: '密碼（至少6字）',
    specialist_confirmPassword: '確認密碼',
    specialist_nameLabel: '名稱',
    specialist_otherContact: '其他聯絡方式（選填）',
    specialist_serviceRegionOptional: '服務地區（選填）',
    specialist_submitApplication: '提交申請',
    specialist_backToLogin: '返回登入',
    specialist_enterEmail: '請輸入 Email',
    specialist_invalidEmailFormat: 'Email 格式不正確',
    specialist_passwordMinLength: '密碼至少需要6個字',
    specialist_passwordMismatch: '密碼不一致',
    specialist_enterName: '請輸入名稱',
    specialist_namePlaceholder: '請輸入您的名稱',
    specialist_regionPlaceholder: '例如：台北、宜蘭',
    specialist_lineOrPhone: 'LINE ID 或電話',

    // ========== 我的最愛/黑名單 ==========
    itinerary_favoritesAndBlacklist: '我的最愛/黑名單',
    itinerary_favorites: '我的最愛',
    itinerary_blacklist: '黑名單',
    itinerary_removeFavorite: '移除最愛',
    itinerary_removeFavoriteConfirm: '確定要從最愛移除嗎？',
    itinerary_removeBlacklist: '移除黑名單',
    itinerary_removeBlacklistConfirm: '確定要從黑名單移除嗎？',
    itinerary_noFavorites: '尚無最愛項目',
    itinerary_addFavoritesHint: '在圖鑑中點擊愛心加入最愛',
    itinerary_noBlacklist: '尚無黑名單項目',
    itinerary_addBlacklistHint: '在圖鑑中將不喜歡的項目加入黑名單',
    itinerary_favoritesGachaHint: '最愛的景點會優先出現在扭蛋結果中',
    itinerary_blacklistGachaHint: '黑名單項目不會出現在扭蛋結果中',

    // ========== 活動詳情 ==========
    common_eventNotFound: '找不到此活動',
    common_goBack: '返回',
    common_description: '活動說明',
    common_learnMore: '查看更多',
    event_announcement: '公告',
    event_festival: '節慶活動',
    event_limited: '限時活動',

    // ========== Economy 成就系統 ==========
    economy_achievementsTitle: '成就系統',
    economy_loadFailed: '載入失敗',
    economy_loadFailedDesc: '無法載入經濟資料，請稍後再試',
    economy_beginnerTasks: '新手任務',
    economy_done: '完成',
    economy_achievementProgress: '成就進度',
    economy_unlocked: '解鎖',
    economy_noAchievements: '暫無成就資料',
    economy_myPerks: '我的權益',
    economy_dailyPullLimit: '每日扭蛋上限',
    economy_pullsPerDay: '每天可以扭蛋的次數',
    economy_inventorySlots: '背包容量',
    economy_itemsCanHold: '可存放的道具數量',
    economy_specialistEligibility: '策劃師資格',
    economy_canApplyNow: '已獲得申請資格！',
    economy_unlockRequirement: '達成「資深旅人」成就並累計 1,500 金幣後解鎖',
    economy_aboutCoins: '金幣說明',
    economy_coinsInfo: '金幣可透過完成任務、解鎖成就獲得。累積金幣可解鎖更多權益！',
    economy_statAchievements: '成就',
    economy_tabDaily: '每日',
    economy_tabOnce: '一次性',
    economy_tabTotal: '累計',
    economy_tabPerks: '權益',
    economy_congratsCoupon: '恭喜獲得優惠券！',
    economy_shareTitle: 'Mibu 扭蛋中獎！',
    economy_shareCopied: '已複製',
    economy_share: '分享',
    economy_collect: '領取',
    economy_couponExpiry: '{month}/{day} 到期',
    economy_shareTextTemplate: '🎰 我在 Mibu 扭蛋抽到了【{tier}】優惠券！\n🎁 {couponName}\n📍 {placeName}\n\n快來一起玩 ➜ https://mibu.app',

    // ========== Crowdfunding 全球探索 ==========
    crowdfunding_title: '解鎖全球地圖',
    crowdfunding_loadFailed: '載入失敗',
    crowdfunding_loadFailedDesc: '無法載入募資活動，請稍後再試',
    crowdfunding_statUnlocked: '已解鎖國家',
    crowdfunding_statFundraising: '募資進行中',
    crowdfunding_statComing: '即將開放',
    crowdfunding_availableRegions: '已開放地區',
    crowdfunding_fundraising: '募資進行中',
    crowdfunding_comingSoon: '即將開放',
    crowdfunding_stayTuned: '敬請期待',
    crowdfunding_noProjects: '目前沒有進行中的募資活動',
    crowdfunding_stayTunedDesc: '敬請期待新的探索地區開放',
    crowdfunding_myContributions: '我的贊助紀錄',
    crowdfunding_totalContributions: '累計贊助',
    crowdfunding_supportVision: '支持我們的理念',
    crowdfunding_statusUnlocked: '已解鎖',
    crowdfunding_statusFundraising: '募資中',
    crowdfunding_statusComingSoon: '即將開放',
    crowdfunding_statusStayTuned: '敬請期待',

    // ========== Favorites 我的最愛 ==========
    favorites_title: '我的最愛',
    favorites_removeFavorite: '移除最愛',
    favorites_confirmRemove: '確定要將「{name}」從最愛中移除嗎？',
    favorites_remove: '移除',
    favorites_error: '錯誤',
    favorites_removeFailed: '無法移除最愛',
    favorites_addedAt: '加入於 ',
    favorites_totalCount: '共 {count} 個收藏',
    favorites_noFavorites: '還沒有最愛',
    favorites_tapToAdd: '在圖鑑中點擊愛心即可加入最愛',

    // ========== Collection 圖鑑 ==========
    collection_myCollection: '我的圖鑑',
    collection_newPlaces: '{count} 個新景點',
    collection_collected: '已收集',
    collection_cities: '城市',
    collection_categories: '類別',
    collection_searchPlaceholder: '搜尋景點名稱...',
    collection_clearSearch: '清除搜尋',
    collection_resultsFound: '找到 {count} 個結果',
    collection_noMatching: '找不到符合的景點',
    collection_all: '全部',
    collection_loadFailed: '圖鑑載入失敗',
    collection_loadFailedDetail: '請檢查網路連線後再試',
    collection_pleaseLogin: '請先登入',
    collection_loginForFavorite: '登入後才能使用收藏功能',
    collection_addedToFavorites: '已加入最愛',
    collection_addedToFavoritesDesc: '{name} 已加入我的最愛',
    collection_operationFailed: '操作失敗',
    collection_tryAgainLater: '請稍後再試',
    collection_loginForBlacklist: '登入後才能使用黑名單功能',
    collection_addToBlacklist: '加入黑名單',
    collection_confirmBlacklist: '確定要將「{name}」加入黑名單嗎？\n加入後扭蛋將不會再抽到此景點。',
    collection_addedToBlacklist: '已加入黑名單',
    collection_addedToBlacklistDesc: '{name} 已加入黑名單',
    collection_addToFavorites: '加入最愛',
    collection_closeDetails: '關閉詳情',
    collection_viewOnMap: '在地圖中查看',

    // ========== Gacha 扭蛋（補充） ==========
    gacha_startGachaExcl: '開始扭蛋！',
    gacha_tierSP: '超稀有',
    gacha_tierSSR: '極稀有',
    gacha_tierSR: '稀有',
    gacha_tierS: '優質',
    gacha_tierR: '一般',
    gacha_rateLimited: '操作太頻繁，請稍等一下再試',
    gacha_loginRequired: '請先登入',
    gacha_loginRequiredDesc: '使用扭蛋功能需要登入帳號',
    gacha_goToLogin: '前往登入',
    gacha_noPlacesInArea: '該區域暫無景點，請嘗試其他地區',
    gacha_generationFailed: '生成行程失敗，請稍後再試',
    gacha_loadRegionsFailed: '無法載入區域資料',
    gacha_loadRegionsRetry: '請檢查網路連線後再試',
    gacha_selectExploreRegion: '選擇探索區域',
    gacha_countryLabel: '國家',
    gacha_cityRegionLabel: '城市/地區',
    gacha_pullCountLabel: '扭蛋次數',
    gacha_dailyLimitInfo: '每日扭蛋限額最高36次',
    gacha_pullUnit: '次',
    gacha_itemBoxFull: '道具箱已滿',
    gacha_itemBoxFullDesc: '請先清理道具箱再抽卡',
    gacha_goTo: '前往',
    gacha_slotsRemaining: '道具箱剩餘 {count} 格',
    gacha_probabilityInfo: '機率說明',
    gacha_rareCoupons: 'SP/SSR 稀有優惠券',
    gacha_noRareCoupons: '此區域尚無稀有優惠券',

    // ========== Crowdfunding ==========
    crowdfunding_loadFailedDetail: '無法載入活動詳情',
    crowdfunding_notFound: '找不到活動',
    crowdfunding_goBack: '返回',
    crowdfunding_raised: '已募集',
    crowdfunding_backers: '位贊助者',
    crowdfunding_daysLeft: '天剩餘',
    crowdfunding_goal: '目標：',
    crowdfunding_youBacked: '您已贊助 ',
    crowdfunding_about: '活動介紹',
    crowdfunding_rewardTiers: '贊助方案',
    crowdfunding_updates: '最新動態',
    crowdfunding_soldOut: '已額滿',
    crowdfunding_remaining: '剩餘 {count} 名',
    crowdfunding_selectTier: '請選擇方案',
    crowdfunding_selectTierDesc: '請先選擇要贊助的方案',
    crowdfunding_testMode: '測試模式',
    crowdfunding_testModeDesc: '您選擇了「{tier}」方案（{amount}）\n\n正式上線後將啟用真實購買功能。',
    crowdfunding_simulateSuccess: '模擬購買成功',
    crowdfunding_thankYou: '贊助成功！',
    crowdfunding_thankYouDesc: '感謝您的支持！',
    crowdfunding_thankYouDescFull: '感謝您的支持！您的贊助已成功處理。',
    crowdfunding_purchaseFailed: '購買失敗',
    crowdfunding_purchaseFailedDesc: '無法完成購買，請稍後再試。',
    crowdfunding_purchaseError: '購買過程發生錯誤，請稍後再試。',
    crowdfunding_processing: '處理中...',
    crowdfunding_backAmount: '贊助 {amount}',
    crowdfunding_selectATier: '選擇贊助方案',

    // ========== Referral ==========
    referral_inviteFriends: '邀請好友',
    referral_myCode: '我的專屬推薦碼',
    referral_copy: '複製',
    referral_share: '分享給好友',
    referral_generateTitle: '生成你的專屬推薦碼',
    referral_generateSubtitle: '分享給好友，一起賺取豐富獎勵',
    referral_generateNow: '立即生成',
    referral_generateError: '無法生成推薦碼',
    referral_copied: '已複製!',
    referral_copiedDesc: '推薦碼已複製到剪貼簿',
    referral_shareMessage: '用我的推薦碼 {code} 加入 Mibu 旅行扭蛋，一起探索旅遊新體驗！\n\n下載 APP: https://mibu.app',
    referral_invited: '邀請人數',
    referral_successful: '成功推薦',
    referral_xpEarned: '獲得獎勵',
    referral_howItWorks: '獎勵機制說明',
    referral_step1Title: '分享推薦碼',
    referral_step1Desc: '複製你的專屬推薦碼分享給好友',
    referral_step2Title: '好友註冊',
    referral_step2Desc: '好友使用你的推薦碼完成註冊',
    referral_step3Title: '雙方獲得獎勵',
    referral_step3Desc: '你和好友都能獲得 50 XP 獎勵',
    referral_weeklyLeaderboard: '本週邀請排行榜',
    referral_you: '你',
    referral_noRanking: '暫無排行資料',
    referral_beFirst: '成為第一個邀請好友的人！',
    referral_yourRank: '你目前排名第 {rank} 名',
    referral_inviteRewards: '邀請獎勵',
    referral_inviteCount: '邀請 {count} 位好友',
    referral_achieved: '已達成',
    referral_remaining: '還差 {count} 位',
    referral_enterCode: '輸入好友推薦碼',
    referral_enterCodeHint: '有好友推薦碼？輸入獲取獎勵',
    referral_enterCodePlaceholder: '輸入推薦碼',
    referral_invalidCode: '無效的推薦碼',
    referral_invalidCodeDesc: '此推薦碼無效',
    referral_applySuccess: '套用成功!',
    referral_applySuccessDesc: '已成功使用推薦碼！獲得 {amount} 金幣',
    referral_applyError: '無法套用推薦碼',
    referral_inviteHistory: '邀請紀錄',

    // ========== Contribution ==========
    contribution_title: '社群貢獻',
    contribution_tabReport: '回報',
    contribution_tabSuggest: '建議',
    contribution_tabVote: '投票',
    contribution_loadFailed: '載入失敗',
    contribution_loadFailedDesc: '無法載入貢獻資料，請稍後再試',
    contribution_reportFeature: '回報功能',
    contribution_reportFeatureDesc: '請從收藏庫的景點卡片中點擊「回報」按鈕',
    contribution_reportClosure: '回報歇業/搬遷',
    contribution_reportClosureDesc: '協助更新景點資訊可獲得金幣',
    contribution_myReports: '我的回報',
    contribution_noReports: '尚無回報記錄',
    contribution_statusPending: '審核中',
    contribution_statusVerified: '已確認',
    contribution_statusRejected: '已駁回',
    contribution_suggestFeature: '建議功能',
    contribution_suggestFeatureDesc: '景點建議功能即將推出',
    contribution_suggestPlace: '建議新景點',
    contribution_suggestPlaceDesc: '推薦值得一訪的景點可獲得金幣',
    contribution_mySuggestions: '我的建議',
    contribution_noSuggestions: '尚無建議記錄',
    contribution_statusVoting: '投票中',
    contribution_statusApproved: '已通過',
    contribution_voteInfo: '達到 Lv.7 可參與社群投票，幫助維護景點品質',
    contribution_exclusionVotes: '待排除投票',
    contribution_newPlaceReviews: '新景點審核',
    contribution_exclude: '排除',
    contribution_keep: '保留',
    contribution_approve: '贊成',
    contribution_reject: '反對',
    contribution_voteSuccess: '投票成功',
    contribution_voteEarned: '獲得 {amount} 金幣',
    contribution_voteFailed: '投票失敗',
    contribution_voteTryAgain: '請稍後再試',
    contribution_noPendingVotes: '目前沒有待投票項目',
    contribution_reasonClosed: '已歇業',
    contribution_reasonRelocated: '已搬遷',
    contribution_reasonWrongInfo: '資訊有誤',
    contribution_reasonOther: '其他',

    // ========== Itinerary ==========
    itinerary_addedToItinerary: '已加入行程',
    itinerary_removedFromItinerary: '已從行程移除',
    itinerary_aiUnavailable: '抱歉，我暫時無法回應，請稍後再試',
    itinerary_removed: '已移除「{name}」',
    itinerary_removeFailed: '移除失敗，請稍後再試',
    itinerary_addPlacesFailed: '加入景點失敗，請稍後再試',
    itinerary_reorderFailed: '排序失敗，請重試',
    itinerary_incomplete: '請填寫完整',
    itinerary_selectCountryCity: '請選擇國家和城市',
    itinerary_createFailed: '建立失敗',
    itinerary_tryAgainLater: '請稍後再試',
    itinerary_networkError: '網路錯誤，請稍後再試',
    itinerary_updateFailed: '更新失敗',
    itinerary_deleteItineraries: '刪除行程',
    itinerary_deleteItinerariesConfirm: '確定要刪除 {count} 個行程嗎？此操作無法復原。',
    itinerary_deleteItinerary: '刪除行程',
    itinerary_deleteItineraryConfirm: '確定要刪除這個行程嗎？此操作無法復原。',
    itinerary_deleted: '已刪除 {count} 個行程',
    itinerary_deletedSingle: '行程已刪除',
    itinerary_deleteFailed: '刪除失敗',
    itinerary_loginRequired: '登入以使用行程助手',
    itinerary_noItineraries: '還沒有行程',
    itinerary_noItinerariesDesc: '建立行程，讓 AI 幫你規劃完美旅途',
    itinerary_tipAi: 'AI 智慧推薦景點',
    itinerary_tipPlanning: '自動安排每日行程',
    itinerary_tipNav: '即時導航帶你走',
    itinerary_createFirst: '建立第一個行程',
    itinerary_openList: '開啟行程列表',
    itinerary_tripAssistant: '行程助手',
    itinerary_viewDetails: '查看行程詳情',
    itinerary_welcomeSubtitle: '告訴我你想去哪，我來幫你安排',
    itinerary_helpText: '告訴我你的旅遊偏好，我會推薦景點並加入行程\n點擊左上角查看行程列表，點擊右上角查看行程表',
    itinerary_inputPlaceholder: '想去哪裡？告訴我...',
    itinerary_sendMessage: '發送訊息',
    itinerary_myTrips: '我的行程',
    itinerary_tripsCount: '個行程',
    itinerary_selectMode: '選擇',
    itinerary_cancelSelect: '取消選擇',
    itinerary_selectItineraries: '選擇行程',
    itinerary_deleteSelected: '刪除已選行程',
    itinerary_deleteCount: '刪除 {count} 個',
    itinerary_places: '個景點',
    itinerary_newTrip: '新增行程',
    itinerary_itinerary: '行程表',
    itinerary_viewOnGoogleMaps: '在 Google Maps 查看',
    itinerary_addFromCollection: '從圖鑑加入景點',
    itinerary_noPlaces: '還沒有景點\n跟 AI 聊聊想去哪吧！',
    itinerary_addCount: '加入 ({count})',
    itinerary_searchPlaces: '搜尋景點...',
    itinerary_noMatchingPlaces: '找不到符合的景點',
    itinerary_noCollectionPlaces: '圖鑑中沒有可加入的景點\n先去抽卡收集一些吧！',
    itinerary_morePlaces: '還有 {count} 個景點...',
    itinerary_newItinerary: '新增行程',
    itinerary_tripTitle: '行程標題',
    itinerary_tripTitlePlaceholder: '為你的旅程取個名字（選填）',
    itinerary_date: '日期',
    itinerary_country: '國家',
    itinerary_countryPlaceholder: '選擇國家',
    itinerary_city: '城市',
    itinerary_cityPlaceholder: '選擇城市',
    itinerary_createItinerary: '建立行程',
    // ---- Merchant 五大畫面遷移用 ----
    merchant_dashboard: '商家後台',
    merchant_editPlace: '編輯店家',
    merchant_basicInfoReadonly: '基本資訊（不可修改）',
    merchant_location: '地點',
    merchant_editableInfo: '可編輯資訊',
    merchant_description: '店家介紹',
    merchant_descriptionPlaceholder: '輸入店家介紹...',
    merchant_googleMapUrl: 'Google 地圖連結',
    merchant_googleMapUrlPlaceholder: '貼上 Google 地圖連結',
    merchant_openingHours: '營業時間',
    merchant_openingHoursPlaceholder: '例：週一至週五 09:00-18:00',
    merchant_openingHoursHint: '每行一個時段，例如：\n週一: 09:00-18:00\n週二: 09:00-18:00',
    merchant_promoSection: '優惠推廣',
    merchant_promoTitle: '優惠標題',
    merchant_promoTitlePlaceholder: '例：新客首購 9 折',
    merchant_promoDescription: '優惠說明',
    merchant_promoDescriptionPlaceholder: '輸入優惠詳細說明...',
    merchant_enablePromo: '啟用優惠推廣',
    merchant_saving: '儲存中...',
    merchant_dailyCode: '今日核銷碼',
    merchant_expiresAt: '有效期至',
    merchant_creditBalance: '點數餘額',
    merchant_points: '點',
    merchant_topUp: '儲值',
    merchant_payStripe: '使用 Stripe 付款',
    merchant_payRecur: '使用 Recur 付款',
    merchant_purchaseCredits: '購買點數',
    merchant_min100: '最低 100 點',
    merchant_demoCafe: '示範咖啡廳',
    merchant_transactionCreated: '交易已建立',
    merchant_purchaseFailed: '購買失敗',
    merchant_analyticsDesc: '查看店家與優惠券統計',
    merchant_storeManagement: '店家管理',
    merchant_storeManagementDesc: '管理您的店家資訊',
    merchant_productManagementLabel: '商品管理',
    merchant_productManagementDesc: '管理商品與服務',
    merchant_couponManagement: '優惠券管理',
    merchant_couponManagementDesc: '建立與管理優惠券',
    merchant_merchantProfile: '商家資料',
    merchant_merchantProfileDesc: '編輯商家基本資訊',
    merchant_tierProbability: '抽中機率',
    merchant_claimNew: '認領新店家',
    merchant_loadPlacesFailed: '店家資料載入失敗',
    merchant_checkConnection: '請檢查網路連線後再試',
    merchant_placeManagement: '店家管理',
    merchant_accountStatus: '帳號狀態',
    merchant_subscriptionPlan: '訂閱方案',
    merchant_freePlan: '免費方案',
    merchant_partnerPlan: '合作夥伴',
    merchant_premiumPlan: '進階方案',
    merchant_memberSince: '加入時間',
    merchant_dangerZone: '危險區域',
    merchant_confirmDeleteTitle: '確認刪除帳號',
    merchant_confirmDeleteMessage: '此操作無法復原，所有資料將被永久刪除。確定要繼續嗎？',
    merchant_confirmDeleteBtn: '確認刪除',
    merchant_deleteFailed: '刪除失敗，請稍後再試',
    merchant_deleteAccount: '刪除帳號',
    merchant_accountDeleted: '帳號已刪除',
    merchant_searchFailedRetry: '搜尋失敗，請稍後再試',
    merchant_validUntilWithFormat: '有效期限 (YYYY-MM-DD)',

    // ========== SettingsScreen ==========
    settings_title: '設定',
    settings_account: '帳號',
    settings_profile: '個人資料',
    settings_language: '語言設定',
    settings_about: '關於',
    settings_privacyPolicy: '隱私政策',
    settings_termsOfService: '服務條款',
    settings_helpCenter: '幫助中心',
    settings_admin: '管理員',
    settings_globalExclusions: '全域排除管理',
    settings_accountManagement: '帳號管理',
    settings_logout: '登出',
    settings_deleteAccount: '刪除帳號',
    settings_selectLanguage: '選擇語言',
    settings_confirmLogout: '確認登出',
    settings_confirmLogoutDesc: '確定要登出嗎？',
    settings_deleteAccountTitle: '刪除帳號',
    settings_deleteAccountDesc: '確定要刪除您的帳號嗎？此操作無法復原。',
    settings_cannotDelete: '無法刪除',
    settings_deleteFailed: '刪除失敗，請稍後再試',
    settings_deactivateMerchantFirst: '請先解除商家帳號',
    settings_mergeAccounts: '合併帳號',
    settings_mergeAccountsDesc: '此功能可將另一個帳號的資料（圖鑑、行程、成就等）合併到目前的帳號。\n\n⚠️ 合併後，副帳號將無法再登入。',
    settings_continue: '繼續',
    settings_loginSecondary: '登入副帳號',
    settings_loginSecondaryDesc: '請使用副帳號的登入方式進行驗證，以確認您擁有該帳號的存取權限。',
    settings_loginToMerge: '登入要合併的帳號',
    settings_merging: '合併中...',
    settings_mergingDesc: '請稍候，正在合併帳號資料',
    settings_mergeSuccess: '合併成功！',
    settings_mergeFailed: '合併失敗',
    settings_mergeFailedRetry: '合併失敗，請稍後再試',
    settings_mergedData: '已合併的資料：',
    settings_collections: '圖鑑',
    settings_itineraries: '行程',
    settings_favorites: '收藏',
    settings_achievements: '成就',
    settings_coins: '金幣',
    settings_balance: '餘額',
    settings_unknownError: '發生未知錯誤',
    settings_pleaseLoginFirst: '請先登入',

    // ========== ProfileScreen ==========
    profile_title: '個人資料',
    profile_save: '儲存',
    profile_uploading: '上傳中...',
    profile_tapToChange: '點擊更換頭像',
    profile_userId: '用戶 ID',
    profile_enterEmail: '請輸入 Email',
    profile_lastName: '姓',
    profile_firstName: '名',
    profile_enterLastName: '請輸入姓氏',
    profile_enterFirstName: '請輸入名字',
    profile_gender: '性別',
    profile_select: '請選擇',
    profile_birthDate: '出生年月日',
    profile_phone: '手機',
    profile_enterPhone: '請輸入手機號碼',
    profile_dietaryRestrictions: '飲食禁忌',
    profile_dietaryPlaceholder: '輸入飲食禁忌，如：素食、海鮮過敏',
    profile_medicalHistory: '疾病史',
    profile_medicalPlaceholder: '輸入疾病史，如：糖尿病、高血壓',
    profile_emergencyContact: '緊急聯絡人',
    profile_contactName: '姓名',
    profile_enterName: '請輸入姓名',
    profile_contactPhone: '電話',
    profile_enterContactPhone: '請輸入電話',
    profile_relationship: '關係',
    profile_chooseAvatar: '選擇頭像',
    profile_uploadAvatar: '上傳自訂頭像',
    profile_profileUpdated: '個人資料已更新',
    profile_saveFailed: '儲存失敗，請稍後再試',
    profile_loadFailed: '無法載入個人資料',
    profile_photoPermissionRequired: '需要相簿存取權限',
    profile_cannotReadImage: '無法讀取圖片資料',
    profile_avatarUploaded: '頭像上傳成功',
    profile_uploadFailed: '上傳失敗',
    profile_uploadFailedRetry: '上傳失敗，請稍後再試',
    profile_previewAvatar: '預覽頭像',
    profile_previewConfirm: '確認使用',
    profile_previewCancel: '重新選擇',
    profile_genderMale: '男',
    profile_genderFemale: '女',
    profile_genderOther: '其他',
    profile_relationSpouse: '配偶',
    profile_relationParent: '父母',
    profile_relationSibling: '兄弟姊妹',
    profile_relationFriend: '朋友',
    profile_relationOther: '其他',

    // ========== AccountScreen ==========
    auth_linkedAccounts: '帳號綁定',
    auth_linkMultipleDesc: '綁定多個帳號可讓您使用不同方式登入，並保護帳號安全。',
    auth_linkedAccountsSection: '已綁定的帳號',
    auth_noAccountsLinked: '尚未綁定任何帳號',
    auth_addAccount: '新增綁定',
    auth_linkApple: '綁定 Apple',
    auth_signInApple: '使用 Apple ID 登入',
    auth_linkGoogle: '綁定 Google',
    auth_signInGoogle: '使用 Google 帳號登入',
    auth_allLinked: '已綁定所有可用帳號',
    auth_linkSuccess: '綁定成功',
    auth_appleLinkSuccess: 'Apple 帳號已成功綁定',
    auth_linkFailed: '綁定失敗',
    auth_appleLinkFailed: '無法綁定 Apple 帳號',
    auth_comingSoon: '功能開發中',
    auth_googleComingSoon: 'Google 綁定功能即將推出',
    auth_cannotUnlink: '無法解除綁定',
    auth_keepOneMethod: '至少需要保留一個登入方式',
    auth_cannotUnlinkPrimary: '無法解除主要登入方式，請先設定其他帳號為主要登入方式',
    auth_confirmUnlink: '確認解除綁定',
    auth_confirmUnlinkDesc: '確定要解除 {provider} 帳號的綁定嗎？',
    auth_unlink: '解除綁定',
    auth_unlinkSuccess: '解除成功',
    auth_unlinkSuccessDesc: '已解除帳號綁定',
    auth_unlinkFailed: '解除失敗',
    auth_unlinkFailedRetry: '無法解除綁定，請稍後再試',
    auth_primary: '主要',
    auth_noEmailProvided: '（未提供 Email）',
    auth_linkedAt: '綁定於 ',

    // ========== HomeScreen ==========
    home_greeting: '嗨，旅行者！',
    home_greetingSubtitle: '今天想去哪裡探索？',
    home_newsTab: '公告',
    home_localTab: '在地活動',
    home_flashTab: '限時活動',
    home_noAnnouncements: '目前沒有公告',
    home_stayTuned: '敬請期待最新消息！',
    home_noLocalActivities: '目前沒有在地活動',
    home_discoverNearby: '探索附近的精彩活動！',
    home_noFlashEvents: '目前沒有限時活動',
    home_limitedOffersSoon: '限時優惠即將到來！',
    home_loginStreak: '連續登入',
    home_days: '天',
    home_specialistReady: '可申請策劃師',
    home_dailyTasks: '每日任務',
    home_done: '完成',
    home_earned: '已獲得',
    home_coinsUnit: '金幣',
    home_titleLegendary: '傳奇旅者',
    home_titleExpert: '資深冒險家',
    home_titleTraveler: '旅行達人',
    home_titleExplorer: '探索者',
    home_titleNewbie: '旅行新手',
  },

  // ========== 英文 ==========
  'en': {
    dailyLimitReached: 'Daily Limit Reached',
    dailyLimitReachedDesc: 'Your daily pull quota has been used up. Come back tomorrow!',
    appTitle: 'MIBU TRIP',
    appSubtitle: 'AI Travel Gacha',
    destination: 'Destination',
    selectDestination: 'Select Destination',
    city: 'City',
    selectCity: 'Select City',
    startGacha: 'START GACHA',
    generating: 'Generating...',
    findingGems: 'Finding hidden gems',
    tripLevel: 'Level {level} Trip',
    spotsCount: '{count} Spots',
    couponUnlocked: 'Coupon Unlocked',
    specialPromo: 'Special Promo',
    noCollection: 'No collection yet.',
    startToCollect: 'Start gacha to collect spots!',
    noCoupons: 'No coupons yet.',
    navHome: 'Home',
    navGacha: 'Gacha',
    navGachaModule: 'Travel Gacha',
    navPlanner: 'Planner',
    navPlannerModule: 'Trip Planner',
    navCollection: 'Collection',
    navMyBox: 'My Box',
    navItems: 'Items',
    navSettings: 'Settings',
    navLocation: 'Location',
    navItinerary: 'Itinerary',
    navChat: 'Chat',
    navService: 'Service',
    back: 'Back',
    loading: 'Loading...',
    login: 'Login',
    signInReplit: 'Sign in with Replit',
    guestLogin: 'Guest Login',
    welcomeBack: 'Welcome Back',
    backToHome: 'Back to Home',
    catFood: 'Food',
    catStay: 'Stay',
    catScenery: 'Scenery',
    catShopping: 'Shopping',
    catEntertainment: 'Entertainment',
    catEducation: 'Eco-Culture',
    catExperience: 'Experience',
    relaxed: 'Relaxed',
    packed: 'Packed',
    selectCountry: 'Select Country',
    selectRegion: 'Select City/Region',
    itineraryPace: 'Itinerary Pace',
    stops: 'Stops',
    viewOnMap: 'View on Google Maps',
    rePull: 'Re-pull',
    places: 'places',
    myCollection: 'My Collection',
    spots: 'spots',
    announcements: 'Announcements',
    flashEvents: 'Flash Events',
    explore: 'Explore',
    shareLocationToPlanner: 'Share location with planner',
    yourLocation: 'Your location',
    planner: 'Planner',
    safetyCenter: 'Safety Center',
    safetyCenterDesc: 'Set up emergency SOS to stay safe during your trip',
    safety: 'Safety',
    setupEmergencySOS: 'Set up emergency SOS',
    iosShortcutsIntegration: 'iOS Shortcuts Integration',
    iosShortcutsDesc: 'Add the link below to iOS Shortcuts app to quickly trigger SOS via Siri or automation',
    webhookUrl: 'Webhook URL (POST)',
    notAvailable: 'Link not available',
    copyLink: 'Copy Link',
    copied: 'Copied',
    setupSteps: 'Setup Steps:',
    step1: '1. Open iOS Shortcuts app',
    step2: '2. Create new shortcut, add "Get Contents of URL" action',
    step3: '3. Paste the Webhook URL above',
    step4: '4. Set method to "POST"',
    step5: '5. Set up Siri voice command or automation trigger',
    emergencyNow: 'Emergency Now',
    emergencyNowDesc: 'Press the button to immediately send an SOS signal to your emergency contacts',
    sosButton: 'SOS Emergency',
    confirmSOS: 'Confirm SOS',
    confirmSOSDesc: 'Are you sure you want to send an emergency SOS signal?',
    cancel: 'Cancel',
    confirmSend: 'Confirm Send',
    sent: 'Sent',
    sosSuccess: 'SOS signal has been sent successfully',
    sendFailed: 'Send Failed',
    tryAgainLater: 'Please try again later',
    networkError: 'Network error, please check your connection',
    gettingLocation: 'Getting location...',
    locationPermissionRequired: 'Location permission is required to use this feature',
    unableToGetLocation: 'Unable to get location',
    retry: 'Retry',
    viewPool: 'View Pool',
    poolPreview: 'Pool Preview',
    pullCount: 'Pull Count',
    selectDistrict: 'Select District',
    rareItems: 'Rare Items',
    noRareItems: 'No rare items in this area',
    closeModal: 'Close',
    pulls: 'pulls',
    loadingPool: 'Loading pool...',
    merchant: 'Partner',
    generatingItinerary: 'Generating itinerary...',
    sponsorAd: 'Sponsored Ad (Demo)',
    pleaseWait: 'Please wait',
    almostReady: 'Almost ready',
    gachaResults: 'Gacha Results',
    addToBackpack: 'Add to Backpack',
    addedToBackpack: 'Added!',
    gotCoupon: 'Got Coupon!',
    partnerMerchant: 'Partner',
    rating: 'Rating',
    noResults: 'No Results Yet',
    tryGachaFirst: 'Try gacha first!',
    viewResults: 'View Results',
    exploring: 'Exploring',
    reGacha: 'Re-Gacha',
    emptyItemBox: 'Item Box is Empty',
    collectItemsFirst: 'Start pulling gacha to collect spots!',
    totalItems: 'Total',
    itemsCount: 'items',

    // ========== Common (cross-screen) ==========
    common_error: 'Error',
    common_confirm: 'OK',
    common_delete: 'Delete',
    common_save: 'Save',
    common_edit: 'Edit',
    common_remove: 'Remove',
    common_done: 'Done',
    common_submit: 'Submit',
    common_search: 'Search',
    common_logout: 'Logout',
    common_success: 'Success',
    common_loadFailed: 'Failed to load',
    common_saveFailed: 'Save failed',
    common_deleteFailed: 'Delete failed',
    common_createFailed: 'Create failed',
    common_updateFailed: 'Update failed',
    common_saveTryAgain: 'Failed to save, please try again',
    common_notice: 'Notice',
    common_errorTryAgain: 'An error occurred. Please try again.',
    common_noData: 'No data',
    common_fillRequired: 'Please fill in required fields',
    common_confirmDelete: 'Confirm Delete',
    common_confirmLogout: 'Confirm Logout',
    common_confirmLogoutDesc: 'Are you sure you want to logout?',
    common_deleteAccount: 'Delete Account',
    common_required: 'Required',
    common_name: 'Name',
    common_email: 'Email',
    common_password: 'Password',
    common_phone: 'Phone',
    common_address: 'Address',
    common_status: 'Status',
    common_place: 'Place',
    common_coupon: 'Coupon',
    common_pending: 'Pending',
    common_approved: 'Approved',
    common_rejected: 'Rejected',
    common_active: 'Active',
    common_inactive: 'Inactive',
    common_verified: 'Verified',
    common_switchRole: 'Switch Role',
    common_roleTraveler: 'Traveler',
    common_roleMerchant: 'Merchant',
    common_roleSpecialist: 'Specialist',
    common_roleAdmin: 'Admin',
    common_skip: 'Skip',
    common_back: 'Back',
    common_next: 'Next',
    common_getStarted: 'Get Started',

    // ========== Admin ==========
    admin_title: 'Admin Dashboard',
    admin_pendingTab: 'Pending',
    admin_usersTab: 'Users',
    admin_draftsTab: 'Drafts',
    admin_exclusionsTab: 'Exclusions',
    admin_announcementsTab: 'Announcements',
    admin_approve: 'Approve',
    admin_reject: 'Reject',
    admin_publish: 'Publish',
    admin_noPending: 'No pending users',
    admin_merchant: 'Merchant',
    admin_specialist: 'Specialist',
    admin_traveler: 'Traveler',
    admin_admin: 'Admin',
    admin_confirmApprove: 'Approve this user?',
    admin_confirmReject: 'Reject this user?',
    admin_confirmPublish: 'Publish this draft?',
    admin_confirmDelete: 'Delete this item?',
    admin_penalty: 'Penalty',
    admin_goToAnnouncement: 'Go to Announcement Manager',
    admin_announcementManage: 'Announcement Management',
    admin_add: 'Add',
    admin_type: 'Type',
    admin_titleLabel: 'Title',
    admin_contentLabel: 'Content',
    admin_imageUrl: 'Image URL',
    admin_linkUrl: 'Link URL',
    admin_priority: 'Priority',
    admin_noAnnouncements: 'No announcements',
    admin_confirmDeleteAnnouncement: 'Delete this announcement?',
    admin_createAnnouncement: 'Create Announcement',
    admin_editAnnouncement: 'Edit Announcement',
    admin_fillTitleContent: 'Please fill in title and content',
    admin_enterTitle: 'Enter title',
    admin_enterContent: 'Enter content',
    admin_typeAnnouncement: 'Announcement',
    admin_typeFlashEvent: 'Flash Event',
    admin_typeHolidayEvent: 'Holiday Event',
    admin_startDateLabel: 'Start Date',
    admin_endDateLabel: 'End Date',
    admin_isActiveLabel: 'Active',
    admin_datePlaceholder: 'YYYY-MM-DD',

    // ========== Specialist Module ==========
    specialist_dashboard: 'Specialist Dashboard',
    specialist_online: 'Online',
    specialist_offline: 'Offline',
    specialist_onlineStatus: 'Online Status',
    specialist_activeServices: 'Active Services',
    specialist_noServices: 'No active services',
    specialist_since: 'Since',
    specialist_region: 'Region',
    specialist_activeTravelers: 'Active Travelers',
    specialist_viewTravelers: 'View travelers being served',
    specialist_liveTracking: 'Live Tracking',
    specialist_viewTravelersOnMap: 'View travelers on map',
    specialist_serviceHistory: 'Service History',
    specialist_viewPastRecords: 'View past service records',
    specialist_profile: 'Specialist Profile',
    specialist_viewEditProfile: 'View and edit profile',
    specialist_filterAll: 'All',
    specialist_completed: 'Completed',
    specialist_cancelled: 'Cancelled',
    specialist_noHistory: 'No service history',
    specialist_traveler: 'Traveler',
    specialist_noActiveTravelers: 'No active travelers',
    specialist_viewLocation: 'View Location',
    specialist_connecting: 'Connecting...',
    specialist_connected: 'Connected',
    specialist_disconnected: 'Disconnected',
    specialist_noLocations: 'No traveler locations yet',
    specialist_lastUpdate: 'Last update',
    specialist_travelers: 'travelers',
    specialist_mapNotAvailableWeb: 'Map not available on web',
    specialist_mapRequiresNative: 'Map Area - requires react-native-maps',
    specialist_travelerLocations: 'Traveler Locations',
    specialist_accountStatus: 'Account Status',
    specialist_available: 'Available',
    specialist_unavailable: 'Unavailable',
    specialist_currentlyServing: 'Currently Serving',
    specialist_maxTravelers: 'Max Travelers',
    specialist_serviceRegion: 'Service Region',
    specialist_people: '',

    // ========== SOS Emergency Contacts ==========
    sos_emergencyContacts: 'Emergency Contacts',
    sos_limitReached: 'Limit Reached',
    sos_limitReachedDesc: 'You can only add up to {max} emergency contacts',
    sos_incomplete: 'Incomplete',
    sos_enterNamePhone: 'Please enter name and phone',
    sos_saveFailed: 'Failed to save contact',
    sos_deleteContact: 'Delete Contact',
    sos_deleteContactConfirm: 'Delete "{name}"?',
    sos_deleteContactFailed: 'Failed to delete contact',
    sos_noContacts: 'No emergency contacts',
    sos_tapToAdd: 'Tap + to add your first contact',
    sos_addContact: 'Add Contact',
    sos_editContact: 'Edit Contact',
    sos_infoBanner: 'Add up to {max} emergency contacts. They will be notified when you send SOS.',
    sos_enterName: 'Enter name',
    sos_enterPhone: 'Enter phone number',
    sos_relationship: 'Relationship',
    sos_relFamily: 'Family',
    sos_relFriend: 'Friend',
    sos_relColleague: 'Colleague',
    sos_relOther: 'Other',

    // ========== SOS Screen ==========
    sos_emergencySOS: 'Emergency SOS',
    sos_holdToSend: 'Press and hold the button for 3 seconds to send an SOS alert',
    sos_hold3sec: 'Hold 3 sec',
    sos_alertHistory: 'Alert History',
    sos_alertSent: 'SOS Alert Sent',
    sos_willContactYou: 'We will contact you as soon as possible',
    sos_sendFailed: 'Failed to Send',
    sos_tryAgainLater: 'Please try again later',
    sos_confirmCancel: 'Confirm Cancel',
    sos_confirmCancelDesc: 'Are you sure you want to cancel this alert?',
    sos_no: 'No',
    sos_yes: 'Yes',
    sos_cancelFailed: 'Failed to cancel',
    sos_cancelAlert: 'Cancel Alert',
    sos_featureLocked: 'SOS Feature Locked',
    sos_requirePurchase: 'Purchase travel service to unlock Safety Center',
    sos_purchaseService: 'Purchase Service',
    sos_statusPending: 'Pending',
    sos_statusAcknowledged: 'Acknowledged',
    sos_statusResolved: 'Resolved',
    sos_statusCancelled: 'Cancelled',

    // ========== Auth Sign In/Up ==========
    auth_signIn: 'Sign In',
    auth_signUp: 'Sign Up',
    auth_username: 'Username (Email)',
    auth_password: 'Password',
    auth_name: 'Name',
    auth_selectRole: 'Select Role',
    auth_noAccount: "Don't have an account?",
    auth_hasAccount: 'Already have an account?',
    auth_guestLogin: 'Continue as Guest',
    auth_guestNote: 'In guest mode, data is only saved locally',
    auth_pendingApproval: 'Merchant and Specialist accounts require admin approval',
    auth_loginFailed: 'Login failed, please check your credentials',
    auth_registerFailed: 'Registration failed, please try again',
    auth_enterUsernamePassword: 'Please enter username and password',
    auth_fillAllFields: 'Please fill in all fields',
    auth_roleTraveler: 'Traveler',
    auth_roleMerchant: 'Merchant',
    auth_roleSpecialist: 'Specialist',

    // ========== Auth Pending Approval ==========
    auth_pendingTitle: 'Pending Approval',
    auth_pendingSubtitle: 'Your account is pending admin approval',
    auth_pendingDescription: 'Merchant and Specialist accounts require approval for full access. You will be notified once approved.',
    auth_appliedRole: 'Applied Role',

    // ========== Merchant ==========
    merchant_productMgmt: 'Product Management',
    merchant_myProducts: 'My Products',
    merchant_noProducts: 'No products yet',
    merchant_addProduct: 'Add Product',
    merchant_productName: 'Product Name',
    merchant_productDesc: 'Description',
    merchant_price: 'Price',
    merchant_discountPrice: 'Discount Price',
    merchant_activeStatus: 'Active',
    merchant_inactiveStatus: 'Inactive',
    merchant_deleteProductConfirm: 'Delete this product?',
    merchant_deleted: 'Deleted',
    merchant_saved: 'Saved',
    merchant_couponAddTitle: 'Add Coupon',
    merchant_couponEditTitle: 'Edit Coupon',
    merchant_couponName: 'Coupon Name',
    merchant_couponNamePlaceholder: 'e.g. 10% Off',
    merchant_rarityTier: 'Rarity Tier',
    merchant_tierHint: 'Higher tier = lower draw rate',
    merchant_discountContent: 'Discount Content',
    merchant_discountContentPlaceholder: 'Describe the discount...',
    merchant_terms: 'Terms & Conditions',
    merchant_termsPlaceholder: 'Usage restrictions (optional)',
    merchant_quantity: 'Quantity',
    merchant_quantityHint: 'Total coupons to distribute',
    merchant_validUntil: 'Valid Until',
    merchant_validUntilHint: 'Leave empty for no expiration',
    merchant_activateNow: 'Activate Now',
    merchant_saveSuccess: 'Saved successfully',
    merchant_notice: 'Notice',
    merchant_addPlace: 'Add New Place',
    merchant_addPlaceSubtitle: 'Fill in your place information',
    merchant_placeName: 'Place Name',
    merchant_placeNamePlaceholder: 'Enter place name',
    merchant_category: 'Category',
    merchant_selectCategory: 'Select category',
    merchant_district: 'District',
    merchant_districtPlaceholder: "e.g. Da'an District",
    merchant_city: 'City',
    merchant_cityPlaceholder: 'e.g. Taipei',
    merchant_placeAddress: 'Address',
    merchant_addressPlaceholder: 'Full address',
    merchant_placeDesc: 'Description',
    merchant_placeDescPlaceholder: 'Brief introduction of your place...',
    merchant_submitApplication: 'Submit',
    merchant_applicationSubmitted: 'Application submitted! We will review it soon.',
    merchant_submitError: 'Submit failed, please try again',
    merchant_catFood: 'Food',
    merchant_catStay: 'Stay',
    merchant_catScenery: 'Scenery',
    merchant_catShopping: 'Shopping',
    merchant_catEntertainment: 'Entertainment',
    merchant_catEducation: 'Education',
    merchant_analytics: 'Analytics',
    merchant_overview: 'Overview',
    merchant_totalExposures: 'Total Exposures',
    merchant_totalCollectors: 'Total Collectors',
    merchant_couponIssued: 'Coupons Issued',
    merchant_couponRedeemed: 'Coupons Redeemed',
    merchant_redemptionRate: 'Redemption Rate',
    merchant_topCoupons: 'Top Coupons',
    merchant_placeBreakdown: 'Place Breakdown',

    // ========== Login Page (OAuth) ==========
    auth_notMerchant: 'Not a Merchant',
    auth_notMerchantDesc: 'Please register as a merchant first',
    auth_notSpecialist: 'Not a Specialist',
    auth_notSpecialistDesc: 'Please register as a specialist first',
    auth_wrongPortal: 'Wrong Portal',
    auth_wrongPortalDesc: 'Please switch to the correct portal',
    auth_permissionDenied: 'Permission Denied',
    auth_permissionDeniedDesc: 'You do not have permission to access this feature',
    auth_oauthLoginFailed: 'Login Failed',
    auth_loginError: 'Login Error',
    auth_tryAgainLater: 'Please try again',
    auth_googleSignInFailed: 'Could not complete Google Sign In',
    auth_appleSignInFailed: 'Could not complete Apple Sign In',
    auth_cannotConnectServer: 'Could not connect to server',
    auth_networkError: 'Network Error',
    auth_switchPortal: 'Switch Portal',
    auth_googleLogin: 'Google Sign In',
    auth_switchLanguage: 'Switch language',
    auth_switchTo: 'Switch to',
    auth_applicationSubmitted: 'Application Submitted!',
    auth_applicationReceivedMsg: 'We have received your application and will process it shortly',
    auth_applicationApprovalNote: 'Once approved, you will receive a notification and can log in with your account',
    auth_backToLogin: 'Back to Login',
    auth_registrationFailed: 'Registration Failed',
    auth_registrationError: 'Registration failed. Please try again.',

    // ========== Merchant Registration (Form) ==========
    merchant_registration: 'Merchant Registration',
    merchant_registrationSubtitle: 'Fill in your details to apply as a partner merchant',
    merchant_regOwnerName: 'Owner Name',
    merchant_regOwnerNamePlaceholder: 'Enter owner name',
    merchant_regBusinessName: 'Business Name',
    merchant_regBusinessNamePlaceholder: 'Enter business name',
    merchant_regTaxId: 'Tax ID (Optional)',
    merchant_regTaxIdPlaceholder: 'Enter tax ID',
    merchant_regBusinessCategory: 'Business Category',
    merchant_regBusinessCategoryPlaceholder: 'Select business category',
    merchant_regAddress: 'Business Address',
    merchant_regAddressPlaceholder: 'Enter business address',
    merchant_regPhone: 'Phone (Optional)',
    merchant_regPhonePlaceholder: 'Enter phone number',
    merchant_regMobile: 'Mobile',
    merchant_regMobilePlaceholder: 'Enter mobile number',
    merchant_regEmailPlaceholder: 'Enter email',
    merchant_regSubmitReview: 'Submit for Review',
    merchant_regSubmitting: 'Submitting...',
    merchant_regSubmitSuccess: 'Submitted Successfully',
    merchant_regSubmitSuccessMsg: 'Your application has been submitted. Please wait for approval.',
    merchant_regSubmitFailed: 'Submission failed. Please try again.',
    merchant_regFillRequired: 'Please fill in all required fields',
    merchant_regInvalidEmail: 'Please enter a valid email',
    merchant_regCatRestaurant: 'Restaurant',
    merchant_regCatHotel: 'Hotel/Accommodation',
    merchant_regCatAttraction: 'Attraction/Entertainment',
    merchant_regCatShopping: 'Shopping/Retail',
    merchant_regCatTransportation: 'Transportation',
    merchant_regCatExperience: 'Experience/Activity',
    merchant_regCatCulture: 'Culture/Art',
    merchant_regCatOther: 'Other',
    merchant_regEmail: 'Email (Account)',
    merchant_regPassword: 'Password (min 6 chars)',
    merchant_regConfirmPassword: 'Confirm Password',
    merchant_regContactName: 'Contact Name',
    merchant_regIndustryCategory: 'Business Category',
    merchant_regBusinessAddress: 'Business Address',
    merchant_regOtherContact: 'Other Contact (Optional)',
    merchant_regBackToLogin: 'Back to Login',
    merchant_regSelectCategory: 'Select Business Category',
    merchant_regEnterEmail: 'Please enter email',
    merchant_regInvalidEmailFormat: 'Invalid email format',
    merchant_regPasswordMinLength: 'Password must be at least 6 characters',
    merchant_regPasswordMismatch: 'Passwords do not match',
    merchant_regEnterBusinessName: 'Please enter business name',
    merchant_regEnterContactName: 'Please enter contact name',
    merchant_regSelectIndustry: 'Please select business category',
    merchant_regEnterAddress: 'Please enter business address',
    merchant_regContactNamePlaceholder: 'Enter contact name',
    merchant_regTaxIdShort: 'Tax ID',
    merchant_regLineOrPhone: 'LINE ID or Phone',
    merchant_regCatRestaurantShort: 'Restaurant',
    merchant_regCatHotelShort: 'Hotel',
    merchant_regCatAttractionShort: 'Attraction',
    merchant_regCatShoppingShort: 'Shopping',
    merchant_regCatActivityShort: 'Activity',
    merchant_regCatOtherShort: 'Other',

    // ========== Specialist Registration ==========
    specialist_registration: 'Specialist Registration',
    specialist_emailAccount: 'Email (Account)',
    specialist_passwordMin: 'Password (min 6 chars)',
    specialist_confirmPassword: 'Confirm Password',
    specialist_nameLabel: 'Name',
    specialist_otherContact: 'Other Contact (Optional)',
    specialist_serviceRegionOptional: 'Service Region (Optional)',
    specialist_submitApplication: 'Submit Application',
    specialist_backToLogin: 'Back to Login',
    specialist_enterEmail: 'Please enter email',
    specialist_invalidEmailFormat: 'Invalid email format',
    specialist_passwordMinLength: 'Password must be at least 6 characters',
    specialist_passwordMismatch: 'Passwords do not match',
    specialist_enterName: 'Please enter name',
    specialist_namePlaceholder: 'Enter your name',
    specialist_regionPlaceholder: 'e.g., Taipei, Yilan',
    specialist_lineOrPhone: 'LINE ID or Phone',

    // ========== Favorites & Blacklist ==========
    itinerary_favoritesAndBlacklist: 'Favorites & Blacklist',
    itinerary_favorites: 'Favorites',
    itinerary_blacklist: 'Blacklist',
    itinerary_removeFavorite: 'Remove Favorite',
    itinerary_removeFavoriteConfirm: 'Remove from favorites?',
    itinerary_removeBlacklist: 'Remove from Blacklist',
    itinerary_removeBlacklistConfirm: 'Remove from blacklist?',
    itinerary_noFavorites: 'No favorites yet',
    itinerary_addFavoritesHint: 'Tap the heart icon to add favorites',
    itinerary_noBlacklist: 'No blacklisted items',
    itinerary_addBlacklistHint: "Add items you don't like to blacklist",
    itinerary_favoritesGachaHint: 'Favorite places will appear more often in gacha',
    itinerary_blacklistGachaHint: "Blacklisted items won't appear in gacha",

    // ========== Event Detail ==========
    common_eventNotFound: 'Event not found',
    common_goBack: 'Go Back',
    common_description: 'Description',
    common_learnMore: 'Learn More',
    event_announcement: 'Announcement',
    event_festival: 'Festival',
    event_limited: 'Limited Event',

    merchant_allPlaces: 'All Places',
    merchant_selectPlace: 'Select Place',
    merchant_noDataYet: 'No data',
    merchant_times: 'times',
    merchant_people: 'people',
    merchant_issued: 'Issued',
    merchant_redeemed: 'Redeemed',
    merchant_collectionCount: 'Collections',
    merchant_7days: '7 Days',
    merchant_30days: '30 Days',
    merchant_90days: '90 Days',
    merchant_allPeriod: 'All',
    merchant_couponMgmt: 'Coupon Management',
    merchant_couponMgmtSubtitle: 'Create and manage your coupons',
    merchant_addCoupon: 'Add Coupon',
    merchant_noCoupons: 'No coupons yet',
    merchant_noCouponsHint: 'Start creating your first coupon',
    merchant_remaining: 'Remaining',
    merchant_couponActive: 'Active',
    merchant_couponInactive: 'Inactive',
    merchant_couponExpired: 'Expired',
    merchant_confirmDeleteCoupon: 'Delete this coupon?',
    merchant_deleteSuccess: 'Deleted successfully',
    merchant_drawRate: 'Draw rate',
    merchant_couponValidUntil: 'Valid until',
    merchant_couponLoadFailed: 'Failed to load coupons',
    merchant_couponLoadFailedDetail: 'Please check your connection and try again',
    merchant_verifyTitle: 'Verify Code',
    merchant_merchantIdLabel: 'Merchant ID',
    merchant_merchantIdPlaceholder: 'Enter Merchant ID',
    merchant_codeLabel: 'Verification Code',
    merchant_codePlaceholder: 'Enter code',
    merchant_verify: 'Verify',
    merchant_verifying: 'Verifying...',
    merchant_verifyValid: 'Valid',
    merchant_verifyInvalid: 'Invalid',
    merchant_errorEmpty: 'Please enter merchant ID and code',
    merchant_tryAgain: 'Try Again',
    merchant_merchantIdMustBeNumber: 'Merchant ID must be a number',
    merchant_codeValid: 'Code is valid',
    merchant_codeInvalid: 'Code is invalid',
    merchant_verifyFailed: 'Verification failed',
    merchant_claimTitle: 'Claim Place',
    merchant_claimSubtitle: 'Search and claim your place',
    merchant_searchPlaceholder: 'Enter place name...',
    merchant_claim: 'Claim',
    merchant_claimed: 'Claimed',
    merchant_noSearchResults: 'No matching places found',
    merchant_noResultsHint: 'Try other keywords, or add your own place',
    merchant_addNewPlace: 'Add New Place',
    merchant_claimSuccess: 'Claimed successfully!',
    merchant_claimFailed: 'Claim failed',
    merchant_searchHint: 'Enter place name to search',
    merchant_searchFailed: 'Search failed',
    merchant_myPlaces: 'My Places',
    merchant_myPlacesSubtitle: 'Manage your claimed places',
    merchant_noPlaces: 'No places claimed yet',
    merchant_noPlacesHint: 'Start claiming or adding your places',
    merchant_claimExisting: 'Claim Existing Place',
    merchant_placesCount: '{n} place(s)',
    merchant_transactionHistory: 'Transaction History',
    merchant_noTransactions: 'No transactions yet',
    merchant_purchase: 'Purchase',
    merchant_usage: 'Usage',
    merchant_refund: 'Refund',
    merchant_appFormTitle: 'Merchant Application',
    merchant_appFormSubtitle: 'Fill in the details below. Review takes 1-3 business days.',
    merchant_ownerName: 'Owner Name *',
    merchant_businessName: 'Business Name *',
    merchant_taxId: 'Tax ID',
    merchant_businessCategoryLabel: 'Business Category *',
    merchant_merchantPhone: 'Phone',
    merchant_merchantMobile: 'Mobile *',
    merchant_contactEmail: 'Contact Email *',
    merchant_submitAppForm: 'Submit Application',
    merchant_requiredFields: 'Please fill all required fields',
    merchant_submitSuccess: 'Application submitted. Awaiting review.',
    merchant_submitFailed: 'Submission failed. Please try again.',
    merchant_enterOwnerName: 'Enter owner name',
    merchant_enterBusinessName: 'Enter business name',
    merchant_enterAddress: 'Enter business address',
    merchant_optional: 'Optional',
    merchant_catRestaurant: 'Restaurant',
    merchant_catRetail: 'Retail',
    merchant_catHotel: 'Hotel',
    merchant_catService: 'Service',
    merchant_catOther: 'Other',
    merchant_catAttraction: 'Attraction/Entertainment',
    merchant_catTransportation: 'Transportation',
    merchant_catExperience: 'Experience/Activity',
    merchant_catCulture: 'Culture/Art',
    // ========== Economy ==========
    economy_achievementsTitle: 'Achievements',
    economy_loadFailed: 'Load Failed',
    economy_loadFailedDesc: 'Unable to load economy data. Please try again later.',
    economy_beginnerTasks: 'Beginner Tasks',
    economy_done: 'done',
    economy_achievementProgress: 'Achievement Progress',
    economy_unlocked: 'unlocked',
    economy_noAchievements: 'No achievements yet',
    economy_myPerks: 'My Perks',
    economy_dailyPullLimit: 'Daily Pull Limit',
    economy_pullsPerDay: 'Number of pulls per day',
    economy_inventorySlots: 'Inventory Slots',
    economy_itemsCanHold: 'Number of items you can hold',
    economy_specialistEligibility: 'Specialist Eligibility',
    economy_canApplyNow: 'You can apply now!',
    economy_unlockRequirement: 'Unlock by earning 1,500 coins and "Veteran Traveler" achievement',
    economy_aboutCoins: 'About Coins',
    economy_coinsInfo: 'Earn coins by completing tasks and unlocking achievements. Accumulate coins to unlock more perks!',
    economy_statAchievements: 'Achievements',
    economy_tabDaily: 'Daily',
    economy_tabOnce: 'Once',
    economy_tabTotal: 'Total',
    economy_tabPerks: 'Perks',
    economy_congratsCoupon: 'Congratulations!',
    economy_shareTitle: 'Mibu Gacha Win!',
    economy_shareCopied: 'Copied',
    economy_share: 'Share',
    economy_collect: 'Collect',
    economy_couponExpiry: 'Exp: {month}/{day}',
    economy_shareTextTemplate: '🎰 I got a【{tier}】coupon from Mibu Gacha!\n🎁 {couponName}\n📍 {placeName}\n\nCome play ➜ https://mibu.app',

    // ========== Crowdfunding ==========
    crowdfunding_title: 'Unlock World Map',
    crowdfunding_loadFailed: 'Load Failed',
    crowdfunding_loadFailedDesc: 'Failed to load crowdfunding campaigns. Please try again later.',
    crowdfunding_statUnlocked: 'Unlocked',
    crowdfunding_statFundraising: 'Fundraising',
    crowdfunding_statComing: 'Coming',
    crowdfunding_availableRegions: 'Available Regions',
    crowdfunding_fundraising: 'Fundraising',
    crowdfunding_comingSoon: 'Coming Soon',
    crowdfunding_stayTuned: 'Stay Tuned',
    crowdfunding_noProjects: 'No crowdfunding projects',
    crowdfunding_stayTunedDesc: 'Stay tuned for new regions to explore',
    crowdfunding_myContributions: 'My Contributions',
    crowdfunding_totalContributions: 'Total',
    crowdfunding_supportVision: 'Support Our Vision',
    crowdfunding_statusUnlocked: 'Unlocked',
    crowdfunding_statusFundraising: 'Fundraising',
    crowdfunding_statusComingSoon: 'Coming Soon',
    crowdfunding_statusStayTuned: 'Stay Tuned',

    // ========== Favorites ==========
    favorites_title: 'My Favorites',
    favorites_removeFavorite: 'Remove Favorite',
    favorites_confirmRemove: 'Remove "{name}" from favorites?',
    favorites_remove: 'Remove',
    favorites_error: 'Error',
    favorites_removeFailed: 'Failed to remove favorite',
    favorites_addedAt: 'Added ',
    favorites_totalCount: '{count} favorites',
    favorites_noFavorites: 'No favorites yet',
    favorites_tapToAdd: 'Tap the heart icon in your collection to add favorites',

    // ========== Collection ==========
    collection_myCollection: 'My Collection',
    collection_newPlaces: '{count} new places',
    collection_collected: 'Collected',
    collection_cities: 'Cities',
    collection_categories: 'Categories',
    collection_searchPlaceholder: 'Search places...',
    collection_clearSearch: 'Clear search',
    collection_resultsFound: '{count} results found',
    collection_noMatching: 'No matching places',
    collection_all: 'All',
    collection_loadFailed: 'Failed to load collection',
    collection_loadFailedDetail: 'Please check your connection and try again',
    collection_pleaseLogin: 'Please Login',
    collection_loginForFavorite: 'Login to use favorites',
    collection_addedToFavorites: 'Added to Favorites',
    collection_addedToFavoritesDesc: '{name} has been added to favorites',
    collection_operationFailed: 'Failed',
    collection_tryAgainLater: 'Please try again later',
    collection_loginForBlacklist: 'Login to use blacklist',
    collection_addToBlacklist: 'Add to Blacklist',
    collection_confirmBlacklist: 'Are you sure you want to blacklist "{name}"?\nThis place will not appear in future gacha pulls.',
    collection_addedToBlacklist: 'Added to Blacklist',
    collection_addedToBlacklistDesc: '{name} has been blacklisted',
    collection_addToFavorites: 'Add to favorites',
    collection_closeDetails: 'Close details',
    collection_viewOnMap: 'View on map',

    // ========== Gacha (extra) ==========
    gacha_startGachaExcl: 'Start Gacha!',
    gacha_tierSP: 'SUPER RARE',
    gacha_tierSSR: 'ULTRA RARE',
    gacha_tierSR: 'RARE',
    gacha_tierS: 'SPECIAL',
    gacha_tierR: 'REGULAR',
    gacha_rateLimited: 'Too many requests. Please wait a moment.',
    gacha_loginRequired: 'Login Required',
    gacha_loginRequiredDesc: 'Please login to use the gacha feature',
    gacha_goToLogin: 'Login',
    gacha_noPlacesInArea: 'No places available in this area. Please try another region.',
    gacha_generationFailed: 'Failed to generate itinerary. Please try again.',
    gacha_loadRegionsFailed: 'Failed to load regions',
    gacha_loadRegionsRetry: 'Please check your connection and try again',
    gacha_selectExploreRegion: 'Select Region',
    gacha_countryLabel: 'Country',
    gacha_cityRegionLabel: 'City/Region',
    gacha_pullCountLabel: 'Pull Count',
    gacha_dailyLimitInfo: 'Daily limit: 36 pulls',
    gacha_pullUnit: 'pulls',
    gacha_itemBoxFull: 'Item Box Full',
    gacha_itemBoxFullDesc: 'Please clear some items first',
    gacha_goTo: 'Go',
    gacha_slotsRemaining: '{count} slots remaining',
    gacha_probabilityInfo: 'Probability Info',
    gacha_rareCoupons: 'SP/SSR Rare Coupons',
    gacha_noRareCoupons: 'No rare coupons in this region',

    // ========== Crowdfunding ==========
    crowdfunding_loadFailedDetail: 'Failed to load campaign details',
    crowdfunding_notFound: 'Campaign not found',
    crowdfunding_goBack: 'Go Back',
    crowdfunding_raised: 'Raised',
    crowdfunding_backers: 'Backers',
    crowdfunding_daysLeft: 'Days Left',
    crowdfunding_goal: 'Goal: ',
    crowdfunding_youBacked: 'You backed ',
    crowdfunding_about: 'About',
    crowdfunding_rewardTiers: 'Reward Tiers',
    crowdfunding_updates: 'Updates',
    crowdfunding_soldOut: 'Sold Out',
    crowdfunding_remaining: '{count} left',
    crowdfunding_selectTier: 'Select a Tier',
    crowdfunding_selectTierDesc: 'Please select a reward tier first',
    crowdfunding_testMode: 'Test Mode',
    crowdfunding_testModeDesc: 'You selected "{tier}" tier ({amount})\n\nReal purchase will be enabled after launch.',
    crowdfunding_simulateSuccess: 'Simulate Success',
    crowdfunding_thankYou: 'Thank you!',
    crowdfunding_thankYouDesc: 'Thank you for your support!',
    crowdfunding_thankYouDescFull: 'Thank you for your support! Your contribution has been processed.',
    crowdfunding_purchaseFailed: 'Purchase Failed',
    crowdfunding_purchaseFailedDesc: 'Could not complete purchase. Please try again.',
    crowdfunding_purchaseError: 'An error occurred during purchase. Please try again.',
    crowdfunding_processing: 'Processing...',
    crowdfunding_backAmount: 'Back {amount}',
    crowdfunding_selectATier: 'Select a Tier',

    // ========== Referral ==========
    referral_inviteFriends: 'Invite Friends',
    referral_myCode: 'My Referral Code',
    referral_copy: 'Copy',
    referral_share: 'Share',
    referral_generateTitle: 'Generate Your Code',
    referral_generateSubtitle: 'Share with friends and earn rewards together',
    referral_generateNow: 'Generate Now',
    referral_generateError: 'Failed to generate code',
    referral_copied: 'Copied!',
    referral_copiedDesc: 'Code copied to clipboard',
    referral_shareMessage: 'Use my code {code} to join Mibu and discover new travel experiences! Download: https://mibu.app',
    referral_invited: 'Invited',
    referral_successful: 'Successful',
    referral_xpEarned: 'XP Earned',
    referral_howItWorks: 'How It Works',
    referral_step1Title: 'Share Your Code',
    referral_step1Desc: 'Copy and share your unique referral code',
    referral_step2Title: 'Friend Signs Up',
    referral_step2Desc: 'Your friend registers using your code',
    referral_step3Title: 'Both Earn Rewards',
    referral_step3Desc: 'You and your friend each earn 50 XP',
    referral_weeklyLeaderboard: 'Weekly Leaderboard',
    referral_you: 'You',
    referral_noRanking: 'No ranking data yet',
    referral_beFirst: 'Be the first to invite friends!',
    referral_yourRank: 'Your current rank: #{rank}',
    referral_inviteRewards: 'Invite Rewards',
    referral_inviteCount: 'Invite {count} friends',
    referral_achieved: 'Done',
    referral_remaining: '{count} more',
    referral_enterCode: "Enter Friend's Code",
    referral_enterCodeHint: 'Have a referral code? Enter to earn rewards',
    referral_enterCodePlaceholder: 'Enter code',
    referral_invalidCode: 'Invalid Code',
    referral_invalidCodeDesc: 'This code is not valid',
    referral_applySuccess: 'Success!',
    referral_applySuccessDesc: 'Referral code applied! You earned {amount} coins',
    referral_applyError: 'Failed to apply code',
    referral_inviteHistory: 'Invite History',

    // ========== Contribution ==========
    contribution_title: 'Contributions',
    contribution_tabReport: 'Report',
    contribution_tabSuggest: 'Suggest',
    contribution_tabVote: 'Vote',
    contribution_loadFailed: 'Load Failed',
    contribution_loadFailedDesc: 'Failed to load contribution data. Please try again later.',
    contribution_reportFeature: 'Report Feature',
    contribution_reportFeatureDesc: 'Please use the "Report" button on place cards in your collection',
    contribution_reportClosure: 'Report Closure',
    contribution_reportClosureDesc: 'Earn coins by helping update place info',
    contribution_myReports: 'My Reports',
    contribution_noReports: 'No reports yet',
    contribution_statusPending: 'Pending',
    contribution_statusVerified: 'Verified',
    contribution_statusRejected: 'Rejected',
    contribution_suggestFeature: 'Suggest Feature',
    contribution_suggestFeatureDesc: 'Place suggestion feature coming soon',
    contribution_suggestPlace: 'Suggest a Place',
    contribution_suggestPlaceDesc: 'Earn coins by recommending great places',
    contribution_mySuggestions: 'My Suggestions',
    contribution_noSuggestions: 'No suggestions yet',
    contribution_statusVoting: 'Voting',
    contribution_statusApproved: 'Approved',
    contribution_voteInfo: 'Reach Lv.7 to participate in community voting',
    contribution_exclusionVotes: 'Exclusion Votes',
    contribution_newPlaceReviews: 'New Place Reviews',
    contribution_exclude: 'Exclude',
    contribution_keep: 'Keep',
    contribution_approve: 'Approve',
    contribution_reject: 'Reject',
    contribution_voteSuccess: 'Vote Submitted',
    contribution_voteEarned: 'You earned {amount} coins',
    contribution_voteFailed: 'Vote Failed',
    contribution_voteTryAgain: 'Please try again',
    contribution_noPendingVotes: 'No pending votes',
    contribution_reasonClosed: 'Closed',
    contribution_reasonRelocated: 'Relocated',
    contribution_reasonWrongInfo: 'Wrong Info',
    contribution_reasonOther: 'Other',

    // ========== Itinerary ==========
    itinerary_addedToItinerary: 'Added to itinerary',
    itinerary_removedFromItinerary: 'Removed from itinerary',
    itinerary_aiUnavailable: 'Sorry, I cannot respond right now. Please try again later.',
    itinerary_removed: 'Removed "{name}"',
    itinerary_removeFailed: 'Failed to remove, please try again',
    itinerary_addPlacesFailed: 'Failed to add places, please try again',
    itinerary_reorderFailed: 'Reorder failed, please try again',
    itinerary_incomplete: 'Incomplete',
    itinerary_selectCountryCity: 'Please select country and city',
    itinerary_createFailed: 'Create Failed',
    itinerary_tryAgainLater: 'Please try again later',
    itinerary_networkError: 'Network error, please try again later',
    itinerary_updateFailed: 'Update failed',
    itinerary_deleteItineraries: 'Delete Itineraries',
    itinerary_deleteItinerariesConfirm: 'Are you sure you want to delete {count} itineraries? This cannot be undone.',
    itinerary_deleteItinerary: 'Delete Itinerary',
    itinerary_deleteItineraryConfirm: 'Are you sure you want to delete this itinerary? This cannot be undone.',
    itinerary_deleted: 'Deleted {count} itineraries',
    itinerary_deletedSingle: 'Itinerary deleted',
    itinerary_deleteFailed: 'Delete failed',
    itinerary_loginRequired: 'Login to use Trip Assistant',
    itinerary_noItineraries: 'No itineraries yet',
    itinerary_noItinerariesDesc: 'Create a trip and let AI plan for you',
    itinerary_tipAi: 'AI recommends spots',
    itinerary_tipPlanning: 'Auto daily planning',
    itinerary_tipNav: 'Real-time navigation',
    itinerary_createFirst: 'Create First Itinerary',
    itinerary_openList: 'Open itinerary list',
    itinerary_tripAssistant: 'Trip Assistant',
    itinerary_viewDetails: 'View itinerary details',
    itinerary_welcomeSubtitle: 'Tell me where you want to go',
    itinerary_helpText: "Tell me your preferences, I'll recommend places\nTap top-left for trip list, top-right for itinerary",
    itinerary_inputPlaceholder: 'Where do you want to go?',
    itinerary_sendMessage: 'Send message',
    itinerary_myTrips: 'My Trips',
    itinerary_tripsCount: 'trips',
    itinerary_selectMode: 'Select',
    itinerary_cancelSelect: 'Cancel selection',
    itinerary_selectItineraries: 'Select itineraries',
    itinerary_deleteSelected: 'Delete selected itineraries',
    itinerary_deleteCount: 'Delete {count}',
    itinerary_places: 'places',
    itinerary_newTrip: 'New Trip',
    itinerary_itinerary: 'Itinerary',
    itinerary_viewOnGoogleMaps: 'View on Google Maps',
    itinerary_addFromCollection: 'Add from Collection',
    itinerary_noPlaces: 'No places yet\nChat with AI to add some!',
    itinerary_addCount: 'Add ({count})',
    itinerary_searchPlaces: 'Search places...',
    itinerary_noMatchingPlaces: 'No matching places found',
    itinerary_noCollectionPlaces: 'No places in collection\nGo gacha to collect some!',
    itinerary_morePlaces: '{count} more places...',
    itinerary_newItinerary: 'New Itinerary',
    itinerary_tripTitle: 'Trip Title',
    itinerary_tripTitlePlaceholder: 'Name your trip (optional)',
    itinerary_date: 'Date',
    itinerary_country: 'Country',
    itinerary_countryPlaceholder: 'Country',
    itinerary_city: 'City',
    itinerary_cityPlaceholder: 'City',
    itinerary_createItinerary: 'Create Itinerary',
    // ---- Merchant 五大畫面遷移用 ----
    merchant_dashboard: 'Merchant Dashboard',
    merchant_editPlace: 'Edit Place',
    merchant_basicInfoReadonly: 'Basic Info (Read-only)',
    merchant_location: 'Location',
    merchant_editableInfo: 'Editable Info',
    merchant_description: 'Description',
    merchant_descriptionPlaceholder: 'Enter description...',
    merchant_googleMapUrl: 'Google Map URL',
    merchant_googleMapUrlPlaceholder: 'Paste Google Map URL',
    merchant_openingHours: 'Opening Hours',
    merchant_openingHoursPlaceholder: 'e.g., Mon-Fri 09:00-18:00',
    merchant_openingHoursHint: 'One time slot per line, e.g.:\nMon: 09:00-18:00\nTue: 09:00-18:00',
    merchant_promoSection: 'Promotion',
    merchant_promoTitle: 'Promo Title',
    merchant_promoTitlePlaceholder: 'e.g., 10% off for new customers',
    merchant_promoDescription: 'Promo Description',
    merchant_promoDescriptionPlaceholder: 'Enter promo details...',
    merchant_enablePromo: 'Enable Promotion',
    merchant_saving: 'Saving...',
    merchant_dailyCode: "Today's Verification Code",
    merchant_expiresAt: 'Valid until',
    merchant_creditBalance: 'Credit Balance',
    merchant_points: 'pts',
    merchant_topUp: 'Top Up',
    merchant_payStripe: 'Pay with Stripe',
    merchant_payRecur: 'Pay with Recur',
    merchant_purchaseCredits: 'Purchase Credits',
    merchant_min100: 'Minimum 100 points',
    merchant_demoCafe: 'Demo Cafe',
    merchant_transactionCreated: 'Transaction created',
    merchant_purchaseFailed: 'Purchase failed',
    merchant_analyticsDesc: 'View statistics and insights',
    merchant_storeManagement: 'Store Management',
    merchant_storeManagementDesc: 'Manage your store info',
    merchant_productManagementLabel: 'Product Management',
    merchant_productManagementDesc: 'Manage products and services',
    merchant_couponManagement: 'Coupon Management',
    merchant_couponManagementDesc: 'Create and manage coupons',
    merchant_merchantProfile: 'Merchant Profile',
    merchant_merchantProfileDesc: 'Edit basic merchant info',
    merchant_tierProbability: 'Draw Probability',
    merchant_claimNew: 'Claim New Place',
    merchant_loadPlacesFailed: 'Failed to load places',
    merchant_checkConnection: 'Please check your connection and try again',
    merchant_placeManagement: 'Place Management',
    merchant_accountStatus: 'Account Status',
    merchant_subscriptionPlan: 'Subscription Plan',
    merchant_freePlan: 'Free Plan',
    merchant_partnerPlan: 'Partner',
    merchant_premiumPlan: 'Premium',
    merchant_memberSince: 'Member Since',
    merchant_dangerZone: 'Danger Zone',
    merchant_confirmDeleteTitle: 'Confirm Delete Account',
    merchant_confirmDeleteMessage: 'This action cannot be undone. All your data will be permanently deleted. Are you sure you want to continue?',
    merchant_confirmDeleteBtn: 'Confirm Delete',
    merchant_deleteFailed: 'Delete failed, please try again later',
    merchant_deleteAccount: 'Delete Account',
    merchant_accountDeleted: 'Account deleted',
    merchant_searchFailedRetry: 'Search failed, please try again',
    merchant_validUntilWithFormat: 'Valid Until (YYYY-MM-DD)',

    // ========== SettingsScreen ==========
    settings_title: 'Settings',
    settings_account: 'Account',
    settings_profile: 'Profile',
    settings_language: 'Language',
    settings_about: 'About',
    settings_privacyPolicy: 'Privacy Policy',
    settings_termsOfService: 'Terms of Service',
    settings_helpCenter: 'Help Center',
    settings_admin: 'Admin',
    settings_globalExclusions: 'Global Exclusions',
    settings_accountManagement: 'Account Management',
    settings_logout: 'Logout',
    settings_deleteAccount: 'Delete Account',
    settings_selectLanguage: 'Select Language',
    settings_confirmLogout: 'Confirm Logout',
    settings_confirmLogoutDesc: 'Are you sure you want to logout?',
    settings_deleteAccountTitle: 'Delete Account',
    settings_deleteAccountDesc: 'Are you sure you want to delete your account? This action cannot be undone.',
    settings_cannotDelete: 'Cannot Delete',
    settings_deleteFailed: 'Delete failed, please try again',
    settings_deactivateMerchantFirst: 'Please deactivate merchant account first',
    settings_mergeAccounts: 'Merge Accounts',
    settings_mergeAccountsDesc: 'This feature merges data (collections, itineraries, achievements, etc.) from another account into your current account.\\n\\n⚠️ After merging, the secondary account will be disabled.',
    settings_continue: 'Continue',
    settings_loginSecondary: 'Login Secondary Account',
    settings_loginSecondaryDesc: 'Please login with the secondary account to verify your ownership.',
    settings_loginToMerge: 'Login account to merge',
    settings_merging: 'Merging...',
    settings_mergingDesc: 'Please wait while we merge your accounts',
    settings_mergeSuccess: 'Merge Successful!',
    settings_mergeFailed: 'Merge Failed',
    settings_mergeFailedRetry: 'Merge failed, please try again',
    settings_mergedData: 'Merged data:',
    settings_collections: 'Collections',
    settings_itineraries: 'Itineraries',
    settings_favorites: 'Favorites',
    settings_achievements: 'Achievements',
    settings_coins: 'Coins',
    settings_balance: 'Balance',
    settings_unknownError: 'An unknown error occurred',
    settings_pleaseLoginFirst: 'Please login first',

    // ========== ProfileScreen ==========
    profile_title: 'Profile',
    profile_save: 'Save',
    profile_uploading: 'Uploading...',
    profile_tapToChange: 'Tap to change avatar',
    profile_userId: 'User ID',
    profile_enterEmail: 'Enter email',
    profile_lastName: 'Last Name',
    profile_firstName: 'First Name',
    profile_enterLastName: 'Enter last name',
    profile_enterFirstName: 'Enter first name',
    profile_gender: 'Gender',
    profile_select: 'Select',
    profile_birthDate: 'Birth Date',
    profile_phone: 'Phone',
    profile_enterPhone: 'Enter phone number',
    profile_dietaryRestrictions: 'Dietary Restrictions',
    profile_dietaryPlaceholder: 'e.g., Vegetarian, Seafood allergy',
    profile_medicalHistory: 'Medical History',
    profile_medicalPlaceholder: 'e.g., Diabetes, Hypertension',
    profile_emergencyContact: 'Emergency Contact',
    profile_contactName: 'Name',
    profile_enterName: 'Enter name',
    profile_contactPhone: 'Phone',
    profile_enterContactPhone: 'Enter phone',
    profile_relationship: 'Relationship',
    profile_chooseAvatar: 'Choose Avatar',
    profile_uploadAvatar: 'Upload Custom Avatar',
    profile_profileUpdated: 'Profile updated successfully',
    profile_saveFailed: 'Failed to save, please try again',
    profile_loadFailed: 'Failed to load profile',
    profile_photoPermissionRequired: 'Photo library permission required',
    profile_cannotReadImage: 'Cannot read image data',
    profile_avatarUploaded: 'Avatar uploaded successfully',
    profile_uploadFailed: 'Upload failed',
    profile_uploadFailedRetry: 'Upload failed, please try again',
    profile_previewAvatar: 'Preview Avatar',
    profile_previewConfirm: 'Use This',
    profile_previewCancel: 'Choose Again',
    profile_genderMale: 'Male',
    profile_genderFemale: 'Female',
    profile_genderOther: 'Other',
    profile_relationSpouse: 'Spouse',
    profile_relationParent: 'Parent',
    profile_relationSibling: 'Sibling',
    profile_relationFriend: 'Friend',
    profile_relationOther: 'Other',

    // ========== AccountScreen ==========
    auth_linkedAccounts: 'Linked Accounts',
    auth_linkMultipleDesc: 'Link multiple accounts to sign in with different methods and secure your account.',
    auth_linkedAccountsSection: 'Linked Accounts',
    auth_noAccountsLinked: 'No accounts linked',
    auth_addAccount: 'Add Account',
    auth_linkApple: 'Link Apple',
    auth_signInApple: 'Sign in with Apple ID',
    auth_linkGoogle: 'Link Google',
    auth_signInGoogle: 'Sign in with Google',
    auth_allLinked: 'All available accounts linked',
    auth_linkSuccess: 'Linked!',
    auth_appleLinkSuccess: 'Apple account has been linked',
    auth_linkFailed: 'Link Failed',
    auth_appleLinkFailed: 'Failed to link Apple account',
    auth_comingSoon: 'Coming Soon',
    auth_googleComingSoon: 'Google linking will be available soon',
    auth_cannotUnlink: 'Cannot Unlink',
    auth_keepOneMethod: 'You must keep at least one login method',
    auth_cannotUnlinkPrimary: 'Cannot unlink primary login method. Please set another account as primary first.',
    auth_confirmUnlink: 'Confirm Unlink',
    auth_confirmUnlinkDesc: 'Are you sure you want to unlink your {provider} account?',
    auth_unlink: 'Unlink',
    auth_unlinkSuccess: 'Unlinked!',
    auth_unlinkSuccessDesc: 'Account has been unlinked',
    auth_unlinkFailed: 'Unlink Failed',
    auth_unlinkFailedRetry: 'Failed to unlink, please try again',
    auth_primary: 'Primary',
    auth_noEmailProvided: '(No email provided)',
    auth_linkedAt: 'Linked ',

    // ========== HomeScreen ==========
    home_greeting: 'Hi, Traveler!',
    home_greetingSubtitle: 'Where to explore today?',
    home_newsTab: 'News',
    home_localTab: 'Local',
    home_flashTab: 'Flash',
    home_noAnnouncements: 'No announcements',
    home_stayTuned: 'Stay tuned for updates!',
    home_noLocalActivities: 'No local activities',
    home_discoverNearby: 'Discover events near you!',
    home_noFlashEvents: 'No flash events',
    home_limitedOffersSoon: 'Limited offers coming soon!',
    home_loginStreak: 'Streak',
    home_days: 'd',
    home_specialistReady: 'Specialist Ready',
    home_dailyTasks: 'Daily Tasks',
    home_done: 'done',
    home_earned: 'Earned',
    home_coinsUnit: 'coins',
    home_titleLegendary: 'Legendary',
    home_titleExpert: 'Expert',
    home_titleTraveler: 'Traveler',
    home_titleExplorer: 'Explorer',
    home_titleNewbie: 'Newbie',
  },

  // ========== 日文 ==========
  'ja': {
    dailyLimitReached: '本日の上限に達しました',
    dailyLimitReachedDesc: '本日の抽選枠を使い切りました。また明日お越しください！',
    appTitle: 'MIBU 旅ガチャ',
    appSubtitle: 'AI トラベルガチャ',
    destination: '目的地',
    selectDestination: '目的地を選択',
    city: '都市',
    selectCity: '都市を選択',
    startGacha: 'ガチャを回す',
    generating: '生成中...',
    findingGems: '隠れた名店を探しています',
    tripLevel: 'Lv.{level} の旅',
    spotsCount: '{count} スポット',
    couponUnlocked: 'クーポン獲得',
    specialPromo: '限定プロモ',
    noCollection: 'コレクションはまだありません',
    startToCollect: 'ガチャを回してスポットを集めよう！',
    noCoupons: 'クーポンはまだありません',
    navHome: 'ホーム',
    navGacha: 'ガチャ',
    navGachaModule: '旅程ガチャ',
    navPlanner: 'プランナー',
    navPlannerModule: '旅行プランナー',
    navCollection: '図鑑',
    navMyBox: '道具箱',
    navItems: '道具箱',
    navSettings: '設定',
    navLocation: '位置',
    navItinerary: '旅程',
    navChat: 'チャット',
    navService: 'サービス',
    back: '戻る',
    loading: '読み込み中...',
    login: 'ログイン',
    signInReplit: 'Replitでログイン',
    guestLogin: 'ゲストログイン',
    welcomeBack: 'おかえりなさい',
    backToHome: 'ホームに戻る',
    catFood: 'グルメ',
    catStay: '宿泊',
    catScenery: '観光',
    catShopping: 'ショッピング',
    catEntertainment: 'エンタメ',
    catEducation: 'エコ文化',
    catExperience: '体験',
    relaxed: 'ゆったり',
    packed: '充実',
    selectCountry: '国を選択',
    selectRegion: '都市/地域を選択',
    itineraryPace: '行程のペース',
    stops: 'スポット',
    viewOnMap: 'Google マップで見る',
    rePull: '再ガチャ',
    places: 'スポット',
    myCollection: 'マイ図鑑',
    spots: 'スポット',
    announcements: 'お知らせ',
    flashEvents: 'フラッシュイベント',
    explore: '探索',
    shareLocationToPlanner: 'プランナーに位置を共有',
    yourLocation: 'あなたの位置',
    planner: 'プランナー',
    safetyCenter: '安全センター',
    safetyCenterDesc: '旅の安全を確保するため緊急SOSを設定',
    safety: '安全',
    setupEmergencySOS: '緊急SOSを設定',
    iosShortcutsIntegration: 'iOSショートカット連携',
    iosShortcutsDesc: '以下のリンクをiOSショートカットに追加して、Siriや自動化でSOSを素早く発信',
    webhookUrl: 'Webhook URL (POST)',
    notAvailable: 'リンクが取得できません',
    copyLink: 'リンクをコピー',
    copied: 'コピーしました',
    setupSteps: '設定手順：',
    step1: '1. iOSショートカットアプリを開く',
    step2: '2. 新しいショートカットを作成し「URLの内容を取得」を追加',
    step3: '3. 上記のWebhook URLを貼り付け',
    step4: '4. メソッドを「POST」に設定',
    step5: '5. Siri音声コマンドまたは自動化トリガーを設定',
    emergencyNow: '今すぐ緊急通報',
    emergencyNowDesc: 'ボタンを押すとすぐに緊急連絡先にSOSシグナルを送信します',
    sosButton: 'SOS緊急通報',
    confirmSOS: 'SOS確認',
    confirmSOSDesc: '緊急SOSシグナルを送信してもよろしいですか？',
    cancel: 'キャンセル',
    confirmSend: '送信確認',
    sent: '送信済み',
    sosSuccess: 'SOSシグナルが正常に送信されました',
    sendFailed: '送信失敗',
    tryAgainLater: '後でもう一度お試しください',
    networkError: 'ネットワークエラーです。接続を確認してください',
    gettingLocation: '位置を取得中...',
    locationPermissionRequired: 'この機能を使用するには位置情報の許可が必要です',
    unableToGetLocation: '位置を取得できません',
    retry: '再試行',
    viewPool: 'ガチャ確率を見る',
    poolPreview: 'ガチャプール',
    pullCount: '抽選回数',
    selectDistrict: 'エリアを選択',
    rareItems: 'レアアイテム',
    noRareItems: 'このエリアにはレアアイテムがありません',
    closeModal: '閉じる',
    pulls: '回',
    loadingPool: 'プール読み込み中...',
    merchant: '提携店舗',
    generatingItinerary: '旅程を生成中...',
    sponsorAd: 'スポンサー広告 (デモ)',
    pleaseWait: 'お待ちください',
    almostReady: 'もうすぐ完了',
    gachaResults: 'ガチャ結果',
    addToBackpack: 'リュックに追加',
    addedToBackpack: '追加しました！',
    gotCoupon: 'クーポン獲得！',
    partnerMerchant: '提携店舗',
    rating: '評価',
    noResults: 'まだ結果がありません',
    tryGachaFirst: 'まずガチャを回してみよう！',
    viewResults: '結果を見る',
    exploring: '探索中',
    reGacha: 'もう一度ガチャ',
    emptyItemBox: '道具箱は空です',
    collectItemsFirst: 'ガチャでスポットを集めよう！',
    totalItems: '合計',
    itemsCount: 'アイテム',

    // ========== 共通（画面横断） ==========
    common_error: 'エラー',
    common_confirm: 'OK',
    common_delete: '削除',
    common_save: '保存',
    common_edit: '編集',
    common_remove: '削除',
    common_done: '完了',
    common_submit: '送信',
    common_search: '検索',
    common_logout: 'ログアウト',
    common_success: '成功',
    common_loadFailed: '読み込み失敗',
    common_saveFailed: '保存失敗',
    common_deleteFailed: '削除失敗',
    common_createFailed: '作成失敗',
    common_updateFailed: '更新失敗',
    common_saveTryAgain: '保存に失敗しました。後でもう一度お試しください',
    common_notice: 'お知らせ',
    common_errorTryAgain: 'エラーが発生しました。もう一度お試しください。',
    common_noData: 'データなし',
    common_fillRequired: '必須項目を入力してください',
    common_confirmDelete: '削除確認',
    common_confirmLogout: 'ログアウト確認',
    common_confirmLogoutDesc: 'ログアウトしますか？',
    common_deleteAccount: 'アカウント削除',
    common_required: '必須',
    common_name: '名前',
    common_email: 'メール',
    common_password: 'パスワード',
    common_phone: '電話',
    common_address: '住所',
    common_status: 'ステータス',
    common_place: 'スポット',
    common_coupon: 'クーポン',
    common_pending: '審査中',
    common_approved: '承認済み',
    common_rejected: '拒否済み',
    common_active: '有効',
    common_inactive: '無効',
    common_verified: '認証済み',
    common_switchRole: '役割を切替',
    common_roleTraveler: '旅行者',
    common_roleMerchant: '店舗',
    common_roleSpecialist: 'スペシャリスト',
    common_roleAdmin: '管理者',
    common_skip: 'スキップ',
    common_back: '戻る',
    common_next: '次へ',
    common_getStarted: '始める',

    // ========== Admin ==========
    admin_title: '管理ダッシュボード',
    admin_pendingTab: '審査待ち',
    admin_usersTab: 'ユーザー',
    admin_draftsTab: '下書き',
    admin_exclusionsTab: '除外',
    admin_announcementsTab: 'お知らせ',
    admin_approve: '承認',
    admin_reject: '拒否',
    admin_publish: '公開',
    admin_noPending: '審査待ちのユーザーはいません',
    admin_merchant: '加盟店', /* TODO: ja */
    admin_specialist: 'Specialist', /* TODO: ja */
    admin_traveler: '旅行者',
    admin_admin: '管理者',
    admin_confirmApprove: 'このユーザーを承認しますか？',
    admin_confirmReject: 'このユーザーを拒否しますか？',
    admin_confirmPublish: 'この下書きを公開しますか？',
    admin_confirmDelete: '削除してもよろしいですか？',
    admin_penalty: 'ペナルティ',
    admin_goToAnnouncement: 'お知らせ管理へ',
    admin_announcementManage: 'お知らせ管理',
    admin_add: '追加',
    admin_type: 'タイプ',
    admin_titleLabel: 'タイトル',
    admin_contentLabel: '内容',
    admin_imageUrl: '画像URL',
    admin_linkUrl: 'リンクURL',
    admin_priority: '優先度',
    admin_noAnnouncements: 'お知らせはありません',
    admin_confirmDeleteAnnouncement: 'このお知らせを削除しますか？',
    admin_createAnnouncement: 'お知らせ作成',
    admin_editAnnouncement: 'お知らせ編集',
    admin_fillTitleContent: 'タイトルと内容を入力してください',
    admin_enterTitle: 'タイトルを入力',
    admin_enterContent: '内容を入力',
    admin_typeAnnouncement: 'お知らせ',
    admin_typeFlashEvent: 'フラッシュイベント',
    admin_typeHolidayEvent: '季節イベント',
    admin_startDateLabel: '開始日',
    admin_endDateLabel: '終了日',
    admin_isActiveLabel: '有効',
    admin_datePlaceholder: 'YYYY-MM-DD',

    // ========== スペシャリストモジュール ==========
    specialist_dashboard: 'Specialist Dashboard', /* TODO: ja */
    specialist_online: 'Online', /* TODO: ja */
    specialist_offline: 'Offline', /* TODO: ja */
    specialist_onlineStatus: 'Online Status', /* TODO: ja */
    specialist_activeServices: 'Active Services', /* TODO: ja */
    specialist_noServices: 'No active services', /* TODO: ja */
    specialist_since: 'Since', /* TODO: ja */
    specialist_region: 'Region', /* TODO: ja */
    specialist_activeTravelers: 'Active Travelers', /* TODO: ja */
    specialist_viewTravelers: 'View travelers being served', /* TODO: ja */
    specialist_liveTracking: 'Live Tracking', /* TODO: ja */
    specialist_viewTravelersOnMap: 'View travelers on map', /* TODO: ja */
    specialist_serviceHistory: 'Service History', /* TODO: ja */
    specialist_viewPastRecords: 'View past service records', /* TODO: ja */
    specialist_profile: 'Specialist Profile', /* TODO: ja */
    specialist_viewEditProfile: 'View and edit profile', /* TODO: ja */
    specialist_filterAll: 'All', /* TODO: ja */
    specialist_completed: 'Completed', /* TODO: ja */
    specialist_cancelled: 'Cancelled', /* TODO: ja */
    specialist_noHistory: 'No service history', /* TODO: ja */
    specialist_traveler: 'Traveler', /* TODO: ja */
    specialist_noActiveTravelers: 'No active travelers', /* TODO: ja */
    specialist_viewLocation: 'View Location', /* TODO: ja */
    specialist_connecting: 'Connecting...', /* TODO: ja */
    specialist_connected: 'Connected', /* TODO: ja */
    specialist_disconnected: 'Disconnected', /* TODO: ja */
    specialist_noLocations: 'No traveler locations yet', /* TODO: ja */
    specialist_lastUpdate: 'Last update', /* TODO: ja */

    // ========== ログインページ（OAuth） ==========
    auth_notMerchant: 'Not a Merchant', /* TODO: ja */
    auth_notMerchantDesc: 'Please register as a merchant first', /* TODO: ja */
    auth_notSpecialist: 'Not a Specialist', /* TODO: ja */
    auth_notSpecialistDesc: 'Please register as a specialist first', /* TODO: ja */
    auth_wrongPortal: 'Wrong Portal', /* TODO: ja */
    auth_wrongPortalDesc: 'Please switch to the correct portal', /* TODO: ja */
    auth_permissionDenied: 'Permission Denied', /* TODO: ja */
    auth_permissionDeniedDesc: 'You do not have permission', /* TODO: ja */
    auth_oauthLoginFailed: 'ログイン失敗',
    auth_loginError: 'ログインエラー',
    auth_tryAgainLater: '後でもう一度お試しください',
    auth_googleSignInFailed: 'Google ログインを完了できませんでした', /* TODO: ja */
    auth_appleSignInFailed: 'Apple ログインを完了できませんでした', /* TODO: ja */
    auth_cannotConnectServer: 'サーバーに接続できません', /* TODO: ja */
    auth_networkError: 'ネットワークエラー',
    auth_switchPortal: 'ポータル切替',
    auth_googleLogin: 'Googleログイン',
    auth_switchLanguage: '言語を切替',
    auth_switchTo: '切替先',
    auth_applicationSubmitted: '申請が送信されました！',
    auth_applicationReceivedMsg: '申請を受け付けました。すぐに処理いたします',
    auth_applicationApprovalNote: '承認後、通知が届きます。その後アカウントでログインできます',
    auth_backToLogin: 'ログインページに戻る',
    auth_registrationFailed: '登録失敗', /* TODO: ja */
    auth_registrationError: '登録に失敗しました。後でもう一度お試しください', /* TODO: ja */

    // ========== 加盟店登録（フォーム） ==========
    merchant_registration: '加盟店登録', /* TODO: ja */
    merchant_registrationSubtitle: 'Fill in your details to apply', /* TODO: ja */
    merchant_regOwnerName: 'Owner Name', /* TODO: ja */
    merchant_regOwnerNamePlaceholder: 'Enter owner name', /* TODO: ja */
    merchant_regBusinessName: 'Business Name', /* TODO: ja */
    merchant_regBusinessNamePlaceholder: 'Enter business name', /* TODO: ja */
    merchant_regTaxId: 'Tax ID (Optional)', /* TODO: ja */
    merchant_regTaxIdPlaceholder: 'Enter tax ID', /* TODO: ja */
    merchant_regBusinessCategory: 'Business Category', /* TODO: ja */
    merchant_regBusinessCategoryPlaceholder: 'Select business category', /* TODO: ja */
    merchant_regAddress: 'Business Address', /* TODO: ja */
    merchant_regAddressPlaceholder: 'Enter business address', /* TODO: ja */
    merchant_regPhone: 'Phone (Optional)', /* TODO: ja */
    merchant_regPhonePlaceholder: 'Enter phone number', /* TODO: ja */
    merchant_regMobile: 'Mobile', /* TODO: ja */
    merchant_regMobilePlaceholder: 'Enter mobile number', /* TODO: ja */
    merchant_regEmailPlaceholder: 'Enter email', /* TODO: ja */
    merchant_regSubmitReview: 'Submit for Review', /* TODO: ja */
    merchant_regSubmitting: 'Submitting...', /* TODO: ja */
    merchant_regSubmitSuccess: 'Submitted Successfully', /* TODO: ja */
    merchant_regSubmitSuccessMsg: 'Your application has been submitted.', /* TODO: ja */
    merchant_regSubmitFailed: 'Submission failed.', /* TODO: ja */
    merchant_regFillRequired: 'Please fill in all required fields', /* TODO: ja */
    merchant_regInvalidEmail: 'Please enter a valid email', /* TODO: ja */
    merchant_regCatRestaurant: 'Restaurant', /* TODO: ja */
    merchant_regCatHotel: 'Hotel', /* TODO: ja */
    merchant_regCatAttraction: 'Attraction', /* TODO: ja */
    merchant_regCatShopping: 'Shopping', /* TODO: ja */
    merchant_regCatTransportation: 'Transportation', /* TODO: ja */
    merchant_regCatExperience: 'Experience', /* TODO: ja */
    merchant_regCatCulture: 'Culture/Art', /* TODO: ja */
    merchant_regCatOther: 'Other', /* TODO: ja */
    merchant_regEmail: 'Email (Account)', /* TODO: ja */
    merchant_regPassword: 'Password (min 6 chars)', /* TODO: ja */
    merchant_regConfirmPassword: 'Confirm Password', /* TODO: ja */
    merchant_regContactName: 'Contact Name', /* TODO: ja */
    merchant_regIndustryCategory: 'Business Category', /* TODO: ja */
    merchant_regBusinessAddress: 'Business Address', /* TODO: ja */
    merchant_regOtherContact: 'Other Contact (Optional)', /* TODO: ja */
    merchant_regBackToLogin: 'Back to Login', /* TODO: ja */
    merchant_regSelectCategory: 'Select Category', /* TODO: ja */
    merchant_regEnterEmail: 'Please enter email', /* TODO: ja */
    merchant_regInvalidEmailFormat: 'Invalid email format', /* TODO: ja */
    merchant_regPasswordMinLength: 'Password must be at least 6 characters', /* TODO: ja */
    merchant_regPasswordMismatch: 'Passwords do not match', /* TODO: ja */
    merchant_regEnterBusinessName: 'Please enter business name', /* TODO: ja */
    merchant_regEnterContactName: 'Please enter contact name', /* TODO: ja */
    merchant_regSelectIndustry: 'Please select category', /* TODO: ja */
    merchant_regEnterAddress: 'Please enter address', /* TODO: ja */
    merchant_regContactNamePlaceholder: 'Enter contact name', /* TODO: ja */
    merchant_regTaxIdShort: 'Tax ID', /* TODO: ja */
    merchant_regLineOrPhone: 'LINE ID or Phone', /* TODO: ja */
    merchant_regCatRestaurantShort: 'Restaurant', /* TODO: ja */
    merchant_regCatHotelShort: 'Hotel', /* TODO: ja */
    merchant_regCatAttractionShort: 'Attraction', /* TODO: ja */
    merchant_regCatShoppingShort: 'Shopping', /* TODO: ja */
    merchant_regCatActivityShort: 'Activity', /* TODO: ja */
    merchant_regCatOtherShort: 'Other', /* TODO: ja */

    // ========== スペシャリスト登録 ==========
    specialist_registration: 'Specialist Registration', /* TODO: ja */
    specialist_emailAccount: 'Email (Account)', /* TODO: ja */
    specialist_passwordMin: 'Password (min 6 chars)', /* TODO: ja */
    specialist_confirmPassword: 'Confirm Password', /* TODO: ja */
    specialist_nameLabel: 'Name', /* TODO: ja */
    specialist_otherContact: 'Other Contact (Optional)', /* TODO: ja */
    specialist_serviceRegionOptional: 'Service Region (Optional)', /* TODO: ja */
    specialist_submitApplication: 'Submit Application', /* TODO: ja */
    specialist_backToLogin: 'Back to Login', /* TODO: ja */
    specialist_enterEmail: 'Please enter email', /* TODO: ja */
    specialist_invalidEmailFormat: 'Invalid email format', /* TODO: ja */
    specialist_passwordMinLength: 'Password must be at least 6 characters', /* TODO: ja */
    specialist_passwordMismatch: 'Passwords do not match', /* TODO: ja */
    specialist_enterName: 'Please enter name', /* TODO: ja */
    specialist_namePlaceholder: 'Enter your name', /* TODO: ja */
    specialist_regionPlaceholder: 'e.g., Taipei, Yilan', /* TODO: ja */
    specialist_lineOrPhone: 'LINE ID or Phone', /* TODO: ja */

    // ========== お気に入り/ブラックリスト ==========
    itinerary_favoritesAndBlacklist: 'Favorites & Blacklist', /* TODO: ja */
    itinerary_favorites: 'お気に入り',
    itinerary_blacklist: 'ブラックリスト',
    itinerary_removeFavorite: 'お気に入りから削除', /* TODO: ja */
    itinerary_removeFavoriteConfirm: 'お気に入りから削除しますか？', /* TODO: ja */
    itinerary_removeBlacklist: 'ブラックリストから削除', /* TODO: ja */
    itinerary_removeBlacklistConfirm: 'ブラックリストから削除しますか？', /* TODO: ja */
    itinerary_noFavorites: 'お気に入りはまだありません', /* TODO: ja */
    itinerary_addFavoritesHint: 'Add favorites from collection', /* TODO: ja */
    itinerary_noBlacklist: 'ブラックリストはまだありません', /* TODO: ja */
    itinerary_addBlacklistHint: 'Add items to blacklist', /* TODO: ja */
    itinerary_favoritesGachaHint: 'Favorite places appear more often in gacha', /* TODO: ja */
    itinerary_blacklistGachaHint: 'Blacklisted items will not appear in gacha', /* TODO: ja */

    // ========== イベント詳細 ==========
    common_eventNotFound: 'イベントが見つかりません', /* TODO: ja */
    common_goBack: '戻る',
    common_description: '説明',
    common_learnMore: '詳しく見る',
    event_announcement: 'お知らせ', /* TODO: ja */
    event_festival: 'フェスティバル', /* TODO: ja */
    event_limited: '期間限定イベント', /* TODO: ja */

    specialist_travelers: 'travelers', /* TODO: ja */
    specialist_mapNotAvailableWeb: 'Map not available on web', /* TODO: ja */
    specialist_mapRequiresNative: 'Map Area - requires react-native-maps', /* TODO: ja */
    specialist_travelerLocations: 'Traveler Locations', /* TODO: ja */
    specialist_accountStatus: 'Account Status', /* TODO: ja */
    specialist_available: 'Available', /* TODO: ja */
    specialist_unavailable: 'Unavailable', /* TODO: ja */
    specialist_currentlyServing: 'Currently Serving', /* TODO: ja */
    specialist_maxTravelers: 'Max Travelers', /* TODO: ja */
    specialist_serviceRegion: 'Service Region', /* TODO: ja */
    specialist_people: '', /* TODO: ja */

    // ========== SOS 緊急連絡先 ==========
    sos_emergencyContacts: '緊急連絡先',
    sos_limitReached: '上限に達しました',
    sos_limitReachedDesc: '緊急連絡先は最大{max}人まで登録できます', /* TODO: ja */
    sos_incomplete: '未入力', /* TODO: ja */
    sos_enterNamePhone: '名前と電話番号を入力してください', /* TODO: ja */
    sos_saveFailed: 'Failed to save contact', /* TODO: ja */
    sos_deleteContact: '連絡先を削除', /* TODO: ja */
    sos_deleteContactConfirm: '「{name}」を削除しますか？', /* TODO: ja */
    sos_deleteContactFailed: 'Failed to delete contact', /* TODO: ja */
    sos_noContacts: '緊急連絡先がありません', /* TODO: ja */
    sos_tapToAdd: '右上の + をタップして連絡先を追加', /* TODO: ja */
    sos_addContact: '連絡先を追加', /* TODO: ja */
    sos_editContact: '連絡先を編集', /* TODO: ja */
    sos_infoBanner: '最大{max}人の緊急連絡先を登録できます。SOS送信時に通知されます。', /* TODO: ja */
    sos_enterName: '名前を入力',
    sos_enterPhone: '電話番号を入力',
    sos_relationship: '関係',
    sos_relFamily: '家族',
    sos_relFriend: '友人',
    sos_relColleague: '同僚',
    sos_relOther: 'その他',

    // ========== SOS 緊急通報画面 ==========
    sos_emergencySOS: '緊急SOS',
    sos_holdToSend: 'ボタンを3秒間長押しするとSOSシグナルを送信します', /* TODO: ja */
    sos_hold3sec: '3秒長押し',
    sos_alertHistory: '通報履歴',
    sos_alertSent: 'SOSシグナルを送信しました',
    sos_willContactYou: 'できるだけ早くご連絡いたします', /* TODO: ja */
    sos_sendFailed: '送信失敗',
    sos_tryAgainLater: '後でもう一度お試しください',
    sos_confirmCancel: 'キャンセル確認',
    sos_confirmCancelDesc: 'この通報をキャンセルしますか？', /* TODO: ja */
    sos_no: 'いいえ',
    sos_yes: 'はい',
    sos_cancelFailed: 'キャンセル失敗', /* TODO: ja */
    sos_cancelAlert: '通報をキャンセル', /* TODO: ja */
    sos_featureLocked: 'SOS機能がロックされています', /* TODO: ja */
    sos_requirePurchase: '安全センターを利用するには旅行サービスの購入が必要です', /* TODO: ja */
    sos_purchaseService: 'サービスを購入', /* TODO: ja */
    sos_statusPending: '処理待ち',
    sos_statusAcknowledged: '確認済み',
    sos_statusResolved: '解決済み',
    sos_statusCancelled: 'キャンセル済み',

    // ========== Auth ログイン/登録 ==========
    auth_signIn: 'ログイン',
    auth_signUp: '新規登録',
    auth_username: 'アカウント（メール）',
    auth_password: 'パスワード',
    auth_name: '名前',
    auth_selectRole: '役割を選択',
    auth_noAccount: 'アカウントをお持ちでない方',
    auth_hasAccount: 'すでにアカウントをお持ちの方',
    auth_guestLogin: 'ゲストとして続行',
    auth_guestNote: 'ゲストモードではデータはローカルにのみ保存されます',
    auth_pendingApproval: '店舗・スペシャリストアカウントは管理者の承認が必要です', /* TODO: ja */
    auth_loginFailed: 'ログインに失敗しました。認証情報を確認してください',
    auth_registerFailed: '登録に失敗しました。後でもう一度お試しください',
    auth_enterUsernamePassword: 'アカウントとパスワードを入力してください', /* TODO: ja */
    auth_fillAllFields: 'すべての項目を入力してください', /* TODO: ja */
    auth_roleTraveler: '旅行者',
    auth_roleMerchant: '店舗', /* TODO: ja */
    auth_roleSpecialist: 'Specialist', /* TODO: ja */

    // ========== Auth 審査待ち ==========
    auth_pendingTitle: '審査待ち',
    auth_pendingSubtitle: 'アカウントは管理者の審査を待っています', /* TODO: ja */
    auth_pendingDescription: '店舗・スペシャリストアカウントは承認後にすべての機能をご利用いただけます。', /* TODO: ja */
    auth_appliedRole: '申請した役割', /* TODO: ja */

    // ========== Merchant ==========
    merchant_productMgmt: 'Product Management', /* TODO: ja */
    merchant_myProducts: 'My Products', /* TODO: ja */
    merchant_noProducts: 'No products yet', /* TODO: ja */
    merchant_addProduct: 'Add Product', /* TODO: ja */
    merchant_productName: 'Product Name', /* TODO: ja */
    merchant_productDesc: 'Description', /* TODO: ja */
    merchant_price: 'Price', /* TODO: ja */
    merchant_discountPrice: 'Discount Price', /* TODO: ja */
    merchant_activeStatus: 'Active', /* TODO: ja */
    merchant_inactiveStatus: 'Inactive', /* TODO: ja */
    merchant_deleteProductConfirm: 'Delete this product?', /* TODO: ja */
    merchant_deleted: 'Deleted', /* TODO: ja */
    merchant_saved: 'Saved', /* TODO: ja */
    merchant_couponAddTitle: 'Add Coupon', /* TODO: ja */
    merchant_couponEditTitle: 'Edit Coupon', /* TODO: ja */
    merchant_couponName: 'Coupon Name', /* TODO: ja */
    merchant_couponNamePlaceholder: 'e.g. 10% Off', /* TODO: ja */
    merchant_rarityTier: 'Rarity Tier', /* TODO: ja */
    merchant_tierHint: 'Higher tier = lower draw rate', /* TODO: ja */
    merchant_discountContent: 'Discount Content', /* TODO: ja */
    merchant_discountContentPlaceholder: 'Describe the discount...', /* TODO: ja */
    merchant_terms: 'Terms & Conditions', /* TODO: ja */
    merchant_termsPlaceholder: 'Usage restrictions (optional)', /* TODO: ja */
    merchant_quantity: 'Quantity', /* TODO: ja */
    merchant_quantityHint: 'Total coupons to distribute', /* TODO: ja */
    merchant_validUntil: 'Valid Until', /* TODO: ja */
    merchant_validUntilHint: 'Leave empty for no expiration', /* TODO: ja */
    merchant_activateNow: 'Activate Now', /* TODO: ja */
    merchant_saveSuccess: 'Saved successfully', /* TODO: ja */
    merchant_notice: 'Notice', /* TODO: ja */
    merchant_addPlace: 'Add New Place', /* TODO: ja */
    merchant_addPlaceSubtitle: 'Fill in your place information', /* TODO: ja */
    merchant_placeName: 'Place Name', /* TODO: ja */
    merchant_placeNamePlaceholder: 'Enter place name', /* TODO: ja */
    merchant_category: 'Category', /* TODO: ja */
    merchant_selectCategory: 'Select category', /* TODO: ja */
    merchant_district: 'District', /* TODO: ja */
    merchant_districtPlaceholder: "e.g. Da'an District", /* TODO: ja */
    merchant_city: 'City', /* TODO: ja */
    merchant_cityPlaceholder: 'e.g. Taipei', /* TODO: ja */
    merchant_placeAddress: 'Address', /* TODO: ja */
    merchant_addressPlaceholder: 'Full address', /* TODO: ja */
    merchant_placeDesc: 'Description', /* TODO: ja */
    merchant_placeDescPlaceholder: 'Brief introduction of your place...', /* TODO: ja */
    merchant_submitApplication: 'Submit', /* TODO: ja */
    merchant_applicationSubmitted: 'Application submitted! We will review it soon.', /* TODO: ja */
    merchant_submitError: 'Submit failed, please try again', /* TODO: ja */
    merchant_catFood: 'Food', /* TODO: ja */
    merchant_catStay: 'Stay', /* TODO: ja */
    merchant_catScenery: 'Scenery', /* TODO: ja */
    merchant_catShopping: 'Shopping', /* TODO: ja */
    merchant_catEntertainment: 'Entertainment', /* TODO: ja */
    merchant_catEducation: 'Education', /* TODO: ja */
    merchant_analytics: 'Analytics', /* TODO: ja */
    merchant_overview: 'Overview', /* TODO: ja */
    merchant_totalExposures: 'Total Exposures', /* TODO: ja */
    merchant_totalCollectors: 'Total Collectors', /* TODO: ja */
    merchant_couponIssued: 'Coupons Issued', /* TODO: ja */
    merchant_couponRedeemed: 'Coupons Redeemed', /* TODO: ja */
    merchant_redemptionRate: 'Redemption Rate', /* TODO: ja */
    merchant_topCoupons: 'Top Coupons', /* TODO: ja */
    merchant_placeBreakdown: 'Place Breakdown', /* TODO: ja */
    merchant_allPlaces: 'All Places', /* TODO: ja */
    merchant_selectPlace: 'Select Place', /* TODO: ja */
    merchant_noDataYet: 'No data', /* TODO: ja */
    merchant_times: 'times', /* TODO: ja */
    merchant_people: 'people', /* TODO: ja */
    merchant_issued: 'Issued', /* TODO: ja */
    merchant_redeemed: 'Redeemed', /* TODO: ja */
    merchant_collectionCount: 'Collections', /* TODO: ja */
    merchant_7days: '7 Days', /* TODO: ja */
    merchant_30days: '30 Days', /* TODO: ja */
    merchant_90days: '90 Days', /* TODO: ja */
    merchant_allPeriod: 'All', /* TODO: ja */
    merchant_couponMgmt: 'Coupon Management', /* TODO: ja */
    merchant_couponMgmtSubtitle: 'Create and manage your coupons', /* TODO: ja */
    merchant_addCoupon: 'Add Coupon', /* TODO: ja */
    merchant_noCoupons: 'No coupons yet', /* TODO: ja */
    merchant_noCouponsHint: 'Start creating your first coupon', /* TODO: ja */
    merchant_remaining: 'Remaining', /* TODO: ja */
    merchant_couponActive: 'Active', /* TODO: ja */
    merchant_couponInactive: 'Inactive', /* TODO: ja */
    merchant_couponExpired: 'Expired', /* TODO: ja */
    merchant_confirmDeleteCoupon: 'Delete this coupon?', /* TODO: ja */
    merchant_deleteSuccess: 'Deleted successfully', /* TODO: ja */
    merchant_drawRate: 'Draw rate', /* TODO: ja */
    merchant_couponValidUntil: 'Valid until', /* TODO: ja */
    merchant_couponLoadFailed: 'Failed to load coupons', /* TODO: ja */
    merchant_couponLoadFailedDetail: 'Please check your connection and try again', /* TODO: ja */
    merchant_verifyTitle: 'Verify Code', /* TODO: ja */
    merchant_merchantIdLabel: 'Merchant ID', /* TODO: ja */
    merchant_merchantIdPlaceholder: 'Enter Merchant ID', /* TODO: ja */
    merchant_codeLabel: 'Verification Code', /* TODO: ja */
    merchant_codePlaceholder: 'Enter code', /* TODO: ja */
    merchant_verify: 'Verify', /* TODO: ja */
    merchant_verifying: 'Verifying...', /* TODO: ja */
    merchant_verifyValid: 'Valid', /* TODO: ja */
    merchant_verifyInvalid: 'Invalid', /* TODO: ja */
    merchant_errorEmpty: 'Please enter merchant ID and code', /* TODO: ja */
    merchant_tryAgain: 'Try Again', /* TODO: ja */
    merchant_merchantIdMustBeNumber: 'Merchant ID must be a number', /* TODO: ja */
    merchant_codeValid: 'Code is valid', /* TODO: ja */
    merchant_codeInvalid: 'Code is invalid', /* TODO: ja */
    merchant_verifyFailed: 'Verification failed', /* TODO: ja */
    merchant_claimTitle: 'Claim Place', /* TODO: ja */
    merchant_claimSubtitle: 'Search and claim your place', /* TODO: ja */
    merchant_searchPlaceholder: 'Enter place name...', /* TODO: ja */
    merchant_claim: 'Claim', /* TODO: ja */
    merchant_claimed: 'Claimed', /* TODO: ja */
    merchant_noSearchResults: 'No matching places found', /* TODO: ja */
    merchant_noResultsHint: 'Try other keywords, or add your own place', /* TODO: ja */
    merchant_addNewPlace: 'Add New Place', /* TODO: ja */
    merchant_claimSuccess: 'Claimed successfully!', /* TODO: ja */
    merchant_claimFailed: 'Claim failed', /* TODO: ja */
    merchant_searchHint: 'Enter place name to search', /* TODO: ja */
    merchant_searchFailed: 'Search failed', /* TODO: ja */
    merchant_myPlaces: 'My Places', /* TODO: ja */
    merchant_myPlacesSubtitle: 'Manage your claimed places', /* TODO: ja */
    merchant_noPlaces: 'No places claimed yet', /* TODO: ja */
    merchant_noPlacesHint: 'Start claiming or adding your places', /* TODO: ja */
    merchant_claimExisting: 'Claim Existing Place', /* TODO: ja */
    merchant_placesCount: '{n} place(s)', /* TODO: ja */
    merchant_transactionHistory: 'Transaction History', /* TODO: ja */
    merchant_noTransactions: 'No transactions yet', /* TODO: ja */
    merchant_purchase: 'Purchase', /* TODO: ja */
    merchant_usage: 'Usage', /* TODO: ja */
    merchant_refund: 'Refund', /* TODO: ja */
    merchant_appFormTitle: 'Merchant Application', /* TODO: ja */
    merchant_appFormSubtitle: 'Fill in the details below. Review takes 1-3 business days.', /* TODO: ja */
    merchant_ownerName: 'Owner Name *', /* TODO: ja */
    merchant_businessName: 'Business Name *', /* TODO: ja */
    merchant_taxId: 'Tax ID', /* TODO: ja */
    merchant_businessCategoryLabel: 'Business Category *', /* TODO: ja */
    merchant_merchantPhone: 'Phone', /* TODO: ja */
    merchant_merchantMobile: 'Mobile *', /* TODO: ja */
    merchant_contactEmail: 'Contact Email *', /* TODO: ja */
    merchant_submitAppForm: 'Submit Application', /* TODO: ja */
    merchant_requiredFields: 'Please fill all required fields', /* TODO: ja */
    merchant_submitSuccess: 'Application submitted. Awaiting review.', /* TODO: ja */
    merchant_submitFailed: 'Submission failed. Please try again.', /* TODO: ja */
    merchant_enterOwnerName: 'Enter owner name', /* TODO: ja */
    merchant_enterBusinessName: 'Enter business name', /* TODO: ja */
    merchant_enterAddress: 'Enter business address', /* TODO: ja */
    merchant_optional: 'Optional', /* TODO: ja */
    merchant_catRestaurant: 'Restaurant', /* TODO: ja */
    merchant_catRetail: 'Retail', /* TODO: ja */
    merchant_catHotel: 'Hotel', /* TODO: ja */
    merchant_catService: 'Service', /* TODO: ja */
    merchant_catOther: 'Other', /* TODO: ja */
    merchant_catAttraction: 'Attraction/Entertainment', /* TODO: ja */
    merchant_catTransportation: 'Transportation', /* TODO: ja */
    merchant_catExperience: 'Experience/Activity', /* TODO: ja */
    merchant_catCulture: 'Culture/Art', /* TODO: ja */

    // ========== Crowdfunding ==========
    crowdfunding_title: 'ワールドマップを解放', /* TODO: ja */
    crowdfunding_loadFailed: '読み込み失敗', /* TODO: ja */
    crowdfunding_loadFailedDesc: 'クラウドファンディングの読み込みに失敗しました', /* TODO: ja */
    crowdfunding_statUnlocked: '解放済み', /* TODO: ja */
    crowdfunding_statFundraising: '募集中', /* TODO: ja */
    crowdfunding_statComing: '近日公開', /* TODO: ja */
    crowdfunding_availableRegions: '利用可能な地域', /* TODO: ja */
    crowdfunding_fundraising: '募集中', /* TODO: ja */
    crowdfunding_comingSoon: '近日公開', /* TODO: ja */
    crowdfunding_stayTuned: 'お楽しみに', /* TODO: ja */
    crowdfunding_noProjects: '現在進行中のプロジェクトはありません', /* TODO: ja */
    crowdfunding_stayTunedDesc: '新しい地域の公開をお楽しみに', /* TODO: ja */
    crowdfunding_myContributions: '支援履歴', /* TODO: ja */
    crowdfunding_totalContributions: '累計支援額', /* TODO: ja */
    crowdfunding_supportVision: '私たちのビジョンを応援', /* TODO: ja */
    crowdfunding_statusUnlocked: 'Unlocked', /* TODO: ja */
    crowdfunding_statusFundraising: 'Fundraising', /* TODO: ja */
    crowdfunding_statusComingSoon: 'Coming Soon', /* TODO: ja */
    crowdfunding_statusStayTuned: 'Stay Tuned', /* TODO: ja */
    crowdfunding_loadFailedDetail: 'Failed to load campaign details', /* TODO: ja */
    crowdfunding_notFound: 'Campaign not found', /* TODO: ja */
    crowdfunding_goBack: 'Go Back', /* TODO: ja */
    crowdfunding_raised: 'Raised', /* TODO: ja */
    crowdfunding_backers: 'Backers', /* TODO: ja */
    crowdfunding_daysLeft: 'Days Left', /* TODO: ja */
    crowdfunding_goal: 'Goal: ', /* TODO: ja */
    crowdfunding_youBacked: 'You backed ', /* TODO: ja */
    crowdfunding_about: 'About', /* TODO: ja */
    crowdfunding_rewardTiers: 'Reward Tiers', /* TODO: ja */
    crowdfunding_updates: 'Updates', /* TODO: ja */
    crowdfunding_soldOut: 'Sold Out', /* TODO: ja */
    crowdfunding_remaining: '{count} left', /* TODO: ja */
    crowdfunding_selectTier: 'Select a Tier', /* TODO: ja */
    crowdfunding_selectTierDesc: 'Please select a reward tier first', /* TODO: ja */
    crowdfunding_testMode: 'Test Mode', /* TODO: ja */
    crowdfunding_testModeDesc: 'You selected "{tier}" tier ({amount})\n\nReal purchase will be enabled after launch.', /* TODO: ja */
    crowdfunding_simulateSuccess: 'Simulate Success', /* TODO: ja */
    crowdfunding_thankYou: 'Thank you!', /* TODO: ja */
    crowdfunding_thankYouDesc: 'Thank you for your support!', /* TODO: ja */
    crowdfunding_thankYouDescFull: 'Thank you for your support! Your contribution has been processed.', /* TODO: ja */
    crowdfunding_purchaseFailed: 'Purchase Failed', /* TODO: ja */
    crowdfunding_purchaseFailedDesc: 'Could not complete purchase. Please try again.', /* TODO: ja */
    crowdfunding_purchaseError: 'An error occurred during purchase. Please try again.', /* TODO: ja */
    crowdfunding_processing: 'Processing...', /* TODO: ja */
    crowdfunding_backAmount: 'Back {amount}', /* TODO: ja */
    crowdfunding_selectATier: 'Select a Tier', /* TODO: ja */

    // ========== Referral ==========
    referral_inviteFriends: 'Invite Friends', /* TODO: ja */
    referral_myCode: 'My Referral Code', /* TODO: ja */
    referral_copy: 'Copy', /* TODO: ja */
    referral_share: 'Share', /* TODO: ja */
    referral_generateTitle: 'Generate Your Code', /* TODO: ja */
    referral_generateSubtitle: 'Share with friends and earn rewards together', /* TODO: ja */
    referral_generateNow: 'Generate Now', /* TODO: ja */
    referral_generateError: 'Failed to generate code', /* TODO: ja */
    referral_copied: 'Copied!', /* TODO: ja */
    referral_copiedDesc: 'Code copied to clipboard', /* TODO: ja */
    referral_shareMessage: 'Use my code {code} to join Mibu and discover new travel experiences! Download: https://mibu.app', /* TODO: ja */
    referral_invited: 'Invited', /* TODO: ja */
    referral_successful: 'Successful', /* TODO: ja */
    referral_xpEarned: 'XP Earned', /* TODO: ja */
    referral_howItWorks: 'How It Works', /* TODO: ja */
    referral_step1Title: 'Share Your Code', /* TODO: ja */
    referral_step1Desc: 'Copy and share your unique referral code', /* TODO: ja */
    referral_step2Title: 'Friend Signs Up', /* TODO: ja */
    referral_step2Desc: 'Your friend registers using your code', /* TODO: ja */
    referral_step3Title: 'Both Earn Rewards', /* TODO: ja */
    referral_step3Desc: 'You and your friend each earn 50 XP', /* TODO: ja */
    referral_weeklyLeaderboard: 'Weekly Leaderboard', /* TODO: ja */
    referral_you: 'You', /* TODO: ja */
    referral_noRanking: 'No ranking data yet', /* TODO: ja */
    referral_beFirst: 'Be the first to invite friends!', /* TODO: ja */
    referral_yourRank: 'Your current rank: #{rank}', /* TODO: ja */
    referral_inviteRewards: 'Invite Rewards', /* TODO: ja */
    referral_inviteCount: 'Invite {count} friends', /* TODO: ja */
    referral_achieved: 'Done', /* TODO: ja */
    referral_remaining: '{count} more', /* TODO: ja */
    referral_enterCode: "Enter Friend's Code", /* TODO: ja */
    referral_enterCodeHint: 'Have a referral code? Enter to earn rewards', /* TODO: ja */
    referral_enterCodePlaceholder: 'Enter code', /* TODO: ja */
    referral_invalidCode: 'Invalid Code', /* TODO: ja */
    referral_invalidCodeDesc: 'This code is not valid', /* TODO: ja */
    referral_applySuccess: 'Success!', /* TODO: ja */
    referral_applySuccessDesc: 'Referral code applied! You earned {amount} coins', /* TODO: ja */
    referral_applyError: 'Failed to apply code', /* TODO: ja */
    referral_inviteHistory: 'Invite History', /* TODO: ja */

    // ========== Contribution ==========
    contribution_title: 'Contributions', /* TODO: ja */
    contribution_tabReport: 'Report', /* TODO: ja */
    contribution_tabSuggest: 'Suggest', /* TODO: ja */
    contribution_tabVote: 'Vote', /* TODO: ja */
    contribution_loadFailed: 'Load Failed', /* TODO: ja */
    contribution_loadFailedDesc: 'Failed to load contribution data. Please try again later.', /* TODO: ja */
    contribution_reportFeature: 'Report Feature', /* TODO: ja */
    contribution_reportFeatureDesc: 'Please use the "Report" button on place cards in your collection', /* TODO: ja */
    contribution_reportClosure: 'Report Closure', /* TODO: ja */
    contribution_reportClosureDesc: 'Earn coins by helping update place info', /* TODO: ja */
    contribution_myReports: 'My Reports', /* TODO: ja */
    contribution_noReports: 'No reports yet', /* TODO: ja */
    contribution_statusPending: 'Pending', /* TODO: ja */
    contribution_statusVerified: 'Verified', /* TODO: ja */
    contribution_statusRejected: 'Rejected', /* TODO: ja */
    contribution_suggestFeature: 'Suggest Feature', /* TODO: ja */
    contribution_suggestFeatureDesc: 'Place suggestion feature coming soon', /* TODO: ja */
    contribution_suggestPlace: 'Suggest a Place', /* TODO: ja */
    contribution_suggestPlaceDesc: 'Earn coins by recommending great places', /* TODO: ja */
    contribution_mySuggestions: 'My Suggestions', /* TODO: ja */
    contribution_noSuggestions: 'No suggestions yet', /* TODO: ja */
    contribution_statusVoting: 'Voting', /* TODO: ja */
    contribution_statusApproved: 'Approved', /* TODO: ja */
    contribution_voteInfo: 'Reach Lv.7 to participate in community voting', /* TODO: ja */
    contribution_exclusionVotes: 'Exclusion Votes', /* TODO: ja */
    contribution_newPlaceReviews: 'New Place Reviews', /* TODO: ja */
    contribution_exclude: 'Exclude', /* TODO: ja */
    contribution_keep: 'Keep', /* TODO: ja */
    contribution_approve: 'Approve', /* TODO: ja */
    contribution_reject: 'Reject', /* TODO: ja */
    contribution_voteSuccess: 'Vote Submitted', /* TODO: ja */
    contribution_voteEarned: 'You earned {amount} coins', /* TODO: ja */
    contribution_voteFailed: 'Vote Failed', /* TODO: ja */
    contribution_voteTryAgain: 'Please try again', /* TODO: ja */
    contribution_noPendingVotes: 'No pending votes', /* TODO: ja */
    contribution_reasonClosed: 'Closed', /* TODO: ja */
    contribution_reasonRelocated: 'Relocated', /* TODO: ja */
    contribution_reasonWrongInfo: 'Wrong Info', /* TODO: ja */
    contribution_reasonOther: 'Other', /* TODO: ja */

    // ========== Itinerary ==========
    itinerary_addedToItinerary: 'Added to itinerary', /* TODO: ja */
    itinerary_removedFromItinerary: 'Removed from itinerary', /* TODO: ja */
    itinerary_aiUnavailable: 'Sorry, I cannot respond right now. Please try again later.', /* TODO: ja */
    itinerary_removed: 'Removed "{name}"', /* TODO: ja */
    itinerary_removeFailed: 'Failed to remove, please try again', /* TODO: ja */
    itinerary_addPlacesFailed: 'Failed to add places, please try again', /* TODO: ja */
    itinerary_reorderFailed: 'Reorder failed, please try again', /* TODO: ja */
    itinerary_incomplete: 'Incomplete', /* TODO: ja */
    itinerary_selectCountryCity: 'Please select country and city', /* TODO: ja */
    itinerary_createFailed: 'Create Failed', /* TODO: ja */
    itinerary_tryAgainLater: 'Please try again later', /* TODO: ja */
    itinerary_networkError: 'Network error, please try again later', /* TODO: ja */
    itinerary_updateFailed: 'Update failed', /* TODO: ja */
    itinerary_deleteItineraries: 'Delete Itineraries', /* TODO: ja */
    itinerary_deleteItinerariesConfirm: 'Are you sure you want to delete {count} itineraries? This cannot be undone.', /* TODO: ja */
    itinerary_deleteItinerary: 'Delete Itinerary', /* TODO: ja */
    itinerary_deleteItineraryConfirm: 'Are you sure you want to delete this itinerary? This cannot be undone.', /* TODO: ja */
    itinerary_deleted: 'Deleted {count} itineraries', /* TODO: ja */
    itinerary_deletedSingle: 'Itinerary deleted', /* TODO: ja */
    itinerary_deleteFailed: 'Delete failed', /* TODO: ja */
    itinerary_loginRequired: 'Login to use Trip Assistant', /* TODO: ja */
    itinerary_noItineraries: 'No itineraries yet', /* TODO: ja */
    itinerary_noItinerariesDesc: 'Create a trip and let AI plan for you', /* TODO: ja */
    itinerary_tipAi: 'AI recommends spots', /* TODO: ja */
    itinerary_tipPlanning: 'Auto daily planning', /* TODO: ja */
    itinerary_tipNav: 'Real-time navigation', /* TODO: ja */
    itinerary_createFirst: 'Create First Itinerary', /* TODO: ja */
    itinerary_openList: 'Open itinerary list', /* TODO: ja */
    itinerary_tripAssistant: 'Trip Assistant', /* TODO: ja */
    itinerary_viewDetails: 'View itinerary details', /* TODO: ja */
    itinerary_welcomeSubtitle: 'Tell me where you want to go', /* TODO: ja */
    itinerary_helpText: "Tell me your preferences, I'll recommend places\nTap top-left for trip list, top-right for itinerary", /* TODO: ja */
    itinerary_inputPlaceholder: 'Where do you want to go?', /* TODO: ja */
    itinerary_sendMessage: 'Send message', /* TODO: ja */
    itinerary_myTrips: 'My Trips', /* TODO: ja */
    itinerary_tripsCount: 'trips', /* TODO: ja */
    itinerary_selectMode: 'Select', /* TODO: ja */
    itinerary_cancelSelect: 'Cancel selection', /* TODO: ja */
    itinerary_selectItineraries: 'Select itineraries', /* TODO: ja */
    itinerary_deleteSelected: 'Delete selected itineraries', /* TODO: ja */
    itinerary_deleteCount: 'Delete {count}', /* TODO: ja */
    itinerary_places: 'places', /* TODO: ja */
    itinerary_newTrip: 'New Trip', /* TODO: ja */
    itinerary_itinerary: 'Itinerary', /* TODO: ja */
    itinerary_viewOnGoogleMaps: 'View on Google Maps', /* TODO: ja */
    itinerary_addFromCollection: 'Add from Collection', /* TODO: ja */
    itinerary_noPlaces: 'No places yet\nChat with AI to add some!', /* TODO: ja */
    itinerary_addCount: 'Add ({count})', /* TODO: ja */
    itinerary_searchPlaces: 'Search places...', /* TODO: ja */
    itinerary_noMatchingPlaces: 'No matching places found', /* TODO: ja */
    itinerary_noCollectionPlaces: 'No places in collection\nGo gacha to collect some!', /* TODO: ja */
    itinerary_morePlaces: '{count} more places...', /* TODO: ja */
    itinerary_newItinerary: 'New Itinerary', /* TODO: ja */
    itinerary_tripTitle: 'Trip Title', /* TODO: ja */
    itinerary_tripTitlePlaceholder: 'Name your trip (optional)', /* TODO: ja */
    itinerary_date: 'Date', /* TODO: ja */
    itinerary_country: 'Country', /* TODO: ja */
    itinerary_countryPlaceholder: 'Country', /* TODO: ja */
    itinerary_city: 'City', /* TODO: ja */
    itinerary_cityPlaceholder: 'City', /* TODO: ja */
    itinerary_createItinerary: 'Create Itinerary', /* TODO: ja */
    // ========== Economy ==========
    economy_achievementsTitle: 'Achievements', /* TODO: ja */
    economy_loadFailed: 'Load Failed', /* TODO: ja */
    economy_loadFailedDesc: 'Unable to load economy data. Please try again later.', /* TODO: ja */
    economy_beginnerTasks: 'Beginner Tasks', /* TODO: ja */
    economy_done: 'done', /* TODO: ja */
    economy_achievementProgress: 'Achievement Progress', /* TODO: ja */
    economy_unlocked: 'unlocked', /* TODO: ja */
    economy_noAchievements: 'No achievements yet', /* TODO: ja */
    economy_myPerks: 'My Perks', /* TODO: ja */
    economy_dailyPullLimit: 'Daily Pull Limit', /* TODO: ja */
    economy_pullsPerDay: 'Number of pulls per day', /* TODO: ja */
    economy_inventorySlots: 'Inventory Slots', /* TODO: ja */
    economy_itemsCanHold: 'Number of items you can hold', /* TODO: ja */
    economy_specialistEligibility: 'Specialist Eligibility', /* TODO: ja */
    economy_canApplyNow: 'You can apply now!', /* TODO: ja */
    economy_unlockRequirement: 'Unlock by earning 1,500 coins and "Veteran Traveler" achievement', /* TODO: ja */
    economy_aboutCoins: 'About Coins', /* TODO: ja */
    economy_coinsInfo: 'Earn coins by completing tasks and unlocking achievements. Accumulate coins to unlock more perks!', /* TODO: ja */
    economy_statAchievements: 'Achievements', /* TODO: ja */
    economy_tabDaily: 'Daily', /* TODO: ja */
    economy_tabOnce: 'Once', /* TODO: ja */
    economy_tabTotal: 'Total', /* TODO: ja */
    economy_tabPerks: 'Perks', /* TODO: ja */
    economy_congratsCoupon: 'Congratulations!', /* TODO: ja */
    economy_shareTitle: 'Mibu Gacha Win!', /* TODO: ja */
    economy_shareCopied: 'Copied', /* TODO: ja */
    economy_share: 'Share', /* TODO: ja */
    economy_collect: 'Collect', /* TODO: ja */
    economy_couponExpiry: 'Exp: {month}/{day}', /* TODO: ja */
    economy_shareTextTemplate: '🎰 I got a【{tier}】coupon from Mibu Gacha!\n🎁 {couponName}\n📍 {placeName}\n\nCome play ➜ https://mibu.app', /* TODO: ja */
    favorites_title: 'My Favorites', /* TODO: ja */
    favorites_removeFavorite: 'Remove Favorite', /* TODO: ja */
    favorites_confirmRemove: 'Remove "{name}" from favorites?', /* TODO: ja */
    favorites_remove: 'Remove', /* TODO: ja */
    favorites_error: 'Error', /* TODO: ja */
    favorites_removeFailed: 'Failed to remove favorite', /* TODO: ja */
    favorites_addedAt: 'Added ', /* TODO: ja */
    favorites_totalCount: '{count} favorites', /* TODO: ja */
    favorites_noFavorites: 'No favorites yet', /* TODO: ja */
    favorites_tapToAdd: 'Tap the heart icon in your collection to add favorites', /* TODO: ja */
    collection_myCollection: 'My Collection', /* TODO: ja */
    collection_newPlaces: '{count} new places', /* TODO: ja */
    collection_collected: 'Collected', /* TODO: ja */
    collection_cities: 'Cities', /* TODO: ja */
    collection_categories: 'Categories', /* TODO: ja */
    collection_searchPlaceholder: 'Search places...', /* TODO: ja */
    collection_clearSearch: 'Clear search', /* TODO: ja */
    collection_resultsFound: '{count} results found', /* TODO: ja */
    collection_noMatching: 'No matching places', /* TODO: ja */
    collection_all: 'All', /* TODO: ja */
    collection_loadFailed: 'Failed to load collection', /* TODO: ja */
    collection_loadFailedDetail: 'Please check your connection and try again', /* TODO: ja */
    collection_pleaseLogin: 'Please Login', /* TODO: ja */
    collection_loginForFavorite: 'Login to use favorites', /* TODO: ja */
    collection_addedToFavorites: 'Added to Favorites', /* TODO: ja */
    collection_addedToFavoritesDesc: '{name} has been added to favorites', /* TODO: ja */
    collection_operationFailed: 'Failed', /* TODO: ja */
    collection_tryAgainLater: 'Please try again later', /* TODO: ja */
    collection_loginForBlacklist: 'Login to use blacklist', /* TODO: ja */
    collection_addToBlacklist: 'Add to Blacklist', /* TODO: ja */
    collection_confirmBlacklist: 'Are you sure you want to blacklist "{name}"?\nThis place will not appear in future gacha pulls.', /* TODO: ja */
    collection_addedToBlacklist: 'Added to Blacklist', /* TODO: ja */
    collection_addedToBlacklistDesc: '{name} has been blacklisted', /* TODO: ja */
    collection_addToFavorites: 'Add to favorites', /* TODO: ja */
    collection_closeDetails: 'Close details', /* TODO: ja */
    collection_viewOnMap: 'View on map', /* TODO: ja */
    gacha_startGachaExcl: 'Start Gacha!', /* TODO: ja */
    gacha_tierSP: 'SUPER RARE', /* TODO: ja */
    gacha_tierSSR: 'ULTRA RARE', /* TODO: ja */
    gacha_tierSR: 'RARE', /* TODO: ja */
    gacha_tierS: 'SPECIAL', /* TODO: ja */
    gacha_tierR: 'REGULAR', /* TODO: ja */
    gacha_rateLimited: 'リクエストが多すぎます。しばらくお待ちください。',
    gacha_loginRequired: 'ログインが必要です',
    gacha_loginRequiredDesc: 'ガチャ機能を使用するにはログインが必要です',
    gacha_goToLogin: 'ログイン',
    gacha_noPlacesInArea: 'このエリアにスポットがありません。他の地域をお試しください。',
    gacha_generationFailed: '旅程の生成に失敗しました。もう一度お試しください。',
    gacha_loadRegionsFailed: '地域データの読み込みに失敗しました',
    gacha_loadRegionsRetry: 'ネットワーク接続を確認してもう一度お試しください',
    gacha_selectExploreRegion: '探索エリアを選択',
    gacha_countryLabel: '国',
    gacha_cityRegionLabel: '都市/地域',
    gacha_pullCountLabel: 'ガチャ回数',
    gacha_dailyLimitInfo: '1日最大36回まで',
    gacha_pullUnit: '回',
    gacha_itemBoxFull: '道具箱がいっぱいです',
    gacha_itemBoxFullDesc: '先にアイテムを整理してください',
    gacha_goTo: '移動',
    gacha_slotsRemaining: '残り{count}枠',
    gacha_probabilityInfo: '確率説明',
    gacha_rareCoupons: 'SP/SSR レアクーポン',
    gacha_noRareCoupons: 'このエリアにはレアクーポンがありません',
    // ---- Merchant 五大畫面遷移用 ----
    merchant_dashboard: 'Merchant Dashboard', /* TODO: ja */
    merchant_editPlace: 'Edit Place', /* TODO: ja */
    merchant_basicInfoReadonly: 'Basic Info (Read-only)', /* TODO: ja */
    merchant_location: 'Location', /* TODO: ja */
    merchant_editableInfo: 'Editable Info', /* TODO: ja */
    merchant_description: 'Description', /* TODO: ja */
    merchant_descriptionPlaceholder: 'Enter description...', /* TODO: ja */
    merchant_googleMapUrl: 'Google Map URL', /* TODO: ja */
    merchant_googleMapUrlPlaceholder: 'Paste Google Map URL', /* TODO: ja */
    merchant_openingHours: 'Opening Hours', /* TODO: ja */
    merchant_openingHoursPlaceholder: 'e.g., Mon-Fri 09:00-18:00', /* TODO: ja */
    merchant_openingHoursHint: 'One time slot per line', /* TODO: ja */
    merchant_promoSection: 'Promotion', /* TODO: ja */
    merchant_promoTitle: 'Promo Title', /* TODO: ja */
    merchant_promoTitlePlaceholder: 'e.g., 10% off for new customers', /* TODO: ja */
    merchant_promoDescription: 'Promo Description', /* TODO: ja */
    merchant_promoDescriptionPlaceholder: 'Enter promo details...', /* TODO: ja */
    merchant_enablePromo: 'Enable Promotion', /* TODO: ja */
    merchant_saving: 'Saving...', /* TODO: ja */
    merchant_dailyCode: "Today's Verification Code", /* TODO: ja */
    merchant_expiresAt: 'Valid until', /* TODO: ja */
    merchant_creditBalance: 'Credit Balance', /* TODO: ja */
    merchant_points: 'pts', /* TODO: ja */
    merchant_topUp: 'Top Up', /* TODO: ja */
    merchant_payStripe: 'Pay with Stripe', /* TODO: ja */
    merchant_payRecur: 'Pay with Recur', /* TODO: ja */
    merchant_purchaseCredits: 'Purchase Credits', /* TODO: ja */
    merchant_min100: 'Minimum 100 points', /* TODO: ja */
    merchant_demoCafe: 'Demo Cafe', /* TODO: ja */
    merchant_transactionCreated: 'Transaction created', /* TODO: ja */
    merchant_purchaseFailed: 'Purchase failed', /* TODO: ja */
    merchant_analyticsDesc: 'View statistics and insights', /* TODO: ja */
    merchant_storeManagement: 'Store Management', /* TODO: ja */
    merchant_storeManagementDesc: 'Manage your store info', /* TODO: ja */
    merchant_productManagementLabel: 'Product Management', /* TODO: ja */
    merchant_productManagementDesc: 'Manage products and services', /* TODO: ja */
    merchant_couponManagement: 'Coupon Management', /* TODO: ja */
    merchant_couponManagementDesc: 'Create and manage coupons', /* TODO: ja */
    merchant_merchantProfile: 'Merchant Profile', /* TODO: ja */
    merchant_merchantProfileDesc: 'Edit basic merchant info', /* TODO: ja */
    merchant_tierProbability: 'Draw Probability', /* TODO: ja */
    merchant_claimNew: 'Claim New Place', /* TODO: ja */
    merchant_loadPlacesFailed: 'Failed to load places', /* TODO: ja */
    merchant_checkConnection: 'Please check your connection and try again', /* TODO: ja */
    merchant_placeManagement: 'Place Management', /* TODO: ja */
    merchant_accountStatus: 'Account Status', /* TODO: ja */
    merchant_subscriptionPlan: 'Subscription Plan', /* TODO: ja */
    merchant_freePlan: 'Free Plan', /* TODO: ja */
    merchant_partnerPlan: 'Partner', /* TODO: ja */
    merchant_premiumPlan: 'Premium', /* TODO: ja */
    merchant_memberSince: 'Member Since', /* TODO: ja */
    merchant_dangerZone: 'Danger Zone', /* TODO: ja */
    merchant_confirmDeleteTitle: 'Confirm Delete Account', /* TODO: ja */
    merchant_confirmDeleteMessage: 'This action cannot be undone. All your data will be permanently deleted.', /* TODO: ja */
    merchant_confirmDeleteBtn: 'Confirm Delete', /* TODO: ja */
    merchant_deleteFailed: 'Delete failed, please try again later', /* TODO: ja */
    merchant_deleteAccount: 'Delete Account', /* TODO: ja */
    merchant_accountDeleted: 'Account deleted', /* TODO: ja */
    merchant_searchFailedRetry: 'Search failed, please try again', /* TODO: ja */
    merchant_validUntilWithFormat: 'Valid Until (YYYY-MM-DD)', /* TODO: ja */

    // ========== SettingsScreen ==========
    settings_title: '設定',
    settings_account: 'アカウント',
    settings_profile: 'プロフィール',
    settings_language: '言語',
    settings_about: 'このアプリについて',
    settings_privacyPolicy: 'プライバシーポリシー',
    settings_termsOfService: '利用規約',
    settings_helpCenter: 'ヘルプセンター',
    settings_admin: '管理者',
    settings_globalExclusions: 'Global Exclusions', /* TODO: ja */
    settings_accountManagement: 'Account Management', /* TODO: ja */
    settings_logout: 'ログアウト',
    settings_deleteAccount: 'アカウント削除',
    settings_selectLanguage: '言語を選択',
    settings_confirmLogout: 'ログアウト確認',
    settings_confirmLogoutDesc: 'ログアウトしますか？',
    settings_deleteAccountTitle: 'アカウント削除',
    settings_deleteAccountDesc: 'Delete your account? This cannot be undone.', /* TODO: ja */
    settings_cannotDelete: 'Cannot Delete', /* TODO: ja */
    settings_deleteFailed: 'Delete failed, please try again', /* TODO: ja */
    settings_deactivateMerchantFirst: 'Please deactivate merchant account first', /* TODO: ja */
    settings_mergeAccounts: 'Merge Accounts', /* TODO: ja */
    settings_mergeAccountsDesc: 'Merge Accounts', /* TODO: ja */
    settings_continue: '続行',
    settings_loginSecondary: 'Login Secondary Account', /* TODO: ja */
    settings_loginSecondaryDesc: 'Login Secondary Account', /* TODO: ja */
    settings_loginToMerge: 'Login account to merge', /* TODO: ja */
    settings_merging: 'Merging...', /* TODO: ja */
    settings_mergingDesc: 'Please wait while we merge your accounts', /* TODO: ja */
    settings_mergeSuccess: 'Merge Successful!', /* TODO: ja */
    settings_mergeFailed: 'Merge Failed', /* TODO: ja */
    settings_mergeFailedRetry: 'Merge failed, please try again', /* TODO: ja */
    settings_mergedData: 'Merged data:', /* TODO: ja */
    settings_collections: '図鑑',
    settings_itineraries: '旅程',
    settings_favorites: 'お気に入り',
    settings_achievements: '実績',
    settings_coins: 'コイン',
    settings_balance: '残高',
    settings_unknownError: 'An unknown error occurred', /* TODO: ja */
    settings_pleaseLoginFirst: 'Please login first', /* TODO: ja */

    // ========== ProfileScreen ==========
    profile_title: 'プロフィール',
    profile_save: '保存',
    profile_uploading: 'アップロード中...',
    profile_tapToChange: 'タップしてアバターを変更',
    profile_userId: 'ユーザーID',
    profile_enterEmail: 'Enter email', /* TODO: ja */
    profile_lastName: '姓',
    profile_firstName: '名',
    profile_enterLastName: 'Enter last name', /* TODO: ja */
    profile_enterFirstName: 'Enter first name', /* TODO: ja */
    profile_gender: '性別',
    profile_select: '選択',
    profile_birthDate: '生年月日',
    profile_phone: '電話番号',
    profile_enterPhone: 'Enter phone number', /* TODO: ja */
    profile_dietaryRestrictions: '食事制限',
    profile_dietaryPlaceholder: 'e.g., Vegetarian, Seafood allergy', /* TODO: ja */
    profile_medicalHistory: '病歴',
    profile_medicalPlaceholder: 'e.g., Diabetes, Hypertension', /* TODO: ja */
    profile_emergencyContact: '緊急連絡先',
    profile_contactName: '名前',
    profile_enterName: 'Enter name', /* TODO: ja */
    profile_contactPhone: '電話',
    profile_enterContactPhone: 'Enter phone', /* TODO: ja */
    profile_relationship: '関係',
    profile_chooseAvatar: 'アバターを選択',
    profile_uploadAvatar: 'Upload Custom Avatar', /* TODO: ja */
    profile_profileUpdated: 'Profile updated', /* TODO: ja */
    profile_saveFailed: 'Failed to save', /* TODO: ja */
    profile_loadFailed: 'Failed to load profile', /* TODO: ja */
    profile_photoPermissionRequired: 'Photo library permission required', /* TODO: ja */
    profile_cannotReadImage: 'Cannot read image data', /* TODO: ja */
    profile_avatarUploaded: 'Avatar uploaded', /* TODO: ja */
    profile_uploadFailed: 'Upload failed', /* TODO: ja */
    profile_uploadFailedRetry: 'Upload failed, please try again', /* TODO: ja */
    profile_previewAvatar: 'アバタープレビュー',
    profile_previewConfirm: '使用する',
    profile_previewCancel: '選び直す',
    profile_genderMale: '男性',
    profile_genderFemale: '女性',
    profile_genderOther: 'その他',
    profile_relationSpouse: '配偶者',
    profile_relationParent: '親',
    profile_relationSibling: '兄弟姉妹',
    profile_relationFriend: '友人',
    profile_relationOther: 'その他',

    // ========== AccountScreen ==========
    auth_linkedAccounts: 'Linked Accounts', /* TODO: ja */
    auth_linkMultipleDesc: 'Link multiple accounts', /* TODO: ja */
    auth_linkedAccountsSection: 'Linked Accounts', /* TODO: ja */
    auth_noAccountsLinked: 'No accounts linked', /* TODO: ja */
    auth_addAccount: 'Add Account', /* TODO: ja */
    auth_linkApple: 'Link Apple', /* TODO: ja */
    auth_signInApple: 'Sign in with Apple ID', /* TODO: ja */
    auth_linkGoogle: 'Link Google', /* TODO: ja */
    auth_signInGoogle: 'Sign in with Google', /* TODO: ja */
    auth_allLinked: 'All accounts linked', /* TODO: ja */
    auth_linkSuccess: 'Linked!', /* TODO: ja */
    auth_appleLinkSuccess: 'Apple account linked', /* TODO: ja */
    auth_linkFailed: 'Link Failed', /* TODO: ja */
    auth_appleLinkFailed: 'Failed to link Apple', /* TODO: ja */
    auth_comingSoon: 'Coming Soon', /* TODO: ja */
    auth_googleComingSoon: 'Google linking coming soon', /* TODO: ja */
    auth_cannotUnlink: 'Cannot Unlink', /* TODO: ja */
    auth_keepOneMethod: 'Keep at least one login method', /* TODO: ja */
    auth_cannotUnlinkPrimary: 'Cannot unlink primary method', /* TODO: ja */
    auth_confirmUnlink: 'Confirm Unlink', /* TODO: ja */
    auth_confirmUnlinkDesc: 'Unlink {provider} account?', /* TODO: ja */
    auth_unlink: 'Unlink', /* TODO: ja */
    auth_unlinkSuccess: 'Unlinked!', /* TODO: ja */
    auth_unlinkSuccessDesc: 'Account unlinked', /* TODO: ja */
    auth_unlinkFailed: 'Unlink Failed', /* TODO: ja */
    auth_unlinkFailedRetry: 'Failed to unlink', /* TODO: ja */
    auth_primary: 'Primary', /* TODO: ja */
    auth_noEmailProvided: '(No email)', /* TODO: ja */
    auth_linkedAt: 'Linked ', /* TODO: ja */

    // ========== HomeScreen ==========
    home_greeting: 'こんにちは、旅行者！',
    home_greetingSubtitle: '今日はどこを探索しますか？',
    home_newsTab: 'お知らせ',
    home_localTab: 'ローカル',
    home_flashTab: '限定',
    home_noAnnouncements: 'お知らせはありません',
    home_stayTuned: '最新情報をお待ちください！',
    home_noLocalActivities: 'No local activities', /* TODO: ja */
    home_discoverNearby: 'Discover events near you!', /* TODO: ja */
    home_noFlashEvents: 'No flash events', /* TODO: ja */
    home_limitedOffersSoon: 'Limited offers coming soon!', /* TODO: ja */
    home_loginStreak: '連続ログイン',
    home_days: '日',
    home_specialistReady: 'Specialist Ready', /* TODO: ja */
    home_dailyTasks: 'デイリータスク',
    home_done: '完了',
    home_earned: '獲得',
    home_coinsUnit: 'コイン',
    home_titleLegendary: 'レジェンド',
    home_titleExpert: 'エキスパート',
    home_titleTraveler: 'トラベラー',
    home_titleExplorer: 'エクスプローラー',
    home_titleNewbie: 'ビギナー',
  },

  // ========== 韓文 ==========
  'ko': {
    dailyLimitReached: '일일 한도 도달',
    dailyLimitReachedDesc: '오늘의 뽑기 한도가 모두 소진되었습니다. 내일 다시 와주세요!',
    appTitle: 'MIBU 트립',
    appSubtitle: 'AI 여행 가챠',
    destination: '목적지',
    selectDestination: '목적지 선택',
    city: '도시',
    selectCity: '도시 선택',
    startGacha: '가챠 시작',
    generating: '생성 중...',
    findingGems: '숨겨진 명소를 찾는 중',
    tripLevel: 'Lv.{level} 여행',
    spotsCount: '{count}개 장소',
    couponUnlocked: '쿠폰 획득',
    specialPromo: '특별 프로모션',
    noCollection: '아직 컬렉션이 없습니다.',
    startToCollect: '가챠를 돌려 장소를 수집하세요!',
    noCoupons: '아직 쿠폰이 없습니다.',
    navHome: '홈',
    navGacha: '가챠',
    navGachaModule: '여행 가챠',
    navPlanner: '플래너',
    navPlannerModule: '여행 플래너',
    navCollection: '도감',
    navMyBox: '보관함',
    navItems: '보관함',
    navSettings: '설정',
    navLocation: '위치',
    navItinerary: '일정',
    navChat: '채팅',
    navService: '서비스',
    back: '뒤로',
    loading: '로딩 중...',
    login: '로그인',
    signInReplit: 'Replit으로 로그인',
    guestLogin: '게스트 로그인',
    welcomeBack: '환영합니다',
    backToHome: '홈으로 돌아가기',
    catFood: '맛집',
    catStay: '숙박',
    catScenery: '관광',
    catShopping: '쇼핑',
    catEntertainment: '엔터테인먼트',
    catEducation: '에코문화',
    catExperience: '체험',
    relaxed: '여유로운',
    packed: '알찬',
    selectCountry: '국가 선택',
    selectRegion: '도시/지역 선택',
    itineraryPace: '일정 페이스',
    stops: '스톱',
    viewOnMap: 'Google 지도에서 보기',
    rePull: '다시 뽑기',
    places: '장소',
    myCollection: '내 도감',
    spots: '장소',
    announcements: '공지사항',
    flashEvents: '플래시 이벤트',
    explore: '탐색',
    shareLocationToPlanner: '플래너에게 위치 공유',
    yourLocation: '내 위치',
    planner: '플래너',
    safetyCenter: '안전 센터',
    safetyCenterDesc: '여행 중 안전을 위해 긴급 SOS 설정',
    safety: '안전',
    setupEmergencySOS: '긴급 SOS 설정',
    iosShortcutsIntegration: 'iOS 단축어 연동',
    iosShortcutsDesc: '아래 링크를 iOS 단축어에 추가하여 Siri나 자동화로 빠르게 SOS 발신',
    webhookUrl: 'Webhook URL (POST)',
    notAvailable: '링크를 가져올 수 없습니다',
    copyLink: '링크 복사',
    copied: '복사됨',
    setupSteps: '설정 단계:',
    step1: '1. iOS 단축어 앱 열기',
    step2: '2. 새 단축어 만들고 "URL 콘텐츠 가져오기" 추가',
    step3: '3. 위의 Webhook URL 붙여넣기',
    step4: '4. 메서드를 "POST"로 설정',
    step5: '5. Siri 음성 명령 또는 자동화 트리거 설정',
    emergencyNow: '지금 긴급 요청',
    emergencyNowDesc: '버튼을 누르면 긴급 연락처에 SOS 신호를 즉시 보냅니다',
    sosButton: 'SOS 긴급',
    confirmSOS: 'SOS 확인',
    confirmSOSDesc: '긴급 SOS 신호를 보내시겠습니까?',
    cancel: '취소',
    confirmSend: '보내기 확인',
    sent: '전송됨',
    sosSuccess: 'SOS 신호가 성공적으로 전송되었습니다',
    sendFailed: '전송 실패',
    tryAgainLater: '나중에 다시 시도해주세요',
    networkError: '네트워크 오류, 연결을 확인하세요',
    gettingLocation: '위치 가져오는 중...',
    locationPermissionRequired: '이 기능을 사용하려면 위치 권한이 필요합니다',
    unableToGetLocation: '위치를 가져올 수 없습니다',
    retry: '다시 시도',
    viewPool: '가챠 확인',
    poolPreview: '가챠 풀',
    pullCount: '뽑기 횟수',
    selectDistrict: '지역 선택',
    rareItems: '레어 아이템',
    noRareItems: '이 지역에는 레어 아이템이 없습니다',
    closeModal: '닫기',
    pulls: '장',
    loadingPool: '풀 로딩 중...',
    merchant: '파트너',
    generatingItinerary: '일정 생성 중...',
    sponsorAd: '스폰서 광고 (데모)',
    pleaseWait: '잠시만 기다려주세요',
    almostReady: '거의 완료',
    gachaResults: '가챠 결과',
    addToBackpack: '배낭에 추가',
    addedToBackpack: '추가됨!',
    gotCoupon: '쿠폰 획득!',
    partnerMerchant: '파트너',
    rating: '평점',

    // ========== SOS 긴급 연락처 ==========
    sos_emergencyContacts: '긴급 연락처',
    sos_limitReached: '한도 도달',
    sos_limitReachedDesc: '긴급 연락처는 최대 {max}명까지 추가할 수 있습니다',
    sos_incomplete: '미완성',
    sos_enterNamePhone: '이름과 전화번호를 입력해주세요',
    sos_saveFailed: '연락처 저장 실패',
    sos_deleteContact: '연락처 삭제',
    sos_deleteContactConfirm: '"{name}"을(를) 삭제하시겠습니까?',
    sos_deleteContactFailed: '연락처 삭제 실패',
    sos_noContacts: '긴급 연락처가 없습니다',
    sos_tapToAdd: '오른쪽 상단 +를 눌러 연락처를 추가하세요',
    sos_addContact: '연락처 추가',
    sos_editContact: '연락처 편집',
    sos_infoBanner: '최대 {max}명의 긴급 연락처를 추가할 수 있습니다. SOS 전송 시 모두에게 알림이 갑니다.',
    sos_enterName: '이름 입력',
    sos_enterPhone: '전화번호 입력',
    sos_relationship: '관계',
    sos_relFamily: '가족',
    sos_relFriend: '친구',
    sos_relColleague: '동료',
    sos_relOther: '기타',

    // ========== SOS 긴급 화면 ==========
    sos_emergencySOS: '긴급 SOS',
    sos_holdToSend: '아래 버튼을 3초간 길게 누르면 SOS 신호가 전송됩니다',
    sos_hold3sec: '3초 길게 누르기',
    sos_alertHistory: '긴급 알림 기록',
    sos_alertSent: 'SOS 신호가 전송되었습니다',
    sos_willContactYou: '최대한 빨리 연락드리겠습니다',
    sos_sendFailed: '전송 실패',
    sos_tryAgainLater: '나중에 다시 시도해주세요',
    sos_confirmCancel: '취소 확인',
    sos_confirmCancelDesc: '이 긴급 알림을 취소하시겠습니까?',
    sos_no: '아니오',
    sos_yes: '네',
    sos_cancelFailed: '취소 실패',
    sos_cancelAlert: '긴급 알림 취소',
    sos_featureLocked: 'SOS 기능이 잠겨 있습니다',
    sos_requirePurchase: '안전 센터를 사용하려면 여행 서비스를 구매해야 합니다',
    sos_purchaseService: '서비스 구매',
    sos_statusPending: '처리 대기',
    sos_statusAcknowledged: '확인됨',
    sos_statusResolved: '해결됨',
    sos_statusCancelled: '취소됨',

    // ========== 인증 (로그인/회원가입) ==========
    auth_signIn: '로그인',
    auth_signUp: '회원가입',
    auth_username: '계정 (이메일)',
    auth_password: '비밀번호',
    auth_name: '이름',
    auth_selectRole: '역할 선택',
    auth_noAccount: '계정이 없으신가요?',
    auth_hasAccount: '이미 계정이 있으신가요?',
    auth_guestLogin: '게스트로 계속',
    auth_guestNote: '게스트 모드에서는 데이터가 로컬에만 저장됩니다',
    auth_pendingApproval: '가맹점 및 전문가 계정은 관리자 승인이 필요합니다',
    auth_loginFailed: '로그인 실패, 계정과 비밀번호를 확인해주세요',
    auth_registerFailed: '회원가입 실패, 나중에 다시 시도해주세요',
    auth_enterUsernamePassword: '계정과 비밀번호를 입력해주세요',
    auth_fillAllFields: '모든 항목을 입력해주세요',
    auth_roleTraveler: '여행자',
    auth_roleMerchant: '가맹점',
    auth_roleSpecialist: '전문가',

    // ========== 승인 대기 화면 ==========
    auth_pendingTitle: '승인 대기',
    auth_pendingSubtitle: '계정이 관리자 승인을 기다리고 있습니다',
    auth_pendingDescription: '가맹점 및 전문가 계정은 승인 후 모든 기능을 사용할 수 있습니다. 승인되면 알림을 보내드립니다.',
    auth_appliedRole: '신청한 역할',

    // ========== 로그인 페이지 (OAuth) ==========
    auth_notMerchant: 'Not a Merchant', /* TODO: ko */
    auth_notMerchantDesc: 'Please register as a merchant first', /* TODO: ko */
    auth_notSpecialist: 'Not a Specialist', /* TODO: ko */
    auth_notSpecialistDesc: 'Please register as a specialist first', /* TODO: ko */
    auth_wrongPortal: 'Wrong Portal', /* TODO: ko */
    auth_wrongPortalDesc: 'Please switch to the correct portal', /* TODO: ko */
    auth_permissionDenied: 'Permission Denied', /* TODO: ko */
    auth_permissionDeniedDesc: 'You do not have permission', /* TODO: ko */
    auth_oauthLoginFailed: '로그인 실패',
    auth_loginError: '로그인 오류',
    auth_tryAgainLater: '나중에 다시 시도해주세요',
    auth_googleSignInFailed: 'Google 로그인을 완료할 수 없습니다', /* TODO: ko */
    auth_appleSignInFailed: 'Apple 로그인을 완료할 수 없습니다', /* TODO: ko */
    auth_cannotConnectServer: '서버에 연결할 수 없습니다', /* TODO: ko */
    auth_networkError: '네트워크 오류',
    auth_switchPortal: '포털 전환',
    auth_googleLogin: 'Google 로그인',
    auth_switchLanguage: '언어 전환',
    auth_switchTo: '전환',
    auth_applicationSubmitted: '신청이 제출되었습니다!',
    auth_applicationReceivedMsg: '신청서를 접수했습니다. 곧 처리하겠습니다',
    auth_applicationApprovalNote: '승인 후 알림을 받으시면 계정으로 로그인하실 수 있습니다',
    auth_backToLogin: '로그인 페이지로 돌아가기',
    auth_registrationFailed: 'Registration Failed', /* TODO: ko */
    auth_registrationError: 'Registration failed. Please try again.', /* TODO: ko */

    // ========== 가맹점 등록 (양식) ==========
    merchant_registration: 'Merchant Registration', /* TODO: ko */
    merchant_registrationSubtitle: 'Fill in your details to apply', /* TODO: ko */
    merchant_regOwnerName: 'Owner Name', /* TODO: ko */
    merchant_regOwnerNamePlaceholder: 'Enter owner name', /* TODO: ko */
    merchant_regBusinessName: 'Business Name', /* TODO: ko */
    merchant_regBusinessNamePlaceholder: 'Enter business name', /* TODO: ko */
    merchant_regTaxId: 'Tax ID (Optional)', /* TODO: ko */
    merchant_regTaxIdPlaceholder: 'Enter tax ID', /* TODO: ko */
    merchant_regBusinessCategory: 'Business Category', /* TODO: ko */
    merchant_regBusinessCategoryPlaceholder: 'Select business category', /* TODO: ko */
    merchant_regAddress: 'Business Address', /* TODO: ko */
    merchant_regAddressPlaceholder: 'Enter business address', /* TODO: ko */
    merchant_regPhone: 'Phone (Optional)', /* TODO: ko */
    merchant_regPhonePlaceholder: 'Enter phone number', /* TODO: ko */
    merchant_regMobile: 'Mobile', /* TODO: ko */
    merchant_regMobilePlaceholder: 'Enter mobile number', /* TODO: ko */
    merchant_regEmailPlaceholder: 'Enter email', /* TODO: ko */
    merchant_regSubmitReview: 'Submit for Review', /* TODO: ko */
    merchant_regSubmitting: 'Submitting...', /* TODO: ko */
    merchant_regSubmitSuccess: 'Submitted Successfully', /* TODO: ko */
    merchant_regSubmitSuccessMsg: 'Your application has been submitted.', /* TODO: ko */
    merchant_regSubmitFailed: 'Submission failed.', /* TODO: ko */
    merchant_regFillRequired: 'Please fill in all required fields', /* TODO: ko */
    merchant_regInvalidEmail: 'Please enter a valid email', /* TODO: ko */
    merchant_regCatRestaurant: 'Restaurant', /* TODO: ko */
    merchant_regCatHotel: 'Hotel', /* TODO: ko */
    merchant_regCatAttraction: 'Attraction', /* TODO: ko */
    merchant_regCatShopping: 'Shopping', /* TODO: ko */
    merchant_regCatTransportation: 'Transportation', /* TODO: ko */
    merchant_regCatExperience: 'Experience', /* TODO: ko */
    merchant_regCatCulture: 'Culture/Art', /* TODO: ko */
    merchant_regCatOther: 'Other', /* TODO: ko */
    merchant_regEmail: 'Email (Account)', /* TODO: ko */
    merchant_regPassword: 'Password (min 6 chars)', /* TODO: ko */
    merchant_regConfirmPassword: 'Confirm Password', /* TODO: ko */
    merchant_regContactName: 'Contact Name', /* TODO: ko */
    merchant_regIndustryCategory: 'Business Category', /* TODO: ko */
    merchant_regBusinessAddress: 'Business Address', /* TODO: ko */
    merchant_regOtherContact: 'Other Contact (Optional)', /* TODO: ko */
    merchant_regBackToLogin: 'Back to Login', /* TODO: ko */
    merchant_regSelectCategory: 'Select Category', /* TODO: ko */
    merchant_regEnterEmail: 'Please enter email', /* TODO: ko */
    merchant_regInvalidEmailFormat: 'Invalid email format', /* TODO: ko */
    merchant_regPasswordMinLength: 'Password must be at least 6 characters', /* TODO: ko */
    merchant_regPasswordMismatch: 'Passwords do not match', /* TODO: ko */
    merchant_regEnterBusinessName: 'Please enter business name', /* TODO: ko */
    merchant_regEnterContactName: 'Please enter contact name', /* TODO: ko */
    merchant_regSelectIndustry: 'Please select category', /* TODO: ko */
    merchant_regEnterAddress: 'Please enter address', /* TODO: ko */
    merchant_regContactNamePlaceholder: 'Enter contact name', /* TODO: ko */
    merchant_regTaxIdShort: 'Tax ID', /* TODO: ko */
    merchant_regLineOrPhone: 'LINE ID or Phone', /* TODO: ko */
    merchant_regCatRestaurantShort: 'Restaurant', /* TODO: ko */
    merchant_regCatHotelShort: 'Hotel', /* TODO: ko */
    merchant_regCatAttractionShort: 'Attraction', /* TODO: ko */
    merchant_regCatShoppingShort: 'Shopping', /* TODO: ko */
    merchant_regCatActivityShort: 'Activity', /* TODO: ko */
    merchant_regCatOtherShort: 'Other', /* TODO: ko */

    // ========== 전문가 등록 ==========
    specialist_registration: 'Specialist Registration', /* TODO: ko */
    specialist_emailAccount: 'Email (Account)', /* TODO: ko */
    specialist_passwordMin: 'Password (min 6 chars)', /* TODO: ko */
    specialist_confirmPassword: 'Confirm Password', /* TODO: ko */
    specialist_nameLabel: 'Name', /* TODO: ko */
    specialist_otherContact: 'Other Contact (Optional)', /* TODO: ko */
    specialist_serviceRegionOptional: 'Service Region (Optional)', /* TODO: ko */
    specialist_submitApplication: 'Submit Application', /* TODO: ko */
    specialist_backToLogin: 'Back to Login', /* TODO: ko */
    specialist_enterEmail: 'Please enter email', /* TODO: ko */
    specialist_invalidEmailFormat: 'Invalid email format', /* TODO: ko */
    specialist_passwordMinLength: 'Password must be at least 6 characters', /* TODO: ko */
    specialist_passwordMismatch: 'Passwords do not match', /* TODO: ko */
    specialist_enterName: 'Please enter name', /* TODO: ko */
    specialist_namePlaceholder: 'Enter your name', /* TODO: ko */
    specialist_regionPlaceholder: 'e.g., Taipei, Yilan', /* TODO: ko */
    specialist_lineOrPhone: 'LINE ID or Phone', /* TODO: ko */

    // ========== 즐겨찾기/블랙리스트 ==========
    itinerary_favoritesAndBlacklist: 'Favorites & Blacklist', /* TODO: ko */
    itinerary_favorites: '즐겨찾기',
    itinerary_blacklist: '블랙리스트',
    itinerary_removeFavorite: '즐겨찾기 삭제', /* TODO: ko */
    itinerary_removeFavoriteConfirm: '즐겨찾기에서 삭제하시겠습니까?', /* TODO: ko */
    itinerary_removeBlacklist: '블랙리스트에서 삭제', /* TODO: ko */
    itinerary_removeBlacklistConfirm: '블랙리스트에서 삭제하시겠습니까?', /* TODO: ko */
    itinerary_noFavorites: '즐겨찾기가 없습니다', /* TODO: ko */
    itinerary_addFavoritesHint: 'Add favorites from collection', /* TODO: ko */
    itinerary_noBlacklist: '블랙리스트가 없습니다', /* TODO: ko */
    itinerary_addBlacklistHint: 'Add items to blacklist', /* TODO: ko */
    itinerary_favoritesGachaHint: 'Favorite places appear more often in gacha', /* TODO: ko */
    itinerary_blacklistGachaHint: 'Blacklisted items will not appear in gacha', /* TODO: ko */

    // ========== 이벤트 상세 ==========
    common_eventNotFound: '이벤트를 찾을 수 없습니다', /* TODO: ko */
    common_goBack: '돌아가기',
    common_description: '설명',
    common_learnMore: '자세히 보기',
    event_announcement: '공지', /* TODO: ko */
    event_festival: '축제', /* TODO: ko */
    event_limited: '기간 한정 이벤트', /* TODO: ko */

    noResults: '아직 결과가 없습니다',
    tryGachaFirst: '먼저 가챠를 뽑아보세요!',
    viewResults: '결과 보기',
    exploring: '탐색 중',
    reGacha: '다시 가챠',
    emptyItemBox: '보관함이 비어 있습니다',
    collectItemsFirst: '가챠로 장소를 수집하세요!',
    totalItems: '합계',
    itemsCount: '아이템',

    // ========== 공통 (화면 공통) ==========
    common_error: '오류',
    common_confirm: '확인',
    common_delete: '삭제',
    common_save: '저장',
    common_edit: '편집',
    common_remove: '제거',
    common_done: '완료',
    common_submit: '제출',
    common_search: '검색',
    common_logout: '로그아웃',
    common_success: '성공',
    common_loadFailed: '로드 실패',
    common_saveFailed: '저장 실패',
    common_deleteFailed: '삭제 실패',
    common_createFailed: '생성 실패',
    common_updateFailed: '업데이트 실패',
    common_saveTryAgain: '저장 실패, 나중에 다시 시도해 주세요',
    common_notice: '알림',
    common_errorTryAgain: '오류가 발생했습니다. 다시 시도해 주세요.',
    common_noData: '데이터 없음',
    common_fillRequired: '필수 항목을 입력해 주세요',
    common_confirmDelete: '삭제 확인',
    common_confirmLogout: '로그아웃 확인',
    common_confirmLogoutDesc: '로그아웃하시겠습니까?',
    common_deleteAccount: '계정 삭제',
    common_required: '필수',
    common_name: '이름',
    common_email: '이메일',
    common_password: '비밀번호',
    common_phone: '전화',
    common_address: '주소',
    common_status: '상태',
    common_place: '장소',
    common_coupon: '쿠폰',
    common_pending: '대기 중',
    common_approved: '승인됨',
    common_rejected: '거부됨',
    common_active: '활성',
    common_inactive: '비활성',
    common_verified: '인증됨',
    common_switchRole: '역할 전환',
    common_roleTraveler: '여행자',
    common_roleMerchant: '상점',
    common_roleSpecialist: '전문가',
    common_roleAdmin: '관리자',
    common_skip: '건너뛰기',
    common_back: '이전',
    common_next: '다음',
    common_getStarted: '시작하기',

    // ========== Admin ==========
    admin_title: '관리 대시보드',
    admin_pendingTab: '승인 대기',
    admin_usersTab: '사용자',
    admin_draftsTab: '초안',
    admin_exclusionsTab: '제외',
    admin_announcementsTab: '공지사항',
    admin_approve: '승인',
    admin_reject: '거부',
    admin_publish: '게시',
    admin_noPending: '승인 대기 중인 사용자가 없습니다',
    admin_merchant: '가맹점', /* TODO: ko */
    admin_specialist: 'Specialist', /* TODO: ko */
    admin_traveler: '여행자',
    admin_admin: '관리자',
    admin_confirmApprove: '이 사용자를 승인하시겠습니까?',
    admin_confirmReject: '이 사용자를 거부하시겠습니까?',
    admin_confirmPublish: '이 초안을 게시하시겠습니까?',
    admin_confirmDelete: '삭제하시겠습니까?',
    admin_penalty: '감점',
    admin_goToAnnouncement: '공지사항 관리로 이동',
    admin_announcementManage: '공지사항 관리',
    admin_add: '추가',
    admin_type: '유형',
    admin_titleLabel: '제목',
    admin_contentLabel: '내용',
    admin_imageUrl: '이미지 URL',
    admin_linkUrl: '링크 URL',
    admin_priority: '우선순위',
    admin_noAnnouncements: '공지사항이 없습니다',
    admin_confirmDeleteAnnouncement: '이 공지사항을 삭제하시겠습니까?',
    admin_createAnnouncement: '공지사항 작성',
    admin_editAnnouncement: '공지사항 편집',
    admin_fillTitleContent: '제목과 내용을 입력해 주세요',
    admin_enterTitle: '제목 입력',
    admin_enterContent: '내용 입력',
    admin_typeAnnouncement: '공지',
    admin_typeFlashEvent: '플래시 이벤트',
    admin_typeHolidayEvent: '시즌 이벤트',
    admin_startDateLabel: '시작일',
    admin_endDateLabel: '종료일',
    admin_isActiveLabel: '활성',
    admin_datePlaceholder: 'YYYY-MM-DD',

    // ========== 스페셜리스트 모듈 ==========
    specialist_dashboard: 'Specialist Dashboard', /* TODO: ko */
    specialist_online: 'Online', /* TODO: ko */
    specialist_offline: 'Offline', /* TODO: ko */
    specialist_onlineStatus: 'Online Status', /* TODO: ko */
    specialist_activeServices: 'Active Services', /* TODO: ko */
    specialist_noServices: 'No active services', /* TODO: ko */
    specialist_since: 'Since', /* TODO: ko */
    specialist_region: 'Region', /* TODO: ko */
    specialist_activeTravelers: 'Active Travelers', /* TODO: ko */
    specialist_viewTravelers: 'View travelers being served', /* TODO: ko */
    specialist_liveTracking: 'Live Tracking', /* TODO: ko */
    specialist_viewTravelersOnMap: 'View travelers on map', /* TODO: ko */
    specialist_serviceHistory: 'Service History', /* TODO: ko */
    specialist_viewPastRecords: 'View past service records', /* TODO: ko */
    specialist_profile: 'Specialist Profile', /* TODO: ko */
    specialist_viewEditProfile: 'View and edit profile', /* TODO: ko */
    specialist_filterAll: 'All', /* TODO: ko */
    specialist_completed: 'Completed', /* TODO: ko */
    specialist_cancelled: 'Cancelled', /* TODO: ko */
    specialist_noHistory: 'No service history', /* TODO: ko */
    specialist_traveler: 'Traveler', /* TODO: ko */
    specialist_noActiveTravelers: 'No active travelers', /* TODO: ko */
    specialist_viewLocation: 'View Location', /* TODO: ko */
    specialist_connecting: 'Connecting...', /* TODO: ko */
    specialist_connected: 'Connected', /* TODO: ko */
    specialist_disconnected: 'Disconnected', /* TODO: ko */
    specialist_noLocations: 'No traveler locations yet', /* TODO: ko */
    specialist_lastUpdate: 'Last update', /* TODO: ko */
    specialist_travelers: 'travelers', /* TODO: ko */
    specialist_mapNotAvailableWeb: 'Map not available on web', /* TODO: ko */
    specialist_mapRequiresNative: 'Map Area - requires react-native-maps', /* TODO: ko */
    specialist_travelerLocations: 'Traveler Locations', /* TODO: ko */
    specialist_accountStatus: 'Account Status', /* TODO: ko */
    specialist_available: 'Available', /* TODO: ko */
    specialist_unavailable: 'Unavailable', /* TODO: ko */
    specialist_currentlyServing: 'Currently Serving', /* TODO: ko */
    specialist_maxTravelers: 'Max Travelers', /* TODO: ko */
    specialist_serviceRegion: 'Service Region', /* TODO: ko */
    specialist_people: '', /* TODO: ko */

    // ========== Merchant ==========
    merchant_productMgmt: 'Product Management', /* TODO: ko */
    merchant_myProducts: 'My Products', /* TODO: ko */
    merchant_noProducts: 'No products yet', /* TODO: ko */
    merchant_addProduct: 'Add Product', /* TODO: ko */
    merchant_productName: 'Product Name', /* TODO: ko */
    merchant_productDesc: 'Description', /* TODO: ko */
    merchant_price: 'Price', /* TODO: ko */
    merchant_discountPrice: 'Discount Price', /* TODO: ko */
    merchant_activeStatus: 'Active', /* TODO: ko */
    merchant_inactiveStatus: 'Inactive', /* TODO: ko */
    merchant_deleteProductConfirm: 'Delete this product?', /* TODO: ko */
    merchant_deleted: 'Deleted', /* TODO: ko */
    merchant_saved: 'Saved', /* TODO: ko */
    merchant_couponAddTitle: 'Add Coupon', /* TODO: ko */
    merchant_couponEditTitle: 'Edit Coupon', /* TODO: ko */
    merchant_couponName: 'Coupon Name', /* TODO: ko */
    merchant_couponNamePlaceholder: 'e.g. 10% Off', /* TODO: ko */
    merchant_rarityTier: 'Rarity Tier', /* TODO: ko */
    merchant_tierHint: 'Higher tier = lower draw rate', /* TODO: ko */
    merchant_discountContent: 'Discount Content', /* TODO: ko */
    merchant_discountContentPlaceholder: 'Describe the discount...', /* TODO: ko */
    merchant_terms: 'Terms & Conditions', /* TODO: ko */
    merchant_termsPlaceholder: 'Usage restrictions (optional)', /* TODO: ko */
    merchant_quantity: 'Quantity', /* TODO: ko */
    merchant_quantityHint: 'Total coupons to distribute', /* TODO: ko */
    merchant_validUntil: 'Valid Until', /* TODO: ko */
    merchant_validUntilHint: 'Leave empty for no expiration', /* TODO: ko */
    merchant_activateNow: 'Activate Now', /* TODO: ko */
    merchant_saveSuccess: 'Saved successfully', /* TODO: ko */
    merchant_notice: 'Notice', /* TODO: ko */
    merchant_addPlace: 'Add New Place', /* TODO: ko */
    merchant_addPlaceSubtitle: 'Fill in your place information', /* TODO: ko */
    merchant_placeName: 'Place Name', /* TODO: ko */
    merchant_placeNamePlaceholder: 'Enter place name', /* TODO: ko */
    merchant_category: 'Category', /* TODO: ko */
    merchant_selectCategory: 'Select category', /* TODO: ko */
    merchant_district: 'District', /* TODO: ko */
    merchant_districtPlaceholder: "e.g. Da'an District", /* TODO: ko */
    merchant_city: 'City', /* TODO: ko */
    merchant_cityPlaceholder: 'e.g. Taipei', /* TODO: ko */
    merchant_placeAddress: 'Address', /* TODO: ko */
    merchant_addressPlaceholder: 'Full address', /* TODO: ko */
    merchant_placeDesc: 'Description', /* TODO: ko */
    merchant_placeDescPlaceholder: 'Brief introduction of your place...', /* TODO: ko */
    merchant_submitApplication: 'Submit', /* TODO: ko */
    merchant_applicationSubmitted: 'Application submitted! We will review it soon.', /* TODO: ko */
    merchant_submitError: 'Submit failed, please try again', /* TODO: ko */
    merchant_catFood: 'Food', /* TODO: ko */
    merchant_catStay: 'Stay', /* TODO: ko */
    merchant_catScenery: 'Scenery', /* TODO: ko */
    merchant_catShopping: 'Shopping', /* TODO: ko */
    merchant_catEntertainment: 'Entertainment', /* TODO: ko */
    merchant_catEducation: 'Education', /* TODO: ko */
    merchant_analytics: 'Analytics', /* TODO: ko */
    merchant_overview: 'Overview', /* TODO: ko */
    merchant_totalExposures: 'Total Exposures', /* TODO: ko */
    merchant_totalCollectors: 'Total Collectors', /* TODO: ko */
    merchant_couponIssued: 'Coupons Issued', /* TODO: ko */
    merchant_couponRedeemed: 'Coupons Redeemed', /* TODO: ko */
    merchant_redemptionRate: 'Redemption Rate', /* TODO: ko */
    merchant_topCoupons: 'Top Coupons', /* TODO: ko */
    merchant_placeBreakdown: 'Place Breakdown', /* TODO: ko */
    merchant_allPlaces: 'All Places', /* TODO: ko */
    merchant_selectPlace: 'Select Place', /* TODO: ko */
    merchant_noDataYet: 'No data', /* TODO: ko */
    merchant_times: 'times', /* TODO: ko */
    merchant_people: 'people', /* TODO: ko */
    merchant_issued: 'Issued', /* TODO: ko */
    merchant_redeemed: 'Redeemed', /* TODO: ko */
    merchant_collectionCount: 'Collections', /* TODO: ko */
    merchant_7days: '7 Days', /* TODO: ko */
    merchant_30days: '30 Days', /* TODO: ko */
    merchant_90days: '90 Days', /* TODO: ko */
    merchant_allPeriod: 'All', /* TODO: ko */
    merchant_couponMgmt: 'Coupon Management', /* TODO: ko */
    merchant_couponMgmtSubtitle: 'Create and manage your coupons', /* TODO: ko */
    merchant_addCoupon: 'Add Coupon', /* TODO: ko */
    merchant_noCoupons: 'No coupons yet', /* TODO: ko */
    merchant_noCouponsHint: 'Start creating your first coupon', /* TODO: ko */
    merchant_remaining: 'Remaining', /* TODO: ko */
    merchant_couponActive: 'Active', /* TODO: ko */
    merchant_couponInactive: 'Inactive', /* TODO: ko */
    merchant_couponExpired: 'Expired', /* TODO: ko */
    merchant_confirmDeleteCoupon: 'Delete this coupon?', /* TODO: ko */
    merchant_deleteSuccess: 'Deleted successfully', /* TODO: ko */
    merchant_drawRate: 'Draw rate', /* TODO: ko */
    merchant_couponValidUntil: 'Valid until', /* TODO: ko */
    merchant_couponLoadFailed: 'Failed to load coupons', /* TODO: ko */
    merchant_couponLoadFailedDetail: 'Please check your connection and try again', /* TODO: ko */
    merchant_verifyTitle: 'Verify Code', /* TODO: ko */
    merchant_merchantIdLabel: 'Merchant ID', /* TODO: ko */
    merchant_merchantIdPlaceholder: 'Enter Merchant ID', /* TODO: ko */
    merchant_codeLabel: 'Verification Code', /* TODO: ko */
    merchant_codePlaceholder: 'Enter code', /* TODO: ko */
    merchant_verify: 'Verify', /* TODO: ko */
    merchant_verifying: 'Verifying...', /* TODO: ko */
    merchant_verifyValid: 'Valid', /* TODO: ko */
    merchant_verifyInvalid: 'Invalid', /* TODO: ko */
    merchant_errorEmpty: 'Please enter merchant ID and code', /* TODO: ko */
    merchant_tryAgain: 'Try Again', /* TODO: ko */
    merchant_merchantIdMustBeNumber: 'Merchant ID must be a number', /* TODO: ko */
    merchant_codeValid: 'Code is valid', /* TODO: ko */
    merchant_codeInvalid: 'Code is invalid', /* TODO: ko */
    merchant_verifyFailed: 'Verification failed', /* TODO: ko */
    merchant_claimTitle: 'Claim Place', /* TODO: ko */
    merchant_claimSubtitle: 'Search and claim your place', /* TODO: ko */
    merchant_searchPlaceholder: 'Enter place name...', /* TODO: ko */
    merchant_claim: 'Claim', /* TODO: ko */
    merchant_claimed: 'Claimed', /* TODO: ko */
    merchant_noSearchResults: 'No matching places found', /* TODO: ko */
    merchant_noResultsHint: 'Try other keywords, or add your own place', /* TODO: ko */
    merchant_addNewPlace: 'Add New Place', /* TODO: ko */
    merchant_claimSuccess: 'Claimed successfully!', /* TODO: ko */
    merchant_claimFailed: 'Claim failed', /* TODO: ko */
    merchant_searchHint: 'Enter place name to search', /* TODO: ko */
    merchant_searchFailed: 'Search failed', /* TODO: ko */
    merchant_myPlaces: 'My Places', /* TODO: ko */
    merchant_myPlacesSubtitle: 'Manage your claimed places', /* TODO: ko */
    merchant_noPlaces: 'No places claimed yet', /* TODO: ko */
    merchant_noPlacesHint: 'Start claiming or adding your places', /* TODO: ko */
    merchant_claimExisting: 'Claim Existing Place', /* TODO: ko */
    merchant_placesCount: '{n} place(s)', /* TODO: ko */
    merchant_transactionHistory: 'Transaction History', /* TODO: ko */
    merchant_noTransactions: 'No transactions yet', /* TODO: ko */
    merchant_purchase: 'Purchase', /* TODO: ko */
    merchant_usage: 'Usage', /* TODO: ko */
    merchant_refund: 'Refund', /* TODO: ko */
    merchant_appFormTitle: 'Merchant Application', /* TODO: ko */
    merchant_appFormSubtitle: 'Fill in the details below. Review takes 1-3 business days.', /* TODO: ko */
    merchant_ownerName: 'Owner Name *', /* TODO: ko */
    merchant_businessName: 'Business Name *', /* TODO: ko */
    merchant_taxId: 'Tax ID', /* TODO: ko */
    merchant_businessCategoryLabel: 'Business Category *', /* TODO: ko */
    merchant_merchantPhone: 'Phone', /* TODO: ko */
    merchant_merchantMobile: 'Mobile *', /* TODO: ko */
    merchant_contactEmail: 'Contact Email *', /* TODO: ko */
    merchant_submitAppForm: 'Submit Application', /* TODO: ko */
    merchant_requiredFields: 'Please fill all required fields', /* TODO: ko */
    merchant_submitSuccess: 'Application submitted. Awaiting review.', /* TODO: ko */
    merchant_submitFailed: 'Submission failed. Please try again.', /* TODO: ko */
    merchant_enterOwnerName: 'Enter owner name', /* TODO: ko */
    merchant_enterBusinessName: 'Enter business name', /* TODO: ko */
    merchant_enterAddress: 'Enter business address', /* TODO: ko */
    merchant_optional: 'Optional', /* TODO: ko */
    merchant_catRestaurant: 'Restaurant', /* TODO: ko */
    merchant_catRetail: 'Retail', /* TODO: ko */
    merchant_catHotel: 'Hotel', /* TODO: ko */
    merchant_catService: 'Service', /* TODO: ko */
    merchant_catOther: 'Other', /* TODO: ko */
    merchant_catAttraction: 'Attraction/Entertainment', /* TODO: ko */
    merchant_catTransportation: 'Transportation', /* TODO: ko */
    merchant_catExperience: 'Experience/Activity', /* TODO: ko */
    merchant_catCulture: 'Culture/Art', /* TODO: ko */

    // ========== Crowdfunding ==========
    crowdfunding_title: '세계 지도 잠금 해제', /* TODO: ko */
    crowdfunding_loadFailed: '로드 실패', /* TODO: ko */
    crowdfunding_loadFailedDesc: '크라우드펀딩을 불러오지 못했습니다', /* TODO: ko */
    crowdfunding_statUnlocked: '잠금 해제', /* TODO: ko */
    crowdfunding_statFundraising: '모금 중', /* TODO: ko */
    crowdfunding_statComing: '곧 오픈', /* TODO: ko */
    crowdfunding_availableRegions: '이용 가능 지역', /* TODO: ko */
    crowdfunding_fundraising: '모금 중', /* TODO: ko */
    crowdfunding_comingSoon: '곧 오픈', /* TODO: ko */
    crowdfunding_stayTuned: '기대해 주세요', /* TODO: ko */
    crowdfunding_noProjects: '진행 중인 프로젝트가 없습니다', /* TODO: ko */
    crowdfunding_stayTunedDesc: '새로운 지역 오픈을 기대해 주세요', /* TODO: ko */
    crowdfunding_myContributions: '후원 내역', /* TODO: ko */
    crowdfunding_totalContributions: '총 후원액', /* TODO: ko */
    crowdfunding_supportVision: '우리의 비전을 응원해주세요', /* TODO: ko */
    crowdfunding_statusUnlocked: 'Unlocked', /* TODO: ko */
    crowdfunding_statusFundraising: 'Fundraising', /* TODO: ko */
    crowdfunding_statusComingSoon: 'Coming Soon', /* TODO: ko */
    crowdfunding_statusStayTuned: 'Stay Tuned', /* TODO: ko */
    crowdfunding_loadFailedDetail: 'Failed to load campaign details', /* TODO: ko */
    crowdfunding_notFound: 'Campaign not found', /* TODO: ko */
    crowdfunding_goBack: 'Go Back', /* TODO: ko */
    crowdfunding_raised: 'Raised', /* TODO: ko */
    crowdfunding_backers: 'Backers', /* TODO: ko */
    crowdfunding_daysLeft: 'Days Left', /* TODO: ko */
    crowdfunding_goal: 'Goal: ', /* TODO: ko */
    crowdfunding_youBacked: 'You backed ', /* TODO: ko */
    crowdfunding_about: 'About', /* TODO: ko */
    crowdfunding_rewardTiers: 'Reward Tiers', /* TODO: ko */
    crowdfunding_updates: 'Updates', /* TODO: ko */
    crowdfunding_soldOut: 'Sold Out', /* TODO: ko */
    crowdfunding_remaining: '{count} left', /* TODO: ko */
    crowdfunding_selectTier: 'Select a Tier', /* TODO: ko */
    crowdfunding_selectTierDesc: 'Please select a reward tier first', /* TODO: ko */
    crowdfunding_testMode: 'Test Mode', /* TODO: ko */
    crowdfunding_testModeDesc: 'You selected "{tier}" tier ({amount})\n\nReal purchase will be enabled after launch.', /* TODO: ko */
    crowdfunding_simulateSuccess: 'Simulate Success', /* TODO: ko */
    crowdfunding_thankYou: 'Thank you!', /* TODO: ko */
    crowdfunding_thankYouDesc: 'Thank you for your support!', /* TODO: ko */
    crowdfunding_thankYouDescFull: 'Thank you for your support! Your contribution has been processed.', /* TODO: ko */
    crowdfunding_purchaseFailed: 'Purchase Failed', /* TODO: ko */
    crowdfunding_purchaseFailedDesc: 'Could not complete purchase. Please try again.', /* TODO: ko */
    crowdfunding_purchaseError: 'An error occurred during purchase. Please try again.', /* TODO: ko */
    crowdfunding_processing: 'Processing...', /* TODO: ko */
    crowdfunding_backAmount: 'Back {amount}', /* TODO: ko */
    crowdfunding_selectATier: 'Select a Tier', /* TODO: ko */

    // ========== Referral ==========
    referral_inviteFriends: 'Invite Friends', /* TODO: ko */
    referral_myCode: 'My Referral Code', /* TODO: ko */
    referral_copy: 'Copy', /* TODO: ko */
    referral_share: 'Share', /* TODO: ko */
    referral_generateTitle: 'Generate Your Code', /* TODO: ko */
    referral_generateSubtitle: 'Share with friends and earn rewards together', /* TODO: ko */
    referral_generateNow: 'Generate Now', /* TODO: ko */
    referral_generateError: 'Failed to generate code', /* TODO: ko */
    referral_copied: 'Copied!', /* TODO: ko */
    referral_copiedDesc: 'Code copied to clipboard', /* TODO: ko */
    referral_shareMessage: 'Use my code {code} to join Mibu and discover new travel experiences! Download: https://mibu.app', /* TODO: ko */
    referral_invited: 'Invited', /* TODO: ko */
    referral_successful: 'Successful', /* TODO: ko */
    referral_xpEarned: 'XP Earned', /* TODO: ko */
    referral_howItWorks: 'How It Works', /* TODO: ko */
    referral_step1Title: 'Share Your Code', /* TODO: ko */
    referral_step1Desc: 'Copy and share your unique referral code', /* TODO: ko */
    referral_step2Title: 'Friend Signs Up', /* TODO: ko */
    referral_step2Desc: 'Your friend registers using your code', /* TODO: ko */
    referral_step3Title: 'Both Earn Rewards', /* TODO: ko */
    referral_step3Desc: 'You and your friend each earn 50 XP', /* TODO: ko */
    referral_weeklyLeaderboard: 'Weekly Leaderboard', /* TODO: ko */
    referral_you: 'You', /* TODO: ko */
    referral_noRanking: 'No ranking data yet', /* TODO: ko */
    referral_beFirst: 'Be the first to invite friends!', /* TODO: ko */
    referral_yourRank: 'Your current rank: #{rank}', /* TODO: ko */
    referral_inviteRewards: 'Invite Rewards', /* TODO: ko */
    referral_inviteCount: 'Invite {count} friends', /* TODO: ko */
    referral_achieved: 'Done', /* TODO: ko */
    referral_remaining: '{count} more', /* TODO: ko */
    referral_enterCode: "Enter Friend's Code", /* TODO: ko */
    referral_enterCodeHint: 'Have a referral code? Enter to earn rewards', /* TODO: ko */
    referral_enterCodePlaceholder: 'Enter code', /* TODO: ko */
    referral_invalidCode: 'Invalid Code', /* TODO: ko */
    referral_invalidCodeDesc: 'This code is not valid', /* TODO: ko */
    referral_applySuccess: 'Success!', /* TODO: ko */
    referral_applySuccessDesc: 'Referral code applied! You earned {amount} coins', /* TODO: ko */
    referral_applyError: 'Failed to apply code', /* TODO: ko */
    referral_inviteHistory: 'Invite History', /* TODO: ko */

    // ========== Contribution ==========
    contribution_title: 'Contributions', /* TODO: ko */
    contribution_tabReport: 'Report', /* TODO: ko */
    contribution_tabSuggest: 'Suggest', /* TODO: ko */
    contribution_tabVote: 'Vote', /* TODO: ko */
    contribution_loadFailed: 'Load Failed', /* TODO: ko */
    contribution_loadFailedDesc: 'Failed to load contribution data. Please try again later.', /* TODO: ko */
    contribution_reportFeature: 'Report Feature', /* TODO: ko */
    contribution_reportFeatureDesc: 'Please use the "Report" button on place cards in your collection', /* TODO: ko */
    contribution_reportClosure: 'Report Closure', /* TODO: ko */
    contribution_reportClosureDesc: 'Earn coins by helping update place info', /* TODO: ko */
    contribution_myReports: 'My Reports', /* TODO: ko */
    contribution_noReports: 'No reports yet', /* TODO: ko */
    contribution_statusPending: 'Pending', /* TODO: ko */
    contribution_statusVerified: 'Verified', /* TODO: ko */
    contribution_statusRejected: 'Rejected', /* TODO: ko */
    contribution_suggestFeature: 'Suggest Feature', /* TODO: ko */
    contribution_suggestFeatureDesc: 'Place suggestion feature coming soon', /* TODO: ko */
    contribution_suggestPlace: 'Suggest a Place', /* TODO: ko */
    contribution_suggestPlaceDesc: 'Earn coins by recommending great places', /* TODO: ko */
    contribution_mySuggestions: 'My Suggestions', /* TODO: ko */
    contribution_noSuggestions: 'No suggestions yet', /* TODO: ko */
    contribution_statusVoting: 'Voting', /* TODO: ko */
    contribution_statusApproved: 'Approved', /* TODO: ko */
    contribution_voteInfo: 'Reach Lv.7 to participate in community voting', /* TODO: ko */
    contribution_exclusionVotes: 'Exclusion Votes', /* TODO: ko */
    contribution_newPlaceReviews: 'New Place Reviews', /* TODO: ko */
    contribution_exclude: 'Exclude', /* TODO: ko */
    contribution_keep: 'Keep', /* TODO: ko */
    contribution_approve: 'Approve', /* TODO: ko */
    contribution_reject: 'Reject', /* TODO: ko */
    contribution_voteSuccess: 'Vote Submitted', /* TODO: ko */
    contribution_voteEarned: 'You earned {amount} coins', /* TODO: ko */
    contribution_voteFailed: 'Vote Failed', /* TODO: ko */
    contribution_voteTryAgain: 'Please try again', /* TODO: ko */
    contribution_noPendingVotes: 'No pending votes', /* TODO: ko */
    contribution_reasonClosed: 'Closed', /* TODO: ko */
    contribution_reasonRelocated: 'Relocated', /* TODO: ko */
    contribution_reasonWrongInfo: 'Wrong Info', /* TODO: ko */
    contribution_reasonOther: 'Other', /* TODO: ko */

    // ========== Itinerary ==========
    itinerary_addedToItinerary: 'Added to itinerary', /* TODO: ko */
    itinerary_removedFromItinerary: 'Removed from itinerary', /* TODO: ko */
    itinerary_aiUnavailable: 'Sorry, I cannot respond right now. Please try again later.', /* TODO: ko */
    itinerary_removed: 'Removed "{name}"', /* TODO: ko */
    itinerary_removeFailed: 'Failed to remove, please try again', /* TODO: ko */
    itinerary_addPlacesFailed: 'Failed to add places, please try again', /* TODO: ko */
    itinerary_reorderFailed: 'Reorder failed, please try again', /* TODO: ko */
    itinerary_incomplete: 'Incomplete', /* TODO: ko */
    itinerary_selectCountryCity: 'Please select country and city', /* TODO: ko */
    itinerary_createFailed: 'Create Failed', /* TODO: ko */
    itinerary_tryAgainLater: 'Please try again later', /* TODO: ko */
    itinerary_networkError: 'Network error, please try again later', /* TODO: ko */
    itinerary_updateFailed: 'Update failed', /* TODO: ko */
    itinerary_deleteItineraries: 'Delete Itineraries', /* TODO: ko */
    itinerary_deleteItinerariesConfirm: 'Are you sure you want to delete {count} itineraries? This cannot be undone.', /* TODO: ko */
    itinerary_deleteItinerary: 'Delete Itinerary', /* TODO: ko */
    itinerary_deleteItineraryConfirm: 'Are you sure you want to delete this itinerary? This cannot be undone.', /* TODO: ko */
    itinerary_deleted: 'Deleted {count} itineraries', /* TODO: ko */
    itinerary_deletedSingle: 'Itinerary deleted', /* TODO: ko */
    itinerary_deleteFailed: 'Delete failed', /* TODO: ko */
    itinerary_loginRequired: 'Login to use Trip Assistant', /* TODO: ko */
    itinerary_noItineraries: 'No itineraries yet', /* TODO: ko */
    itinerary_noItinerariesDesc: 'Create a trip and let AI plan for you', /* TODO: ko */
    itinerary_tipAi: 'AI recommends spots', /* TODO: ko */
    itinerary_tipPlanning: 'Auto daily planning', /* TODO: ko */
    itinerary_tipNav: 'Real-time navigation', /* TODO: ko */
    itinerary_createFirst: 'Create First Itinerary', /* TODO: ko */
    itinerary_openList: 'Open itinerary list', /* TODO: ko */
    itinerary_tripAssistant: 'Trip Assistant', /* TODO: ko */
    itinerary_viewDetails: 'View itinerary details', /* TODO: ko */
    itinerary_welcomeSubtitle: 'Tell me where you want to go', /* TODO: ko */
    itinerary_helpText: "Tell me your preferences, I'll recommend places\nTap top-left for trip list, top-right for itinerary", /* TODO: ko */
    itinerary_inputPlaceholder: 'Where do you want to go?', /* TODO: ko */
    itinerary_sendMessage: 'Send message', /* TODO: ko */
    itinerary_myTrips: 'My Trips', /* TODO: ko */
    itinerary_tripsCount: 'trips', /* TODO: ko */
    itinerary_selectMode: 'Select', /* TODO: ko */
    itinerary_cancelSelect: 'Cancel selection', /* TODO: ko */
    itinerary_selectItineraries: 'Select itineraries', /* TODO: ko */
    itinerary_deleteSelected: 'Delete selected itineraries', /* TODO: ko */
    itinerary_deleteCount: 'Delete {count}', /* TODO: ko */
    itinerary_places: 'places', /* TODO: ko */
    itinerary_newTrip: 'New Trip', /* TODO: ko */
    itinerary_itinerary: 'Itinerary', /* TODO: ko */
    itinerary_viewOnGoogleMaps: 'View on Google Maps', /* TODO: ko */
    itinerary_addFromCollection: 'Add from Collection', /* TODO: ko */
    itinerary_noPlaces: 'No places yet\nChat with AI to add some!', /* TODO: ko */
    itinerary_addCount: 'Add ({count})', /* TODO: ko */
    itinerary_searchPlaces: 'Search places...', /* TODO: ko */
    itinerary_noMatchingPlaces: 'No matching places found', /* TODO: ko */
    itinerary_noCollectionPlaces: 'No places in collection\nGo gacha to collect some!', /* TODO: ko */
    itinerary_morePlaces: '{count} more places...', /* TODO: ko */
    itinerary_newItinerary: 'New Itinerary', /* TODO: ko */
    itinerary_tripTitle: 'Trip Title', /* TODO: ko */
    itinerary_tripTitlePlaceholder: 'Name your trip (optional)', /* TODO: ko */
    itinerary_date: 'Date', /* TODO: ko */
    itinerary_country: 'Country', /* TODO: ko */
    itinerary_countryPlaceholder: 'Country', /* TODO: ko */
    itinerary_city: 'City', /* TODO: ko */
    itinerary_cityPlaceholder: 'City', /* TODO: ko */
    itinerary_createItinerary: 'Create Itinerary', /* TODO: ko */
    // ========== Economy ==========
    economy_achievementsTitle: 'Achievements', /* TODO: ko */
    economy_loadFailed: 'Load Failed', /* TODO: ko */
    economy_loadFailedDesc: 'Unable to load economy data. Please try again later.', /* TODO: ko */
    economy_beginnerTasks: 'Beginner Tasks', /* TODO: ko */
    economy_done: 'done', /* TODO: ko */
    economy_achievementProgress: 'Achievement Progress', /* TODO: ko */
    economy_unlocked: 'unlocked', /* TODO: ko */
    economy_noAchievements: 'No achievements yet', /* TODO: ko */
    economy_myPerks: 'My Perks', /* TODO: ko */
    economy_dailyPullLimit: 'Daily Pull Limit', /* TODO: ko */
    economy_pullsPerDay: 'Number of pulls per day', /* TODO: ko */
    economy_inventorySlots: 'Inventory Slots', /* TODO: ko */
    economy_itemsCanHold: 'Number of items you can hold', /* TODO: ko */
    economy_specialistEligibility: 'Specialist Eligibility', /* TODO: ko */
    economy_canApplyNow: 'You can apply now!', /* TODO: ko */
    economy_unlockRequirement: 'Unlock by earning 1,500 coins and "Veteran Traveler" achievement', /* TODO: ko */
    economy_aboutCoins: 'About Coins', /* TODO: ko */
    economy_coinsInfo: 'Earn coins by completing tasks and unlocking achievements. Accumulate coins to unlock more perks!', /* TODO: ko */
    economy_statAchievements: 'Achievements', /* TODO: ko */
    economy_tabDaily: 'Daily', /* TODO: ko */
    economy_tabOnce: 'Once', /* TODO: ko */
    economy_tabTotal: 'Total', /* TODO: ko */
    economy_tabPerks: 'Perks', /* TODO: ko */
    economy_congratsCoupon: 'Congratulations!', /* TODO: ko */
    economy_shareTitle: 'Mibu Gacha Win!', /* TODO: ko */
    economy_shareCopied: 'Copied', /* TODO: ko */
    economy_share: 'Share', /* TODO: ko */
    economy_collect: 'Collect', /* TODO: ko */
    economy_couponExpiry: 'Exp: {month}/{day}', /* TODO: ko */
    economy_shareTextTemplate: '🎰 I got a【{tier}】coupon from Mibu Gacha!\n🎁 {couponName}\n📍 {placeName}\n\nCome play ➜ https://mibu.app', /* TODO: ko */
    favorites_title: 'My Favorites', /* TODO: ko */
    favorites_removeFavorite: 'Remove Favorite', /* TODO: ko */
    favorites_confirmRemove: 'Remove "{name}" from favorites?', /* TODO: ko */
    favorites_remove: 'Remove', /* TODO: ko */
    favorites_error: 'Error', /* TODO: ko */
    favorites_removeFailed: 'Failed to remove favorite', /* TODO: ko */
    favorites_addedAt: 'Added ', /* TODO: ko */
    favorites_totalCount: '{count} favorites', /* TODO: ko */
    favorites_noFavorites: 'No favorites yet', /* TODO: ko */
    favorites_tapToAdd: 'Tap the heart icon in your collection to add favorites', /* TODO: ko */
    collection_myCollection: 'My Collection', /* TODO: ko */
    collection_newPlaces: '{count} new places', /* TODO: ko */
    collection_collected: 'Collected', /* TODO: ko */
    collection_cities: 'Cities', /* TODO: ko */
    collection_categories: 'Categories', /* TODO: ko */
    collection_searchPlaceholder: 'Search places...', /* TODO: ko */
    collection_clearSearch: 'Clear search', /* TODO: ko */
    collection_resultsFound: '{count} results found', /* TODO: ko */
    collection_noMatching: 'No matching places', /* TODO: ko */
    collection_all: 'All', /* TODO: ko */
    collection_loadFailed: 'Failed to load collection', /* TODO: ko */
    collection_loadFailedDetail: 'Please check your connection and try again', /* TODO: ko */
    collection_pleaseLogin: 'Please Login', /* TODO: ko */
    collection_loginForFavorite: 'Login to use favorites', /* TODO: ko */
    collection_addedToFavorites: 'Added to Favorites', /* TODO: ko */
    collection_addedToFavoritesDesc: '{name} has been added to favorites', /* TODO: ko */
    collection_operationFailed: 'Failed', /* TODO: ko */
    collection_tryAgainLater: 'Please try again later', /* TODO: ko */
    collection_loginForBlacklist: 'Login to use blacklist', /* TODO: ko */
    collection_addToBlacklist: 'Add to Blacklist', /* TODO: ko */
    collection_confirmBlacklist: 'Are you sure you want to blacklist "{name}"?\nThis place will not appear in future gacha pulls.', /* TODO: ko */
    collection_addedToBlacklist: 'Added to Blacklist', /* TODO: ko */
    collection_addedToBlacklistDesc: '{name} has been blacklisted', /* TODO: ko */
    collection_addToFavorites: 'Add to favorites', /* TODO: ko */
    collection_closeDetails: 'Close details', /* TODO: ko */
    collection_viewOnMap: 'View on map', /* TODO: ko */
    gacha_startGachaExcl: 'Start Gacha!', /* TODO: ko */
    gacha_tierSP: 'SUPER RARE', /* TODO: ko */
    gacha_tierSSR: 'ULTRA RARE', /* TODO: ko */
    gacha_tierSR: 'RARE', /* TODO: ko */
    gacha_tierS: 'SPECIAL', /* TODO: ko */
    gacha_tierR: 'REGULAR', /* TODO: ko */
    gacha_rateLimited: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    gacha_loginRequired: '로그인 필요',
    gacha_loginRequiredDesc: '가챠 기능을 사용하려면 로그인이 필요합니다',
    gacha_goToLogin: '로그인',
    gacha_noPlacesInArea: '이 지역에 장소가 없습니다. 다른 지역을 시도해 주세요.',
    gacha_generationFailed: '여행 일정 생성에 실패했습니다. 다시 시도해 주세요.',
    gacha_loadRegionsFailed: '지역 데이터를 불러오지 못했습니다',
    gacha_loadRegionsRetry: '네트워크 연결을 확인하고 다시 시도해 주세요',
    gacha_selectExploreRegion: '탐험 지역 선택',
    gacha_countryLabel: '국가',
    gacha_cityRegionLabel: '도시/지역',
    gacha_pullCountLabel: '가챠 횟수',
    gacha_dailyLimitInfo: '하루 최대 36회',
    gacha_pullUnit: '회',
    gacha_itemBoxFull: '보관함이 가득 찼습니다',
    gacha_itemBoxFullDesc: '먼저 아이템을 정리해 주세요',
    gacha_goTo: '이동',
    gacha_slotsRemaining: '{count}칸 남음',
    gacha_probabilityInfo: '확률 안내',
    gacha_rareCoupons: 'SP/SSR 레어 쿠폰',
    gacha_noRareCoupons: '이 지역에는 레어 쿠폰이 없습니다',
    // ---- Merchant 五大畫面遷移用 ----
    merchant_dashboard: 'Merchant Dashboard', /* TODO: ko */
    merchant_editPlace: 'Edit Place', /* TODO: ko */
    merchant_basicInfoReadonly: 'Basic Info (Read-only)', /* TODO: ko */
    merchant_location: 'Location', /* TODO: ko */
    merchant_editableInfo: 'Editable Info', /* TODO: ko */
    merchant_description: 'Description', /* TODO: ko */
    merchant_descriptionPlaceholder: 'Enter description...', /* TODO: ko */
    merchant_googleMapUrl: 'Google Map URL', /* TODO: ko */
    merchant_googleMapUrlPlaceholder: 'Paste Google Map URL', /* TODO: ko */
    merchant_openingHours: 'Opening Hours', /* TODO: ko */
    merchant_openingHoursPlaceholder: 'e.g., Mon-Fri 09:00-18:00', /* TODO: ko */
    merchant_openingHoursHint: 'One time slot per line', /* TODO: ko */
    merchant_promoSection: 'Promotion', /* TODO: ko */
    merchant_promoTitle: 'Promo Title', /* TODO: ko */
    merchant_promoTitlePlaceholder: 'e.g., 10% off for new customers', /* TODO: ko */
    merchant_promoDescription: 'Promo Description', /* TODO: ko */
    merchant_promoDescriptionPlaceholder: 'Enter promo details...', /* TODO: ko */
    merchant_enablePromo: 'Enable Promotion', /* TODO: ko */
    merchant_saving: 'Saving...', /* TODO: ko */
    merchant_dailyCode: "Today's Verification Code", /* TODO: ko */
    merchant_expiresAt: 'Valid until', /* TODO: ko */
    merchant_creditBalance: 'Credit Balance', /* TODO: ko */
    merchant_points: 'pts', /* TODO: ko */
    merchant_topUp: 'Top Up', /* TODO: ko */
    merchant_payStripe: 'Pay with Stripe', /* TODO: ko */
    merchant_payRecur: 'Pay with Recur', /* TODO: ko */
    merchant_purchaseCredits: 'Purchase Credits', /* TODO: ko */
    merchant_min100: 'Minimum 100 points', /* TODO: ko */
    merchant_demoCafe: 'Demo Cafe', /* TODO: ko */
    merchant_transactionCreated: 'Transaction created', /* TODO: ko */
    merchant_purchaseFailed: 'Purchase failed', /* TODO: ko */
    merchant_analyticsDesc: 'View statistics and insights', /* TODO: ko */
    merchant_storeManagement: 'Store Management', /* TODO: ko */
    merchant_storeManagementDesc: 'Manage your store info', /* TODO: ko */
    merchant_productManagementLabel: 'Product Management', /* TODO: ko */
    merchant_productManagementDesc: 'Manage products and services', /* TODO: ko */
    merchant_couponManagement: 'Coupon Management', /* TODO: ko */
    merchant_couponManagementDesc: 'Create and manage coupons', /* TODO: ko */
    merchant_merchantProfile: 'Merchant Profile', /* TODO: ko */
    merchant_merchantProfileDesc: 'Edit basic merchant info', /* TODO: ko */
    merchant_tierProbability: 'Draw Probability', /* TODO: ko */
    merchant_claimNew: 'Claim New Place', /* TODO: ko */
    merchant_loadPlacesFailed: 'Failed to load places', /* TODO: ko */
    merchant_checkConnection: 'Please check your connection and try again', /* TODO: ko */
    merchant_placeManagement: 'Place Management', /* TODO: ko */
    merchant_accountStatus: 'Account Status', /* TODO: ko */
    merchant_subscriptionPlan: 'Subscription Plan', /* TODO: ko */
    merchant_freePlan: 'Free Plan', /* TODO: ko */
    merchant_partnerPlan: 'Partner', /* TODO: ko */
    merchant_premiumPlan: 'Premium', /* TODO: ko */
    merchant_memberSince: 'Member Since', /* TODO: ko */
    merchant_dangerZone: 'Danger Zone', /* TODO: ko */
    merchant_confirmDeleteTitle: 'Confirm Delete Account', /* TODO: ko */
    merchant_confirmDeleteMessage: 'This action cannot be undone. All your data will be permanently deleted.', /* TODO: ko */
    merchant_confirmDeleteBtn: 'Confirm Delete', /* TODO: ko */
    merchant_deleteFailed: 'Delete failed, please try again later', /* TODO: ko */
    merchant_deleteAccount: 'Delete Account', /* TODO: ko */
    merchant_accountDeleted: 'Account deleted', /* TODO: ko */
    merchant_searchFailedRetry: 'Search failed, please try again', /* TODO: ko */
    merchant_validUntilWithFormat: 'Valid Until (YYYY-MM-DD)', /* TODO: ko */

    // ========== SettingsScreen ==========
    settings_title: '설정',
    settings_account: '계정',
    settings_profile: '프로필',
    settings_language: '언어',
    settings_about: '정보',
    settings_privacyPolicy: '개인정보 처리방침',
    settings_termsOfService: '이용약관',
    settings_helpCenter: '고객센터',
    settings_admin: '관리자',
    settings_globalExclusions: 'Global Exclusions', /* TODO: ko */
    settings_accountManagement: 'Account Management', /* TODO: ko */
    settings_logout: '로그아웃',
    settings_deleteAccount: '계정 삭제',
    settings_selectLanguage: '언어 선택',
    settings_confirmLogout: '로그아웃 확인',
    settings_confirmLogoutDesc: '로그아웃하시겠습니까?',
    settings_deleteAccountTitle: '계정 삭제',
    settings_deleteAccountDesc: 'Delete your account? This cannot be undone.', /* TODO: ko */
    settings_cannotDelete: 'Cannot Delete', /* TODO: ko */
    settings_deleteFailed: 'Delete failed, please try again', /* TODO: ko */
    settings_deactivateMerchantFirst: 'Please deactivate merchant account first', /* TODO: ko */
    settings_mergeAccounts: 'Merge Accounts', /* TODO: ko */
    settings_mergeAccountsDesc: 'Merge Accounts', /* TODO: ko */
    settings_continue: '계속',
    settings_loginSecondary: 'Login Secondary Account', /* TODO: ko */
    settings_loginSecondaryDesc: 'Login Secondary Account', /* TODO: ko */
    settings_loginToMerge: 'Login account to merge', /* TODO: ko */
    settings_merging: 'Merging...', /* TODO: ko */
    settings_mergingDesc: 'Please wait', /* TODO: ko */
    settings_mergeSuccess: 'Merge Successful!', /* TODO: ko */
    settings_mergeFailed: 'Merge Failed', /* TODO: ko */
    settings_mergeFailedRetry: 'Merge failed', /* TODO: ko */
    settings_mergedData: 'Merged data:', /* TODO: ko */
    settings_collections: '도감',
    settings_itineraries: '일정',
    settings_favorites: '즐겨찾기',
    settings_achievements: '업적',
    settings_coins: '코인',
    settings_balance: '잔액',
    settings_unknownError: 'An unknown error occurred', /* TODO: ko */
    settings_pleaseLoginFirst: 'Please login first', /* TODO: ko */

    // ========== ProfileScreen ==========
    profile_title: '프로필',
    profile_save: '저장',
    profile_uploading: '업로드 중...',
    profile_tapToChange: '탭하여 아바타 변경',
    profile_userId: '사용자 ID',
    profile_enterEmail: 'Enter email', /* TODO: ko */
    profile_lastName: '성',
    profile_firstName: '이름',
    profile_enterLastName: 'Enter last name', /* TODO: ko */
    profile_enterFirstName: 'Enter first name', /* TODO: ko */
    profile_gender: '성별',
    profile_select: '선택',
    profile_birthDate: '생년월일',
    profile_phone: '전화번호',
    profile_enterPhone: 'Enter phone number', /* TODO: ko */
    profile_dietaryRestrictions: '식이 제한',
    profile_dietaryPlaceholder: 'e.g., Vegetarian, Seafood allergy', /* TODO: ko */
    profile_medicalHistory: '병력',
    profile_medicalPlaceholder: 'e.g., Diabetes, Hypertension', /* TODO: ko */
    profile_emergencyContact: '긴급 연락처',
    profile_contactName: '이름',
    profile_enterName: 'Enter name', /* TODO: ko */
    profile_contactPhone: '전화',
    profile_enterContactPhone: 'Enter phone', /* TODO: ko */
    profile_relationship: '관계',
    profile_chooseAvatar: '아바타 선택',
    profile_uploadAvatar: 'Upload Custom Avatar', /* TODO: ko */
    profile_profileUpdated: 'Profile updated', /* TODO: ko */
    profile_saveFailed: 'Failed to save', /* TODO: ko */
    profile_loadFailed: 'Failed to load profile', /* TODO: ko */
    profile_photoPermissionRequired: 'Photo library permission required', /* TODO: ko */
    profile_cannotReadImage: 'Cannot read image data', /* TODO: ko */
    profile_avatarUploaded: 'Avatar uploaded', /* TODO: ko */
    profile_uploadFailed: 'Upload failed', /* TODO: ko */
    profile_uploadFailedRetry: 'Upload failed, please try again', /* TODO: ko */
    profile_previewAvatar: '아바타 미리보기',
    profile_previewConfirm: '사용하기',
    profile_previewCancel: '다시 선택',
    profile_genderMale: '남성',
    profile_genderFemale: '여성',
    profile_genderOther: '기타',
    profile_relationSpouse: '배우자',
    profile_relationParent: '부모',
    profile_relationSibling: '형제자매',
    profile_relationFriend: '친구',
    profile_relationOther: '기타',

    // ========== AccountScreen ==========
    auth_linkedAccounts: 'Linked Accounts', /* TODO: ko */
    auth_linkMultipleDesc: 'Link multiple accounts', /* TODO: ko */
    auth_linkedAccountsSection: 'Linked Accounts', /* TODO: ko */
    auth_noAccountsLinked: 'No accounts linked', /* TODO: ko */
    auth_addAccount: 'Add Account', /* TODO: ko */
    auth_linkApple: 'Link Apple', /* TODO: ko */
    auth_signInApple: 'Sign in with Apple ID', /* TODO: ko */
    auth_linkGoogle: 'Link Google', /* TODO: ko */
    auth_signInGoogle: 'Sign in with Google', /* TODO: ko */
    auth_allLinked: 'All accounts linked', /* TODO: ko */
    auth_linkSuccess: 'Linked!', /* TODO: ko */
    auth_appleLinkSuccess: 'Apple account linked', /* TODO: ko */
    auth_linkFailed: 'Link Failed', /* TODO: ko */
    auth_appleLinkFailed: 'Failed to link Apple', /* TODO: ko */
    auth_comingSoon: 'Coming Soon', /* TODO: ko */
    auth_googleComingSoon: 'Google linking coming soon', /* TODO: ko */
    auth_cannotUnlink: 'Cannot Unlink', /* TODO: ko */
    auth_keepOneMethod: 'Keep at least one login method', /* TODO: ko */
    auth_cannotUnlinkPrimary: 'Cannot unlink primary method', /* TODO: ko */
    auth_confirmUnlink: 'Confirm Unlink', /* TODO: ko */
    auth_confirmUnlinkDesc: 'Unlink {provider} account?', /* TODO: ko */
    auth_unlink: 'Unlink', /* TODO: ko */
    auth_unlinkSuccess: 'Unlinked!', /* TODO: ko */
    auth_unlinkSuccessDesc: 'Account unlinked', /* TODO: ko */
    auth_unlinkFailed: 'Unlink Failed', /* TODO: ko */
    auth_unlinkFailedRetry: 'Failed to unlink', /* TODO: ko */
    auth_primary: 'Primary', /* TODO: ko */
    auth_noEmailProvided: '(No email)', /* TODO: ko */
    auth_linkedAt: 'Linked ', /* TODO: ko */

    // ========== HomeScreen ==========
    home_greeting: '안녕하세요, 여행자!',
    home_greetingSubtitle: '오늘은 어디를 탐험하시겠어요?',
    home_newsTab: '공지',
    home_localTab: '로컬',
    home_flashTab: '플래시',
    home_noAnnouncements: '공지사항이 없습니다',
    home_stayTuned: '새 소식을 기대해주세요!',
    home_noLocalActivities: 'No local activities', /* TODO: ko */
    home_discoverNearby: 'Discover events near you!', /* TODO: ko */
    home_noFlashEvents: 'No flash events', /* TODO: ko */
    home_limitedOffersSoon: 'Limited offers coming soon!', /* TODO: ko */
    home_loginStreak: '연속 로그인',
    home_days: '일',
    home_specialistReady: 'Specialist Ready', /* TODO: ko */
    home_dailyTasks: '일일 과제',
    home_done: '완료',
    home_earned: '획득',
    home_coinsUnit: '코인',
    home_titleLegendary: 'Legendary', /* TODO: ko */
    home_titleExpert: 'Expert', /* TODO: ko */
    home_titleTraveler: 'Traveler', /* TODO: ko */
    home_titleExplorer: 'Explorer', /* TODO: ko */
    home_titleNewbie: 'Newbie', /* TODO: ko */
  },
};

/**
 * 取得分類的多語系標籤
 *
 * @param category - 分類名稱（如 'food', 'stay' 等）
 * @param language - 目標語系
 * @returns 該分類在指定語系的標籤文字
 *
 * @example
 * getCategoryLabel('food', 'zh-TW'); // '美食'
 * getCategoryLabel('food', 'en');    // 'Food'
 * getCategoryLabel('food', 'ja');    // 'グルメ'
 */
export const getCategoryLabel = (category: string, language: Language): string => {
  const labels: Record<string, Record<Language, string>> = {
    food: { 'zh-TW': '美食', en: 'Food', ja: 'グルメ', ko: '맛집' },
    stay: { 'zh-TW': '住宿', en: 'Stay', ja: '宿泊', ko: '숙박' },
    education: { 'zh-TW': '生態文化', en: 'Culture', ja: '文化', ko: '문화' },
    entertainment: { 'zh-TW': '娛樂', en: 'Fun', ja: '娯楽', ko: '놀이' },
    scenery: { 'zh-TW': '景點', en: 'Scenery', ja: '景色', ko: '명소' },
    shopping: { 'zh-TW': '購物', en: 'Shop', ja: '買物', ko: '쇼핑' },
    activity: { 'zh-TW': '體驗', en: 'Activity', ja: '体験', ko: '체험' },
    experience: { 'zh-TW': '體驗', en: 'Experience', ja: '体験', ko: '체험' },
  };
  const categoryKey = category?.toLowerCase() || '';
  return labels[categoryKey]?.[language] || labels[categoryKey]?.['zh-TW'] || category || '';
};

/**
 * 取得分類的對應顏色
 *
 * @param category - 分類名稱
 * @returns 該分類的 HEX 色碼，若找不到則回傳預設紫色
 *
 * @example
 * getCategoryColor('food'); // '#ea580c'
 */
export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category?.toLowerCase()] || '#6366f1';
};
