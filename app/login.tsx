import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import { useApp } from '../src/context/AppContext';
import { API_BASE_URL } from '../src/constants/translations';
import { UserRole } from '../src/types';

const AUTH_TOKEN_KEY = 'mibu_auth_token';

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
    { type: 'traveler', label: '旅客', color: '#6366f1', bgColor: '#eef2ff', subtitle: '探索台灣各地精彩景點', guestAllowed: true },
    { type: 'merchant', label: '企業端', color: '#10b981', bgColor: '#ecfdf5', subtitle: '景點業者、餐廳、住宿等企業合作夥伴', guestAllowed: false },
    { type: 'specialist', label: '專員端', color: '#a855f7', bgColor: '#faf5ff', subtitle: '旅遊專員服務入口', guestAllowed: false },
    { type: 'admin', label: '管理端', color: '#f59e0b', bgColor: '#fffbeb', subtitle: '系統管理員專用入口', guestAllowed: false },
  ],
  'en': [
    { type: 'traveler', label: 'Traveler', color: '#6366f1', bgColor: '#eef2ff', subtitle: 'Explore amazing destinations', guestAllowed: true },
    { type: 'merchant', label: 'Business', color: '#10b981', bgColor: '#ecfdf5', subtitle: 'For attractions, restaurants, and hotels', guestAllowed: false },
    { type: 'specialist', label: 'Specialist', color: '#a855f7', bgColor: '#faf5ff', subtitle: 'Travel specialist service portal', guestAllowed: false },
    { type: 'admin', label: 'Admin', color: '#f59e0b', bgColor: '#fffbeb', subtitle: 'System administrator portal', guestAllowed: false },
  ],
  'ja': [
    { type: 'traveler', label: '旅行者', color: '#6366f1', bgColor: '#eef2ff', subtitle: '素晴らしい目的地を探索', guestAllowed: true },
    { type: 'merchant', label: '企業', color: '#10b981', bgColor: '#ecfdf5', subtitle: '観光地、レストラン、宿泊施設向け', guestAllowed: false },
    { type: 'specialist', label: 'スペシャリスト', color: '#a855f7', bgColor: '#faf5ff', subtitle: '旅行スペシャリストポータル', guestAllowed: false },
    { type: 'admin', label: '管理者', color: '#f59e0b', bgColor: '#fffbeb', subtitle: 'システム管理者ポータル', guestAllowed: false },
  ],
  'ko': [
    { type: 'traveler', label: '여행자', color: '#6366f1', bgColor: '#eef2ff', subtitle: '놀라운 여행지 탐험', guestAllowed: true },
    { type: 'merchant', label: '기업', color: '#10b981', bgColor: '#ecfdf5', subtitle: '관광지, 레스토랑, 숙박 시설용', guestAllowed: false },
    { type: 'specialist', label: '전문가', color: '#a855f7', bgColor: '#faf5ff', subtitle: '여행 전문가 서비스 포털', guestAllowed: false },
    { type: 'admin', label: '관리자', color: '#f59e0b', bgColor: '#fffbeb', subtitle: '시스템 관리자 포털', guestAllowed: false },
  ],
};

