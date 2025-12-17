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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { MibuBrand } from '../../constants/Colors';

interface AnalyticsData {
  totalItineraryCards: number;
  totalCoupons: number;
  activeCoupons: number;
  couponRedemptions: number;
  dailyCollectionCount: number;
  totalCollectionUsers: number;
  collectionClickCount: number;
  couponUsageCount: number;
  couponUsageRate: number;
  prizePoolViews: number;
}

export function MerchantAnalyticsScreen() {
  const { state } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const translations = {
    title: isZh ? '數據分析' : 'Analytics',
    loading: isZh ? '載入中...' : 'Loading...',
    totalItineraryCards: isZh ? '行程卡總數' : 'Total Itinerary Cards',
    totalCoupons: isZh ? '優惠券總數' : 'Total Coupons',
    activeCoupons: isZh ? '啟用中' : 'Active Coupons',
    couponRedemptions: isZh ? '優惠券核銷' : 'Coupon Redemptions',
    dailyCollection: isZh ? '今日收錄次數' : 'Daily Collections',
    totalCollectionUsers: isZh ? '累計收錄用戶' : 'Total Collection Users',
    collectionClicks: isZh ? '圖鑑點擊次數' : 'Collection Clicks',
    couponUsageCount: isZh ? '優惠券使用次數' : 'Coupon Usage Count',
    couponUsageRate: isZh ? '使用率' : 'Usage Rate',
    prizePoolViews: isZh ? '獎池瀏覽次數' : 'Prize Pool Views',
    noData: isZh ? '暫無數據' : 'No data',
    comingSoon: isZh ? '即將推出' : 'Coming Soon',
    times: isZh ? '次' : 'times',
    count: isZh ? '張' : '',
    users: isZh ? '人' : 'users',
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = await AsyncStorage.getItem('@mibu_token');
      if (!token) return;

      const response = await apiService.getMerchantAnalytics(token);
      if (response.success) {
        const a = response.analytics;
        const s = response.stats;
        setAnalytics({
          totalItineraryCards: a?.totalItineraryCards || 0,
          totalCoupons: a?.totalCoupons || s?.totalCoupons || 0,
          activeCoupons: a?.activeCoupons || s?.activeCoupons || 0,
          couponRedemptions: a?.couponRedemptions || s?.totalRedemptions || 0,
          dailyCollectionCount: a?.dailyCollectionCount || 0,
          totalCollectionUsers: a?.totalCollectionUsers || 0,
          collectionClickCount: a?.collectionClickCount || s?.viewCount || 0,
          couponUsageCount: a?.couponUsageCount || 0,
          couponUsageRate: a?.couponUsageRate || 0,
          prizePoolViews: a?.prizePoolViews || 0,
        });
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
    comingSoon = false 
  }: { 
    icon: string; 
    label: string; 
    value: number | undefined; 
    unit?: string;
    color?: string;
    comingSoon?: boolean;
  }) => (
    <View style={[styles.statCard, comingSoon && styles.statCardDisabled]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      {comingSoon ? (
        <Text style={styles.comingSoon}>{translations.comingSoon}</Text>
      ) : (
        <Text style={styles.statValue}>
          {value !== undefined ? value : '-'}
          {unit && <Text style={styles.statUnit}> {unit}</Text>}
        </Text>
      )}
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

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>
          {isZh ? '行程卡與優惠券' : 'Itinerary Cards & Coupons'}
        </Text>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="map-outline" 
            label={translations.totalItineraryCards} 
            value={analytics?.totalItineraryCards}
            unit={translations.count}
          />
          <StatCard 
            icon="pricetag-outline" 
            label={translations.totalCoupons} 
            value={analytics?.totalCoupons}
            unit={translations.count}
            color="#6366f1"
          />
          <StatCard 
            icon="checkmark-circle-outline" 
            label={translations.activeCoupons} 
            value={analytics?.activeCoupons}
            color="#10b981"
          />
          <StatCard 
            icon="ticket-outline" 
            label={translations.couponRedemptions} 
            value={analytics?.couponRedemptions}
            unit={translations.times}
            color="#f59e0b"
          />
        </View>

        <Text style={styles.sectionTitle}>
          {isZh ? '圖鑑收錄數據' : 'Collection Statistics'}
        </Text>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="today-outline" 
            label={translations.dailyCollection} 
            value={analytics?.dailyCollectionCount}
            unit={translations.times}
            color="#0891b2"
          />
          <StatCard 
            icon="people-outline" 
            label={translations.totalCollectionUsers} 
            value={analytics?.totalCollectionUsers}
            unit={translations.users}
            color="#7c3aed"
          />
          <StatCard 
            icon="hand-left-outline" 
            label={translations.collectionClicks} 
            value={analytics?.collectionClickCount}
            unit={translations.times}
            color="#db2777"
          />
        </View>

        <Text style={styles.sectionTitle}>
          {isZh ? '優惠券使用數據' : 'Coupon Usage Statistics'}
        </Text>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="receipt-outline" 
            label={translations.couponUsageCount} 
            value={analytics?.couponUsageCount}
            unit={translations.times}
            color="#10b981"
          />
          <StatCard 
            icon="analytics-outline" 
            label={translations.couponUsageRate} 
            value={analytics?.couponUsageRate !== undefined 
              ? Math.round(analytics.couponUsageRate * 100) 
              : undefined}
            unit="%"
            color="#6366f1"
          />
          <StatCard 
            icon="gift-outline" 
            label={translations.prizePoolViews} 
            value={analytics?.prizePoolViews}
            unit={translations.times}
            color="#ea580c"
          />
        </View>
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
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: MibuBrand.cream,
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  statCardDisabled: {
    opacity: 0.6,
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
    color: '#64748b',
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
    color: '#94a3b8',
  },
  comingSoon: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});
