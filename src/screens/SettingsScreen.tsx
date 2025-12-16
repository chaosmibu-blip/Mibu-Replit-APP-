import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import { AuthScreen } from './AuthScreen';

const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

export function SettingsScreen() {
  const { state, t, setLanguage, setUser } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
    router.replace('/');
  };

  const handleSOSPress = () => {
    router.push('/sos');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t.navSettings}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {state.language === 'zh-TW' ? '語言' : 'Language'}
        </Text>
        <View style={styles.languageGrid}>
          {LANGUAGE_OPTIONS.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageCard,
                state.language === lang.code && styles.languageCardActive,
              ]}
              onPress={() => setLanguage(lang.code)}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text
                style={[
                  styles.languageLabel,
                  state.language === lang.code && styles.languageLabelActive,
                ]}
              >
                {lang.label}
              </Text>
              {state.language === lang.code && (
                <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {state.language === 'zh-TW' ? '帳號' : 'Account'}
        </Text>
        {state.isAuthenticated ? (
          <View style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {state.user?.firstName?.charAt(0) || state.user?.name?.charAt(0) || '?'}
                </Text>
              </View>
              <View>
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
                {state.language === 'zh-TW' ? '登出' : 'Logout'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={() => setShowAuthModal(true)}>
            <Ionicons name="log-in-outline" size={20} color="#ffffff" />
            <Text style={styles.loginButtonText}>{t.login}</Text>
          </TouchableOpacity>
        )}
      </View>

      <AuthScreen 
        visible={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {state.language === 'zh-TW' ? '安全' : 'Safety'}
        </Text>
        <TouchableOpacity style={styles.sosCard} onPress={handleSOSPress}>
          <View style={styles.sosIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#ef4444" />
          </View>
          <View style={styles.sosInfo}>
            <Text style={styles.sosTitle}>
              {state.language === 'zh-TW' ? '安全中心' : 'Safety Center'}
            </Text>
            <Text style={styles.sosSubtitle}>
              {state.language === 'zh-TW' ? '設定緊急求救功能' : 'Set up emergency SOS'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {(state.user?.isSuperAdmin || (state.user?.accessibleRoles && state.user.accessibleRoles.length > 1)) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {state.language === 'zh-TW' ? '切換入口' : 'Switch Portal'}
          </Text>
          <View style={styles.portalGrid}>
            <TouchableOpacity 
              style={[styles.portalCard, { borderColor: '#6366f1' }]}
              onPress={() => router.push('/(tabs)')}
            >
              <Ionicons name="airplane-outline" size={24} color="#6366f1" />
              <Text style={styles.portalLabel}>{state.language === 'zh-TW' ? '旅客' : 'Traveler'}</Text>
            </TouchableOpacity>
            {(state.user?.isSuperAdmin || state.user?.accessibleRoles?.includes('merchant')) && (
              <TouchableOpacity 
                style={[styles.portalCard, { borderColor: '#10b981' }]}
                onPress={() => router.push('/merchant-dashboard')}
              >
                <Ionicons name="storefront-outline" size={24} color="#10b981" />
                <Text style={styles.portalLabel}>{state.language === 'zh-TW' ? '企業端' : 'Business'}</Text>
              </TouchableOpacity>
            )}
            {(state.user?.isSuperAdmin || state.user?.accessibleRoles?.includes('specialist')) && (
              <TouchableOpacity 
                style={[styles.portalCard, { borderColor: '#a855f7' }]}
                onPress={() => router.push('/specialist-dashboard')}
              >
                <Ionicons name="shield-checkmark-outline" size={24} color="#a855f7" />
                <Text style={styles.portalLabel}>{state.language === 'zh-TW' ? '專員端' : 'Specialist'}</Text>
              </TouchableOpacity>
            )}
            {(state.user?.isSuperAdmin || state.user?.accessibleRoles?.includes('admin')) && (
              <TouchableOpacity 
                style={[styles.portalCard, { borderColor: '#f59e0b' }]}
                onPress={() => router.push('/admin-exclusions')}
              >
                <Ionicons name="settings-outline" size={24} color="#f59e0b" />
                <Text style={styles.portalLabel}>{state.language === 'zh-TW' ? '管理端' : 'Admin'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {state.user?.role === 'admin' && !state.user?.isSuperAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {state.language === 'zh-TW' ? '管理員' : 'Admin'}
          </Text>
          <TouchableOpacity style={styles.adminCard} onPress={() => router.push('/admin-exclusions')}>
            <View style={styles.adminIconContainer}>
              <Ionicons name="ban-outline" size={24} color="#6366f1" />
            </View>
            <View style={styles.adminInfo}>
              <Text style={styles.adminTitle}>
                {state.language === 'zh-TW' ? '全域排除管理' : 'Global Exclusions'}
              </Text>
              <Text style={styles.adminSubtitle}>
                {state.language === 'zh-TW' ? '管理所有使用者不會抽到的地點' : 'Manage places excluded for all users'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {state.language === 'zh-TW' ? '關於' : 'About'}
        </Text>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>Mibu 旅行扭蛋</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.copyright}>© 2025 Mibu Team</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  languageGrid: {
    gap: 8,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  languageCardActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  languageFlag: {
    fontSize: 24,
  },
  languageLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  languageLabelActive: {
    color: '#6366f1',
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
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
    backgroundColor: '#6366f1',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  accountEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  aboutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#94a3b8',
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fecaca',
    gap: 12,
  },
  sosIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#fef2f2',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosInfo: {
    flex: 1,
  },
  sosTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  sosSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
    color: '#1e293b',
    marginBottom: 2,
  },
  adminSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  portalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  portalCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    gap: 8,
  },
  portalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
});
