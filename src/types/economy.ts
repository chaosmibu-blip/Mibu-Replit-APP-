/**
 * @fileoverview 經濟系統型別定義
 *
 * 定義經濟系統相關的資料結構，包含：
 * - 等級系統
 * - 經驗值記錄
 * - 成就系統
 * - 每日任務
 *
 * @module types/economy
 */

// ============ 等級系統 ============

/**
 * 用戶等級資訊
 *
 * 顯示用戶的等級進度和相關數據
 */
export interface LevelInfo {
  level: number;                  // 當前等級
  currentExp: number;             // 當前經驗值
  nextLevelExp: number;           // 升級所需經驗值
  totalExp: number;               // 累計總經驗值
  dailyQuota: number;             // 每日扭蛋配額
  tier?: number;                  // 用戶階段（VIP 等級）
  loginStreak?: number;           // 連續登入天數
  recentExp: ExperienceRecord[];  // 近期經驗值記錄
}

/**
 * 經驗值記錄
 *
 * 單筆經驗值獲得記錄
 */
export interface ExperienceRecord {
  id: string;               // 記錄 ID
  amount: number;           // 經驗值數量
  source: ExperienceSource; // 來源
  description: string;      // 描述
  createdAt: string;        // 獲得時間（ISO 8601）
}

/**
 * 經驗值來源
 */
export type ExperienceSource =
  | 'gacha'           // 扭蛋
  | 'collection'      // 收藏
  | 'referral'        // 推薦
  | 'contribution'    // 貢獻
  | 'crowdfund'       // 募資
  | 'achievement'     // 成就
  | 'daily_login'     // 每日登入
  | 'trip_submit';    // 行程提交

/**
 * 經驗值歷史回應
 * GET /api/economy/exp-history
 */
export interface ExperienceHistoryResponse {
  records: ExperienceRecord[];  // 記錄列表
  pagination: {
    page: number;               // 當前頁碼
    limit: number;              // 每頁數量
    total: number;              // 總數量
    hasMore: boolean;           // 是否有更多
  };
}

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
 */
export interface AchievementReward {
  exp: number;         // 經驗值獎勵
  credits?: number;    // 點數獎勵
  badge?: string;      // 徽章獎勵
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
 * POST /api/economy/achievements/:id/claim
 */
export interface ClaimAchievementResponse {
  success: boolean;            // 是否成功
  message: string;             // 回應訊息
  reward: AchievementReward;   // 獲得的獎勵
  newExp: number;              // 領取後的總經驗值
  newLevel?: number;           // 如果升級，新等級
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
  expReward: number;          // 經驗值獎勵
  targetCount: number;        // 目標次數
  triggerEvent: string;       // 觸發事件
  progress: {                 // 任務進度
    currentCount: number;     // 當前完成次數
    isCompleted: boolean;     // 是否已完成
    rewardClaimed: boolean;   // 是否已領取獎勵
    claimedAt?: string;       // 領取時間（ISO 8601）
  };
  // 向後相容欄位
  name?: string;              // 名稱（舊欄位）
  xpReward?: number;          // 經驗值（舊欄位）
  isCompleted?: boolean;      // 是否完成（舊欄位）
  completedAt?: string;       // 完成時間（舊欄位）
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
    totalExpAvailable: number; // 可獲得的總經驗值
  };
  // 向後相容欄位
  success?: boolean;          // 是否成功（舊欄位）
  completedCount?: number;    // 完成數（舊欄位）
  totalCount?: number;        // 總數（舊欄位）
}

/**
 * 完成每日任務回應
 * POST /api/economy/daily-tasks/:id/claim
 */
export interface CompleteDailyTaskResponse {
  success: boolean;           // 是否成功
  message: string;            // 回應訊息
  rewards: {
    exp: number;              // 獲得的經驗值
  };
  newLevel?: UserLevel;       // 如果升級，新等級資訊
  // 向後相容欄位
  xpGained?: number;          // 獲得經驗值（舊欄位）
}

/**
 * 用戶等級資訊
 *
 * 用於升級通知時顯示
 */
export interface UserLevel {
  level: number;        // 等級
  currentExp: number;   // 當前經驗值
  nextLevelExp: number; // 下一級所需經驗值
}
