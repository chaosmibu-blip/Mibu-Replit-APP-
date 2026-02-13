/**
 * 物品箱/庫存 API 服務
 *
 * 處理用戶背包管理、物品核銷、庫存查詢等功能
 * 依據後端合約 APP.md 定義
 *
 * @module services/inventoryApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * - GET    /api/inventory           - 取得背包列表
 * - GET    /api/inventory/:id       - 取得單個項目詳情
 * - DELETE /api/inventory/:id       - 刪除背包項目
 * - POST   /api/inventory/:id/redeem - 核銷優惠券
 * - GET    /api/inventory/count     - 取得背包數量統計
 * - POST   /api/inventory/add       - 新增物品 (#011)
 *
 * ============ 本地配置 ============
 * - getInventoryConfig(): 背包容量配置（前端本地）
 * - getRarityConfig(): 稀有度配置（前端本地）
 */
import { ApiBase } from './base';
import {
  InventoryItem,
  InventoryResponse,
  RedeemResponse,
  PlacePackOptionsResponse,
  OpenPlacePackResponse,
  PaginationParams,
} from '../types';

// ============ 類型定義 ============

/** 背包物品類型篩選 */
export type InventoryFilter = 'all' | 'coupon' | 'ticket' | 'gift' | 'place_pack';

/** 背包物品狀態 */
export type InventoryStatus = 'active' | 'expired' | 'redeemed';

/**
 * 背包查詢參數
 */
export interface InventoryQueryParams extends PaginationParams {
  /** 物品類型篩選 */
  type?: InventoryFilter;
  /** 物品狀態篩選 */
  status?: InventoryStatus;
}

/**
 * 背包數量統計回應
 */
export interface InventoryCountResponse {
  /** 總數量 */
  total: number;
  /** 有效數量 */
  active: number;
  /** 已過期數量 */
  expired: number;
  /** 已核銷數量 */
  redeemed: number;
}

// ============ API 服務類別 ============

/**
 * 背包 API 服務類別
 *
 * 管理用戶的物品箱（優惠券、票券、禮品等）
 */
class InventoryApiService extends ApiBase {

