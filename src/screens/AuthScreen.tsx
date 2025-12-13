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
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../constants/translations';

interface AuthScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function AuthScreen({ visible, onClose }: AuthScreenProps) {
  const { setUser, state } = useApp();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const authUrl = `${API_BASE_URL}/api/auth/login`;
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'mibu://auth/callback'
      );

      if (result.type === 'success') {
        await fetchUserAfterAuth();
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
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
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {state.language === 'zh-TW' ? '登入' : 'Sign In'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-circle" size={64} color="#6366f1" />
            </View>
            
            <Text style={styles.title}>
              {state.language === 'zh-TW' ? '歡迎使用 Mibu' : 'Welcome to Mibu'}
            </Text>
            <Text style={styles.subtitle}>
              {state.language === 'zh-TW' 
                ? '登入以保存您的收藏和設定' 
                : 'Sign in to save your collection and settings'}
            </Text>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                  <Text style={styles.loginButtonText}>
                    {state.language === 'zh-TW' ? '使用 Replit 登入' : 'Sign in with Replit'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
              <Ionicons name="person-outline" size={20} color="#6366f1" />
              <Text style={styles.guestButtonText}>
                {state.language === 'zh-TW' ? '以訪客身份繼續' : 'Continue as Guest'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.note}>
              {state.language === 'zh-TW' 
                ? '訪客模式下，資料僅保存在本機裝置' 
                : 'In guest mode, data is only saved locally'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
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
  content: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    marginBottom: 12,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
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
    width: '100%',
    marginBottom: 16,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  note: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