export default function LoginScreen() {
  const { setUser, state } = useApp();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<PortalType>('traveler');
  const [showPortalMenu, setShowPortalMenu] = useState(false);

  const redirectUri = Linking.createURL('auth/callback');
  const portals = PORTAL_CONFIGS[state.language] || PORTAL_CONFIGS['zh-TW'];
  const currentPortal = portals.find(p => p.type === selectedPortal) || portals[0];

  const handleDeepLink = useCallback(async (event: { url: string }) => {
    const parsed = Linking.parse(event.url);
    
    if (parsed.path === 'auth/callback' || event.url.includes('auth/callback') || event.url.includes('token=') || event.url.includes('error=')) {
      // Handle error codes from callback
      if (parsed.queryParams?.error) {
        await WebBrowser.dismissBrowser();
        setLoading(false);
        const errorCode = parsed.queryParams?.error as string;
        const errorMessage = parsed.queryParams?.message as string;
        const isZh = state.language === 'zh-TW';
        
        switch (errorCode) {
          case 'NO_MERCHANT_DATA':
            Alert.alert(
              isZh ? '尚未註冊商家' : 'Not a Merchant',
              isZh ? '您尚未註冊為商家，請先申請商家帳號' : (errorMessage || 'Please register as a merchant first'),
              [{ text: isZh ? '確定' : 'OK' }]
            );
            break;
          case 'NO_SPECIALIST_DATA':
            Alert.alert(
              isZh ? '尚未註冊專員' : 'Not a Specialist',
              isZh ? '您尚未註冊為專員，請先申請專員帳號' : (errorMessage || 'Please register as a specialist first'),
              [{ text: isZh ? '確定' : 'OK' }]
            );
            break;
          case 'WRONG_PORTAL':
            Alert.alert(
              isZh ? '入口錯誤' : 'Wrong Portal',
              isZh ? '請切換至正確的入口登入' : (errorMessage || 'Please switch to the correct portal'),
              [{ text: isZh ? '確定' : 'OK' }]
            );
            break;
          case 'PERMISSION_DENIED':
            Alert.alert(
              isZh ? '權限不足' : 'Permission Denied',
              isZh ? '您沒有權限存取此功能' : (errorMessage || 'You do not have permission to access this feature'),
              [{ text: isZh ? '確定' : 'OK' }]
            );
            break;
          default:
            Alert.alert(
              isZh ? '登入失敗' : 'Login Failed',
              errorMessage || (isZh ? '請稍後再試' : 'Please try again'),
              [{ text: isZh ? '確定' : 'OK' }]
            );
        }
        return;
      }
      
      if (parsed.queryParams?.token) {
        await WebBrowser.dismissBrowser();
        await fetchUserWithTokenDirect(parsed.queryParams.token as string);
      }
    }
  }, [state.language]);

  const fetchUserWithTokenDirect = async (token: string) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      
      // *** 關鍵修改：從 AsyncStorage 讀出之前儲存的入口選擇 ***
      const targetPortal = await AsyncStorage.getItem('post_login_portal');
      // *** 用完後立即刪除，避免影響下次登入 ***
      await AsyncStorage.removeItem('post_login_portal');
      
      console.log('🔐 fetchUserWithTokenDirect - targetPortal from storage:', targetPortal);
      
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
          
          console.log('🔐 User data from API:', { 
            role: userData.role, 
            activeRole: userData.activeRole, 
            isSuperAdmin: userData.isSuperAdmin,
            isApproved: userData.isApproved,
            navigationRole,
            targetPortal: portalToUse
          });
          
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
    console.log('🔀 navigateAfterLogin called with:', { role, isApproved, isSuperAdmin, targetPortal });
    
    // *** 關鍵修改：始終優先使用 targetPortal（用戶選擇的入口），而非後端返回的 role ***
    const portalToUse = targetPortal || role;
    console.log('🔀 Using portal:', portalToUse);
    
    if (portalToUse === 'merchant') {
      if (isApproved === false) {
        console.log('🔀 Merchant not approved, going to pending');
        router.replace('/pending-approval');
      } else {
        console.log('🔀 Navigating to merchant-dashboard');
        router.replace('/merchant-dashboard');
      }
    } else if (portalToUse === 'specialist') {
      if (isApproved === false) {
        console.log('🔀 Specialist not approved, going to pending');
        router.replace('/pending-approval');
      } else {
        console.log('🔀 Navigating to specialist-dashboard');
        router.replace('/specialist-dashboard');
      }
    } else if (portalToUse === 'admin') {
      console.log('🔀 Navigating to admin-dashboard');
      router.replace('/admin-dashboard');
    } else {
      console.log('🔀 Navigating to tabs (traveler)');
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

  const handleLogin = async () => {
    setLoading(true);
    try {
      // *** 關鍵修改：在發起登入前，儲存使用者選擇的入口 ***
      await AsyncStorage.setItem('post_login_portal', selectedPortal);
      
      // Use /api/login with portal parameter
      const authUrl = `${API_BASE_URL}/api/login?portal=${selectedPortal}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      if (Platform.OS === 'web') {
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
      } else {
        const handleAuthCallback = async (event: { url: string }) => {
          const parsed = Linking.parse(event.url);
          
          if (event.url.includes('auth/callback') || event.url.includes('token=') || event.url.includes('error=')) {
            subscription.remove();
            
            await WebBrowser.dismissBrowser();
            
            // Handle error codes from callback
            if (parsed.queryParams?.error) {
              setLoading(false);
              const errorCode = parsed.queryParams?.error as string;
              const errorMessage = parsed.queryParams?.message as string;
              const isZh = state.language === 'zh-TW';
              
              switch (errorCode) {
                case 'NO_MERCHANT_DATA':
                  Alert.alert(
                    isZh ? '尚未註冊商家' : 'Not a Merchant',
                    isZh ? '您尚未註冊為商家，請先申請商家帳號' : (errorMessage || 'Please register as a merchant first'),
                    [{ text: isZh ? '確定' : 'OK' }]
                  );
                  break;
                case 'NO_SPECIALIST_DATA':
                  Alert.alert(
                    isZh ? '尚未註冊專員' : 'Not a Specialist',
                    isZh ? '您尚未註冊為專員，請先申請專員帳號' : (errorMessage || 'Please register as a specialist first'),
                    [{ text: isZh ? '確定' : 'OK' }]
                  );
                  break;
                case 'WRONG_PORTAL':
                  Alert.alert(
                    isZh ? '入口錯誤' : 'Wrong Portal',
                    isZh ? '請切換至正確的入口登入' : (errorMessage || 'Please switch to the correct portal'),
                    [{ text: isZh ? '確定' : 'OK' }]
                  );
                  break;
                case 'PERMISSION_DENIED':
                  Alert.alert(
                    isZh ? '權限不足' : 'Permission Denied',
                    isZh ? '您沒有權限存取此功能' : (errorMessage || 'You do not have permission to access this feature'),
                    [{ text: isZh ? '確定' : 'OK' }]
                  );
                  break;
                default:
                  Alert.alert(
                    isZh ? '登入失敗' : 'Login Failed',
                    errorMessage || (isZh ? '請稍後再試' : 'Please try again'),
                    [{ text: isZh ? '確定' : 'OK' }]
                  );
              }
              return;
            }
            
            if (parsed.queryParams?.token) {
              await fetchUserWithToken(parsed.queryParams.token as string);
            } else {
              console.error('Auth callback received but no token found');
              setLoading(false);
            }
          }
        };
        
        const subscription = Linking.addEventListener('url', handleAuthCallback);
        
        await WebBrowser.openBrowserAsync(authUrl, {
          showInRecents: true,
          dismissButtonStyle: 'close',
        });
        
        setTimeout(() => {
          subscription.remove();
          setLoading(false);
        }, 120000);
      }
    } catch (error) {
      console.error('Auth error:', error);
      // 清理可能殘留的存儲
      await AsyncStorage.removeItem('post_login_portal');
      setLoading(false);
    }
  };

  const fetchUserWithToken = async (token: string) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      
      // *** 關鍵修改：從 AsyncStorage 讀出之前儲存的入口選擇 ***
      const targetPortal = await AsyncStorage.getItem('post_login_portal');
      // *** 用完後立即刪除，避免影響下次登入 ***
      await AsyncStorage.removeItem('post_login_portal');
      
      console.log('🔐 fetchUserWithToken - targetPortal from storage:', targetPortal);
      
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
          
          console.log('🔐 fetchUserWithToken - User data:', { 
            role: userData.role, 
            activeRole: userData.activeRole, 
            isSuperAdmin: userData.isSuperAdmin,
            isApproved: userData.isApproved,
            navigationRole,
            targetPortal: portalToUse
          });
          
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
      const targetPortal = await AsyncStorage.getItem('post_login_portal');
      // *** 用完後立即刪除，避免影響下次登入 ***
      await AsyncStorage.removeItem('post_login_portal');
      
      console.log('🔐 fetchUserAfterAuth - targetPortal from storage:', targetPortal);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.name) {
          // 使用從 AsyncStorage 讀出的 targetPortal
          const portalToUse = targetPortal || selectedPortal;
          let finalActiveRole = userData.activeRole || userData.role || portalToUse;
          const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
          
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
          
          console.log('🔐 fetchUserAfterAuth - User data:', { 
            role: userData.role, 
            activeRole: userData.activeRole, 
            isSuperAdmin: userData.isSuperAdmin,
            isApproved: userData.isApproved,
            navigationRole,
            targetPortal: portalToUse
          });
          
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

  if (checkingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const t = {
    'zh-TW': {
      switchPortal: '切換用戶別',
      login: 'Google 登入',
      guest: '訪客登入',
      guestNote: '訪客模式的資料僅保存在此裝置',
    },
    'en': {
      switchPortal: 'Switch Portal',
      login: 'Google Sign In',
      guest: 'Guest Login',
      guestNote: 'Guest mode data is only saved on this device',
    },
    'ja': {
      switchPortal: 'ポータル切替',
      login: 'Googleログイン',
      guest: 'ゲストログイン',
      guestNote: 'ゲストモードのデータはこのデバイスにのみ保存',
    },
    'ko': {
      switchPortal: '포털 전환',
      login: 'Google 로그인',
      guest: '게스트 로그인',
      guestNote: '게스트 모드 데이터는 이 기기에만 저장됩니다',
    },
  };

  const texts = t[state.language] || t['zh-TW'];

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
        <TouchableOpacity style={styles.globeButton}>
          <Ionicons name="globe-outline" size={28} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.portalSwitcher}>
        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setShowPortalMenu(!showPortalMenu)}
        >
          <Text style={[styles.switchButtonText, { color: currentPortal.color }]}>
            {texts.switchPortal}
          </Text>
        </TouchableOpacity>

        {showPortalMenu && (
          <View style={styles.portalMenu}>
            {portals.map((portal) => (
              <TouchableOpacity
                key={portal.type}
                style={[
                  styles.portalMenuItem,
                  selectedPortal === portal.type && { backgroundColor: portal.bgColor },
                ]}
                onPress={() => {
                  setSelectedPortal(portal.type);
                  setShowPortalMenu(false);
                }}
              >
                <Text style={[
                  styles.portalMenuText,
                  selectedPortal === portal.type && { color: portal.color, fontWeight: '700' },
                ]}>
                  {portal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Mibu</Text>
        <Text style={styles.subtitle}>今天去哪玩?老天說了算</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: currentPortal.color }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="arrow-redo" size={22} color="#ffffff" />
                <Text style={styles.loginButtonText}>{texts.login}</Text>
              </>
            )}
          </TouchableOpacity>

          {currentPortal.guestAllowed && (
            <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
              <Text style={styles.guestButtonText}>{texts.guest}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.note}>
            {currentPortal.guestAllowed ? texts.guestNote : currentPortal.subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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
    color: '#1e293b',
    letterSpacing: 2,
  },
  globeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#e2e8f0',
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 140,
  },
  portalMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  portalMenuText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
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
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  guestButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#334155',
  },
  note: {
    fontSize: 14,
    color: '#6366f1',
    textAlign: 'center',
    marginTop: 16,
  },
});
