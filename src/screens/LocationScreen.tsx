import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export function LocationScreen() {
  const { state } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {state.language === 'zh-TW' ? '定位' : 'Location'}
      </Text>

      <View style={styles.comingSoon}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={48} color="#22c55e" />
        </View>
        <Text style={styles.comingSoonTitle}>
          {state.language === 'zh-TW' ? '即將推出' : 'Coming Soon'}
        </Text>
        <Text style={styles.comingSoonDesc}>
          {state.language === 'zh-TW'
            ? '定位功能讓您探索附近的精彩景點'
            : 'Location feature lets you explore nearby attractions'}
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Ionicons name="navigate-circle" size={32} color="#22c55e" />
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>
            {state.language === 'zh-TW' ? '附近探索' : 'Nearby Exploration'}
          </Text>
          <Text style={styles.featureDesc}>
            {state.language === 'zh-TW' 
              ? '自動偵測您的位置，推薦附近景點' 
              : 'Auto-detect your location and recommend nearby spots'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 24,
  },
  comingSoon: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#dcfce7',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  comingSoonDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#64748b',
  },
});
