/**
 * ============================================================
 * MerchantDashboardScreen - 商家儀表板（#074 完全重寫）
 * ============================================================
 * 初始化流程：
 *   GET /api/merchant/me
 *   ├─ merchant === null → router.push('/merchant-apply')
 *   ├─ status === 'pending' → 待審核 UI
 *   ├─ status === 'rejected' → 拒絕原因 + 重新申請
 *   └─ status === 'approved'
 *       ├─ GET /api/merchant/daily-code
 *       └─ GET /api/merchant/permissions
 *
 * 更新日期：2026-03-10（#074 商家後台完整重做）
 */
import React from 'react';
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
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import {
  useMerchantMe,
  useMerchantDailyCode,
  useMerchantPermissions,
} from '../../../hooks/useMerchantQueries';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import { LOCALE_MAP } from '../../../utils/i18n';
import type { MerchantMe, MerchantStatus, MerchantLevel } from '../../../types/merchant';

// ========== 選單項目定義 ==========

interface MenuItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  subtitleKey: string;
  route: string;
  requiresApproved: boolean;
  requiresPro: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'analytics',
    icon: 'bar-chart-outline',
    titleKey: 'merchant_analytics',
    subtitleKey: 'merchant_analyticsDesc',
    route: '/merchant/analytics',
    requiresApproved: true,
    requiresPro: true,
  },
  {
    key: 'places',
    icon: 'storefront-outline',
    titleKey: 'merchant_storeManagement',
    subtitleKey: 'merchant_storeManagementDesc',
    route: '/merchant/places',
    requiresApproved: true,
    requiresPro: false,
  },
  {
    key: 'coupons',
    icon: 'pricetags-outline',
    titleKey: 'merchant_couponManagement',
    subtitleKey: 'merchant_couponManagementDesc',
    route: '/merchant/coupons',
    requiresApproved: true,
    requiresPro: false,
  },
  {
    key: 'profile',
    icon: 'person-outline',
    titleKey: 'merchant_merchantProfile',
    subtitleKey: 'merchant_merchantProfileDesc',
    route: '/merchant/profile',
    requiresApproved: false,
    requiresPro: false,
  },
];

// ========== 主元件 ==========

