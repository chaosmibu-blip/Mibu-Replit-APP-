/**
 * 募資系統類型
 */

export type CampaignStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  targetAmount: number;
  currentAmount: number;
  contributorCount: number;
  status: CampaignStatus;
  startDate: string;  // ISO 8601
  endDate: string;    // ISO 8601
  rewards: CampaignReward[];
  createdAt: string;
}

export interface CampaignReward {
  tier: string;
  minAmount: number;
  description: string;
  remaining: number | null; // null = 無限
}

export interface CampaignDetail extends Campaign {
  updates: CampaignUpdate[];
  myContribution: number | null; // 用戶已貢獻金額
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ========== 贊助/貢獻 ==========

export interface ContributeParams {
  campaignId: string;
  amount: number;
  receiptData: string; // IAP 收據
  platform: 'ios' | 'android';
}

export interface ContributeResponse {
  success: boolean;
  message: string;
  contribution: {
    id: string;
    amount: number;
    campaignId: string;
    rewardTier: string | null;
    createdAt: string;
  };
  expEarned: number;
}

export interface MyContribution {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  rewardTier: string | null;
  status: 'pending' | 'verified' | 'failed';
  createdAt: string;
}

export interface MyContributionsResponse {
  contributions: MyContribution[];
  totalAmount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
