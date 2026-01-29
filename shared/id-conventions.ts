/**
 * MIBU ID 命名規範
 *
 * 此檔案明確定義各種 ID 的意義和使用場景
 * 解決 placeId、collectionId、itemId 混淆的問題
 */

// ============ ID 類型定義 ============

/**
 * 官方景點 ID (officialPlaceId / placeId)
 *
 * 來源：official_places 表
 * 用途：系統內的官方景點資料
 * 使用場景：
 *   - 景點詳情頁
 *   - Google Places 資料關聯
 *
 * 注意：用戶的圖鑑收藏不應該直接用這個 ID
 */
export type OfficialPlaceId = number;

/**
 * 圖鑑收藏 ID (collectionId)
 *
 * 來源：collections 表
 * 用途：用戶抽到的景點卡片
 * 使用場景：
 *   - 從圖鑑加入行程 → 傳 collectionIds
 *   - 圖鑑列表顯示
 *   - 標記已讀優惠
 *
 * 重要：這是 V2 系統的核心 ID，行程操作優先使用此 ID
 */
export type CollectionId = number;

/**
 * 行程項目 ID (itemId)
 *
 * 來源：itinerary_places 表的 id 欄位
 * 用途：行程內的景點項目
 * 使用場景：
 *   - 從行程移除景點 → DELETE /api/itinerary/:id/places/:itemId
 *   - 重新排序景點 → PUT /api/itinerary/:id/places/reorder { itemIds: [...] }
 *
 * 注意：不是 collectionId，也不是 placeId！
 */
export type ItineraryItemId = number;

/**
 * 行程 ID (itineraryId)
 *
 * 來源：user_itineraries 表
 * 用途：用戶建立的行程
 */
export type ItineraryId = number;

// ============ ID 使用場景對照表 ============
/**
 * API 操作與應該使用的 ID 類型對照
 */
export const ID_USAGE_MAP = {
  // 行程相關
  '建立行程': 'itineraryId（回傳）',
  '取得行程詳情': 'itineraryId（路由參數）',
  '刪除行程': 'itineraryId（路由參數）',

  // 從圖鑑加入行程
  '取得可加入的景點': 'collectionId（回傳的 places[].collectionId）',
  '加入景點到行程': 'collectionId（Request body: collectionIds）',

  // 行程內操作
  '移除行程內景點': 'itemId（路由參數，來自 places[].id）',
  '重新排序景點': 'itemId（Request body: itemIds，來自 places[].id）',

  // 圖鑑相關
  '取得圖鑑列表': 'collectionId（回傳的 collections[].id）',
  '刪除圖鑑收藏': 'collectionId（路由參數）',
  '標記優惠已讀': 'collectionId（路由參數）',

  // 景點相關
  '景點詳情': 'placeId（官方景點 ID）',
  '加入最愛': 'placeId（路由參數）',
} as const;

// ============ 常見錯誤提醒 ============
/**
 * 前端常見的 ID 使用錯誤
 */
export const COMMON_ID_MISTAKES = {
  '加入行程時傳 placeIds': '應該傳 collectionIds',
  '刪除行程景點時傳 collectionId': '應該傳 itemId（places[].id）',
  '排序時傳 collectionIds': '應該傳 itemIds（places[].id）',
  '混用 id 和 collectionId': '行程詳情的 places[].id 是 itemId，places[].collectionId 才是圖鑑 ID',
} as const;

// ============ 行程詳情回應結構說明 ============
/**
 * GET /api/itinerary/:id 回傳的 places 結構
 *
 * ```typescript
 * places: Array<{
 *   id: number;           // ← 這是 itemId，用於刪除和排序
 *   collectionId: number; // ← 這是 collectionId，用於識別圖鑑收藏
 *   placeId: number;      // ← 這是 officialPlaceId，用於關聯官方景點
 *   sortOrder: number;
 *   place: { name, category, ... };
 * }>
 * ```
 *
 * 使用指南：
 * - 刪除景點：用 places[].id
 * - 排序景點：用 places[].id 的陣列
 * - 顯示卡片：用 places[].collectionId 關聯圖鑑資料
 */
export interface ItineraryPlaceItem {
  id: ItineraryItemId;           // 行程項目 ID（刪除、排序用）
  collectionId: CollectionId;    // 圖鑑收藏 ID
  placeId: OfficialPlaceId | null; // 官方景點 ID（可能為 null）
  sortOrder: number;
  note?: string;
  place: {
    name: string;
    category: string | null;
    address: string | null;
    description?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
  } | null;
}
