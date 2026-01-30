/**
 * MerchantDashboardScreen - 商家儀表板
 *
 * 功能說明：
 * - 商家後台首頁，顯示主要功能入口
 * - 提供今日核銷碼和點數餘額資訊
 * - 提供快速導航至各管理功能
 *
 * 串接的 API：
 * - GET /merchant/daily-code - 取得今日核銷碼
 * - GET /merchant/credits - 取得點數餘額
 * - POST /merchant/credits/purchase - 購買點數
 */
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

// ============ 主元件 ============
export function MerchantDashboardScreen() {
  // ============ Hooks ============
  const { state, getToken, setUser } = useApp();
  const router = useRouter();

  // ============ 狀態變數 ============
  // dailyCode: 今日核銷碼資料
  const [dailyCode, setDailyCode] = useState<MerchantDailyCode | null>(null);
  // credits: 商家點數餘額資料
  const [credits, setCredits] = useState<MerchantCredits | null>(null);
  // loading: 資料載入中狀態
  const [loading, setLoading] = useState(true);
  // purchasing: 購買點數進行中狀態
  const [purchasing, setPurchasing] = useState(false);

  // isZh: 判斷是否為中文語系
  const isZh = state.language === 'zh-TW';

  // ============ 多語系翻譯 ============
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

  // ============ 事件處理函數 ============

  /**
   * handleLogout - 處理登出
   * 清除用戶資料並導向登入頁
   */
  const handleLogout = async () => {
    setUser(null);
    router.replace('/login');
  };

  // ============ Effect Hooks ============
  // 元件載入時取得資料
  useEffect(() => {
    loadData();
  }, []);

  /**
   * loadData - 載入商家資料
   * 同時取得今日核銷碼和點數餘額
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      // 並行請求核銷碼和點數資料
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

  /**
   * handlePurchase - 處理購買點數
   * @param provider - 付款提供商 ('stripe' | 'recur')
   * @param amount - 購買點數數量
   */
  const handlePurchase = async (provider: 'stripe' | 'recur', amount: number) => {
    try {
      setPurchasing(true);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.purchaseCredits(token, amount, provider);

      // 如果有結帳 URL，開啟外部連結
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

  /**
   * formatExpiry - 格式化到期時間
   * @param dateStr - ISO 格式日期字串
   * @returns 格式化後的日期時間字串
   */
  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isZh ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  // ============ 主要 JSX 渲染 ============
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ============ 頂部標題區 ============ */}
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

      {/* ============ 主選單區塊 ============ */}
      {/* 5 個主要功能入口 */}
      <View style={styles.menuSection}>
        {/* 數據分析入口 */}
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

        {/* 店家管理入口 */}
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

        {/* 商品管理入口 */}
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

        {/* 優惠券管理入口 */}
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

        {/* 商家資料入口 */}
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

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  // 內容區域
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  // 載入中容器
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 載入中文字
  loadingText: {
    marginTop: 12,
    color: MibuBrand.copper,
    fontSize: 16,
  },
  // 頂部標題區
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
    paddingBottom: 16,
  },
  // 頁面標題
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  // 右側按鈕群組
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // 店家選擇器
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
  // 店家名稱
  storeName: {
    fontSize: 14,
    fontWeight: '500',
    color: MibuBrand.brownDark,
    marginRight: 4,
  },
  // 圖示按鈕
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 選單區塊
  menuSection: {
    gap: 12,
  },
  // 選單項目
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  // 選單圖示容器
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  // 選單內容區
  menuContent: {
    flex: 1,
  },
  // 選單標題
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  // 選單副標題
  menuSubtitle: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
});
