/**
 * @fileoverview 錯誤碼處理與向後兼容層
 *
 * 這個檔案負責：
 * 1. 從 @shared 統一匯入錯誤碼定義（前後端共用）
 * 2. 提供向後兼容的 helper functions
 * 3. 舊錯誤碼到新錯誤碼的映射
 *
 * 錯誤碼分類：
 * - E1xxx: 認證相關（Token 過期、未授權）
 * - E2xxx: 扭蛋相關（額度用完、生成失敗）
 * - E4xxx: 商家相關（優惠券問題）
 * - E5xxx: 驗證相關（參數錯誤）
 * - E6xxx: 資源相關（找不到資料）
 * - E9xxx: 伺服器錯誤
 *
 * @see docs/contracts/APP.md 完整錯誤碼定義
 * @see #034 同步任務：統一使用 @shared 的錯誤碼
 *
 * 與後端 MIBU_REPLIT/shared/errors.ts 同步
 */

// ============ 從 @shared 統一匯入 ============
// 這些是前後端共用的錯誤碼定義

export {
  ErrorCode,          // 錯誤碼 enum（如 ErrorCode.AUTH_TOKEN_EXPIRED）
  ErrorMessages,      // 錯誤訊息對照表
  createErrorResponse,// 建立標準錯誤回應
  getErrorMessage,    // 取得錯誤訊息
  isAuthError as sharedIsAuthError,   // @shared 版本（只接受 ErrorCode）
  isServerError as sharedIsServerError, // @shared 版本
  type ApiErrorResponse,   // API 錯誤回應型別
  type ApiSuccessResponse, // API 成功回應型別
} from '@shared';

// ============ 內部 import（用於 helper functions）============
import { ErrorCode as SharedErrorCode } from '@shared';

// ============ 向後兼容的 Helper Functions ============
// 這些函數接受 string | undefined，比 @shared 版本更寬鬆

/**
 * 檢查是否為認證錯誤
 *
 * @param code - 錯誤碼（可能是新格式 E1xxx 或舊格式 UNAUTHORIZED）
 * @returns 是否為認證錯誤
 *
 * @example
 * if (isAuthError(response.code)) {
 *   // 導向登入頁
 *   navigation.navigate('Login');
 * }
 */
export function isAuthError(code: string | undefined): boolean {
  if (!code) return false;
  // 先檢查新格式：E1 開頭
  if (code.startsWith('E1')) return true;
  // 相容舊的英文錯誤碼
  const legacyAuthCodes = ['UNAUTHORIZED', 'INVALID_TOKEN', 'TOKEN_EXPIRED', 'TOKEN_INVALID', 'USER_NOT_FOUND', 'FORBIDDEN'];
  return legacyAuthCodes.includes(code);
}

/**
 * 檢查是否為伺服器錯誤
 *
 * @param code - 錯誤碼
 * @returns 是否為伺服器錯誤（E9 開頭）
 *
 * @example
 * if (isServerError(response.code)) {
 *   // 顯示「伺服器忙碌中，請稍後再試」
 * }
 */
export function isServerError(code: string | undefined): boolean {
  if (!code) return false;
  return code.startsWith('E9');
}

/**
 * 檢查是否為扭蛋相關錯誤
 *
 * @param code - 錯誤碼
 * @returns 是否為扭蛋錯誤
 *
 * 包含：
 * - GACHA_NO_CREDITS: 額度用完
 * - GACHA_RATE_LIMITED: 超過頻率限制
 * - GACHA_GENERATION_FAILED: AI 生成失敗
 */
export function isGachaError(code: string): boolean {
  return [
    SharedErrorCode.GACHA_NO_CREDITS,
    SharedErrorCode.GACHA_RATE_LIMITED,
    SharedErrorCode.GACHA_GENERATION_FAILED,
  ].includes(code as SharedErrorCode);
}

/**
 * 檢查是否為資源/庫存錯誤
 *
 * @param code - 錯誤碼
 * @returns 是否為 E6 開頭的錯誤
 *
 * 包含：找不到收藏、找不到地點、找不到用戶等
 */
export function isResourceError(code: string): boolean {
  return code.startsWith('E6');
}

/**
 * 檢查是否為商家相關錯誤
 *
 * @param code - 錯誤碼
 * @returns 是否為 E4 開頭的錯誤
 *
 * 包含：找不到商家、優惠券過期、核銷碼無效等
 */
export function isMerchantError(code: string): boolean {
  return code.startsWith('E4');
}

