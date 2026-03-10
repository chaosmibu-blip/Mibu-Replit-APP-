/**
 * MerchantDashboardScreen - 商家儀表板
 *
 * 功能說明：
 * - 商家後台首頁，顯示主要功能入口
 * - 進入時先檢查商家審核狀態（GET /api/merchant/me）
 * - approved → 顯示完整 Dashboard + 每日核銷碼
 * - pending → 顯示審核中提示
 * - rejected → 顯示審核未通過提示
 *
 * 更新日期：2026-03-09（移除 credits API + 加入 merchant status 檢查）
 */
import React from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { useMerchantMe } from '../../../hooks/useMerchantQueries';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';

// ============ 主元件 ============
export function MerchantDashboardScreen() {
  // ============ Hooks ============
  const { user, setUser } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ============ React Query Hooks ============
  const merchantQuery = useMerchantMe();
  const merchantStatus = merchantQuery.data?.status;

  // ============ 事件處理函數 ============
  const handleLogout = async () => {
    await setUser(null);
    router.replace('/login');
  };

  // ============ 載入中畫面 ============
  if (merchantQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  // ============ 商家資料載入失敗 ============
  if (merchantQuery.isError) {
    return (
      <View style={styles.loadingContainer}>
        <ErrorState
          message={t.common_loadFailed}
          onRetry={() => merchantQuery.refetch()}
        />
      </View>
    );
  }

  // ============ 商家審核狀態檢查 ============
  if (merchantStatus === 'pending') {
    return (
      <View style={[styles.statusContainer, { paddingTop: insets.top + 40 }]}>
        <Ionicons name="time-outline" size={64} color={MibuBrand.copper} />
        <Text style={styles.statusTitle}>{t.merchant_pendingTitle || '審核中'}</Text>
        <Text style={styles.statusMessage}>
          {t.merchant_pendingMessage || '您的商家帳號正在審核中，請耐心等待管理員核准。'}
        </Text>
        <TouchableOpacity style={styles.statusButton} onPress={handleLogout}>
          <Text style={styles.statusButtonText}>{t.common_logout}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (merchantStatus === 'rejected') {
    return (
      <View style={[styles.statusContainer, { paddingTop: insets.top + 40 }]}>
        <Ionicons name="close-circle-outline" size={64} color={SemanticColors.errorMain} />
        <Text style={styles.statusTitle}>{t.merchant_rejectedTitle || '審核未通過'}</Text>
        <Text style={styles.statusMessage}>
          {t.merchant_rejectedMessage || '很抱歉，您的商家申請未通過審核。如有疑問請聯繫客服。'}
        </Text>
        <TouchableOpacity style={styles.statusButton} onPress={handleLogout}>
          <Text style={styles.statusButtonText}>{t.common_logout}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============ 主要 JSX 渲染 ============
  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
      {/* ============ 頂部標題區 ============ */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.merchant_dashboard}</Text>
        <View style={styles.headerRight}>
          {/* 店家選擇器 */}
          <TouchableOpacity style={styles.storeSelector} accessibilityLabel="選擇店家">
            <Text style={styles.storeName} numberOfLines={1}>
              {user?.firstName || t.merchant_demoCafe}
            </Text>
            <Ionicons name="chevron-down" size={16} color={MibuBrand.copper} />
          </TouchableOpacity>
          {/* 新增店家按鈕 */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/merchant/places' as any)}
            accessibilityLabel="新增店家"
          >
            <Ionicons name="add" size={24} color={MibuBrand.copper} />
          </TouchableOpacity>
          {/* 登出按鈕 */}
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout} accessibilityLabel="登出">
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
          accessibilityLabel="數據分析"
        >
          <View style={styles.menuIcon}>
            <Ionicons name="bar-chart-outline" size={22} color={MibuBrand.copper} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t.merchant_analytics}</Text>
            <Text style={styles.menuSubtitle}>{t.merchant_analyticsDesc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
        </TouchableOpacity>

        {/* 店家管理入口 */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/places' as any)}
          accessibilityLabel="店家管理"
        >
          <View style={styles.menuIcon}>
            <Ionicons name="storefront-outline" size={22} color={MibuBrand.copper} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t.merchant_storeManagement}</Text>
            <Text style={styles.menuSubtitle}>{t.merchant_storeManagementDesc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
        </TouchableOpacity>

        {/* 優惠券管理入口 */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/coupons' as any)}
          accessibilityLabel="優惠券管理"
        >
          <View style={styles.menuIcon}>
            <Ionicons name="pricetags-outline" size={22} color={MibuBrand.copper} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t.merchant_couponManagement}</Text>
            <Text style={styles.menuSubtitle}>{t.merchant_couponManagementDesc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
        </TouchableOpacity>

        {/* 商家資料入口 */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/merchant/profile' as any)}
          accessibilityLabel="商家資料"
        >
          <View style={styles.menuIcon}>
            <Ionicons name="person-outline" size={22} color={MibuBrand.copper} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{t.merchant_merchantProfile}</Text>
            <Text style={styles.menuSubtitle}>{t.merchant_merchantProfileDesc}</Text>
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
  // 審核狀態頁面
  statusContainer: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginTop: 20,
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 15,
    color: MibuBrand.copper,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: MibuBrand.brown,
    borderRadius: 20,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFDF9',
  },
});
