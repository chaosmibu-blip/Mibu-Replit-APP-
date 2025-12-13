import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export function ChatScreen() {
  const { state } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {state.language === 'zh-TW' ? '聊天' : 'Chat'}
      </Text>

      <View style={styles.comingSoon}>
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubbles" size={48} color="#6366f1" />
        </View>
        <Text style={styles.comingSoonTitle}>
          {state.language === 'zh-TW' ? '即將推出' : 'Coming Soon'}
        </Text>
        <Text style={styles.comingSoonDesc}>
          {state.language === 'zh-TW'
            ? '與旅程策劃師即時聊天，獲得專業建議'
            : 'Chat with trip planners for professional advice'}
        </Text>
      </View>

      <View style={styles.featureCard}>
        <Ionicons name="sparkles" size={32} color="#6366f1" />
        <View style={styles.featureInfo}>
          <Text style={styles.featureTitle}>
            {state.language === 'zh-TW' ? 'AI 旅程助手' : 'AI Trip Assistant'}
          </Text>
          <Text style={styles.featureDesc}>
            {state.language === 'zh-TW' 
              ? '智能推薦，個人化旅程建議' 
              : 'Smart recommendations and personalized trip advice'}
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
