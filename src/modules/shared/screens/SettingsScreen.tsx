/**
 * SettingsScreen - 設定頁面
 *
 * 功能：
 * - 帳號：個人資料、推薦好友、語言設定
 * - 探索：解鎖全球地圖、等級與成就
 * - 偏好設定：我的最愛/黑名單、推播通知
 * - 更多功能：帳號綁定、社群貢獻
 * - 關於：隱私政策、服務條款、幫助中心
 * - 帳號管理：登出、刪除帳號
 *
 * 串接 API：
 * - apiService.logout() - 登出
 * - apiService.deleteAccount() - 刪除帳號
 *
 * 跳轉頁面：
 * - /profile - 個人資料
 * - /referral - 推薦好友
 * - /map - 解鎖全球地圖
 * - /economy - 等級與成就
 * - /favorites-management - 我的最愛/黑名單
 * - /account - 帳號綁定
 * - /contribution - 社群貢獻
 * - /admin-exclusions - 管理員：全域排除管理
 * - /login - 登出後
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Linking, Switch, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, useI18n, useGacha } from '../../../context/AppContext';
import { Language } from '../../../types';
import { apiService } from '../../../services/api';
import { pushNotificationService } from '../../../services/pushNotificationService';
import { usePartnerApplicationStatus } from '../../../hooks/useEconomyQueries';
import { useMerchantApplicationStatus } from '../../../hooks/useMerchantQueries';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';
import { STORAGE_KEYS } from '../../../constants/storageKeys';
import { hasAcceptedAiDisclosure, revokeAiConsent, grantAiConsent } from '../components/AiDisclosureModal';

// ============================================================
// 常數定義
// ============================================================

/**
 * 支援的語言選項
 */
const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

// ============================================================
// 型別定義
// ============================================================

/**
 * 設定項目介面
 */
type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;  // 圖示名稱
  label: string;                          // 顯示文字
  action?: () => void;                    // 點擊動作
  hasArrow?: boolean;                     // 是否顯示箭頭
  highlight?: boolean;                    // 是否高亮顯示
  badge?: string;                         // 右側徽章文字
  value?: string;                         // 右側顯示值
  toggle?: boolean;                       // 是否為開關
  checked?: boolean;                      // 開關狀態
  onChange?: (value: boolean) => void;    // 開關變更回調
  toggleDisabled?: boolean;              // 開關是否禁用
  iconBg?: string;                        // 圖示背景色
  iconColor?: string;                     // 圖示顏色
};

/**
 * 設定群組介面
 */
type SettingGroup = {
  title: string;          // 群組標題
  items: SettingItem[];   // 群組內的項目
};

// ============================================================
// 主元件
// ============================================================

