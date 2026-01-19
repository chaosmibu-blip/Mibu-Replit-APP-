import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { authApi } from '../../../services/authApi';
import { MerchantMe } from '../../../types';
import { MibuBrand } from '../../../../constants/Colors';

export function MerchantProfileScreen() {
  const { state, getToken, setUser } = useApp();
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
    dangerZone: isZh ? '危險區域' : 'Danger Zone',
    deleteAccount: isZh ? '刪除帳號' : 'Delete Account',
    deleteConfirmTitle: isZh ? '確認刪除帳號' : 'Confirm Delete Account',
    deleteConfirmMessage: isZh
      ? '此操作無法復原，所有資料將被永久刪除。確定要繼續嗎？'
      : 'This action cannot be undone. All your data will be permanently deleted. Are you sure you want to continue?',
    cancel: isZh ? '取消' : 'Cancel',
    confirm: isZh ? '確認刪除' : 'Confirm Delete',
    deleteSuccess: isZh ? '帳號已刪除' : 'Account deleted',
    deleteFailed: isZh ? '刪除失敗，請稍後再試' : 'Delete failed, please try again later',
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

  const handleDeleteAccount = () => {
    Alert.alert(
      translations.deleteConfirmTitle,
      translations.deleteConfirmMessage,
      [
        { text: translations.cancel, style: 'cancel' },
        {
          text: translations.confirm,
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) return;
              await authApi.deleteAccount(token);
              setUser(null);
              Alert.alert(translations.deleteSuccess);
            } catch (error) {
              console.error('Failed to delete account:', error);
              Alert.alert(translations.deleteFailed);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="storefront" size={48} color={MibuBrand.brown} />
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
            <Ionicons name="mail-outline" size={20} color={MibuBrand.brown} />
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
            <Ionicons name="wallet-outline" size={20} color={MibuBrand.brown} />
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
            <Ionicons name="ribbon-outline" size={20} color={MibuBrand.brown} />
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
            <Ionicons name="calendar-outline" size={20} color={MibuBrand.brown} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{translations.memberSince}</Text>
            <Text style={styles.infoValue}>
              {merchant?.createdAt ? formatDate(merchant.createdAt) : '-'}
            </Text>
          </View>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>{translations.dangerZone}</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color="#ffffff" />
          <Text style={styles.deleteButtonText}>{translations.deleteAccount}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
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
    color: MibuBrand.copper,
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
    backgroundColor: MibuBrand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.brownDark,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MibuBrand.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: MibuBrand.tan,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
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
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
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
    backgroundColor: MibuBrand.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  divider: {
    height: 1,
    backgroundColor: MibuBrand.tanLight,
    marginVertical: 4,
  },
  // Danger Zone styles
  dangerCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
