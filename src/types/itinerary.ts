/**
 * 行程規劃相關型別定義
 * 對應後端 API 契約 v1.2.0
 *
 * #026 Breaking Change: 使用 collectionIds 而非 placeIds
 * #027 AI 對話式排程功能
 */

// 七大景點分類
export type PlaceCategory =
  | 'nature'      // 自然風景
  | 'culture'     // 文化古蹟
  | 'food'        // 美食餐廳
  | 'shopping'    // 購物商圈
  | 'nightlife'   // 夜生活
  | 'outdoor'     // 戶外活動
  | 'other';      // 其他

// 行程中的景點項目
export interface ItineraryPlaceItem {
  id: number;            // itinerary_places.id (V2: 用於刪除/排序)
  collectionId: number;  // collections.id (V2: 圖鑑收藏 ID)
  placeId: number;       // places.id
  name: string;
  nameEn?: string;
  category: PlaceCategory;
  address?: string;
  imageUrl?: string;
  sortOrder: number;
  addedAt: string;       // ISO 8601
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
export interface AiChatRequest {
  message: string;
  previousMessages?: AiChatMessage[];
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
export interface AiSuggestedPlace {
  collectionId: number;
  name: string;
  category?: PlaceCategory;
  reason: string;  // AI 推薦理由
}

// AI 對話回應
export interface AiChatResponse {
  success: boolean;
  response: string;
  suggestions: AiSuggestedPlace[];
  conversationId: string;
}

// AI 加入景點回應
export interface AiAddPlacesResponse {
  success: boolean;
  addedCount: number;
  places: ItineraryPlaceItem[];
}
