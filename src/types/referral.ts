/**
 * 推薦系統類型
 */

// ========== 推薦碼 ==========

export interface ReferralCode {
  code: string;
  createdAt: string;
  usageCount: number;
  maxUsage: number | null; // null = 無限
  isActive: boolean;
}

export interface GenerateCodeResponse {
  success: boolean;
  code: string;
  message: string;
}

export interface ValidateCodeResponse {
  valid: boolean;
  referrerName?: string;
  bonus?: number;
  message?: string;
}

export interface ApplyCodeParams {
  code: string;
}

export interface ApplyCodeResponse {
  success: boolean;
  message: string;
  expEarned: number;
  bonus?: number;
}

// ========== 推薦列表 ==========

export interface Referral {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  level: number;
  joinedAt: string;    // ISO 8601
  isActive: boolean;
  rewardEarned: number;
}

export interface MyReferralsResponse {
  referrals: Referral[];
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    totalRewardEarned: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ========== 商家推薦 ==========

export interface MerchantRecommendParams {
  businessName: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  address: string;
  category: string;
  notes?: string;
}

export interface MerchantRecommendResponse {
  success: boolean;
  message: string;
  recommendationId: string;
  pendingReward: number; // 待商家註冊後可獲得的獎勵
}

// ========== 餘額與提現 ==========

export interface ReferralBalance {
  available: number;     // 可提現金額
  pending: number;       // 待確認金額
  totalEarned: number;   // 累計收入
  totalWithdrawn: number;
}

export type TransactionType = 'referral_bonus' | 'merchant_bonus' | 'withdrawal' | 'adjustment';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';

export interface ReferralTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  completedAt: string | null;
}

export interface TransactionsResponse {
  transactions: ReferralTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface WithdrawParams {
  amount: number;
  method: 'bank_transfer' | 'paypal';
  accountInfo: {
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
    paypalEmail?: string;
  };
}

export interface WithdrawResponse {
  success: boolean;
  message: string;
  transactionId: string;
  estimatedArrival: string; // ISO 8601
}
