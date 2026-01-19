import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { merchantApi } from '../../../services/merchantApi';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';
import {
  MerchantAnalytics,
  MerchantPlace,
  AnalyticsPeriod,
} from '../../../types';

export function MerchantAnalyticsScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null);
  const [places, setPlaces] = useState<MerchantPlace[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('30d');
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);

  const periods: { value: AnalyticsPeriod; label: string }[] = [
    { value: '7d', label: isZh ? '7 天' : '7 Days' },
    { value: '30d', label: isZh ? '30 天' : '30 Days' },
    { value: '90d', label: isZh ? '90 天' : '90 Days' },
    { value: 'all', label: isZh ? '全部' : 'All' },
  ];

  const translations = {
    title: isZh ? '數據分析' : 'Analytics',
    loading: isZh ? '載入中...' : 'Loading...',
    overview: isZh ? '總覽' : 'Overview',
    totalExposures: isZh ? '總曝光次數' : 'Total Exposures',
    totalCollectors: isZh ? '圖鑑收錄人數' : 'Total Collectors',
    couponIssued: isZh ? '優惠券發放' : 'Coupons Issued',
    couponRedeemed: isZh ? '優惠券核銷' : 'Coupons Redeemed',
    redemptionRate: isZh ? '核銷率' : 'Redemption Rate',
    topCoupons: isZh ? '熱門優惠券' : 'Top Coupons',
    placeBreakdown: isZh ? '各店數據' : 'Place Breakdown',
    allPlaces: isZh ? '全部店家' : 'All Places',
    selectPlace: isZh ? '選擇店家' : 'Select Place',
    noData: isZh ? '暫無數據' : 'No data',
    times: isZh ? '次' : 'times',
    people: isZh ? '人' : 'people',
    issued: isZh ? '發放' : 'Issued',
    redeemed: isZh ? '核銷' : 'Redeemed',
    collectionCount: isZh ? '收錄數' : 'Collections',
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, selectedPlaceId]);

  const loadInitialData = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // 同時載入地點列表和分析數據
      const [placesData] = await Promise.all([
        merchantApi.getMerchantPlaces(token),
      ]);
      setPlaces(placesData.places || []);
      await loadAnalytics();
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await merchantApi.getMerchantAnalytics(token, {
        period: selectedPeriod,
        placeId: selectedPlaceId || undefined,
      });

      if (response) {
        setAnalytics(response);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setSelectedPeriod(period);
  };

  const handlePlaceSelect = (placeId: number | null) => {
    setSelectedPlaceId(placeId);
    setShowPlaceDropdown(false);
  };

  const getSelectedPlaceName = () => {
    if (!selectedPlaceId) return translations.allPlaces;
    const place = places.find(p => p.id === selectedPlaceId);
    return place?.placeName || translations.allPlaces;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  const StatCard = ({
    icon,
    label,
    value,
    unit,
    color = MibuBrand.brown,
  }: {
    icon: string;
    label: string;
    value: number | string | undefined;
    unit?: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value !== undefined ? value : '-'}
        {unit && <Text style={styles.statUnit}> {unit}</Text>}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 篩選器 */}
      <View style={styles.filtersContainer}>
        {/* 時間區間選擇 */}
        <View style={styles.periodSelector}>
          {periods.map(period => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.periodButtonActive,
              ]}
              onPress={() => handlePeriodChange(period.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 店家篩選 */}
        {places.length > 0 && (
          <View style={styles.placeFilterContainer}>
            <TouchableOpacity
              style={styles.placeFilterButton}
              onPress={() => setShowPlaceDropdown(!showPlaceDropdown)}
            >
              <Ionicons name="storefront-outline" size={18} color={MibuBrand.copper} />
              <Text style={styles.placeFilterText} numberOfLines={1}>
                {getSelectedPlaceName()}
              </Text>
              <Ionicons
                name={showPlaceDropdown ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={MibuBrand.copper}
              />
            </TouchableOpacity>

            {showPlaceDropdown && (
              <View style={styles.placeDropdown}>
                <TouchableOpacity
                  style={[
                    styles.placeDropdownItem,
                    !selectedPlaceId && styles.placeDropdownItemActive,
                  ]}
                  onPress={() => handlePlaceSelect(null)}
                >
                  <Text
                    style={[
                      styles.placeDropdownText,
                      !selectedPlaceId && styles.placeDropdownTextActive,
                    ]}
                  >
                    {translations.allPlaces}
                  </Text>
                </TouchableOpacity>
                {places.map(place => (
                  <TouchableOpacity
                    key={place.id}
                    style={[
                      styles.placeDropdownItem,
                      selectedPlaceId === place.id && styles.placeDropdownItemActive,
                    ]}
                    onPress={() => handlePlaceSelect(place.id)}
                  >
                    <Text
                      style={[
                        styles.placeDropdownText,
                        selectedPlaceId === place.id && styles.placeDropdownTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {place.placeName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 總覽 */}
        <Text style={styles.sectionTitle}>{translations.overview}</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="eye-outline"
            label={translations.totalExposures}
            value={analytics?.overview?.totalExposures}
            unit={translations.times}
            color={MibuBrand.info}
          />
          <StatCard
            icon="people-outline"
            label={translations.totalCollectors}
            value={analytics?.overview?.totalCollectors}
            unit={translations.people}
            color={MibuBrand.brown}
          />
          <StatCard
            icon="pricetag-outline"
            label={translations.couponIssued}
            value={analytics?.overview?.couponIssued}
            color={MibuBrand.success}
          />
          <StatCard
            icon="checkmark-circle-outline"
            label={translations.couponRedeemed}
            value={analytics?.overview?.couponRedeemed}
            color={SemanticColors.warningDark}
          />
        </View>

        {/* 核銷率 */}
        <View style={styles.rateCard}>
          <View style={styles.rateHeader}>
            <Ionicons name="trending-up-outline" size={24} color={MibuBrand.brown} />
            <Text style={styles.rateLabel}>{translations.redemptionRate}</Text>
          </View>
          <Text style={styles.rateValue}>
            {analytics?.overview?.redemptionRate !== undefined
              ? `${analytics.overview.redemptionRate.toFixed(1)}%`
              : '-'}
          </Text>
        </View>

        {/* 熱門優惠券 */}
        {analytics?.topCoupons && analytics.topCoupons.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{translations.topCoupons}</Text>
            <View style={styles.listContainer}>
              {analytics.topCoupons.map((coupon, index) => (
                <View key={coupon.couponId} style={styles.listItem}>
                  <View style={styles.listRank}>
                    <Text style={styles.listRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.listContent}>
                    <Text style={styles.listTitle} numberOfLines={1}>
                      {coupon.title}
                    </Text>
                    <View style={styles.listStats}>
                      <Text style={styles.listStatText}>
                        {translations.issued}: {coupon.issued}
                      </Text>
                      <Text style={styles.listStatText}>
                        {translations.redeemed}: {coupon.redeemed}
                      </Text>
                      <Text style={styles.listStatRate}>
                        {coupon.redemptionRate.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 各店數據 */}
        {analytics?.placeBreakdown && analytics.placeBreakdown.length > 0 && !selectedPlaceId && (
          <>
            <Text style={styles.sectionTitle}>{translations.placeBreakdown}</Text>
            <View style={styles.listContainer}>
              {analytics.placeBreakdown.map((place, index) => (
                <TouchableOpacity
                  key={place.placeId}
                  style={styles.listItem}
                  onPress={() => handlePlaceSelect(place.placeId)}
                >
                  <View style={[styles.listRank, { backgroundColor: `${MibuBrand.brown}15` }]}>
                    <Ionicons name="storefront" size={16} color={MibuBrand.brown} />
                  </View>
                  <View style={styles.listContent}>
                    <Text style={styles.listTitle} numberOfLines={1}>
                      {place.placeName}
                    </Text>
                    <Text style={styles.listStatText}>
                      {translations.collectionCount}: {place.collectionCount}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: MibuBrand.copper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: MibuBrand.dark,
  },
  placeholder: {
    width: 40,
  },
  filtersContainer: {
    backgroundColor: MibuBrand.warmWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
    zIndex: 100,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: MibuBrand.brown,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: MibuBrand.copper,
  },
  periodButtonTextActive: {
    color: MibuBrand.warmWhite,
    fontWeight: '600',
  },
  placeFilterContainer: {
    marginTop: 12,
    position: 'relative',
    zIndex: 200,
  },
  placeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    gap: 8,
  },
  placeFilterText: {
    flex: 1,
    fontSize: 14,
    color: MibuBrand.brownDark,
  },
  placeDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  placeDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  placeDropdownItemActive: {
    backgroundColor: `${MibuBrand.brown}15`,
  },
  placeDropdownText: {
    fontSize: 14,
    color: MibuBrand.brownDark,
  },
  placeDropdownTextActive: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.dark,
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: MibuBrand.dark,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: MibuBrand.tan,
  },
  rateCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.dark,
  },
  rateValue: {
    fontSize: 28,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  listContainer: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    marginBottom: 16,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  listRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: SemanticColors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: SemanticColors.warningDark,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  listStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listStatText: {
    fontSize: 12,
    color: MibuBrand.copper,
  },
  listStatRate: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.success,
  },
});
