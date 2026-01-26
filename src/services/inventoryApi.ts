/**
 * 物品箱/庫存相關 API
 * 依據後端合約 APP.md 定義
 */
import { ApiBase } from './base';
import {
  InventoryItem,
  InventoryResponse,
  RedeemResponse,
  PaginationParams,
} from '../types';

export type InventoryFilter = 'all' | 'coupon' | 'ticket' | 'gift';
export type InventoryStatus = 'active' | 'expired' | 'redeemed';

export interface InventoryQueryParams extends PaginationParams {
  type?: InventoryFilter;
  status?: InventoryStatus;
}

export interface InventoryCountResponse {
  total: number;
  active: number;
  expired: number;
  redeemed: number;
}

class InventoryApiService extends ApiBase {
  /**
   * 獲取背包列表
   * GET /api/inventory
   *
   * #030: 後端回傳 { items, slotCount, maxSlots, isFull, pagination }，沒有 success 欄位
   */
  async getInventory(token: string, params?: InventoryQueryParams): Promise<InventoryResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const url = `/api/inventory${query ? `?${query}` : ''}`;

    try {
      const data = await this.request<{
        items: InventoryItem[];
        slotCount: number;
        maxSlots: number;
        isFull: boolean;
        pagination?: { page: number; limit: number; total: number; totalPages: number };
      }>(url, {
        headers: this.authHeaders(token),
      });
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return {
        success: true,
        items: data.items || [],
        slotCount: data.slotCount || 0,
        maxSlots: data.maxSlots || 30,
        isFull: data.isFull || false,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('[InventoryApi] getInventory error:', error);
      return {
        success: false,
        items: [],
        slotCount: 0,
        maxSlots: 30,
        isFull: false,
      };
    }
  }

  /**
   * 獲取單個背包項目
   * GET /api/inventory/:id
   * 注意：後端在 GET 時自動標記為已讀
   */
  async getInventoryItem(token: string, itemId: number): Promise<{ item: InventoryItem }> {
    return this.request<{ item: InventoryItem }>(`/api/inventory/${itemId}`, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 刪除背包項目
   * DELETE /api/inventory/:id
   */
  async deleteInventoryItem(token: string, itemId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/inventory/${itemId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 核銷優惠券
   * POST /api/inventory/:id/redeem
   * @param dailyCode 商家每日核銷碼
   */
  async redeemInventoryItem(token: string, itemId: number, dailyCode: string): Promise<RedeemResponse> {
    return this.request<RedeemResponse>(`/api/inventory/${itemId}/redeem`, {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ dailyCode }),
    });
  }

  /**
   * 獲取背包數量統計
   * GET /api/inventory/count
   */
  async getInventoryCount(token: string): Promise<InventoryCountResponse> {
    return this.request<InventoryCountResponse>('/api/inventory/count', {
      headers: this.authHeaders(token),
    });
  }

  // ========== #011 新增 ==========

  /**
   * 新增物品到背包
   * POST /api/inventory/add
   */
  async addInventoryItem(
    token: string,
    params: { type: 'coupon' | 'item'; itemId: number; gachaSessionId?: string }
  ): Promise<InventoryItem> {
    return this.request<InventoryItem>('/api/inventory/add', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  // =====================
  // 本地配置（不需要後端 API）
  // =====================

  /**
   * 獲取背包容量配置
   * 這是前端本地配置，不是後端 API
   */
  getInventoryConfig(): { maxSlots: number } {
    return { maxSlots: 30 };
  }

  /**
   * 獲取稀有度配置
   * 這是前端本地配置，不是後端 API
   */
  getRarityConfig(): {
    SP: { rate: number; color: string };
    SSR: { rate: number; color: string };
    SR: { rate: number; color: string };
    S: { rate: number; color: string };
    R: { rate: number; color: string };
  } {
    return {
      SP: { rate: 0.01, color: '#FFD700' },
      SSR: { rate: 0.05, color: '#FF6B6B' },
      SR: { rate: 0.15, color: '#9B59B6' },
      S: { rate: 0.30, color: '#3498DB' },
      R: { rate: 0.49, color: '#95A5A6' },
    };
  }
}

export const inventoryApi = new InventoryApiService();
