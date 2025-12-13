import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { API_BASE_URL } from '../src/constants/translations';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { setUser, state } = useApp();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const redirectUri = Linking.createURL('auth/callback');

  const handleDeepLink = useCallback(async (event: { url: string }) => {
    console.log('=== Deep Link Received ===');
    console.log('URL:', event.url);
    
    const parsed = Linking.parse(event.url);
    console.log('Parsed:', JSON.stringify(parsed, null, 2));
    
    if (parsed.path === 'auth/callback' || event.url.includes('auth/callback')) {
      if (parsed.queryParams?.token) {
        console.log('Token found in deep link!');
        await WebBrowser.dismissBrowser();
        await fetchUserWithTokenDirect(parsed.queryParams.token as string);
      }
    }
  }, []);

  const fetchUserWithTokenDirect = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.name) {
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email || null,
            avatar: userData.avatar || null,
            firstName: userData.firstName || userData.name.split(' ')[0],
            provider: 'replit',
            providerId: userData.id,
          });
          setLoading(false);
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Failed to fetch user with token:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Generated redirect URI:', redirectUri);
    
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        handleDeepLink({ url });
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [handleDeepLink, redirectUri]);

  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      router.replace('/(tabs)');
    } else {
      setCheckingAuth(false);
    }
  }, [state.isAuthenticated, state.user]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const authUrl = `${API_BASE_URL}/api/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      console.log('Auth URL:', authUrl);
      console.log('Redirect URI:', redirectUri);
      
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
        Alert.alert(
          '登入資訊',
          `Auth URL:\n${authUrl}\n\nRedirect URI:\n${redirectUri}`,
          [{ text: '繼續', style: 'default' }]
        );
        
        const result = await WebBrowser.openAuthSessionAsync(
          authUrl,
          redirectUri,
          {
            preferEphemeralSession: true,
            showInRecents: true,
          }
        );

        const resultInfo = `Type: ${result.type}\n\nURL: ${(result as any).url || 'null'}\n\nError: ${(result as any).error || 'none'}`;
        
        Alert.alert(
          '登入結果',
          resultInfo,
          [{ text: '確定', style: 'default' }]
        );

        if (result.type === 'success') {
          const url = result.url;
          const parsed = Linking.parse(url);
          
          if (parsed.queryParams?.token) {
            await fetchUserWithToken(parsed.queryParams.token as string);
          } else {
            await fetchUserAfterAuth();
          }
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setLoading(false);
    }
  };

  const fetchUserWithToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.name) {
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email || null,
            avatar: userData.avatar || null,
            firstName: userData.firstName || userData.name.split(' ')[0],
            provider: 'replit',
            providerId: userData.id,
          });
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Failed to fetch user with token:', error);
    }
  };

  const fetchUserAfterAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.name) {
          setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email || null,
            avatar: userData.avatar || null,
            firstName: userData.firstName || userData.name.split(' ')[0],
            provider: 'replit',
            providerId: userData.id,
          });
          router.replace('/(tabs)');
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
      welcome: '歡迎使用 Mibu',
      subtitle: '旅遊扭蛋 - 探索台灣各地精彩景點',
      login: '使用 Replit 登入',
      guest: '以訪客身份繼續',
      note: '訪客模式下，資料僅保存在本機裝置',
    },
    'en': {
      welcome: 'Welcome to Mibu',
      subtitle: 'Travel Gacha - Explore amazing destinations',
      login: 'Sign in with Replit',
      guest: 'Continue as Guest',
      note: 'In guest mode, data is only saved locally',
    },
    'ja': {
      welcome: 'Mibuへようこそ',
      subtitle: '旅行ガチャ - 素晴らしい目的地を探索',
      login: 'Replitでログイン',
      guest: 'ゲストとして続ける',
      note: 'ゲストモードではデータはローカルにのみ保存されます',
    },
    'ko': {
      welcome: 'Mibu에 오신 것을 환영합니다',
      subtitle: '여행 가챠 - 놀라운 여행지 탐험',
      login: 'Replit으로 로그인',
      guest: '게스트로 계속하기',
      note: '게스트 모드에서는 데이터가 로컬에만 저장됩니다',
    },
  };

  const texts = t[state.language] || t['zh-TW'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="dice" size={48} color="#ffffff" />
          </View>
        </View>
        <Text style={styles.appName}>MIBU</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{texts.welcome}</Text>
        <Text style={styles.subtitle}>{texts.subtitle}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={22} color="#ffffff" />
                <Text style={styles.loginButtonText}>{texts.login}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
            <Ionicons name="person-outline" size={22} color="#6366f1" />
            <Text style={styles.guestButtonText}>{texts.guest}</Text>
          </TouchableOpacity>

          <Text style={styles.note}>{texts.note}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>今天去哪玩？老天說了算</Text>
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
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
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
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#eef2ff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  guestButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6366f1',
  },
  note: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    paddingBottom: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});
