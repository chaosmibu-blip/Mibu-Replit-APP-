/**
 * ============================================================
 * MiniProfileScreen - MINI 貓咪 Profile 畫面
 * ============================================================
 * #056 MINI Profile
 *
 * 功能：
 * - 顯示 MINI 基本資料（名字、心情、飽食度、羈絆等級、成長階段）
 * - 點擊名字可行內編輯
 *
 * 串接 API：
 * - GET  /api/mini/profile      → useMiniProfile()
 * - PATCH /api/mini/profile/name → useUpdateMiniName()
 *
 * 更新日期：2026-02-25
 */
import React, { useState, useRef, useCallback } from 'react';
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
import { useI18n } from '../../../context/AppContext';
import { useMiniProfile, useUpdateMiniName } from '../../../hooks/useMiniQueries';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize, Shadow } from '../../../theme/designTokens';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { InputLimit } from '../../../constants/businessDefaults';
import type { MiniMood, MiniGrowthStage } from '../../../types/mini';

// ============ 輔助函數 ============

/** 心情 emoji 對照 */
const MOOD_EMOJI: Record<MiniMood, string> = {
  happy: '😸',
  hungry: '😿',
  bored: '😾',
  excited: '🙀',
  proud: '😼',
  sad: '😢',
  missing_you: '🥺',
};

/** 成長階段 icon 對照 */
const STAGE_ICON: Record<MiniGrowthStage, string> = {
  kitten: '🐱',
  young: '🐈',
  adult: '🐈‍⬛',
  elder: '👑',
};

// ============ 主元件 ============

