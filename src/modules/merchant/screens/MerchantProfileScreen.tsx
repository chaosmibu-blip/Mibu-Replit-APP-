/**
 * MerchantProfileScreen - 商家資料
 *
 * 功能說明：
 * - 顯示商家基本資訊（名稱、信箱、狀態、餘額、方案等）
 * - 提供刪除帳號功能
 *
 * 串接的 API：
 * - GET /merchant/me - 取得商家個人資料
 * - DELETE /auth/account - 刪除帳號
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { authApi } from '../../../services/authApi';
import { MerchantMe } from '../../../types';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

// ============ 主元件 ============
export function MerchantProfileScreen() {
  // ============ Hooks ============
  const { state, getToken, setUser } = useApp();
  const router = useRouter();

  // ============ 狀態變數 ============
  // merchant: 商家資料
  const [merchant, setMerchant] = useState<MerchantMe | null>(null);
  // loading: 資料載入狀態
  const [loading, setLoading] = useState(true);

  // isZh: 判斷是否為中文語系
  const isZh = state.language === 'zh-TW';

  // ============ 多語系翻譯 ============
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

  // ============ Effect Hooks ============
  // 元件載入時取得商家資料
  useEffect(() => {
    loadMerchant();
  }, []);

  // ============ 資料載入函數 ============

  /**
   * loadMerchant - 載入商家資料
   */
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

  // ============ 工具函數 ============

  /**
   * formatDate - 格式化日期
   * @param dateStr - ISO 日期字串
   * @returns 格式化後的日期字串
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isZh ? 'zh-TW' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * getPlanLabel - 取得方案名稱
   * @param plan - 方案代碼
   * @returns 方案顯示名稱
   */
  const getPlanLabel = (plan?: string) => {
    switch (plan) {
      case 'partner': return translations.partner;
      case 'premium': return translations.premium;
      default: return translations.free;
    }
  };

  // ============ 事件處理函數 ============

  /**
   * handleDeleteAccount - 處理刪除帳號
   * 顯示確認對話框，確認後呼叫 API 刪除帳號
   */
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
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      {/* ============ 頭像區塊 ============ */}
      <View style={styles.avatarSection}>
        {/* 商家頭像 */}
        <View style={styles.avatar}>
          <Ionicons name="storefront" size={48} color={MibuBrand.brown} />
        </View>
        {/* 商家名稱 */}
        <Text style={styles.businessName}>
          {merchant?.businessName || merchant?.name || '-'}
        </Text>
        {/* 審核狀態標籤 */}
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

      {/* ============ 資訊卡片 ============ */}
      <View style={styles.infoCard}>
        {/* 聯絡信箱 */}
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

        {/* 點數餘額 */}
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

        {/* 訂閱方案 */}
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

        {/* 加入時間 */}
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

      {/* ============ 危險區域 ============ */}
      <View style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>{translations.dangerZone}</Text>
        {/* 刪除帳號按鈕 */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color={UIColors.white} />
          <Text style={styles.deleteButtonText}>{translations.deleteAccount}</Text>
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
  // 內容區
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
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  // 返回按鈕
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
  // 頁面標題
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.brownDark,
  },
  // 頭像區塊
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  // 頭像容器
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
  // 商家名稱
  businessName: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: 12,
  },
  // 狀態標籤
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  // 已核准標籤
  approvedBadge: {
    backgroundColor: SemanticColors.successLight,
  },
  // 待審核標籤
  pendingBadge: {
    backgroundColor: SemanticColors.warningLight,
  },
  // 狀態文字
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // 已核准文字
  approvedText: {
    color: SemanticColors.successDark,
  },
  // 待審核文字
  pendingText: {
    color: SemanticColors.warningDark,
  },
  // 資訊卡片
  infoCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 資訊列
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  // 資訊圖示容器
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MibuBrand.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  // 資訊內容區
  infoContent: {
    flex: 1,
  },
  // 資訊標籤
  infoLabel: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginBottom: 4,
  },
  // 資訊數值
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  // 分隔線
  divider: {
    height: 1,
    backgroundColor: MibuBrand.tanLight,
    marginVertical: 4,
  },
  // 危險區域卡片
  dangerCard: {
    backgroundColor: SemanticColors.errorLight,
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  // 危險區域標題
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: SemanticColors.errorDark,
    marginBottom: 16,
  },
  // 刪除按鈕
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SemanticColors.errorDark,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  // 刪除按鈕文字
  deleteButtonText: {
    color: UIColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
