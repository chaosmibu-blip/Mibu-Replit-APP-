/**
 * CrowdfundingScreen - 全球探索地圖畫面
 *
 * 功能：
 * - 顯示各地區解鎖狀態（已解鎖、募資中、即將開放、敬請期待）
 * - 各地區募資進度
 * - 我的贊助記錄
 * - 點擊募資中地區跳轉至詳情頁
 * - 統計數據卡片（已解鎖/募資中/即將開放數量）
 *
 * 串接 API：
 * - crowdfundingApi.getCampaigns() - 取得募資活動列表
 * - crowdfundingApi.getMyContributions() - 取得我的贊助記錄
 *
 * @see 後端合約: contracts/APP.md Phase 5
 *
 * 更新日期：2026-02-12（Phase 3 遷移至 React Query）
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../../../context/AppContext';
import { useCampaigns, useMyContributions } from '../../../hooks/useCrowdfundingQueries';
import { MibuBrand, UIColors, SemanticColors } from '../../../../constants/Colors';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { Campaign, MyContribution } from '../../../types/crowdfunding';

// ============================================================
// 常數定義
// ============================================================

/**
 * 地區狀態類型
 * - unlocked: 已解鎖（可使用）
 * - fundraising: 募資中
 * - coming_soon: 即將開放
 * - stay_tuned: 敬請期待
 */
type RegionStatus = 'unlocked' | 'fundraising' | 'coming_soon' | 'stay_tuned';

/**
 * 地區資料結構
 */
interface Region {
  id: string;                           // 地區 ID
  name: { zh: string; en: string };     // 地區名稱（中/英）
  flag: string;                         // 國旗 emoji
  status: RegionStatus;                 // 狀態
  progress?: number;                    // 募資進度 0-100
  campaignId?: string;                  // 關聯的募資活動 ID
}

/**
 * 地區資料（模擬資料）
 * 注意：實際應從後端 API 取得
 */
const REGIONS: Region[] = [
  { id: 'tw', name: { zh: '台灣', en: 'Taiwan' }, flag: '🇹🇼', status: 'unlocked' },
  { id: 'jp', name: { zh: '日本', en: 'Japan' }, flag: '🇯🇵', status: 'fundraising', progress: 68 },
  { id: 'kr', name: { zh: '韓國', en: 'South Korea' }, flag: '🇰🇷', status: 'coming_soon' },
  { id: 'th', name: { zh: '泰國', en: 'Thailand' }, flag: '🇹🇭', status: 'stay_tuned' },
  { id: 'vn', name: { zh: '越南', en: 'Vietnam' }, flag: '🇻🇳', status: 'stay_tuned' },
  { id: 'sg', name: { zh: '新加坡', en: 'Singapore' }, flag: '🇸🇬', status: 'stay_tuned' },
  { id: 'my', name: { zh: '馬來西亞', en: 'Malaysia' }, flag: '🇲🇾', status: 'stay_tuned' },
  { id: 'ph', name: { zh: '菲律賓', en: 'Philippines' }, flag: '🇵🇭', status: 'stay_tuned' },
  { id: 'id', name: { zh: '印尼', en: 'Indonesia' }, flag: '🇮🇩', status: 'stay_tuned' },
  { id: 'hk', name: { zh: '香港', en: 'Hong Kong' }, flag: '🇭🇰', status: 'stay_tuned' },
];

/**
 * 狀態視覺配置
 * - label: 狀態標籤（中/英）
 * - color: 文字色
 * - bg: 背景色
 * - icon: 狀態圖示
 */
const STATUS_CONFIG: Record<RegionStatus, {
  labelKey: string;
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  unlocked: {
    labelKey: 'crowdfunding_statusUnlocked',
    color: SemanticColors.successDark,
    bg: SemanticColors.successLight,
    icon: 'checkmark-circle',
  },
  fundraising: {
    labelKey: 'crowdfunding_statusFundraising',
    color: MibuBrand.info,
    bg: SemanticColors.infoLight,
    icon: 'trending-up',
  },
  coming_soon: {
    labelKey: 'crowdfunding_statusComingSoon',
    color: SemanticColors.warningDark,
    bg: SemanticColors.warningLight,
    icon: 'time-outline',
  },
  stay_tuned: {
    labelKey: 'crowdfunding_statusStayTuned',
    color: UIColors.textSecondary,
    bg: MibuBrand.creamLight,
    icon: 'sparkles-outline',
  },
};

// ============================================================
// 主元件
// ============================================================

