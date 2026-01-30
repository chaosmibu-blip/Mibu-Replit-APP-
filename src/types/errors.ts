/**
 * @fileoverview API 錯誤碼定義
 *
 * 定義所有 API 錯誤碼和錯誤處理相關的型別，包含：
 * - 認證錯誤 (E1xxx)
 * - 扭蛋錯誤 (E2xxx)
 * - 地點錯誤 (E3xxx)
 * - 商家錯誤 (E4xxx)
 * - 驗證錯誤 (E5xxx)
 * - 資源錯誤 (E6xxx)
 * - 支付錯誤 (E7xxx)
 * - 伺服器錯誤 (E9xxx)
 * - 經濟系統錯誤 (E10xxx)
 * - 眾籌錯誤 (E11xxx)
 * - 推薦錯誤 (E12xxx)
 * - 貢獻錯誤 (E13xxx)
 *
 * 依據後端合約 COMMON.md 定義
 * #034: 新增 @shared 的統一錯誤碼匯出
 *
 * @module types/errors
 */

// ============ 從 @shared 統一匯入新錯誤碼系統 ============

export {
  ErrorCode as SharedErrorCode,           // 共用錯誤碼
  ErrorMessages,                          // 錯誤訊息對照表
  createErrorResponse,                    // 建立錯誤回應
  getErrorMessage as getSharedErrorMessage, // 取得錯誤訊息
  isAuthError,                            // 判斷是否為認證錯誤
  isServerError,                          // 判斷是否為伺服器錯誤
  type ApiErrorResponse as SharedApiErrorResponse,     // 錯誤回應型別
  type ApiSuccessResponse as SharedApiSuccessResponse, // 成功回應型別
} from '@shared';

// ============ E1xxx: 認證相關錯誤 ============

/**
 * 認證相關錯誤碼
 */
export const AUTH_ERRORS = {
  E1001: 'INVALID_CREDENTIALS',       // 帳號或密碼錯誤
  E1002: 'TOKEN_EXPIRED',             // Token 已過期
  E1003: 'TOKEN_INVALID',             // Token 無效
  E1004: 'UNAUTHORIZED',              // 未授權
  E1005: 'ROLE_NOT_ALLOWED',          // 角色不允許
  E1006: 'OAUTH_FAILED',              // OAuth 登入失敗
  E1007: 'OAUTH_TOKEN_INVALID',       // OAuth Token 無效
  E1008: 'USER_NOT_FOUND',            // 找不到用戶
  E1009: 'SESSION_EXPIRED',           // Session 已過期
  E1010: 'ACCOUNT_DISABLED',          // 帳號已停用
  E1011: 'ACCOUNT_PENDING_APPROVAL',  // 帳號待審核
  E1012: 'ROLE_SWITCH_NOT_ALLOWED',   // 不允許切換角色
  E1013: 'SUPER_ADMIN_REQUIRED',      // 需要超級管理員權限
} as const;

// ============ E2xxx: 扭蛋相關錯誤 ============

/**
 * 扭蛋相關錯誤碼
 */
export const GACHA_ERRORS = {
  E2001: 'DAILY_LIMIT_EXCEEDED',      // 每日額度已用完
  E2002: 'EXCEEDS_REMAINING_QUOTA',   // 超過剩餘配額
  E2003: 'GENERATION_FAILED',         // 行程生成失敗
} as const;

// ============ E3xxx: 地點相關錯誤 ============

/**
 * 地點相關錯誤碼
 */
export const LOCATION_ERRORS = {
  E3001: 'DISTRICT_NOT_FOUND',        // 找不到區域
  E3002: 'REGION_NOT_FOUND',          // 找不到地區
  E3003: 'COUNTRY_NOT_FOUND',         // 找不到國家
  E3004: 'PLACE_NOT_FOUND',           // 找不到地點
  E3005: 'PLACE_ALREADY_CLAIMED',     // 地點已被認領
  E3006: 'INVALID_LOCATION',          // 無效的位置
} as const;

