import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../constants/translations';

interface AuthScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function AuthScreen({ visible, onClose }: AuthScreenProps) {
  const { setUser, state } = useApp();
  const [loading, setLoading] = useState(true);

  const authUrl = `${API_BASE_URL}/api/auth/login`;

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    if (url.includes('/api/auth/callback') || url.includes('/__replauthcallback')) {
      fetchUserAfterAuth();
    }
    
    if (url.includes('/api/auth/success') || url.includes('/?auth=success')) {
      fetchUserAfterAuth();
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
          onClose();
        }
      }
    } catch (error) {
      console.error('Failed to fetch user after auth:', error);
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'AUTH_SUCCESS' && data.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || null,
          avatar: data.user.avatar || null,
          firstName: data.user.firstName || data.user.name?.split(' ')[0],
          provider: 'replit',
          providerId: data.user.id,
        });
        onClose();
      }
    } catch (e) {
    }
  };

  const injectedJavaScript = `
    (function() {
      const checkAuth = setInterval(function() {
        const authSuccess = document.querySelector('[data-auth-success]');
        if (authSuccess || window.location.href.includes('auth=success')) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'AUTH_SUCCESS',
            user: window.__REPLIT_USER__ || null
          }));
          clearInterval(checkAuth);
        }
      }, 500);
    })();
    true;
  `;

  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.webContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {state.language === 'zh-TW' ? '登入' : 'Sign In'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <View style={styles.webMessage}>
              <Ionicons name="information-circle-outline" size={48} color="#6366f1" />
              <Text style={styles.webMessageTitle}>
                {state.language === 'zh-TW' ? '請使用手機應用登入' : 'Please use mobile app to login'}
              </Text>
              <Text style={styles.webMessageText}>
                {state.language === 'zh-TW' 
                  ? '在 Web 預覽中無法完成登入流程。請下載 Expo Go 應用並掃描 QR Code 來測試完整功能。' 
                  : 'Login is not available in web preview. Please download Expo Go and scan the QR code to test full functionality.'}
              </Text>
              <TouchableOpacity style={styles.guestButton} onPress={() => {
                setUser({
                  id: 'guest',
                  name: 'Guest User',
                  email: null,
                  avatar: null,
                  firstName: 'Guest',
                  provider: 'guest',
                  providerId: 'guest',
                });
                onClose();
              }}>
                <Ionicons name="person-outline" size={20} color="#6366f1" />
                <Text style={styles.guestButtonText}>
                  {state.language === 'zh-TW' ? '以訪客身份繼續' : 'Continue as Guest'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {state.language === 'zh-TW' ? '使用 Replit 登入' : 'Sign in with Replit'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>
              {state.language === 'zh-TW' ? '載入中...' : 'Loading...'}
            </Text>
          </View>
        )}

        <WebView
          source={{ uri: authUrl }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          injectedJavaScript={injectedJavaScript}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  webMessage: {
    padding: 32,
    alignItems: 'center',
  },
  webMessageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  webMessageText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#eef2ff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
});
