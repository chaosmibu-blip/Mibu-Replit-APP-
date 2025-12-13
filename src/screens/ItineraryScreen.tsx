import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export function ItineraryScreen() {
  const { state } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {state.language === 'zh-TW' ? '行程' : 'Itinerary'}
      </Text>

      <View style={styles.comingSoon}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar" size={48} color="#f59e0b" />
        </View>
        <Text style={styles.comingSoonTitle}>
          {state.language === 'zh-TW' ? '即將推出' : 'Coming Soon'}
        </Text>
        <Text style={styles.comingSoonDesc}>
          {state.language === 'zh-TW'
            ? '規劃並管理您的完美旅程'
            : 'Plan and manage your perfect trip'}
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Ionicons name="list" size={32} color="#f59e0b" />
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>
            {state.language === 'zh-TW' ? '行程管理' : 'Trip Management'}
          </Text>
          <Text style={styles.featureDesc}>
            {state.language === 'zh-TW' 
              ? '將收藏的景點加入行程，輕鬆規劃' 
              : 'Add collected spots to your itinerary easily'}
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
    backgroundColor: '#fef3c7',
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
