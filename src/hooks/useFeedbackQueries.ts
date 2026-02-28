/**
 * ============================================================
 * 回饋系統 Query Hooks (useFeedbackQueries.ts)
 * ============================================================
 * 提供意見回饋提交 mutation
 *
 * 更新日期：2026-02-28（#064 新增）
 */
import { useAuthMutation } from './useAuthQuery';
import { feedbackApi } from '../services/feedbackApi';
import type { CreateFeedbackRequest, CreateFeedbackResponse } from '../types/feedback';

/**
 * 提交意見回饋
 *
 * @example
 * const submitFeedback = useSubmitFeedback();
 * submitFeedback.mutate({ type: 'bug_report', message: '...', screenshots: [...] });
 */
export function useSubmitFeedback() {
  return useAuthMutation<CreateFeedbackResponse, CreateFeedbackRequest>(
    (token, payload) => feedbackApi.submitFeedback(token, payload),
  );
}
