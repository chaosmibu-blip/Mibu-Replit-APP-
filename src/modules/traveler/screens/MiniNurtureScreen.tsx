/**
 * ============================================================
 * MiniNurtureScreen - MINI 養成系統畫面
 * ============================================================
 * #061 MINI 養成
 *
 * 功能：
 * - 顯示成長階段、飽食度、羈絆等級與心之進度
 * - 貓糧數量與餵食按鈕
 * - 餵食結果提示（飽食度變化 + 羈絆獲得）
 * - 階段進化慶祝提示
 * - 近期養成紀錄列表（最近 10 筆）
 * - 下拉重新整理
 *
 * 串接 API：
 * - GET  /api/mini/nurture/status  → useNurtureStatus()
 * - POST /api/mini/nurture/feed    → useFeedMini()
 * - GET  /api/mini/nurture/logs    → useNurtureLogs()
 *
 * 更新日期：2026-03-10
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useI18n } from '../../../context/AppContext';
import { useNurtureStatus, useFeedMini, useNurtureLogs } from '../../../hooks/useMiniQueries';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize, Shadow } from '../../../theme/designTokens';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { BOTTOM_SPACER_HEIGHT } from '../../../constants/businessDefaults';
import type { MiniGrowthStage, NurtureLog } from '../../../types/mini';

// ============ 常數 ============

const NURTURE_LOGS_LIMIT = 10;

/** 成長階段 emoji 對照 */
const STAGE_EMOJI: Record<MiniGrowthStage, string> = {
  kitten: '🐱',
  young: '🐈',
  adult: '🐈‍⬛',
  elder: '👑',
};

/** 養成動作 icon 對照 */
const ACTION_ICON: Record<string, string> = {
  feed: 'restaurant-outline',
  pet: 'hand-left-outline',
  explore: 'compass-outline',
  chat: 'chatbubble-outline',
};

// ============ 主元件 ============

