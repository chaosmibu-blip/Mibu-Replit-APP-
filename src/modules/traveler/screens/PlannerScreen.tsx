/**
 * PlannerScreen - 行程規劃畫面（即將推出）
 *
 * 功能：
 * - 顯示「即將推出」提示
 * - 預覽未來功能：定位探索、行程規劃、策劃師聊天
 *
 * 注意：此畫面為佔位頁面，實際功能尚未開發
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../../context/AppContext';
import { MibuBrand } from '../../../../constants/Colors';

// ============================================================
// 主元件
// ============================================================

export function PlannerScreen() {
  const { t, language } = useI18n();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t.navPlannerModule}</Text>

      <View style={styles.comingSoon}>
        <View style={styles.iconContainer}>
          <Ionicons name="construct" size={48} color="#6366f1" />
        </View>
        <Text style={styles.comingSoonTitle}>
          {language === 'zh-TW' ? '即將推出' : 'Coming Soon'}
        </Text>
        <Text style={styles.comingSoonDesc}>
          {language === 'zh-TW'
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
              {language === 'zh-TW' ? '定位並探索附近景點' : 'Locate and explore nearby'}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="calendar" size={24} color="#f59e0b" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{t.navItinerary}</Text>
            <Text style={styles.featureDesc}>
              {language === 'zh-TW' ? '規劃你的完美行程' : 'Plan your perfect trip'}
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="chatbubbles" size={24} color="#6366f1" />
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{t.navChat}</Text>
            <Text style={styles.featureDesc}>
              {language === 'zh-TW' ? '與策劃師即時聊天' : 'Chat with planners'}
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
    backgroundColor: MibuBrand.creamLight,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: MibuBrand.brownDark,
    marginBottom: 24,
  },
  comingSoon: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: MibuBrand.cream,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 8,
  },
  comingSoonDesc: {
    fontSize: 14,
    color: MibuBrand.copper,
    textAlign: 'center',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    padding: 16,
    borderRadius: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 14,
    color: MibuBrand.copper,
  },
});