export function MerchantDashboardScreen() {
  const { setUser } = useAuth();
  const { t, language } = useI18n();
  const router = useRouter();

  // ========== React Query ==========
  const meQuery = useMerchantMe();
  const merchant = meQuery.data?.merchant ?? null;
  const isApproved = merchant?.status === 'approved';

  const dailyCodeQuery = useMerchantDailyCode(isApproved);
  const permissionsQuery = useMerchantPermissions(isApproved);

  // ========== 衍生狀態 ==========
  const merchantLevel: MerchantLevel = merchant?.merchantLevel ?? 'free';
  const hasPro = merchantLevel === 'pro' || merchantLevel === 'premium';

  // ========== 初始化流程：null → 導向申請 ==========
  React.useEffect(() => {
    if (!meQuery.isLoading && !meQuery.isError && merchant === null) {
      router.replace('/merchant-apply' as any);
    }
  }, [meQuery.isLoading, meQuery.isError, merchant]);

  // ========== 事件處理 ==========
  const handleLogout = async () => {
    await setUser(null);
    router.replace('/login');
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.requiresApproved && !isApproved) {
      Alert.alert('', t.merchant_pendingLockMessage || '商家審核通過後即可使用');
      return;
    }
    if (item.requiresPro && !hasPro) {
      Alert.alert('', t.merchant_upgradeRequired || '此功能需升級至 Pro 方案');
      return;
    }
    router.push(item.route as any);
  };

  const formatExpiry = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(LOCALE_MAP[language], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ========== 載入中 ==========
  if (meQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  // ========== 錯誤 ==========
  if (meQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <ErrorState
          message={t.common_loadFailed}
          onRetry={() => meQuery.refetch()}
        />
      </View>
    );
  }

  // ========== merchant === null → 等 useEffect 導向 ==========
  if (!merchant) return null;

  // ========== 渲染子區塊 ==========

  const renderPendingCard = () => (
    <View style={[styles.statusCard, { borderColor: SemanticColors.warningMain }]}>
      <Ionicons name="time-outline" size={28} color={SemanticColors.warningMain} />
      <View style={styles.statusCardContent}>
        <Text style={styles.statusCardTitle}>
          {t.merchant_pendingTitle || '申請審核中'}
        </Text>
        <Text style={styles.statusCardSubtitle}>
          {t.merchant_pendingDesc || '我們正在審核您的商家申請，請耐心等候'}
        </Text>
        {merchant.createdAt && (
          <Text style={styles.statusCardMeta}>
            {t.merchant_appliedAt || '申請時間'}：{formatExpiry(merchant.createdAt)}
          </Text>
        )}
      </View>
    </View>
  );

  const renderRejectedCard = () => (
    <View style={[styles.statusCard, { borderColor: SemanticColors.errorMain }]}>
      <Ionicons name="close-circle-outline" size={28} color={SemanticColors.errorMain} />
      <View style={styles.statusCardContent}>
        <Text style={[styles.statusCardTitle, { color: SemanticColors.errorMain }]}>
          {t.merchant_rejectedTitle || '申請未通過'}
        </Text>
        {merchant.rejectionReason && (
          <Text style={styles.statusCardSubtitle}>
            {t.merchant_rejectionReason || '原因'}：{merchant.rejectionReason}
          </Text>
        )}
        <TouchableOpacity
          style={styles.reapplyButton}
          onPress={() => router.push('/merchant-apply' as any)}
        >
          <Text style={styles.reapplyButtonText}>
            {t.merchant_reapply || '重新申請'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDailyCodeCard = () => {
    const dailyCode = dailyCodeQuery.data;
    if (!dailyCode) return null;

    return (
      <View style={styles.dailyCodeCard}>
        <View style={styles.dailyCodeHeader}>
          <Ionicons name="qr-code-outline" size={20} color={MibuBrand.copper} />
          <Text style={styles.dailyCodeLabel}>
            {t.merchant_dailyCode || '今日核銷碼'}
          </Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>
              {merchant.subscriptionPlan?.toUpperCase() || 'FREE'}
            </Text>
          </View>
        </View>
        <Text style={styles.dailyCodeValue}>{dailyCode.seedCode}</Text>
        <Text style={styles.dailyCodeExpiry}>
          {t.merchant_expiresAt || '有效期至'} {formatExpiry(dailyCode.expiresAt)}
        </Text>
      </View>
    );
  };

  const renderMenuGrid = () => (
    <View style={styles.menuSection}>
      {MENU_ITEMS.map((item) => {
        const isLocked = (item.requiresApproved && !isApproved) ||
                         (item.requiresPro && !hasPro);
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.menuItem, isLocked && styles.menuItemLocked]}
            onPress={() => handleMenuPress(item)}
            activeOpacity={isLocked ? 0.6 : 0.7}
          >
            <View style={[styles.menuIcon, isLocked && styles.menuIconLocked]}>
              <Ionicons
                name={item.icon}
                size={22}
                color={isLocked ? MibuBrand.tan : MibuBrand.copper}
              />
              {isLocked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={10} color={MibuBrand.warmWhite} />
                </View>
              )}
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, isLocked && styles.menuTitleLocked]}>
                {(t as any)[item.titleKey] || item.titleKey}
              </Text>
              <Text style={styles.menuSubtitle}>
                {(t as any)[item.subtitleKey] || item.subtitleKey}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isLocked ? MibuBrand.tanLight : MibuBrand.tan}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ========== 主要渲染 ==========
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 頂部標題 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t.merchant_dashboard || '商家後台'}</Text>
          {merchant.businessName && (
            <Text style={styles.businessName}>{merchant.businessName}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleLogout}
          accessibilityLabel="登出"
        >
          <Ionicons name="log-out-outline" size={22} color={MibuBrand.copper} />
        </TouchableOpacity>
      </View>

      {/* 狀態卡片（依狀態顯示） */}
      {merchant.status === 'pending' && renderPendingCard()}
      {merchant.status === 'rejected' && renderRejectedCard()}
      {merchant.status === 'approved' && renderDailyCodeCard()}

      {/* 功能選單 */}
      {renderMenuGrid()}
    </ScrollView>
  );
}

// ========== 樣式 ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  content: {
    padding: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: MibuBrand.copper,
    fontSize: FontSize.lg,
  },

  // 頂部標題
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  businessName: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 狀態卡片（pending / rejected）
  statusCard: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    gap: Spacing.md,
  },
  statusCardContent: {
    flex: 1,
  },
  statusCardTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.xs,
  },
  statusCardSubtitle: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    lineHeight: 20,
  },
  statusCardMeta: {
    fontSize: FontSize.sm,
    color: MibuBrand.tan,
    marginTop: Spacing.sm,
  },
  reapplyButton: {
    marginTop: Spacing.md,
    backgroundColor: MibuBrand.brown,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
  },
  reapplyButtonText: {
    color: MibuBrand.warmWhite,
    fontSize: FontSize.md,
    fontWeight: '600',
  },

  // 核銷碼卡片（approved）
  dailyCodeCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  dailyCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dailyCodeLabel: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    flex: 1,
  },
  planBadge: {
    backgroundColor: MibuBrand.cream,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
  },
  planBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  dailyCodeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  dailyCodeExpiry: {
    fontSize: FontSize.sm,
    color: MibuBrand.tan,
    textAlign: 'center',
  },

  // 選單
  menuSection: {
    gap: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  menuItemLocked: {
    opacity: 0.7,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuIconLocked: {
    backgroundColor: MibuBrand.tanLight,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: MibuBrand.tan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  menuTitleLocked: {
    color: MibuBrand.tan,
  },
  menuSubtitle: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
  },
});
