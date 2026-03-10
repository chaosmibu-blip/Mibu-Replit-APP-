/**
 * 活動系統 API 服務
 *
 * 提供活動相關的 API 端點封裝，包含：
 * - 公告管理
 * - 節慶活動
 * - 限時活動
 *
 * @module EventApiService
 * @see 後端合約: sync-app.md #006
 *
 * API 端點清單：
 * - GET /api/events - 取得活動列表
 * - GET /api/events/:id - 取得活動詳情
 */
import { ApiBase } from './base';
import {
  Event,
  EventType,
  EventListParams,
  EventListResponse,
  EventDetailResponse,
} from '../types/event';

// ========== API 服務類別 ==========

/**
 * 活動 API 服務類別
 *
 * 繼承 ApiBase 基礎類別，提供活動相關的 API 方法
 */
class EventApiService extends ApiBase {
  // ========== 活動列表 ==========

  /**
   * 取得活動列表
   *
   * 支援多種篩選條件：
   * - type: 活動類型（announcement/festival/limited）
   * - city: 城市篩選
   * - status: 活動狀態（active/upcoming/ended）
   * - page/limit: 分頁參數
   *
   * #030: 後端回傳 { events, pagination }，沒有 success 欄位
   * HTTP 200 視為成功，前端包裝 success 欄位
   *
   * @param params - 查詢參數
   * @returns 活動列表與分頁資訊
   *
   * @example
   * // 取得進行中的節慶活動
   * const result = await eventApi.getEvents({
   *   type: 'festival',
   *   status: 'active',
   *   page: 1,
   *   limit: 10
   * });
   */
  async getEvents(params?: EventListParams): Promise<EventListResponse> {
    // 建立查詢參數
    const searchParams = new URLSearchParams();

    // 根據傳入參數動態添加查詢字串
    if (params?.type) searchParams.append('type', params.type);
    if (params?.city) searchParams.append('city', params.city);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    // 組合完整 URL
    const queryString = searchParams.toString();
    const url = queryString ? `/api/events?${queryString}` : '/api/events';

    const data = await this.request<{
      events: Event[];
      pagination: EventListResponse['pagination'];
    }>(url);

    return {
      success: true,
      events: data.events || [],
      pagination: data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }

  // ========== 活動詳情 ==========

  /**
   * 取得活動詳情
   *
   * 根據活動 ID 取得完整活動資訊
   *
   * #030: 後端回傳 { event }，沒有 success 欄位
   * HTTP 200 視為成功，前端包裝 success 欄位
   *
   * @param id - 活動 ID
   * @returns 活動詳情，失敗時回傳 null
   *
   * @example
   * const detail = await eventApi.getEventById(123);
   * if (detail?.success) {
   *   console.log('活動名稱:', detail.event.title);
   * }
   */
  async getEventById(id: number): Promise<EventDetailResponse> {
    const data = await this.request<{ event: Event }>(`/api/events/${id}`);
    return { success: true, event: data.event };
  }

  // ========== 首頁活動聚合 ==========

  /**
   * 取得首頁活動（按類型分組）
   *
   * 一次性取得首頁需要顯示的各類型活動，包含：
   * - 公告：最新 3 筆
   * - 節慶活動：最新 5 筆
   * - 限時活動：最新 5 筆
   *
   * 使用 Promise.all 並行請求，提升效能
   *
   * @returns 分類後的活動列表
   *
   * @example
   * const { announcements, festivals, limitedEvents } = await eventApi.getHomeEvents();
   */
  async getHomeEvents(): Promise<{
    announcements: Event[];
    festivals: Event[];
    limitedEvents: Event[];
  }> {
    const [announcements, festivals, limited] = await Promise.all([
      this.getEvents({ type: 'announcement', status: 'active', limit: 3 }),
      this.getEvents({ type: 'festival', status: 'active', limit: 5 }),
      this.getEvents({ type: 'limited', status: 'active', limit: 5 }),
    ]);

    return {
      announcements: announcements.events || [],
      festivals: festivals.events || [],
      limitedEvents: limited.events || [],
    };
  }
}

// ========== 匯出單例 ==========

/** 活動 API 服務單例，供全域使用 */
export const eventApi = new EventApiService();
