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

// ============ 成就系統 ============

/**
 * 成就分類
 * - collector: 收藏家（收集景點相關）
 * - sponsor: 贊助者（募資相關，#029 統一用詞）
 * - promoter: 推廣者（推薦相關）
 * - business: 商業（消費相關）
 * - specialist: 策劃師（行程相關）
 */
export type AchievementCategory =
  | 'collector'
  | 'sponsor'
  | 'promoter'
  | 'business'
  | 'specialist';

/**
 * 成就等級
 */
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * 成就
 *
 * 單一成就的完整資訊
 */
export interface Achievement {
  id: string;                     // 成就 ID
  code: string;                   // 成就代碼
  category: AchievementCategory;  // 成就分類
  tier: AchievementTier;          // 成就等級
  title: string;                  // 成就標題
  description: string;            // 成就描述
  iconUrl: string | null;         // 圖示 URL
  requirement: number;            // 達成條件數量
  progress: number;               // 當前進度
  isUnlocked: boolean;            // 是否已解鎖
  isClaimed: boolean;             // 是否已領取獎勵
  reward: AchievementReward;      // 獎勵內容
  unlockedAt: string | null;      // 解鎖時間（ISO 8601）
  claimedAt: string | null;       // 領取時間（ISO 8601）
}

/**
 * 成就獎勵
 * #039: expReward → coinReward，新增 perksReward
 */
export interface AchievementReward {
  coinReward: number;              // 金幣獎勵（#039 新增）
  perksReward?: PerksReward;       // 權益獎勵（#039 新增）
  badge?: string;                  // 徽章獎勵
}

/**
 * 權益獎勵內容
 * #039 新增
 */
export interface PerksReward {
  dailyPullBonus?: number;         // 每日扭蛋加成
  inventoryBonus?: number;         // 背包格數加成
  specialistInvitation?: boolean;  // 策劃師邀請資格
}

/**
 * 成就列表回應
 * GET /api/economy/achievements
 */
export interface AchievementsResponse {
  achievements: Achievement[];  // 成就列表
  stats: {
    total: number;              // 總成就數
    unlocked: number;           // 已解鎖數
    claimed: number;            // 已領取數
    byCategory: Record<AchievementCategory, { total: number; unlocked: number }>; // 按分類統計
  };
}

/**
 * 領取成就獎勵回應
 * POST /api/user/achievements/:id/claim
 * #039: 移除 newExp/newLevel，改為 coins/perks
 */
export interface ClaimAchievementResponse {
  success: boolean;            // 是否成功
  message: string;             // 回應訊息
  reward: AchievementReward;   // 獲得的獎勵
  coins: UserCoinsResponse;    // 領取後的金幣狀態（#039 新增）
  perks: UserPerksResponse;    // 領取後的權益狀態（#039 新增）
}

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

/**
 * 完成每日任務回應
 * POST /api/economy/daily-tasks/:id/claim
 */
export interface CompleteDailyTaskResponse {
  success: boolean;           // 是否成功
  message: string;            // 回應訊息
  rewards: {
    coins: number;            // 獲得的金幣
  };
}
