import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { MerchantDailyCode, MerchantCredits } from '../types';
import { RoleSwitcher } from '../components/RoleSwitcher';

export function MerchantDashboardScreen() {
  const { state, getToken, setUser } = useApp();
  const router = useRouter();
  const [dailyCode, setDailyCode] = useState<MerchantDailyCode | null>(null);
  const [credits, setCredits] = useState<MerchantCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '商家後台' : 'Merchant Dashboard',
    dailyCode: isZh ? '今日核銷碼' : "Today's Verification Code",
    expiresAt: isZh ? '有效期至' : 'Valid until',
    credits: isZh ? '點數餘額' : 'Credit Balance',
    points: isZh ? '點' : 'pts',
    topUp: isZh ? '儲值' : 'Top Up',
    useStripe: isZh ? '使用 Stripe 付款' : 'Pay with Stripe',
    useRecur: isZh ? '使用 Recur 付款' : 'Pay with Recur',
    purchaseAmount: isZh ? '購買點數' : 'Purchase Credits',
    min100: isZh ? '最低 100 點' : 'Minimum 100 points',
    loading: isZh ? '載入中...' : 'Loading...',
    error: isZh ? '載入失敗' : 'Failed to load',
    logout: isZh ? '登出' : 'Logout',
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@mibu_token');
    await AsyncStorage.removeItem('@mibu_user');
    setUser(null);
    router.replace('/');
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const [codeData, creditsData] = await Promise.all([
        apiService.getMerchantDailyCode(token).catch(() => null),
        apiService.getMerchantCredits(token).catch(() => null),
      ]);

      setDailyCode(codeData);
      setCredits(creditsData);
    } catch (error) {
      console.error('Failed to load merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (provider: 'stripe' | 'recur', amount: number) => {
    try {
      setPurchasing(true);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.purchaseCredits(token, amount, provider);
      
      if (response.checkoutUrl) {
        await Linking.openURL(response.checkoutUrl);
      } else {
        Alert.alert(
          isZh ? '成功' : 'Success',
          response.message || (isZh ? '交易已建立' : 'Transaction created')
        );
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '購買失敗' : 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isZh ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{translations.title}</Text>
          {state.user?.isSuperAdmin && <RoleSwitcher compact />}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>{translations.logout}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.cardLabel}>{translations.dailyCode}</Text>
        {dailyCode ? (
          <>
            <Text style={styles.codeText}>{dailyCode.code}</Text>
            <Text style={styles.expiryText}>
              {translations.expiresAt}: {formatExpiry(dailyCode.expiresAt)}
            </Text>
          </>
        ) : (
          <Text style={styles.errorText}>{translations.error}</Text>
        )}
      </View>

      <View style={styles.creditsCard}>
        <View style={styles.creditsHeader}>
          <Ionicons name="wallet-outline" size={24} color="#6366f1" />
          <Text style={styles.cardLabel}>{translations.credits}</Text>
        </View>
        <Text style={styles.creditsAmount}>
          {credits?.creditBalance ?? 0}
          <Text style={styles.creditsUnit}> {translations.points}</Text>
        </Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/transactions' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="receipt-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '交易記錄' : 'Transaction History'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '查看所有交易' : 'View all transactions'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/verify' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '驗證核銷碼' : 'Verify Code'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '驗證其他商家的核銷碼' : 'Verify merchant codes'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/places' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="storefront-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '店家管理' : 'Place Management'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '認領與管理店家' : 'Claim and manage places'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/products' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="cube-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '商品管理' : 'Product Management'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '建立與編輯商品' : 'Create and edit products'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/coupons' as any)}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="pricetag-outline" size={24} color="#f59e0b" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '優惠券管理' : 'Coupon Management'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '創建與管理優惠券' : 'Create and manage coupons'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/profile' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="person-circle-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '商家資料' : 'Merchant Profile'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '查看商家資訊' : 'View merchant info'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.topUpSection}>
        <Text style={styles.sectionTitle}>{translations.topUp}</Text>
        <Text style={styles.sectionSubtitle}>{translations.min100}</Text>

        <View style={styles.amountButtons}>
          {[100, 500, 1000].map(amount => (
            <TouchableOpacity
              key={amount}
              style={styles.amountButton}
              onPress={() => handlePurchase('stripe', amount)}
              disabled={purchasing}
            >
              <Text style={styles.amountButtonText}>{amount} {translations.points}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.paymentButtons}>
          <TouchableOpacity
            style={[styles.paymentButton, styles.stripeButton]}
            onPress={() => handlePurchase('stripe', 500)}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="#ffffff" />
                <Text style={styles.paymentButtonText}>{translations.useStripe}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentButton, styles.recurButton]}
            onPress={() => handlePurchase('recur', 500)}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="repeat-outline" size={20} color="#ffffff" />
                <Text style={styles.paymentButtonText}>{translations.useRecur}</Text>
              </>
            )}
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  codeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#6366f1',
    letterSpacing: 8,
    marginBottom: 8,
  },
  expiryText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  creditsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  creditsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  creditsAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1e293b',
  },
  creditsUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
  },
  menuSection: {
    marginBottom: 24,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  topUpSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  amountButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  amountButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  amountButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  paymentButtons: {
    gap: 12,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  stripeButton: {
    backgroundColor: '#6366f1',
  },
  recurButton: {
    backgroundColor: '#10b981',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
