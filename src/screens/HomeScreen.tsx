import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';

export function HomeScreen() {
  const { t } = useApp();

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
});