export function SettingsScreen() {
  // ============================================================
  // Hooks & Context
  // ============================================================
  const { user, isAuthenticated, setUser, getToken } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { gachaState } = useGacha();
  const router = useRouter();

  // ============================================================
  // 狀態管理
  // ============================================================

  // 語言選擇 Modal
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // 推播通知開關狀態（從 AsyncStorage 讀取）
  const [notifications, setNotifications] = useState(true);
  // 切換中鎖（防重複觸發）
  const [isTogglingPush, setIsTogglingPush] = useState(false);

  // AI 資料分享開關狀態（#062 Apple Guideline 5.1.2(i)）
  const [aiDataSharing, setAiDataSharing] = useState(false);

  // #053: 自己人/商家申請狀態
  const partnerStatusQuery = usePartnerApplicationStatus();
  const merchantStatusQuery = useMerchantApplicationStatus();
  const partnerStatus = partnerStatusQuery.data?.status ?? 'none';
  const merchantStatus = merchantStatusQuery.data?.status ?? 'none';

  // 讀取通知偏好設定（同步檢查系統權限）
  useEffect(() => {
    const checkStatus = async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_NOTIFICATION);
      if (stored === 'false') {
        setNotifications(false);
        return;
      }
      // 檢查系統層級通知權限
      if (pushNotificationService.isAvailable()) {
        try {
          const Notif = require('expo-notifications');
          const { status } = await Notif.getPermissionsAsync();
          if (status !== 'granted') setNotifications(false);
        } catch {
          // 不支援的環境靜默處理
        }
      }
    };
    checkStatus();
  }, []);

  // 讀取 AI 資料分享同意狀態（#062）
  useEffect(() => {
    hasAcceptedAiDisclosure().then(setAiDataSharing);
  }, []);

  /**
   * 切換 AI 資料分享同意
   * 撤回後，下次使用 AI 功能會重新顯示同意彈窗
   */
  const handleToggleAiDataSharing = useCallback(async (enabled: boolean) => {
    setAiDataSharing(enabled);
    if (enabled) {
      await grantAiConsent();
    } else {
      await revokeAiConsent();
    }
  }, []);

  /**
   * 切換推播通知
   * 連動 pushNotificationService 註冊/取消註冊 Token
   * 失敗時回滾 UI + AsyncStorage 並提示用戶
   */
  const handleToggleNotifications = useCallback(async (enabled: boolean) => {
    if (isTogglingPush) return;
    setIsTogglingPush(true);
    setNotifications(enabled);

    try {
      const token = await getToken();
      if (!token) {
        // 無 token，回滾
        setNotifications(!enabled);
        return;
      }

      if (enabled) {
        // 開啟：註冊推播 Token（含系統權限請求）
        const success = await pushNotificationService.registerTokenWithBackend(token);
        if (!success) {
          // 註冊失敗（可能是權限被拒）
          setNotifications(false);
          await AsyncStorage.setItem(STORAGE_KEYS.PUSH_NOTIFICATION, 'false');
          Alert.alert(
            t.settings_pushNotifications,
            t.mailbox_loadFailedDesc,  // 通用「請稍後再試」提示
            [
              { text: t.cancel, style: 'cancel' },
              {
                text: t.settings_openSystemSettings,
                onPress: () => Linking.openSettings(),
              },
            ],
          );
          return;
        }
      } else {
        // 關閉：取消註冊推播 Token
        await pushNotificationService.unregisterToken(token);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_NOTIFICATION, String(enabled));
    } catch (error) {
      // 失敗：回滾 UI 和本地儲存
      console.error('Toggle push notification failed:', error);
      setNotifications(!enabled);
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_NOTIFICATION, String(!enabled));
      Alert.alert(t.settings_pushNotifications, t.mailbox_loadFailedDesc);
    } finally {
      setIsTogglingPush(false);
    }
  }, [getToken, isTogglingPush, t]);

  // 當前選中的語言
  const currentLang = LANGUAGE_OPTIONS.find(l => l.code === language) || LANGUAGE_OPTIONS[0];

  // ============================================================
  // 帳號操作
  // ============================================================

  /**
   * 處理登出
   * 顯示確認對話框，確認後清除用戶狀態並跳轉到登入頁
   */
  const handleLogout = async () => {
    Alert.alert(
      t.settings_confirmLogout,
      t.settings_confirmLogoutDesc,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.settings_logout,
          style: 'destructive',
          onPress: async () => {
            try {
              // 呼叫後端登出 API（忽略錯誤）
              const token = await getToken();
              if (token) {
                await apiService.logout(token).catch(() => {});
              }
            } catch {}

            // 清除本地用戶狀態（必須 await，否則清理尚未完成就跳轉，導致競態條件）
            await setUser(null);
            router.replace('/login');
          },
        },
      ]
    );
  };

  /**
   * 處理刪除帳號
   * 顯示警告對話框，確認後刪除帳號
   */
  const handleDeleteAccount = () => {
    Alert.alert(
      t.settings_deleteAccountTitle,
      t.settings_deleteAccountDesc,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.settings_deleteAccount,
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (token) {
                const response = await apiService.deleteAccount(token);

                if (response.success) {
                  // 刪除成功：清除狀態並跳轉
                  await setUser(null);
                  router.replace('/');
                } else {
                  // 刪除失敗：顯示錯誤訊息
                  let errorMsg = response.message || response.error;

                  // 特殊錯誤碼處理
                  if (response.code === 'MERCHANT_ACCOUNT_EXISTS') {
                    errorMsg = t.settings_deactivateMerchantFirst;
                  }

                  Alert.alert(
                    t.settings_cannotDelete,
                    errorMsg || t.settings_deleteFailed
                  );
                }
              }
            } catch {
              Alert.alert(
                t.error,
                t.settings_deleteFailed
              );
            }
          },
        },
      ]
    );
  };

  // #044: 帳號合併功能已移除

  // ============================================================
  // 設定項目配置
  // ============================================================

  /**
   * 設定群組配置
   * 根據登入狀態顯示不同項目
   */
  const settingGroups: SettingGroup[] = isAuthenticated ? [
    // ===== 已登入狀態 =====
    {
      title: t.settings_account,
      items: [
        {
          icon: 'person-outline',
          label: t.settings_profile,
          action: () => router.push('/profile' as any),
          hasArrow: true,
          iconBg: SemanticColors.warningLight,
          iconColor: SemanticColors.warningDark,
        },
        {
          icon: 'gift-outline',
          label: t.referAndEarn,
          action: () => router.push('/referral' as any),
          hasArrow: true,
          highlight: true,
          iconBg: '#ECFDF5',
          iconColor: '#059669',
        },
        {
          icon: 'globe-outline',
          label: t.settings_language,
          action: () => setShowLanguageDropdown(true),
          value: currentLang.label,
          hasArrow: true,
          iconBg: MibuBrand.creamLight,
          iconColor: MibuBrand.brown,
        },
      ],
    },
    {
      title: t.explore,
      items: [
        {
          icon: 'trophy-outline',
          label: t.settings_achievements,
          action: () => router.push('/economy' as any),
          hasArrow: true,
          iconBg: '#FFF3D4',
          iconColor: '#D4A24C',
        },
      ],
    },
    // 信箱群組（#045 統一收件箱）
    {
      title: t.mailbox_title,
      items: [
        {
          icon: 'mail-outline',
          label: t.mailbox_title,
          action: () => router.push('/mailbox' as any),
          hasArrow: true,
          badge: gachaState.unreadMailboxCount > 0 ? String(gachaState.unreadMailboxCount) : undefined,
          iconBg: '#EEF2FF',
          iconColor: '#6366f1',
        },
      ],
    },
    {
      title: t.explore,
      items: [
        ...(partnerStatus !== 'approved' ? [{
          icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
          label: t.settings_partnerApply,
          action: () => router.push('/partner-apply' as any),
          hasArrow: true,
          badge: partnerStatus === 'pending' ? t.settings_applicationPending : undefined,
          iconBg: '#F0FDF4',
          iconColor: MibuBrand.success,
        }] : []),
        ...(merchantStatus !== 'approved' ? [{
          icon: 'storefront-outline' as keyof typeof Ionicons.glyphMap,
          label: t.settings_merchantApply,
          action: () => router.push('/merchant-apply' as any),
          hasArrow: true,
          badge: merchantStatus === 'pending' ? t.settings_applicationPending : undefined,
          iconBg: '#FFF7ED',
          iconColor: '#EA580C',
        }] : []),
      ].filter(Boolean),
    },
    // 偏好設定群組（推播通知開關）
    {
      title: t.settings_preferences,
      items: [
        {
          icon: 'heart-outline',
          label: t.settings_favoritesBlacklist,
          action: () => router.push('/favorites-management' as any),
          hasArrow: true,
          iconBg: '#FEE2E2',
          iconColor: MibuBrand.tierSP,
        },
        {
          icon: 'notifications-outline',
          label: t.settings_pushNotifications,
          toggle: true,
          checked: notifications,
          onChange: handleToggleNotifications,
          toggleDisabled: isTogglingPush,
          iconBg: '#FFF7ED',
          iconColor: '#EA580C',
        },
        // AI 資料分享開關（#062 Apple Guideline 5.1.2(i)）
        {
          icon: 'sparkles-outline',
          label: t.settings_aiDataSharing,
          toggle: true,
          checked: aiDataSharing,
          onChange: handleToggleAiDataSharing,
          iconBg: '#EEF2FF',
          iconColor: '#6366f1',
        },
        {
          icon: 'options-outline',
          label: t.settings_notificationPreferences,
          action: () => router.push('/notification-preferences' as any),
          hasArrow: true,
          iconBg: '#F5F3FF',
          iconColor: '#7C3AED',
        },
        {
          icon: 'list-outline',
          label: t.notifList_title,
          action: () => router.push('/notifications' as any),
          hasArrow: true,
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
        },
      ],
    },
    {
      title: t.settings_moreFeatures,
      items: [
        {
          icon: 'hand-left-outline',
          label: t.settings_contributions,
          action: () => router.push('/contribution' as any),
          hasArrow: true,
          iconBg: '#F0FDF4',
          iconColor: '#16a34a',
        },
        {
          icon: 'chatbubbles-outline',
          label: t.settings_feedback,
          action: () => router.push('/feedback' as any),
          hasArrow: true,
          iconBg: '#EEF2FF',
          iconColor: '#6366f1',
        },
      ],
    },
    {
      title: t.settings_about,
      items: [
        {
          icon: 'shield-checkmark-outline',
          label: t.settings_privacyPolicy,
          action: () => Linking.openURL('https://mibu-travel.com/privacy'),
          hasArrow: true,
          iconBg: MibuBrand.highlight,
          iconColor: MibuBrand.copper,
        },
        {
          icon: 'document-text-outline',
          label: t.settings_termsOfService,
          action: () => Linking.openURL('https://mibu-travel.com/terms'),
          hasArrow: true,
          iconBg: MibuBrand.highlight,
          iconColor: MibuBrand.copper,
        },
        {
          icon: 'help-circle-outline',
          label: t.settings_helpCenter,
          action: () => Linking.openURL('https://mibu-travel.com/support'),
          hasArrow: true,
          iconBg: MibuBrand.highlight,
          iconColor: MibuBrand.copper,
        },
      ],
    },
  ] : [
    // ===== 未登入狀態 =====
    {
      title: t.settings_title,
      items: [
        {
          icon: 'globe-outline',
          label: t.settings_language,
          action: () => setShowLanguageDropdown(true),
          value: currentLang.label,
          hasArrow: true,
          iconBg: MibuBrand.creamLight,
          iconColor: MibuBrand.brown,
        },
      ],
    },
    {
      title: t.settings_about,
      items: [
        {
          icon: 'shield-checkmark-outline',
          label: t.settings_privacyPolicy,
          action: () => Linking.openURL('https://mibu-travel.com/privacy'),
          hasArrow: true,
          iconBg: MibuBrand.highlight,
          iconColor: MibuBrand.copper,
        },
        {
          icon: 'document-text-outline',
          label: t.settings_termsOfService,
          action: () => Linking.openURL('https://mibu-travel.com/terms'),
          hasArrow: true,
          iconBg: MibuBrand.highlight,
          iconColor: MibuBrand.copper,
        },
        {
          icon: 'help-circle-outline',
          label: t.settings_helpCenter,
          action: () => Linking.openURL('https://mibu-travel.com/support'),
          hasArrow: true,
          iconBg: MibuBrand.highlight,
          iconColor: MibuBrand.copper,
        },
      ],
    },
  ];

  // ============================================================
  // 渲染設定項目
  // ============================================================

  /**
   * 渲染單個設定項目
   */
  const renderSettingItem = (item: SettingItem, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={`${item.label}-${index}`}
      style={[
        styles.settingItem,
        !isLast && styles.settingItemBorder,  // 非最後一項加底線
        item.highlight && styles.settingItemHighlight,  // 高亮樣式
      ]}
      onPress={item.action}
      activeOpacity={item.toggle ? 1 : 0.7}  // 開關項目不要有點擊效果
    >
      {/* 圖示 */}
      <View style={[styles.iconContainer, { backgroundColor: item.iconBg || MibuBrand.highlight }]}>
        <Ionicons name={item.icon} size={20} color={item.iconColor || MibuBrand.brown} />
      </View>

      {/* 標籤 */}
      <Text style={[styles.itemLabel, item.highlight && styles.itemLabelHighlight]}>
        {item.label}
      </Text>

      {/* 徽章 */}
      {item.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}

      {/* 值 */}
      {item.value && (
        <Text style={styles.itemValue}>{item.value}</Text>
      )}

      {/* 開關 */}
      {item.toggle && (
        <Switch
          value={item.checked}
          onValueChange={item.onChange}
          disabled={item.toggleDisabled}
          trackColor={{ false: MibuBrand.tanLight, true: MibuBrand.brown }}
          thumbColor={UIColors.white}
        />
      )}

      {/* 箭頭 */}
      {item.hasArrow && (
        <Ionicons name="chevron-forward" size={20} color={UIColors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  // ============================================================
  // 主畫面渲染
  // ============================================================

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ========== 頁面標題 ========== */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.settings_title}</Text>
      </View>

      {/* ========== 設定群組列表 ========== */}
      {settingGroups.map((group, groupIndex) => (
        <View key={`settings-group-${groupIndex}`} style={styles.section}>
          <Text style={styles.sectionTitle}>{group.title}</Text>
          <View style={styles.card}>
            {group.items.map((item, index) =>
              renderSettingItem(item, index, index === group.items.length - 1)
            )}
          </View>
        </View>
      ))}

      {/* ========== 管理員專區（非超級管理員）========== */}
      {user?.role === 'admin' && !user?.isSuperAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings_admin}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/admin-exclusions')}
            >
              <View style={[styles.iconContainer, { backgroundColor: MibuBrand.creamLight }]}>
                <Ionicons name="ban-outline" size={20} color={MibuBrand.brown} />
              </View>
              <Text style={styles.itemLabel}>
                {t.settings_globalExclusions}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={UIColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========== 帳號管理（已登入）========== */}
      {isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings_accountManagement}</Text>
          <View style={styles.card}>
            {/* 登出 */}
            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemBorder]}
              onPress={handleLogout}
            >
              <View style={[styles.iconContainer, { backgroundColor: SemanticColors.warningLight }]}>
                <Ionicons name="log-out-outline" size={20} color={SemanticColors.warningDark} />
              </View>
              <Text style={styles.itemLabel}>{t.settings_logout}</Text>
            </TouchableOpacity>

            {/* 刪除帳號 */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleDeleteAccount}
            >
              <View style={[styles.iconContainer, { backgroundColor: SemanticColors.errorLight }]}>
                <Ionicons name="trash-outline" size={20} color={SemanticColors.errorDark} />
              </View>
              <Text style={[styles.itemLabel, { color: SemanticColors.errorDark }]}>
                {t.settings_deleteAccount}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========== 登入按鈕（未登入）========== */}
      {!isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.settings_account}</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Ionicons name="log-in-outline" size={20} color={UIColors.white} />
            <Text style={styles.loginButtonText}>{t.login}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ========== App 資訊 ========== */}
      <View style={styles.section}>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>Mibu 旅行扭蛋</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2025 查爾斯有限公司</Text>
        </View>
      </View>

      {/* ========== 語言選擇 Modal ========== */}
      <Modal
        visible={showLanguageDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t.settings_selectLanguage}
            </Text>

            {/* 語言選項列表 */}
            {LANGUAGE_OPTIONS.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  language === lang.code && styles.languageOptionActive,
                ]}
                onPress={() => {
                  setLanguage(lang.code);
                  setShowLanguageDropdown(false);
                }}
              >
                <Text style={styles.languageOptionFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageOptionLabel,
                  language === lang.code && styles.languageOptionLabelActive,
                ]}>
                  {lang.label}
                </Text>
                {/* 選中標記 */}
                {language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={MibuBrand.brown} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* #044: 帳號合併 Modal 已移除 */}
    </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// 樣式定義
// ============================================================

const styles = StyleSheet.create({
  // 容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },

  // 頁面標題
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },

  // 群組區塊
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.copper,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },

  // 卡片容器
  card: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // 設定項目
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  settingItemHighlight: {
    backgroundColor: `${MibuBrand.brown}08`,
  },

  // 圖示容器
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 標籤
  itemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  itemLabelHighlight: {
    color: MibuBrand.brown,
  },

  // 值
  itemValue: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginRight: 4,
  },

  // 徽章
  badge: {
    backgroundColor: `${MibuBrand.brown}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.brown,
  },

  // 登入按鈕
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 16,
    borderRadius: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: UIColors.white,
  },

  // App 資訊卡片
  aboutCard: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: MibuBrand.tan,
  },

  // Modal 通用
  modalOverlay: {
    flex: 1,
    backgroundColor: UIColors.overlayMedium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 16,
    textAlign: 'center',
  },

  // 語言選項
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: MibuBrand.creamLight,
  },
  languageOptionActive: {
    backgroundColor: MibuBrand.highlight,
  },
  languageOptionFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageOptionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: MibuBrand.brownDark,
  },
  languageOptionLabelActive: {
    fontWeight: '700',
    color: MibuBrand.brown,
  },

  // #044: 帳號合併樣式已移除
});
