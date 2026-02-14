/**
 * 信箱系統 API 服務（#045 統一收件箱 + 優惠碼）
 *
 * 所有獎勵統一進入信箱，用戶手動領取後生效
 * 包含優惠碼兌換/驗證功能
 *
 * @module services/mailboxApi
 * @see 後端契約: contracts/APP.md #045
 * @created 2026-02-10
 *
 * ============ 串接端點 ============
 * 信箱:
 * - GET  /api/mailbox               - 信箱列表（分頁 + 狀態篩選）
 * - GET  /api/mailbox/unread-count  - 未讀數量（紅點提示）
 * - GET  /api/mailbox/:id           - 信箱項目詳情（自動標記已讀）
 * - POST /api/mailbox/:id/claim     - 領取單一項目
 * - POST /api/mailbox/claim-all     - 一鍵全部領取
 *
 * 優惠碼:
 * - POST /api/promo-code/redeem     - 兌換優惠碼（獎勵進信箱）
 * - GET  /api/promo-code/validate   - 預覽優惠碼（唯讀）
 */
import { ApiBase } from './base';
import {
  MailboxListResponse,
  MailboxUnreadResponse,
  MailboxDetailResponse,
  MailboxClaimResponse,
  MailboxClaimAllResponse,
  MailboxStatus,
  PromoCodeRedeemResponse,
  PromoCodeValidateResponse,
} from '../types/mailbox';

// ============ API 服務類別 ============

/**
 * 信箱系統 API 服務類別
 *
 * 提供信箱列表、詳情、領取、優惠碼兌換等功能
 */
class MailboxApiService extends ApiBase {

  // ============ 信箱 ============

  /**
   * 取得信箱列表（分頁）
   *
   * @param token - JWT Token
   * @param params - 分頁和篩選參數
   * @param params.page - 頁碼（預設 1）
   * @param params.limit - 每頁數量（預設 20，最大 50）
   * @param params.status - 狀態篩選：unclaimed / claimed / expired
   * @returns 信箱項目列表和分頁資訊
   */
  async getList(
    token: string,
    params?: { page?: number; limit?: number; status?: MailboxStatus }
  ): Promise<MailboxListResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const queryString = query.toString();
    const endpoint = `/api/mailbox${queryString ? `?${queryString}` : ''}`;

    return this.request<MailboxListResponse>(endpoint, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得未讀數量
   *
   * 用於顯示紅點 badge
   * 計算未讀且未領取的項目數量
   *
   * @param token - JWT Token
   * @returns 未讀數量
   */
  async getUnreadCount(token: string): Promise<MailboxUnreadResponse> {
    return this.request<MailboxUnreadResponse>('/api/mailbox/unread-count', {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 取得信箱項目詳情
   *
   * 副作用：自動標記為已讀（isRead = true）
   * 包含完整的 rewards 載荷（金額、物品細節）
   *
   * @param token - JWT Token
   * @param itemId - 信箱項目 ID
   * @returns 信箱項目完整資訊
   */
  async getDetail(token: string, itemId: number): Promise<MailboxDetailResponse> {
    return this.request<MailboxDetailResponse>(`/api/mailbox/${itemId}`, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * 領取單一信箱項目
   *
   * 注意：可能部分成功（partial = true），部分獎勵套用失敗
   *
   * @param token - JWT Token
   * @param itemId - 信箱項目 ID
   * @returns 領取結果（含每個獎勵的成功/失敗狀態）
   */
  async claimItem(token: string, itemId: number): Promise<MailboxClaimResponse> {
    return this.request<MailboxClaimResponse>(`/api/mailbox/${itemId}/claim`, {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  /**
   * 一鍵全部領取
   *
   * 領取所有未領取的信箱項目
   *
   * @param token - JWT Token
   * @returns 領取摘要（成功/失敗數量）
   */
  async claimAll(token: string): Promise<MailboxClaimAllResponse> {
    return this.request<MailboxClaimAllResponse>('/api/mailbox/claim-all', {
      method: 'POST',
      headers: this.authHeaders(token),
    });
  }

  // ============ 優惠碼 ============

  /**
   * 兌換優惠碼
   *
   * 獎勵進入信箱，需再手動領取
   *
   * @param token - JWT Token
   * @param code - 優惠碼
   * @returns 兌換結果（含信箱項目 ID 和獎勵摘要）
   */
  async redeemPromoCode(token: string, code: string): Promise<PromoCodeRedeemResponse> {
    return this.request<PromoCodeRedeemResponse>('/api/promo-code/redeem', {
      method: 'POST',
      headers: this.authHeaders(token),
      body: JSON.stringify({ code }),
    });
  }

  /**
   * 預覽/驗證優惠碼
   *
   * 唯讀操作，不消耗兌換額度
   *
   * @param token - JWT Token
   * @param code - 優惠碼
   * @returns 驗證結果（valid + 獎勵預覽 或 error）
   */
  async validatePromoCode(token: string, code: string): Promise<PromoCodeValidateResponse> {
    const encoded = encodeURIComponent(code);
    return this.request<PromoCodeValidateResponse>(`/api/promo-code/validate?code=${encoded}`, {
      headers: this.authHeaders(token),
    });
  }
}

// ============ 匯出 ============

/** 信箱系統 API 服務實例 */
export const mailboxApi = new MailboxApiService();
