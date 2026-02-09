/**
 * ============================================================
 * 素材資源 API (assetApi.ts)
 * ============================================================
 * 對應後端 GET /api/assets
 * 用於取得 Cloudinary 託管的素材（頭像、成就圖片等）
 */

import { ApiBase } from './base';
import { AssetItem } from '../types/asset';

interface AssetsResponse {
  assets: AssetItem[];
}

class AssetApiService extends ApiBase {
  /**
   * 取得素材資源列表
   * @param category - 分類（如 'avatar_preset'）
   * @returns 素材陣列
   */
  async getAssets(category: string): Promise<AssetItem[]> {
    const data = await this.request<AssetsResponse>(
      `/api/assets?category=${encodeURIComponent(category)}`
    );
    return data.assets || [];
  }
}

export const assetApi = new AssetApiService();
