import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { MibuBrand } from '../../constants/Colors';

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
          <Ionicons name="megaphone" size={24} color={MibuBrand.brown} />
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

      <Card style={styles.flashCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="flash" size={24} color="#ffffff" />
          <Text style={[styles.cardTitle, { color: '#ffffff' }]}>{t.flashEvents}</Text>
        </View>
        <View style={styles.announcementContent}>
          <Text style={[styles.announcementText, { color: 'rgba(255,255,255,0.95)' }]}>
            🎁 冬季限定：宜蘭礁溪溫泉季 - 收集溫泉景點獲得特別優惠！
          </Text>
          <Text style={[styles.announcementText, { color: 'rgba(255,255,255,0.95)' }]}>
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
    backgroundColor: MibuBrand.creamLight,
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
    color: MibuBrand.brown,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: MibuBrand.copper,
    marginTop: 4,
  },
  announcementCard: {
    backgroundColor: MibuBrand.highlight,
    borderWidth: 1,
    borderColor: MibuBrand.tan,
    marginBottom: 20,
    padding: 20,
  },
  flashCard: {
    backgroundColor: MibuBrand.brown,
    marginBottom: 24,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  announcementContent: {
    gap: 12,
  },
  announcementText: {
    fontSize: 16,
    color: MibuBrand.brownDark,
    lineHeight: 24,
  },
});
