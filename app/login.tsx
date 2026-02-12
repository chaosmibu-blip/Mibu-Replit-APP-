/**
 * 登入頁面
 *
 * 提供多入口登入功能：
 * - 旅客入口（traveler）
 * - 商家入口（merchant）
 * - 專員入口（specialist）
 * - 管理端入口（admin）
 *
 * 支援的登入方式：
 * - Google OAuth（Web 使用 Replit OAuth，iOS/Android 使用原生登入）
 * - Apple Sign In（僅 iOS）
 *
 * 功能：
 * - 多語系支援（繁中、英文、日文、韓文）
 * - Deep Link 處理 OAuth 回調
 * - 登入後根據角色自動導向對應頁面
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Platform,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useAuth, useI18n } from '../src/context/AppContext';
import { API_BASE_URL } from '../src/constants/translations';
import { UserRole } from '../src/types';
import { MibuBrand, RoleColors, UIColors } from '../constants/Colors';
import { STORAGE_KEYS } from '../src/constants/storageKeys';
import { isValidJWTFormat, isAuthCallbackPath } from '../src/utils/validation';

// OAuth 登入 URL - 使用環境變數設定的 API URL（正式或開發環境）
const OAUTH_BASE_URL = API_BASE_URL;

type PortalType = 'traveler' | 'merchant' | 'specialist' | 'admin';

interface PortalConfig {
  type: PortalType;
  label: string;
  color: string;
  bgColor: string;
  subtitle: string;
  guestAllowed: boolean;
}

const PORTAL_CONFIGS: Record<string, PortalConfig[]> = {
  'zh-TW': [
    { type: 'traveler', label: '旅客', color: MibuBrand.brown, bgColor: MibuBrand.highlight, subtitle: '探索台灣各地精彩景點', guestAllowed: true },
    { type: 'merchant', label: '商家', color: RoleColors.merchant.main, bgColor: RoleColors.merchant.light, subtitle: '管理優惠券與店家資訊', guestAllowed: false },
    { type: 'specialist', label: '專員', color: RoleColors.specialist.main, bgColor: RoleColors.specialist.light, subtitle: '協助旅客規劃行程', guestAllowed: false },
    { type: 'admin', label: '管理端', color: MibuBrand.warning, bgColor: MibuBrand.highlight, subtitle: '系統管理員專用入口', guestAllowed: false },
  ],
  'en': [
    { type: 'traveler', label: 'Traveler', color: MibuBrand.brown, bgColor: MibuBrand.highlight, subtitle: 'Explore amazing destinations', guestAllowed: true },
    { type: 'merchant', label: 'Merchant', color: RoleColors.merchant.main, bgColor: RoleColors.merchant.light, subtitle: 'Manage coupons and store info', guestAllowed: false },
    { type: 'specialist', label: 'Specialist', color: RoleColors.specialist.main, bgColor: RoleColors.specialist.light, subtitle: 'Help travelers plan trips', guestAllowed: false },
    { type: 'admin', label: 'Admin', color: MibuBrand.warning, bgColor: MibuBrand.highlight, subtitle: 'System administrator portal', guestAllowed: false },
  ],
  'ja': [
    { type: 'traveler', label: '旅行者', color: MibuBrand.brown, bgColor: MibuBrand.highlight, subtitle: '素晴らしい目的地を探索', guestAllowed: true },
    { type: 'merchant', label: '加盟店', color: RoleColors.merchant.main, bgColor: RoleColors.merchant.light, subtitle: 'クーポンと店舗情報を管理', guestAllowed: false },
    { type: 'specialist', label: '専門家', color: RoleColors.specialist.main, bgColor: RoleColors.specialist.light, subtitle: '旅行者の旅程計画をサポート', guestAllowed: false },
    { type: 'admin', label: '管理者', color: MibuBrand.warning, bgColor: MibuBrand.highlight, subtitle: 'システム管理者ポータル', guestAllowed: false },
  ],
  'ko': [
    { type: 'traveler', label: '여행자', color: MibuBrand.brown, bgColor: MibuBrand.highlight, subtitle: '놀라운 여행지 탐험', guestAllowed: true },
    { type: 'merchant', label: '가맹점', color: RoleColors.merchant.main, bgColor: RoleColors.merchant.light, subtitle: '쿠폰 및 매장 정보 관리', guestAllowed: false },
    { type: 'specialist', label: '전문가', color: RoleColors.specialist.main, bgColor: RoleColors.specialist.light, subtitle: '여행자의 여행 계획 지원', guestAllowed: false },
    { type: 'admin', label: '관리자', color: MibuBrand.warning, bgColor: MibuBrand.highlight, subtitle: '시스템 관리자 포털', guestAllowed: false },
  ],
};

const LANGUAGE_OPTIONS: { code: 'zh-TW' | 'en' | 'ja' | 'ko'; label: string; flag: string }[] = [
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

export default function LoginScreen() {
  const { setUser } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<PortalType>('traveler');
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Google 原生登入 Hook（僅 iOS/Android 使用）
  const { signInWithGoogle, isReady: isGoogleReady } = useGoogleAuth();

  const redirectUri = Linking.createURL('auth/callback');
  const portals = PORTAL_CONFIGS[language] || PORTAL_CONFIGS['zh-TW'];
  const currentPortal = portals.find(p => p.type === selectedPortal) || portals[0];

  const handleDeepLink = useCallback(async (event: { url: string }) => {
    const parsed = Linking.parse(event.url);

    // 安全加固：僅允許 auth/callback 路徑，移除過於寬鬆的 includes('token=') 判斷
    if (isAuthCallbackPath(parsed.path) || event.url.includes('auth/callback')) {
      // Handle error codes from callback
      if (parsed.queryParams?.error) {
        await WebBrowser.dismissBrowser();
        setLoading(false);
        const errorCode = parsed.queryParams?.error as string;
        const errorMessage = parsed.queryParams?.message as string;
        
        switch (errorCode) {
          case 'NO_MERCHANT_DATA':
            Alert.alert(
              t.auth_notMerchant,
              errorMessage || t.auth_notMerchantDesc,
              [{ text: t.common_confirm }]
            );
            break;
          case 'NO_SPECIALIST_DATA':
            Alert.alert(
              t.auth_notSpecialist,
              errorMessage || t.auth_notSpecialistDesc,
              [{ text: t.common_confirm }]
            );
            break;
          case 'WRONG_PORTAL':
            Alert.alert(
              t.auth_wrongPortal,
              errorMessage || t.auth_wrongPortalDesc,
              [{ text: t.common_confirm }]
            );
            break;
          case 'PERMISSION_DENIED':
            Alert.alert(
              t.auth_permissionDenied,
              errorMessage || t.auth_permissionDeniedDesc,
              [{ text: t.common_confirm }]
            );
            break;
          default:
            Alert.alert(
              t.auth_oauthLoginFailed,
              errorMessage || t.auth_tryAgainLater,
              [{ text: t.common_confirm }]
            );
        }
        return;
      }
      
      // 安全檢查：token 必須符合 JWT 格式才處理
      if (isValidJWTFormat(parsed.queryParams?.token)) {
        await WebBrowser.dismissBrowser();
        await fetchUserWithTokenDirect(parsed.queryParams.token);
      }
    }
  }, [language]);

  const fetchUserWithTokenDirect = async (token: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      // *** 關鍵修改：從 AsyncStorage 讀出之前儲存的入口選擇 ***
      const targetPortal = await AsyncStorage.getItem(STORAGE_KEYS.POST_LOGIN_PORTAL);
      // *** 用完後立即刪除，避免影響下次登入 ***
      await AsyncStorage.removeItem(STORAGE_KEYS.POST_LOGIN_PORTAL);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.name) {
          // 使用從 AsyncStorage 讀出的 targetPortal
          const portalToUse = targetPortal || selectedPortal;
          let finalActiveRole = userData.activeRole || userData.role || portalToUse;
          
          if (userData.isSuperAdmin && portalToUse !== finalActiveRole) {
            try {
              const switchResponse = await fetch(`${API_BASE_URL}/api/auth/switch-role`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: portalToUse }),
              });
              
              if (switchResponse.ok) {
                const switchData = await switchResponse.json();
                finalActiveRole = switchData.activeRole || portalToUse;
              }
            } catch (switchError) {
              console.error('Failed to switch role:', switchError);
              finalActiveRole = portalToUse;
            }
          }
          
          // Use API role for navigation, activeRole for super admins
          const userRole = userData.role || 'traveler';
          const navigationRole = userData.isSuperAdmin ? finalActiveRole : userRole;
          
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email || null,
            avatar: userData.avatar || null,
            firstName: userData.firstName || userData.name.split(' ')[0],
            role: userRole,
            activeRole: finalActiveRole,
            isApproved: userData.isApproved,
            isSuperAdmin: userData.isSuperAdmin || false,
            accessibleRoles: userData.accessibleRoles || [],
            provider: 'google',
            providerId: userData.id,
          }, token);
          setLoading(false);
          // *** 關鍵修改：傳入 targetPortal 給 navigateAfterLogin ***
          navigateAfterLogin(navigationRole, userData.isApproved, userData.isSuperAdmin, portalToUse);
        }
      } else {
        console.error('Failed to fetch user data:', response.status);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch user with token:', error);
      setLoading(false);
    }
  };

  const navigateAfterLogin = (role: string, isApproved?: boolean, isSuperAdmin?: boolean, targetPortal?: string) => {
    // *** 關鍵修改：始終優先使用 targetPortal（用戶選擇的入口），而非後端返回的 role ***
    const portalToUse = targetPortal || role;
    
    if (portalToUse === 'merchant') {
      if (isApproved === false) {
        router.replace('/pending-approval');
      } else {
        router.replace('/merchant-dashboard');
      }
    } else if (portalToUse === 'specialist') {
      if (isApproved === false) {
        router.replace('/pending-approval');
      } else {
        router.replace('/specialist-dashboard');
      }
    } else if (portalToUse === 'admin') {
      router.replace('/admin-dashboard');
    } else {
      router.replace('/(tabs)');
    }
  };

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [handleDeepLink]);

  // Google 原生登入（iOS/Android）
  const handleGoogleNativeLogin = async () => {
    try {
      setLoading(true);

      // 1. 取得 Google idToken（原生方式）
      const idToken = await signInWithGoogle();

      // 2. 傳送到後端驗證
      const apiUrl = `${API_BASE_URL}/api/auth/mobile`;
      const requestBody = {
        provider: 'google',
        idToken: idToken,
        targetPortal: selectedPortal,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.token && data.user) {
        const userRole = data.user.role as UserRole || 'traveler';
        const finalActiveRole = data.user.activeRole as UserRole || userRole;

        await setUser({
          id: data.user.id,
          name: data.user.name || 'User',
          email: data.user.email || null,
          avatar: data.user.avatar || null,
          firstName: data.user.firstName || data.user.name?.split(' ')[0] || 'User',
          role: userRole,
          activeRole: finalActiveRole,
          isApproved: data.user.isApproved,
          isSuperAdmin: data.user.isSuperAdmin || false,
          accessibleRoles: data.user.accessibleRoles || [],
          provider: 'google',
          providerId: data.user.id,
        }, data.token);

        navigateAfterLogin(userRole, data.user.isApproved, data.user.isSuperAdmin, selectedPortal);
      } else {
        Alert.alert(
          t.auth_oauthLoginFailed,
          data.error || t.auth_tryAgainLater
        );
      }
    } catch (error: any) {
      console.error('[Google Native] Error:', error);
      if (error.message === '使用者取消登入') {
        // 使用者取消登入，不需處理
      } else {
        Alert.alert(
          t.auth_loginError,
          t.auth_googleSignInFailed
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth 登入（Web 平台使用 Replit OAuth）
  const handleLogin = async () => {
    // iOS/Android 使用原生登入
    if (Platform.OS !== 'web') {
      return handleGoogleNativeLogin();
    }

    // Web 平台繼續使用 Replit OAuth
    setLoading(true);
    try {
      // *** 關鍵修改：在發起登入前，儲存使用者選擇的入口 ***
      await AsyncStorage.setItem(STORAGE_KEYS.POST_LOGIN_PORTAL, selectedPortal);

      // Use /api/login with portal parameter - OAuth 使用開發環境 URL（僅 Web 平台）
      const authUrl = `${OAUTH_BASE_URL}/api/login?portal=${selectedPortal}&redirect_uri=${encodeURIComponent(redirectUri)}`;

      const width = 500;
      const height = 600;
      const left = (window.screenX || 0) + ((window.outerWidth || 800) - width) / 2;
      const top = (window.screenY || 0) + ((window.outerHeight || 600) - height) / 2;

      const authWindow = window.open(
        authUrl,
        'auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      const checkInterval = setInterval(async () => {
        try {
          if (authWindow?.closed) {
            clearInterval(checkInterval);
            await fetchUserAfterAuth();
            setLoading(false);
          }
        } catch (e) {
        }
      }, 500);

      setTimeout(() => {
        clearInterval(checkInterval);
        setLoading(false);
      }, 120000);
    } catch (error) {
      console.error('Auth error:', error);
      // 清理可能殘留的存儲
      await AsyncStorage.removeItem(STORAGE_KEYS.POST_LOGIN_PORTAL);
      setLoading(false);
    }
  };

  const fetchUserWithToken = async (token: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      // *** 關鍵修改：從 AsyncStorage 讀出之前儲存的入口選擇 ***
      const targetPortal = await AsyncStorage.getItem(STORAGE_KEYS.POST_LOGIN_PORTAL);
      // *** 用完後立即刪除，避免影響下次登入 ***
      await AsyncStorage.removeItem(STORAGE_KEYS.POST_LOGIN_PORTAL);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.id) {
          const displayName = userData.firstName || userData.name || userData.email?.split('@')[0] || 'User';
          
          // 使用從 AsyncStorage 讀出的 targetPortal
          const portalToUse = targetPortal || selectedPortal;
          let finalActiveRole = userData.activeRole || userData.role || portalToUse;
          
          if (userData.isSuperAdmin && portalToUse !== finalActiveRole) {
            try {
              const switchResponse = await fetch(`${API_BASE_URL}/api/auth/switch-role`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: portalToUse }),
              });
              
              if (switchResponse.ok) {
                const switchData = await switchResponse.json();
                finalActiveRole = switchData.activeRole || portalToUse;
              }
            } catch (switchError) {
              console.error('Failed to switch role:', switchError);
              finalActiveRole = portalToUse;
            }
          }
          
          // Use API role for navigation, activeRole for super admins
          const userRole = userData.role || 'traveler';
          const navigationRole = userData.isSuperAdmin ? finalActiveRole : userRole;
          
          setUser({
            id: userData.id,
            name: displayName,
            email: userData.email || null,
            firstName: userData.firstName || null,
            lastName: userData.lastName || null,
            avatar: userData.profileImageUrl || userData.avatar || null,
            profileImageUrl: userData.profileImageUrl || null,
            role: userRole,
            activeRole: finalActiveRole,
            isApproved: userData.isApproved,
            isSuperAdmin: userData.isSuperAdmin || false,
            accessibleRoles: userData.accessibleRoles || [],
            provider: userData.provider || 'google',
            providerId: userData.id,
          }, token);
          setLoading(false);
          // *** 關鍵修改：傳入 targetPortal 給 navigateAfterLogin ***
          navigateAfterLogin(navigationRole, userData.isApproved, userData.isSuperAdmin, portalToUse);
        } else {
          console.error('Invalid user data: missing id');
          setLoading(false);
        }
      } else {
        console.error('Failed to fetch user:', response.status);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch user with token:', error);
      setLoading(false);
    }
  };

  const fetchUserAfterAuth = async () => {
    try {
      // *** 關鍵修改：從 AsyncStorage 讀出之前儲存的入口選擇 ***
      const targetPortal = await AsyncStorage.getItem(STORAGE_KEYS.POST_LOGIN_PORTAL);
      // *** 用完後立即刪除，避免影響下次登入 ***
      await AsyncStorage.removeItem(STORAGE_KEYS.POST_LOGIN_PORTAL);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.name) {
          // 使用從 AsyncStorage 讀出的 targetPortal
          const portalToUse = targetPortal || selectedPortal;
          let finalActiveRole = userData.activeRole || userData.role || portalToUse;
          const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
          
          if (userData.isSuperAdmin && portalToUse !== finalActiveRole && token) {
            try {
              const switchResponse = await fetch(`${API_BASE_URL}/api/auth/switch-role`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: portalToUse }),
              });
              
              if (switchResponse.ok) {
                const switchData = await switchResponse.json();
                finalActiveRole = switchData.activeRole || portalToUse;
              }
            } catch (switchError) {
              console.error('Failed to switch role:', switchError);
              finalActiveRole = portalToUse;
            }
          }
          
          // Use API role for navigation, activeRole for super admins
          const userRole = userData.role || 'traveler';
          const navigationRole = userData.isSuperAdmin ? finalActiveRole : userRole;
          
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email || null,
            avatar: userData.avatar || null,
            firstName: userData.firstName || userData.name.split(' ')[0],
            role: userRole,
            activeRole: finalActiveRole,
            isApproved: userData.isApproved,
            isSuperAdmin: userData.isSuperAdmin || false,
            accessibleRoles: userData.accessibleRoles || [],
            provider: 'google',
            providerId: userData.id,
          });
          // *** 關鍵修改：傳入 targetPortal 給 navigateAfterLogin ***
          navigateAfterLogin(navigationRole, userData.isApproved, userData.isSuperAdmin, portalToUse);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user after auth:', error);
    }
  };

  const handleGuestLogin = () => {
    setUser({
      id: 'guest',
      name: 'Guest User',
      email: null,
      avatar: null,
      firstName: 'Guest',
      role: 'traveler',
      provider: 'guest',
      providerId: 'guest',
    });
    router.replace('/(tabs)');
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const apiUrl = `${API_BASE_URL}/api/auth/mobile`;
        const requestBody = {
          provider: 'apple',
          identityToken: credential.identityToken,
          user: credential.user,
          portal: selectedPortal,
          email: credential.email,
          fullName: credential.fullName ? {
            givenName: credential.fullName.givenName,
            familyName: credential.fullName.familyName,
          } : undefined,
        };
        
        const bodyString = JSON.stringify(requestBody);

        if (!requestBody.identityToken) {
          console.error('[Apple Auth] No identityToken!');
          return;
        }
        
        let response;
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: bodyString,
          });
        } catch (fetchError: any) {
          console.error('[Apple Auth] FETCH ERROR:', fetchError);
          console.error('[Apple Auth] FETCH ERROR message:', fetchError.message);
          Alert.alert(
            t.auth_networkError,
            t.auth_cannotConnectServer
          );
          return;
        }

        const responseText = await response.text();
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('[Apple Auth] Failed to parse response as JSON');
          data = { error: responseText };
        }
        
        if (data.token && data.user) {
          const userRole = data.user.role as UserRole || 'traveler';
          const finalActiveRole = data.user.activeRole as UserRole || userRole;
          
          await setUser({
            id: data.user.id,
            name: data.user.name || credential.fullName?.givenName || 'User',
            email: data.user.email || credential.email || null,
            avatar: data.user.avatar || null,
            firstName: data.user.firstName || credential.fullName?.givenName || 'User',
            role: userRole,
            activeRole: finalActiveRole,
            isApproved: data.user.isApproved,
            isSuperAdmin: data.user.isSuperAdmin || false,
            accessibleRoles: data.user.accessibleRoles || [],
            provider: 'apple',
            providerId: credential.user,
          }, data.token);
          
          navigateAfterLogin(userRole, data.user.isApproved, data.user.isSuperAdmin, selectedPortal);
        } else {
          Alert.alert(
            t.auth_oauthLoginFailed,
            data.error || t.auth_tryAgainLater
          );
        }
      }
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // 使用者取消 Apple 登入，不需處理
      } else {
        console.error('[Apple Auth] Error:', {
          code: error.code,
          message: error.message,
          name: error.name,
          stack: error.stack?.substring(0, 200),
        });
        Alert.alert(
          t.auth_loginError,
          t.auth_appleSignInFailed
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  // 使用全域 t 翻譯字典（來自 useI18n）

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>MIBU</Text>
        </View>
        <TouchableOpacity
          style={styles.globeButton}
          onPress={() => setShowLanguageMenu(!showLanguageMenu)}
          accessibilityLabel={t.auth_switchLanguage}
          accessibilityRole="button"
        >
          <Ionicons name="globe-outline" size={28} color={MibuBrand.copper} />
        </TouchableOpacity>
      </View>

      {/* 角色切換器已隱藏 — 目前僅開放旅客入口，商家/專員/管理端暫不開放 */}

      <View style={styles.content}>
        <Text style={styles.title}>Mibu</Text>
        <Text style={styles.subtitle}>今天去哪玩?老天說了算</Text>

        <View style={styles.buttonContainer}>
          {/* 所有身份別統一使用 OAuth 登入 (Google/Apple) */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: currentPortal.color }]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityLabel={t.auth_googleLogin}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color={UIColors.white} />
            ) : (
              <>
                <Ionicons name="arrow-redo" size={22} color={UIColors.white} />
                <Text style={styles.loginButtonText}>{t.auth_googleLogin}</Text>
              </>
            )}
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={28}
              style={{ width: '100%', height: 52, marginTop: 12 }}
              onPress={handleAppleLogin}
            />
          )}

          <Text style={styles.note}>
            {currentPortal.subtitle}
          </Text>
        </View>
      </View>

      {/* 語系選單（置於根容器層級，遮罩才能覆蓋全螢幕） */}
      {showLanguageMenu && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]}
            onPress={() => setShowLanguageMenu(false)}
          />
          <View style={[styles.languageMenu, { zIndex: 1000 }]}>
            {LANGUAGE_OPTIONS.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageMenuItem,
                  language === lang.code && styles.languageMenuItemActive,
                ]}
                onPress={() => {
                  setLanguage(lang.code);
                  setShowLanguageMenu(false);
                }}
                accessibilityLabel={`${t.auth_switchTo} ${lang.label}`}
                accessibilityRole="menuitem"
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageMenuText,
                  language === lang.code && styles.languageMenuTextActive,
                ]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: MibuBrand.dark,
    letterSpacing: 2,
  },
  globeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portalSwitcher: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  switchButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  switchButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  portalMenu: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: UIColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 140,
  },
  portalMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  portalMenuText: {
    fontSize: 16,
    color: UIColors.textSecondary,
  },
  languageMenu: {
    position: 'absolute',
    top: 110,
    right: 20,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    paddingVertical: 8,
    shadowColor: UIColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 160,
    zIndex: 1000,
  },
  languageMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  languageMenuItemActive: {
    backgroundColor: MibuBrand.highlight,
  },
  languageFlag: {
    fontSize: 20,
  },
  languageMenuText: {
    fontSize: 15,
    color: UIColors.textSecondary,
  },
  languageMenuTextActive: {
    color: MibuBrand.brown,
    fontWeight: '700',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: UIColors.black,
    paddingVertical: 16,
    borderRadius: 28,
    marginTop: 12,
  },
  appleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: UIColors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    marginTop: -60,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: MibuBrand.brown,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MibuBrand.copper,
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonContainer: {
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: MibuBrand.brownDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: UIColors.white,
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.warmWhite,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: UIColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guestButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: MibuBrand.dark,
  },
  note: {
    fontSize: 14,
    color: MibuBrand.brown,
    textAlign: 'center',
    marginTop: 16,
  },
});
