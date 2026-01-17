/**
 * CrowdfundingDetailScreen - 眾籌活動詳情
 * 顯示活動詳情、獎勵階層、更新、參與按鈕
 *
 * @see 後端合約: contracts/APP.md Phase 5
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { crowdfundingApi } from '../../../services/crowdfundingApi';
import { MibuBrand } from '../../../../constants/Colors';
import { CampaignDetail, CampaignReward, CampaignUpdate } from '../../../types/crowdfunding';

export function CrowdfundingDetailScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [selectedTier, setSelectedTier] = useState<CampaignReward | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      const data = await crowdfundingApi.getCampaignDetail(token, id);
      setCampaign(data);
    } catch (error) {
      console.error('Failed to load campaign detail:', error);
      Alert.alert(
        isZh ? '錯誤' : 'Error',
        isZh ? '無法載入活動詳情' : 'Failed to load campaign details'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, getToken, router, isZh]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const formatCurrency = (amount: number) => {
    return `NT$ ${amount.toLocaleString()}`;
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const handleContribute = async () => {
    if (!selectedTier) {
      Alert.alert(
        isZh ? '請選擇方案' : 'Select a Tier',
        isZh ? '請先選擇要贊助的方案' : 'Please select a reward tier first'
      );
      return;
    }

    // IAP flow would be implemented here
    Alert.alert(
      isZh ? '功能開發中' : 'Coming Soon',
      isZh ? 'In-App Purchase 功能即將推出' : 'In-App Purchase feature coming soon'
    );
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
              ? (isZh ? '已額滿' : 'Sold Out')
              : (isZh ? `剩餘 ${reward.remaining} 名` : `${reward.remaining} left`)}
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
        {new Date(update.createdAt).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}
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
          {isZh ? '找不到活動' : 'Campaign not found'}
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{isZh ? '返回' : 'Go Back'}</Text>
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
          <Image source={{ uri: campaign.imageUrl }} style={styles.coverImage} />
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
                {isZh ? '已募集' : 'Raised'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{campaign.contributorCount}</Text>
              <Text style={styles.statLabel}>
                {isZh ? '位贊助者' : 'Backers'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{daysLeft}</Text>
              <Text style={styles.statLabel}>
                {isZh ? '天剩餘' : 'Days Left'}
              </Text>
            </View>
          </View>

          <Text style={styles.targetText}>
            {isZh ? '目標：' : 'Goal: '}{formatCurrency(campaign.targetAmount)}
            {' '}({Math.round(progress)}%)
          </Text>

          {campaign.myContribution && (
            <View style={styles.myContributionBadge}>
              <Ionicons name="heart" size={16} color={MibuBrand.brown} />
              <Text style={styles.myContributionText}>
                {isZh ? '您已贊助 ' : 'You backed '}
                {formatCurrency(campaign.myContribution)}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isZh ? '活動介紹' : 'About'}
          </Text>
          <Text style={styles.description}>{campaign.description}</Text>
        </View>

        {/* Reward Tiers */}
        {campaign.rewards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isZh ? '贊助方案' : 'Reward Tiers'}
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
              {isZh ? '最新動態' : 'Updates'} ({campaign.updates.length})
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
            style={[styles.contributeButton, !selectedTier && styles.contributeButtonDisabled]}
            onPress={handleContribute}
          >
            <Ionicons name="heart" size={20} color="#ffffff" />
            <Text style={styles.contributeButtonText}>
              {selectedTier
                ? (isZh ? `贊助 ${formatCurrency(selectedTier.minAmount)}` : `Back ${formatCurrency(selectedTier.minAmount)}`)
                : (isZh ? '選擇贊助方案' : 'Select a Tier')}
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
    color: '#ffffff',
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
    color: '#ffffff',
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
    color: 'rgba(255,255,255,0.85)',
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
    color: '#ffffff',
  },
});
