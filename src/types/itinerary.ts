/**
 * @fileoverview 行程規劃系統型別定義
 *
 * 定義行程規劃相關的資料結構，包含：
 * - 行程基本資訊
 * - 行程中的景點
 * - AI 對話功能
 * - API 請求/回應格式
 *
 * 對應後端 API 契約 v1.2.0
 * - #026 Breaking Change: 使用 collectionIds 而非 placeIds
 * - #027 AI 對話式排程功能
 * - #034 統一使用 @shared 的型別定義
 *
 * @module types/itinerary
 */

import type { MibuCategory } from '@shared';

// ============ 基礎型別 ============

/**
 * 景點分類
 *
 * 使用 @shared 的 MibuCategory（中文分類名稱）
 * 向後兼容：保留 PlaceCategory 別名
 */
export type PlaceCategory = MibuCategory | string;

// ============ 行程景點 ============

/**
 * 行程中的景點項目
 *
 * 包含景點的完整資訊，用於行程詳情頁面
 * #033: 新增 description, locationLat, locationLng 欄位
 */
export interface ItineraryPlaceItem {
  id: number;                        // itinerary_places.id（用於刪除/排序）
  collectionId: number;              // collections.id（圖鑑收藏 ID）
  placeId: number;                   // places.id（地點 ID）
  name: string;                      // 地點名稱（中文）
  nameEn?: string;                   // 地點名稱（英文）
  category: PlaceCategory;           // 分類
  address?: string;                  // 地址
  imageUrl?: string;                 // 圖片 URL
  description?: string | null;       // 景點描述（#033）
  locationLat?: number | null;       // 緯度（#033）
  locationLng?: number | null;       // 經度（#033）
  sortOrder: number;                 // 排序順序
  addedAt: string;                   // 加入時間（ISO 8601）
  note?: string;                     // 用戶備註
  place?: {                          // 後端新結構（#033）
    name: string;                    // 地點名稱
    category: string | null;         // 分類
    address?: string | null;         // 地址
    description?: string | null;     // 描述
    locationLat?: number | null;     // 緯度
    locationLng?: number | null;     // 經度
  } | null;
}

// ============ 行程資訊 ============

/**
 * 行程基本資訊
 *
 * 完整的行程資料，包含所有景點
 */
export interface Itinerary {
  id: number;                        // 行程 ID
  title: string;                     // 行程標題
  date: string;                      // 行程日期（YYYY-MM-DD）
  country: string;                   // 國家
  city: string;                      // 城市
  district?: string;                 // 區域
  places: ItineraryPlaceItem[];      // 景點列表
  createdAt: string;                 // 建立時間（ISO 8601）
  updatedAt: string;                 // 更新時間（ISO 8601）
}

/**
 * 行程列表項目（摘要）
 *
 * 用於行程列表頁面，只包含必要資訊
 */
export interface ItinerarySummary {
  id: number;          // 行程 ID
  title: string;       // 行程標題
  date: string;        // 行程日期（YYYY-MM-DD）
  country: string;     // 國家
  city: string;        // 城市
  placeCount: number;  // 景點數量
}

// ============ 可用景點 ============

/**
 * 可加入行程的景點（來自圖鑑）
 *
 * 對應後端 GET /api/itinerary/:id/available-places 的 places 項目
 * 注意：category 在父層 AvailablePlacesByCategory 提供，不在單一景點內
 */
export interface AvailablePlaceItem {
  id: number;              // 項目 ID
  collectionId: number;    // 圖鑑收藏 ID（V2 主要識別符）
  placeId: number;         // 地點 ID
  name: string;            // 地點名稱
  address?: string;        // 地址
  city?: string;           // 城市
  district?: string;       // 區域
  nameEn?: string;         // 英文名稱（可選）
  imageUrl?: string;       // 圖片 URL（可選）
}

/**
 * 按分類分組的可用景點
 *
 * 用於景點選擇器的分類顯示
 * 注意：category 是字串（如 "美食"），不是 PlaceCategory 列舉
 */
export interface AvailablePlacesByCategory {
  category: string;                  // 分類名稱（如 "美食"、"景點"）
  categoryName: string;              // 分類顯示名稱
  places: AvailablePlaceItem[];      // 該分類下的景點
}

// ============ API 請求型別 ============

/**
 * 建立行程請求
 * POST /api/itinerary
 */
export interface CreateItineraryRequest {
  date: string;        // 行程日期（YYYY-MM-DD）
  country: string;     // 國家
  city: string;        // 城市
  district?: string;   // 區域（可選）
}

