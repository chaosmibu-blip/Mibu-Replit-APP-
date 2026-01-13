import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';

export function PlannerScreen() {
  const { t, state } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t.navPlannerModule}</Text>

      <View style={styles.comingSoon}>
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={48} color="#6366f1" />
        </View>
        <Text style={styles.comingSoonTitle}>
          {state.language === 'zh-TW' ? '即將推出' : 'Coming Soon'}
        </Text>
        <Text style={styles.comingSoonDesc}>
          {state.language === 'zh-TW'
            ? '旅程策劃功能正在開發中，敬請期待！'
            : 'Trip planner is under development. Stay tuned!'}
        </Text>
      </View>

      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Ionicons name="location" size={24} color="#22c55e" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{t.navLocation}</Text>
            <Text style={styles.featureDesc}>
              {state.language === 'zh-TW' ? '定位並探索附近景點' : 'Locate and explore nearby'}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="calendar" size={24} color="#f59e0b" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{t.navItinerary}</Text>
            <Text style={styles.featureDesc}>
              {state.language === 'zh-TW' ? '規劃你的完美行程' : 'Plan your perfect trip'}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="chatbubbles" size={24} color="#6366f1" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{t.navChat}</Text>
            <Text style={styles.featureDesc}>
              {state.language === 'zh-TW' ? '與策劃師即時聊天' : 'Chat with planners'}
            </Text>
          </View>
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
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#eef2ff',
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
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    borderWidth: 2,
    borderColor: '#f1f5f9',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    color: '#64748b',
  },
});
