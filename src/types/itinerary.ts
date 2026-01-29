/**
 * 行程規劃相關型別定義
 * 對應後端 API 契約 v1.2.0
 *
 * #026 Breaking Change: 使用 collectionIds 而非 placeIds
 * #027 AI 對話式排程功能
 * #034: 統一使用 @shared 的型別定義
 */

import type { MibuCategory } from '@shared';

// #034: 使用 @shared 的 MibuCategory（中文分類名稱）
// 向後兼容：保留 PlaceCategory 別名
export type PlaceCategory = MibuCategory | string;

// 行程中的景點項目
// #033: 新增 description, locationLat, locationLng 欄位
export interface ItineraryPlaceItem {
  id: number;            // itinerary_places.id (V2: 用於刪除/排序)
  collectionId: number;  // collections.id (V2: 圖鑑收藏 ID)
  placeId: number;       // places.id
  name: string;
  nameEn?: string;
  category: PlaceCategory;
  address?: string;
  imageUrl?: string;
  description?: string | null;   // #033: 景點描述
  locationLat?: number | null;   // #033: 緯度
  locationLng?: number | null;   // #033: 經度
  sortOrder: number;
  addedAt: string;       // ISO 8601
  note?: string;         // 用戶備註
  // #033: 支援後端新結構（place 巢狀物件）
  place?: {
    name: string;
    category: string | null;
    address?: string | null;
    description?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
  } | null;
}

// 行程基本資訊
export interface Itinerary {
  id: number;
  title: string;
  date: string;          // YYYY-MM-DD
  country: string;
  city: string;
  district?: string;
  places: ItineraryPlaceItem[];
  createdAt: string;
  updatedAt: string;
}

// 行程列表項目（摘要）
export interface ItinerarySummary {
  id: number;
  title: string;
  date: string;
  country: string;
  city: string;
  placeCount: number;
}

// 可加入行程的景點（來自圖鑑）
export interface AvailablePlaceItem {
  collectionId: number;  // V2: 主要識別符
  placeId: number;
  name: string;
  nameEn?: string;
  category: PlaceCategory;
  imageUrl?: string;
}

// 按分類分組的可用景點
export interface AvailablePlacesByCategory {
  category: PlaceCategory;
  categoryName: string;
  places: AvailablePlaceItem[];
}

// ===== API Request Types =====

// POST /api/itinerary - 建立行程
export interface CreateItineraryRequest {
  date: string;          // YYYY-MM-DD
  country: string;
  city: string;
  district?: string;
}

// PUT /api/itinerary/:id - 更新行程
export interface UpdateItineraryRequest {
  title?: string;
  date?: string;
  country?: string;
  city?: string;
  district?: string;
}

// POST /api/itinerary/:id/places - 批次加入景點
export interface AddPlacesRequest {
  collectionIds: number[];  // V2: 使用 collectionIds
}

// PUT /api/itinerary/:id/places/reorder - 重新排序
export interface ReorderPlacesRequest {
  itemIds: number[];  // V2: itinerary_places.id 陣列
}

// POST /api/itinerary/:id/ai-chat - AI 對話
// v2.1.0 更新：改用 context 取代 previousMessages
export interface AiChatRequest {
  message: string;
  context?: AiChatContext;
}

export interface AiChatContext {
  // 前一輪對話提取的篩選條件（累積傳遞）
  currentFilters?: {
    categories?: string[];      // 大分類
    subcategories?: string[];   // 子分類
    districts?: string[];       // 區域
    keywords?: string[];        // 關鍵字
    constraints?: {
      hasVehicle?: boolean | null;
      withKids?: boolean | null;
      kidsAge?: number | null;
      withElderly?: boolean | null;
      maxHours?: number | null;
      preferHighRating?: boolean | null;
    };
  };
  itineraryChanged?: boolean;
  changeType?: 'added' | 'removed' | 'reordered';
  changedItem?: { name: string };
  excludedPlaces?: number[];
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// POST /api/itinerary/:id/ai-add-places - 加入 AI 建議
export interface AiAddPlacesRequest {
  collectionIds: number[];
}

// ===== API Response Types =====

// 行程列表回應
export interface ItineraryListResponse {
  success: boolean;
  itineraries: ItinerarySummary[];
}

// 行程詳情回應
export interface ItineraryDetailResponse {
  success: boolean;
  itinerary: Itinerary;
}

// 建立/更新行程回應
export interface ItineraryMutationResponse {
  success: boolean;
  itinerary: Itinerary;
  message?: string;
}

// 刪除行程回應
export interface DeleteItineraryResponse {
  success: boolean;
  message?: string;
}

// 可用景點回應
export interface AvailablePlacesResponse {
  success: boolean;
  categories: AvailablePlacesByCategory[];
  totalCount: number;
}

// 加入景點回應
export interface AddPlacesResponse {
  success: boolean;
  addedCount: number;
  places: ItineraryPlaceItem[];
  message?: string;
}

// 移除景點回應
export interface RemovePlaceResponse {
  success: boolean;
  message?: string;
}

// 排序回應
export interface ReorderPlacesResponse {
  success: boolean;
  places: ItineraryPlaceItem[];
}

// AI 建議的景點
// v2.1.0 更新：新增 placeName, district, locationLat, locationLng
export interface AiSuggestedPlace {
  collectionId: number;
  name?: string;              // 向後兼容
  placeName?: string;         // v2.1.0 新增
  category?: PlaceCategory | string | null;
  district?: string | null;
  reason: string;             // AI 推薦理由
  locationLat?: number | null;
  locationLng?: number | null;
}

// AI 對話回應
// v2.1.0 更新：新增 extractedFilters 和 remainingCount
export interface AiChatResponse {
  success: boolean;
  message?: string;           // 原訊息
  response: string;           // AI 回覆
  suggestions: AiSuggestedPlace[];
  extractedFilters?: {        // 從本輪對話提取的篩選條件
    categories: string[];
    subcategories: string[];
    districts: string[];
    keywords: string[];
    constraints: {
      hasVehicle: boolean | null;
      withKids: boolean | null;
      kidsAge: number | null;
      withElderly: boolean | null;
      maxHours: number | null;
      preferHighRating: boolean | null;
    };
  };
  remainingCount?: number;    // 篩選後剩餘的候選景點數量
  itineraryUpdated?: boolean; // 行程表是否有更新
  updatedItinerary?: Array<{
    id: number;
    collectionId: number;
    placeName: string;
    district: string | null;
    category: string | null;
    sortOrder: number;
  }> | null;
}

// AI 加入景點回應
export interface AiAddPlacesResponse {
  success: boolean;
  addedCount: number;
  places: ItineraryPlaceItem[];
}