/**
 * 更新行程請求
 * PUT /api/itinerary/:id
 */
export interface UpdateItineraryRequest {
  title?: string;      // 行程標題
  date?: string;       // 行程日期
  country?: string;    // 國家
  city?: string;       // 城市
  district?: string;   // 區域
}

/**
 * 批次加入景點請求
 * POST /api/itinerary/:id/places
 */
export interface AddPlacesRequest {
  collectionIds: number[];  // 圖鑑收藏 ID 陣列（V2）
}

/**
 * 重新排序請求
 * PUT /api/itinerary/:id/places/reorder
 */
export interface ReorderPlacesRequest {
  itemIds: number[];  // itinerary_places.id 陣列（V2）
}

// ============ AI 對話 ============

/**
 * AI 對話請求
 * POST /api/itinerary/:id/ai-chat
 *
 * v2.1.0 更新：改用 context 取代 previousMessages
 */
export interface AiChatRequest {
  message: string;           // 用戶訊息
  context?: AiChatContext;   // 對話上下文
}

/**
 * AI 對話上下文
 *
 * 用於傳遞累積的篩選條件和行程變更狀態
 * v2.2.0 更新：新增 userPreferences 用戶偏好
 */
export interface AiChatContext {
  currentFilters?: {                // 前一輪對話提取的篩選條件（累積傳遞）
    categories?: string[];          // 大分類
    subcategories?: string[];       // 子分類
    districts?: string[];           // 區域
    keywords?: string[];            // 關鍵字
    constraints?: {                 // 限制條件
      hasVehicle?: boolean | null;      // 是否有車
      withKids?: boolean | null;        // 是否帶小孩
      kidsAge?: number | null;          // 小孩年齡
      withElderly?: boolean | null;     // 是否有長輩
      maxHours?: number | null;         // 最大時數
      preferHighRating?: boolean | null; // 偏好高評分
    };
  };
  itineraryChanged?: boolean;       // 行程是否有變更
  changeType?: 'added' | 'removed' | 'reordered'; // 變更類型
  changedItem?: { name: string };   // 變更的項目
  excludedPlaces?: number[];        // 排除的地點 ID
  userPreferences?: {               // v2.2.0 用戶偏好（用於個人化推薦）
    favoriteCategories?: string[];  // 常去的分類
    recentDistricts?: string[];     // 最近瀏覽的區域
    collectionCount?: number;       // 圖鑑收藏數量
  };
  lastSuggestedPlaces?: Array<{     // v2.3.0 上一輪 AI 推薦的景點（用於「好啊」等確認回覆）
    collectionId: number;           // 圖鑑收藏 ID
    placeName: string;              // 地點名稱
  }>;
}

/**
 * AI 對話訊息
 */
export interface AiChatMessage {
  role: 'user' | 'assistant';  // 角色
  content: string;             // 訊息內容
}

/**
 * 加入 AI 建議請求
 * POST /api/itinerary/:id/ai-add-places
 */
export interface AiAddPlacesRequest {
  collectionIds: number[];  // 要加入的圖鑑 ID
}

// ============ API 回應型別 ============

/**
 * 行程列表回應
 * GET /api/itinerary
 */
export interface ItineraryListResponse {
  success: boolean;                  // 是否成功
  itineraries: ItinerarySummary[];   // 行程列表
}

/**
 * 行程詳情回應
 * GET /api/itinerary/:id
 */
export interface ItineraryDetailResponse {
  success: boolean;       // 是否成功
  itinerary: Itinerary;   // 行程詳情
}

/**
 * 建立/更新行程回應
 */
export interface ItineraryMutationResponse {
  success: boolean;       // 是否成功
  itinerary: Itinerary;   // 更新後的行程
  message?: string;       // 回應訊息
}

/**
 * 刪除行程回應
 * DELETE /api/itinerary/:id
 */
export interface DeleteItineraryResponse {
  success: boolean;   // 是否成功
  message?: string;   // 回應訊息
}

/**
 * 可用景點回應
 * GET /api/itinerary/:id/available-places
 */
export interface AvailablePlacesResponse {
  success: boolean;                          // 是否成功
  categories: AvailablePlacesByCategory[];   // 按分類的景點
  totalCount: number;                        // 總數量
}

/**
 * 加入景點回應
 * POST /api/itinerary/:id/places
 */
export interface AddPlacesResponse {
  success: boolean;                // 是否成功
  addedCount: number;              // 成功加入數量
  places: ItineraryPlaceItem[];    // 加入的景點
  message?: string;                // 回應訊息
}

