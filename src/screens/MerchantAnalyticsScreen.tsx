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
  totalPlaces: number;
  activePlaces: number;
  pendingPlaces: number;
  promoActivePlaces: number;
  dailyCollectionCount?: number;
  totalCollectionUsers?: number;
  collectionClickCount?: number;
  couponUsageRate?: number;
  couponTotalUsed?: number;
  prizePoolViewCount?: number;
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
    totalPlaces: isZh ? '行程卡總數' : 'Total Places',
    activePlaces: isZh ? '已上架' : 'Active',
    pendingPlaces: isZh ? '待審核' : 'Pending',
    promoActivePlaces: isZh ? '有優惠活動' : 'With Promos',
    dailyCollection: isZh ? '今日圖鑑收錄' : 'Daily Collections',
    totalUsers: isZh ? '圖鑑卡持有人數' : 'Collection Users',
    clickCount: isZh ? '圖鑑點擊次數' : 'Collection Clicks',
    couponUsage: isZh ? '優惠券使用率' : 'Coupon Usage Rate',
    couponUsed: isZh ? '優惠券使用次數' : 'Coupons Used',
    prizePoolViews: isZh ? '獎池瀏覽人數' : 'Prize Pool Views',
    comingSoon: isZh ? '即將推出' : 'Coming Soon',
    noData: isZh ? '暫無數據' : 'No data',
    places: isZh ? '個店家' : 'places',
    times: isZh ? '次' : 'times',
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
        setAnalytics({
          totalPlaces: response.stats?.totalCoupons || 0,
          activePlaces: response.stats?.activeCoupons || 0,
          pendingPlaces: 0,
          promoActivePlaces: response.stats?.redeemedCoupons || 0,
          dailyCollectionCount: response.stats?.monthlyRedemptions,
          totalCollectionUsers: response.stats?.totalRedemptions,
          collectionClickCount: response.stats?.viewCount,
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
          {isZh ? '店家統計' : 'Place Statistics'}
        </Text>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="storefront-outline" 
            label={translations.totalPlaces} 
            value={analytics?.totalPlaces}
            unit={translations.places}
          />
          <StatCard 
            icon="checkmark-circle-outline" 
            label={translations.activePlaces} 
            value={analytics?.activePlaces}
            color="#10b981"
          />
          <StatCard 
            icon="time-outline" 
            label={translations.pendingPlaces} 
            value={analytics?.pendingPlaces}
            color="#f59e0b"
          />
          <StatCard 
            icon="pricetag-outline" 
            label={translations.promoActivePlaces} 
            value={analytics?.promoActivePlaces}
            color="#6366f1"
          />
        </View>

        <Text style={styles.sectionTitle}>
          {isZh ? '互動數據' : 'Engagement Statistics'}
        </Text>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="today-outline" 
            label={translations.dailyCollection} 
            value={analytics?.dailyCollectionCount}
            unit={translations.users}
            color="#0891b2"
            comingSoon={analytics?.dailyCollectionCount === undefined}
          />
          <StatCard 
            icon="people-outline" 
            label={translations.totalUsers} 
            value={analytics?.totalCollectionUsers}
            unit={translations.users}
            color="#7c3aed"
            comingSoon={analytics?.totalCollectionUsers === undefined}
          />
          <StatCard 
            icon="eye-outline" 
            label={translations.clickCount} 
            value={analytics?.collectionClickCount}
            unit={translations.times}
            color="#db2777"
            comingSoon={analytics?.collectionClickCount === undefined}
          />
          <StatCard 
            icon="gift-outline" 
            label={translations.prizePoolViews} 
            value={analytics?.prizePoolViewCount}
            unit={translations.users}
            color="#ea580c"
            comingSoon={true}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {isZh ? '優惠券統計' : 'Coupon Statistics'}
        </Text>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="ticket-outline" 
            label={translations.couponUsed} 
            value={analytics?.couponTotalUsed}
            unit={translations.times}
            color="#10b981"
            comingSoon={analytics?.couponTotalUsed === undefined}
          />
          <StatCard 
            icon="stats-chart-outline" 
            label={translations.couponUsage} 
            value={analytics?.couponUsageRate !== undefined 
              ? Math.round(analytics.couponUsageRate * 100) 
              : undefined}
            unit="%"
            color="#6366f1"
            comingSoon={analytics?.couponUsageRate === undefined}
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
