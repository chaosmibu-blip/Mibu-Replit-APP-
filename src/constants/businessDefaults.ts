/**
 * 業務邏輯預設值與閾值
 *
 * 統一管理 API fallback 預設值、業務閾值、輸入限制
 * 避免魔術數字散落各處
 *
 * 更新日期：2026-03-09
 */

// ========== API Fallback 預設值 ==========
/** 當 API 未回傳時的預設權益值 */
export const PerkDefaults = {
  /** 每日扭蛋次數上限（後端 perks.dailyPullLimit 的 fallback） */
  dailyPullLimit: 36,
  /** 道具箱格數上限（後端 perks.inventorySlots 的 fallback） */
  inventorySlots: 30,
  /** 達人最大服務旅人數（後端 specialist.maxTravelers 的 fallback） */
  maxTravelers: 5,
} as const;

// ========== 業務閾值 ==========
export const Threshold = {
  /** 道具箱「快滿」提醒的剩餘格數 */
  inventoryAlmostFull: 5,
  /** 無限次數判定值（dailyPullLimit === -1 代表無限） */
  unlimitedPulls: -1,
  /** 無限格數判定值（inventorySlots >= 999 代表無限） */
  unlimitedSlotsMin: 999,
} as const;

// ========== 輸入限制 ==========
export const InputLimit = {
  /** 驗證碼長度 */
  verifyCode: 6,
  /** 推薦碼長度 */
  referralCode: 12,
  /** 塗鴉/短留言 */
  graffiti: 200,
  /** 長留言/筆記 */
  note: 2000,
  /** 暱稱/標題 */
  title: 50,
  /** 標籤名稱 */
  tagName: 8,
  /** AI 對話 / 行程 AI 訊息 */
  chatMessage: 500,
} as const;

// ========== 列表底部留白 ==========
/** ScrollView / FlatList 底部預留空間，避免被 TabBar 遮住 */
export const BOTTOM_SPACER_HEIGHT = 100;

// ========== API 逾時 ==========
export const ApiTimeout = {
  /** 扭蛋請求逾時（AI 生成較慢） */
  gachaRequest: 10000,
} as const;
