// 從 MIBU_REPLIT/shared/errors.ts 同步
// 此檔案與後端完全一致，請勿單獨修改

export enum ErrorCode {
  // 認證相關 (E1xxx)
  AUTH_REQUIRED = 'E1001',
  AUTH_TOKEN_EXPIRED = 'E1002',
  AUTH_TOKEN_INVALID = 'E1003',
  INVALID_CREDENTIALS = 'E1004',

  // Gacha 相關 (E2xxx)
  GACHA_NO_CREDITS = 'E2001',
  GACHA_RATE_LIMITED = 'E2002',
  GACHA_GENERATION_FAILED = 'E2003',

  // 驗證相關 (E4xxx)
  VALIDATION_ERROR = 'E4001',
  NOT_FOUND = 'E4004',

  // 伺服器錯誤 (E9xxx)
  SERVER_ERROR = 'E9001',
}

export interface ApiError {
  error: string;
  code: ErrorCode;
}

// Helper: 檢查是否為認證錯誤
export function isAuthError(code: string): boolean {
  return [
    ErrorCode.AUTH_REQUIRED,
    ErrorCode.AUTH_TOKEN_EXPIRED,
    ErrorCode.AUTH_TOKEN_INVALID,
    ErrorCode.INVALID_CREDENTIALS,
  ].includes(code as ErrorCode);
}

// Helper: 檢查是否為 Gacha 錯誤
export function isGachaError(code: string): boolean {
  return [
    ErrorCode.GACHA_NO_CREDITS,
    ErrorCode.GACHA_RATE_LIMITED,
    ErrorCode.GACHA_GENERATION_FAILED,
  ].includes(code as ErrorCode);
}
