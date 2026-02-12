/**
 * OAuth 回調處理頁面
 *
 * 處理 OAuth 登入完成後的回調：
 * - 從 URL 參數取得 token
 * - 驗證 token 格式（JWT 三段式結構）
 * - 向後端驗證 token 並取得用戶資料
 * - 設定用戶狀態並導向對應頁面
 *
 * 主要用於 Web 平台的 OAuth 流程
 *
 * 安全加固（2026-02-08）：
 * - 加入 JWT 格式驗證，防止任意字串被當作 token
 * - 改用 authApi.getUserWithToken() 統一走 base.ts（含超時機制）
 */
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/context/AppContext';
import { authApi } from '../../src/services/authApi';
import { MibuBrand, UIColors } from '../../constants/Colors';
import { Spacing, FontSize } from '../../src/theme/designTokens';
import { isValidJWTFormat } from '../../src/utils/validation';

export default function AuthCallback() {
  const { setUser } = useAuth();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  const navigateAfterLogin = (role: string, isApproved?: boolean) => {
    if (role === 'merchant') {
      if (isApproved === false) {
        router.replace('/pending-approval');
      } else {
        router.replace('/merchant-dashboard');
      }
    } else if (role === 'specialist') {
      if (isApproved === false) {
        router.replace('/pending-approval');
      } else {
        router.replace('/specialist-dashboard');
      }
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleCallback = async () => {
    const token = params.token;
    const portal = params.portal as string;

    // 安全檢查：token 必須符合 JWT 格式（header.payload.signature）
    if (isValidJWTFormat(token)) {
      try {
        // 改用 authApi 統一走 base.ts（含超時機制 + 錯誤處理）
        const userData = await authApi.getUserWithToken(token);

        if (userData && (userData.name || userData.id)) {
          const userRole = (userData.role || portal || 'traveler') as import('../../src/types').UserRole;

          setUser({
            id: userData.id,
            name: userData.name || userData.email?.split('@')[0] || 'User',
            email: userData.email || null,
            avatar: userData.avatar || userData.profileImageUrl || null,
            firstName: userData.firstName || userData.name?.split(' ')[0] || null,
            role: userRole,
            isApproved: userData.isApproved,
            isSuperAdmin: userData.isSuperAdmin || false,
            accessibleRoles: userData.accessibleRoles || [],
            provider: userData.provider || 'google',
            providerId: userData.id,
          }, token);

          navigateAfterLogin(userRole, userData.isApproved);
          return;
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    }

    // Token 無效或驗證失敗，導回登入頁
    if (Platform.OS === 'web') {
      if (window.opener) {
        window.close();
      }
    }

    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={MibuBrand.brown} />
      <Text style={styles.text}>正在登入...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  text: {
    marginTop: Spacing.lg,
    fontSize: FontSize.lg,
    color: UIColors.textSecondary,
  },
});
