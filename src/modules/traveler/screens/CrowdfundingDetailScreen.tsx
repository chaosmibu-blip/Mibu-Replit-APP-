/**
 * CrowdfundingDetailScreen - 眾籌活動詳情畫面
 *
 * 功能：
 * - 顯示募資活動詳細資訊（標題、描述、目標金額、進度）
 * - 顯示獎勵階層列表（可選擇贊助方案）
 * - 顯示活動更新動態
 * - 參與贊助（整合 RevenueCat IAP）
 * - 剩餘天數倒數
 * - 贊助者人數統計
 *
 * 串接 API：
 * - crowdfundingApi.getCampaignDetail() - 取得活動詳情
 * - crowdfundingApi.contribute() - 記錄贊助
 * - revenueCatService.purchasePackage() - IAP 購買
 *
 * @see 後端合約: contracts/APP.md Phase 5
 *
 * 更新日期：2026-02-12（Phase 3 遷移至 React Query）
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth, useI18n } from '../../../context/AppContext';
import { tFormat } from '../../../utils/i18n';
import { LOCALE_MAP } from '../../../utils/i18n';
import { useCampaignDetail, useContribute } from '../../../hooks/useCrowdfundingQueries';
import { revenueCatService } from '../../../services/revenueCatService';
import { MibuBrand } from '../../../../constants/Colors';
import { Image as ExpoImage } from 'expo-image';
import { CampaignDetail, CampaignReward, CampaignUpdate } from '../../../types/crowdfunding';

// ============================================================
// 主元件
// ============================================================

export function CrowdfundingDetailScreen() {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  // 從路由參數取得活動 ID
  const { id } = useLocalSearchParams<{ id: string }>();

  // React Query：活動詳情 + 贊助 mutation
  const detailQuery = useCampaignDetail(id ?? null);
  const contributeMutation = useContribute();

  // 從 React Query 衍生狀態
  const campaign = detailQuery.data ?? null;
  const loading = detailQuery.isLoading;
  const refreshing = detailQuery.isFetching && !detailQuery.isLoading;

  // ============================================================
  // 狀態管理（UI 狀態）
  // ============================================================

  // 購買中狀態
  const [purchasing, setPurchasing] = useState(false);

  // 選中的贊助方案
  const [selectedTier, setSelectedTier] = useState<CampaignReward | null>(null);

  /**
   * 下拉重新整理：React Query invalidate
   */
  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['crowdfunding', 'campaign', id] });
  };

  // ============================================================
  // 輔助函數
  // ============================================================

  /**
   * 格式化金額
   */
  const formatCurrency = (amount: number) => {
    return `NT$ ${amount.toLocaleString()}`;
  };

  /**
   * 計算進度百分比
   */
  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  /**
   * 計算剩餘天數
   */
  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  // ============================================================
  // 事件處理
  // ============================================================

  /**
   * 處理贊助
   * 1. 初始化 RevenueCat
   * 2. 取得 IAP 商品
   * 3. 執行購買
   * 4. 記錄贊助到後端
   */
  const handleContribute = async () => {
    if (!selectedTier) {
      Alert.alert(
        t.crowdfunding_selectTier,
        t.crowdfunding_selectTierDesc
      );
      return;
    }

    try {
      setPurchasing(true);

      // 1. 初始化 RevenueCat（如果尚未初始化）
      await revenueCatService.configure(user?.id);

      // 2. 取得可購買的商品列表
      const offerings = await revenueCatService.getOfferings();

      if (offerings.length === 0) {
        // 開發模式：顯示模擬購買流程
        Alert.alert(
          t.crowdfunding_testMode,
          tFormat(t.crowdfunding_testModeDesc, { tier: selectedTier.tier, amount: formatCurrency(selectedTier.minAmount) }),
          [
            { text: t.cancel, style: 'cancel' },
            {
              text: t.crowdfunding_simulateSuccess,
              onPress: async () => {
                // 模擬購買成功後通知後端（使用 mutation hook）
                try {
                  if (campaign) {
                    await contributeMutation.mutateAsync({
                      campaignId: campaign.id,
                      amount: selectedTier.minAmount,
                      rewardTier: selectedTier.tier,
                      // 測試模式使用假的交易 ID
                      transactionId: `test_${Date.now()}`,
                    });

                    Alert.alert(
                      t.crowdfunding_thankYou,
                      t.crowdfunding_thankYouDesc,
                      [{ text: 'OK', onPress: () => detailQuery.refetch() }]
                    );
                  }
                } catch (error) {
                  console.error('Failed to record contribution:', error);
                }
              },
            },
          ]
        );
        return;
      }

      // 3. 找到對應價格的商品（根據 tier 名稱或金額匹配）
      const matchingPackage = offerings.find(pkg => {
        // 可以根據商品 ID 或價格來匹配
        return pkg.product.price === selectedTier.minAmount;
      }) || offerings[0]; // fallback 到第一個商品

      // 4. 執行購買
      const result = await revenueCatService.purchase(matchingPackage);

      if (result.success) {
        // 5. 購買成功，通知後端記錄（使用 mutation hook）
        if (campaign) {
          await contributeMutation.mutateAsync({
            campaignId: campaign.id,
            amount: selectedTier.minAmount,
            rewardTier: selectedTier.tier,
            // RevenueCat 會自動通過 Webhook 通知後端
          });
        }

        Alert.alert(
          t.crowdfunding_thankYou,
          t.crowdfunding_thankYouDescFull,
          [{ text: 'OK', onPress: () => detailQuery.refetch() }]
        );
      } else if (result.error === 'USER_CANCELLED') {
        // 用戶取消，不顯示錯誤
        // 用戶取消購買，不需處理
      } else {
        Alert.alert(
          t.crowdfunding_purchaseFailed,
          t.crowdfunding_purchaseFailedDesc,
        );
      }
    } catch (error) {
      console.error('IAP error:', error);
      Alert.alert(
        t.common_error,
        t.crowdfunding_purchaseError,
      );
    } finally {
      setPurchasing(false);
    }
  };

  const renderRewardTier = (reward: CampaignReward, index: number) => {
    const isSelected = selectedTier?.tier === reward.tier;
    const isSoldOut = reward.remaining !== null && reward.remaining <= 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.rewardCard,
          isSelected && styles.rewardCardSelected,
          isSoldOut && styles.rewardCardSoldOut,
        ]}
        onPress={() => !isSoldOut && setSelectedTier(reward)}
        disabled={isSoldOut}
        activeOpacity={0.7}
      >
        <View style={styles.rewardHeader}>
          <Text style={[styles.rewardTier, isSelected && styles.rewardTierSelected]}>
            {reward.tier}
          </Text>
          <Text style={[styles.rewardMin, isSelected && styles.rewardMinSelected]}>
            {formatCurrency(reward.minAmount)} +
          </Text>
        </View>
        <Text style={[styles.rewardDesc, isSelected && styles.rewardDescSelected]}>
          {reward.description}
        </Text>
        {reward.remaining !== null && (
          <Text style={styles.rewardRemaining}>
            {isSoldOut
              ? t.crowdfunding_soldOut
              : tFormat(t.crowdfunding_remaining, { count: reward.remaining })}
          </Text>
        )}
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={20} color={MibuBrand.warmWhite} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderUpdate = (update: CampaignUpdate) => (
    <View key={update.id} style={styles.updateCard}>
      <Text style={styles.updateTitle}>{update.title}</Text>
      <Text style={styles.updateContent}>{update.content}</Text>
      <Text style={styles.updateDate}>
        {new Date(update.createdAt).toLocaleDateString(LOCALE_MAP[language])}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  if (!campaign) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={MibuBrand.error} />
        <Text style={styles.errorText}>
          {t.crowdfunding_notFound}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{t.crowdfunding_goBack}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = calculateProgress(campaign.currentAmount, campaign.targetAmount);
  const daysLeft = calculateDaysLeft(campaign.endDate);
  const isActive = campaign.status === 'active';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {campaign.title}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MibuBrand.brown}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        {campaign.imageUrl ? (
          <ExpoImage source={{ uri: campaign.imageUrl }} style={styles.coverImage} contentFit="cover" />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder]}>
            <Ionicons name="rocket" size={48} color={MibuBrand.tan} />
          </View>
        )}

        {/* Progress Section */}
        <View style={styles.progressCard}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(campaign.currentAmount)}</Text>
              <Text style={styles.statLabel}>
                {t.crowdfunding_raised}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{campaign.contributorCount}</Text>
              <Text style={styles.statLabel}>
                {t.crowdfunding_backers}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{daysLeft}</Text>
              <Text style={styles.statLabel}>
                {t.crowdfunding_daysLeft}
              </Text>
            </View>
          </View>

          <Text style={styles.targetText}>
            {t.crowdfunding_goal}{formatCurrency(campaign.targetAmount)}
            {' '}({Math.round(progress)}%)
          </Text>

          {campaign.myContribution && (
            <View style={styles.myContributionBadge}>
              <Ionicons name="heart" size={16} color={MibuBrand.brown} />
              <Text style={styles.myContributionText}>
                {t.crowdfunding_youBacked}
                {formatCurrency(campaign.myContribution)}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t.crowdfunding_about}
          </Text>
          <Text style={styles.description}>{campaign.description}</Text>
        </View>

        {/* Reward Tiers */}
        {campaign.rewards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t.crowdfunding_rewardTiers}
            </Text>
            <View style={styles.rewardsList}>
              {campaign.rewards.map(renderRewardTier)}
            </View>
          </View>
        )}

        {/* Updates */}
        {campaign.updates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t.crowdfunding_updates} ({campaign.updates.length})
            </Text>
            <View style={styles.updatesList}>
              {campaign.updates.map(renderUpdate)}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action */}
      {isActive && (
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={[
              styles.contributeButton,
              (!selectedTier || purchasing) && styles.contributeButtonDisabled
            ]}
            onPress={handleContribute}
            disabled={!selectedTier || purchasing}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
            ) : (
              <Ionicons name="heart" size={20} color={MibuBrand.warmWhite} />
            )}
            <Text style={styles.contributeButtonText}>
              {purchasing
                ? t.crowdfunding_processing
                : selectedTier
                  ? tFormat(t.crowdfunding_backAmount, { amount: formatCurrency(selectedTier.minAmount) })
                  : t.crowdfunding_selectATier}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: MibuBrand.copper,
    marginTop: 12,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  coverImage: {
    width: '100%',
    height: 200,
    backgroundColor: MibuBrand.cream,
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    backgroundColor: MibuBrand.warmWhite,
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: MibuBrand.brown,
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },
  statLabel: {
    fontSize: 12,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: MibuBrand.tanLight,
  },
  targetText: {
    fontSize: 13,
    color: MibuBrand.copper,
    textAlign: 'center',
  },
  myContributionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: MibuBrand.highlight,
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  myContributionText: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: MibuBrand.brownDark,
    lineHeight: 22,
  },
  rewardsList: {
    gap: 12,
  },
  rewardCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    position: 'relative',
  },
  rewardCardSelected: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  rewardCardSoldOut: {
    opacity: 0.5,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardTier: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  rewardTierSelected: {
    color: MibuBrand.warmWhite,
  },
  rewardMin: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  rewardMinSelected: {
    color: MibuBrand.highlight,
  },
  rewardDesc: {
    fontSize: 14,
    color: MibuBrand.copper,
    lineHeight: 20,
  },
  rewardDescSelected: {
    color: MibuBrand.creamLight,
  },
  rewardRemaining: {
    fontSize: 12,
    color: MibuBrand.tan,
    marginTop: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  updatesList: {
    gap: 12,
  },
  updateCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 6,
  },
  updateContent: {
    fontSize: 13,
    color: MibuBrand.copper,
    lineHeight: 18,
    marginBottom: 8,
  },
  updateDate: {
    fontSize: 11,
    color: MibuBrand.tan,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: MibuBrand.warmWhite,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 16,
    borderRadius: 14,
  },
  contributeButtonDisabled: {
    backgroundColor: MibuBrand.tan,
  },
  contributeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
});
