/**
 * ============================================================
 * AsyncStorage / SecureStore Key 集中管理 (storageKeys.ts)
 * ============================================================
 * 此模組提供: 所有本地儲存的 Key 常數，避免散落各處打錯字
 *
 * 主要功能:
 * - 靜態 Key（TOKEN、USER、LANGUAGE 等）
 * - 動態 Key 生成函數（行程訊息、教學提示等）
 *
 * 注意：
 * - AsyncStorage key 用 '@mibu_' 前綴
 * - SecureStore key 用 'mibu_' 前綴（無 @）
 * - 這是刻意的慣例，不要改
 *
 * 更新日期：2026-02-08（從各處收攏至此）
 */

// ============ 靜態 Key ============

/**
 * 所有 AsyncStorage / SecureStore 的 Key
 * 統一管理，避免散落各處
 */
export const STORAGE_KEYS = {
  // --- 認證相關 ---
  /** JWT Token（Web: AsyncStorage） */
  TOKEN: '@mibu_token',
  /** JWT Token（Native: SecureStore，無 @ 前綴） */
  TOKEN_SECURE: 'mibu_token',
  /** 用戶資料快取 */
  USER: '@mibu_user',

  // --- 偏好設定 ---
  /** 語言偏好 */
  LANGUAGE: '@mibu_language',

  // --- 扭蛋相關 ---
  /** 本地扭蛋收藏 */
  COLLECTION: '@mibu_collection',
  /** 每日抽取額度追蹤 */
  DAILY_LIMIT: '@mibu_daily_limit',

  // --- 頭像相關 ---
  /** 預設頭像選擇 */
  AVATAR_PRESET: '@mibu_avatar_preset',
  /** 自訂頭像 URL */
  CUSTOM_AVATAR_URL: '@mibu_custom_avatar_url',
  /** 頭像清單快取（API 成功後存，斷網時 fallback） */
  AVATAR_PRESETS_CACHE: '@mibu_avatar_presets_cache',

  // --- 登入流程 ---
  /** 登入後目標入口（暫存用，登入完成後刪除） */
  POST_LOGIN_PORTAL: '@mibu_post_login_portal',
} as const;

// ============ 動態 Key 生成函數 ============

/**
 * 取得行程聊天訊息的 storage key
 * @param itineraryId - 行程 ID
 * @returns storage key 字串
 */
export const getItineraryMessagesKey = (itineraryId: string): string =>
  `@itinerary_messages_${itineraryId}`;

/**
 * 取得教學提示的 storage key
 * @param tutorialKey - 教學識別碼
 * @returns storage key 字串
 */
export const getTutorialKey = (tutorialKey: string): string =>
  `@mibu_tutorial_${tutorialKey}`;

// ============ 型別匯出 ============

/** StorageKeys 的 key 名稱型別 */
export type StorageKeyName = keyof typeof STORAGE_KEYS;
