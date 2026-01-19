/**
 * API 錯誤碼定義
 * 依據後端合約 COMMON.md 定義
 */

// E1xxx: 認證相關錯誤
export const AUTH_ERRORS = {
  E1001: 'INVALID_CREDENTIALS',
  E1002: 'TOKEN_EXPIRED',
  E1003: 'TOKEN_INVALID',
  E1004: 'UNAUTHORIZED',
  E1005: 'ROLE_NOT_ALLOWED',
  E1006: 'OAUTH_FAILED',
  E1007: 'OAUTH_TOKEN_INVALID',
  E1008: 'USER_NOT_FOUND',
  E1009: 'SESSION_EXPIRED',
  E1010: 'ACCOUNT_DISABLED',
  E1011: 'ACCOUNT_PENDING_APPROVAL',
  E1012: 'ROLE_SWITCH_NOT_ALLOWED',
  E1013: 'SUPER_ADMIN_REQUIRED',
} as const;

// E2xxx: 扭蛋相關錯誤
export const GACHA_ERRORS = {
  E2001: 'DAILY_LIMIT_EXCEEDED',
  E2002: 'EXCEEDS_REMAINING_QUOTA',
  E2003: 'GENERATION_FAILED',
} as const;

// E3xxx: 地點相關錯誤
export const LOCATION_ERRORS = {
  E3001: 'DISTRICT_NOT_FOUND',
  E3002: 'REGION_NOT_FOUND',
  E3003: 'COUNTRY_NOT_FOUND',
  E3004: 'PLACE_NOT_FOUND',
  E3005: 'PLACE_ALREADY_CLAIMED',
  E3006: 'INVALID_LOCATION',
} as const;

// E4xxx: 商家相關錯誤
export const MERCHANT_ERRORS = {
  E4001: 'MERCHANT_NOT_FOUND',
  E4002: 'MERCHANT_NOT_APPROVED',
  E4003: 'COUPON_NOT_FOUND',
  E4004: 'COUPON_EXPIRED',
  E4005: 'COUPON_OUT_OF_STOCK',
  E4006: 'INVALID_REDEMPTION_CODE',
  E4007: 'REDEMPTION_CODE_EXPIRED',
  E4008: 'PLACE_LIMIT_EXCEEDED',
  E4009: 'COUPON_LIMIT_EXCEEDED',
  E4010: 'SUBSCRIPTION_REQUIRED',
  E4011: 'INSUFFICIENT_CREDITS',
} as const;

// E5xxx: 驗證相關錯誤
export const VALIDATION_ERRORS = {
  E5001: 'INVALID_INPUT',
  E5002: 'MISSING_REQUIRED_FIELD',
  E5003: 'INVALID_EMAIL',
  E5004: 'INVALID_PHONE',
  E5005: 'PASSWORD_TOO_WEAK',
  E5006: 'INVALID_DATE_FORMAT',
  E5007: 'INVALID_DATE_RANGE',
  E5008: 'FILE_TOO_LARGE',
  E5009: 'INVALID_FILE_TYPE',
  E5010: 'INVITE_CODE_EXPIRED',
} as const;

// E6xxx: 資源相關錯誤
export const RESOURCE_ERRORS = {
  E6001: 'USER_NOT_FOUND',
  E6002: 'COLLECTION_NOT_FOUND',
  E6003: 'INVENTORY_NOT_FOUND',
  E6004: 'SUBSCRIPTION_NOT_FOUND',
  E6005: 'NOTIFICATION_NOT_FOUND',
  E6006: 'ANNOUNCEMENT_NOT_FOUND',
  E6007: 'TRANSACTION_NOT_FOUND',
  E6008: 'RESOURCE_NOT_FOUND',
} as const;

// E7xxx: 支付相關錯誤
export const PAYMENT_ERRORS = {
  E7001: 'PAYMENT_FAILED',
  E7002: 'INSUFFICIENT_BALANCE',
  E7003: 'INVALID_PAYMENT_METHOD',
} as const;

// E9xxx: 伺服器相關錯誤
export const SERVER_ERRORS = {
  E9001: 'RATE_LIMIT_EXCEEDED',
  E9002: 'SERVICE_UNAVAILABLE',
  E9003: 'INTERNAL_ERROR',
  E9004: 'MAINTENANCE_MODE',
} as const;

