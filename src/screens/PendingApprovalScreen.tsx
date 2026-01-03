import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';

export function PendingApprovalScreen() {
  const { state, setUser } = useApp();
  const router = useRouter();

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '等待審核' : 'Pending Approval',
    subtitle: isZh 
      ? '您的帳號正在等待管理員審核' 
      : 'Your account is pending admin approval',
    description: isZh
      ? '商家和專員帳號需經過審核才能使用完整功能。審核通過後會通知您。'
      : 'Merchant and Specialist accounts require approval for full access. You will be notified once approved.',
    role: isZh ? '申請身份' : 'Applied Role',
    logout: isZh ? '登出' : 'Logout',
    roleLabels: {
      merchant: isZh ? '商家' : 'Merchant',
      specialist: isZh ? '專員' : 'Specialist',
    } as Record<string, string>,
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@mibu_token');
    setUser(null);
    router.replace('/login');
  };

  const roleLabel = translations.roleLabels[state.user?.role || ''] || state.user?.role;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="hourglass-outline" size={80} color="#f59e0b" />
      </View>

      <Text style={styles.title}>{translations.title}</Text>
      <Text style={styles.subtitle}>{translations.subtitle}</Text>
      <Text style={styles.description}>{translations.description}</Text>

      <View style={styles.roleCard}>
        <Text style={styles.roleLabel}>{translations.role}</Text>
        <Text style={styles.roleValue}>{roleLabel}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>{translations.logout}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  roleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
    marginBottom: 32,
  },
  roleLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  roleValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f59e0b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
