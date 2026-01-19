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
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { MerchantDailyCode, MerchantCredits } from '../../../types';
import { RoleSwitcher } from '../../shared/components/RoleSwitcher';
import { MibuBrand } from '../../../../constants/Colors';

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
    setUser(null);
    router.replace('/login');
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
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header - Lovable 風格 */}
      <View style={styles.header}>
        <Text style={styles.title}>{translations.title}</Text>
        <View style={styles.headerRight}>
          {/* 店家選擇器 */}
          <TouchableOpacity style={styles.storeSelector}>
            <Text style={styles.storeName} numberOfLines={1}>
              {state.user?.firstName || (isZh ? '示範咖啡廳' : 'Demo Cafe')}
            </Text>
            <Ionicons name="chevron-down" size={16} color={MibuBrand.copper} />
          </TouchableOpacity>
          {/* 新增店家按鈕 */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/merchant/places' as any)}
          >
            <Ionicons name="add" size={24} color={MibuBrand.copper} />
          </TouchableOpacity>
          {/* 登出按鈕 */}
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={MibuBrand.copper} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 主選單 - Lovable 風格（5 個主要功能） */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/analytics' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="bar-chart-outline" size={22} color={MibuBrand.copper} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '數據分析' : 'Analytics'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '查看店家與優惠券統計' : 'View statistics and insights'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/places' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="storefront-outline" size={22} color={MibuBrand.copper} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '店家管理' : 'Store Management'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '管理您的店家資訊' : 'Manage your store info'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/products' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="cube-outline" size={22} color={MibuBrand.copper} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '商品管理' : 'Product Management'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '管理商品與服務' : 'Manage products and services'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/coupons' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="pricetags-outline" size={22} color={MibuBrand.copper} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '優惠券管理' : 'Coupon Management'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '建立與管理優惠券' : 'Create and manage coupons'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/profile' as any)}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="person-outline" size={22} color={MibuBrand.copper} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{isZh ? '商家資料' : 'Merchant Profile'}</Text>
            <Text style={styles.menuSubtitle}>{isZh ? '編輯商家基本資訊' : 'Edit basic merchant info'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    maxWidth: 140,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '500',
    color: MibuBrand.brownDark,
    marginRight: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuSection: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
});
