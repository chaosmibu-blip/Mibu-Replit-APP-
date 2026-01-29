/**
 * MIBU API 型別定義
 *
 * 此檔案定義所有 API 的 Request 和 Response 型別
 * 從 docs/contracts/APP.md 提取，保持同步
 *
 * 使用方式：
 * ```typescript
 * import { V2GachaPullRequest, V2GachaPullResponse } from '@mibu/shared';
 *
 * const request: V2GachaPullRequest = { city: '台北市', count: 7 };
 * const response: V2GachaPullResponse = await api.gachaPull(request);
 * ```
 */

import type { MibuCategory, CouponRarity } from './constants';
import type { CollectionId, ItineraryItemId, OfficialPlaceId, ItineraryId } from './id-conventions';
import type { PaginationInfo } from './response';

// ============================================================
// 扭蛋系統 (V2)
// ============================================================

/** POST /api/v2/gacha/pull - Request */
export interface V2GachaPullRequest {
  regionId?: number;
  city?: string;
  district?: string;
  count?: number;        // 5-12，預設 7
  deviceId?: string;     // 裝置識別碼（防刷）
}

/** POST /api/v2/gacha/pull - Response */
export interface V2GachaPullResponse {
  success: boolean;
  cards: V2GachaCard[];
  meta: {
    city: string;
    district?: string;
    totalCards: number;
    newCardCount: number;
    couponCount: number;
    categoryDistribution: Record<string, number>;
    dailyLimit: number;
    dailyPullCount: number;
    remainingQuota: number;
  };
}

export interface V2GachaCard {
  type: 'place';
  place: {
    id: number;
    placeName: string;
    category: MibuCategory;
    subcategory?: string;
    description?: string;
    address?: string;
    rating?: number;
    locationLat?: number;
    locationLng?: number;
    googlePlaceId?: string;
  };
  coupon?: {
    id: number;
    title: string;
    code: string;
    terms?: string;
    rarity?: CouponRarity;
  } | null;
  isNew: boolean;
}

/** GET /api/gacha/quota - Response */
export interface GachaQuotaResponse {
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  isUnlimited: boolean;
}

// ============================================================
// 圖鑑系統 (Collections)
// ============================================================

/** GET /api/collections - Response */
export interface CollectionsResponse {
  collections: Collection[];
  pagination: PaginationInfo;
}

export interface Collection {
  id: CollectionId;
  placeId: OfficialPlaceId;
  placeName: string;
  category: MibuCategory;
  subcategory?: string;
  city: string;
  district?: string;
  address?: string;
  description?: string;
  rating?: number;
  locationLat?: number;
  locationLng?: number;
  googlePlaceId?: string;
  collectedAt: string;
  isCoupon: boolean;
  coupon?: {
    id: number;
    title: string;
    code: string;
    rarity: CouponRarity;
  };
}

/** GET /api/collections/stats - Response */
export interface CollectionStatsResponse {
  totalCollected: number;
  byCity: Record<string, number>;
  byCategory: Record<string, number>;
  recentCount: number;
}

/** GET /api/collections/favorites - Response */
export interface FavoritesResponse {
  favorites: {
    id: number;
    placeId: OfficialPlaceId;
    collectionId?: CollectionId;
    createdAt: string;
    place?: {
      id: number;
      placeName: string;
      description?: string;
      category: string;
      city: string;
      district: string;
      address?: string;
      rating?: number;
      locationLat?: number;
      locationLng?: number;
    };
  }[];
  count: number;
}

/** GET /api/collections/promo-updates - Response */
export interface PromoUpdatesResponse {
  unreadPromoCount: number;
  collectionIds: CollectionId[];
}

// ============================================================
// 行程系統 (Itinerary)
// ============================================================

/** POST /api/itinerary - Request */
export interface CreateItineraryRequest {
  date: string;          // YYYY-MM-DD
  country: string;
  city: string;
  district?: string;
}

/** POST /api/itinerary - Response */
export interface CreateItineraryResponse {
  id: ItineraryId;
  userId: string;
  title: string;
  date: string;
  country: string;
  city: string;
  district: string | null;
  places: [];
  createdAt: string;
}

/** GET /api/itinerary - Response */
export interface ItineraryListResponse {
  itineraries: {
    id: ItineraryId;
    title: string;
    date: string;
    city: string;
    placeCount: number;
  }[];
}

