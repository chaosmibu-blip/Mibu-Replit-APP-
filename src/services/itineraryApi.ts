/**
 * 行程規劃 API 服務
 *
 * 處理行程 CRUD、景點管理、AI 對話式排程等功能
 * 對應後端 API 契約 v1.2.0
 *
 * @module services/itineraryApi
 * @see 後端契約: contracts/APP.md
 *
 * ============ 串接端點 ============
 * - GET    /api/itinerary                  - 取得行程列表
 * - GET    /api/itinerary/:id              - 取得行程詳情
 * - POST   /api/itinerary                  - 建立新行程
 * - PUT    /api/itinerary/:id              - 更新行程資訊
 * - DELETE /api/itinerary/:id              - 刪除行程
 * - GET    /api/itinerary/:id/available-places - 取得可加入的景點
 * - POST   /api/itinerary/:id/places       - 批次加入景點
 * - DELETE /api/itinerary/:id/places/:itemId - 從行程移除景點
 * - PUT    /api/itinerary/:id/places/reorder - 重新排序景點
 * - POST   /api/itinerary/:id/ai-chat      - AI 對話式排程 (#027)
 * - POST   /api/itinerary/:id/ai-add-places - 加入 AI 建議的景點
 *
 * ============ 版本變更 ============
 * #026 Breaking Change: 使用 collectionIds / itemIds
 * #027 AI 對話式排程功能
 * v2.1.0: AI 對話改用 context 取代 previousMessages
 */

import { ApiBase, ApiError } from './base';
import {
  CreateItineraryRequest,
  UpdateItineraryRequest,
  AddPlacesRequest,
  ReorderPlacesRequest,
  AiChatRequest,
  AiAddPlacesRequest,
  ItineraryListResponse,
  ItineraryDetailResponse,
  ItineraryMutationResponse,
  DeleteItineraryResponse,
  AvailablePlacesResponse,
  AvailablePlacesByCategory,
  AddPlacesResponse,
  RemovePlaceResponse,
  ReorderPlacesResponse,
  AiChatResponse,
  AiAddPlacesResponse,
  Itinerary,
  ItinerarySummary,
  ItineraryPlaceItem,
} from '../types/itinerary';

// ============ API 服務類別 ============

/**
 * 行程 API 服務類別
 *
 * 處理所有行程規劃相關的 API 請求
 */
class ItineraryApi extends ApiBase {

  // ============ 基本 CRUD ============

  /**
   * 取得行程列表
   *
   * #030: 後端回傳 { itineraries: [...] }，沒有 success 欄位
   *
   * @param token - JWT Token
   * @returns 行程摘要列表
   */
  async getItineraries(token: string): Promise<ItineraryListResponse> {
    try {
      const data = await this.request<{ itineraries: ItinerarySummary[] }>('/api/itinerary', {
        method: 'GET',
        headers: this.authHeaders(token),
      });
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return { success: true, itineraries: data.itineraries || [] };
    } catch (error) {
      console.error('[ItineraryApi] getItineraries error:', error);
      return { success: false, itineraries: [] };
    }
  }

  /**
   * 取得行程詳情
   *
   * 包含完整的景點列表和排序資訊
   * #030: 後端直接回傳 Itinerary 物件，沒有 success 欄位
   *
   * @param id - 行程 ID
   * @param token - JWT Token
   * @returns 行程詳情
   */
  async getItinerary(id: number, token: string): Promise<ItineraryDetailResponse> {
    try {
      const itinerary = await this.request<Itinerary>(`/api/itinerary/${id}`, {
        method: 'GET',
        headers: this.authHeaders(token),
      });
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return { success: true, itinerary };
    } catch (error) {
      console.error('[ItineraryApi] getItinerary error:', error);
      // 回傳空的行程物件以符合型別
      return {
        success: false,
        itinerary: {
          id: 0,
          title: '',
          date: '',
          country: '',
          city: '',
          places: [],
          createdAt: '',
          updatedAt: '',
        },
      };
    }
  }

