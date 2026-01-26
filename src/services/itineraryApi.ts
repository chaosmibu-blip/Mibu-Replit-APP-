/**
 * 行程規劃 API 服務
 * 對應後端 API 契約 v1.2.0
 *
 * #026 Breaking Change: 使用 collectionIds / itemIds
 * #027 AI 對話式排程功能
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
  AddPlacesResponse,
  RemovePlaceResponse,
  ReorderPlacesResponse,
  AiChatResponse,
  AiAddPlacesResponse,
} from '../types/itinerary';

class ItineraryApi extends ApiBase {
  /**
   * 取得行程列表
   * GET /api/itinerary
   */
  async getItineraries(token: string): Promise<ItineraryListResponse> {
    try {
      return await this.request<ItineraryListResponse>('/api/itinerary', {
        method: 'GET',
        headers: this.authHeaders(token),
      });
    } catch (error) {
      console.error('[ItineraryApi] getItineraries error:', error);
      return { success: false, itineraries: [] };
    }
  }

  /**
   * 取得行程詳情
   * GET /api/itinerary/:id
   */
  async getItinerary(id: number, token: string): Promise<ItineraryDetailResponse> {
    try {
      return await this.request<ItineraryDetailResponse>(`/api/itinerary/${id}`, {
        method: 'GET',
        headers: this.authHeaders(token),
      });
    } catch (error) {
      console.error('[ItineraryApi] getItinerary error:', error);
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
   * POST /api/itinerary
   */
  async createItinerary(
    data: CreateItineraryRequest,
    token: string
  ): Promise<ItineraryMutationResponse> {
    try {
      console.log('[ItineraryApi] createItinerary request:', JSON.stringify(data));
      return await this.request<ItineraryMutationResponse>('/api/itinerary', {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify(data),
      });
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
   * PUT /api/itinerary/:id
   */
  async updateItinerary(
    id: number,
    data: UpdateItineraryRequest,
    token: string
  ): Promise<ItineraryMutationResponse> {
    try {
      return await this.request<ItineraryMutationResponse>(`/api/itinerary/${id}`, {
        method: 'PUT',
        headers: this.authHeaders(token),
        body: JSON.stringify(data),
      });
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
   * DELETE /api/itinerary/:id
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

  /**
   * 取得可加入行程的景點（來自使用者圖鑑）
   * GET /api/itinerary/:id/available-places
   *
   * V2 變更: 回傳 collectionId + placeId
   */
  async getAvailablePlaces(id: number, token: string): Promise<AvailablePlacesResponse> {
    try {
      return await this.request<AvailablePlacesResponse>(
        `/api/itinerary/${id}/available-places`,
        {
          method: 'GET',
          headers: this.authHeaders(token),
        }
      );
    } catch (error) {
      console.error('[ItineraryApi] getAvailablePlaces error:', error);
      return { success: false, categories: [], totalCount: 0 };
    }
  }

  /**
   * 批次加入景點到行程
   * POST /api/itinerary/:id/places
   *
   * V2 變更: 使用 collectionIds 而非 placeIds
   */
  async addPlaces(
    id: number,
    data: AddPlacesRequest,
    token: string
  ): Promise<AddPlacesResponse> {
    try {
      return await this.request<AddPlacesResponse>(`/api/itinerary/${id}/places`, {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('[ItineraryApi] addPlaces error:', error);
      return { success: false, addedCount: 0, places: [], message: 'Failed to add places' };
    }
  }

  /**
   * 從行程移除景點
   * DELETE /api/itinerary/:id/places/:itemId
   *
   * V2 變更: 參數為 itemId (itinerary_places.id) 而非 placeId
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
   * PUT /api/itinerary/:id/places/reorder
   *
   * V2 變更: 使用 itemIds (itinerary_places.id) 而非 placeIds
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

  // ===== #027 AI 對話式排程功能 =====

  /**
   * AI 對話式排程
   * POST /api/itinerary/:id/ai-chat
   *
   * AI 會根據使用者訊息推薦圖鑑中的景點
   */
  async aiChat(
    id: number,
    data: AiChatRequest,
    token: string
  ): Promise<AiChatResponse> {
    try {
      return await this.request<AiChatResponse>(`/api/itinerary/${id}/ai-chat`, {
        method: 'POST',
        headers: this.authHeaders(token),
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('[ItineraryApi] aiChat error:', error);
      return {
        success: false,
        response: '',
        suggestions: [],
        conversationId: '',
      };
    }
  }

  /**
   * 加入 AI 建議的景點
   * POST /api/itinerary/:id/ai-add-places
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

export const itineraryApi = new ItineraryApi();