// ============ E4xxx: 商家相關錯誤 ============

/**
 * 商家相關錯誤碼
 */
export const MERCHANT_ERRORS = {
  E4001: 'MERCHANT_NOT_FOUND',        // 找不到商家
  E4002: 'MERCHANT_NOT_APPROVED',     // 商家未審核通過
  E4003: 'COUPON_NOT_FOUND',          // 找不到優惠券
  E4004: 'COUPON_EXPIRED',            // 優惠券已過期
  E4005: 'COUPON_OUT_OF_STOCK',       // 優惠券已發完
  E4006: 'INVALID_REDEMPTION_CODE',   // 核銷碼無效
  E4007: 'REDEMPTION_CODE_EXPIRED',   // 核銷碼已過期
  E4008: 'PLACE_LIMIT_EXCEEDED',      // 地點認領上限
  E4009: 'COUPON_LIMIT_EXCEEDED',     // 優惠券建立上限
  E4010: 'SUBSCRIPTION_REQUIRED',     // 需要訂閱
  E4011: 'INSUFFICIENT_CREDITS',      // 點數不足
} as const;

// ============ E5xxx: 驗證相關錯誤 ============

/**
 * 驗證相關錯誤碼
 */
export const VALIDATION_ERRORS = {
  E5001: 'INVALID_INPUT',             // 輸入無效
  E5002: 'MISSING_REQUIRED_FIELD',    // 缺少必要欄位
  E5003: 'INVALID_EMAIL',             // Email 格式錯誤
  E5004: 'INVALID_PHONE',             // 電話格式錯誤
  E5005: 'PASSWORD_TOO_WEAK',         // 密碼太弱
  E5006: 'INVALID_DATE_FORMAT',       // 日期格式錯誤
  E5007: 'INVALID_DATE_RANGE',        // 日期範圍錯誤
  E5008: 'FILE_TOO_LARGE',            // 檔案太大
  E5009: 'INVALID_FILE_TYPE',         // 檔案類型不支援
  E5010: 'INVITE_CODE_EXPIRED',       // 邀請碼已過期
} as const;

// ============ E6xxx: 資源相關錯誤 ============

/**
 * 資源相關錯誤碼
 */
export const RESOURCE_ERRORS = {
  E6001: 'USER_NOT_FOUND',            // 找不到用戶
  E6002: 'COLLECTION_NOT_FOUND',      // 找不到收藏
  E6003: 'INVENTORY_NOT_FOUND',       // 找不到背包項目
  E6004: 'SUBSCRIPTION_NOT_FOUND',    // 找不到訂閱
  E6005: 'NOTIFICATION_NOT_FOUND',    // 找不到通知
  E6006: 'ANNOUNCEMENT_NOT_FOUND',    // 找不到公告
  E6007: 'TRANSACTION_NOT_FOUND',     // 找不到交易
  E6008: 'RESOURCE_NOT_FOUND',        // 找不到資源
} as const;

// ============ E7xxx: 支付相關錯誤 ============

/**
 * 支付相關錯誤碼
 */
export const PAYMENT_ERRORS = {
  E7001: 'PAYMENT_FAILED',            // 付款失敗
  E7002: 'INSUFFICIENT_BALANCE',      // 餘額不足
  E7003: 'INVALID_PAYMENT_METHOD',    // 付款方式無效
} as const;

// ============ E9xxx: 伺服器相關錯誤 ============

/**
 * 伺服器相關錯誤碼
 */
export const SERVER_ERRORS = {
  E9001: 'RATE_LIMIT_EXCEEDED',       // 請求過於頻繁
  E9002: 'SERVICE_UNAVAILABLE',       // 服務暫時無法使用
  E9003: 'INTERNAL_ERROR',            // 內部錯誤
  E9004: 'MAINTENANCE_MODE',          // 維護模式
} as const;

// ============ E10xxx: 經濟系統相關錯誤 ============