  /**
   * 建立新行程
   *
   * 後端直接回傳 Itinerary 物件（HTTP 201），需要包裝成 ItineraryMutationResponse
   *
   * @param data - 行程資料
   * @param data.title - 行程標題
   * @param data.date - 日期
   * @param data.country - 國家
   * @param data.city - 城市
   * @param token - JWT Token
   * @returns 建立結果和行程資料
   */
  async createItinerary(
    data: CreateItineraryRequest,
    token: string
  ): Promise<ItineraryMutationResponse> {
    try {
      console.log('[ItineraryApi] createItinerary request:', JSON.stringify(data));
      console.log('[ItineraryApi] token check:', token ? `Bearer ${token.substring(0, 20)}...` : 'NO TOKEN');

      // 後端直接回傳 Itinerary 物件（HTTP 201）
      const itinerary = await this.request<Itinerary>('/api/itinerary', {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify(data),
      });

      // 包裝成 APP 期望的格式
      return {
        success: true,
        itinerary,
      };
    } catch (error) {
      console.error('[ItineraryApi] createItinerary error:', error);

      // 提取伺服器回傳的錯誤訊息
      let serverMessage: string | undefined;
      if (error instanceof ApiError) {
        serverMessage = error.serverMessage;
        console.log('[ItineraryApi] ApiError details:', {
          status: error.status,
          message: error.message,
          serverMessage: error.serverMessage,
          code: error.code,
        });
      } else if (error instanceof Error) {
        serverMessage = error.message;
        console.log('[ItineraryApi] Generic error:', error.message);
      }

      return {
        success: false,
        itinerary: {
          id: 0,
          title: '',
          date: '',
          country: '',
          city: '',
          places: [],
          createdAt: '',
          updatedAt: '',
        },
        message: serverMessage || '建立行程失敗',
      };
    }
  }

  /**
   * 更新行程資訊
   *
   * @param id - 行程 ID
   * @param data - 要更新的欄位
   * @param token - JWT Token
   * @returns 更新結果和行程資料
   */
  async updateItinerary(
    id: number,
    data: UpdateItineraryRequest,
    token: string
  ): Promise<ItineraryMutationResponse> {
    console.log('[ItineraryApi] updateItinerary called:', { id, data });
    try {
      const res = await this.request<ItineraryMutationResponse>(`/api/itinerary/${id}`, {
        method: 'PUT',
        headers: this.authHeaders(token),
        body: JSON.stringify(data),
      });
      console.log('[ItineraryApi] updateItinerary response:', JSON.stringify(res, null, 2));
      // 確保 success 欄位存在（後端可能不回傳 success，HTTP 200 視為成功）
      if (res.success === undefined && res.itinerary) {
        console.log('[ItineraryApi] Adding success: true (was undefined)');
        return { ...res, success: true };
      }
      return res;
    } catch (error) {
      console.error('[ItineraryApi] updateItinerary error:', error);
      let serverMessage: string | undefined;
      if (error instanceof ApiError) {
        serverMessage = error.serverMessage;
      } else if (error instanceof Error) {
        serverMessage = error.message;
      }
      return {
        success: false,
        itinerary: {
          id: 0,
          title: '',
          date: '',
          country: '',
          city: '',
          places: [],
          createdAt: '',
          updatedAt: '',
        },
        message: serverMessage || '更新行程失敗',
      };
    }
  }

  /**
   * 刪除行程
   *
   * @param id - 行程 ID
   * @param token - JWT Token
   * @returns 刪除結果
   */
  async deleteItinerary(id: number, token: string): Promise<DeleteItineraryResponse> {
    try {
      return await this.request<DeleteItineraryResponse>(`/api/itinerary/${id}`, {
        method: 'DELETE',
        headers: this.authHeaders(token),
      });
    } catch (error) {
      console.error('[ItineraryApi] deleteItinerary error:', error);
      let serverMessage: string | undefined;
      if (error instanceof ApiError) {
        serverMessage = error.serverMessage;
      } else if (error instanceof Error) {
        serverMessage = error.message;
      }
      return { success: false, message: serverMessage || '刪除行程失敗' };
    }
  }

  // ============ 景點管理 ============

