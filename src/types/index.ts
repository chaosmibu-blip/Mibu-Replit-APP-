/**
 * @fileoverview Types 統一匯出模組
 *
 * 本檔案負責統一匯出所有型別定義，提供簡潔的引入方式。
 *
 * 用法：
 * - 向後兼容：import { User, GachaItem } from '@/types' 仍然有效
 * - 新用法：import { User } from '@/types/auth'（推薦，可提升編譯效能）
 *
 * @module types
 */

// ============ 通用基礎型別 ============
export * from './common';

// ============ 認證與用戶 ============
export * from './auth';

// ============ 扭蛋系統 ============
export * from './gacha';

// ============ 物品箱/庫存 ============
export * from './inventory';

// ============ 收藏/圖鑑 ============
export * from './collection';

// ============ 商家系統 ============
export * from './merchant';

// ============ 策劃師/專員 ============
export * from './specialist';

// ============ 管理員後台 ============
export * from './admin';

// ============ 地點/地區 ============
export * from './location';

// ============ SOS 緊急求救 ============
export * from './sos';

// ============ App 狀態 ============
export * from './app';

// ============ 廣告系統 ============
export * from './ads';

// ============ 通知系統 ============
export * from './notifications';

// ============ 錯誤碼定義 ============
export * from './errors';

// ============ 經濟系統（Phase 5）============
// 包含：等級、經驗值、成就、每日任務
export * from './economy';

// ============ 募資系統（Phase 5）============
// 包含：募資活動、贊助、獎勵
export * from './crowdfunding';

// ============ 推薦系統（Phase 5）============
// 包含：推薦碼、推薦獎勵、排行榜
export * from './referral';

// ============ 用戶貢獻系統（Phase 6）============
// 包含：回報歇業、建議景點、投票
export * from './contribution';

// ============ 活動系統（Phase 7）============
// 對應後端 sync-app #006
export * from './event';

// ============ 行程規劃系統 ============
// 對應後端 sync-app #026, #027
export * from './itinerary';
