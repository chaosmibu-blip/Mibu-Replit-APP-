import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Language } from '../types';

const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

export function SettingsScreen() {
  const { state, t, setLanguage, setUser } = useApp();

  const handleLogout = () => {
    setUser(null);
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
          <TouchableOpacity style={styles.loginButton}>
            <Ionicons name="log-in-outline" size={20} color="#ffffff" />
            <Text style={styles.loginButtonText}>{t.login}</Text>
          </TouchableOpacity>
        )}
      </View>

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
});
