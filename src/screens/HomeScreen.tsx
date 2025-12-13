import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';

export function HomeScreen() {
  const { t, state } = useApp();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Mibu</Text>
        <Text style={styles.subtitle}>{t.appSubtitle}</Text>
      </View>

      <Card style={styles.announcementCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="megaphone" size={20} color="#b45309" />
          <Text style={styles.cardTitle}>{t.announcements}</Text>
        </View>
        <View style={styles.announcementContent}>
          <Text style={styles.announcementText}>
            • 歡迎使用 Mibu 旅遊扭蛋！探索台灣各地的精彩景點
          </Text>
          <Text style={styles.announcementText}>
            • 新功能：旅程策劃模組已上線，規劃你的完美行程
          </Text>
        </View>
      </Card>

      <Card style={styles.flashCard} backgroundColor="#f43f5e">
        <View style={styles.cardHeader}>
          <Ionicons name="flash" size={20} color="#ffffff" />
          <Text style={[styles.cardTitle, { color: '#ffffff' }]}>{t.flashEvents}</Text>
        </View>
        <View style={styles.announcementContent}>
          <Text style={[styles.announcementText, { color: 'rgba(255,255,255,0.9)' }]}>
            🎁 冬季限定：宜蘭礁溪溫泉季 - 收集溫泉景點獲得特別優惠！
          </Text>
          <Text style={[styles.announcementText, { color: 'rgba(255,255,255,0.9)' }]}>
            🌟 本週熱門：台北信義區聖誕市集巡禮
          </Text>
        </View>
      </Card>

      <View style={styles.moduleGrid}>
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push('/(tabs)/gacha')}
        >
          <View style={[styles.moduleIcon, { backgroundColor: '#eef2ff' }]}>
            <Ionicons name="dice" size={32} color="#6366f1" />
          </View>
          <Text style={styles.moduleTitle}>{t.navGachaModule}</Text>
          <Text style={styles.moduleDesc}>
            {state.language === 'zh-TW' ? '隨機探索台灣景點' : 'Explore random spots'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push('/(tabs)/collection')}
        >
          <View style={[styles.moduleIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="book" size={32} color="#f59e0b" />
          </View>
          <Text style={styles.moduleTitle}>{t.navCollection}</Text>
          <Text style={styles.moduleDesc}>
            {state.language === 'zh-TW' ? '查看收集的景點' : 'View collected spots'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push('/(tabs)/planner')}
        >
          <View style={[styles.moduleIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="map" size={32} color="#22c55e" />
          </View>
          <Text style={styles.moduleTitle}>{t.navPlannerModule}</Text>
          <Text style={styles.moduleDesc}>
            {state.language === 'zh-TW' ? '規劃完美行程' : 'Plan your trip'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <View style={[styles.moduleIcon, { backgroundColor: '#f1f5f9' }]}>
            <Ionicons name="settings" size={32} color="#64748b" />
          </View>
          <Text style={styles.moduleTitle}>{t.navSettings}</Text>
          <Text style={styles.moduleDesc}>
            {state.language === 'zh-TW' ? '語言與偏好設定' : 'Language & preferences'}
          </Text>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  announcementCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 16,
  },
  flashCard: {
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b45309',
  },
  announcementContent: {
    gap: 8,
  },
  announcementText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  moduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  moduleCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  moduleDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