export function CrowdfundingScreen() {
  const { t, language } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  // React Query：募資活動列表 + 個人贊助記錄
  const campaignsQuery = useCampaigns({ status: 'active' });
  const contributionsQuery = useMyContributions();

  // 從 React Query 衍生狀態
  const campaigns = campaignsQuery.data?.campaigns ?? [];
  const myContributions = contributionsQuery.data?.contributions ?? [];
  const loading = campaignsQuery.isLoading;
  const refreshing = (campaignsQuery.isFetching || contributionsQuery.isFetching) && !loading;

  // 地區列表（目前使用靜態資料，TODO: 從 API 取得）
  const [regions] = useState<Region[]>(REGIONS);

  // ============================================================
  // 計算衍生數據
  // ============================================================

  // 各狀態地區統計
  const stats = {
    unlocked: regions.filter(r => r.status === 'unlocked').length,
    fundraising: regions.filter(r => r.status === 'fundraising').length,
    coming: regions.filter(r => r.status === 'coming_soon').length,
  };

  // 下拉重新整理：React Query invalidate
  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['crowdfunding'] });
  }, [queryClient]);

  const handleRegionPress = (region: Region) => {
    if (region.status === 'fundraising' && region.campaignId) {
      router.push(`/crowdfunding/${region.campaignId}` as any);
    }
    // 其他狀態可以顯示地區資訊或提示
  };

  const renderRegionCard = (region: Region) => {
    const config = STATUS_CONFIG[region.status];
    const isFundraising = region.status === 'fundraising';

    return (
      <TouchableOpacity
        key={region.id}
        style={styles.regionCard}
        onPress={() => handleRegionPress(region)}
        activeOpacity={region.status === 'fundraising' ? 0.7 : 1}
      >
        <View style={styles.regionLeft}>
          <Text style={styles.regionFlag}>{region.flag}</Text>
          <View style={styles.regionInfo}>
            <Text style={styles.regionName}>
              {region.name[language === 'zh-TW' ? 'zh' : 'en']}
            </Text>
            {isFundraising && region.progress !== undefined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${region.progress}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{region.progress}%</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={14} color={config.color} />
          <Text style={[styles.statusText, { color: config.color }]}>
            {isFundraising && region.progress !== undefined
              ? `${t[config.labelKey]} ${region.progress}%`
              : t[config.labelKey]
            }
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  if (campaignsQuery.isError) {
    return (
      <View style={styles.loadingContainer}>
        <ErrorState
          message={t.common_loadFailed}
          onRetry={() => campaignsQuery.refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="globe-outline" size={24} color={MibuBrand.brownDark} />
          <Text style={styles.headerTitle}>
            {t.crowdfunding_title}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.unlocked}</Text>
          <Text style={styles.statLabel}>
            {t.crowdfunding_statUnlocked}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: MibuBrand.info }]}>{stats.fundraising}</Text>
          <Text style={styles.statLabel}>
            {t.crowdfunding_statFundraising}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: SemanticColors.warningDark }]}>{stats.coming}</Text>
          <Text style={styles.statLabel}>
            {t.crowdfunding_statComing}
          </Text>
        </View>
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
        {/* Section: 已解鎖 */}
        {regions.filter(r => r.status === 'unlocked').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle" size={18} color={SemanticColors.successDark} />
              <Text style={styles.sectionTitle}>
                {t.crowdfunding_availableRegions}
              </Text>
            </View>
            {regions.filter(r => r.status === 'unlocked').map(renderRegionCard)}
          </View>
        )}

        {/* Section: 募資中 */}
        {regions.filter(r => r.status === 'fundraising').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up" size={18} color={MibuBrand.info} />
              <Text style={styles.sectionTitle}>
                {t.crowdfunding_fundraising}
              </Text>
            </View>
            {regions.filter(r => r.status === 'fundraising').map(renderRegionCard)}
          </View>
        )}

        {/* Section: 即將開放 */}
        {regions.filter(r => r.status === 'coming_soon').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={18} color={SemanticColors.warningDark} />
              <Text style={styles.sectionTitle}>
                {t.crowdfunding_comingSoon}
              </Text>
            </View>
            {regions.filter(r => r.status === 'coming_soon').map(renderRegionCard)}
          </View>
        )}

        {/* Section: 敬請期待 */}
        {regions.filter(r => r.status === 'stay_tuned').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles-outline" size={18} color={UIColors.textSecondary} />
              <Text style={styles.sectionTitle}>
                {t.crowdfunding_stayTuned}
              </Text>
            </View>
            {regions.filter(r => r.status === 'stay_tuned').map(renderRegionCard)}
          </View>
        )}

        {/* 空狀態：當沒有任何募資活動時顯示 */}
        {campaigns.length === 0 && regions.filter(r => r.status === 'fundraising').length === 0 && (
          <EmptyState
            icon="megaphone-outline"
            title={t.crowdfunding_noProjects}
            description={t.crowdfunding_stayTunedDesc}
          />
        )}

        {/* My Contributions Section */}
        {myContributions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={18} color={MibuBrand.brown} />
              <Text style={styles.sectionTitle}>
                {t.crowdfunding_myContributions}
              </Text>
            </View>
            <View style={styles.contributionSummary}>
              <Text style={styles.contributionLabel}>
                {t.crowdfunding_totalContributions}
              </Text>
              <Text style={styles.contributionAmount}>
                NT$ {myContributions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomCta}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {
            // 導向贊助頁面或活動詳情
            if (campaigns.length > 0) {
              router.push(`/crowdfunding/${campaigns[0].id}` as any);
            }
          }}
        >
          <Ionicons name="heart" size={20} color={UIColors.white} />
          <Text style={styles.ctaText}>
            {t.crowdfunding_supportVision}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.creamLight,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.warmWhite,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: UIColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: SemanticColors.successDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: MibuBrand.copper,
    fontWeight: '500',
  },
  statDivider: {
    display: 'none',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  regionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    padding: 18,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    ...Platform.select({
      ios: {
        shadowColor: UIColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  regionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  regionFlag: {
    fontSize: 32,
    marginRight: 14,
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 4,
    overflow: 'hidden',
    maxWidth: 100,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: MibuBrand.info,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.info,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contributionSummary: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  contributionLabel: {
    fontSize: 14,
    color: MibuBrand.copper,
  },
  contributionAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  bottomSpacer: {
    height: 80,
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: MibuBrand.creamLight,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: MibuBrand.tanLight,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    borderRadius: 16,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: MibuBrand.brown,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: UIColors.white,
  },
});
