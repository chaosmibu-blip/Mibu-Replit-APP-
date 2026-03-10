/**
 * MINI 貓咪系統 API 服務（#056-#061）
 *
 * 虛擬夥伴 MINI 的所有 API 端點
 * 包含 Profile、探索、塗鴉牆、筆記、副貓、養成
 *
 * @module services/miniApi
 * @see 後端契約: contracts/APP.md MINI 貓咪系統
 * @created 2026-02-25
 *
 * ============ 串接端點 ============
 * Profile:
 * - GET   /api/mini/profile           - 取得/自動建立 MINI Profile
 * - PATCH /api/mini/profile/name      - 更改名字
 *
 * 探索:
 * - POST  /api/mini/explore/start     - 開始探索
 * - GET   /api/mini/explore/status    - 查詢狀態
 * - POST  /api/mini/explore/:id/claim - 領取結果
 * - POST  /api/mini/explore/location-check - 位置觸發
 *
 * 塗鴉牆:
 * - GET    /api/mini/graffiti/:placeId - 取得景點塗鴉
 * - POST   /api/mini/graffiti/:placeId - 新增留言
 * - DELETE /api/mini/graffiti/:id      - 刪除留言
 *
 * 筆記:
 * - GET    /api/mini/notes/:placeId   - 取得景點筆記
 * - POST   /api/mini/notes/:placeId   - 新增筆記
 * - PATCH  /api/mini/notes/:id        - 更新筆記
 * - DELETE /api/mini/notes/:id        - 刪除筆記
 *
 * 副貓圖鑑:
 * - GET    /api/mini/sub-cats/catalog    - 副貓目錄
 * - GET    /api/mini/sub-cats/collection - 用戶圖鑑
 * - GET    /api/mini/sub-cats/bonuses    - 加成彙總
 *
 * 養成:
 * - GET    /api/mini/nurture/status   - 養成狀態
 * - POST   /api/mini/nurture/feed     - 餵食
 * - GET    /api/mini/nurture/logs     - 養成紀錄
 * - GET    /api/mini/nurture/cat-food - 貓糧數量
 */
import { ApiBase } from './base';
import type {
  MiniProfileResponse,
  UpdateMiniNameResponse,
  StartExplorationParams,
  StartExplorationResponse,
  ExplorationStatusResponse,
  ClaimExplorationResponse,
  LocationCheckParams,
  LocationCheckResponse,
  GraffitiListResponse,
  CreateGraffitiParams,
  CreateGraffitiResponse,
  NotesListResponse,
  CreateNoteParams,
  CreateNoteResponse,
  UpdateNoteParams,
  UpdateNoteResponse,
  SubCatType,
  SubCatCatalogResponse,
  SubCatCollectionResponse,
  SubCatBonusesResponse,
  NurtureStatusResponse,
  FeedResponse,
  NurtureLogsResponse,
  CatFoodResponse,
} from '../types/mini';

class MiniApiService extends ApiBase {

  // ============ #056 Profile ============

  /** 取得 MINI Profile（不存在會自動建立） */
  async getProfile(token: string): Promise<MiniProfileResponse> {
    return this.request<MiniProfileResponse>('/api/mini/profile', {
      headers: this.authHeaders(token),
    });
  }

  /** 更改 MINI 名字（1-50 字） */
  async updateName(token: string, name: string): Promise<UpdateMiniNameResponse> {
    return this.request<UpdateMiniNameResponse>('/api/mini/profile/name', {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify({ name }),
    });
  }

  // ============ #057 探索系統 ============

