/**
 * ============================================================
 * 使用者回饋型別 (feedback.ts)
 * ============================================================
 * 對應後端 POST /api/feedback
 *
 * 型別對齊後端 shared/api-types.ts（CreateFeedbackRequest / CreateFeedbackResponse）
 * 注意：shared 套件尚未在 index.ts 匯出 Feedback 型別，
 * 後端更新 re-export 後可改為 import from '@chaosmibu-blip/mibu-shared'
 *
 * 更新日期：2026-02-28（#064 新增）
 */

/**
 * 回饋類型
 */
export type FeedbackType = 'bug_report' | 'suggestion';

/**
 * 裝置資訊（APP 自動帶入）
 */
export interface DeviceInfo {
  os?: string;
  appVersion?: string;
  deviceModel?: string;
}

/**
 * 提交回饋 Request（對齊後端 CreateFeedbackRequest）
 */
export interface CreateFeedbackRequest {
  type: FeedbackType;
  message: string;
  screenshots?: string[];
  deviceInfo?: DeviceInfo;
}

/**
 * 提交回饋 Response（對齊後端 CreateFeedbackResponse）
 */
export interface CreateFeedbackResponse {
  success: true;
  feedbackId: number;
}
