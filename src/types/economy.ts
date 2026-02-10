/**
 * @fileoverview 經濟系統型別定義
 *
 * 定義經濟系統相關的資料結構，包含：
 * - 金幣系統（#039 重構：等級制 → 金幣制）
 * - 權益系統
 * - 成就系統
 * - 每日任務
 *
 * @module types/economy
 * @updated 2026-02-05 #039 經濟系統重構
 */

// ============ 金幣系統（#039 新增） ============

/**
 * 用戶金幣資訊
 * GET /api/user/coins
 */
export interface UserCoinsResponse {
  balance: number;       // 當前金幣餘額
  totalEarned: number;   // 累計獲得金幣
  totalSpent: number;    // 累計消費金幣
  loginStreak?: number;  // 連續登入天數（後端可能回傳）
}

/**
 * 用戶權益資訊
 * GET /api/user/perks
 */
export interface UserPerksResponse {
  dailyPullLimit: number;       // 每日扭蛋上限
  inventorySlots: number;       // 背包格數
  dailyPullBonus: number;       // 每日扭蛋加成
  inventoryBonus: number;       // 背包加成格數
  canApplySpecialist: boolean;  // 是否可申請策劃師
  specialistInvitedAt: string | null;  // 受邀成為策劃師時間
  loginStreak?: number;                // 連續登入天數（後端可能回傳）
}

/**
 * 金幣交易記錄
 */
export interface CoinTransaction {
  id: number;                          // 交易 ID
  amount: number;                      // 金額（正數=獲得，負數=消費）
  balanceAfter: number;                // 交易後餘額
  transactionType: 'earn' | 'spend';   // 交易類型
  eventType: string;                   // 事件類型（gacha, achievement, daily_task 等）
  description: string;                 // 描述
  createdAt: string;                   // 交易時間（ISO 8601）
}

/**
 * 金幣歷史回應
 * GET /api/user/coins/history
 */
export interface CoinHistoryResponse {
  transactions: CoinTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * 策劃師申請資格
 * GET /api/user/specialist/eligibility
 * #039: 改用 hasInvitation 取代 currentLevel/requiredLevel
 */
export interface SpecialistEligibilityResponse {
  hasInvitation: boolean;              // 是否有邀請資格
  canApply: boolean;                   // 是否可申請
  reason?: string;                     // 不可申請原因
  invitedAt?: string;                  // 邀請時間
}

// ============ 等級系統已廢除，改用金幣系統 ============
// ============ 成就系統已遷移至 rules.ts（#043 規則引擎） ============

// ============ 每日任務系統 ============

/**
 * 每日任務
 *
 * 符合後端 #009 規格的每日任務資料結構
 */
export interface DailyTask {
  id: number;                 // 任務 ID
  code: string;               // 任務代碼
  nameZh: string;             // 任務名稱（中文）
  nameEn?: string;            // 任務名稱（英文）
  description: string;        // 任務描述
  icon?: string;              // 圖示
  coinReward: number;         // 金幣獎勵
  targetCount: number;        // 目標次數
  triggerEvent: string;       // 觸發事件
  progress: {                 // 任務進度
    currentCount: number;     // 當前完成次數
    isCompleted: boolean;     // 是否已完成
    rewardClaimed: boolean;   // 是否已領取獎勵
    claimedAt?: string;       // 領取時間（ISO 8601）
  };
}

/**
 * 每日任務列表回應
 * GET /api/economy/daily-tasks
 */
export interface DailyTasksResponse {
  tasks: DailyTask[];         // 任務列表
  summary: {
    totalTasks: number;       // 總任務數
    completedTasks: number;   // 已完成任務數
    claimedRewards: number;   // 已領取獎勵數
    pendingRewards: number;   // 待領取獎勵數
    totalCoinsAvailable: number; // 可獲得的總金幣
  };
}

// CompleteDailyTaskResponse 已遷移至 rules.ts（#043 規則引擎 claimReward）
