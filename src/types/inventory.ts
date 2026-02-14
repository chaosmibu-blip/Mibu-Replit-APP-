/**
 * @fileoverview 物品箱/庫存型別定義
 *
 * 定義背包系統相關的資料結構，包含：
 * - 背包項目（優惠券、票券、禮物）
 * - 項目狀態管理
 * - 核銷功能
 *
 * 依據後端合約 APP.md 定義
 *
 * @module types/inventory
 */

import { CouponTier, Pagination } from './common';

// ============ 項目型別 ============

/**
 * 背包項目類型
 * - coupon: 優惠券
 * - ticket: 票券
 * - gift: 禮物
 * - place_pack: 景點包（開啟後獲得多個景點收藏）
 */
export type InventoryItemType = 'coupon' | 'ticket' | 'gift' | 'place_pack';

/**
 * 背包項目狀態
 * - active: 可使用
 * - expired: 已過期
 * - redeemed: 已核銷
 * - deleted: 已刪除
 */
export type InventoryItemStatus = 'active' | 'expired' | 'redeemed' | 'deleted' | 'used' | 'opened';

// ============ 優惠券資料 ============

/**
 * 背包優惠券資料
 *
 * 優惠券項目的詳細資訊
 */
export interface InventoryCouponData {
  code: string;                   // 優惠券代碼
  merchantId: number;             // 商家 ID
  merchantName: string;           // 商家名稱
  terms: string;                  // 使用條款
  inventoryImageUrl?: string;     // 背包顯示用圖片
  backgroundImageUrl?: string;    // 卡片背景圖片
}

// ============ 背包項目 ============

/**
 * 背包項目
 *
 * 用戶背包中的單一項目
 */
export interface InventoryItem {
  id: number;                          // 項目 ID
  userId: string;                      // 用戶 ID
  itemType: InventoryItemType;         // 項目類型（後端 camelCase 欄位）
  type: InventoryItemType;             // 項目類型（前端別名，由 normalizeItem 映射）
  name: string;                        // 項目名稱
  description: string | null;          // 項目描述
  rarity: CouponTier;                  // 稀有度
  isRead: boolean;                     // 是否已讀
  isRedeemed: boolean;                 // 是否已核銷
  status: InventoryItemStatus;         // 項目狀態
  expiresAt: string | null;            // 過期時間（ISO 8601）
  obtainedAt: string;                  // 獲得時間（ISO 8601）
  redeemedAt: string | null;           // 核銷時間（ISO 8601）
  couponData?: InventoryCouponData;    // 優惠券詳細資料
  placeName?: string;                  // 關聯的地點名稱
  city?: string;                       // 關聯的城市

  // ============ place_pack 專用欄位 ============
  /** 景點包代碼 */
  packCode?: string;
  /** 景點包內的景點數量 */
  placeCount?: number;

  // ============ 擴充欄位（UI 使用） ============
  /** 稀有度別名（與 rarity 相同，向後兼容） */
  tier?: CouponTier;
  /** 優惠券標題（與 name 相同，向後兼容） */
  title?: string;
  /** 商家名稱（從 couponData 提取） */
  merchantName?: string;
  /** 是否已過期（計算欄位） */
  isExpired?: boolean;
  /** 是否已刪除（計算欄位，等同 status === 'deleted'） */
  isDeleted?: boolean;
  /** 背包格位索引（後端可能返回） */
  slotIndex?: number;
}

// ============ API 回應 ============

/**
 * 背包列表回應
 * GET /api/inventory
 */
export interface InventoryResponse {
  success: boolean;              // 是否成功
  items: InventoryItem[];        // 項目列表
  slotCount: number;             // 當前已使用格數
  maxSlots: number;              // 最大格數上限
  isFull: boolean;               // 背包是否已滿
  pagination?: Pagination;       // 分頁資訊
}

/**
 * 核銷成功回應
 * POST /api/inventory/:id/redeem
 */
export interface RedeemResponse {
  success: boolean;        // 是否成功
  message: string;         // 回應訊息
  redemptionCode: string;  // 核銷確認碼
  expiresAt: string;       // 確認碼過期時間（ISO 8601）
  redeemedAt: string;      // 核銷時間（ISO 8601）
}

// ============ 景點包 ============

/**
 * 景點包開啟選項
 * GET /api/inventory/:id/open-options
 */
export interface PlacePackOptionsResponse {
  packId: number;
  packName: string;
  placeCount: number;
  restricted: boolean;
  restrictedCity?: string | null;
  availableCities?: string[];
  description: string | null;
}

/**
 * 景點包開啟結果
 * POST /api/inventory/:id/open
 */
export interface OpenPlacePackResponse {
  success: boolean;
  packName?: string;
  city?: string;
  requestedCount?: number;
  addedCount: number;
  skippedCount: number;
  addedPlaceIds?: number[];
  addedPlaces?: Array<{
    collectionId: number;
    placeName: string;
    address?: string;
  }>;
  skippedPlaces?: Array<{
    reason: 'already_owned' | 'invalid';
    placeName: string;
  }>;
  summary?: {
    totalPlaces: number;
    addedCount: number;
    skippedCount: number;
  };
}

/**
 * 核銷錯誤回應
 */
export interface RedeemErrorResponse {
  success: false;          // 固定為 false
  error: string;           // 錯誤訊息
  code: 'INVALID_REDEMPTION_CODE' | 'REDEMPTION_CODE_EXPIRED' | 'COUPON_EXPIRED' | 'ALREADY_REDEEMED'; // 錯誤碼
}