// E10xxx: 經濟系統相關錯誤
export const ECONOMY_ERRORS = {
  E10001: 'LEVEL_NOT_FOUND',
  E10002: 'ACHIEVEMENT_NOT_FOUND',
  E10003: 'ACHIEVEMENT_NOT_UNLOCKED',
  E10004: 'REWARD_ALREADY_CLAIMED',
  E10005: 'DAILY_LIMIT_REACHED',
  E10006: 'DAILY_TASK_NOT_FOUND',
  E10007: 'DAILY_TASK_ALREADY_COMPLETED',
  E10008: 'INSUFFICIENT_COINS',
} as const;

// E11xxx: 眾籌系統相關錯誤
export const CROWDFUNDING_ERRORS = {
  E11001: 'CAMPAIGN_NOT_FOUND',
  E11002: 'CAMPAIGN_NOT_ACTIVE',
  E11003: 'CAMPAIGN_COMPLETED',
  E11004: 'INVALID_CONTRIBUTION',
  E11005: 'IAP_VERIFICATION_FAILED',
} as const;

// E12xxx: 推薦系統相關錯誤
export const REFERRAL_ERRORS = {
  E12001: 'REFERRAL_CODE_NOT_FOUND',
  E12002: 'REFERRAL_CODE_INVALID',
  E12003: 'REFERRAL_SELF_NOT_ALLOWED',
  E12004: 'REFERRAL_ALREADY_USED',
  E12005: 'REFERRAL_INSUFFICIENT_BALANCE',
  E12006: 'WITHDRAW_MIN_AMOUNT',
  E12007: 'WITHDRAW_PENDING',
  E12008: 'BANK_INFO_REQUIRED',
} as const;

// E13xxx: 貢獻系統相關錯誤
export const CONTRIBUTION_ERRORS = {
  E13001: 'REPORT_DUPLICATE',
  E13002: 'SUGGESTION_DUPLICATE',
  E13003: 'VOTE_ALREADY_CAST',
  E13004: 'VOTE_NOT_ELIGIBLE',
  E13005: 'CONTRIBUTION_LIMIT_REACHED',
} as const;

// 合併所有錯誤碼
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

export type ErrorCode = keyof typeof ERROR_CODES;
export type ErrorMessage = typeof ERROR_CODES[ErrorCode];

/**
 * API 錯誤回應介面
 */
export interface ApiError {
  success: false;
  error: string;
  code: ErrorMessage;
  details?: Record<string, unknown>;
}

/**
 * 判斷是否為 API 錯誤
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
 */
