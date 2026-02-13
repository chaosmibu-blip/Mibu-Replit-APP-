/**
 * ============================================================
 * MailboxDetailScreen — 信箱詳情頁面 (#045)
 * ============================================================
 * 此模組提供: 單一信箱項目的完整獎勵內容 + 領取功能
 *
 * 主要功能:
 * - 顯示完整獎勵清單（coins, shop_item, coupon 等）
 * - 領取按鈕（未領取狀態）
 * - 自動標記已讀（進入頁面即觸發）
 *
 * 更新日期：2026-02-12（Phase 3 遷移至 React Query）
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useI18n, useGacha } from '../../../context/AppContext';
import { useMailboxDetail, useClaimItem } from '../../../hooks/useMailboxQueries';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import type { MailboxDetailItem } from '../../../types/mailbox';
import type { RewardPayload } from '../../../types/rules';

// ========== 常數 ==========

/** 來源類型對應翻譯 key */
const SOURCE_LABEL_MAP: Record<string, string> = {
  promo_code: 'mailbox_sourcePromo',
  admin: 'mailbox_sourceAdmin',
  system: 'mailbox_sourceSystem',
  event: 'mailbox_sourceEvent',
};

/** 獎勵類型對應 icon */
const REWARD_ICON_MAP: Record<string, string> = {
  coins: 'wallet-outline',
  shop_item: 'bag-outline',
  inventory_coupon: 'ticket-outline',
  place_pack: 'map-outline',
  place_pack_curated: 'compass-outline',
  perk: 'star-outline',
};

// ========== 元件 ==========

