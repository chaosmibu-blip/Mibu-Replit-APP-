import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { API_BASE_URL } from '../../src/constants/translations';

export default function AuthCallback() {
  const { setUser } = useApp();
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
    const token = params.token as string;
    const portal = params.portal as string;

    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData && (userData.name || userData.id)) {
            const userRole = userData.role || portal || 'traveler';
            
            setUser({
              id: userData.id,
              name: userData.name || userData.email?.split('@')[0] || 'User',
              email: userData.email || null,
              avatar: userData.avatar || userData.profileImageUrl || null,
              firstName: userData.firstName || userData.name?.split(' ')[0] || null,
              role: userRole,
              isApproved: userData.isApproved,
              provider: userData.provider || 'google',
              providerId: userData.id,
            }, token);
            
            navigateAfterLogin(userRole, userData.isApproved);
            return;
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    }

    if (Platform.OS === 'web') {
      if (window.opener) {
        window.close();
      }
    }

    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={styles.text}>正在登入...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
});