export function MiniProfileScreen() {
  const router = useRouter();
  const { t } = useI18n();

  // Query & Mutation
  const profileQuery = useMiniProfile();
  const updateNameMutation = useUpdateMiniName();

  // 編輯名字狀態
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const savingRef = useRef(false);

  const profile = profileQuery.data?.profile;

  // ========== 名字編輯 ==========

  const handleStartEditName = useCallback(() => {
    if (!profile) return;
    setNameInput(profile.name);
    setIsEditingName(true);
  }, [profile]);

  const handleSaveName = useCallback(() => {
    // #006 教訓：用 ref 防止重複觸發
    if (savingRef.current) return;
    const trimmed = nameInput.trim();
    if (!trimmed) {
      Alert.alert(t.mini_nameEmpty);
      return;
    }
    if (trimmed === profile?.name) {
      setIsEditingName(false);
      return;
    }
    savingRef.current = true;
    updateNameMutation.mutate(trimmed, {
      onSuccess: () => {
        setIsEditingName(false);
        savingRef.current = false;
      },
      onError: () => {
        savingRef.current = false;
        Alert.alert(t.mini_error, t.mini_nameUpdateFail);
      },
    });
  }, [nameInput, profile?.name, updateNameMutation, t]);

  const handleCancelEditName = useCallback(() => {
    setIsEditingName(false);
    setNameInput('');
  }, []);

  // ========== 翻譯輔助 ==========

  const getMoodLabel = (mood: MiniMood): string => {
    const key = `mini_mood_${mood}` as keyof typeof t;
    return (t[key] as string) || mood;
  };

  const getStageLabel = (stage: MiniGrowthStage): string => {
    const key = `mini_stage_${stage}` as keyof typeof t;
    return (t[key] as string) || stage;
  };

  // ========== Loading / Error ==========

  if (profileQuery.isLoading) {
    return (
      <View style={localStyles.centered}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  if (profileQuery.error || !profile) {
    return (
      <View style={localStyles.centered}>
        <ErrorState
          message={profileQuery.error?.message || 'Failed to load'}
          onRetry={() => profileQuery.refetch()}
        />
      </View>
    );
  }

  // ========== Render ==========

  return (
    <View style={localStyles.container}>
      {/* Header */}
      <View style={localStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={localStyles.backButton}>
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>{t.mini_profileTitle}</Text>
        <View style={localStyles.backButton} />
      </View>

      <ScrollView
        style={localStyles.scrollView}
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={profileQuery.isFetching && !profileQuery.isLoading}
            onRefresh={() => profileQuery.refetch()}
            tintColor={MibuBrand.brown}
            colors={[MibuBrand.brown]}
          />
        }
      >
        {/* 名字區塊 */}
        <View style={localStyles.nameCard}>
          <Text style={localStyles.stageEmoji}>{STAGE_ICON[profile.growthStage]}</Text>
          {isEditingName ? (
            <View style={localStyles.nameEditRow}>
              <TextInput
                style={localStyles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder={t.mini_namePlaceholder}
                placeholderTextColor={MibuBrand.brownLight}
                maxLength={InputLimit.title}
                autoFocus
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity onPress={handleSaveName} style={localStyles.nameActionButton}>
                <Ionicons name="checkmark" size={20} color={MibuBrand.success} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancelEditName} style={localStyles.nameActionButton}>
                <Ionicons name="close" size={20} color={MibuBrand.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleStartEditName} style={localStyles.nameRow}>
              <Text style={localStyles.nameText}>{profile.name}</Text>
              <Ionicons name="pencil-outline" size={18} color={MibuBrand.copper} />
            </TouchableOpacity>
          )}
          <Text style={localStyles.stageLabel}>
            {STAGE_ICON[profile.growthStage]} {getStageLabel(profile.growthStage)}
          </Text>
        </View>

        {/* 心情 */}
        <View style={localStyles.statCard}>
          <View style={localStyles.statHeader}>
            <Ionicons name="heart-outline" size={20} color={MibuBrand.copper} />
            <Text style={localStyles.statTitle}>{t.mini_mood}</Text>
          </View>
          <Text style={localStyles.moodDisplay}>
            {MOOD_EMOJI[profile.currentMood]} {getMoodLabel(profile.currentMood)}
          </Text>
        </View>

        {/* 飽食度 */}
        <View style={localStyles.statCard}>
          <View style={localStyles.statHeader}>
            <Ionicons name="restaurant-outline" size={20} color={MibuBrand.copper} />
            <Text style={localStyles.statTitle}>{t.mini_satiety}</Text>
            <Text style={localStyles.statValue}>{profile.satiety}%</Text>
          </View>
          <View style={localStyles.progressBar}>
            <View style={[localStyles.progressFill, { width: `${Math.min(profile.satiety, 100)}%` }]} />
          </View>
        </View>

        {/* 羈絆等級 */}
        <View style={localStyles.statCard}>
          <View style={localStyles.statHeader}>
            <Ionicons name="ribbon-outline" size={20} color={MibuBrand.copper} />
            <Text style={localStyles.statTitle}>{t.mini_bondLevel}</Text>
            <Text style={localStyles.statValue}>Lv.{profile.bondLevel}</Text>
          </View>
        </View>

        {/* 成長階段 */}
        <View style={localStyles.statCard}>
          <View style={localStyles.statHeader}>
            <Ionicons name="trending-up-outline" size={20} color={MibuBrand.copper} />
            <Text style={localStyles.statTitle}>{t.mini_growthStage}</Text>
            <Text style={localStyles.statValue}>{getStageLabel(profile.growthStage)}</Text>
          </View>
        </View>

        {/* 功能入口 */}
        <View style={localStyles.actionSection}>
          <TouchableOpacity style={localStyles.actionCard} onPress={() => router.push('/mini-nurture' as any)}>
            <Ionicons name="restaurant-outline" size={24} color={MibuBrand.copper} />
            <Text style={localStyles.actionLabel}>{(t as Record<string, string>).mini_nurtureTitle || '養成'}</Text>
            <Ionicons name="chevron-forward" size={18} color={MibuBrand.brownLight} />
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionCard} onPress={() => router.push('/mini-explore' as any)}>
            <Ionicons name="compass-outline" size={24} color={MibuBrand.copper} />
            <Text style={localStyles.actionLabel}>{(t as Record<string, string>).mini_exploreTitle || '探索'}</Text>
            <Ionicons name="chevron-forward" size={18} color={MibuBrand.brownLight} />
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionCard} onPress={() => router.push('/mini-sub-cats' as any)}>
            <Ionicons name="paw-outline" size={24} color={MibuBrand.copper} />
            <Text style={localStyles.actionLabel}>{(t as Record<string, string>).mini_subCatTitle || '副貓圖鑑'}</Text>
            <Ionicons name="chevron-forward" size={18} color={MibuBrand.brownLight} />
          </TouchableOpacity>
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
    paddingBottom: 100,
  },

  // 名字卡片
  nameCard: {
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameText: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameInput: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.lg,
    color: MibuBrand.brownDark,
    borderWidth: 1,
    borderColor: MibuBrand.brown,
    minWidth: 160,
  },
  nameActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageLabel: {
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
    marginTop: Spacing.sm,
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

  // 心情
  moodDisplay: {
    fontSize: FontSize.xxl,
    marginTop: Spacing.sm,
    color: MibuBrand.brownDark,
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

  // 功能入口
  actionSection: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  actionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  actionLabel: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600' as const,
    color: MibuBrand.brownDark,
  },
});