export function getErrorMessage(code: ErrorMessage, language: 'zh-TW' | 'en' = 'zh-TW'): string {
  const messages: Record<ErrorMessage, { 'zh-TW': string; en: string }> = {
    // Auth errors
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

    // Gacha errors
    DAILY_LIMIT_EXCEEDED: { 'zh-TW': '今日抽卡次數已達上限', en: 'Daily limit exceeded' },
    EXCEEDS_REMAINING_QUOTA: { 'zh-TW': '超過剩餘配額', en: 'Exceeds remaining quota' },
    GENERATION_FAILED: { 'zh-TW': '行程生成失敗，請稍後再試', en: 'Generation failed' },

    // Location errors
    DISTRICT_NOT_FOUND: { 'zh-TW': '找不到該行政區', en: 'District not found' },
    REGION_NOT_FOUND: { 'zh-TW': '找不到該地區', en: 'Region not found' },
    COUNTRY_NOT_FOUND: { 'zh-TW': '找不到該國家', en: 'Country not found' },
    PLACE_NOT_FOUND: { 'zh-TW': '找不到該地點', en: 'Place not found' },
    PLACE_ALREADY_CLAIMED: { 'zh-TW': '該地點已被認領', en: 'Place already claimed' },
    INVALID_LOCATION: { 'zh-TW': '無效的位置資訊', en: 'Invalid location' },

    // Merchant errors
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

    // Validation errors
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

    // Resource errors
    COLLECTION_NOT_FOUND: { 'zh-TW': '找不到收藏項目', en: 'Collection not found' },
    INVENTORY_NOT_FOUND: { 'zh-TW': '找不到背包項目', en: 'Inventory item not found' },
    SUBSCRIPTION_NOT_FOUND: { 'zh-TW': '找不到訂閱資訊', en: 'Subscription not found' },
    NOTIFICATION_NOT_FOUND: { 'zh-TW': '找不到通知', en: 'Notification not found' },
    ANNOUNCEMENT_NOT_FOUND: { 'zh-TW': '找不到公告', en: 'Announcement not found' },
    TRANSACTION_NOT_FOUND: { 'zh-TW': '找不到交易記錄', en: 'Transaction not found' },
    RESOURCE_NOT_FOUND: { 'zh-TW': '找不到資源', en: 'Resource not found' },

    // Payment errors
    PAYMENT_FAILED: { 'zh-TW': '付款失敗', en: 'Payment failed' },
    INSUFFICIENT_BALANCE: { 'zh-TW': '餘額不足', en: 'Insufficient balance' },
    INVALID_PAYMENT_METHOD: { 'zh-TW': '無效的付款方式', en: 'Invalid payment method' },

    // Server errors
    RATE_LIMIT_EXCEEDED: { 'zh-TW': '請求過於頻繁，請稍後再試', en: 'Rate limit exceeded' },
    SERVICE_UNAVAILABLE: { 'zh-TW': '服務暫時無法使用', en: 'Service unavailable' },
    INTERNAL_ERROR: { 'zh-TW': '系統錯誤，請稍後再試', en: 'Internal error' },
    MAINTENANCE_MODE: { 'zh-TW': '系統維護中', en: 'System under maintenance' },

    // Economy errors (E10xxx)
    LEVEL_NOT_FOUND: { 'zh-TW': '等級資料不存在', en: 'Level data not found' },
    ACHIEVEMENT_NOT_FOUND: { 'zh-TW': '成就不存在', en: 'Achievement not found' },
    ACHIEVEMENT_NOT_UNLOCKED: { 'zh-TW': '成就尚未解鎖', en: 'Achievement not unlocked' },
    REWARD_ALREADY_CLAIMED: { 'zh-TW': '獎勵已領取', en: 'Reward already claimed' },
    DAILY_LIMIT_REACHED: { 'zh-TW': '已達每日上限', en: 'Daily limit reached' },
    DAILY_TASK_NOT_FOUND: { 'zh-TW': '找不到每日任務', en: 'Daily task not found' },
    DAILY_TASK_ALREADY_COMPLETED: { 'zh-TW': '此任務今日已完成', en: 'Daily task already completed' },
    INSUFFICIENT_COINS: { 'zh-TW': '金幣不足', en: 'Insufficient coins' },

    // Crowdfunding errors (E11xxx)
    CAMPAIGN_NOT_FOUND: { 'zh-TW': '募資活動不存在', en: 'Campaign not found' },
    CAMPAIGN_NOT_ACTIVE: { 'zh-TW': '募資活動未開放', en: 'Campaign not active' },
    CAMPAIGN_COMPLETED: { 'zh-TW': '募資活動已結束', en: 'Campaign completed' },
    INVALID_CONTRIBUTION: { 'zh-TW': '無效的貢獻金額', en: 'Invalid contribution amount' },
    IAP_VERIFICATION_FAILED: { 'zh-TW': 'IAP 驗證失敗', en: 'IAP verification failed' },

    // Referral errors (E12xxx)
    REFERRAL_CODE_NOT_FOUND: { 'zh-TW': '推薦碼不存在', en: 'Referral code not found' },
    REFERRAL_CODE_INVALID: { 'zh-TW': '無效的推薦碼', en: 'Invalid referral code' },
    REFERRAL_SELF_NOT_ALLOWED: { 'zh-TW': '不能推薦自己', en: 'Self-referral not allowed' },
    REFERRAL_ALREADY_USED: { 'zh-TW': '已使用過推薦碼', en: 'Referral code already used' },
    REFERRAL_INSUFFICIENT_BALANCE: { 'zh-TW': '餘額不足', en: 'Insufficient balance' },
    WITHDRAW_MIN_AMOUNT: { 'zh-TW': '未達最低提現金額', en: 'Minimum withdrawal amount not met' },
    WITHDRAW_PENDING: { 'zh-TW': '有待處理的提現申請', en: 'Withdrawal pending' },
    BANK_INFO_REQUIRED: { 'zh-TW': '需要銀行帳號資訊', en: 'Bank info required' },

    // Contribution errors (E13xxx)
    REPORT_DUPLICATE: { 'zh-TW': '重複回報', en: 'Duplicate report' },
    SUGGESTION_DUPLICATE: { 'zh-TW': '重複建議', en: 'Duplicate suggestion' },
    VOTE_ALREADY_CAST: { 'zh-TW': '已投過票', en: 'Vote already cast' },
    VOTE_NOT_ELIGIBLE: { 'zh-TW': '無投票資格', en: 'Not eligible to vote' },
    CONTRIBUTION_LIMIT_REACHED: { 'zh-TW': '已達每日貢獻上限', en: 'Daily contribution limit reached' },
  };

  return messages[code]?.[language] || code;
}
