/**
 * @fileoverview App 全域狀態型別定義
 *
 * 定義應用程式的全域狀態結構，包含：
 * - 用戶認證狀態
 * - 語言設定
 * - 扭蛋區域選擇與結果
 * - 通知未讀數量
 *
 * 變更說明（2026-02-12）
 * - 移除：loading/error/view/level（全部 0 處外部讀取，各 Screen 用本地 useState）
 * - 移除：AppView/GachaSubView/PlannerSubView（legacy 視圖型別，已由 Expo Router 取代）
 * - 保留：isAuthenticated（6+ 處使用）
 *
 * @module types/app
 */

import { Language } from './common';
import { User } from './auth';
import { GachaItem, GachaResponse } from './gacha';

// ============ App 狀態 ============

/**
 * 應用程式全域狀態
 *
 * 用於 Context 狀態管理，儲存應用的核心狀態
 */
export interface AppState {
  language: Language;              // 當前語言設定
  user: User | null;               // 當前登入用戶（null 表示未登入）
  result: GachaResponse | null;    // 扭蛋結果暫存
  collection: GachaItem[];         // 圖鑑收藏列表
  isAuthenticated: boolean;        // 是否已認證
  unreadItemCount: number;         // 未讀物品數量（用於小紅點）
  unreadMailboxCount: number;      // 信箱未讀數量（#045）
}
