/**
 * LinkedAccountsScreen - 登入方式管理
 *
 * #071: 帳號連結 — 綁定 / 解除多登入方式
 *
 * 功能：
 * - 顯示目前已綁定的登入方式（Apple / Google）
 * - 綁定新的登入方式（觸發 OAuth → POST /api/auth/link）
 * - 解除綁定（確認對話框 → DELETE /api/auth/unlink/:provider）
 * - 唯一登入方式時不可解除
 *
 * 更新日期：2026-03-10
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '../../../context/AppContext';
import { useLinkedAccounts, useLinkAccount, useUnlinkAccount } from '../../../hooks/useAuthQueries';
import { useGoogleAuth } from '../../../../hooks/useGoogleAuth';
import { ErrorState } from '../components/ui/ErrorState';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';

// ============ 常數 ============

const PROVIDER_CONFIG: Record<string, {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = {
  apple: { icon: 'logo-apple', color: '#000000' },
  google: { icon: 'logo-google', color: '#4285F4' },
  guest: { icon: 'person-outline', color: MibuBrand.copper },
};

// ============ 主元件 ============

export function LinkedAccountsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ============ React Query Hooks ============
  const linkedAccountsQuery = useLinkedAccounts();
  const linkMutation = useLinkAccount();
  const unlinkMutation = useUnlinkAccount();
  const { signInWithGoogle } = useGoogleAuth();

  const { currentProvider, linkedAccounts = [] } = linkedAccountsQuery.data ?? {};

  // 已綁定的 provider 名稱集合
  const linkedProviders = new Set(linkedAccounts.map(a => a.provider));
  // 可綁定的 provider（排除 guest）
  const availableProviders = (['apple', 'google'] as const).filter(p => !linkedProviders.has(p));
  // 是否只剩唯一登入方式
  const isOnlyOneMethod = linkedAccounts.length <= 1;

  // ============ 事件處理 ============

  /** 綁定新的登入方式 */
  const handleLink = useCallback(async (provider: 'apple' | 'google') => {
    try {
      let idToken: string;

      if (provider === 'google') {
        idToken = await signInWithGoogle();
      } else {
        // Apple Sign In
        const AppleAuth = require('expo-apple-authentication');
        const credential = await AppleAuth.signInAsync({
          requestedScopes: [
            AppleAuth.AppleAuthenticationScope.FULL_NAME,
            AppleAuth.AppleAuthenticationScope.EMAIL,
          ],
        });
        if (!credential.identityToken) {
          throw new Error('Apple 驗證回傳缺少 identityToken');
        }
        idToken = credential.identityToken;
      }

      await linkMutation.mutateAsync({ provider, idToken });
      Alert.alert('', t.linkedAccounts_linkSuccess);
    } catch (error: any) {
      // 用戶取消不提示
      if (error.message?.includes('取消') || error.message?.includes('cancel')) return;

      // 409: 已綁定到其他用戶
      if (error.status === 409) {
        Alert.alert('', t.linkedAccounts_errorAlreadyLinked);
        return;
      }
      // 401: token 無效
      if (error.status === 401) {
        Alert.alert('', t.linkedAccounts_errorVerifyFailed);
        return;
      }

      Alert.alert('', t.linkedAccounts_errorVerifyFailed);
    }
  }, [signInWithGoogle, linkMutation, t]);

  /** 解除綁定 */
  const handleUnlink = useCallback((provider: 'apple' | 'google') => {
    Alert.alert(
      t.linkedAccounts_unlinkConfirm,
      t.linkedAccounts_unlinkConfirmDesc,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.linkedAccounts_unlink,
          style: 'destructive',
          onPress: async () => {
            try {
              await unlinkMutation.mutateAsync(provider);
              Alert.alert('', t.linkedAccounts_unlinkSuccess);
            } catch (error: any) {
              if (error.status === 400) {
                Alert.alert('', t.linkedAccounts_errorOnlyMethod);
              }
            }
          },
        },
      ],
    );
  }, [unlinkMutation, t]);

  /** 取得 provider 顯示名稱 */
  const getProviderLabel = (provider: string) => {
    const key = `linkedAccounts_${provider}` as keyof typeof t;
    return t[key] || provider;
  };

  // ============ 載入中 ============
  if (linkedAccountsQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  // ============ 載入失敗 ============
  if (linkedAccountsQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState
          message={t.common_loadFailed}
          onRetry={() => linkedAccountsQuery.refetch()}
        />
      </View>
    );
  }

  // ============ 主畫面 ============
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.linkedAccounts_title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 註冊方式 */}
        {currentProvider && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={MibuBrand.copper} />
            <Text style={styles.infoText}>
              {t.linkedAccounts_currentProvider}: {getProviderLabel(currentProvider)}
            </Text>
          </View>
        )}

        {/* 已綁定列表 */}
        <Text style={styles.sectionTitle}>{t.linkedAccounts_linked}</Text>
        <View style={styles.card}>
          {linkedAccounts.map((account, index) => {
            const config = PROVIDER_CONFIG[account.provider] ?? PROVIDER_CONFIG.guest;
            const canUnlink = !isOnlyOneMethod && account.provider !== 'guest';

            return (
              <View
                key={account.provider}
                style={[
                  styles.providerRow,
                  index < linkedAccounts.length - 1 && styles.providerRowBorder,
                ]}
              >
                <View style={[styles.providerIcon, { backgroundColor: `${config.color}15` }]}>
                  <Ionicons name={config.icon} size={22} color={config.color} />
                </View>
                <Text style={styles.providerName}>{getProviderLabel(account.provider)}</Text>
                <View style={styles.linkedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={SemanticColors.successMain} />
                  <Text style={styles.linkedBadgeText}>{t.linkedAccounts_linked}</Text>
                </View>
                {canUnlink && (
                  <TouchableOpacity
                    style={styles.unlinkButton}
                    onPress={() => handleUnlink(account.provider as 'apple' | 'google')}
                    disabled={unlinkMutation.isPending}
                  >
                    <Text style={styles.unlinkButtonText}>{t.linkedAccounts_unlink}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* 可綁定列表 */}
        {availableProviders.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
              {t.linkedAccounts_link}
            </Text>
            <View style={styles.card}>
              {availableProviders
                .filter(p => Platform.OS === 'ios' || p !== 'apple')
                .map((provider, index, arr) => {
                  const config = PROVIDER_CONFIG[provider];
                  return (
                    <View
                      key={provider}
                      style={[
                        styles.providerRow,
                        index < arr.length - 1 && styles.providerRowBorder,
                      ]}
                    >
                      <View style={[styles.providerIcon, { backgroundColor: `${config.color}15` }]}>
                        <Ionicons name={config.icon} size={22} color={config.color} />
                      </View>
                      <Text style={styles.providerName}>{getProviderLabel(provider)}</Text>
                      <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => handleLink(provider)}
                        disabled={linkMutation.isPending}
                      >
                        {linkMutation.isPending ? (
                          <ActivityIndicator size="small" color={UIColors.white} />
                        ) : (
                          <Text style={styles.linkButtonText}>{t.linkedAccounts_link}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ============ 樣式 ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: MibuBrand.creamLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: MibuBrand.creamLight,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
  },
  infoText: {
    fontSize: FontSize.md,
    color: MibuBrand.copper,
    flex: 1,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.copper,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  providerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  providerIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerName: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  linkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  linkedBadgeText: {
    fontSize: FontSize.sm,
    color: SemanticColors.successMain,
    fontWeight: '500',
  },
  unlinkButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: SemanticColors.errorMain,
    marginLeft: Spacing.sm,
  },
  unlinkButtonText: {
    fontSize: FontSize.sm,
    color: SemanticColors.errorMain,
    fontWeight: '600',
  },
  linkButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: MibuBrand.brown,
    minWidth: 72,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: FontSize.sm,
    color: UIColors.white,
    fontWeight: '600',
  },
});