/**
 * 經濟系統相關錯誤碼
 */
export const ECONOMY_ERRORS = {
  E10001: 'LEVEL_NOT_FOUND',              // 找不到等級
  E10002: 'ACHIEVEMENT_NOT_FOUND',        // 找不到成就
  E10003: 'ACHIEVEMENT_NOT_UNLOCKED',     // 成就未解鎖
  E10004: 'REWARD_ALREADY_CLAIMED',       // 獎勵已領取
  E10005: 'DAILY_LIMIT_REACHED',          // 每日上限已達
  E10006: 'DAILY_TASK_NOT_FOUND',         // 找不到每日任務
  E10007: 'DAILY_TASK_ALREADY_COMPLETED', // 任務已完成
  E10008: 'INSUFFICIENT_COINS',           // 金幣不足
} as const;

// ============ E11xxx: 眾籌系統相關錯誤 ============

/**
 * 眾籌系統相關錯誤碼
 */
export const CROWDFUNDING_ERRORS = {
  E11001: 'CAMPAIGN_NOT_FOUND',       // 找不到募資活動
  E11002: 'CAMPAIGN_NOT_ACTIVE',      // 活動未開放
  E11003: 'CAMPAIGN_COMPLETED',       // 活動已結束
  E11004: 'INVALID_CONTRIBUTION',     // 無效的贊助金額
  E11005: 'IAP_VERIFICATION_FAILED',  // IAP 驗證失敗
} as const;

// ============ E12xxx: 推薦系統相關錯誤 ============

/**
 * 推薦系統相關錯誤碼
 */
export const REFERRAL_ERRORS = {
  E12001: 'REFERRAL_CODE_NOT_FOUND',       // 推薦碼不存在
  E12002: 'REFERRAL_CODE_INVALID',         // 推薦碼無效
  E12003: 'REFERRAL_SELF_NOT_ALLOWED',     // 不能推薦自己
  E12004: 'REFERRAL_ALREADY_USED',         // 已使用過推薦碼
  E12005: 'REFERRAL_INSUFFICIENT_BALANCE', // 餘額不足
  E12006: 'WITHDRAW_MIN_AMOUNT',           // 未達最低提現金額
  E12007: 'WITHDRAW_PENDING',              // 有待處理的提現
  E12008: 'BANK_INFO_REQUIRED',            // 需要銀行資訊
} as const;

// ============ E13xxx: 貢獻系統相關錯誤 ============

/**
 * 貢獻系統相關錯誤碼
 */
export const CONTRIBUTION_ERRORS = {
  E13001: 'REPORT_DUPLICATE',             // 重複回報
  E13002: 'SUGGESTION_DUPLICATE',         // 重複建議
  E13003: 'VOTE_ALREADY_CAST',            // 已投過票
  E13004: 'VOTE_NOT_ELIGIBLE',            // 無投票資格
  E13005: 'CONTRIBUTION_LIMIT_REACHED',   // 每日貢獻上限
} as const;

// ============ 合併所有錯誤碼 ============

/**
 * 所有錯誤碼
 */
export const ERROR_CODES = {
  ...AUTH_ERRORS,
  ...GACHA_ERRORS,
  ...LOCATION_ERRORS,
  ...MERCHANT_ERRORS,
  ...VALIDATION_ERRORS,
  ...RESOURCE_ERRORS,
  ...PAYMENT_ERRORS,
  ...SERVER_ERRORS,
  ...ECONOMY_ERRORS,
  ...CROWDFUNDING_ERRORS,
  ...REFERRAL_ERRORS,
  ...CONTRIBUTION_ERRORS,
} as const;

/**
 * 錯誤碼型別
 */
export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * 錯誤訊息型別
 */
export type ErrorMessage = typeof ERROR_CODES[ErrorCode];

// ============ API 錯誤處理 ============

/**
 * API 錯誤回應介面
 */
