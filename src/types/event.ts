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
  title: string;            // 標題（中文）
  titleEn?: string;         // 標題（英文）
  titleJa?: string;         // 標題（日文）
  titleKo?: string;         // 標題（韓文）
  description: string;      // 描述（中文）
  descriptionEn?: string;   // 描述（英文）
  descriptionJa?: string;   // 描述（日文）
  descriptionKo?: string;   // 描述（韓文）
  imageUrl?: string;        // 活動圖片 URL
  bannerUrl?: string;       // 橫幅圖片 URL
  startDate: string;        // 開始日期（ISO 8601）
  endDate?: string;         // 結束日期（ISO 8601）
  city?: string;            // 活動城市
  location?: string;        // 活動地點
  externalUrl?: string;     // 外部連結
  status: EventStatus;      // 活動狀態
  priority: number;         // 優先順序（數字越大越優先）
  createdAt: string;        // 建立時間（ISO 8601）
  updatedAt: string;        // 更新時間（ISO 8601）
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
