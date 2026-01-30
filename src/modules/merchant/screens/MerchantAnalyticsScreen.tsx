/**
 * MerchantAnalyticsScreen - 商家分析
 *
 * 功能說明：
 * - 顯示商家數據分析總覽
 * - 支援時間區間篩選（7天/30天/90天/全部）
 * - 支援依店家篩選
 * - 顯示曝光次數、收錄人數、優惠券發放/核銷等統計
 *
 * 串接的 API：
 * - GET /merchant/places - 取得商家店家列表
 * - GET /merchant/analytics - 取得分析數據
 */
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

// ============ 主元件 ============
export function MerchantAnalyticsScreen() {
  // ============ Hooks ============
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  // ============ 狀態變數 ============
  // loading: 初始載入狀態
  const [loading, setLoading] = useState(true);
  // refreshing: 下拉刷新狀態
  const [refreshing, setRefreshing] = useState(false);
  // analytics: 分析數據
  const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null);
  // places: 店家列表（用於篩選）
  const [places, setPlaces] = useState<MerchantPlace[]>([]);
  // selectedPeriod: 選中的時間區間
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('30d');
  // selectedPlaceId: 選中的店家 ID（null 表示全部）
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  // showPlaceDropdown: 是否顯示店家下拉選單
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);

  // ============ 常數定義 ============
  // 時間區間選項
  const periods: { value: AnalyticsPeriod; label: string }[] = [
    { value: '7d', label: isZh ? '7 天' : '7 Days' },
    { value: '30d', label: isZh ? '30 天' : '30 Days' },
    { value: '90d', label: isZh ? '90 天' : '90 Days' },
    { value: 'all', label: isZh ? '全部' : 'All' },
  ];

  // ============ 多語系翻譯 ============
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

  // ============ Effect Hooks ============
  // 元件載入時取得初始資料
  useEffect(() => {
    loadInitialData();
  }, []);

  // 時間區間或店家篩選變更時重新載入分析數據
  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, selectedPlaceId]);

  // ============ 資料載入函數 ============

  /**
   * loadInitialData - 載入初始資料
   * 同時取得店家列表和分析數據
   */
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

  /**
   * loadAnalytics - 載入分析數據
   * 根據選中的時間區間和店家取得數據
   */
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

  // ============ 事件處理函數 ============

  /**
   * handleRefresh - 處理下拉刷新
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  /**
   * handlePeriodChange - 處理時間區間變更
   * @param period - 選中的時間區間
   */
  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setSelectedPeriod(period);
  };

  /**
   * handlePlaceSelect - 處理店家選擇
   * @param placeId - 選中的店家 ID（null 表示全部）
   */
  const handlePlaceSelect = (placeId: number | null) => {
    setSelectedPlaceId(placeId);
    setShowPlaceDropdown(false);
  };

  /**
   * getSelectedPlaceName - 取得選中店家的名稱
   * @returns 店家名稱或「全部店家」
   */
  const getSelectedPlaceName = () => {
    if (!selectedPlaceId) return translations.allPlaces;
    const place = places.find(p => p.id === selectedPlaceId);
    return place?.placeName || translations.allPlaces;
  };

  // ============ 載入中畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  // ============ 子元件：統計卡片 ============
  /**
   * StatCard - 統計數據卡片
   * @param icon - 圖示名稱
   * @param label - 標籤文字
   * @param value - 數值
   * @param unit - 單位
   * @param color - 主題色
   */
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
      {/* 圖示區 */}
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      {/* 標籤 */}
      <Text style={styles.statLabel}>{label}</Text>
      {/* 數值 */}
      <Text style={styles.statValue}>
        {value !== undefined ? value : '-'}
        {unit && <Text style={styles.statUnit}> {unit}</Text>}
      </Text>
    </View>
  );

  // ============ 主要 JSX 渲染 ============
  return (
    <View style={styles.container}>
      {/* ============ 頂部標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* ============ 篩選器區塊 ============ */}
      <View style={styles.filtersContainer}>
        {/* 時間區間選擇器 */}
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

        {/* 店家篩選下拉選單 */}
        {places.length > 0 && (
          <View style={styles.placeFilterContainer}>
            {/* 觸發按鈕 */}
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

            {/* 下拉選項列表 */}
            {showPlaceDropdown && (
              <View style={styles.placeDropdown}>
                {/* 全部店家選項 */}
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
                {/* 各店家選項 */}
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

      {/* ============ 主要內容區 ============ */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* ============ 總覽區塊 ============ */}
        <Text style={styles.sectionTitle}>{translations.overview}</Text>
        <View style={styles.statsGrid}>
          {/* 總曝光次數 */}
          <StatCard
            icon="eye-outline"
            label={translations.totalExposures}
            value={analytics?.overview?.totalExposures}
            unit={translations.times}
            color={MibuBrand.info}
          />
          {/* 圖鑑收錄人數 */}
          <StatCard
            icon="people-outline"
            label={translations.totalCollectors}
            value={analytics?.overview?.totalCollectors}
            unit={translations.people}
            color={MibuBrand.brown}
          />
          {/* 優惠券發放數 */}
          <StatCard
            icon="pricetag-outline"
            label={translations.couponIssued}
            value={analytics?.overview?.couponIssued}
            color={MibuBrand.success}
          />
          {/* 優惠券核銷數 */}
          <StatCard
            icon="checkmark-circle-outline"
            label={translations.couponRedeemed}
            value={analytics?.overview?.couponRedeemed}
            color={SemanticColors.warningDark}
          />
        </View>

        {/* ============ 核銷率卡片 ============ */}
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

        {/* ============ 熱門優惠券列表 ============ */}
        {analytics?.topCoupons && analytics.topCoupons.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{translations.topCoupons}</Text>
            <View style={styles.listContainer}>
              {analytics.topCoupons.map((coupon, index) => (
                <View key={coupon.couponId} style={styles.listItem}>
                  {/* 排名 */}
                  <View style={styles.listRank}>
                    <Text style={styles.listRankText}>{index + 1}</Text>
                  </View>
                  {/* 優惠券資訊 */}
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

        {/* ============ 各店數據列表 ============ */}
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
                  {/* 店家圖示 */}
                  <View style={[styles.listRank, { backgroundColor: `${MibuBrand.brown}15` }]}>
                    <Ionicons name="storefront" size={16} color={MibuBrand.brown} />
                  </View>
                  {/* 店家資訊 */}
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

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  // 載入中容器
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  // 載入中文字
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: MibuBrand.copper,
  },
  // 頂部標題區
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
  // 返回按鈕
  backButton: {
    padding: 8,
  },
  // 頁面標題
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: MibuBrand.dark,
  },
  // 佔位元素（保持標題置中）
  placeholder: {
    width: 40,
  },
  // 篩選器容器
  filtersContainer: {
    backgroundColor: MibuBrand.warmWhite,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
    zIndex: 100,
  },
  // 時間區間選擇器
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 12,
    padding: 4,
  },
  // 時間區間按鈕
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  // 時間區間按鈕（選中狀態）
  periodButtonActive: {
    backgroundColor: MibuBrand.brown,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  // 時間區間按鈕文字
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: MibuBrand.copper,
  },
  // 時間區間按鈕文字（選中狀態）
  periodButtonTextActive: {
    color: MibuBrand.warmWhite,
    fontWeight: '600',
  },
  // 店家篩選容器
  placeFilterContainer: {
    marginTop: 12,
    position: 'relative',
    zIndex: 200,
  },
  // 店家篩選按鈕
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
  // 店家篩選文字
  placeFilterText: {
    flex: 1,
    fontSize: 14,
    color: MibuBrand.brownDark,
  },
  // 店家下拉選單
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
  // 店家下拉選項
  placeDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  // 店家下拉選項（選中狀態）
  placeDropdownItemActive: {
    backgroundColor: `${MibuBrand.brown}15`,
  },
  // 店家下拉選項文字
  placeDropdownText: {
    fontSize: 14,
    color: MibuBrand.brownDark,
  },
  // 店家下拉選項文字（選中狀態）
  placeDropdownTextActive: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
  // 內容區
  content: {
    flex: 1,
  },
  // 捲動內容區
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // 區塊標題
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.dark,
    marginBottom: 12,
    marginTop: 8,
  },
  // 統計卡片網格
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  // 統計卡片
  statCard: {
    width: '47%',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  // 統計卡片圖示容器
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  // 統計卡片標籤
  statLabel: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 4,
  },
  // 統計卡片數值
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: MibuBrand.dark,
  },
  // 統計卡片單位
  statUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: MibuBrand.tan,
  },
  // 核銷率卡片
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
  // 核銷率標題區
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // 核銷率標籤
  rateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.dark,
  },
  // 核銷率數值
  rateValue: {
    fontSize: 28,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  // 列表容器
  listContainer: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    marginBottom: 16,
    overflow: 'hidden',
  },
  // 列表項目
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  // 列表排名
  listRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: SemanticColors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  // 列表排名文字
  listRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: SemanticColors.warningDark,
  },
  // 列表內容區
  listContent: {
    flex: 1,
  },
  // 列表標題
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  // 列表統計區
  listStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // 列表統計文字
  listStatText: {
    fontSize: 12,
    color: MibuBrand.copper,
  },
  // 列表核銷率
  listStatRate: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.success,
  },
});
