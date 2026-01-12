import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { MerchantMe } from '../types';

export function MerchantProfileScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [merchant, setMerchant] = useState<MerchantMe | null>(null);
  const [loading, setLoading] = useState(true);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '商家資料' : 'Merchant Profile',
    businessName: isZh ? '商家名稱' : 'Business Name',
    email: isZh ? '聯絡信箱' : 'Contact Email',
    status: isZh ? '帳號狀態' : 'Account Status',
    approved: isZh ? '已核准' : 'Approved',
    pending: isZh ? '待審核' : 'Pending',
    balance: isZh ? '點數餘額' : 'Credit Balance',
    plan: isZh ? '訂閱方案' : 'Subscription Plan',
    free: isZh ? '免費方案' : 'Free Plan',
    partner: isZh ? '合作夥伴' : 'Partner',
    premium: isZh ? '進階方案' : 'Premium',
    memberSince: isZh ? '加入時間' : 'Member Since',
    loading: isZh ? '載入中...' : 'Loading...',
    points: isZh ? '點' : 'pts',
  };

  useEffect(() => {
    loadMerchant();
  }, []);

  const loadMerchant = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getMerchantMe(token);
      setMerchant(data);
    } catch (error) {
      console.error('Failed to load merchant:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isZh ? 'zh-TW' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanLabel = (plan?: string) => {
    switch (plan) {
      case 'partner': return translations.partner;
      case 'premium': return translations.premium;
      default: return translations.free;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="storefront" size={48} color="#6366f1" />
        </View>
        <Text style={styles.businessName}>
          {merchant?.businessName || merchant?.name || '-'}
        </Text>
        <View style={[
          styles.statusBadge,
          merchant?.isApproved ? styles.approvedBadge : styles.pendingBadge
        ]}>
          <Text style={[
            styles.statusText,
            merchant?.isApproved ? styles.approvedText : styles.pendingText
          ]}>
            {merchant?.isApproved ? translations.approved : translations.pending}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="mail-outline" size={20} color="#6366f1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{translations.email}</Text>
            <Text style={styles.infoValue}>
              {merchant?.contactEmail || merchant?.email || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="wallet-outline" size={20} color="#6366f1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{translations.balance}</Text>
            <Text style={styles.infoValue}>
              {merchant?.creditBalance ?? 0} {translations.points}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="ribbon-outline" size={20} color="#6366f1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{translations.plan}</Text>
            <Text style={styles.infoValue}>
              {getPlanLabel(merchant?.subscriptionPlan)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="calendar-outline" size={20} color="#6366f1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{translations.memberSince}</Text>
            <Text style={styles.infoValue}>
              {merchant?.createdAt ? formatDate(merchant.createdAt) : '-'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#c7d2fe',
  },
  businessName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  approvedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  approvedText: {
    color: '#16a34a',
  },
  pendingText: {
    color: '#d97706',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
});
