/**
 * 用戶貢獻系統類型 - 回報、建議、黑名單、投票
 */

// ========== 回報歇業 ==========

export type ReportReason = 'closed' | 'relocated' | 'wrong_info' | 'other';
export type ReportStatus = 'pending' | 'verified' | 'rejected';

export interface ReportClosedParams {
  placeId: string;
  reason: ReportReason;
  details?: string;
  photoUrls?: string[];
}

export interface ReportClosedResponse {
  success: boolean;
  message: string;
  reportId: string;
  expEarned: number;
}

export interface MyReport {
  id: string;
  placeId: string;
  placeName: string;
  reason: ReportReason;
  status: ReportStatus;
  details: string | null;
  createdAt: string;
  reviewedAt: string | null;
  expEarned: number;
}

export interface MyReportsResponse {
  reports: MyReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ========== 建議景點 ==========

export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'voting';

export interface SuggestPlaceParams {
  name: string;
  address: string;
  regionId: string;
  category: string;
  description?: string;
  photoUrls?: string[];
  googlePlaceId?: string;
  website?: string;
  phone?: string;
}

export interface SuggestPlaceResponse {
  success: boolean;
  message: string;
  suggestionId: string;
  expEarned: number;
}

export interface MySuggestion {
  id: string;
  name: string;
  address: string;
  category: string;
  status: SuggestionStatus;
  voteCount?: {
    approve: number;
    reject: number;
  };
  createdAt: string;
  reviewedAt: string | null;
  expEarned: number;
}

export interface MySuggestionsResponse {
  suggestions: MySuggestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ========== 黑名單 ==========

export interface BlacklistItem {
  placeId: string;
  placeName: string;
  placeAddress: string;
  category: string;
  addedAt: string;
}

export interface BlacklistResponse {
  items: BlacklistItem[];
  count: number;
}

export interface BlacklistActionResponse {
  success: boolean;
  message: string;
}

// ========== 投票系統 ==========

export interface PendingVotePlace {
  placeId: string;
  placeName: string;
  placeAddress: string;
  category: string;
  reportCount: number;
  reportReasons: ReportReason[];
  voteDeadline: string; // ISO 8601
  currentVotes: {
    exclude: number;
    keep: number;
  };
}

export interface PendingVotesResponse {
  places: PendingVotePlace[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface VotePlaceParams {
  vote: 'exclude' | 'keep';
  reason?: string;
}

export interface VotePlaceResponse {
  success: boolean;
  message: string;
  expEarned: number;
}

// 建議景點投票
export interface PendingSuggestion {
  id: string;
  name: string;
  address: string;
  category: string;
  description: string | null;
  photoUrls: string[];
  suggestedBy: string;
  voteDeadline: string;
  currentVotes: {
    approve: number;
    reject: number;
  };
}

export interface PendingSuggestionsResponse {
  suggestions: PendingSuggestion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface VoteSuggestionParams {
  vote: 'approve' | 'reject';
  reason?: string;
}

export interface VoteSuggestionResponse {
  success: boolean;
  message: string;
  expEarned: number;
}
