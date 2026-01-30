/**
 * @fileoverview 推薦系統型別定義
 *
 * 定義推薦系統相關的資料結構，包含：
 * - 推薦碼管理
 * - 推薦列表
 * - 商家推薦
 * - 餘額與提現
 * - 排行榜
 *
 * @module types/referral
 */

// ============ 推薦碼 ============

/**
 * 推薦碼
 *
 * 用戶的專屬推薦碼資訊
 */
export interface ReferralCode {
  code: string;            // 推薦碼
  createdAt: string;       // 建立時間（ISO 8601）
  usageCount: number;      // 已使用次數
  maxUsage: number | null; // 最大使用次數（null 表示無限）
  isActive: boolean;       // 是否啟用
}

/**
 * 生成推薦碼回應
 * POST /api/referral/generate
 */
export interface GenerateCodeResponse {
  success: boolean;  // 是否成功
  code: string;      // 新推薦碼
  message: string;   // 回應訊息
}

/**
 * 驗證推薦碼回應
 * GET /api/referral/validate/:code
 */
export interface ValidateCodeResponse {
  valid: boolean;        // 是否有效
  referrerName?: string; // 推薦人名稱
  bonus?: number;        // 可獲得的獎勵
  message?: string;      // 訊息
}

/**
 * 套用推薦碼參數
 * POST /api/referral/apply
 */
export interface ApplyCodeParams {
  code: string;  // 推薦碼
}

/**
 * 套用推薦碼回應
 * POST /api/referral/apply
 */
export interface ApplyCodeResponse {
  success: boolean;   // 是否成功
  message: string;    // 回應訊息
  expEarned: number;  // 獲得的經驗值
  bonus?: number;     // 額外獎勵
}

// ============ 推薦列表 ============

/**
 * 推薦記錄
 *
 * 單一被推薦用戶的資訊
 */
export interface Referral {
  id: string;             // 推薦記錄 ID
  userId: string;         // 被推薦用戶 ID
  userName: string;       // 被推薦用戶名稱
  userAvatar: string | null; // 被推薦用戶頭像
  level: number;          // 被推薦用戶等級
  joinedAt: string;       // 加入時間（ISO 8601）
  isActive: boolean;      // 是否活躍
  rewardEarned: number;   // 從此推薦獲得的獎勵
}

/**
 * 我的推薦列表回應
 * GET /api/referral/my-referrals
 */
export interface MyReferralsResponse {
  referrals: Referral[];   // 推薦列表
  stats: {
    totalReferrals: number;    // 總推薦人數
    activeReferrals: number;   // 活躍推薦人數
    totalRewardEarned: number; // 累計獲得獎勵
  };
  pagination: {
    page: number;     // 當前頁碼
    limit: number;    // 每頁數量
    total: number;    // 總數量
    hasMore: boolean; // 是否有更多
  };
}

// ============ 商家推薦 ============

/**
 * 商家推薦參數
 * POST /api/referral/recommend-merchant
 */
export interface MerchantRecommendParams {
  businessName: string;   // 商家名稱
  contactName: string;    // 聯絡人姓名
  contactPhone: string;   // 聯絡電話
  contactEmail?: string;  // 聯絡信箱
  address: string;        // 地址
  category: string;       // 商業類別
  notes?: string;         // 備註
}

/**
 * 商家推薦回應
 * POST /api/referral/recommend-merchant
 */
export interface MerchantRecommendResponse {
  success: boolean;          // 是否成功
  message: string;           // 回應訊息
  recommendationId: string;  // 推薦記錄 ID
  pendingReward: number;     // 待商家註冊後可獲得的獎勵
}

// ============ 餘額與提現 ============

/**
 * 推薦餘額
 *
 * 用戶的推薦獎勵餘額資訊
 */
export interface ReferralBalance {
  available: number;      // 可提現金額
  pending: number;        // 待確認金額
  totalEarned: number;    // 累計收入
  totalWithdrawn: number; // 累計提現
}

/**
 * 交易類型
 */
export type TransactionType = 'referral_bonus' | 'merchant_bonus' | 'withdrawal' | 'adjustment';

/**
 * 交易狀態
 */
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';

/**
 * 推薦交易記錄
 */
export interface ReferralTransaction {
  id: string;                   // 交易 ID
  type: TransactionType;        // 交易類型
  amount: number;               // 金額
  status: TransactionStatus;    // 交易狀態
  description: string;          // 描述
  createdAt: string;            // 建立時間（ISO 8601）
  completedAt: string | null;   // 完成時間（ISO 8601）
}

/**
 * 交易記錄列表回應
 * GET /api/referral/transactions
 */
export interface TransactionsResponse {
  transactions: ReferralTransaction[];  // 交易列表
  pagination: {
    page: number;     // 當前頁碼
    limit: number;    // 每頁數量
    total: number;    // 總數量
    hasMore: boolean; // 是否有更多
  };
}

/**
 * 提現參數
 * POST /api/referral/withdraw
 */
export interface WithdrawParams {
  amount: number;                      // 提現金額
  method: 'bank_transfer' | 'paypal';  // 提現方式
  accountInfo: {                       // 帳戶資訊
    bankCode?: string;                 // 銀行代碼
    accountNumber?: string;            // 帳戶號碼
    accountName?: string;              // 戶名
    paypalEmail?: string;              // PayPal 電子郵件
  };
}

/**
 * 提現回應
 * POST /api/referral/withdraw
 */
export interface WithdrawResponse {
  success: boolean;         // 是否成功
  message: string;          // 回應訊息
  transactionId: string;    // 交易 ID
  estimatedArrival: string; // 預估到帳時間（ISO 8601）
}

// ============ 排行榜系統 ============

/**
 * 排行榜時間範圍
 */
export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all';

/**
 * 排行榜項目
 */
export interface LeaderboardEntry {
  rank: number;          // 排名
  userId: number;        // 用戶 ID
  nickname: string;      // 暱稱
  avatarUrl?: string;    // 頭像 URL
  referralCount: number; // 推薦人數
}

/**
 * 排行榜回應
 * GET /api/referral/leaderboard
 */
export interface LeaderboardResponse {
  success: boolean;                  // 是否成功
  leaderboard: LeaderboardEntry[];   // 排行榜列表
  period: LeaderboardPeriod;         // 時間範圍
}

/**
 * 我的排名回應
 * GET /api/referral/my-rank
 */
export interface MyRankResponse {
  success: boolean;       // 是否成功
  rank: number;           // 排名
  referralCount: number;  // 推薦人數
  isOnLeaderboard: boolean; // 是否在排行榜上
}