export function MiniNurtureScreen() {
  const router = useRouter();
  const { t } = useI18n();

  // Query & Mutation
  const nurtureQuery = useNurtureStatus();
  const feedMutation = useFeedMini();
  const logsQuery = useNurtureLogs(NURTURE_LOGS_LIMIT);

  const nurture = nurtureQuery.data?.nurture;
  const logs = logsQuery.data?.logs ?? [];

  // ========== 翻譯輔助 ==========

  const getStageLabel = (stage: MiniGrowthStage): string => {
    const key = `mini_stage_${stage}` as keyof typeof t;
    return (t[key] as string) || stage;
  };

  const getActionLabel = (actionType: string): string => {
    const key = `mini_action_${actionType}` as keyof typeof t;
    return (t[key] as string) || actionType;
  };

  // ========== 餵食 ==========

  const isFeedDisabled =
    !nurture ||
    nurture.catFoodCount <= 0 ||
    nurture.todayFeedCount >= nurture.feedDailyLimit ||
    feedMutation.isPending;

  const handleFeed = useCallback(() => {
    if (isFeedDisabled) return;

    feedMutation.mutate(undefined, {
      onSuccess: (data) => {
        const { feed } = data;

        // 階段進化慶祝
        if (feed.stageChanged) {
          Alert.alert(
            t.mini_stageUp || '進化了！',
            `${STAGE_EMOJI[feed.newGrowthStage]} ${feed.growthStageName}\n${t.mini_stageUpMessage || '恭喜 MINI 成長到新階段！'}`,
          );
          return;
        }

        // 一般餵食結果
        const satietyChange = feed.satietyAfter - feed.satietyBefore;
        Alert.alert(
          t.mini_feedSuccess || '餵食成功',
          `${t.mini_satiety || '飽食度'} +${satietyChange}%\n${t.mini_bondGain || '羈絆'} +${feed.bondGain}\n${t.mini_remainingFood || '剩餘貓糧'}: ${feed.remainingFood}`,
        );
      },
      onError: () => {
        Alert.alert(
          t.mini_error || '錯誤',
          t.mini_feedFail || '餵食失敗，請稍後再試',
        );
      },
    });
  }, [isFeedDisabled, feedMutation, t]);

  // ========== 下拉重新整理 ==========

  const isRefreshing =
    (nurtureQuery.isFetching && !nurtureQuery.isLoading) ||
    (logsQuery.isFetching && !logsQuery.isLoading);

  const handleRefresh = useCallback(() => {
    nurtureQuery.refetch();
    logsQuery.refetch();
  }, [nurtureQuery, logsQuery]);

  // ========== 時間格式化 ==========

  const formatLogTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
  };

  // ========== 餵食按鈕文字 ==========

  const getFeedButtonLabel = (): string => {
    if (!nurture) return t.mini_feed || '餵食';
    if (nurture.catFoodCount <= 0) return t.mini_noFood || '沒有貓糧';
    if (nurture.todayFeedCount >= nurture.feedDailyLimit) return t.mini_feedLimitReached || '今日已達上限';
    return t.mini_feed || '餵食';
  };

  // ========== Loading / Error ==========

  if (nurtureQuery.isLoading) {
    return (
      <View style={localStyles.centered}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  if (nurtureQuery.error || !nurture) {
    return (
      <View style={localStyles.centered}>
        <ErrorState
          message={nurtureQuery.error?.message || 'Failed to load'}
          onRetry={() => nurtureQuery.refetch()}
        />
      </View>
    );
  }

  // ========== 衍生狀態 ==========

  const satietyPercent = Math.min(nurture.satiety, 100);
  const heartPercent = Math.min(nurture.heartProgress * 100, 100);

  // ========== 養成紀錄項目 ==========

  const renderLogItem = (log: NurtureLog) => (
    <View key={log.id} style={localStyles.logItem}>
      <View style={localStyles.logIconContainer}>
        <Ionicons
          name={(ACTION_ICON[log.actionType] || 'ellipse-outline') as keyof typeof Ionicons.glyphMap}
          size={18}
          color={MibuBrand.copper}
        />
      </View>
      <View style={localStyles.logContent}>
        <Text style={localStyles.logAction}>{getActionLabel(log.actionType)}</Text>
        <Text style={localStyles.logTime}>{formatLogTime(log.createdAt)}</Text>
      </View>
      <View style={localStyles.logGains}>
        {log.bondGain > 0 && (
          <Text style={localStyles.logBondGain}>
            <Ionicons name="heart" size={FontSize.xs} color={MibuBrand.error} /> +{log.bondGain}
          </Text>
        )}
        {log.satietyGain > 0 && (
          <Text style={localStyles.logSatietyGain}>
            <Ionicons name="restaurant" size={FontSize.xs} color={MibuBrand.success} /> +{log.satietyGain}
          </Text>
        )}
      </View>
    </View>
  );

  // ========== Render ==========

  return (
    <View style={localStyles.container}>
      {/* Header */}
      <View style={localStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={localStyles.backButton}>
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>{t.mini_nurtureTitle || '養成'}</Text>
        <View style={localStyles.backButton} />
      </View>

      <ScrollView
        style={localStyles.scrollView}
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={MibuBrand.brown}
            colors={[MibuBrand.brown]}
          />
        }
      >
        {/* 成長階段卡片 */}
        <View style={localStyles.stageCard}>
          <Text style={localStyles.stageEmoji}>{STAGE_EMOJI[nurture.growthStage]}</Text>
          <Text style={localStyles.stageName}>{nurture.growthStageName}</Text>
          <Text style={localStyles.stageSubLabel}>
            {getStageLabel(nurture.growthStage)}
          </Text>
        </View>

        {/* 飽食度 */}
        <View style={localStyles.statCard}>
          <View style={localStyles.statHeader}>
            <Ionicons name="restaurant-outline" size={20} color={MibuBrand.copper} />
            <Text style={localStyles.statTitle}>{t.mini_satiety || '飽食度'}</Text>
            <Text style={localStyles.statValue}>{nurture.satiety}%</Text>
          </View>
          <View style={localStyles.progressBar}>
            <View
              style={[
                localStyles.progressFill,
                { width: `${satietyPercent}%` },
              ]}
            />
          </View>
        </View>

        {/* 羈絆等級 + 心之進度 */}
        <View style={localStyles.statCard}>
          <View style={localStyles.statHeader}>
            <Ionicons name="heart-outline" size={20} color={MibuBrand.copper} />
            <Text style={localStyles.statTitle}>{t.mini_bondLevel || '羈絆等級'}</Text>
            <Text style={localStyles.statValue}>Lv.{nurture.bondLevel}</Text>
          </View>
          <View style={localStyles.progressBar}>
            <View
              style={[
                localStyles.heartProgressFill,
                { width: `${heartPercent}%` },
              ]}
            />
          </View>
          {nurture.nextMilestone && (
            <View style={localStyles.milestoneRow}>
              <Text style={localStyles.milestoneText}>
                {t.mini_nextMilestone || '下一階段'}:{' '}
                {STAGE_EMOJI[nurture.nextMilestone.stage]} {nurture.nextMilestone.name}
              </Text>
              <Text style={localStyles.milestoneProgress}>
                {t.mini_bondToGo || '還差'} {nurture.nextMilestone.bondToGo}
              </Text>
            </View>
          )}
        </View>

        {/* 貓糧 + 餵食 */}
        <View style={localStyles.feedCard}>
          <View style={localStyles.foodRow}>
            <View style={localStyles.foodInfo}>
              <Ionicons name="fish-outline" size={20} color={MibuBrand.copper} />
              <Text style={localStyles.foodLabel}>{t.mini_catFood || '貓糧'}</Text>
              <Text style={localStyles.foodCount}>{nurture.catFoodCount}</Text>
            </View>
            <Text style={localStyles.feedCountLabel}>
              {t.mini_todayFeed || '今日餵食'}: {nurture.todayFeedCount}/{nurture.feedDailyLimit}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              localStyles.feedButton,
              isFeedDisabled && localStyles.feedButtonDisabled,
            ]}
            onPress={handleFeed}
            disabled={isFeedDisabled}
            activeOpacity={0.7}
          >
            {feedMutation.isPending ? (
              <ActivityIndicator size="small" color={UIColors.white} />
            ) : (
              <>
                <Ionicons
                  name="restaurant"
                  size={20}
                  color={isFeedDisabled ? MibuBrand.brownLight : UIColors.white}
                />
                <Text
                  style={[
                    localStyles.feedButtonText,
                    isFeedDisabled && localStyles.feedButtonTextDisabled,
                  ]}
                >
                  {getFeedButtonLabel()}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 養成紀錄 */}
        <View style={localStyles.logsSection}>
          <View style={localStyles.logsSectionHeader}>
            <Ionicons name="time-outline" size={20} color={MibuBrand.copper} />
            <Text style={localStyles.logsSectionTitle}>
              {t.mini_nurtureLogs || '養成紀錄'}
            </Text>
          </View>

          {logsQuery.isLoading ? (
            <ActivityIndicator
              size="small"
              color={MibuBrand.brown}
              style={localStyles.logsLoading}
            />
          ) : logs.length === 0 ? (
            <Text style={localStyles.logsEmpty}>
              {t.mini_noLogs || '尚無養成紀錄'}
            </Text>
          ) : (
            logs.map(renderLogItem)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ============ 樣式 ============

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: MibuBrand.creamLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: BOTTOM_SPACER_HEIGHT,
  },

  // 成長階段卡片
  stageCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  stageEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  stageName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },
  stageSubLabel: {
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
    marginTop: Spacing.xs,
  },

  // 狀態卡片
  statCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brown,
  },

  // 飽食度進度條
  progressBar: {
    height: 8,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: MibuBrand.success,
    borderRadius: Radius.full,
  },
  heartProgressFill: {
    height: '100%',
    backgroundColor: MibuBrand.error,
    borderRadius: Radius.full,
  },

  // 里程碑
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  milestoneText: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
  },
  milestoneProgress: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.copper,
  },

  // 貓糧 + 餵食卡片
  feedCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  foodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  foodLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  foodCount: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  feedCountLabel: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
  },
  feedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
  },
  feedButtonDisabled: {
    backgroundColor: MibuBrand.tanLight,
  },
  feedButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: UIColors.white,
  },
  feedButtonTextDisabled: {
    color: MibuBrand.brownLight,
  },

  // 養成紀錄
  logsSection: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  logsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logsSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  logsLoading: {
    paddingVertical: Spacing.xl,
  },
  logsEmpty: {
    textAlign: 'center',
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
    paddingVertical: Spacing.xl,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.creamLight,
  },
  logIconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  logTime: {
    fontSize: FontSize.xs,
    color: MibuBrand.brownLight,
    marginTop: Spacing.xs,
  },
  logGains: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  logBondGain: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.error,
  },
  logSatietyGain: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.success,
  },
});
