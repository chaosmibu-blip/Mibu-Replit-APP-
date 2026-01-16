/**
 * 物品箱/庫存相關類型
 * 依據後端合約 APP.md 定義
 */
import { CouponTier, Pagination } from './common';

export type InventoryItemType = 'coupon' | 'ticket' | 'gift';
export type InventoryItemStatus = 'active' | 'expired' | 'redeemed' | 'deleted';

export interface InventoryCouponData {
  code: string;
  merchantId: number;
  merchantName: string;
  terms: string;
  /** 背包顯示用圖片 */
  inventoryImageUrl?: string;
  /** 卡片背景圖片 */
  backgroundImageUrl?: string;
}

export interface InventoryItem {
  id: number;
  userId: string;
  type: InventoryItemType;
  name: string;
  description: string | null;
  rarity: CouponTier;
  isRead: boolean;
  isRedeemed: boolean;
  status: InventoryItemStatus;
  expiresAt: string | null;
  obtainedAt: string;
  redeemedAt: string | null;
  couponData?: InventoryCouponData;
  /** 關聯的地點名稱 */
  placeName?: string;
  /** 關聯的城市 */
  city?: string;
}

export interface InventoryResponse {
  success: boolean;
  items: InventoryItem[];
  slotCount: number;
  maxSlots: number;
  isFull: boolean;
  pagination?: Pagination;
}

export interface RedeemResponse {
  success: boolean;
  message: string;
  /** 核銷確認碼 */
  redemptionCode: string;
  /** 確認碼過期時間 */
  expiresAt: string;
  /** 核銷時間 */
  redeemedAt: string;
}

export interface RedeemErrorResponse {
  success: false;
  error: string;
  code: 'INVALID_REDEMPTION_CODE' | 'REDEMPTION_CODE_EXPIRED' | 'COUPON_EXPIRED' | 'ALREADY_REDEEMED';
}
