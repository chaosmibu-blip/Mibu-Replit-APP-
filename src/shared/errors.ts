// 與後端 MIBU_REPLIT/shared/errors.ts 同步
// ErrorCode enum 的值要和後端一致

export enum ErrorCode {
  // 認證相關 (E1xxx)
  AUTH_REQUIRED = 'E1001',
  AUTH_TOKEN_EXPIRED = 'E1002',
  AUTH_TOKEN_INVALID = 'E1003',
  AUTH_USER_NOT_FOUND = 'E1004',
  AUTH_FORBIDDEN = 'E1005',

  // Gacha 相關 (E2xxx)
  GACHA_NO_CREDITS = 'E2001',
  GACHA_DAILY_LIMIT = 'E2002',
  GACHA_NO_PLACES = 'E2003',
  GACHA_INVENTORY_FULL = 'E2004',
  GACHA_REGION_NOT_FOUND = 'E2005',

  // 庫存相關 (E3xxx)
  INVENTORY_FULL = 'E3001',
  INVENTORY_ITEM_NOT_FOUND = 'E3002',
  INVENTORY_ITEM_EXPIRED = 'E3003',
  INVENTORY_ITEM_USED = 'E3004',
  INVENTORY_REDEEM_FAILED = 'E3005',

  // 驗證相關 (E4xxx)
  VALIDATION_ERROR = 'E4001',
  VALIDATION_MISSING_FIELD = 'E4002',
  VALIDATION_INVALID_FORMAT = 'E4003',
  NOT_FOUND = 'E4004',

  // 商家相關 (E5xxx)
  MERCHANT_NOT_FOUND = 'E5001',
  MERCHANT_NOT_VERIFIED = 'E5002',
  MERCHANT_COUPON_INVALID = 'E5003',
  MERCHANT_DAILY_CODE_EXPIRED = 'E5004',

  // 伺服器錯誤 (E9xxx)
  SERVER_ERROR = 'E9001',
  SERVICE_UNAVAILABLE = 'E9002',
  RATE_LIMIT_EXCEEDED = 'E9003',
}

export interface ApiError {
  error: string;    // 錯誤訊息
  code: ErrorCode;  // 錯誤代碼
}

// Helper: 檢查是否為認證錯誤
export function isAuthError(code: string): boolean {
  return [
    ErrorCode.AUTH_REQUIRED,
    ErrorCode.AUTH_TOKEN_EXPIRED,
    ErrorCode.AUTH_TOKEN_INVALID,
    ErrorCode.AUTH_USER_NOT_FOUND,
    ErrorCode.AUTH_FORBIDDEN,
  ].includes(code as ErrorCode);
}

// Helper: 檢查是否為 Gacha 錯誤
export function isGachaError(code: string): boolean {
  return [
    ErrorCode.GACHA_NO_CREDITS,
    ErrorCode.GACHA_DAILY_LIMIT,
    ErrorCode.GACHA_NO_PLACES,
    ErrorCode.GACHA_INVENTORY_FULL,
    ErrorCode.GACHA_REGION_NOT_FOUND,
  ].includes(code as ErrorCode);
}

// Helper: 檢查是否為庫存錯誤
export function isInventoryError(code: string): boolean {
  return [
    ErrorCode.INVENTORY_FULL,
    ErrorCode.INVENTORY_ITEM_NOT_FOUND,
    ErrorCode.INVENTORY_ITEM_EXPIRED,
    ErrorCode.INVENTORY_ITEM_USED,
    ErrorCode.INVENTORY_REDEEM_FAILED,
  ].includes(code as ErrorCode);
}

// Helper: 檢查是否為商家錯誤
export function isMerchantError(code: string): boolean {
  return [
    ErrorCode.MERCHANT_NOT_FOUND,
    ErrorCode.MERCHANT_NOT_VERIFIED,
    ErrorCode.MERCHANT_COUPON_INVALID,
    ErrorCode.MERCHANT_DAILY_CODE_EXPIRED,
  ].includes(code as ErrorCode);
}