  /** 開始探索（隨機 1-15 分鐘，與扭蛋共用每日 36 額度） */
  async startExploration(token: string, params: StartExplorationParams): Promise<StartExplorationResponse> {
    return this.request<StartExplorationResponse>('/api/mini/explore/start', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /** 查詢探索狀態 */
  async getExplorationStatus(token: string): Promise<ExplorationStatusResponse> {
    return this.request<ExplorationStatusResponse>('/api/mini/explore/status', {
      headers: this.authHeaders(token),
    });
  }

  /** 領取已完成的探索結果 */
  async claimExploration(token: string, explorationId: number): Promise<ClaimExplorationResponse> {
    return this.request<ClaimExplorationResponse>(`/api/mini/explore/${explorationId}/claim`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /** 位置觸發探索（APP 定期呼叫） */
  async locationCheck(token: string, params: LocationCheckParams): Promise<LocationCheckResponse> {
    return this.request<LocationCheckResponse>('/api/mini/explore/location-check', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  // ============ #058 塗鴉牆 ============

  /** 取得景點塗鴉牆留言 */
  async getGraffiti(token: string, placeId: number): Promise<GraffitiListResponse> {
    return this.request<GraffitiListResponse>(`/api/mini/graffiti/${placeId}`, {
      headers: this.authHeaders(token),
    });
  }

  /** 新增塗鴉牆留言（每人每景點最多 3 則） */
  async createGraffiti(token: string, placeId: number, params: CreateGraffitiParams): Promise<CreateGraffitiResponse> {
    return this.request<CreateGraffitiResponse>(`/api/mini/graffiti/${placeId}`, {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /** 刪除自己的塗鴉牆留言 */
  async deleteGraffiti(token: string, graffitiId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/mini/graffiti/${graffitiId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  // ============ #059 景點筆記 ============

  /** 取得景點私人筆記 */
  async getNotes(token: string, placeId: number): Promise<NotesListResponse> {
    return this.request<NotesListResponse>(`/api/mini/notes/${placeId}`, {
      headers: this.authHeaders(token),
    });
  }

  /** 新增景點筆記（1-2000 字） */
  async createNote(token: string, placeId: number, params: CreateNoteParams): Promise<CreateNoteResponse> {
    return this.request<CreateNoteResponse>(`/api/mini/notes/${placeId}`, {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /** 更新筆記 */
  async updateNote(token: string, noteId: number, params: UpdateNoteParams): Promise<UpdateNoteResponse> {
    return this.request<UpdateNoteResponse>(`/api/mini/notes/${noteId}`, {
      method: 'PATCH',
      headers: this.authHeaders(token),
      body: JSON.stringify(params),
    });
  }

  /** 刪除筆記 */
  async deleteNote(token: string, noteId: number): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/mini/notes/${noteId}`, {
      method: 'DELETE',
      headers: this.authHeaders(token),
    });
  }

  // ============ #060 副貓圖鑑 ============

  /** 取得副貓目錄（可按類型篩選） */
  async getSubCatCatalog(token: string, type?: SubCatType): Promise<SubCatCatalogResponse> {
    const query = type ? `?type=${type}` : '';
    return this.request<SubCatCatalogResponse>(`/api/mini/sub-cats/catalog${query}`, {
      headers: this.authHeaders(token),
    });
  }

  /** 取得用戶的貓咪圖鑑（全部副貓 + 是否擁有） */
  async getSubCatCollection(token: string): Promise<SubCatCollectionResponse> {
    return this.request<SubCatCollectionResponse>('/api/mini/sub-cats/collection', {
      headers: this.authHeaders(token),
    });
  }

  /** 取得副貓加成效果彙總 */
  async getSubCatBonuses(token: string): Promise<SubCatBonusesResponse> {
    return this.request<SubCatBonusesResponse>('/api/mini/sub-cats/bonuses', {
      headers: this.authHeaders(token),
    });
  }

  // ============ #061 養成系統 ============

  /** 取得養成狀態（飽食度、羈絆、成長階段） */
  async getNurtureStatus(token: string): Promise<NurtureStatusResponse> {
    return this.request<NurtureStatusResponse>('/api/mini/nurture/status', {
      headers: this.authHeaders(token),
    });
  }

  /** 餵食 MINI（消耗 1 份貓糧） */
  async feed(token: string): Promise<FeedResponse> {
    return this.request<FeedResponse>('/api/mini/nurture/feed', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /** 取得養成紀錄（時間倒序） */
  async getNurtureLogs(token: string, limit = 20): Promise<NurtureLogsResponse> {
    return this.request<NurtureLogsResponse>(`/api/mini/nurture/logs?limit=${limit}`, {
      headers: this.authHeaders(token),
    });
  }

  /** 取得貓糧數量 */
  async getCatFood(token: string): Promise<CatFoodResponse> {
    return this.request<CatFoodResponse>('/api/mini/nurture/cat-food', {
      headers: this.authHeaders(token),
    });
  }
}

/** MINI 貓咪系統 API 服務實例 */
export const miniApi = new MiniApiService();