export interface ApiError {
  success: false;                       // 固定為 false
  error: string;                        // 錯誤訊息
  code: ErrorMessage;                   // 錯誤碼
  details?: Record<string, unknown>;    // 錯誤詳情
}

/**
 * 判斷是否為 API 錯誤
 *
 * @param response - 待檢查的回應
 * @returns 是否為 API 錯誤
 */
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as ApiError).success === false &&
    'error' in response &&
    'code' in response
  );
}

/**
 * 根據錯誤碼取得用戶友善的錯誤訊息
 *
 * @param code - 錯誤碼
 * @param language - 語言（預設中文）
 * @returns 用戶友善的錯誤訊息
 */
export function getErrorMessage(code: ErrorMessage, language: 'zh-TW' | 'en' = 'zh-TW'): string {
  const messages: Record<ErrorMessage, { 'zh-TW': string; en: string }> = {
    // 認證錯誤 (E1xxx)
    INVALID_CREDENTIALS: { 'zh-TW': '帳號或密碼錯誤', en: 'Invalid credentials' },
    TOKEN_EXPIRED: { 'zh-TW': '登入已過期，請重新登入', en: 'Session expired, please login again' },
    TOKEN_INVALID: { 'zh-TW': '登入資訊無效', en: 'Invalid token' },
    UNAUTHORIZED: { 'zh-TW': '請先登入', en: 'Please login first' },
    ROLE_NOT_ALLOWED: { 'zh-TW': '您沒有權限執行此操作', en: 'You do not have permission' },
    OAUTH_FAILED: { 'zh-TW': '第三方登入失敗', en: 'OAuth login failed' },
    OAUTH_TOKEN_INVALID: { 'zh-TW': '第三方登入驗證失敗', en: 'OAuth token invalid' },
    USER_NOT_FOUND: { 'zh-TW': '找不到使用者', en: 'User not found' },
    SESSION_EXPIRED: { 'zh-TW': '工作階段已過期', en: 'Session expired' },
    ACCOUNT_DISABLED: { 'zh-TW': '帳號已被停用', en: 'Account disabled' },
    ACCOUNT_PENDING_APPROVAL: { 'zh-TW': '帳號審核中', en: 'Account pending approval' },
    ROLE_SWITCH_NOT_ALLOWED: { 'zh-TW': '無法切換角色', en: 'Role switch not allowed' },
    SUPER_ADMIN_REQUIRED: { 'zh-TW': '需要超級管理員權限', en: 'Super admin required' },

    // 扭蛋錯誤 (E2xxx)
    DAILY_LIMIT_EXCEEDED: { 'zh-TW': '今日抽卡次數已達上限', en: 'Daily limit exceeded' },
    EXCEEDS_REMAINING_QUOTA: { 'zh-TW': '超過剩餘配額', en: 'Exceeds remaining quota' },
    GENERATION_FAILED: { 'zh-TW': '行程生成失敗，請稍後再試', en: 'Generation failed' },

    // 地點錯誤 (E3xxx)
    DISTRICT_NOT_FOUND: { 'zh-TW': '找不到該行政區', en: 'District not found' },
    REGION_NOT_FOUND: { 'zh-TW': '找不到該地區', en: 'Region not found' },
    COUNTRY_NOT_FOUND: { 'zh-TW': '找不到該國家', en: 'Country not found' },
    PLACE_NOT_FOUND: { 'zh-TW': '找不到該地點', en: 'Place not found' },
    PLACE_ALREADY_CLAIMED: { 'zh-TW': '該地點已被認領', en: 'Place already claimed' },
    INVALID_LOCATION: { 'zh-TW': '無效的位置資訊', en: 'Invalid location' },

    // 商家錯誤 (E4xxx)
    MERCHANT_NOT_FOUND: { 'zh-TW': '找不到商家資訊', en: 'Merchant not found' },
    MERCHANT_NOT_APPROVED: { 'zh-TW': '商家帳號尚未審核通過', en: 'Merchant not approved' },
    COUPON_NOT_FOUND: { 'zh-TW': '找不到優惠券', en: 'Coupon not found' },
    COUPON_EXPIRED: { 'zh-TW': '優惠券已過期', en: 'Coupon expired' },
    COUPON_OUT_OF_STOCK: { 'zh-TW': '優惠券已發完', en: 'Coupon out of stock' },
    INVALID_REDEMPTION_CODE: { 'zh-TW': '核銷碼無效', en: 'Invalid redemption code' },
    REDEMPTION_CODE_EXPIRED: { 'zh-TW': '核銷碼已過期', en: 'Redemption code expired' },
    PLACE_LIMIT_EXCEEDED: { 'zh-TW': '已達地點認領上限', en: 'Place limit exceeded' },
    COUPON_LIMIT_EXCEEDED: { 'zh-TW': '已達優惠券建立上限', en: 'Coupon limit exceeded' },
    SUBSCRIPTION_REQUIRED: { 'zh-TW': '需要升級訂閱方案', en: 'Subscription required' },
    INSUFFICIENT_CREDITS: { 'zh-TW': '點數不足', en: 'Insufficient credits' },

    // 驗證錯誤 (E5xxx)
    INVALID_INPUT: { 'zh-TW': '輸入資料格式錯誤', en: 'Invalid input' },
    MISSING_REQUIRED_FIELD: { 'zh-TW': '缺少必要欄位', en: 'Missing required field' },
    INVALID_EMAIL: { 'zh-TW': 'Email 格式不正確', en: 'Invalid email format' },
    INVALID_PHONE: { 'zh-TW': '電話格式不正確', en: 'Invalid phone format' },
    PASSWORD_TOO_WEAK: { 'zh-TW': '密碼強度不足', en: 'Password too weak' },
    INVALID_DATE_FORMAT: { 'zh-TW': '日期格式不正確', en: 'Invalid date format' },
    INVALID_DATE_RANGE: { 'zh-TW': '日期範圍不正確', en: 'Invalid date range' },
    FILE_TOO_LARGE: { 'zh-TW': '檔案太大', en: 'File too large' },
    INVALID_FILE_TYPE: { 'zh-TW': '不支援的檔案格式', en: 'Invalid file type' },
    INVITE_CODE_EXPIRED: { 'zh-TW': '邀請碼已過期', en: 'Invite code expired' },

    // 資源錯誤 (E6xxx)
    COLLECTION_NOT_FOUND: { 'zh-TW': '找不到收藏項目', en: 'Collection not found' },
    INVENTORY_NOT_FOUND: { 'zh-TW': '找不到背包項目', en: 'Inventory item not found' },
    SUBSCRIPTION_NOT_FOUND: { 'zh-TW': '找不到訂閱資訊', en: 'Subscription not found' },
    NOTIFICATION_NOT_FOUND: { 'zh-TW': '找不到通知', en: 'Notification not found' },
    ANNOUNCEMENT_NOT_FOUND: { 'zh-TW': '找不到公告', en: 'Announcement not found' },
    TRANSACTION_NOT_FOUND: { 'zh-TW': '找不到交易記錄', en: 'Transaction not found' },
    RESOURCE_NOT_FOUND: { 'zh-TW': '找不到資源', en: 'Resource not found' },

    // 支付錯誤 (E7xxx)
    PAYMENT_FAILED: { 'zh-TW': '付款失敗', en: 'Payment failed' },
    INSUFFICIENT_BALANCE: { 'zh-TW': '餘額不足', en: 'Insufficient balance' },
    INVALID_PAYMENT_METHOD: { 'zh-TW': '無效的付款方式', en: 'Invalid payment method' },

    // 伺服器錯誤 (E9xxx)
    RATE_LIMIT_EXCEEDED: { 'zh-TW': '請求過於頻繁，請稍後再試', en: 'Rate limit exceeded' },
    SERVICE_UNAVAILABLE: { 'zh-TW': '服務暫時無法使用', en: 'Service unavailable' },
    INTERNAL_ERROR: { 'zh-TW': '系統錯誤，請稍後再試', en: 'Internal error' },
    MAINTENANCE_MODE: { 'zh-TW': '系統維護中', en: 'System under maintenance' },

    // 經濟系統錯誤 (E10xxx)
    LEVEL_NOT_FOUND: { 'zh-TW': '等級資料不存在', en: 'Level data not found' },
    ACHIEVEMENT_NOT_FOUND: { 'zh-TW': '成就不存在', en: 'Achievement not found' },
    ACHIEVEMENT_NOT_UNLOCKED: { 'zh-TW': '成就尚未解鎖', en: 'Achievement not unlocked' },
    REWARD_ALREADY_CLAIMED: { 'zh-TW': '獎勵已領取', en: 'Reward already claimed' },
    DAILY_LIMIT_REACHED: { 'zh-TW': '已達每日上限', en: 'Daily limit reached' },
    DAILY_TASK_NOT_FOUND: { 'zh-TW': '找不到每日任務', en: 'Daily task not found' },
    DAILY_TASK_ALREADY_COMPLETED: { 'zh-TW': '此任務今日已完成', en: 'Daily task already completed' },
    INSUFFICIENT_COINS: { 'zh-TW': '金幣不足', en: 'Insufficient coins' },

    // 眾籌錯誤 (E11xxx)
    CAMPAIGN_NOT_FOUND: { 'zh-TW': '募資活動不存在', en: 'Campaign not found' },
    CAMPAIGN_NOT_ACTIVE: { 'zh-TW': '募資活動未開放', en: 'Campaign not active' },
    CAMPAIGN_COMPLETED: { 'zh-TW': '募資活動已結束', en: 'Campaign completed' },
    INVALID_CONTRIBUTION: { 'zh-TW': '無效的貢獻金額', en: 'Invalid contribution amount' },
    IAP_VERIFICATION_FAILED: { 'zh-TW': 'IAP 驗證失敗', en: 'IAP verification failed' },

    // 推薦錯誤 (E12xxx)
    REFERRAL_CODE_NOT_FOUND: { 'zh-TW': '推薦碼不存在', en: 'Referral code not found' },
    REFERRAL_CODE_INVALID: { 'zh-TW': '無效的推薦碼', en: 'Invalid referral code' },
    REFERRAL_SELF_NOT_ALLOWED: { 'zh-TW': '不能推薦自己', en: 'Self-referral not allowed' },
    REFERRAL_ALREADY_USED: { 'zh-TW': '已使用過推薦碼', en: 'Referral code already used' },
    REFERRAL_INSUFFICIENT_BALANCE: { 'zh-TW': '餘額不足', en: 'Insufficient balance' },
    WITHDRAW_MIN_AMOUNT: { 'zh-TW': '未達最低提現金額', en: 'Minimum withdrawal amount not met' },
    WITHDRAW_PENDING: { 'zh-TW': '有待處理的提現申請', en: 'Withdrawal pending' },
    BANK_INFO_REQUIRED: { 'zh-TW': '需要銀行帳號資訊', en: 'Bank info required' },

    // 貢獻錯誤 (E13xxx)
    REPORT_DUPLICATE: { 'zh-TW': '重複回報', en: 'Duplicate report' },
    SUGGESTION_DUPLICATE: { 'zh-TW': '重複建議', en: 'Duplicate suggestion' },
    VOTE_ALREADY_CAST: { 'zh-TW': '已投過票', en: 'Vote already cast' },
    VOTE_NOT_ELIGIBLE: { 'zh-TW': '無投票資格', en: 'Not eligible to vote' },
    CONTRIBUTION_LIMIT_REACHED: { 'zh-TW': '已達每日貢獻上限', en: 'Daily contribution limit reached' },
  };

  return messages[code]?.[language] || code;
}
