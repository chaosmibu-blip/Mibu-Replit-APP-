/**
 * @fileoverview App 全域狀態型別定義
 *
 * 定義應用程式的全域狀態結構，包含：
 * - 畫面視圖狀態
 * - 用戶狀態
 * - 地區選擇
 * - 扭蛋結果暫存
 *
 * @module types/app
 */

import { Language } from './common';
import { User } from './auth';
import { GachaItem, GachaResponse } from './gacha';

// ============ 視圖型別 ============

/**
 * App 主視圖
 * - home: 首頁
 * - gacha_module: 扭蛋模組（包含扭蛋、圖鑑、物品箱）
 * - planner_module: 規劃模組（包含地點、行程、對話、服務）
 * - settings: 設定頁
 * - result: 扭蛋結果頁
 * - login: 登入頁
 */
export type AppView = 'home' | 'gacha_module' | 'planner_module' | 'settings' | 'result' | 'login';

/**
 * 扭蛋模組子視圖
 * - gacha: 扭蛋機頁面
 * - collection: 圖鑑頁面
 * - itembox: 物品箱頁面
 */
export type GachaSubView = 'gacha' | 'collection' | 'itembox';

/**
 * 規劃模組子視圖
 * - location: 地點選擇
 * - itinerary: 行程規劃
 * - chat: AI 對話
 * - service: 專員服務
 */
export type PlannerSubView = 'location' | 'itinerary' | 'chat' | 'service';

// ============ App 狀態 ============

/**
 * 應用程式全域狀態
 *
 * 用於 Context 或狀態管理，儲存應用的核心狀態
 */
export interface AppState {
  language: Language;              // 當前語言設定
  user: User | null;               // 當前登入用戶（null 表示未登入）
  country: string;                 // 選擇的國家（顯示名稱）
  city: string;                    // 選擇的城市（顯示名稱）
  countryId: number | null;        // 選擇的國家 ID
  regionId: number | null;         // 選擇的地區 ID
  level: number;                   // 用戶等級
  loading: boolean;                // 全域載入狀態
  error: string | null;            // 全域錯誤訊息
  result: GachaResponse | null;    // 扭蛋結果暫存
  collection: GachaItem[];         // 圖鑑收藏列表
  view: AppView;                   // 當前主視圖
  isAuthenticated: boolean;        // 是否已認證
  unreadItemCount: number;         // 未讀物品數量（用於小紅點）
}
