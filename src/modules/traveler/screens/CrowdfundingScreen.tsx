/**
 * CrowdfundingScreen - 全球探索地圖
 * 顯示各地區解鎖狀態、募資進度
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { crowdfundingApi } from '../../../services/crowdfundingApi';
import { MibuBrand } from '../../../../constants/Colors';
import { Campaign, MyContribution } from '../../../types/crowdfunding';

// 地區狀態類型
type RegionStatus = 'unlocked' | 'fundraising' | 'coming_soon' | 'stay_tuned';

// 地區資料結構
interface Region {
  id: string;
  name: { zh: string; en: string };
  flag: string;
  status: RegionStatus;
  progress?: number; // 募資進度 0-100
  campaignId?: string;
}

// 模擬地區資料（實際應從 API 取得）
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

// 狀態配置
const STATUS_CONFIG: Record<RegionStatus, {
  label: { zh: string; en: string };
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  unlocked: {
    label: { zh: '已解鎖', en: 'Unlocked' },
    color: '#059669',
    bg: '#ECFDF5',
    icon: 'checkmark-circle',
  },
  fundraising: {
    label: { zh: '募資中', en: 'Fundraising' },
    color: '#6366f1',
    bg: '#EEF2FF',
    icon: 'trending-up',
  },
  coming_soon: {
    label: { zh: '即將開放', en: 'Coming Soon' },
    color: '#D97706',
    bg: '#FEF3C7',
    icon: 'time-outline',
  },
  stay_tuned: {
    label: { zh: '敬請期待', en: 'Stay Tuned' },
    color: '#6b7280',
    bg: '#F3F4F6',
    icon: 'sparkles-outline',
  },
};

export function CrowdfundingScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [regions, setRegions] = useState<Region[]>(REGIONS);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myContributions, setMyContributions] = useState<MyContribution[]>([]);

  // 統計數據
  const stats = {
    unlocked: regions.filter(r => r.status === 'unlocked').length,
    fundraising: regions.filter(r => r.status === 'fundraising').length,
    coming: regions.filter(r => r.status === 'coming_soon').length,
  };

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      // 載入進行中的募資活動
      const data = await crowdfundingApi.getCampaigns(token, { status: 'active' });
      setCampaigns(data.campaigns);

      // 載入我的贊助紀錄
      try {
        const myData = await crowdfundingApi.getMyContributions(token);
        setMyContributions(myData.contributions);
      } catch {
        // 忽略錯誤
      }

      // TODO: 從 API 取得地區狀態並更新 regions
      // 目前使用靜態資料

    } catch (error) {
      console.error('Failed to load crowdfunding data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

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
              {region.name[isZh ? 'zh' : 'en']}
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
              ? `${config.label[isZh ? 'zh' : 'en']} ${region.progress}%`
              : config.label[isZh ? 'zh' : 'en']
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
            {isZh ? '全球探索地圖' : 'Global Explorer Map'}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.unlocked}</Text>
          <Text style={styles.statLabel}>
            {isZh ? '已解鎖國家' : 'Unlocked'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#6366f1' }]}>{stats.fundraising}</Text>
          <Text style={styles.statLabel}>
            {isZh ? '募資進行中' : 'Fundraising'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#D97706' }]}>{stats.coming}</Text>
          <Text style={styles.statLabel}>
            {isZh ? '即將開放' : 'Coming'}
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
              <Ionicons name="checkmark-circle" size={18} color="#059669" />
              <Text style={styles.sectionTitle}>
                {isZh ? '已開放地區' : 'Available Regions'}
              </Text>
            </View>
            {regions.filter(r => r.status === 'unlocked').map(renderRegionCard)}
          </View>
        )}

        {/* Section: 募資中 */}
        {regions.filter(r => r.status === 'fundraising').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up" size={18} color="#6366f1" />
              <Text style={styles.sectionTitle}>
                {isZh ? '募資進行中' : 'Fundraising'}
              </Text>
            </View>
            {regions.filter(r => r.status === 'fundraising').map(renderRegionCard)}
          </View>
        )}

        {/* Section: 即將開放 */}
        {regions.filter(r => r.status === 'coming_soon').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={18} color="#D97706" />
              <Text style={styles.sectionTitle}>
                {isZh ? '即將開放' : 'Coming Soon'}
              </Text>
            </View>
            {regions.filter(r => r.status === 'coming_soon').map(renderRegionCard)}
          </View>
        )}

        {/* Section: 敬請期待 */}
        {regions.filter(r => r.status === 'stay_tuned').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles-outline" size={18} color="#6b7280" />
              <Text style={styles.sectionTitle}>
                {isZh ? '敬請期待' : 'Stay Tuned'}
              </Text>
            </View>
            {regions.filter(r => r.status === 'stay_tuned').map(renderRegionCard)}
          </View>
        )}

        {/* My Contributions Section */}
        {myContributions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={18} color={MibuBrand.brown} />
              <Text style={styles.sectionTitle}>
                {isZh ? '我的贊助紀錄' : 'My Contributions'}
              </Text>
            </View>
            <View style={styles.contributionSummary}>
              <Text style={styles.contributionLabel}>
                {isZh ? '累計贊助' : 'Total'}
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
          <Ionicons name="heart" size={20} color="#fff" />
          <Text style={styles.ctaText}>
            {isZh ? '支持我們的理念' : 'Support Our Vision'}
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
        shadowColor: '#000',
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
    color: '#059669',
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
        shadowColor: '#000',
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
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
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
    color: '#ffffff',
  },
});
