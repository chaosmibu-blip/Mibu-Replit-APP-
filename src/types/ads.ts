/**
 * @fileoverview 廣告系統型別定義
 *
 * 定義廣告相關的資料結構，包含：
 * - 廣告版位
 * - 廣告配置
 *
 * @module types/ads
 */

// ============ 廣告版位 ============

/**
 * 廣告版位
 *
 * 定義廣告可以出現的位置
 * - gacha_start: 扭蛋開始前
 * - gacha_result: 扭蛋結果頁
 * - collection_view: 圖鑑查看時
 * - item_use: 使用物品時
 */
export type AdPlacement = 'gacha_start' | 'gacha_result' | 'collection_view' | 'item_use';

// ============ 廣告配置 ============

/**
 * 廣告配置
 *
 * 單一廣告版位的配置資訊
 */
export interface AdConfig {
  placementKey: string;          // 版位識別碼
  adUnitIdIos: string;           // iOS 廣告單元 ID
  adUnitIdAndroid: string;       // Android 廣告單元 ID
  adType: string;                // 廣告類型（如：interstitial, rewarded）
  fallbackImageUrl: string | null; // 後備圖片 URL（廣告載入失敗時顯示）
  showFrequency: number;         // 顯示頻率（每 N 次操作顯示一次）
}
