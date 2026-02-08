/**
 * 前端驗證工具函數
 *
 * 提供 JWT 格式檢查、URL 驗證等安全相關工具
 *
 * @module utils/validation
 */

/**
 * 檢查字串是否符合 JWT 格式
 *
 * JWT 由三段 base64url 編碼的字串以「.」分隔組成：header.payload.signature
 * 此函數僅驗證格式結構，不驗證簽名（簽名由後端驗證）
 *
 * @param token - 待檢查的字串
 * @returns 是否符合 JWT 格式
 *
 * @example
 * isValidJWTFormat('eyJ...'); // true
 * isValidJWTFormat('not-a-jwt'); // false
 * isValidJWTFormat(''); // false
 */
export function isValidJWTFormat(token: unknown): token is string {
  if (typeof token !== 'string' || token.length === 0) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // 每段都必須是非空的 base64url 字串
  const base64urlRegex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => part.length > 0 && base64urlRegex.test(part));
}

/**
 * 檢查 URL path 是否為授權的 OAuth 回調路徑
 *
 * 僅允許已知的回調路徑，防止任意 deep link 觸發認證流程
 *
 * @param path - URL path（如 'auth/callback'）
 * @returns 是否為授權的回調路徑
 */
export function isAuthCallbackPath(path: string | null | undefined): boolean {
  if (!path) return false;
  // 標準化：移除前導斜線
  const normalized = path.replace(/^\/+/, '');
  return normalized === 'auth/callback';
}
