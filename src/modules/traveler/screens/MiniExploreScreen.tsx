/**
 * ============================================================
 * MiniExploreScreen - MINI 探索畫面
 * ============================================================
 * #057 MINI 探索系統
 *
 * 功能：
 * - 派 MINI 去指定地區探索景點
 * - 倒數計時等待探索完成
 * - 領取探索結果（景點清單）
 * - 檢視已完成但未領取的探索
 *
 * 串接 API：
 * - GET  /api/mini/explore/status     → useExplorationStatus()
 * - POST /api/mini/explore/start      → useStartExploration()
 * - POST /api/mini/explore/:id/claim  → useClaimExploration()
 *
 * 更新日期：2026-03-10
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../../context/AppContext';
import {
  useExplorationStatus,
  useStartExploration,
  useClaimExploration,
} from '../../../hooks/useMiniQueries';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize, Shadow } from '../../../theme/designTokens';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { BOTTOM_SPACER_HEIGHT } from '../../../constants/businessDefaults';
import type { MiniExploration } from '../../../types/mini';

// ============ 輔助函數 ============

/** 秒數格式化為 mm:ss */
function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
  const seconds = Math.max(0, totalSeconds) % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ============ 主元件 ============

export function MiniExploreScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  // Query & Mutation
  const statusQuery = useExplorationStatus();
  const startMutation = useStartExploration();
  const claimMutation = useClaimExploration();

  // 表單狀態
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');

  // 倒數計時本地狀態
  const [localSeconds, setLocalSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ========== 倒數計時同步 ==========

  useEffect(() => {
    const serverSeconds = statusQuery.data?.remainingSeconds ?? 0;
    setLocalSeconds(serverSeconds);
  }, [statusQuery.data?.remainingSeconds]);

  useEffect(() => {
    // 清除舊的 timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const hasActive = statusQuery.data?.hasActive ?? false;
    const isReady = statusQuery.data?.isReady ?? false;

    if (hasActive && !isReady && localSeconds > 0) {
      timerRef.current = setInterval(() => {
        setLocalSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            // 倒數結束，重新拉取狀態
            statusQuery.refetch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  // localSeconds 只作為初始判斷，不放進依賴避免無限重建 timer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusQuery.data?.hasActive, statusQuery.data?.isReady]);

  // ========== 事件處理 ==========

  const handleStartExploration = useCallback(() => {
    const trimmedCity = city.trim();
    const trimmedDistrict = district.trim();
    if (!trimmedCity || !trimmedDistrict) return;

    startMutation.mutate(
      { city: trimmedCity, district: trimmedDistrict },
      {
        onSuccess: () => {
          setCity('');
          setDistrict('');
        },
        onError: () => {
          Alert.alert(
            t.mini_error || '錯誤',
            t.mini_exploreStartFail || '探索啟動失敗，請稍後再試',
          );
        },
      },
    );
  }, [city, district, startMutation, t]);

  const handleClaimExploration = useCallback(
    (explorationId: number) => {
      claimMutation.mutate(explorationId, {
        onSuccess: (data) => {
          const placeNames = data.places.map((p) => p.placeName).join('\n');
          Alert.alert(
            t.mini_exploreClaimSuccess || '探索完成！',
            `${t.mini_exploreFoundPlaces || 'MINI 發現了這些景點'}:\n\n${placeNames}`,
          );
        },
        onError: () => {
          Alert.alert(
            t.mini_error || '錯誤',
            t.mini_exploreClaimFail || '領取失敗，請稍後再試',
          );
        },
      });
    },
    [claimMutation, t],
  );

  // ========== 渲染子區塊 ==========

  /** 無進行中探索 — 顯示啟動表單 */
  const renderIdleState = () => (
    <>
      {/* 介紹卡片 */}
      <View style={localStyles.introCard}>
        <Text style={localStyles.introEmoji}>🐱</Text>
        <Text style={localStyles.introTitle}>
          {t.mini_exploreIntro || '派 MINI 去探索！'}
        </Text>
        <Text style={localStyles.introDescription}>
          {t.mini_exploreDescription || '選擇一個地區，MINI 會幫你探索附近的景點'}
        </Text>
      </View>

      {/* 地區輸入 */}
      <View style={localStyles.formCard}>
        <Text style={localStyles.formLabel}>
          {t.mini_exploreCity || '城市'}
        </Text>
        <TextInput
          style={localStyles.formInput}
          value={city}
          onChangeText={setCity}
          placeholder={t.mini_exploreCityPlaceholder || '例如：台北市'}
          placeholderTextColor={MibuBrand.brownLight}
        />

        <Text style={[localStyles.formLabel, { marginTop: Spacing.lg }]}>
          {t.mini_exploreDistrict || '區域'}
        </Text>
        <TextInput
          style={localStyles.formInput}
          value={district}
          onChangeText={setDistrict}
          placeholder={t.mini_exploreDistrictPlaceholder || '例如：大安區'}
          placeholderTextColor={MibuBrand.brownLight}
        />

        <TouchableOpacity
          style={[
            localStyles.startButton,
            (!city.trim() || !district.trim()) && localStyles.startButtonDisabled,
          ]}
          onPress={handleStartExploration}
          disabled={!city.trim() || !district.trim() || startMutation.isPending}
        >
          {startMutation.isPending ? (
            <ActivityIndicator size="small" color={UIColors.white} />
          ) : (
            <Text style={localStyles.startButtonText}>
              {t.mini_exploreStart || '開始探索'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  /** 探索進行中 — 倒數計時 */
  const renderExploringState = () => {
    const exploration = statusQuery.data?.exploration;
    if (!exploration) return null;

    return (
      <View style={localStyles.exploringCard}>
        <Text style={localStyles.exploringEmoji}>🔍🐾</Text>
        <Text style={localStyles.exploringTitle}>
          {t.mini_exploring || 'MINI 正在探索中...'}
        </Text>
        <Text style={localStyles.exploringLocation}>
          {exploration.city} {exploration.district}
        </Text>
        <View style={localStyles.countdownContainer}>
          <Text style={localStyles.countdownText}>
            {formatCountdown(localSeconds)}
          </Text>
        </View>
        <Text style={localStyles.exploringHint}>
          {t.mini_exploreWaitHint || '探索完成後會通知你'}
        </Text>
      </View>
    );
  };

  /** 探索完成 — 可領取 */
  const renderReadyState = () => {
    const exploration = statusQuery.data?.exploration;
    if (!exploration) return null;

    return (
      <View style={localStyles.readyCard}>
        <Text style={localStyles.readyEmoji}>🎉</Text>
        <Text style={localStyles.readyTitle}>
          {t.mini_exploreComplete || '探索完成！'}
        </Text>
        <Text style={localStyles.readyLocation}>
          {exploration.city} {exploration.district}
        </Text>
        <TouchableOpacity
          style={localStyles.claimButton}
          onPress={() => handleClaimExploration(exploration.id)}
          disabled={claimMutation.isPending}
        >
          {claimMutation.isPending ? (
            <ActivityIndicator size="small" color={UIColors.white} />
          ) : (
            <Text style={localStyles.claimButtonText}>
              {t.mini_exploreClaim || '領取結果'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  /** 已完成但未領取的探索列表 */
  const renderCompletedExplorations = (explorations: MiniExploration[]) => {
    if (explorations.length === 0) return null;

    return (
      <View style={localStyles.completedSection}>
        <Text style={localStyles.sectionTitle}>
          {t.mini_exploreCompletedList || '待領取的探索'}
        </Text>
        {explorations.map((exp) => (
          <View key={exp.id} style={localStyles.completedCard}>
            <View style={localStyles.completedInfo}>
              <Text style={localStyles.completedLocation}>
                {exp.city} {exp.district}
              </Text>
              <Text style={localStyles.completedDate}>
                {new Date(exp.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              style={localStyles.claimSmallButton}
              onPress={() => handleClaimExploration(exp.id)}
              disabled={claimMutation.isPending}
            >
              <Text style={localStyles.claimSmallButtonText}>
                {t.mini_exploreClaim || '領取'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // ========== Loading / Error ==========

  if (statusQuery.isLoading) {
    return (
      <View style={localStyles.centered}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  if (statusQuery.error) {
    return (
      <View style={localStyles.centered}>
        <ErrorState
          message={statusQuery.error?.message || t.common_loadFailed || 'Failed to load'}
          onRetry={() => statusQuery.refetch()}
        />
      </View>
    );
  }

  // ========== 狀態判斷 ==========

  const data = statusQuery.data;
  const hasActive = data?.hasActive ?? false;
  const isReady = data?.isReady ?? false;
  const completedExplorations = (data?.completedExplorations ?? []).filter(
    (exp) => exp.status === 'completed',
  );

  // ========== Render ==========

  return (
    <View style={localStyles.container}>
      {/* Header */}
      <View style={[localStyles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={localStyles.backButton}>
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>
          {t.mini_exploreTitle || '探索'}
        </Text>
        <View style={localStyles.backButton} />
      </View>

      <ScrollView
        style={localStyles.scrollView}
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={statusQuery.isFetching && !statusQuery.isLoading}
            onRefresh={() => statusQuery.refetch()}
            tintColor={MibuBrand.brown}
            colors={[MibuBrand.brown]}
          />
        }
      >
        {/* 主狀態區塊 */}
        {hasActive && isReady && renderReadyState()}
        {hasActive && !isReady && renderExploringState()}
        {!hasActive && renderIdleState()}

        {/* 已完成探索列表 */}
        {renderCompletedExplorations(completedExplorations)}
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

  // ========== 閒置狀態（表單）==========

  introCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  introEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  introTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.sm,
  },
  introDescription: {
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
    textAlign: 'center',
    lineHeight: 22,
  },

  formCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  formLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.sm,
  },
  formInput: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.lg,
    color: MibuBrand.brownDark,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },

  startButton: {
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: UIColors.white,
  },

  // ========== 探索中（倒數計時）==========

  exploringCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  exploringEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  exploringTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.sm,
  },
  exploringLocation: {
    fontSize: FontSize.lg,
    color: MibuBrand.copper,
    fontWeight: '600',
    marginBottom: Spacing.xl,
  },
  countdownContainer: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  countdownText: {
    fontSize: 40,
    fontWeight: '800',
    color: MibuBrand.brown,
    fontVariant: ['tabular-nums'],
  },
  exploringHint: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    marginTop: Spacing.sm,
  },

  // ========== 探索完成（可領取）==========

  readyCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  readyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  readyTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.sm,
  },
  readyLocation: {
    fontSize: FontSize.lg,
    color: MibuBrand.copper,
    fontWeight: '600',
    marginBottom: Spacing.xl,
  },
  claimButton: {
    backgroundColor: MibuBrand.success,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
  },
  claimButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: UIColors.white,
  },

  // ========== 已完成探索列表 ==========

  completedSection: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.md,
  },
  completedCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.sm,
  },
  completedInfo: {
    flex: 1,
  },
  completedLocation: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  completedDate: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    marginTop: Spacing.xs,
  },
  claimSmallButton: {
    backgroundColor: MibuBrand.copper,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  claimSmallButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: UIColors.white,
  },
});
