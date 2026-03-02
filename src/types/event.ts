/**
 * @fileoverview 活動系統型別定義
 *
 * 定義活動相關的資料結構，包含：
 * - 活動類型
 * - 活動狀態
 * - 活動列表與詳情
 *
 * 對應後端 sync-app.md #006
 *
 * @module types/event
 */

// ============ 活動型別 ============

/**
 * 活動類型
 * - announcement: 公告型活動
 * - festival: 節慶活動
 * - limited: 限時活動
 */
export type EventType = 'announcement' | 'festival' | 'limited';

/**
 * 活動狀態
 * - draft: 草稿
 * - active: 進行中
 * - ended: 已結束
 * - cancelled: 已取消
 */
export type EventStatus = 'draft' | 'active' | 'ended' | 'cancelled';

// ============ 活動資料 ============

/**
 * 活動
 *
 * 完整的活動資料
 */
export interface Event {
  id: number;               // 活動 ID
  type: EventType;          // 活動類型
  title: string;            // 標題
  content: string;          // 內容描述（對齊後端 v3.3.0）
  description?: string;     // 舊欄位（向後相容，預設/首頁活動用）
  imageUrl?: string | null;  // 活動圖片 URL
  linkUrl?: string | null;   // 外部連結（新欄位）
  sourceUrl?: string | null; // 原始外部連結（新欄位）
  address?: string | null;   // 活動地址
  city?: string | null;      // 活動城市
  location?: string | null;  // 活動地點名稱
  organizer?: string | null; // 主辦單位
  charge?: string | null;    // 費用標示
  phone?: string | null;     // 聯絡電話
  activityClass?: string | null; // 活動分類（TDX 同步）
  startDate: string;        // 開始日期（ISO 8601）
  endDate?: string | null;  // 結束日期（ISO 8601）
  priority: number;         // 優先順序
  // 向後相容（首頁預設活動仍在用）
  bannerUrl?: string;
  externalUrl?: string;
  titleEn?: string;
  titleJa?: string;
  titleKo?: string;
  descriptionEn?: string;
  descriptionJa?: string;
  descriptionKo?: string;
  status?: EventStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ============ API 型別 ============

/**
 * 活動列表查詢參數
 * GET /api/events
 */
export interface EventListParams {
  type?: EventType;     // 依類型篩選
  city?: string;        // 依城市篩選
  status?: EventStatus; // 依狀態篩選
  page?: number;        // 頁碼
  limit?: number;       // 每頁數量
}

/**
 * 活動列表回應
 * GET /api/events
 */
export interface EventListResponse {
  success: boolean;     // 是否成功
  events: Event[];      // 活動列表
  pagination: {
    page: number;       // 當前頁碼
    limit: number;      // 每頁數量
    total: number;      // 總數量
    totalPages: number; // 總頁數
  };
}

/**
 * 活動詳情回應
 * GET /api/events/:id
 */
export interface EventDetailResponse {
  success: boolean;  // 是否成功
  event: Event;      // 活動詳情
}
