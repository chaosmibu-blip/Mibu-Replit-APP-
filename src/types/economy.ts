/**
 * 經濟系統類型 - 等級、經驗、成就
 */

// ========== 等級系統 ==========

export interface LevelInfo {
  level: number;
  currentExp: number;
  nextLevelExp: number;
  totalExp: number;
  dailyQuota: number; // 扭蛋日配額
  recentExp: ExperienceRecord[];
}

export interface ExperienceRecord {
  id: string;
  amount: number;
  source: ExperienceSource;
  description: string;
  createdAt: string; // ISO 8601
}

export type ExperienceSource =
  | 'gacha'           // 扭蛋
  | 'collection'      // 收藏
  | 'referral'        // 推薦
  | 'contribution'    // 貢獻
  | 'crowdfund'       // 募資
  | 'achievement'     // 成就
  | 'daily_login'     // 每日登入
  | 'trip_submit';    // 行程提交

export interface ExperienceHistoryResponse {
  records: ExperienceRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ========== 成就系統 ==========

export type AchievementCategory =
  | 'collector'   // 收藏家
  | 'investor'    // 投資者
  | 'promoter'    // 推廣者
  | 'business'    // 商業
  | 'specialist'; // 策劃師

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Achievement {
  id: string;
  code: string;
  category: AchievementCategory;
  tier: AchievementTier;
  title: string;
  description: string;
  iconUrl: string | null;
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  isClaimed: boolean;
  reward: AchievementReward;
  unlockedAt: string | null; // ISO 8601
  claimedAt: string | null;  // ISO 8601
}

export interface AchievementReward {
  exp: number;
  credits?: number;
  badge?: string;
}

export interface AchievementsResponse {
  achievements: Achievement[];
  stats: {
    total: number;
    unlocked: number;
    claimed: number;
    byCategory: Record<AchievementCategory, { total: number; unlocked: number }>;
  };
}

export interface ClaimAchievementResponse {
  success: boolean;
  message: string;
  reward: AchievementReward;
  newExp: number;
  newLevel?: number; // 如果升級
}
