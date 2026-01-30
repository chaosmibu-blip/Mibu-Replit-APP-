/**
 * @fileoverview 募資系統型別定義
 *
 * 定義募資系統相關的資料結構，包含：
 * - 募資活動
 * - 活動獎勵
 * - 贊助/貢獻
 *
 * @module types/crowdfunding
 */

// ============ 活動狀態 ============

/**
 * 募資活動狀態
 * - upcoming: 即將開始
 * - active: 進行中
 * - completed: 已完成
 * - cancelled: 已取消
 */
export type CampaignStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

// ============ 募資活動 ============

/**
 * 募資活動
 *
 * 基本的募資活動資訊
 */
export interface Campaign {
  id: string;                  // 活動 ID
  title: string;               // 活動標題
  description: string;         // 活動描述
  imageUrl: string | null;     // 活動圖片
  targetAmount: number;        // 目標金額
  currentAmount: number;       // 當前金額
  contributorCount: number;    // 贊助人數
  status: CampaignStatus;      // 活動狀態
  startDate: string;           // 開始日期（ISO 8601）
  endDate: string;             // 結束日期（ISO 8601）
  rewards: CampaignReward[];   // 獎勵列表
  createdAt: string;           // 建立時間（ISO 8601）
}

/**
 * 募資活動獎勵
 *
 * 不同贊助金額對應的獎勵
 */
export interface CampaignReward {
  tier: string;               // 獎勵等級名稱
  minAmount: number;          // 最低贊助金額
  description: string;        // 獎勵描述
  remaining: number | null;   // 剩餘數量（null 表示無限）
}

/**
 * 募資活動詳情
 *
 * 包含更新記錄和用戶貢獻資訊
 */
export interface CampaignDetail extends Campaign {
  updates: CampaignUpdate[];       // 活動更新記錄
  myContribution: number | null;   // 用戶已贊助金額（未贊助為 null）
}

/**
 * 募資活動更新
 */
export interface CampaignUpdate {
  id: string;         // 更新 ID
  title: string;      // 更新標題
  content: string;    // 更新內容
  createdAt: string;  // 發布時間（ISO 8601）
}

/**
 * 募資活動列表回應
 * GET /api/crowdfunding/campaigns
 */
export interface CampaignsResponse {
  campaigns: Campaign[];  // 活動列表
  pagination: {
    page: number;         // 當前頁碼
    limit: number;        // 每頁數量
    total: number;        // 總數量
    hasMore: boolean;     // 是否有更多
  };
}

// ============ 贊助/貢獻 ============

/**
 * 贊助參數
 * POST /api/crowdfunding/contribute
 */
export interface ContributeParams {
  campaignId: string;             // 活動 ID
  amount: number;                 // 贊助金額
  receiptData: string;            // IAP 收據資料
  platform: 'ios' | 'android';    // 平台
}

/**
 * 贊助回應
 * POST /api/crowdfunding/contribute
 */
export interface ContributeResponse {
  success: boolean;     // 是否成功
  message: string;      // 回應訊息
  contribution: {
    id: string;             // 贊助記錄 ID
    amount: number;         // 贊助金額
    campaignId: string;     // 活動 ID
    rewardTier: string | null; // 獲得的獎勵等級
    createdAt: string;      // 贊助時間（ISO 8601）
  };
  expEarned: number;    // 獲得的經驗值
}

/**
 * 我的贊助記錄
 */
export interface MyContribution {
  id: string;                                    // 贊助記錄 ID
  campaignId: string;                            // 活動 ID
  campaignTitle: string;                         // 活動標題
  amount: number;                                // 贊助金額
  rewardTier: string | null;                     // 獲得的獎勵等級
  status: 'pending' | 'verified' | 'failed';     // 驗證狀態
  createdAt: string;                             // 贊助時間（ISO 8601）
}

/**
 * 我的贊助列表回應
 * GET /api/crowdfunding/my-contributions
 */
export interface MyContributionsResponse {
  contributions: MyContribution[];  // 贊助記錄列表
  totalAmount: number;              // 累計贊助總額
  pagination: {
    page: number;     // 當前頁碼
    limit: number;    // 每頁數量
    total: number;    // 總數量
    hasMore: boolean; // 是否有更多
  };
}
