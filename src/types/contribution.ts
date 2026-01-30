/**
 * @fileoverview 用戶貢獻系統型別定義
 *
 * 定義用戶貢獻相關的資料結構，包含：
 * - 回報歇業
 * - 建議景點
 * - 黑名單管理
 * - 投票系統
 *
 * @module types/contribution
 */

// ============ 回報歇業 ============

/**
 * 回報原因
 * - closed: 已歇業
 * - relocated: 已搬遷
 * - wrong_info: 資訊錯誤
 * - other: 其他
 */
export type ReportReason = 'closed' | 'relocated' | 'wrong_info' | 'other';

/**
 * 回報狀態
 * - pending: 待審核
 * - verified: 已確認
 * - rejected: 已拒絕
 */
export type ReportStatus = 'pending' | 'verified' | 'rejected';

/**
 * 回報歇業參數
 * POST /api/contribution/report-closed
 */
export interface ReportClosedParams {
  placeId: string;       // 地點 ID
  reason: ReportReason;  // 回報原因
  details?: string;      // 詳細說明
  photoUrls?: string[];  // 照片 URL 列表
}

/**
 * 回報歇業回應
 * POST /api/contribution/report-closed
 */
export interface ReportClosedResponse {
  success: boolean;   // 是否成功
  message: string;    // 回應訊息
  reportId: string;   // 回報記錄 ID
  expEarned: number;  // 獲得的經驗值
}

/**
 * 我的回報記錄
 */
export interface MyReport {
  id: string;                 // 回報 ID
  placeId: string;            // 地點 ID
  placeName: string;          // 地點名稱
  reason: ReportReason;       // 回報原因
  status: ReportStatus;       // 審核狀態
  details: string | null;     // 詳細說明
  createdAt: string;          // 回報時間（ISO 8601）
  reviewedAt: string | null;  // 審核時間（ISO 8601）
  expEarned: number;          // 獲得的經驗值
}

/**
 * 我的回報列表回應
 * GET /api/contribution/my-reports
 */
export interface MyReportsResponse {
  reports: MyReport[];  // 回報列表
  pagination: {
    page: number;       // 當前頁碼
    limit: number;      // 每頁數量
    total: number;      // 總數量
    hasMore: boolean;   // 是否有更多
  };
}

// ============ 建議景點 ============

/**
 * 建議狀態
 * - pending: 待審核
 * - approved: 已通過
 * - rejected: 已拒絕
 * - voting: 投票中
 */
export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'voting';

/**
 * 建議景點參數
 * POST /api/contribution/suggest-place
 */
export interface SuggestPlaceParams {
  name: string;            // 景點名稱
  address: string;         // 地址
  regionId: string;        // 地區 ID
  category: string;        // 分類
  description?: string;    // 描述
  photoUrls?: string[];    // 照片 URL 列表
  googlePlaceId?: string;  // Google Place ID
  website?: string;        // 網站
  phone?: string;          // 電話
}

/**
 * 建議景點回應
 * POST /api/contribution/suggest-place
 */
export interface SuggestPlaceResponse {
  success: boolean;       // 是否成功
  message: string;        // 回應訊息
  suggestionId: string;   // 建議記錄 ID
  expEarned: number;      // 獲得的經驗值
}

/**
 * 我的建議記錄
 */
export interface MySuggestion {
  id: string;                  // 建議 ID
  name: string;                // 景點名稱
  address: string;             // 地址
  category: string;            // 分類
  status: SuggestionStatus;    // 狀態
  voteCount?: {                // 投票統計
    approve: number;           // 贊成票數
    reject: number;            // 反對票數
  };
  createdAt: string;           // 建議時間（ISO 8601）
  reviewedAt: string | null;   // 審核時間（ISO 8601）
  expEarned: number;           // 獲得的經驗值
}

/**
 * 我的建議列表回應
 * GET /api/contribution/my-suggestions
 */
