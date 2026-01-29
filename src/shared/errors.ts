/**
 * 與後端 MIBU_REPLIT/shared/errors.ts 同步
 *
 * #034: 統一使用 @shared 的錯誤碼定義
 * 此檔案現在 re-export from @shared，保持向後兼容
 */

// ====== 從 @shared 統一匯入 ======
export {
  ErrorCode,
  ErrorMessages,
  createErrorResponse,
  getErrorMessage,
  isAuthError as sharedIsAuthError,
  isServerError as sharedIsServerError,
  type ApiErrorResponse,
  type ApiSuccessResponse,
} from '@shared';

// ====== 內部 import（用於 helper functions）======
import { ErrorCode as SharedErrorCode } from '@shared';

/**
 * 檢查是否為認證錯誤（向後兼容版本，接受 string | undefined）
 */
export function isAuthError(code: string | undefined): boolean {
  if (!code) return false;
  // 先檢查 @shared 的 isAuthError
  if (code.startsWith('E1')) return true;
  // 相容舊的英文錯誤碼
  const legacyAuthCodes = ['UNAUTHORIZED', 'INVALID_TOKEN', 'TOKEN_EXPIRED', 'TOKEN_INVALID', 'USER_NOT_FOUND', 'FORBIDDEN'];
  return legacyAuthCodes.includes(code);
}

/**
 * 檢查是否為伺服器錯誤（向後兼容版本）
 */
export function isServerError(code: string | undefined): boolean {
  if (!code) return false;
  return code.startsWith('E9');
}

// ====== 向後兼容的 Helper Functions ======

/**
 * Helper: 檢查是否為 Gacha 錯誤
 */
export function isGachaError(code: string): boolean {
  return [
    SharedErrorCode.GACHA_NO_CREDITS,
    SharedErrorCode.GACHA_RATE_LIMITED,
    SharedErrorCode.GACHA_GENERATION_FAILED,
  ].includes(code as SharedErrorCode);
}

/**
 * Helper: 檢查是否為庫存/資源錯誤
 */
export function isResourceError(code: string): boolean {
  return code.startsWith('E6');
}

/**
 * Helper: 檢查是否為商家錯誤
 */
export function isMerchantError(code: string): boolean {
  return code.startsWith('E4');
}

/**
 * Helper: 檢查是否為驗證錯誤
 */
export function isValidationError(code: string): boolean {
  return code.startsWith('E5');
}

// ====== 向後兼容的舊錯誤碼映射 ======
// 這些是舊 API 可能回傳的英文錯誤碼，映射到新的 ErrorCode

export const LEGACY_ERROR_MAPPING: Record<string, SharedErrorCode> = {
  // Auth
  'INVALID_CREDENTIALS': SharedErrorCode.INVALID_CREDENTIALS,
  'TOKEN_EXPIRED': SharedErrorCode.AUTH_TOKEN_EXPIRED,
  'TOKEN_INVALID': SharedErrorCode.AUTH_TOKEN_INVALID,
  'UNAUTHORIZED': SharedErrorCode.AUTH_REQUIRED,
  'FORBIDDEN': SharedErrorCode.FORBIDDEN,

  // Gacha
  'DAILY_LIMIT_EXCEEDED': SharedErrorCode.DAILY_LIMIT_REACHED,
  'EXCEEDS_REMAINING_QUOTA': SharedErrorCode.GACHA_NO_CREDITS,
  'GENERATION_FAILED': SharedErrorCode.GACHA_GENERATION_FAILED,
  'DEVICE_LIMIT_EXCEEDED': SharedErrorCode.DAILY_LIMIT_REACHED,
  'DEVICE_DAILY_LIMIT': SharedErrorCode.DAILY_LIMIT_REACHED,

  // Merchant
  'MERCHANT_NOT_FOUND': SharedErrorCode.MERCHANT_NOT_FOUND,
  'COUPON_NOT_FOUND': SharedErrorCode.COUPON_NOT_FOUND,
  'COUPON_EXPIRED': SharedErrorCode.COUPON_EXPIRED,
  'INVALID_REDEMPTION_CODE': SharedErrorCode.INVALID_CODE,

  // Resource
  'COLLECTION_NOT_FOUND': SharedErrorCode.COLLECTION_NOT_FOUND,
  'PLACE_NOT_FOUND': SharedErrorCode.PLACE_NOT_FOUND,
  'USER_NOT_FOUND': SharedErrorCode.USER_NOT_FOUND,

  // Server
  'RATE_LIMIT_EXCEEDED': SharedErrorCode.RATE_LIMITED,
  'SERVICE_UNAVAILABLE': SharedErrorCode.SERVICE_UNAVAILABLE,
  'INTERNAL_ERROR': SharedErrorCode.INTERNAL_ERROR,
};

/**
 * 將舊的英文錯誤碼轉換為新的 ErrorCode
 */
export function normalizeErrorCode(code: string): SharedErrorCode | string {
  return LEGACY_ERROR_MAPPING[code] || code;
}

// ====== 向後兼容的舊 ErrorCode（已棄用）======
// 這些保留給還沒更新的程式碼使用

/** @deprecated 使用 ErrorCode.GACHA_RATE_LIMITED */
export const GACHA_DAILY_LIMIT = SharedErrorCode.GACHA_RATE_LIMITED;

/** @deprecated 使用 ErrorCode.GACHA_NO_CREDITS */
export const GACHA_NO_CREDITS = SharedErrorCode.GACHA_NO_CREDITS;

/** @deprecated 使用 ErrorCode.GACHA_GENERATION_FAILED */
export const GACHA_NO_PLACES = SharedErrorCode.GACHA_GENERATION_FAILED;
