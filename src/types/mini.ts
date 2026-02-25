/**
 * ============================================================
 * MINI 貓咪系統型別定義 (mini.ts)
 * ============================================================
 * 此模組提供: MINI 虛擬夥伴相關型別
 *
 * 涵蓋功能:
 * - #056 MINI Profile（基本資料 + 改名）
 * - #057 探索系統（派遣/狀態/領取）
 * - #058 景點塗鴉牆（公開留言 CRUD）
 * - #059 景點筆記（私人 CRUD）
 * - #060 副貓圖鑑（目錄/收藏/加成）
 * - #061 養成系統（餵食/成長/貓糧）
 *
 * @see 後端契約: contracts/APP.md MINI 貓咪系統
 * 更新日期：2026-02-25
 */

// ============ #056 MINI Profile ============

/** MINI 情緒類型 */
export type MiniMood = 'happy' | 'hungry' | 'bored' | 'excited' | 'proud' | 'sad' | 'missing_you';

/** MINI 成長階段 */
export type MiniGrowthStage = 'kitten' | 'young' | 'adult' | 'elder';

/** MINI Profile 資料 */
export interface MiniProfile {
  name: string;
  currentMood: MiniMood;
  satiety: number;
  bondLevel: number;
  growthStage: MiniGrowthStage;
  totalChats: number;
  lastInteractionAt: string;
  createdAt: string;
}

/** GET /api/mini/profile 回應 */
export interface MiniProfileResponse {
  profile: MiniProfile;
}

/** PATCH /api/mini/profile/name 參數 */
export interface UpdateMiniNameParams {
  name: string;
}

/** PATCH /api/mini/profile/name 回應 */
export interface UpdateMiniNameResponse {
  profile: { name: string };
}

// ============ #057 探索系統 ============

/** 探索觸發類型 */
export type ExplorationTrigger = 'user_active' | 'location';

/** 探索狀態 */
export type ExplorationStatus = 'exploring' | 'completed' | 'claimed';

/** 探索記錄 */
export interface MiniExploration {
  id: number;
  trigger: ExplorationTrigger;
  status: ExplorationStatus;
  city: string;
  district: string;
  drawnNumber: number;
  waitMinutes: number;
  completesAt: string;
  createdAt: string;
  resultPlaceIds?: number[] | null;
  claimedAt?: string;
}

/** POST /api/mini/explore/start 參數 */
export interface StartExplorationParams {
  city: string;
  district: string;
}

/** POST /api/mini/explore/start 回應 */
export interface StartExplorationResponse {
  exploration: MiniExploration;
}

/** GET /api/mini/explore/status 回應 */
export interface ExplorationStatusResponse {
  hasActive: boolean;
  exploration: MiniExploration | null;
  isReady: boolean;
  remainingSeconds: number;
  completedExplorations: MiniExploration[];
}

/** 探索結果中的景點 */
export interface ExplorationPlace {
  id: number;
  placeName: string;
  category: string;
  city: string;
  district?: string;
}

/** POST /api/mini/explore/:id/claim 回應 */
export interface ClaimExplorationResponse {
  exploration: MiniExploration;
  places: ExplorationPlace[];
}

/** POST /api/mini/explore/location-check 參數 */
export interface LocationCheckParams {
  lat: number;
  lng: number;
}

/** POST /api/mini/explore/location-check 回應 */
export interface LocationCheckResponse {
  triggered: boolean;
  exploration: MiniExploration | null;
  reason: string | null;
}

// ============ #058 景點塗鴉牆 ============

/** 塗鴉牆留言 */
export interface GraffitiItem {
  id: number;
  content: string;
  imageUrl: string | null;
  displayName: string;
  isOwn: boolean;
  createdAt: string;
}

/** GET /api/mini/graffiti/:placeId 回應 */
export interface GraffitiListResponse {
  graffiti: GraffitiItem[];
}

/** POST /api/mini/graffiti/:placeId 參數 */
export interface CreateGraffitiParams {
  content: string;
  imageUrl?: string;
}

/** POST /api/mini/graffiti/:placeId 回應 */
export interface CreateGraffitiResponse {
  graffiti: GraffitiItem;
}

// ============ #059 景點筆記 ============

/** 私人筆記 */
export interface NoteItem {
  id: number;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** GET /api/mini/notes/:placeId 回應 */
export interface NotesListResponse {
  notes: NoteItem[];
}

/** POST /api/mini/notes/:placeId 參數 */
export interface CreateNoteParams {
  content: string;
  tags?: string[];
}

/** POST /api/mini/notes/:placeId 回應 */
export interface CreateNoteResponse {
  note: NoteItem;
}

/** PATCH /api/mini/notes/:id 參數 */
export interface UpdateNoteParams {
  content?: string;
  tags?: string[];
}

/** PATCH /api/mini/notes/:id 回應 */
export interface UpdateNoteResponse {
  note: NoteItem;
}

// ============ #060 副貓圖鑑 ============

/** 副貓分類 */
export type SubCatType = 'exploration' | 'resource' | 'function' | 'benefit';

/** 副貓稀有度 */
export type SubCatRarity = 'common' | 'rare' | 'epic' | 'legendary';

/** 副貓資料 */
export interface SubCat {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  type: SubCatType;
  rarity: SubCatRarity;
  hasBonus: boolean;
  bonusType: string;
  bonusValue: number;
  acquireHint: string;
  owned?: boolean;
  acquiredAt?: string | null;
  acquireMethod?: string | null;
}

/** GET /api/mini/sub-cats/catalog 回應 */
export interface SubCatCatalogResponse {
  catalog: SubCat[];
}

/** GET /api/mini/sub-cats/collection 回應 */
export interface SubCatCollectionResponse {
  collection: SubCat[];
  meta: {
    totalCount: number;
    ownedCount: number;
  };
}

/** GET /api/mini/sub-cats/bonuses 回應 */
export interface SubCatBonusesResponse {
  bonuses: {
    bonuses: Record<string, number>;
    bonusCatCount: number;
    totalCatCount: number;
  };
}

// ============ #061 養成系統 ============

/** 養成里程碑 */
export interface NurtureMilestone {
  stage: MiniGrowthStage;
  name: string;
  bondRequired: number;
  bondToGo: number;
}

/** GET /api/mini/nurture/status 回應 */
export interface NurtureStatusResponse {
  nurture: {
    satiety: number;
    bondLevel: number;
    growthStage: MiniGrowthStage;
    growthStageName: string;
    heartProgress: number;
    nextMilestone: NurtureMilestone | null;
    catFoodCount: number;
    todayFeedCount: number;
    feedDailyLimit: number;
  };
}

/** POST /api/mini/nurture/feed 回應 */
export interface FeedResponse {
  feed: {
    satietyBefore: number;
    satietyAfter: number;
    bondGain: number;
    newBondLevel: number;
    stageChanged: boolean;
    newGrowthStage: MiniGrowthStage;
    growthStageName: string;
    remainingFood: number;
  };
}

/** 養成紀錄 */
export interface NurtureLog {
  id: number;
  actionType: string;
  bondGain: number;
  satietyGain: number;
  createdAt: string;
}

/** GET /api/mini/nurture/logs 回應 */
export interface NurtureLogsResponse {
  logs: NurtureLog[];
}

/** GET /api/mini/nurture/cat-food 回應 */
export interface CatFoodResponse {
  catFood: { count: number };
}
