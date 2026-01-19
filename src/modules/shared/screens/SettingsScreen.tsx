import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Linking, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { Language } from '../../../types';
import { AuthScreen } from './AuthScreen';
import { apiService } from '../../../services/api';
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
          label: isZh ? '全球地圖' : 'World Map',
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
          icon: 'notifications-outline',
          label: isZh ? '推播通知' : 'Push Notifications',
          toggle: true,
          checked: notifications,
          onChange: setNotifications,
          iconBg: '#FEE2E2',
          iconColor: '#EF4444',
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
          icon: 'heart',
          label: isZh ? '我的最愛' : 'My Favorites',
          action: () => router.push('/favorites' as any),
          hasArrow: true,
          iconBg: '#FEE2E2',
          iconColor: '#EF4444',
        },
        {
          icon: 'shield-checkmark-outline',
          label: isZh ? '緊急聯絡人' : 'Emergency Contacts',
          action: () => router.push('/sos-contacts' as any),
          hasArrow: true,
          iconBg: '#FEF3C7',
          iconColor: '#F59E0B',
        },
        {
          icon: 'rocket-outline',
          label: isZh ? '募資活動' : 'Crowdfunding',
          action: () => router.push('/crowdfunding' as any),
          hasArrow: true,
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
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

      {state.isAuthenticated && state.user && (
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {state.user.firstName?.charAt(0) || state.user.name?.charAt(0) || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {state.user.firstName || state.user.name || 'User'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => router.push('/profile' as any)}
            >
              <Ionicons name="create-outline" size={18} color={MibuBrand.brown} />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
    backgroundColor: MibuBrand.warmWhite,
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: MibuBrand.brown,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  editProfileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MibuBrand.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutCard: {
    backgroundColor: MibuBrand.warmWhite,
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
    backgroundColor: MibuBrand.warmWhite,
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
});
