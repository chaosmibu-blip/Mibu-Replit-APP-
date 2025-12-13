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

  const handleCallback = async () => {
    const token = params.token as string;

    if (token) {
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
