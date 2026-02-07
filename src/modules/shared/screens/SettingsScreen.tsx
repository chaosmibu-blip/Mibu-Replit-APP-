/**
 * SettingsScreen - 設定頁面
 *
 * 功能：
 * - 帳號：個人資料、推薦好友、語言設定
 * - 探索：解鎖全球地圖、等級與成就
 * - 偏好設定：我的最愛/黑名單、推播通知
 * - 更多功能：帳號綁定、社群貢獻
 * - 關於：隱私政策、服務條款、幫助中心
 * - 帳號管理：合併帳號、登出、刪除帳號
 *
 * 串接 API：
 * - apiService.logout() - 登出
 * - apiService.deleteAccount() - 刪除帳號
 * - authApi.mergeAccount() - 合併帳號 (#036)
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
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Linking, Switch, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { Language } from '../../../types';
import { AuthScreen } from './AuthScreen';
import { apiService } from '../../../services/api';
import { authApi, MergeSummary } from '../../../services/authApi';
import { MibuBrand, UIColors } from '../../../../constants/Colors';

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
  const { state, t, setLanguage, setUser, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  // ============================================================
  // 狀態管理
  // ============================================================

  // 登入/註冊 Modal
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 語言選擇 Modal
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  // 推播通知開關狀態
  const [notifications, setNotifications] = useState(true);

  // ============================================================
  // #036 帳號合併功能狀態
  // ============================================================

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeStep, setMergeStep] = useState<'warning' | 'login' | 'processing' | 'result'>('warning');
  const [mergeResult, setMergeResult] = useState<{ success: boolean; summary?: MergeSummary; message?: string } | null>(null);
  const [secondaryToken, setSecondaryToken] = useState<string | null>(null);

  // 當前選中的語言
  const currentLang = LANGUAGE_OPTIONS.find(l => l.code === state.language) || LANGUAGE_OPTIONS[0];

  // ============================================================
  // 帳號操作
  // ============================================================

  /**
   * 處理登出
   * 顯示確認對話框，確認後清除用戶狀態並跳轉到登入頁
   */
  const handleLogout = async () => {
    Alert.alert(
      isZh ? '確認登出' : 'Confirm Logout',
      isZh ? '確定要登出嗎？' : 'Are you sure you want to logout?',
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '登出' : 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // 呼叫後端登出 API（忽略錯誤）
              const token = await getToken();
              if (token) {
                await apiService.logout(token).catch(() => {});
              }
            } catch {}

            // 清除本地用戶狀態
            setUser(null);
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
      isZh ? '刪除帳號' : 'Delete Account',
      isZh ? '確定要刪除您的帳號嗎？此操作無法復原。' : 'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '刪除' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (token) {
                const response = await apiService.deleteAccount(token);

                if (response.success) {
                  // 刪除成功：清除狀態並跳轉
                  setUser(null);
                  router.replace('/');
                } else {
                  // 刪除失敗：顯示錯誤訊息
                  let errorMsg = response.message || response.error;

                  // 特殊錯誤碼處理
                  if (response.code === 'MERCHANT_ACCOUNT_EXISTS') {
                    errorMsg = isZh ? '請先解除商家帳號' : 'Please deactivate merchant account first';
                  }

                  Alert.alert(
                    isZh ? '無法刪除' : 'Cannot Delete',
                    errorMsg || (isZh ? '刪除失敗，請稍後再試' : 'Delete failed, please try again')
                  );
                }
              }
            } catch {
              Alert.alert(
                isZh ? '錯誤' : 'Error',
                isZh ? '刪除失敗，請稍後再試' : 'Delete failed, please try again'
              );
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // #036 帳號合併功能
  // ============================================================

  /**
   * 開啟帳號合併 Modal
   * 重置所有合併相關狀態
   */
  const handleOpenMergeModal = () => {
    setMergeStep('warning');
    setMergeResult(null);
    setSecondaryToken(null);
    setShowMergeModal(true);
  };

  /**
   * 確認警告後進入登入副帳號步驟
   */
  const handleMergeConfirmWarning = () => {
    setMergeStep('login');
  };

  /**
   * 副帳號登入成功後執行合併
   */
  const handleSecondaryLoginSuccess = (token: string) => {
    setSecondaryToken(token);
    executeMerge(token);
  };

  /**
   * 執行帳號合併
   * 呼叫 authApi.mergeAccount() 將副帳號資料合併到主帳號
   */
  const executeMerge = async (secToken: string) => {
    setMergeStep('processing');

    try {
      const token = await getToken();
      if (!token) {
        setMergeResult({ success: false, message: isZh ? '請先登入' : 'Please login first' });
        setMergeStep('result');
        return;
      }

      // 呼叫合併 API
      const result = await authApi.mergeAccount(token, secToken);

      setMergeResult({
        success: result.success,
        summary: result.summary,
        message: result.message,
      });
      setMergeStep('result');
    } catch (error) {
      setMergeResult({
        success: false,
        message: isZh ? '合併失敗，請稍後再試' : 'Merge failed, please try again',
      });
      setMergeStep('result');
    }
  };

  /**
   * 關閉帳號合併 Modal
   * 重置所有狀態
   */
  const handleCloseMergeModal = () => {
    setShowMergeModal(false);
    setMergeStep('warning');
    setMergeResult(null);
    setSecondaryToken(null);
  };

  // ============================================================
  // 設定項目配置
  // ============================================================

  /**
   * 設定群組配置
   * 根據登入狀態顯示不同項目
   */
  const settingGroups: SettingGroup[] = state.isAuthenticated ? [
    // ===== 已登入狀態 =====
    {
      title: isZh ? '帳號' : 'Account',
      items: [
        {
          icon: 'person-outline',
          label: isZh ? '個人資料' : 'Profile',
          action: () => router.push('/profile' as any),
          hasArrow: true,
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
        },
        // [HIDDEN] 送審隱藏 #1 推薦領好禮
        // {
        //   icon: 'gift-outline',
        //   label: isZh ? '推薦領好禮' : 'Refer & Earn',
        //   action: () => router.push('/referral' as any),
        //   hasArrow: true,
        //   highlight: true,
        //   iconBg: '#ECFDF5',
        //   iconColor: '#059669',
        // },
        {
          icon: 'globe-outline',
          label: isZh ? '語言設定' : 'Language',
          action: () => setShowLanguageDropdown(true),
          value: currentLang.label,
          hasArrow: true,
          iconBg: '#EEF2FF',
          iconColor: '#6366f1',
        },
      ],
    },
    // [HIDDEN] 送審隱藏 #2 #3 探索群組（解鎖全球地圖 + 等級與成就）
    // {
    //   title: isZh ? '探索' : 'Explore',
    //   items: [
    //     {
    //       icon: 'map-outline',
    //       label: isZh ? '解鎖全球地圖' : 'Unlock World Map',
    //       action: () => router.push('/map' as any),
    //       hasArrow: true,
    //       badge: isZh ? '1 已解鎖' : '1 Unlocked',
    //       iconBg: '#FEF3C7',
    //       iconColor: '#D97706',
    //     },
    //     {
    //       icon: 'trophy-outline',
    //       label: isZh ? '等級與成就' : 'Level & Achievements',
    //       action: () => router.push('/economy' as any),
    //       hasArrow: true,
    //       badge: '2/10',
    //       iconBg: '#FFF3D4',
    //       iconColor: '#D4A24C',
    //     },
    //   ],
    // },
    // [HIDDEN] 送審隱藏 #4 #5 偏好設定群組（我的最愛/黑名單 + 推播通知）
    // {
    //   title: isZh ? '偏好設定' : 'Preferences',
    //   items: [
    //     {
    //       icon: 'heart-outline',
    //       label: isZh ? '我的最愛/黑名單' : 'Favorites & Blacklist',
    //       action: () => router.push('/favorites-management' as any),
    //       hasArrow: true,
    //       iconBg: '#FEE2E2',
    //       iconColor: MibuBrand.tierSP,
    //     },
    //     {
    //       icon: 'notifications-outline',
    //       label: isZh ? '推播通知' : 'Push Notifications',
    //       toggle: true,
    //       checked: notifications,
    //       onChange: setNotifications,
    //       iconBg: '#FFF7ED',
    //       iconColor: '#EA580C',
    //     },
    //   ],
    // },
    // [HIDDEN] 送審隱藏 #6 #7 更多功能群組（帳號綁定 + 社群貢獻）
    // {
    //   title: isZh ? '更多功能' : 'More Features',
    //   items: [
    //     {
    //       icon: 'link-outline',
    //       label: isZh ? '帳號綁定' : 'Linked Accounts',
    //       action: () => router.push('/account' as any),
    //       hasArrow: true,
    //       iconBg: '#EEF2FF',
    //       iconColor: '#6366f1',
    //     },
    //     {
    //       icon: 'hand-left-outline',
    //       label: isZh ? '社群貢獻' : 'Contributions',
    //       action: () => router.push('/contribution' as any),
    //       hasArrow: true,
    //       iconBg: '#F0FDF4',
    //       iconColor: '#16a34a',
    //     },
    //   ],
    // },
    {
      title: isZh ? '關於' : 'About',
      items: [
        {
          icon: 'shield-checkmark-outline',
          label: isZh ? '隱私政策' : 'Privacy Policy',
          action: () => Linking.openURL('https://mibu-travel.com/privacy'),
          hasArrow: true,
          iconBg: MibuBrand.highlight,
          iconColor: MibuBrand.copper,
        },
        {
          icon: 'document-text-outline',
          label: isZh ? '服務條款' : 'Terms of Service',
          action: () => Linking.openURL('https://mibu-travel.com/terms'),
          hasArrow: true,
          iconBg: MibuBrand.highlight,
          iconColor: MibuBrand.copper,
        },
        {
          icon: 'help-circle-outline',
          label: isZh ? '幫助中心' : 'Help Center',
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
      title: isZh ? '設定' : 'Settings',
      items: [
        {
          icon: 'globe-outline',
          label: isZh ? '語言設定' : 'Language',
          action: () => setShowLanguageDropdown(true),
          value: currentLang.label,
          hasArrow: true,
          iconBg: '#EEF2FF',
          iconColor: '#6366f1',
        },
      ],
    },
    {
      title: isZh ? '關於' : 'About',
      items: [
        {
          icon: 'shield-checkmark-outline',
          label: isZh ? '隱私政策' : 'Privacy Policy',
          action: () => Linking.openURL('https://mibu-travel.com/privacy'),
          hasArrow: true,
          iconBg: MibuBrand.highlight,
          iconColor: MibuBrand.copper,
        },
        {
          icon: 'document-text-outline',
          label: isZh ? '服務條款' : 'Terms of Service',
          action: () => Linking.openURL('https://mibu-travel.com/terms'),
          hasArrow: true,
          iconBg: MibuBrand.highlight,
          iconColor: MibuBrand.copper,
        },
        {
          icon: 'help-circle-outline',
          label: isZh ? '幫助中心' : 'Help Center',
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
          trackColor={{ false: '#e2e8f0', true: MibuBrand.brown }}
          thumbColor="#ffffff"
        />
      )}

      {/* 箭頭 */}
      {item.hasArrow && (
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
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
        <Text style={styles.title}>{isZh ? '設定' : 'Settings'}</Text>
      </View>

      {/* ========== 設定群組列表 ========== */}
      {settingGroups.map((group, groupIndex) => (
        <View key={group.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{group.title}</Text>
          <View style={styles.card}>
            {group.items.map((item, index) =>
              renderSettingItem(item, index, index === group.items.length - 1)
            )}
          </View>
        </View>
      ))}

      {/* ========== 管理員專區（非超級管理員）========== */}
      {state.user?.role === 'admin' && !state.user?.isSuperAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '管理員' : 'Admin'}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/admin-exclusions')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="ban-outline" size={20} color="#6366f1" />
              </View>
              <Text style={styles.itemLabel}>
                {isZh ? '全域排除管理' : 'Global Exclusions'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========== 帳號管理（已登入）========== */}
      {state.isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '帳號管理' : 'Account Management'}</Text>
          <View style={styles.card}>
            {/* [HIDDEN] 送審隱藏 #8 合併帳號 */}
            {/* <TouchableOpacity
              style={[styles.settingItem, styles.settingItemBorder]}
              onPress={handleOpenMergeModal}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="git-merge-outline" size={20} color="#6366f1" />
              </View>
              <Text style={styles.itemLabel}>{isZh ? '合併帳號' : 'Merge Accounts'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity> */}

            {/* 登出 */}
            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemBorder]}
              onPress={handleLogout}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="log-out-outline" size={20} color="#D97706" />
              </View>
              <Text style={styles.itemLabel}>{isZh ? '登出' : 'Logout'}</Text>
            </TouchableOpacity>

            {/* 刪除帳號 */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleDeleteAccount}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </View>
              <Text style={[styles.itemLabel, { color: '#EF4444' }]}>
                {isZh ? '刪除帳號' : 'Delete Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========== 登入按鈕（未登入）========== */}
      {!state.isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '帳號' : 'Account'}</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => setShowAuthModal(true)}>
            <Ionicons name="log-in-outline" size={20} color="#ffffff" />
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

      {/* ========== 登入/註冊 Modal ========== */}
      <AuthScreen
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

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
              {isZh ? '選擇語言' : 'Select Language'}
            </Text>

            {/* 語言選項列表 */}
            {LANGUAGE_OPTIONS.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  state.language === lang.code && styles.languageOptionActive,
                ]}
                onPress={() => {
                  setLanguage(lang.code);
                  setShowLanguageDropdown(false);
                }}
              >
                <Text style={styles.languageOptionFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageOptionLabel,
                  state.language === lang.code && styles.languageOptionLabelActive,
                ]}>
                  {lang.label}
                </Text>
                {/* 選中標記 */}
                {state.language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={MibuBrand.brown} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========== #036 帳號合併 Modal ========== */}
      <Modal
        visible={showMergeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseMergeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.mergeModalContent}>
            {/* ===== 步驟一：警告確認 ===== */}
            {mergeStep === 'warning' && (
              <>
                <View style={styles.mergeIconContainer}>
                  <Ionicons name="warning-outline" size={48} color="#D97706" />
                </View>
                <Text style={styles.mergeTitle}>
                  {isZh ? '合併帳號' : 'Merge Accounts'}
                </Text>
                <Text style={styles.mergeDescription}>
                  {isZh
                    ? '此功能可將另一個帳號的資料（圖鑑、行程、成就等）合併到目前的帳號。\n\n⚠️ 合併後，副帳號將無法再登入。'
                    : 'This feature merges data (collections, itineraries, achievements, etc.) from another account into your current account.\n\n⚠️ After merging, the secondary account will be disabled.'}
                </Text>
                <View style={styles.mergeButtonRow}>
                  <TouchableOpacity
                    style={[styles.mergeButton, styles.mergeButtonCancel]}
                    onPress={handleCloseMergeModal}
                  >
                    <Text style={styles.mergeButtonCancelText}>
                      {isZh ? '取消' : 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.mergeButton, styles.mergeButtonConfirm]}
                    onPress={handleMergeConfirmWarning}
                  >
                    <Text style={styles.mergeButtonConfirmText}>
                      {isZh ? '繼續' : 'Continue'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ===== 步驟二：登入副帳號 ===== */}
            {mergeStep === 'login' && (
              <>
                {/* 返回按鈕 */}
                <TouchableOpacity
                  style={styles.mergeBackButton}
                  onPress={() => setMergeStep('warning')}
                >
                  <Ionicons name="arrow-back" size={24} color={MibuBrand.copper} />
                </TouchableOpacity>

                <View style={styles.mergeIconContainer}>
                  <Ionicons name="person-add-outline" size={48} color={MibuBrand.brown} />
                </View>
                <Text style={styles.mergeTitle}>
                  {isZh ? '登入副帳號' : 'Login Secondary Account'}
                </Text>
                <Text style={styles.mergeDescription}>
                  {isZh
                    ? '請使用副帳號的登入方式進行驗證，以確認您擁有該帳號的存取權限。'
                    : 'Please login with the secondary account to verify your ownership.'}
                </Text>

                {/* 內嵌登入表單 */}
                <AuthScreen
                  visible={true}
                  onClose={handleCloseMergeModal}
                  embedded={true}
                  onLoginSuccess={handleSecondaryLoginSuccess}
                  title={isZh ? '登入要合併的帳號' : 'Login account to merge'}
                />
              </>
            )}

            {/* ===== 步驟三：處理中 ===== */}
            {mergeStep === 'processing' && (
              <>
                <ActivityIndicator size="large" color={MibuBrand.brown} />
                <Text style={[styles.mergeTitle, { marginTop: 20 }]}>
                  {isZh ? '合併中...' : 'Merging...'}
                </Text>
                <Text style={styles.mergeDescription}>
                  {isZh ? '請稍候，正在合併帳號資料' : 'Please wait while we merge your accounts'}
                </Text>
              </>
            )}

            {/* ===== 步驟四：結果 ===== */}
            {mergeStep === 'result' && mergeResult && (
              <>
                <View style={styles.mergeIconContainer}>
                  <Ionicons
                    name={mergeResult.success ? 'checkmark-circle-outline' : 'close-circle-outline'}
                    size={48}
                    color={mergeResult.success ? '#059669' : '#EF4444'}
                  />
                </View>
                <Text style={styles.mergeTitle}>
                  {mergeResult.success
                    ? (isZh ? '合併成功！' : 'Merge Successful!')
                    : (isZh ? '合併失敗' : 'Merge Failed')}
                </Text>

                {/* 成功：顯示合併摘要 */}
                {mergeResult.success && mergeResult.summary ? (
                  <View style={styles.mergeSummary}>
                    <Text style={styles.mergeSummaryTitle}>
                      {isZh ? '已合併的資料：' : 'Merged data:'}
                    </Text>
                    {mergeResult.summary.collections > 0 && (
                      <Text style={styles.mergeSummaryItem}>
                        • {isZh ? '圖鑑' : 'Collections'}: {mergeResult.summary.collections}
                      </Text>
                    )}
                    {mergeResult.summary.itineraries > 0 && (
                      <Text style={styles.mergeSummaryItem}>
                        • {isZh ? '行程' : 'Itineraries'}: {mergeResult.summary.itineraries}
                      </Text>
                    )}
                    {mergeResult.summary.favorites > 0 && (
                      <Text style={styles.mergeSummaryItem}>
                        • {isZh ? '收藏' : 'Favorites'}: {mergeResult.summary.favorites}
                      </Text>
                    )}
                    {mergeResult.summary.achievements > 0 && (
                      <Text style={styles.mergeSummaryItem}>
                        • {isZh ? '成就' : 'Achievements'}: {mergeResult.summary.achievements}
                      </Text>
                    )}
                    {mergeResult.summary.expMerged > 0 && (
                      <Text style={styles.mergeSummaryItem}>
                        • {isZh ? '金幣' : 'Coins'}: +{mergeResult.summary.expMerged}
                      </Text>
                    )}
                    {mergeResult.summary.balanceMerged > 0 && (
                      <Text style={styles.mergeSummaryItem}>
                        • {isZh ? '餘額' : 'Balance'}: +{mergeResult.summary.balanceMerged}
                      </Text>
                    )}
                  </View>
                ) : (
                  // 失敗：顯示錯誤訊息
                  <Text style={styles.mergeDescription}>
                    {mergeResult.message || (isZh ? '發生未知錯誤' : 'An unknown error occurred')}
                  </Text>
                )}

                {/* 完成按鈕 */}
                <TouchableOpacity
                  style={[styles.mergeButton, styles.mergeButtonConfirm, { marginTop: 20 }]}
                  onPress={handleCloseMergeModal}
                >
                  <Text style={styles.mergeButtonConfirmText}>
                    {isZh ? '完成' : 'Done'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    color: '#ffffff',
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

  // #036 帳號合併 Modal 樣式
  mergeModalContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  mergeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MibuBrand.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mergeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  mergeDescription: {
    fontSize: 14,
    color: MibuBrand.copper,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  mergeButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  mergeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  mergeButtonCancel: {
    backgroundColor: MibuBrand.creamLight,
  },
  mergeButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  mergeButtonConfirm: {
    backgroundColor: MibuBrand.brown,
  },
  mergeButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  mergeBackButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
  },
  mergeSummary: {
    width: '100%',
    backgroundColor: MibuBrand.highlight,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  mergeSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 8,
  },
  mergeSummaryItem: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginBottom: 4,
  },
});
