/**
 * MIBU 共用常數
 *
 * 此檔案定義前後端共用的常數值
 * APP 和官網應該直接使用這些常數，不要自己定義
 */

// ============ 七大分類 ============
export const SEVEN_CATEGORIES = [
  '美食',
  '住宿',
  '景點',
  '購物',
  '娛樂設施',
  '生態文化教育',
  '遊程體驗',
] as const;

export type MibuCategory = typeof SEVEN_CATEGORIES[number];

// ============ 優惠券稀有度 ============
export const COUPON_RARITIES = ['SP', 'SSR', 'SR', 'S', 'R'] as const;
export type CouponRarity = typeof COUPON_RARITIES[number];

// ============ 扭蛋配額 ============
export const GACHA_CONFIG = {
  DAILY_LIMIT: 36,           // 每日免費額度
  MIN_PULL_COUNT: 5,         // 最少抽取張數
  MAX_PULL_COUNT: 12,        // 最多抽取張數
  DEFAULT_PULL_COUNT: 7,     // 預設抽取張數
  FOOD_MIN_GUARANTEE: 2,     // 美食保底最少
  FOOD_MAX_PERCENT: 50,      // 美食最多佔比
} as const;

// ============ 分頁預設值 ============
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ============ 成就類別 ============
export const ACHIEVEMENT_CATEGORIES = [
  'explorer',    // 探索者
  'collector',   // 收藏家
  'social',      // 社交達人
  'sponsor',     // 贊助者（原 investor）
  'contributor', // 貢獻者
] as const;

export type AchievementCategory = typeof ACHIEVEMENT_CATEGORIES[number];

// ============ 用戶角色 ============
export const USER_ROLES = [
  'user',        // 一般用戶
  'merchant',    // 商家
  'specialist',  // 策劃師
  'admin',       // 管理員
] as const;

export type UserRole = typeof USER_ROLES[number];

// ============ 訂單狀態 ============
export const ORDER_STATUSES = [
  'pending',     // 待處理
  'confirmed',   // 已確認
  'completed',   // 已完成
  'cancelled',   // 已取消
  'refunded',    // 已退款
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

// ============ SOS 狀態 ============
export const SOS_STATUSES = [
  'active',      // 進行中
  'resolved',    // 已解決
  'cancelled',   // 已取消
] as const;

export type SosStatus = typeof SOS_STATUSES[number];