/**
 * 檢查是否為驗證錯誤
 *
 * @param code - 錯誤碼
 * @returns 是否為 E5 開頭的錯誤
 *
 * 包含：必填欄位缺失、格式錯誤、參數無效等
 */
export function isValidationError(code: string): boolean {
  return code.startsWith('E5');
}

// ============ 舊錯誤碼映射表 ============
// 這些是舊 API 可能回傳的英文錯誤碼，映射到新的 ErrorCode
// 用於漸進式遷移，讓新舊 API 都能正常處理

/**
 * 舊錯誤碼 -> 新錯誤碼 映射表
 *
 * 使用情境：
 * 1. 舊 API 還沒更新，回傳英文錯誤碼
 * 2. 第三方服務回傳的錯誤碼
 *
 * @example
 * const newCode = LEGACY_ERROR_MAPPING['TOKEN_EXPIRED'];
 * // newCode = ErrorCode.AUTH_TOKEN_EXPIRED
 */
export const LEGACY_ERROR_MAPPING: Record<string, SharedErrorCode> = {
  // === 認證相關 ===
  'INVALID_CREDENTIALS': SharedErrorCode.INVALID_CREDENTIALS,
  'TOKEN_EXPIRED': SharedErrorCode.AUTH_TOKEN_EXPIRED,
  'TOKEN_INVALID': SharedErrorCode.AUTH_TOKEN_INVALID,
  'UNAUTHORIZED': SharedErrorCode.AUTH_REQUIRED,
  'FORBIDDEN': SharedErrorCode.FORBIDDEN,

  // === 扭蛋相關 ===
  'DAILY_LIMIT_EXCEEDED': SharedErrorCode.DAILY_LIMIT_REACHED,
  'EXCEEDS_REMAINING_QUOTA': SharedErrorCode.GACHA_NO_CREDITS,
  'GENERATION_FAILED': SharedErrorCode.GACHA_GENERATION_FAILED,
  'DEVICE_LIMIT_EXCEEDED': SharedErrorCode.DAILY_LIMIT_REACHED,
  'DEVICE_DAILY_LIMIT': SharedErrorCode.DAILY_LIMIT_REACHED,

  // === 商家相關 ===
  'MERCHANT_NOT_FOUND': SharedErrorCode.MERCHANT_NOT_FOUND,
  'COUPON_NOT_FOUND': SharedErrorCode.COUPON_NOT_FOUND,
  'COUPON_EXPIRED': SharedErrorCode.COUPON_EXPIRED,
  'INVALID_REDEMPTION_CODE': SharedErrorCode.INVALID_CODE,

  // === 資源相關 ===
  'COLLECTION_NOT_FOUND': SharedErrorCode.COLLECTION_NOT_FOUND,
  'PLACE_NOT_FOUND': SharedErrorCode.PLACE_NOT_FOUND,
  'USER_NOT_FOUND': SharedErrorCode.USER_NOT_FOUND,

  // === 伺服器相關 ===
  'RATE_LIMIT_EXCEEDED': SharedErrorCode.RATE_LIMITED,
  'SERVICE_UNAVAILABLE': SharedErrorCode.SERVICE_UNAVAILABLE,
  'INTERNAL_ERROR': SharedErrorCode.INTERNAL_ERROR,
};

/**
 * 將舊錯誤碼轉換為新錯誤碼
 *
 * @param code - 舊錯誤碼（英文）或新錯誤碼（E 開頭）
 * @returns 新錯誤碼（如果有映射）或原始錯誤碼
 *
 * @example
 * normalizeErrorCode('TOKEN_EXPIRED')  // 'E1002'
 * normalizeErrorCode('E1002')          // 'E1002'（原樣返回）
 * normalizeErrorCode('UNKNOWN')        // 'UNKNOWN'（找不到映射，原樣返回）
 */
export function normalizeErrorCode(code: string): SharedErrorCode | string {
  return LEGACY_ERROR_MAPPING[code] || code;
}

// ============ 已棄用的舊常數 ============
// 這些保留給還沒更新的程式碼使用
// 新程式碼請直接使用 ErrorCode.XXX

/** @deprecated 使用 ErrorCode.GACHA_RATE_LIMITED */
export const GACHA_DAILY_LIMIT = SharedErrorCode.GACHA_RATE_LIMITED;

/** @deprecated 使用 ErrorCode.GACHA_NO_CREDITS */
export const GACHA_NO_CREDITS = SharedErrorCode.GACHA_NO_CREDITS;

/** @deprecated 使用 ErrorCode.GACHA_GENERATION_FAILED */
export const GACHA_NO_PLACES = SharedErrorCode.GACHA_GENERATION_FAILED;
