/**
 * ============================================================
 * 首頁 Query Hooks (useHomeQueries.ts)
 * ============================================================
 * HomeScreen 專用的 React Query hooks
 *
 * 查詢：
 * - useHomeEvents：首頁活動（不需認證）
 * - useDailyTasks：每日任務摘要（衍生自 useRules）
 *
 * 更新日期：2026-02-12（Phase 3 統一快取策略）
 */

import { useQuery } from '@tanstack/react-query';
import { eventApi } from '../services/api';
import { useRules } from './useEconomyQueries';

// ============ 查詢 Hooks ============

/** 取得首頁活動列表（公告、在地、限時）— 不需認證 */
export function useHomeEvents() {
  return useQuery({
    queryKey: ['home', 'events'],
    queryFn: () => eventApi.getHomeEvents(),
  });
}

/** 每日任務摘要介面 */
export interface DailyTaskSummary {
  completed: number;
  total: number;
  earnedCoins: number;
}

const DEFAULT_DAILY_TASK: DailyTaskSummary = {
  completed: 0,
  total: 5,
  earnedCoins: 0,
};

/**
 * 取得每日任務摘要
 * 內部使用 useRules({ type: 'quest', resetType: 'daily' })，
 * 並將規則引擎資料轉換為簡化的摘要格式。
 */
export function useDailyTasks() {
  const rulesQuery = useRules({ type: 'quest', resetType: 'daily' });

  // 從規則引擎資料衍生每日任務摘要
  const dailyTask: DailyTaskSummary = (() => {
    const data = rulesQuery.data;
    if (!data?.quests) return DEFAULT_DAILY_TASK;

    const questItems = data.quests.items || [];
    const completedCount = questItems.filter(
      (q: any) => q.status === 'completed' || q.status === 'claimed'
    ).length;
    const earnedCoins = questItems
      .filter((q: any) => q.status === 'claimed')
      .reduce((sum: number, q: any) => {
        const coinReward = q.rewards?.find((r: any) => r.type === 'coins');
        return sum + (coinReward?.amount ?? 0);
      }, 0);

    return {
      completed: completedCount,
      total: data.quests.total || questItems.length || 5,
      earnedCoins,
    };
  })();

  return {
    ...rulesQuery,
    dailyTask,
  };
}
