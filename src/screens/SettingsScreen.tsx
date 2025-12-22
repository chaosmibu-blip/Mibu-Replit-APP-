import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { AuthScreen } from './AuthScreen';
import { apiService } from '../services/api';
import { MibuBrand } from '../../constants/Colors';

const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

export function SettingsScreen() {
  const { state, t, setLanguage, setUser } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
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
              const token = await AsyncStorage.getItem('@mibu_token');
              if (token) {
                await apiService.logout(token).catch(() => {});
              }
            } catch {}
            
            await AsyncStorage.multiRemove(['@mibu_token', 'token']);
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
              const token = await AsyncStorage.getItem('@mibu_token');
              if (token) {
                const response = await apiService.deleteAccount(token);
                if (response.success) {
                  await AsyncStorage.multiRemove(['@mibu_token', 'token']);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t.navSettings}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isZh ? '語言' : 'Language'}
        </Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowLanguageDropdown(true)}
        >
          <View style={styles.dropdownLeft}>
            <Text style={styles.dropdownFlag}>{currentLang.flag}</Text>
            <Text style={styles.dropdownLabel}>{currentLang.label}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={MibuBrand.copper} />
        </TouchableOpacity>
      </View>

      {state.isAuthenticated && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isZh ? '個人資料' : 'Profile'}
            </Text>
            <TouchableOpacity 
              style={styles.menuCard} 
              onPress={() => router.push('/profile' as any)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="person-outline" size={24} color={MibuBrand.brown} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>
                  {state.user?.firstName || state.user?.name || 'User'}
                </Text>
                <Text style={styles.menuSubtitle}>
                  {isZh ? '編輯個人資料' : 'Edit profile'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isZh ? '帳號' : 'Account'}
            </Text>
            <View style={styles.accountCard}>
              <View style={styles.accountInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {state.user?.firstName?.charAt(0) || state.user?.name?.charAt(0) || '?'}
                  </Text>
                </View>
                <View style={styles.profileTextContainer}>
                  <Text style={styles.accountName}>
                    {state.user?.firstName || state.user?.name || 'User'}
                  </Text>
                  <Text style={styles.accountEmail}>
                    {state.user?.email || ''}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text style={styles.logoutText}>
                  {isZh ? '登出' : 'Logout'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                <Ionicons name="trash-outline" size={18} color="#94a3b8" />
                <Text style={styles.deleteText}>
                  {isZh ? '刪除帳號' : 'Delete Account'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {!state.isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isZh ? '帳號' : 'Account'}
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => setShowAuthModal(true)}>
            <Ionicons name="log-in-outline" size={20} color="#ffffff" />
            <Text style={styles.loginButtonText}>{t.login}</Text>
          </TouchableOpacity>
        </View>
      )}

      <AuthScreen 
        visible={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {state.user?.role === 'admin' && !state.user?.isSuperAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isZh ? '管理員' : 'Admin'}
          </Text>
          <TouchableOpacity style={styles.adminCard} onPress={() => router.push('/admin-exclusions')}>
            <View style={styles.adminIconContainer}>
              <Ionicons name="ban-outline" size={24} color="#6366f1" />
            </View>
            <View style={styles.adminInfo}>
              <Text style={styles.adminTitle}>
                {isZh ? '全域排除管理' : 'Global Exclusions'}
              </Text>
              <Text style={styles.adminSubtitle}>
                {isZh ? '管理所有使用者不會抽到的地點' : 'Manage places excluded for all users'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isZh ? '關於' : 'About'}
        </Text>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>Mibu 旅行扭蛋</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2025 Mibu Team</Text>
        </View>
      </View>

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
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: MibuBrand.brownDark,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.copper,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.warmWhite,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownFlag: {
    fontSize: 24,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    gap: 12,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: MibuBrand.highlight,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  accountCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: MibuBrand.brown,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  profileTextContainer: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  accountEmail: {
    fontSize: 14,
    color: MibuBrand.copper,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    marginBottom: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  deleteText: {
    fontSize: 13,
    color: '#94a3b8',
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
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: MibuBrand.tan,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#c7d2fe',
    gap: 12,
  },
  adminIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#eef2ff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminInfo: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  adminSubtitle: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    textAlign: 'center',
    marginBottom: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  languageOptionActive: {
    backgroundColor: MibuBrand.highlight,
  },
  languageOptionFlag: {
    fontSize: 24,
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