  /**
   * 獲取背包列表
   *
   * 支援分頁和篩選
   * #030: 後端回傳 { items, slotCount, maxSlots, isFull, pagination }，沒有 success 欄位
   *
   * @param token - JWT Token
   * @param params - 查詢參數（分頁、類型、狀態）
   * @returns 背包列表和統計資訊
   */
  async getInventory(token: string, params?: InventoryQueryParams): Promise<InventoryResponse> {
    // 組裝查詢參數
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
   *
   * 注意：後端在 GET 時自動標記為已讀
   *
   * @param token - JWT Token
   * @param itemId - 項目 ID
   * @returns 項目詳情
   */
  async getInventoryItem(token: string, itemId: number): Promise<{ item: InventoryItem }> {
    return this.request<{ item: InventoryItem }>(`/api/inventory/${itemId}`, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 標記背包項目為已讀
   *
   * 後端在 GET 時自動標記為已讀，此方法為便利方法
   *
   * @param token - JWT Token
   * @param itemId - 項目 ID
   * @returns 更新後的項目
   */
  async markInventoryItemRead(token: string, itemId: number): Promise<{ success: boolean; item?: InventoryItem }> {
    try {
      const result = await this.getInventoryItem(token, itemId);
      return { success: true, item: result.item };
    } catch (error) {
      console.error('[InventoryApi] markInventoryItemRead error:', error);
      return { success: false };
    }
  }

  /**
   * 刪除背包項目
   *
   * 用戶可主動丟棄不需要的物品
   *
   * @param token - JWT Token
   * @param itemId - 項目 ID
   * @returns 刪除結果
   */
  async deleteInventoryItem(token: string, itemId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/inventory/${itemId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 核銷優惠券
   *
   * 用戶到店消費時，提供核銷碼給商家核銷
   *
   * @param token - JWT Token
   * @param itemId - 優惠券項目 ID
   * @param dailyCode - 商家每日核銷碼
   * @returns 核銷結果
   *
   * @example
   * const result = await inventoryApi.redeemInventoryItem(token, 123, 'ABC123');
   * if (result.success) {
   *   console.log('核銷成功！');
   * }
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
   *
   * 快速取得各狀態的物品數量，不含詳細資料
   *
   * @param token - JWT Token
   * @returns 數量統計
   */
  async getInventoryCount(token: string): Promise<InventoryCountResponse> {
    return this.request<InventoryCountResponse>('/api/inventory/count', {
      headers: this.authHeaders(token),
    });
  }

  // ============ #011 新增 ============

  /**
   * 新增物品到背包
   *
   * 將扭蛋抽到的物品加入背包
   *
   * @param token - JWT Token
   * @param params - 物品資訊
   * @param params.type - 物品類型（coupon/item）
   * @param params.itemId - 物品 ID
   * @param params.gachaSessionId - 扭蛋 session ID（可選）
   * @returns 新增的物品資料
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

  // ============ 景點包 ============

  /**
   * 查詢景點包開啟選項
   *
   * 回傳景點包資訊、是否限定城市、可選城市清單
   *
   * @param token - JWT Token
   * @param itemId - 道具 ID
   * @returns 景點包資訊與開啟選項
   */
  async getPlacePackOptions(token: string, itemId: number): Promise<PlacePackOptionsResponse> {
    return this.request<PlacePackOptionsResponse>(`/api/inventory/${itemId}/open-options`, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 開啟景點包
   *
   * 景點加入圖鑑，已擁有的自動跳過
   * 開啟後道具狀態變為 redeemed
   *
   * @param token - JWT Token
   * @param itemId - 道具 ID
   * @param selectedCity - 用戶選擇的城市
   * @returns 開啟結果（新增/跳過的景點清單）
   */
  async openPlacePack(token: string, itemId: number, selectedCity: string): Promise<OpenPlacePackResponse> {
    return this.request<OpenPlacePackResponse>(`/api/inventory/${itemId}/open`, {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ selectedCity }),
    });
  }

  /**
   * 獲取背包容量統計
   *
   * 快速取得背包使用量，不含詳細資料
   *
   * @param token - JWT Token
   * @returns 容量統計 { used, max }
   */
  async getInventoryCapacity(token: string): Promise<{ used: number; max: number }> {
    // 目前後端沒有獨立的 capacity API，透過 getInventory 計算
    const data = await this.getInventory(token);
    return {
      used: data.slotCount || 0,
      max: data.maxSlots || 30,
    };
  }

  // ============ 本地配置（不需要後端 API） ============

  /**
   * 獲取背包容量配置
   *
   * 這是前端本地配置，不是後端 API
   * 用於 UI 顯示背包容量限制
   *
   * @returns 背包容量配置
   */
  getInventoryConfig(): { maxSlots: number } {
    return { maxSlots: 30 };
  }

  /**
   * 獲取稀有度配置
   *
   * 這是前端本地配置，不是後端 API
   * 用於 UI 顯示各稀有度的機率和顏色
   *
   * @returns 各稀有度的機率和對應顏色
   */
  getRarityConfig(): {
    SP: { rate: number; color: string };
    SSR: { rate: number; color: string };
    SR: { rate: number; color: string };
    S: { rate: number; color: string };
    R: { rate: number; color: string };
  } {
    return {
      SP: { rate: 0.01, color: '#FFD700' },   // 1% - 金色
      SSR: { rate: 0.05, color: '#FF6B6B' },  // 5% - 紅色
      SR: { rate: 0.15, color: '#9B59B6' },   // 15% - 紫色
      S: { rate: 0.30, color: '#3498DB' },    // 30% - 藍色
      R: { rate: 0.49, color: '#95A5A6' },    // 49% - 灰色
    };
  }
}

// ============ 匯出 ============

/** 背包 API 服務實例 */
export const inventoryApi = new InventoryApiService();