  /**
   * 取得可加入行程的景點
   *
   * 從使用者圖鑑中取得符合行程城市的景點
   * V2 變更: 回傳 collectionId + placeId
   * #030: 後端回傳 { categories: [...] }，沒有 success 欄位
   *
   * @param id - 行程 ID
   * @param token - JWT Token
   * @returns 依類別分組的可用景點列表
   */
  async getAvailablePlaces(id: number, token: string): Promise<AvailablePlacesResponse> {
    try {
      console.log('[ItineraryApi] getAvailablePlaces called for itinerary:', id);
      const data = await this.request<{ categories: AvailablePlacesByCategory[] }>(
        `/api/itinerary/${id}/available-places`,
        {
          method: 'GET',
          headers: this.authHeaders(token),
        }
      );
      console.log('[ItineraryApi] getAvailablePlaces raw response:', JSON.stringify(data));

      // 後端沒有 success 欄位，HTTP 200 就是成功
      const categories = data.categories || [];
      // 計算總景點數
      const totalCount = categories.reduce((sum, cat) => sum + cat.places.length, 0);
      console.log('[ItineraryApi] getAvailablePlaces parsed:', { categoriesCount: categories.length, totalCount });

      return { success: true, categories, totalCount };
    } catch (error) {
      console.error('[ItineraryApi] getAvailablePlaces error:', error);
      return { success: false, categories: [], totalCount: 0 };
    }
  }

  /**
   * 批次加入景點到行程
   *
   * V2 變更: 使用 collectionIds 而非 placeIds
   * #030: 後端回傳 { added: [...], count }，沒有 success 欄位
   *
   * @param id - 行程 ID
   * @param data - 要加入的景點（collectionIds）
   * @param token - JWT Token
   * @returns 加入結果和新增的景點資料
   */
  async addPlaces(
    id: number,
    data: AddPlacesRequest,
    token: string
  ): Promise<AddPlacesResponse> {
    try {
      const result = await this.request<{ added: ItineraryPlaceItem[]; count: number }>(
        `/api/itinerary/${id}/places`,
        {
          method: 'POST',
          headers: this.authHeaders(token),
          body: JSON.stringify(data),
        }
      );
      // 後端沒有 success 欄位，HTTP 200 就是成功
      return {
        success: true,
        addedCount: result.count || result.added?.length || 0,
        places: result.added || [],
      };
    } catch (error) {
      console.error('[ItineraryApi] addPlaces error:', error);
      return { success: false, addedCount: 0, places: [], message: 'Failed to add places' };
    }
  }

  /**
   * 從行程移除景點
   *
   * V2 變更: 參數為 itemId (itinerary_places.id) 而非 placeId
   *
   * @param itineraryId - 行程 ID
   * @param itemId - 行程景點項目 ID（注意：不是 placeId）
   * @param token - JWT Token
   * @returns 移除結果
   */
  async removePlace(
    itineraryId: number,
    itemId: number,
    token: string
  ): Promise<RemovePlaceResponse> {
    try {
      return await this.request<RemovePlaceResponse>(
        `/api/itinerary/${itineraryId}/places/${itemId}`,
        {
          method: 'DELETE',
          headers: this.authHeaders(token),
        }
      );
    } catch (error) {
      console.error('[ItineraryApi] removePlace error:', error);
      return { success: false, message: 'Failed to remove place' };
    }
  }

