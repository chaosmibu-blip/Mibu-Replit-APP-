import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Linking, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { Language } from '../../../types';
import { AuthScreen } from './AuthScreen';
import { apiService } from '../../../services/api';
import { authApi, MergeSummary } from '../../../services/authApi';
import { MibuBrand } from '../../../../constants/Colors';

const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  action?: () => void;
  hasArrow?: boolean;
  highlight?: boolean;
  badge?: string;
  value?: string;
  toggle?: boolean;
  checked?: boolean;
  onChange?: (value: boolean) => void;
  iconBg?: string;
  iconColor?: string;
};

type SettingGroup = {
  title: string;
  items: SettingItem[];
};

export function SettingsScreen() {
  const { state, t, setLanguage, setUser, getToken } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  // #036 帳號合併狀態
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeStep, setMergeStep] = useState<'warning' | 'login' | 'processing' | 'result'>('warning');
  const [mergeResult, setMergeResult] = useState<{ success: boolean; summary?: MergeSummary; message?: string } | null>(null);
  const [secondaryToken, setSecondaryToken] = useState<string | null>(null);

  const currentLang = LANGUAGE_OPTIONS.find(l => l.code === state.language) || LANGUAGE_OPTIONS[0];

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
              const token = await getToken();
              if (token) {
                await apiService.logout(token).catch(() => {});
              }
            } catch {}
            
            setUser(null);
            router.replace('/login');
          },
        },
      ]
    );
  };

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
                  setUser(null);
                  router.replace('/');
                } else {
                  let errorMsg = response.message || response.error;
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

  // #036 帳號合併功能
  const handleOpenMergeModal = () => {
    setMergeStep('warning');
    setMergeResult(null);
    setSecondaryToken(null);
    setShowMergeModal(true);
  };

  const handleMergeConfirmWarning = () => {
    setMergeStep('login');
  };

  const handleSecondaryLoginSuccess = (token: string) => {
    setSecondaryToken(token);
    executeMerge(token);
  };

  const executeMerge = async (secToken: string) => {
    setMergeStep('processing');
    try {
      const token = await getToken();
      if (!token) {
        setMergeResult({ success: false, message: isZh ? '請先登入' : 'Please login first' });
        setMergeStep('result');
        return;
      }

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

  const handleCloseMergeModal = () => {
    setShowMergeModal(false);
    setMergeStep('warning');
    setMergeResult(null);
    setSecondaryToken(null);
  };

  const settingGroups: SettingGroup[] = state.isAuthenticated ? [
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
        {
          icon: 'gift-outline',
          label: isZh ? '推薦領好禮' : 'Refer & Earn',
          action: () => router.push('/referral' as any),
          hasArrow: true,
          highlight: true,
          iconBg: '#ECFDF5',
          iconColor: '#059669',
        },
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
      title: isZh ? '探索' : 'Explore',
      items: [
        {
          icon: 'map-outline',
          label: isZh ? '解鎖全球地圖' : 'Unlock World Map',
          action: () => router.push('/map' as any),
          hasArrow: true,
          badge: isZh ? '1 已解鎖' : '1 Unlocked',
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
        },
        {
          icon: 'trophy-outline',
          label: isZh ? '等級與成就' : 'Level & Achievements',
          action: () => router.push('/economy' as any),
          hasArrow: true,
          badge: '2/10',
          iconBg: '#FFF3D4',
          iconColor: '#D4A24C',
        },
      ],
    },
    {
      title: isZh ? '偏好設定' : 'Preferences',
      items: [
        {
          icon: 'heart-outline',
          label: isZh ? '我的最愛/黑名單' : 'Favorites & Blacklist',
          action: () => router.push('/favorites-management' as any),
          hasArrow: true,
          iconBg: '#FEE2E2',
          iconColor: MibuBrand.tierSP,
        },
        {
          icon: 'notifications-outline',
          label: isZh ? '推播通知' : 'Push Notifications',
          toggle: true,
          checked: notifications,
          onChange: setNotifications,
          iconBg: '#FFF7ED',
          iconColor: '#EA580C',
        },
      ],
    },
    {
      title: isZh ? '更多功能' : 'More Features',
      items: [
        {
          icon: 'link-outline',
          label: isZh ? '帳號綁定' : 'Linked Accounts',
          action: () => router.push('/account' as any),
          hasArrow: true,
          iconBg: '#EEF2FF',
          iconColor: '#6366f1',
        },
        {
          icon: 'hand-left-outline',
          label: isZh ? '社群貢獻' : 'Contributions',
          action: () => router.push('/contribution' as any),
          hasArrow: true,
          iconBg: '#F0FDF4',
          iconColor: '#16a34a',
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
  ] : [
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

  const renderSettingItem = (item: SettingItem, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={`${item.label}-${index}`}
      style={[
        styles.settingItem,
        !isLast && styles.settingItemBorder,
        item.highlight && styles.settingItemHighlight,
      ]}
      onPress={item.action}
      activeOpacity={item.toggle ? 1 : 0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.iconBg || MibuBrand.highlight }]}>
        <Ionicons name={item.icon} size={20} color={item.iconColor || MibuBrand.brown} />
      </View>
      <Text style={[styles.itemLabel, item.highlight && styles.itemLabelHighlight]}>
        {item.label}
      </Text>
      {item.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      )}
      {item.value && (
        <Text style={styles.itemValue}>{item.value}</Text>
      )}
      {item.toggle && (
        <Switch
          value={item.checked}
          onValueChange={item.onChange}
          trackColor={{ false: '#e2e8f0', true: MibuBrand.brown }}
          thumbColor="#ffffff"
        />
      )}
      {item.hasArrow && (
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{isZh ? '設定' : 'Settings'}</Text>
      </View>

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

      {state.isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '帳號管理' : 'Account Management'}</Text>
          <View style={styles.card}>
            {/* #036 帳號合併 */}
            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemBorder]}
              onPress={handleOpenMergeModal}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="git-merge-outline" size={20} color="#6366f1" />
              </View>
              <Text style={styles.itemLabel}>{isZh ? '合併帳號' : 'Merge Accounts'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemBorder]}
              onPress={handleLogout}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="log-out-outline" size={20} color="#D97706" />
              </View>
              <Text style={styles.itemLabel}>{isZh ? '登出' : 'Logout'}</Text>
            </TouchableOpacity>
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

      {!state.isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '帳號' : 'Account'}</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => setShowAuthModal(true)}>
            <Ionicons name="log-in-outline" size={20} color="#ffffff" />
            <Text style={styles.loginButtonText}>{t.login}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>Mibu 旅行扭蛋</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2025 查爾斯有限公司</Text>
        </View>
      </View>

      <AuthScreen 
        visible={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

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
                {state.language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={MibuBrand.brown} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* #036 帳號合併 Modal */}
      <Modal
        visible={showMergeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseMergeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.mergeModalContent}>
            {/* 步驟一：警告確認 */}
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

            {/* 步驟二：登入副帳號 */}
            {mergeStep === 'login' && (
              <>
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
                <AuthScreen
                  visible={true}
                  onClose={handleCloseMergeModal}
                  embedded={true}
                  onLoginSuccess={handleSecondaryLoginSuccess}
                  title={isZh ? '登入要合併的帳號' : 'Login account to merge'}
                />
              </>
            )}

            {/* 步驟三：處理中 */}
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

            {/* 步驟四：結果 */}
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
                        • {isZh ? '經驗值' : 'EXP'}: +{mergeResult.summary.expMerged}
                      </Text>
                    )}
                    {mergeResult.summary.balanceMerged > 0 && (
                      <Text style={styles.mergeSummaryItem}>
                        • {isZh ? '餘額' : 'Balance'}: +{mergeResult.summary.balanceMerged}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.mergeDescription}>
                    {mergeResult.message || (isZh ? '發生未知錯誤' : 'An unknown error occurred')}
                  </Text>
                )}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  itemLabelHighlight: {
    color: MibuBrand.brown,
  },
  itemValue: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginRight: 4,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
