/**
 * 活動系統類型定義
 * 對應後端 sync-app.md #006
 */

// 活動類型
export type EventType = 'announcement' | 'festival' | 'limited';

// 活動狀態
export type EventStatus = 'draft' | 'active' | 'ended' | 'cancelled';

// 活動資料
export interface Event {
  id: number;
  type: EventType;
  title: string;
  titleEn?: string;
  titleJa?: string;
  titleKo?: string;
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  descriptionKo?: string;
  imageUrl?: string;
  bannerUrl?: string;
  startDate: string;
  endDate?: string;
  city?: string;
  location?: string;
  externalUrl?: string;
  status: EventStatus;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// 活動列表查詢參數
export interface EventListParams {
  type?: EventType;
  city?: string;
  status?: EventStatus;
  page?: number;
  limit?: number;
}

// 活動列表回應
export interface EventListResponse {
  success: boolean;
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 活動詳情回應
export interface EventDetailResponse {
  success: boolean;
  event: Event;
}
