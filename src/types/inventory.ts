/**
 * 物品箱/庫存相關類型
 */
import { CouponTier } from './common';

export type InventoryItemType = 'coupon' | 'ticket' | 'gift';
export type InventoryItemStatus = 'active' | 'expired' | 'redeemed' | 'deleted';

export interface InventoryItem {
  id: number;
  type: 'coupon' | 'item';
  name: string;
  description: string | null;
  rarity: CouponTier;
  isRead: boolean;
  isRedeemed: boolean;
  expiresAt: string | null;
  obtainedAt: string;
  couponData?: {
    code: string;
    merchantName: string;
    terms: string;
  };
}

export interface InventoryResponse {
  items: InventoryItem[];
  slotCount: number;
  maxSlots: number;
  isFull: boolean;
}

export interface InventoryConfig {
  maxSlots: number;
}

export interface RarityConfig {
  spRate: number;
  ssrRate: number;
  srRate: number;
  sRate: number;
  rRate: number;
}

export interface RedeemResponse {
  success: boolean;
  redemptionCode: string;
  expiresAt: string;
}
