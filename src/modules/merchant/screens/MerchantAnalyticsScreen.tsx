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
import { apiService } from '../../../services/api';
import { MibuBrand } from '../../../../constants/Colors';

interface AnalyticsData {
  itineraryCardCount: number;
  couponStats: {
    total: number;
    active: number;
    redeemed: number;
  };
  impressions: number;
  collectionClickCount: number;
}

export function MerchantAnalyticsScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const translations = {
    title: isZh ? '數據分析' : 'Analytics',
    loading: isZh ? '載入中...' : 'Loading...',
    itineraryCardCount: isZh ? '行程卡總數' : 'Itinerary Cards',
    totalCoupons: isZh ? '優惠券總數' : 'Total Coupons',
    activeCoupons: isZh ? '啟用中' : 'Active Coupons',
    redeemedCoupons: isZh ? '已核銷' : 'Redeemed',
    impressions: isZh ? '曝光次數' : 'Impressions',
    collectionClicks: isZh ? '圖鑑點擊次數' : 'Collection Clicks',
    noData: isZh ? '暫無數據' : 'No data',
    comingSoon: isZh ? '即將推出' : 'Coming Soon',
    times: isZh ? '次' : 'times',
    count: isZh ? '張' : '',
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await apiService.getMerchantAnalytics(token);
      if (response) {
        setAnalytics({
          itineraryCardCount: response.itineraryCardCount || 0,
          couponStats: {
            total: response.couponStats?.total || 0,
            active: response.couponStats?.active || 0,
            redeemed: response.couponStats?.redeemed || 0,
          },
          impressions: response.impressions || 0,
          collectionClickCount: response.collectionClickCount || 0,
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
            label={translations.itineraryCardCount} 
            value={analytics?.itineraryCardCount}
            unit={translations.count}
          />
          <StatCard 
            icon="pricetag-outline" 
            label={translations.totalCoupons} 
            value={analytics?.couponStats?.total}
            unit={translations.count}
            color="#6366f1"
          />
          <StatCard 
            icon="checkmark-circle-outline" 
            label={translations.activeCoupons} 
            value={analytics?.couponStats?.active}
            color="#10b981"
          />
          <StatCard 
            icon="ticket-outline" 
            label={translations.redeemedCoupons} 
            value={analytics?.couponStats?.redeemed}
            unit={translations.times}
            color="#f59e0b"
          />
        </View>

        <Text style={styles.sectionTitle}>
          {isZh ? '曝光與點擊' : 'Impressions & Clicks'}
        </Text>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="eye-outline" 
            label={translations.impressions} 
            value={analytics?.impressions}
            unit={translations.times}
            color="#0891b2"
          />
          <StatCard 
            icon="hand-left-outline" 
            label={translations.collectionClicks} 
            value={analytics?.collectionClickCount}
            unit={translations.times}
            color="#db2777"
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
