/**
 * CrowdfundingScreen - 眾籌活動列表
 * 顯示募資活動、進度、參與紀錄
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { crowdfundingApi } from '../../../services/crowdfundingApi';
import { MibuBrand } from '../../../../constants/Colors';
import { Campaign, CampaignStatus, MyContribution } from '../../../types/crowdfunding';

const STATUS_CONFIG: Record<CampaignStatus, { label: { zh: string; en: string }; color: string; bg: string }> = {
  upcoming: { label: { zh: '即將開始', en: 'Upcoming' }, color: '#6366f1', bg: '#EEF2FF' },
  active: { label: { zh: '進行中', en: 'Active' }, color: '#059669', bg: '#ECFDF5' },
  completed: { label: { zh: '已結束', en: 'Completed' }, color: '#6b7280', bg: '#F3F4F6' },
  cancelled: { label: { zh: '已取消', en: 'Cancelled' }, color: '#dc2626', bg: '#FEF2F2' },
};

type TabType = 'active' | 'upcoming' | 'completed' | 'my';

export function CrowdfundingScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myContributions, setMyContributions] = useState<MyContribution[]>([]);
  const [totalContributed, setTotalContributed] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      if (activeTab === 'my') {
        const data = await crowdfundingApi.getMyContributions(token);
        setMyContributions(data.contributions);
        setTotalContributed(data.totalAmount);
      } else {
        const status = activeTab === 'completed' ? 'completed' : activeTab;
        const data = await crowdfundingApi.getCampaigns(token, { status });
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Failed to load crowdfunding data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router, activeTab]);

  useEffect(() => {
    setLoading(true);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isZh ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderCampaignCard = (campaign: Campaign) => {
    const progress = calculateProgress(campaign.currentAmount, campaign.targetAmount);
    const statusConfig = STATUS_CONFIG[campaign.status];

    return (
      <TouchableOpacity
        key={campaign.id}
        style={styles.campaignCard}
        onPress={() => router.push(`/crowdfunding/${campaign.id}` as any)}
        activeOpacity={0.7}
      >
        {campaign.imageUrl ? (
          <Image source={{ uri: campaign.imageUrl }} style={styles.campaignImage} />
        ) : (
          <View style={[styles.campaignImage, styles.campaignImagePlaceholder]}>
            <Ionicons name="rocket" size={32} color={MibuBrand.tan} />
          </View>
        )}

        <View style={styles.campaignContent}>
          <View style={styles.campaignHeader}>
            <Text style={styles.campaignTitle} numberOfLines={2}>
              {campaign.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label[isZh ? 'zh' : 'en']}
              </Text>
            </View>
          </View>

          <Text style={styles.campaignDesc} numberOfLines={2}>
            {campaign.description}
          </Text>

          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressAmount}>
                {formatCurrency(campaign.currentAmount)}
              </Text>
              <Text style={styles.progressTarget}>
                / {formatCurrency(campaign.targetAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.campaignMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={14} color={MibuBrand.copper} />
              <Text style={styles.metaText}>
                {campaign.contributorCount} {isZh ? '人參與' : 'backers'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color={MibuBrand.copper} />
              <Text style={styles.metaText}>
                {formatDate(campaign.endDate)} {isZh ? '截止' : 'ends'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMyContribution = (contribution: MyContribution) => {
    const statusColors = {
      pending: { bg: '#FEF3C7', text: '#D97706' },
      verified: { bg: '#D1FAE5', text: '#059669' },
      failed: { bg: '#FEE2E2', text: '#DC2626' },
    };
    const colors = statusColors[contribution.status];

    return (
      <View key={contribution.id} style={styles.contributionCard}>
        <View style={styles.contributionHeader}>
          <Text style={styles.contributionTitle} numberOfLines={1}>
            {contribution.campaignTitle}
          </Text>
          <View style={[styles.contributionStatus, { backgroundColor: colors.bg }]}>
            <Text style={[styles.contributionStatusText, { color: colors.text }]}>
              {contribution.status === 'pending' && (isZh ? '處理中' : 'Pending')}
              {contribution.status === 'verified' && (isZh ? '已確認' : 'Verified')}
              {contribution.status === 'failed' && (isZh ? '失敗' : 'Failed')}
            </Text>
          </View>
        </View>
        <View style={styles.contributionDetails}>
          <Text style={styles.contributionAmount}>
            {formatCurrency(contribution.amount)}
          </Text>
          {contribution.rewardTier && (
            <View style={styles.rewardBadge}>
              <Ionicons name="gift" size={12} color={MibuBrand.brown} />
              <Text style={styles.rewardText}>{contribution.rewardTier}</Text>
            </View>
          )}
        </View>
        <Text style={styles.contributionDate}>
          {new Date(contribution.createdAt).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isZh ? '募資活動' : 'Crowdfunding'}
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['active', 'upcoming', 'completed', 'my'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'active' && (isZh ? '進行中' : 'Active')}
              {tab === 'upcoming' && (isZh ? '即將' : 'Soon')}
              {tab === 'completed' && (isZh ? '已結束' : 'Ended')}
              {tab === 'my' && (isZh ? '我的' : 'Mine')}
            </Text>
          </TouchableOpacity>
        ))}
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
        {activeTab === 'my' ? (
          <>
            {/* My Stats */}
            <View style={styles.statsCard}>
              <Ionicons name="heart" size={28} color={MibuBrand.brown} />
              <View style={styles.statsInfo}>
                <Text style={styles.statsLabel}>
                  {isZh ? '累計贊助' : 'Total Contributed'}
                </Text>
                <Text style={styles.statsAmount}>
                  {formatCurrency(totalContributed)}
                </Text>
              </View>
            </View>

            {myContributions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={48} color={MibuBrand.tan} />
                <Text style={styles.emptyText}>
                  {isZh ? '尚未參與任何募資' : 'No contributions yet'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => setActiveTab('active')}
                >
                  <Text style={styles.emptyButtonText}>
                    {isZh ? '查看進行中的活動' : 'View active campaigns'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.contributionsList}>
                {myContributions.map(renderMyContribution)}
              </View>
            )}
          </>
        ) : (
          <>
            {campaigns.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="rocket-outline" size={48} color={MibuBrand.tan} />
                <Text style={styles.emptyText}>
                  {activeTab === 'active' && (isZh ? '目前沒有進行中的活動' : 'No active campaigns')}
                  {activeTab === 'upcoming' && (isZh ? '目前沒有即將開始的活動' : 'No upcoming campaigns')}
                  {activeTab === 'completed' && (isZh ? '目前沒有已結束的活動' : 'No completed campaigns')}
                </Text>
              </View>
            ) : (
              <View style={styles.campaignsList}>
                {campaigns.map(renderCampaignCard)}
              </View>
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: MibuBrand.warmWhite,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: MibuBrand.creamLight,
  },
  tabActive: {
    backgroundColor: MibuBrand.brown,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    marginBottom: 16,
  },
  statsInfo: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 4,
  },
  statsAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },
  campaignsList: {
    gap: 16,
  },
  campaignCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  campaignImage: {
    width: '100%',
    height: 140,
    backgroundColor: MibuBrand.cream,
  },
  campaignImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignContent: {
    padding: 16,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  campaignTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  campaignDesc: {
    fontSize: 13,
    color: MibuBrand.copper,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: MibuBrand.brown,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  progressTarget: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginLeft: 4,
  },
  campaignMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: MibuBrand.copper,
  },
  contributionsList: {
    gap: 12,
  },
  contributionCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  contributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contributionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginRight: 8,
  },
  contributionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  contributionStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  contributionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  contributionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  contributionDate: {
    fontSize: 12,
    color: MibuBrand.tan,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: MibuBrand.tan,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomSpacer: {
    height: 100,
  },
});