  /**
   * 重新排序行程景點
   *
   * V2 變更: 使用 itemIds (itinerary_places.id) 而非 placeIds
   *
   * @param id - 行程 ID
   * @param data - 新的排序（itemIds 陣列）
   * @param token - JWT Token
   * @returns 排序結果和更新後的景點列表
   */
  async reorderPlaces(
    id: number,
    data: ReorderPlacesRequest,
    token: string
  ): Promise<ReorderPlacesResponse> {
    try {
      return await this.request<ReorderPlacesResponse>(
        `/api/itinerary/${id}/places/reorder`,
        {
          method: 'PUT',
          headers: this.authHeaders(token),
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('[ItineraryApi] reorderPlaces error:', error);
      return { success: false, places: [] };
    }
  }

  // ============ #027 AI 對話式排程功能 ============

  /**
   * AI 對話式排程
   *
   * 透過自然語言與 AI 互動，讓 AI 推薦適合的景點
   * v2.1.0 更新：改用 context 取代 previousMessages
   *
   * 特點：
   * - AI 會根據使用者訊息推薦圖鑑中的景點
   * - 支援多輪對話
   * - 加入重試機制：網路錯誤時最多重試 2 次
   *
   * @param id - 行程 ID
   * @param data - 對話請求
   * @param data.message - 用戶訊息
   * @param data.context - 對話上下文
   * @param token - JWT Token
   * @returns AI 回應和推薦的景點
   */
  async aiChat(
    id: number,
    data: AiChatRequest,
    token: string
  ): Promise<AiChatResponse> {
    // 重試配置
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1500; // 1.5 秒後重試

    /**
     * 判斷是否為網路錯誤
     * 只有網路錯誤才需要重試
     */
    const isNetworkError = (error: unknown): boolean => {
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        return true;
      }
      if (error instanceof Error && error.message.includes('Network')) {
        return true;
      }
      return false;
    };

    // 延遲函數
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    let lastError: unknown;

    // 重試迴圈
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // 非首次嘗試時，先等待再重試
        if (attempt > 0) {
          console.log(`[ItineraryApi] aiChat retry attempt ${attempt}/${MAX_RETRIES}`);
          await delay(RETRY_DELAY);
        }

        console.log('[ItineraryApi] aiChat request:', JSON.stringify(data));
        const result = await this.request<{
          message: string;
          response: string;
          suggestions: AiChatResponse['suggestions'];
          // v2.2.0 新增欄位
          detectedIntent?: AiChatResponse['detectedIntent'];
          nextAction?: AiChatResponse['nextAction'];
          actionTaken?: AiChatResponse['actionTaken'];
          extractedFilters?: AiChatResponse['extractedFilters'];
          remainingCount?: number;
          itineraryUpdated?: boolean;
          updatedItinerary?: AiChatResponse['updatedItinerary'];
        }>(`/api/itinerary/${id}/ai-chat`, {
          method: 'POST',
          headers: this.authHeaders(token),
          body: JSON.stringify(data),
        });
        console.log('[ItineraryApi] aiChat response:', JSON.stringify(result));

        // 後端直接回傳資料，包裝成 APP 期望的格式
        return {
          success: true,
          message: result.message,
          response: result.response,
          suggestions: result.suggestions || [],
          // v2.2.0 新增欄位
          detectedIntent: result.detectedIntent,
          nextAction: result.nextAction,
          actionTaken: result.actionTaken,
          extractedFilters: result.extractedFilters,
          remainingCount: result.remainingCount,
          itineraryUpdated: result.itineraryUpdated,
          updatedItinerary: result.updatedItinerary,
        };
      } catch (error) {
        lastError = error;
        console.error(`[ItineraryApi] aiChat error (attempt ${attempt + 1}):`, error);

        // 只有網路錯誤才重試，其他錯誤直接跳出
        if (!isNetworkError(error) || attempt === MAX_RETRIES) {
          break;
        }
      }
    }

    console.error('[ItineraryApi] aiChat failed after retries:', lastError);
    return {
      success: false,
      response: '',
      suggestions: [],
    };
  }

  /**
   * 加入 AI 建議的景點
   *
   * 將 AI 在對話中推薦的景點加入行程
   *
   * @param id - 行程 ID
   * @param data - 要加入的景點 ID 列表
   * @param token - JWT Token
   * @returns 加入結果
   */
  async aiAddPlaces(
    id: number,
    data: AiAddPlacesRequest,
    token: string
  ): Promise<AiAddPlacesResponse> {
    try {
      return await this.request<AiAddPlacesResponse>(
        `/api/itinerary/${id}/ai-add-places`,
        {
          method: 'POST',
          headers: this.authHeaders(token),
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error('[ItineraryApi] aiAddPlaces error:', error);
      return { success: false, addedCount: 0, places: [] };
    }
  }
}

// ============ 匯出 ============

/** 行程 API 服務實例 */
export const itineraryApi = new ItineraryApi();
