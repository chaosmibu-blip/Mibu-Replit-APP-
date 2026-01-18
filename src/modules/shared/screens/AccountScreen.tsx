/**
 * AccountScreen - 帳號綁定畫面
 * 顯示並管理已連結的 OAuth 身份（Apple/Google）
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
import { MibuBrand } from '../../../../constants/Colors';

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

export function AccountScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [identities, setIdentities] = useState<LinkedIdentity[]>([]);
  const [primaryId, setPrimaryId] = useState<string>('');
  const [bindingProvider, setBindingProvider] = useState<string | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadIdentities();
  }, [loadIdentities]);

  const handleBindApple = async () => {
    if (bindingProvider) return;
    setBindingProvider('apple');

    try {
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

  const handleBindGoogle = async () => {
    // Google Sign-In would be implemented here with expo-auth-session
    Alert.alert(
      isZh ? '功能開發中' : 'Coming Soon',
      isZh ? 'Google 綁定功能即將推出' : 'Google linking will be available soon'
    );
  };

  const handleUnlink = async (identity: LinkedIdentity) => {
    if (unlinkingId) return;

    // Check if this is the only identity
    if (identities.length <= 1) {
      Alert.alert(
        isZh ? '無法解除綁定' : 'Cannot Unlink',
        isZh ? '至少需要保留一個登入方式' : 'You must keep at least one login method'
      );
      return;
    }

    // Check if this is the primary identity
    if (identity.isPrimary) {
      Alert.alert(
        isZh ? '無法解除綁定' : 'Cannot Unlink',
        isZh ? '無法解除主要登入方式，請先設定其他帳號為主要登入方式' : 'Cannot unlink primary login method. Please set another account as primary first.'
      );
      return;
    }

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

  const hasProvider = (provider: string) =>
    identities.some(i => i.provider === provider);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={MibuBrand.info} />
          <Text style={styles.infoText}>
            {isZh
              ? '綁定多個帳號可讓您使用不同方式登入，並保護帳號安全。'
              : 'Link multiple accounts to sign in with different methods and secure your account.'}
          </Text>
        </View>

        {/* Linked Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isZh ? '已綁定的帳號' : 'Linked Accounts'}
          </Text>

          {identities.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="link-outline" size={48} color={MibuBrand.tan} />
              <Text style={styles.emptyText}>
                {isZh ? '尚未綁定任何帳號' : 'No accounts linked'}
              </Text>
            </View>
          ) : (
            <View style={styles.identitiesList}>
              {identities.map(identity => {
                const provider = PROVIDER_INFO[identity.provider];
                return (
                  <View key={identity.id} style={styles.identityCard}>
                    <View style={[styles.providerIcon, { backgroundColor: provider?.color || MibuBrand.copper }]}>
                      <Ionicons
                        name={(provider?.icon || 'person') as any}
                        size={24}
                        color="#ffffff"
                      />
                    </View>

                    <View style={styles.identityInfo}>
                      <View style={styles.identityHeader}>
                        <Text style={styles.providerName}>
                          {provider?.label[isZh ? 'zh' : 'en'] || identity.provider}
                        </Text>
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

        {/* Add New Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isZh ? '新增綁定' : 'Add Account'}
          </Text>

          <View style={styles.bindOptions}>
            {/* Apple */}
            {Platform.OS === 'ios' && appleAvailable && !hasProvider('apple') && (
              <TouchableOpacity
                style={styles.bindButton}
                onPress={handleBindApple}
                disabled={bindingProvider === 'apple'}
              >
                <View style={[styles.bindIcon, { backgroundColor: '#000000' }]}>
                  {bindingProvider === 'apple' ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="logo-apple" size={24} color="#ffffff" />
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

            {/* Google */}
            {!hasProvider('google') && (
              <TouchableOpacity
                style={styles.bindButton}
                onPress={handleBindGoogle}
                disabled={bindingProvider === 'google'}
              >
                <View style={[styles.bindIcon, { backgroundColor: '#4285F4' }]}>
                  {bindingProvider === 'google' ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="logo-google" size={24} color="#ffffff" />
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

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
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
  bottomSpacer: {
    height: 100,
  },
});
