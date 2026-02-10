/**
 * @fileoverview 規則引擎型別定義（#043 統一規則引擎）
 *
 * 統一成就（achievement）、任務（quest）、觸發獎勵（reward_trigger）的資料結構
 * 取代舊的分散型別（economy.ts 中的 Achievement / DailyTask）
 *
 * @module types/rules
 * @see 後端契約: contracts/APP.md #043
 * @created 2026-02-10
 */

// ============ 列舉型別 ============

/** 規則類型 */
export type RuleType = 'achievement' | 'quest' | 'reward_trigger';

/** 規則狀態（狀態機：locked → available → completed → claimed） */
export type RuleStatus = 'locked' | 'available' | 'completed' | 'claimed' | 'triggered' | 'expired';

/** 重置週期 */
export type ResetType = 'none' | 'daily' | 'weekly';

/** 導航目標（規則卡片上的「前往」按鈕目的地） */
export type NavigateTo = 'gacha' | 'collection' | 'vote' | 'shop' | 'referral' | 'crowdfund' | null;

// ============ 獎勵相關 ============

/** 獎勵類型 */
export type RewardType = 'coins' | 'shop_item' | 'inventory_coupon' | 'place_pack' | 'place_pack_curated' | 'perk';

/** 權益加成子型別 */
export type PerkType = 'daily_pulls' | 'inventory_slots';

/**
 * 獎勵載荷（聯合型別，根據 type 有不同欄位）
 *
 * - coins: amount
 * - shop_item / inventory_coupon: itemCode, quantity, itemName, terms, validDays
 * - place_pack: packCode
 * - place_pack_curated: placeIds
 * - perk: perkType, value
 */
export interface RewardPayload {
  type: RewardType;
  amount?: number;        // coins 用
  itemCode?: string;      // shop_item / inventory_coupon 用
  quantity?: number;
  itemName?: string;
  terms?: string;
  validDays?: number;
  packCode?: string;      // place_pack 用
  placeIds?: number[];    // place_pack_curated 用
  perkType?: PerkType;    // perk 用
  value?: number;         // perk 用
}

// ============ 條件進度 ============

/**
 * 單一條件的即時進度
 *
 * 後端會針對每個條件計算百分比，前端直接顯示即可
 */
export interface ConditionResult {
  type: string;
  isMet: boolean;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
}

// ============ 規則列表項目 ============

/**
 * 規則列表項目
 *
 * GET /api/rules 回傳的每一筆規則（含用戶進度）
 */
export interface RuleItem {
  id: number;
  code: string;
  type: RuleType;
  nameZh: string;
  nameEn?: string;
  description: string;
  icon?: string;
  navigateTo: NavigateTo;
  chainId: string | null;
  sortOrder: number;
  rewards: RewardPayload[];
  resetType: ResetType;
  status: RuleStatus;
  progress: Record<string, number>;
  triggerCount: number;
  completedAt: string | null;
  claimedAt: string | null;
  conditionResults: ConditionResult[];
}

// ============ 任務鏈 ============

/**
 * 任務鏈步驟
 *
 * 多步驟任務（chain）中的單一步驟
 */
export interface ChainStep {
  id: number;
  code: string;
  type: RuleType;
  nameZh: string;
  nameEn?: string;
  navigateTo: NavigateTo;
  sortOrder: number;
  rewards: RewardPayload[];
  status: RuleStatus;
  progress: Record<string, number>;
  completedAt: string | null;
  claimedAt: string | null;
}

/**
 * 任務鏈詳情
 *
 * GET /api/rules/chain/:chainId 回傳
 */
export interface RuleChainDetail {
  chainId: string;
  steps: ChainStep[];
  totalSteps: number;
  completedSteps: number;
}

// ============ 規則詳情 ============

/**
 * 規則完整定義（含條件細節）
 *
 * GET /api/rules/:code 回傳的 rule 欄位
 */
export interface RuleDetail {
  id: number;
  code: string;
  type: RuleType;
  nameZh: string;
  nameEn?: string;
  description: string;
  icon?: string;
  navigateTo: NavigateTo;
  chainId: string | null;
  sortOrder: number;
  prerequisites: unknown | null;
  conditions: RuleCondition[];
  rewards: RewardPayload[];
  resetType: ResetType;
  startAt: string | null;
  endAt: string | null;
}

/** 規則條件定義 */
export interface RuleCondition {
  type: string;
  event: string;
  target: number;
}

/**
 * 用戶的規則進度
 *
 * GET /api/rules/:code 回傳的 progress 欄位
 */
export interface RuleProgress {
  status: RuleStatus;
  progress: Record<string, number>;
  triggerCount: number;
  unlockedAt: string | null;
  completedAt: string | null;
  claimedAt: string | null;
}

// ============ API 回應型別 ============

/**
 * 規則列表回應
 *
 * GET /api/rules
 * 後端已按 type 分好組
 */
export interface RulesListResponse {
  achievements: {
    total: number;
    unlocked: number;
    items: RuleItem[];
  };
  quests: {
    total: number;
    completed: number;
    items: RuleItem[];
  };
  /** 自動觸發獎勵數量（不需 UI 列表） */
  rewardTriggers: number;
  /** 待領取獎勵數（用於顯示 badge） */
  pendingClaims: number;
}

/**
 * 規則詳情回應
 *
 * GET /api/rules/:code
 */
export interface RuleDetailResponse {
  rule: RuleDetail;
  progress: RuleProgress;
  conditionResults: ConditionResult[];
}

/**
 * 領取獎勵回應
 *
 * POST /api/rules/:id/claim
 */
export interface ClaimRuleResponse {
  success: true;
  rule: {
    id: number;
    code: string;
    nameZh: string;
    type: RuleType;
  };
  rewards: RewardPayload[];
  /** 如果獎勵寄到信箱則有值 */
  mailboxItemId: number | null;
  /** 給用戶看的確認訊息 */
  message: string;
}