/**
 * 移除景點回應
 * DELETE /api/itinerary/:id/places/:itemId
 */
export interface RemovePlaceResponse {
  success: boolean;   // 是否成功
  message?: string;   // 回應訊息
}

/**
 * 排序回應
 * PUT /api/itinerary/:id/places/reorder
 */
export interface ReorderPlacesResponse {
  success: boolean;              // 是否成功
  places: ItineraryPlaceItem[];  // 排序後的景點
}

// ============ AI 建議 ============

/**
 * AI 建議的景點
 *
 * v2.1.0 更新：新增 placeName, district, locationLat, locationLng
 */
export interface AiSuggestedPlace {
  collectionId: number;              // 圖鑑 ID
  name?: string;                     // 名稱（向後兼容）
  placeName?: string;                // 地點名稱（v2.1.0）
  category?: PlaceCategory | string | null; // 分類
  district?: string | null;          // 區域（v2.1.0）
  reason: string;                    // AI 推薦理由
  locationLat?: number | null;       // 緯度（v2.1.0）
  locationLng?: number | null;       // 經度（v2.1.0）
  insertAfterCollectionId?: number | null; // v2.3.0 AI 指定的插入位置（插入在此 collectionId 之後，null 表示插入最後）
}

// ============ V2.2 AI 意圖與動作型別 ============

/**
 * AI 偵測到的用戶意圖
 * v2.2.0 新增
 */
export type AiDetectedIntent =
  | 'plan'        // 規劃行程
  | 'modify'      // 修改行程
  | 'detail'      // 查詢詳情
  | 'route'       // 路線優化
  | 'chitchat'    // 閒聊
  | 'unsupported'; // 不支援的請求

/**
 * AI 建議的下一步動作
 * v2.2.0 新增
 */
export type AiNextAction =
  | 'ask_preference'    // 詢問偏好
  | 'show_suggestions'  // 顯示推薦
  | 'confirm_add'       // 確認加入
  | 'show_detail'       // 顯示詳情
  | 'optimize_route'    // 優化路線
  | null;

/**
 * AI 執行的動作結果
 * v2.2.0 新增（Function Calling）
 */
export interface AiActionTaken {
  type: 'query_detail' | 'optimize_route' | 'add_place' | 'remove_place' | 'none';
  result?: unknown;  // 動作執行結果
}

/**
 * AI 對話回應
 * POST /api/itinerary/:id/ai-chat
 *
 * v2.1.0 更新：新增 extractedFilters 和 remainingCount
 * v2.2.0 更新：新增 detectedIntent, nextAction, actionTaken（智慧意圖識別）
 */
export interface AiChatResponse {
  success: boolean;                  // 是否成功
  message?: string;                  // 原訊息
  response: string;                  // AI 回覆
  suggestions: AiSuggestedPlace[];   // 建議景點

  // v2.2.0 意圖識別
  detectedIntent?: AiDetectedIntent; // AI 偵測到的意圖
  nextAction?: AiNextAction;         // 建議的下一步動作
  actionTaken?: AiActionTaken;       // 已執行的動作（Function Calling 結果）

  extractedFilters?: {               // 從本輪對話提取的篩選條件
    categories: string[];            // 大分類
    subcategories: string[];         // 子分類
    districts: string[];             // 區域
    keywords: string[];              // 關鍵字
    constraints: {                   // 限制條件
      hasVehicle: boolean | null;        // 是否有車
      withKids: boolean | null;          // 是否帶小孩
      kidsAge: number | null;            // 小孩年齡
      withElderly: boolean | null;       // 是否有長輩
      maxHours: number | null;           // 最大時數
      preferHighRating: boolean | null;  // 偏好高評分
    };
  };
  remainingCount?: number;           // 篩選後剩餘的候選景點數量
  placesToRemove?: number[];         // v2.3.0 AI 要刪除的景點 collectionId 陣列
  itineraryUpdated?: boolean;        // 行程表是否有更新
  updatedItinerary?: Array<{         // 更新後的行程
    id: number;                      // 項目 ID
    collectionId: number;            // 圖鑑 ID
    placeName: string;               // 地點名稱
    district: string | null;         // 區域
    category: string | null;         // 分類
    sortOrder: number;               // 排序
  }> | null;
}

/**
 * AI 加入景點回應
 * POST /api/itinerary/:id/ai-add-places
 */
export interface AiAddPlacesResponse {
  success: boolean;              // 是否成功
  addedCount: number;            // 成功加入數量
  places: ItineraryPlaceItem[];  // 加入的景點
}
