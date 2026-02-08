/**
 * AccountScreen - 帳號綁定畫面
 *
 * 功能說明：
 * - 顯示已連結的 OAuth 身份（Apple/Google）
 * - 新增綁定 Apple/Google 帳號
 * - 解除非主要帳號的綁定
 * - 支援下拉刷新
 *
 * 串接的 API：
 * - GET /api/auth/identities - 取得已綁定的身份列表
 * - POST /api/auth/bind - 綁定新身份
 * - DELETE /api/auth/identities/:id - 解除身份綁定
 *
 * @see 後端合約: contracts/APP.md Phase 6
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useApp } from '../../../context/AppContext';
import { authApi, LinkedIdentity } from '../../../services/authApi';
import { MibuBrand, UIColors } from '../../../../constants/Colors';

// ============ 常數定義 ============

/** OAuth 提供者資訊 */
const PROVIDER_INFO: Record<string, { icon: string; label: { zh: string; en: string }; color: string }> = {
  apple: {
    icon: 'logo-apple',
    label: { zh: 'Apple', en: 'Apple' },
    color: '#000000',
  },
  google: {
    icon: 'logo-google',
    label: { zh: 'Google', en: 'Google' },
    color: '#4285F4',
  },
};

// ============ 元件本體 ============

export function AccountScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  // ============ 狀態管理 ============

  const [loading, setLoading] = useState(true); // 頁面載入中
  const [refreshing, setRefreshing] = useState(false); // 下拉刷新中
  const [identities, setIdentities] = useState<LinkedIdentity[]>([]); // 已綁定的身份列表
  const [primaryId, setPrimaryId] = useState<string>(''); // 主要身份 ID
  const [bindingProvider, setBindingProvider] = useState<string | null>(null); // 正在綁定的提供者
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null); // 正在解除綁定的 ID
  const [appleAvailable, setAppleAvailable] = useState(false); // Apple Sign-In 是否可用

  // ============ 生命週期 ============

  /** 檢查 Apple Sign-In 是否可用（僅 iOS） */
  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  // ============ 資料載入 ============

  /**
   * 載入已綁定的身份列表
   */
  const loadIdentities = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      const data = await authApi.getIdentities(token);
      setIdentities(data.identities);
      setPrimaryId(data.primary);
    } catch (error) {
      console.error('Failed to load identities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    loadIdentities();
  }, [loadIdentities]);

  /**
   * 下拉刷新處理
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadIdentities();
  }, [loadIdentities]);

  // ============ 事件處理 ============

  /**
   * 處理綁定 Apple 帳號
   * 呼叫 Apple Sign-In 取得憑證後送到後端綁定
   */
  const handleBindApple = async () => {
    if (bindingProvider) return;
    setBindingProvider('apple');

    try {
      // 呼叫 Apple Sign-In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token');
      }

      const token = await getToken();
      if (!token) return;

      // 送到後端綁定
      const result = await authApi.bindIdentity(token, {
        provider: 'apple',
        identityToken: credential.identityToken,
      });

      if (result.success) {
        setIdentities(prev => [...prev, result.identity]);
        Alert.alert(
          isZh ? '綁定成功' : 'Linked!',
          isZh ? 'Apple 帳號已成功綁定' : 'Apple account has been linked'
        );
      }
    } catch (error: any) {
      // 用戶取消不顯示錯誤
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        console.error('Apple binding failed:', error);
        Alert.alert(
          isZh ? '綁定失敗' : 'Link Failed',
          isZh ? '無法綁定 Apple 帳號' : 'Failed to link Apple account'
        );
      }
    } finally {
      setBindingProvider(null);
    }
  };

  /**
   * 處理綁定 Google 帳號
   * TODO: 使用 expo-auth-session 實作 Google Sign-In
   */
  const handleBindGoogle = async () => {
    Alert.alert(
      isZh ? '功能開發中' : 'Coming Soon',
      isZh ? 'Google 綁定功能即將推出' : 'Google linking will be available soon'
    );
  };

  /**
   * 處理解除綁定
   * 檢查限制條件後確認並執行解除
   */
  const handleUnlink = async (identity: LinkedIdentity) => {
    if (unlinkingId) return;

    // 檢查是否為唯一身份
    if (identities.length <= 1) {
      Alert.alert(
        isZh ? '無法解除綁定' : 'Cannot Unlink',
        isZh ? '至少需要保留一個登入方式' : 'You must keep at least one login method'
      );
      return;
    }

    // 檢查是否為主要身份
    if (identity.isPrimary) {
      Alert.alert(
        isZh ? '無法解除綁定' : 'Cannot Unlink',
        isZh ? '無法解除主要登入方式，請先設定其他帳號為主要登入方式' : 'Cannot unlink primary login method. Please set another account as primary first.'
      );
      return;
    }

    // 確認對話框
    Alert.alert(
      isZh ? '確認解除綁定' : 'Confirm Unlink',
      isZh
        ? `確定要解除 ${PROVIDER_INFO[identity.provider]?.label.zh || identity.provider} 帳號的綁定嗎？`
        : `Are you sure you want to unlink your ${PROVIDER_INFO[identity.provider]?.label.en || identity.provider} account?`,
      [
        { text: isZh ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: isZh ? '解除綁定' : 'Unlink',
          style: 'destructive',
          onPress: async () => {
            setUnlinkingId(identity.id);
            try {
              const token = await getToken();
              if (!token) return;

              const result = await authApi.unlinkIdentity(token, identity.id);

              if (result.success) {
                setIdentities(prev => prev.filter(i => i.id !== identity.id));
                Alert.alert(
                  isZh ? '解除成功' : 'Unlinked!',
                  isZh ? '已解除帳號綁定' : 'Account has been unlinked'
                );
              } else {
                throw new Error(result.message);
              }
            } catch (error) {
              console.error('Unlink failed:', error);
              Alert.alert(
                isZh ? '解除失敗' : 'Unlink Failed',
                isZh ? '無法解除綁定，請稍後再試' : 'Failed to unlink, please try again'
              );
            } finally {
              setUnlinkingId(null);
            }
          },
        },
      ]
    );
  };

  // ============ 輔助函數 ============

  /**
   * 檢查是否已綁定某提供者
   */
  const hasProvider = (provider: string) =>
    identities.some(i => i.provider === provider);

  // ============ 載入狀態 ============

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  // ============ 主要渲染 ============

  return (
    <View style={styles.container}>
      {/* ===== 頂部導航列 ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="link" size={24} color={MibuBrand.brownDark} />
          <Text style={styles.headerTitle}>
            {isZh ? '帳號綁定' : 'Linked Accounts'}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MibuBrand.brown}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 說明卡片 ===== */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={MibuBrand.info} />
          <Text style={styles.infoText}>
            {isZh
              ? '綁定多個帳號可讓您使用不同方式登入，並保護帳號安全。'
              : 'Link multiple accounts to sign in with different methods and secure your account.'}
          </Text>
        </View>

        {/* ===== 已綁定的帳號列表 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isZh ? '已綁定的帳號' : 'Linked Accounts'}
          </Text>

          {identities.length === 0 ? (
            // 空狀態
            <View style={styles.emptyState}>
              <Ionicons name="link-outline" size={48} color={MibuBrand.tan} />
              <Text style={styles.emptyText}>
                {isZh ? '尚未綁定任何帳號' : 'No accounts linked'}
              </Text>
            </View>
          ) : (
            // 身份列表
            <View style={styles.identitiesList}>
              {identities.map(identity => {
                const provider = PROVIDER_INFO[identity.provider];
                return (
                  <View key={identity.id} style={styles.identityCard}>
                    {/* 提供者圖示 */}
                    <View style={[styles.providerIcon, { backgroundColor: provider?.color || MibuBrand.copper }]}>
                      <Ionicons
                        name={(provider?.icon || 'person') as any}
                        size={24}
                        color={UIColors.white}
                      />
                    </View>

                    {/* 身份資訊 */}
                    <View style={styles.identityInfo}>
                      <View style={styles.identityHeader}>
                        <Text style={styles.providerName}>
                          {provider?.label[isZh ? 'zh' : 'en'] || identity.provider}
                        </Text>
                        {/* 主要身份標籤 */}
                        {identity.isPrimary && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>
                              {isZh ? '主要' : 'Primary'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.identityEmail} numberOfLines={1}>
                        {identity.email || isZh ? '（未提供 Email）' : '(No email provided)'}
                      </Text>
                      <Text style={styles.linkedDate}>
                        {isZh ? '綁定於 ' : 'Linked '}
                        {new Date(identity.linkedAt).toLocaleDateString(isZh ? 'zh-TW' : 'en-US')}
                      </Text>
                    </View>

                    {/* 解除綁定按鈕（非主要且有多個身份時顯示） */}
                    {!identity.isPrimary && identities.length > 1 && (
                      <TouchableOpacity
                        style={styles.unlinkButton}
                        onPress={() => handleUnlink(identity)}
                        disabled={unlinkingId === identity.id}
                      >
                        {unlinkingId === identity.id ? (
                          <ActivityIndicator size="small" color={MibuBrand.error} />
                        ) : (
                          <Ionicons name="unlink" size={20} color={MibuBrand.error} />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ===== 新增綁定區塊 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isZh ? '新增綁定' : 'Add Account'}
          </Text>

          <View style={styles.bindOptions}>
            {/* Apple 綁定按鈕（iOS 且未綁定時顯示） */}
            {Platform.OS === 'ios' && appleAvailable && !hasProvider('apple') && (
              <TouchableOpacity
                style={styles.bindButton}
                onPress={handleBindApple}
                disabled={bindingProvider === 'apple'}
              >
                <View style={[styles.bindIcon, { backgroundColor: '#000000' }]}>
                  {bindingProvider === 'apple' ? (
                    <ActivityIndicator size="small" color={UIColors.white} />
                  ) : (
                    <Ionicons name="logo-apple" size={24} color={UIColors.white} />
                  )}
                </View>
                <View style={styles.bindInfo}>
                  <Text style={styles.bindLabel}>
                    {isZh ? '綁定 Apple' : 'Link Apple'}
                  </Text>
                  <Text style={styles.bindDesc}>
                    {isZh ? '使用 Apple ID 登入' : 'Sign in with Apple ID'}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color={MibuBrand.brown} />
              </TouchableOpacity>
            )}

            {/* Google 綁定按鈕（未綁定時顯示） */}
            {!hasProvider('google') && (
              <TouchableOpacity
                style={styles.bindButton}
                onPress={handleBindGoogle}
                disabled={bindingProvider === 'google'}
              >
                <View style={[styles.bindIcon, { backgroundColor: '#4285F4' }]}>
                  {bindingProvider === 'google' ? (
                    <ActivityIndicator size="small" color={UIColors.white} />
                  ) : (
                    <Ionicons name="logo-google" size={24} color={UIColors.white} />
                  )}
                </View>
                <View style={styles.bindInfo}>
                  <Text style={styles.bindLabel}>
                    {isZh ? '綁定 Google' : 'Link Google'}
                  </Text>
                  <Text style={styles.bindDesc}>
                    {isZh ? '使用 Google 帳號登入' : 'Sign in with Google'}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color={MibuBrand.brown} />
              </TouchableOpacity>
            )}

            {/* 已綁定所有帳號的提示 */}
            {hasProvider('apple') && hasProvider('google') && (
              <View style={styles.allLinkedState}>
                <Ionicons name="checkmark-circle" size={32} color={MibuBrand.success} />
                <Text style={styles.allLinkedText}>
                  {isZh ? '已綁定所有可用帳號' : 'All available accounts linked'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 底部留白 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  // 載入狀態容器
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  // 頂部導航列
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  // 內容區
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  // 說明卡片
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#EEF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#C7DEFF',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  // 區塊
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.copper,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  // 空狀態
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  emptyText: {
    fontSize: 15,
    color: MibuBrand.tan,
    marginTop: 12,
  },
  // 身份列表
  identitiesList: {
    gap: 12,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    gap: 12,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityInfo: {
    flex: 1,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  primaryBadge: {
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  identityEmail: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginBottom: 2,
  },
  linkedDate: {
    fontSize: 12,
    color: MibuBrand.tan,
  },
  unlinkButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 綁定選項
  bindOptions: {
    gap: 12,
  },
  bindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    gap: 12,
  },
  bindIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bindInfo: {
    flex: 1,
  },
  bindLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  bindDesc: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  // 全部已綁定狀態
  allLinkedState: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    gap: 8,
  },
  allLinkedText: {
    fontSize: 14,
    color: MibuBrand.success,
    fontWeight: '600',
  },
  // 底部留白
  bottomSpacer: {
    height: 100,
  },
});
