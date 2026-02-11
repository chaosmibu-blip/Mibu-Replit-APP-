/**
 * ============================================================
 * 通知系統型別定義 (notifications.ts)
 * ============================================================
 * 此模組提供: 推播通知相關的所有型別定義
 *
 * 主要功能:
 * - 紅點狀態（boolean，有/沒有未讀）
 * - 通知歷史列表項目
 * - 通知偏好設定
 * - 推播 Token 管理
 *
 * 更新日期：2026-02-11（#042 通知系統全面翻新，對齊後端契約）
 *
 * @module types/notifications
 * @see 後端契約: contracts/APP.md
 */

// ============ 紅點狀態 ============

/**
 * 紅點狀態回應
 *
 * GET /api/notifications 回傳格式
 * 後端回傳 boolean（有/沒有），不是 number（幾則未讀）
 */
export interface NotificationStatusResponse {
  itembox: boolean;        // 物品箱有未讀
  collection: boolean;     // 圖鑑有未讀
  announcement: boolean;   // 公告有未讀
  achievement: boolean;    // 成就有未讀（#042 新增）
  quest: boolean;          // 每日任務有未讀（#042 新增）
}

// ============ 通知歷史列表 ============

/**
 * 通知歷史列表回應
 *
 * GET /api/notifications/list?page=1&pageSize=20 回傳格式
 */
export interface NotificationListResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 單則通知項目
 */
export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: string;       // ISO 8601
}

/**
 * 通知類型
 */
export type NotificationType =
  | 'achievement_unlocked'
  | 'daily_task_completed'
  | 'new_coupon'
  | 'announcement';

/**
 * 通知附帶的導航資料
 */
export interface NotificationData {
  screen: NotificationScreen;
  targetId?: string;
  achievementName?: string;
  taskName?: string;
  merchantName?: string;
  announcementId?: string;
  [key: string]: unknown;
}

/**
 * Deep Link 導航目標頁面
 *
 * 後端推播 data.screen 的值對照表：
 * - Achievements → 成就頁
 * - DailyTasks → 每日任務頁
 * - CouponDetail → 優惠券詳情
 * - Announcements → 公告頁
 *
 * 注意：itembox 和 collection 沒有推播導航 screen 值，
 * 這兩類紅點透過 POST /:type/seen API 清除
 */
export type NotificationScreen =
  | 'Achievements'
  | 'DailyTasks'
  | 'CouponDetail'
  | 'Announcements';

// ============ 紅點 seen 類型 ============

/**
 * 可標記已讀的紅點類型
 *
 * POST /api/notifications/:type/seen
 */
export type NotificationSeenType =
  | 'itembox'
  | 'collection'
  | 'announcement'
  | 'achievement'
  | 'quest';

// ============ 通知偏好設定 ============

/**
 * 通知偏好設定
 *
 * GET /api/notifications/preferences 回傳格式
 */
export interface NotificationPreferences {
  achievement: boolean;         // 成就通知
  dailyTask: boolean;           // 每日任務通知
  coupon: boolean;              // 優惠券通知
  announcement: boolean;        // 系統公告通知
  quietHoursEnabled: boolean;   // 勿擾時段開關
  quietHoursStart: string | null;  // 勿擾開始時間，格式 "HH:mm"
  quietHoursEnd: string | null;    // 勿擾結束時間，格式 "HH:mm"
}

/**
 * 更新通知偏好設定（所有欄位 optional，只傳要改的）
 *
 * PUT /api/notifications/preferences request 格式
 */
export interface UpdateNotificationPreferencesRequest {
  achievement?: boolean;
  dailyTask?: boolean;
  coupon?: boolean;
  announcement?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
}

// ============ 推播 Token ============

/**
 * 註冊推播 Token request
 *
 * POST /api/notifications/register-token
 */
export interface RegisterPushTokenRequest {
  token: string;                // Expo Push Token（ExponentPushToken[xxx]）
  platform: 'ios' | 'android';
  deviceId?: string;
}

/**
 * 註冊推播 Token response
 */
export interface RegisterPushTokenResponse {
  success: boolean;
  tokenId: number;
}

// ============ 向後相容（已廢棄） ============

/**
 * @deprecated 已被 NotificationStatusResponse 取代
 * 保留供漸進式遷移，後續版本移除
 */
export interface NotificationStatus {
  itembox: number;
  collection: number;
}

/**
 * @deprecated 已被 NotificationStatusResponse 取代
 * 保留供漸進式遷移，後續版本移除
 */
export interface UnreadCounts {
  unread: {
    collection: number;
    itembox: number;
    announcement: number;
  };
  total: number;
}
