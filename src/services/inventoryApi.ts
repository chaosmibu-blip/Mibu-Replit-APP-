/**
 * 物品箱/庫存相關 API
 */
import { ApiBase } from './base';
import {
  InventoryItem,
  InventoryResponse,
  InventoryConfig,
  RarityConfig,
  RedeemResponse
} from '../types';

class InventoryApiService extends ApiBase {
  async getInventory(token: string): Promise<InventoryResponse> {
    return this.request<InventoryResponse>('/api/inventory', {
      headers: this.authHeaders(token),
    });
  }

  async getInventoryItem(token: string, itemId: number): Promise<{ item: InventoryItem }> {
    return this.request<{ item: InventoryItem }>(`/api/inventory/${itemId}`, {
      headers: this.authHeaders(token),
    });
  }

  async getInventoryConfig(): Promise<InventoryConfig> {
    return this.request<InventoryConfig>('/api/inventory/config');
  }

  async getRarityConfig(): Promise<{ config: RarityConfig }> {
    return this.request<{ config: RarityConfig }>('/api/rarity-config');
  }

  async markInventoryItemRead(token: string, itemId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/inventory/${itemId}/read`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  async deleteInventoryItem(token: string, itemId: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/api/inventory/${itemId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  async redeemInventoryItem(token: string, itemId: number, redemptionCode: string): Promise<RedeemResponse> {
    return this.request<RedeemResponse>(`/api/inventory/${itemId}/redeem`, {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ redemptionCode }),
    });
  }
}

export const inventoryApi = new InventoryApiService();
