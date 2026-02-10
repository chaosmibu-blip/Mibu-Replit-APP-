/**
 * @fileoverview 信箱系統型別定義（#045 統一收件箱）
 *
 * 所有獎勵（優惠碼、管理員禮物、系統獎勵、活動獎勵）
 * 統一進入信箱，用戶手動領取後生效。
 *
 * @module types/mailbox
 * @see 後端契約: contracts/APP.md #045
 * @created 2026-02-10
 */

import { RewardPayload } from './rules';

// ============ 列舉型別 ============

/** 信箱項目狀態 */
export type MailboxStatus = 'unclaimed' | 'claimed' | 'expired';

/** 信箱項目來源類型 */
export type MailboxSourceType = 'promo_code' | 'admin' | 'system' | 'event';

// ============ 信箱列表項目 ============

/**
 * 信箱列表項目（輕量版）
 *
 * GET /api/mailbox 回傳的每一筆項目
 * rewardSummary 只有類型名稱，不含金額細節
 */
export interface MailboxListItem {
  id: number;
  title: string;
  body: string | null;
  icon: string | null;
  sourceType: MailboxSourceType;
  sourceLabel: string | null;
  status: MailboxStatus;
  isRead: boolean;
  /** 獎勵類型摘要（如 ['coins', 'shop_item']） */
  rewardSummary: string[];
  expiresAt: string | null;
  createdAt: string;
}

// ============ 信箱詳情項目 ============

/**
 * 信箱詳情項目（完整版）
 *
 * GET /api/mailbox/:id 回傳
 * rewards 有完整的金額、物品細節
 */
export interface MailboxDetailItem {
  id: number;
  title: string;
  body: string | null;
  icon: string | null;
  sourceType: MailboxSourceType;
  sourceLabel: string | null;
  status: MailboxStatus;
  isRead: boolean;
  /** 完整獎勵載荷 */
  rewards: RewardPayload[];
  expiresAt: string | null;
  claimedAt: string | null;
  createdAt: string;
}

// ============ API 回應型別 ============

/** 信箱列表回應（分頁） */
export interface MailboxListResponse {
  items: MailboxListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** 未讀數量回應 */
export interface MailboxUnreadResponse {
  unreadCount: number;
}

/** 信箱詳情回應 */
export interface MailboxDetailResponse {
  item: MailboxDetailItem;
}

/** 單一領取結果 */
export interface MailboxClaimResult {
  rewardType: string;
  success: boolean;
  error?: string;
  detail?: Record<string, unknown>;
}

/** 領取單一信箱項目回應 */
export interface MailboxClaimResponse {
  success: true;
  /** 部分成功（部分獎勵套用失敗） */
  partial?: boolean;
  warning?: string;
  results: MailboxClaimResult[];
}

/** 一鍵全部領取回應 */
export interface MailboxClaimAllResponse {
  success: true;
  claimed: number;
  failed: number;
  results: {
    mailboxItemId: number;
    success: boolean;
    results: unknown[];
    error?: string;
  }[];
}

// ============ 優惠碼相關 ============

/** 兌換優惠碼回應 */
export interface PromoCodeRedeemResponse {
  success: true;
  /** 信箱項目 ID（可立即領取） */
  mailboxItemId: number;
  /** 獎勵內容摘要 */
  rewards: RewardPayload[];
  /** 優惠碼顯示名稱 */
  promoName: string;
}

/** 驗證優惠碼回應 */
export interface PromoCodeValidateResponse {
  valid: boolean;
  rewards?: RewardPayload[];
  name?: string;
  error?: string;
}
