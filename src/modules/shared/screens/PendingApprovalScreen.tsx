/**
 * PendingApprovalScreen - 等待審核畫面
 *
 * 功能說明：
 * - 顯示帳號審核等待狀態
 * - 適用於商家（merchant）和專員（specialist）角色
 * - 提供登出功能
 *
 * 使用場景：
 * - 當用戶以商家或專員身份註冊後，需等待管理員審核
 * - 審核通過前會被導向此畫面
 *
 * 串接的 API：
 * - 無直接 API 串接，透過 AppContext 取得用戶狀態
 *
 * @see 後端合約: contracts/APP.md Phase 1
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../../context/AppContext';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

// ============ 元件本體 ============

export function PendingApprovalScreen() {
  const { state, setUser } = useApp();
  const router = useRouter();

  const isZh = state.language === 'zh-TW';

  // ============ 多語系翻譯 ============

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

  // ============ 事件處理 ============

  /**
   * 處理登出
   * 清除 Token 並導向登入頁
   */
  const handleLogout = async () => {
    // 修正：原本用錯 key 'token'，改用正確的 '@mibu_token'
    await AsyncStorage.removeItem('@mibu_token');
    setUser(null);
    router.replace('/login');
  };

  // 取得角色顯示文字
  const roleLabel = translations.roleLabels[state.user?.role || ''] || state.user?.role;

  // ============ 主要渲染 ============

  return (
    <View style={styles.container}>
      {/* ===== 沙漏圖示 ===== */}
      <View style={styles.iconContainer}>
        <Ionicons name="hourglass-outline" size={80} color="#f59e0b" />
      </View>

      {/* ===== 標題與說明 ===== */}
      <Text style={styles.title}>{translations.title}</Text>
      <Text style={styles.subtitle}>{translations.subtitle}</Text>
      <Text style={styles.description}>{translations.description}</Text>

      {/* ===== 申請身份卡片 ===== */}
      <View style={styles.roleCard}>
        <Text style={styles.roleLabel}>{translations.role}</Text>
        <Text style={styles.roleValue}>{roleLabel}</Text>
      </View>

      {/* ===== 登出按鈕 ===== */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={SemanticColors.errorDark} />
        <Text style={styles.logoutText}>{translations.logout}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  // 圖示容器
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: SemanticColors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  // 標題
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: MibuBrand.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  // 副標題
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: UIColors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  // 說明文字
  description: {
    fontSize: 14,
    color: UIColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  // 角色卡片
  roleCard: {
    backgroundColor: UIColors.white,
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
    color: UIColors.textSecondary,
    marginBottom: 8,
  },
  roleValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f59e0b',
  },
  // 登出按鈕
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: SemanticColors.errorLight,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: SemanticColors.errorDark,
  },
});