/** GET /api/itinerary/:id - Response */
export interface ItineraryDetailResponse {
  id: ItineraryId;
  title: string;
  date: string;
  country: string;
  city: string;
  district: string | null;
  places: ItineraryPlaceDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryPlaceDetail {
  id: ItineraryItemId;           // ⚠️ 這是 itemId，用於刪除和排序
  collectionId: CollectionId | null;
  placeId: OfficialPlaceId | null;
  sortOrder: number;
  note: string | null;
  place: {
    name: string;
    category: string | null;
    address: string | null;
    description?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
  } | null;
}

/** GET /api/itinerary/:id/available-places - Response */
export interface AvailablePlacesResponse {
  categories: {
    code: string;
    name: string;
    places: {
      id: CollectionId;           // 向後兼容，同 collectionId
      collectionId: CollectionId; // ⚠️ 用這個加入行程
      placeId: OfficialPlaceId | null;
      name: string;
      address: string | null;
    }[];
  }[];
}

/** POST /api/itinerary/:id/places - Request */
export interface AddPlacesRequest {
  collectionIds?: CollectionId[];  // ⚠️ V2: 用這個
  placeIds?: number[];             // 向後兼容，已棄用
}

/** POST /api/itinerary/:id/places - Response */
export interface AddPlacesResponse {
  added: {
    id: ItineraryItemId;
    collectionId: CollectionId;
    placeId: OfficialPlaceId | null;
    sortOrder: number;
    place: {
      name: string;
      category: string | null;
      address: string | null;
    } | null;
  }[];
  count: number;
}

/** DELETE /api/itinerary/:id/places/:itemId - Response */
export interface RemovePlaceResponse {
  success: true;
  removedItemId: ItineraryItemId;
}

/** PUT /api/itinerary/:id/places/reorder - Request */
export interface ReorderPlacesRequest {
  itemIds?: ItineraryItemId[];  // ⚠️ V2: 用這個
  placeIds?: number[];          // 向後兼容，已棄用
}

/** PUT /api/itinerary/:id/places/reorder - Response */
export interface ReorderPlacesResponse {
  success: true;
}

// ============================================================
// AI 對話排程
// ============================================================

/** POST /api/itinerary/:id/ai-chat - Request */
export interface AIChatRequest {
  message: string;
  context?: {
    currentFilters?: {
      categories?: string[];
      subcategories?: string[];
      districts?: string[];
      keywords?: string[];
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
    excludedPlaces?: CollectionId[];
  };
}

/** POST /api/itinerary/:id/ai-chat - Response */
export interface AIChatResponse {
  message: string;
  response: string;
  suggestions: AISuggestedPlace[];
  extractedFilters: {
    categories: string[];
    subcategories: string[];
    districts: string[];
    keywords: string[];
    constraints: {
      hasVehicle: boolean | null;
      withKids: boolean | null;
      kidsAge: number | null;
      withElderly: boolean | null;
      maxHours: boolean | null;
      preferHighRating: boolean | null;
    };
  };
  remainingCount: number;
  itineraryUpdated: boolean;
  updatedItinerary?: ItineraryPlaceDetail[];
}

export interface AISuggestedPlace {
  collectionId: CollectionId;
  placeName: string;
  district?: string | null;
  category?: string | null;
  reason: string;
  locationLat?: number | null;
  locationLng?: number | null;
}

/** POST /api/itinerary/:id/ai-add-places - Request */
export interface AIAddPlacesRequest {
  collectionIds: CollectionId[];
}

// ============================================================
// 用戶系統
// ============================================================

/** GET /api/profile - Response */
export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

/** GET /api/user/level - Response */
export interface UserLevelResponse {
  level: {
    currentLevel: number;
    currentExp: number;
    expToNextLevel: number;
    totalExp: number;
    title: string;
  };
  recentExp: {
    amount: number;
    source: string;
    createdAt: string;
  }[];
}

/** GET /api/user/achievements - Response */
export interface AchievementsResponse {
  achievements: {
    id: number;
    code: string;
    nameZh: string;
    nameEn?: string;
    description: string;
    category: string;
    tier: number;
    expReward: number;
    icon?: string;
    isUnlocked: boolean;
    unlockedAt?: string;
    progress?: {
      current: number;
      target: number;
    };
  }[];
  summary: {
    total: number;
    unlocked: number;
    totalExp: number;
  };
}

/** GET /api/user/daily-tasks - Response */
export interface DailyTasksResponse {
  tasks: {
    id: number;
    code: string;
    nameZh: string;
    nameEn?: string;
    description: string;
    icon?: string;
    expReward: number;
    targetCount: number;
    triggerEvent: string;
    progress: {
      currentCount: number;
      isCompleted: boolean;
      rewardClaimed: boolean;
      claimedAt?: string;
    };
  }[];
  summary: {
    totalTasks: number;
    completedTasks: number;
    claimedRewards: number;
    pendingRewards: number;
    totalExpAvailable: number;
  };
}

// ============================================================
// 通知系統
// ============================================================

/** GET /api/notifications - Response */
export interface NotificationsResponse {
  notifications: {
    id: number;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    isRead: boolean;
    createdAt: string;
  }[];
  unreadCount: number;
}