export function MailboxDetailScreen() {
  const { t } = useI18n();
  const { refreshUnreadCount } = useGacha();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // ========== React Query 資料查詢 ==========

  const numericId = id ? Number(id) : null;
  const detailQuery = useMailboxDetail(numericId);
  const claimMutation = useClaimItem();

  // 衍生狀態
  // 防護後端回傳格式不符（教訓 #010）
  const item = detailQuery.data?.item ?? null;
  const loading = detailQuery.isLoading;
  const claiming = claimMutation.isPending;

  // ========== 安全導航（deep link 可能無歷史堆疊） ==========

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile' as any);
    }
  }, [router]);

  // ========== 領取 ==========

  const handleClaim = useCallback(() => {
    if (claiming || !item) return;

    claimMutation.mutate(item.id, {
      onSuccess: (result) => {
        if (result.partial) {
          Alert.alert(t.mailbox_claimPartial);
        } else {
          Alert.alert(t.mailbox_claimSuccess);
        }
        // 刷新全域未讀計數
        refreshUnreadCount();
      },
      onError: () => {
        Alert.alert(t.mailbox_claimFailed);
      },
    });
  }, [item, claiming, claimMutation, t, refreshUnreadCount]);

  // ========== 獎勵渲染 ==========

  const renderReward = (reward: RewardPayload, index: number) => {
    const iconName = REWARD_ICON_MAP[reward.type] || 'gift-outline';
    let label = '';
    let detail = '';

    switch (reward.type) {
      case 'coins':
        label = t.mailbox_rewardCoins.replace('{amount}', String(reward.amount ?? ''));
        break;
      case 'shop_item':
        label = t.mailbox_rewardItem;
        detail = reward.itemName ?? reward.itemCode ?? '';
        break;
      case 'inventory_coupon':
        label = t.mailbox_rewardCoupon;
        detail = reward.itemName ?? reward.itemCode ?? '';
        break;
      case 'place_pack':
        label = t.mailbox_rewardPlacePack;
        detail = reward.packCode ?? '';
        break;
      case 'place_pack_curated':
        label = t.mailbox_rewardPlacePack;
        detail = reward.placeIds ? `${reward.placeIds.length} places` : '';
        break;
      case 'perk':
        label = t.mailbox_rewardPerk;
        detail = reward.perkType ?? '';
        break;
      default:
        label = reward.type;
    }

    const isPlacePack = reward.type === 'place_pack' || reward.type === 'place_pack_curated';

    return (
      <View key={index} style={styles.rewardRow}>
        <View style={styles.rewardIcon}>
          {isPlacePack ? (
            <Image source={{ uri: 'https://res.cloudinary.com/dgts6a89y/image/upload/v1771009434/mibu/items/%E5%8D%B7%E8%BB%B8.png' }} style={{ width: 24, height: 24 }} resizeMode="contain" />
          ) : (
            <Ionicons name={iconName as any} size={20} color={MibuBrand.copper} />
          )}
        </View>
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardLabel}>{label}</Text>
          {detail ? <Text style={styles.rewardDetail}>{detail}</Text> : null}
        </View>
      </View>
    );
  };

  // ========== Loading ==========

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={MibuBrand.brown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.mailbox_title}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MibuBrand.brown} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={MibuBrand.brown} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.mailbox_title}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={MibuBrand.error} />
          <Text style={styles.errorText}>{t.mailbox_loadFailed}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ========== 主畫面 ==========

  const isUnclaimed = item.status === 'unclaimed';
  const isExpired = item.status === 'expired';
  const sourceKey = SOURCE_LABEL_MAP[item.sourceType];
  const sourceLabel = item.sourceLabel || (sourceKey ? t[sourceKey] : item.sourceType);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brown} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.mailbox_title}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 標題區 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceBadgeText}>{sourceLabel}</Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {/* 狀態 */}
          {item.status === 'claimed' && item.claimedAt && (
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={16} color={MibuBrand.success} />
              <Text style={styles.statusText}>
                {t.mailbox_claimed} · {new Date(item.claimedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          {isExpired && (
            <View style={styles.statusRow}>
              <Ionicons name="time-outline" size={16} color={MibuBrand.error} />
              <Text style={[styles.statusText, { color: MibuBrand.error }]}>
                {t.mailbox_expired}
              </Text>
            </View>
          )}
          {item.expiresAt && isUnclaimed && (
            <View style={styles.statusRow}>
              <Ionicons name="time-outline" size={16} color={MibuBrand.warning} />
              <Text style={[styles.statusText, { color: MibuBrand.warning }]}>
                {t.mailbox_expiresAt.replace('{date}', new Date(item.expiresAt).toLocaleDateString())}
              </Text>
            </View>
          )}
        </View>

        {/* 內文 */}
        {item.body && (
          <View style={styles.bodySection}>
            <Text style={styles.bodyText}>{item.body}</Text>
          </View>
        )}

        {/* 獎勵清單 */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>{t.mailbox_rewards}</Text>
          {item.rewards.map((reward, idx) => renderReward(reward, idx))}
        </View>
      </ScrollView>

      {/* 底部領取按鈕 */}
      {isUnclaimed && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.claimButton, claiming && styles.claimButtonDisabled]}
            onPress={handleClaim}
            disabled={claiming}
          >
            {claiming ? (
              <ActivityIndicator size="small" color={UIColors.white} />
            ) : (
              <>
                <Ionicons name="gift-outline" size={20} color={UIColors.white} />
                <Text style={styles.claimButtonText}>{t.mailbox_claim}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ========== 樣式 ==========

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  flex1: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
    color: MibuBrand.brown,
  },
  headerRight: {
    width: 40,
  },

  // Loading / Error
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.md,
    color: UIColors.textSecondary,
  },

  // 內容
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  // 標題區
  titleSection: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sourceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.xs,
    backgroundColor: MibuBrand.creamLight,
  },
  sourceBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: MibuBrand.brownLight,
  },
  dateText: {
    fontSize: FontSize.xs,
    color: UIColors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  statusText: {
    fontSize: FontSize.sm,
    color: MibuBrand.success,
  },

  // 內文
  bodySection: {
    marginBottom: Spacing.xl,
  },
  bodyText: {
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    lineHeight: 22,
  },

  // 獎勵區
  rewardsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.md,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UIColors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  rewardDetail: {
    fontSize: FontSize.sm,
    color: UIColors.textSecondary,
    marginTop: 2,
  },

  // 底部領取
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxl,
    backgroundColor: MibuBrand.warmWhite,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.creamLight,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: MibuBrand.brown,
  },
  claimButtonDisabled: {
    opacity: 0.6,
  },
  claimButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: UIColors.white,
  },
});
