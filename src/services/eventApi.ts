/**
 * 活動系統 API - 公告、節慶活動、限時活動
 * 對應後端 sync-app.md #006
 */
import { ApiBase } from './base';
import {
  Event,
  EventType,
  EventListParams,
  EventListResponse,
  EventDetailResponse,
} from '../types/event';

class EventApiService extends ApiBase {
  /**
   * 取得活動列表
   * GET /api/events
   *
   * #030: 後端回傳 { events, pagination }，沒有 success 欄位
   */
  async getEvents(params?: EventListParams): Promise<EventListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.type) searchParams.append('type', params.type);
    if (params?.city) searchParams.append('city', params.city);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `/api/events?${queryString}` : '/api/events';

    try {
      const data = await this.request<{
        events: Event[];
        pagination: EventListResponse['pagination'];
      }>(url);
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return {
        success: true,
        events: data.events || [],
        pagination: data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    } catch (error) {
      console.error('[EventApi] Failed to fetch events:', error);
      return {
        success: false,
        events: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }
  }

  /**
   * 取得活動詳情
   * GET /api/events/:id
   *
   * #030: 後端回傳 { event }，沒有 success 欄位
   */
  async getEventById(id: number): Promise<EventDetailResponse | null> {
    try {
      const data = await this.request<{ event: Event }>(`/api/events/${id}`);
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return { success: true, event: data.event };
    } catch (error) {
      console.error('[EventApi] Failed to fetch event detail:', error);
      return null;
    }
  }

  /**
   * 取得首頁活動（按類型分組）
   * 返回各類型的前幾筆活動
   */
  async getHomeEvents(): Promise<{
    announcements: Event[];
    festivals: Event[];
    limitedEvents: Event[];
  }> {
    try {
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
    } catch (error) {
      console.error('[EventApi] Failed to fetch home events:', error);
      return {
        announcements: [],
        festivals: [],
        limitedEvents: [],
      };
    }
  }
}

export const eventApi = new EventApiService();
