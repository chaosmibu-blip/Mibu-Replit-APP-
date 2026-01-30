/**
 * @fileoverview 通知系統型別定義
 *
 * 定義通知相關的資料結構，包含：
 * - 通知狀態
 * - 未讀計數
 *
 * @module types/notifications
 */

// ============ 通知狀態 ============

/**
 * 通知狀態
 *
 * 各類型通知的未讀數量
 */
export interface NotificationStatus {
  itembox: number;     // 物品箱未讀數
  collection: number;  // 圖鑑未讀數
}

// ============ 未讀計數 ============

/**
 * 未讀計數
 *
 * 完整的未讀通知統計
 */
export interface UnreadCounts {
  unread: {
    collection: number;    // 圖鑑未讀數
    itembox: number;       // 物品箱未讀數
    announcement: number;  // 公告未讀數
  };
  total: number;           // 總未讀數
}