export interface MySuggestionsResponse {
  suggestions: MySuggestion[];  // 建議列表
  pagination: {
    page: number;     // 當前頁碼
    limit: number;    // 每頁數量
    total: number;    // 總數量
    hasMore: boolean; // 是否有更多
  };
}

// ============ 黑名單 ============

/**
 * 黑名單項目
 *
 * 用戶個人的排除名單
 */
export interface BlacklistItem {
  placeId: string;       // 地點 ID
  placeName: string;     // 地點名稱
  placeAddress: string;  // 地址
  category: string;      // 分類
  addedAt: string;       // 加入時間（ISO 8601）
}

/**
 * 黑名單列表回應
 * GET /api/contribution/blacklist
 */
export interface BlacklistResponse {
  items: BlacklistItem[];  // 黑名單項目
  count: number;           // 總數量
}

/**
 * 黑名單操作回應
 */
export interface BlacklistActionResponse {
  success: boolean;  // 是否成功
  message: string;   // 回應訊息
}

// ============ 投票系統 ============

/**
 * 待投票的地點
 *
 * 被回報待社群投票決定是否排除的地點
 */
export interface PendingVotePlace {
  placeId: string;              // 地點 ID
  placeName: string;            // 地點名稱
  placeAddress: string;         // 地址
  category: string;             // 分類
  reportCount: number;          // 回報次數
  reportReasons: ReportReason[]; // 回報原因列表
  voteDeadline: string;         // 投票截止時間（ISO 8601）
  currentVotes: {               // 當前投票統計
    exclude: number;            // 排除票數
    keep: number;               // 保留票數
  };
}

/**
 * 待投票地點列表回應
 * GET /api/contribution/pending-votes
 */
export interface PendingVotesResponse {
  places: PendingVotePlace[];  // 待投票地點列表
  pagination: {
    page: number;     // 當前頁碼
    limit: number;    // 每頁數量
    total: number;    // 總數量
    hasMore: boolean; // 是否有更多
  };
}

/**
 * 地點投票參數
 * POST /api/contribution/vote-place
 */
export interface VotePlaceParams {
  vote: 'exclude' | 'keep';  // 投票選項
  reason?: string;           // 投票理由
}

/**
 * 地點投票回應
 * POST /api/contribution/vote-place
 */
export interface VotePlaceResponse {
  success: boolean;   // 是否成功
  message: string;    // 回應訊息
  expEarned: number;  // 獲得的經驗值
}

// ============ 建議景點投票 ============

/**
 * 待投票的建議景點
 */
export interface PendingSuggestion {
  id: string;               // 建議 ID
  name: string;             // 景點名稱
  address: string;          // 地址
  category: string;         // 分類
  description: string | null; // 描述
  photoUrls: string[];      // 照片列表
  suggestedBy: string;      // 建議者名稱
  voteDeadline: string;     // 投票截止時間（ISO 8601）
  currentVotes: {           // 當前投票統計
    approve: number;        // 贊成票數
    reject: number;         // 反對票數
  };
}

/**
 * 待投票建議列表回應
 * GET /api/contribution/pending-suggestions
 */
export interface PendingSuggestionsResponse {
  suggestions: PendingSuggestion[];  // 待投票建議列表
  pagination: {
    page: number;     // 當前頁碼
    limit: number;    // 每頁數量
    total: number;    // 總數量
    hasMore: boolean; // 是否有更多
  };
}

/**
 * 建議投票參數
 * POST /api/contribution/vote-suggestion
 */
export interface VoteSuggestionParams {
  vote: 'approve' | 'reject';  // 投票選項
  reason?: string;             // 投票理由
}

/**
 * 建議投票回應
 * POST /api/contribution/vote-suggestion
 */
export interface VoteSuggestionResponse {
  success: boolean;   // 是否成功
  message: string;    // 回應訊息
  expEarned: number;  // 獲得的經驗值
}
