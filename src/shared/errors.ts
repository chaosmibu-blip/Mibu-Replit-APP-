// 與後端 MIBU_REPLIT/shared/errors.ts 同步
// ErrorCode enum 的值要和後端一致

export enum ErrorCode {
  // 認證相關 (E1xxx)
  AUTH_REQUIRED = 'E1001',
  AUTH_TOKEN_EXPIRED = 'E1002',
  AUTH_TOKEN_INVALID = 'E1003',  // 後端用這個，不是 AUTH_INVALID_CREDENTIALS
  AUTH_USER_NOT_FOUND = 'E1004',

  // Gacha 相關 (E2xxx)
  GACHA_NO_CREDITS = 'E2001',    // 後端用 E2001，不是 E3001
  GACHA_DAILY_LIMIT = 'E2002',
  GACHA_NO_PLACES = 'E2003',

  // 驗證相關 (E4xxx)
  VALIDATION_ERROR = 'E4001',
  NOT_FOUND = 'E4004',

  // 伺服器錯誤 (E9xxx)
  SERVER_ERROR = 'E9001',        // 後端用 E9001，不是 E5001
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
  ].includes(code as ErrorCode);
}

// Helper: 檢查是否為 Gacha 錯誤
export function isGachaError(code: string): boolean {
  return [
    ErrorCode.GACHA_NO_CREDITS,
    ErrorCode.GACHA_DAILY_LIMIT,
    ErrorCode.GACHA_NO_PLACES,
  ].includes(code as ErrorCode);
}
