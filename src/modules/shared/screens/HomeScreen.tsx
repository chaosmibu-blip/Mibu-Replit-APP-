/**
 * HomeScreen - 首頁
 * 用戶問候、等級卡片、每日任務、公告、活動
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { MibuBrand } from '../../../../constants/Colors';
import { Event } from '../../../types';
import { eventApi } from '../../../services/api';
import { economyApi } from '../../../services/economyApi';

// 用戶等級資料
interface UserLevelData {
  level: number;
  title: string;
  phase: number;
  currentXp: number;
  nextLevelXp: number;
  totalXp: number;
  loginStreak: number;
}

// 每日任務資料
interface DailyTaskSummary {
  completed: number;
  total: number;
  earnedXp: number;
}

export function HomeScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State
  const [userLevel, setUserLevel] = useState<UserLevelData>({
    level: 1,
    title: isZh ? '旅行新手' : 'Newbie',
    phase: 1,
    currentXp: 0,
    nextLevelXp: 100,
    totalXp: 0,
    loginStreak: 1,
  });
  const [dailyTask, setDailyTask] = useState<DailyTaskSummary>({
    completed: 0,
    total: 5,
    earnedXp: 0,
  });
  const [events, setEvents] = useState<{
    announcements: Event[];
    festivals: Event[];
    limitedEvents: Event[];
  }>({ announcements: [], festivals: [], limitedEvents: [] });

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();

      // 載入活動
      const eventsRes = await eventApi.getHomeEvents().catch(() => ({
        announcements: [],
        festivals: [],
        limitedEvents: [],
      }));
      setEvents(eventsRes);

      // 載入用戶等級資料
      if (token) {
        try {
          const levelData = await economyApi.getUserLevel(token);
          if (levelData) {
            // 根據等級決定稱號
            const getLevelTitle = (level: number): string => {
              if (level >= 50) return isZh ? '傳奇旅者' : 'Legendary';
              if (level >= 30) return isZh ? '資深冒險家' : 'Expert';
              if (level >= 15) return isZh ? '旅行達人' : 'Traveler';
              if (level >= 5) return isZh ? '探索者' : 'Explorer';
              return isZh ? '旅行新手' : 'Newbie';
            };

            setUserLevel({
              level: levelData.level ?? 1,
              title: getLevelTitle(levelData.level ?? 1),
              phase: levelData.tier ?? 1,
              currentXp: levelData.currentExp ?? 0,
              nextLevelXp: levelData.nextLevelExp ?? 100,
              totalXp: levelData.totalExp ?? 0,
              loginStreak: levelData.loginStreak ?? 1,
            });
          }
        } catch {
          // 忽略錯誤，使用預設值
        }

        // TODO: 載入每日任務進度
        // 目前使用靜態資料
        setDailyTask({
          completed: 3,
          total: 5,
          earnedXp: 30,
        });
      }
    } catch (error) {
      console.log('Failed to load home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const getLocalizedTitle = (event: Event): string => {
    if (state.language === 'zh-TW') return event.title;
    if (state.language === 'en' && event.titleEn) return event.titleEn;
    return event.title;
  };

  const getLocalizedDesc = (event: Event): string => {
    if (state.language === 'zh-TW') return event.description;
    if (state.language === 'en' && event.descriptionEn) return event.descriptionEn;
    return event.description;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  const xpProgress = userLevel.nextLevelXp > 0
    ? (userLevel.currentXp / userLevel.nextLevelXp) * 100
    : 0;

  const taskProgress = dailyTask.total > 0
    ? (dailyTask.completed / dailyTask.total) * 100
    : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={MibuBrand.brown}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with greeting */}
      <View style={styles.header}>
        <Image
          source={require('../../../../assets/images/icon.png')}
          style={styles.avatarImage}
          defaultSource={require('../../../../assets/images/icon.png')}
        />
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>
            {isZh ? '嗨，旅行者！' : 'Hi, Traveler!'}
          </Text>
          <Text style={styles.greetingSubtitle}>
            {isZh ? '今天想去哪裡探索？' : 'Where to explore today?'}
          </Text>
        </View>
      </View>

      {/* User Level Card */}
      <TouchableOpacity
        style={styles.levelCard}
        onPress={() => router.push('/economy')}
        activeOpacity={0.8}
      >
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv.{userLevel.level}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{userLevel.title}</Text>
            <Text style={styles.levelPhase}>
              {isZh ? `第 ${userLevel.phase} 階段` : `Phase ${userLevel.phase}`}
            </Text>
          </View>
          <View style={styles.loginStreak}>
            <Text style={styles.loginStreakLabel}>
              {isZh ? '連續登入' : 'Streak'}
            </Text>
            <View style={styles.loginStreakValue}>
              <Ionicons name="flame" size={16} color="#F97316" />
              <Text style={styles.loginStreakNumber}>{userLevel.loginStreak} {isZh ? '天' : 'd'}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
        </View>

        <View style={styles.xpSection}>
          <View style={styles.xpProgressBg}>
            <View style={[styles.xpProgressFill, { width: `${xpProgress}%` }]} />
          </View>
          <View style={styles.xpRow}>
            <Text style={styles.xpText}>
              {userLevel.currentXp} / {userLevel.nextLevelXp} XP
            </Text>
            <Text style={styles.xpNextLevel}>
              Lv.{userLevel.level} → Lv.{userLevel.level + 1}
            </Text>
          </View>
          <Text style={styles.xpNeeded}>
            {isZh
              ? `還需 ${userLevel.nextLevelXp - userLevel.currentXp} XP 升級`
              : `${userLevel.nextLevelXp - userLevel.currentXp} XP to level up`}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Daily Task Card */}
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push('/economy')}
        activeOpacity={0.8}
      >
        <View style={styles.taskLeft}>
          <View style={styles.taskIcon}>
            <Ionicons name="calendar-outline" size={24} color={MibuBrand.brown} />
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>
              {isZh ? '每日任務' : 'Daily Tasks'}
            </Text>
            <Text style={styles.taskProgress}>
              {dailyTask.completed}/{dailyTask.total} {isZh ? '完成' : 'done'}
            </Text>
          </View>
        </View>
        <View style={styles.taskRight}>
          <Text style={styles.taskEarnedLabel}>{isZh ? '已獲得' : 'Earned'}</Text>
          <Text style={styles.taskEarnedXp}>+{dailyTask.earnedXp} XP</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
      </TouchableOpacity>

      {/* Task Progress Bar */}
      <View style={styles.taskProgressContainer}>
        <View style={styles.taskProgressBg}>
          <View style={[styles.taskProgressFill, { width: `${taskProgress}%` }]} />
        </View>
      </View>

      {/* Announcements Section */}
      {events.announcements.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="megaphone-outline" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {isZh ? '最新公告' : 'Announcements'}
            </Text>
          </View>
          {events.announcements.map(event => (
            <TouchableOpacity
              key={event.id}
              style={styles.announcementCard}
              onPress={() => router.push(`/event/${event.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.announcementIcon}>
                <Ionicons name="megaphone-outline" size={18} color={MibuBrand.brown} />
              </View>
              <View style={styles.announcementContent}>
                <Text style={styles.announcementTitle}>{getLocalizedTitle(event)}</Text>
                <Text style={styles.announcementDesc} numberOfLines={2}>
                  {getLocalizedDesc(event)}
                </Text>
                <Text style={styles.announcementDate}>
                  {formatDate(event.startDate || event.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Flash Events Section */}
      {events.limitedEvents.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {isZh ? '快閃活動' : 'Flash Events'}
            </Text>
          </View>
          {events.limitedEvents.map(event => (
            <TouchableOpacity
              key={event.id}
              style={[styles.announcementCard, styles.flashEventCard]}
              onPress={() => router.push(`/event/${event.id}`)}
              activeOpacity={0.8}
            >
              <View style={[styles.announcementIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="sparkles" size={18} color="#D97706" />
              </View>
              <View style={styles.announcementContent}>
                <Text style={styles.announcementTitle}>{getLocalizedTitle(event)}</Text>
                <Text style={styles.announcementDesc} numberOfLines={2}>
                  {getLocalizedDesc(event)}
                </Text>
                <Text style={[styles.announcementDate, { color: '#D97706' }]}>
                  {formatDate(event.startDate || event.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Local Activities Section */}
      {events.festivals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {isZh ? '在地活動' : 'Local Activities'}
            </Text>
          </View>
          {events.festivals.map(event => (
            <TouchableOpacity
              key={event.id}
              style={[styles.announcementCard, styles.localActivityCard]}
              onPress={() => router.push(`/event/${event.id}`)}
              activeOpacity={0.8}
            >
              <View style={[styles.announcementIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="location-outline" size={18} color="#0284C7" />
              </View>
              <View style={styles.announcementContent}>
                <Text style={styles.announcementTitle}>{getLocalizedTitle(event)}</Text>
                <Text style={styles.announcementDesc} numberOfLines={2}>
                  {getLocalizedDesc(event)}
                </Text>
                <Text style={[styles.announcementDate, { color: '#0284C7' }]}>
                  {formatDate(event.startDate || event.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty State */}
      {events.announcements.length === 0 &&
        events.limitedEvents.length === 0 &&
        events.festivals.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="sunny-outline" size={48} color={MibuBrand.tan} />
            <Text style={styles.emptyText}>
              {isZh ? '今天風和日麗，適合探索！' : 'Great day for exploring!'}
            </Text>
          </View>
        )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MibuBrand.cream,
  },
  greeting: {
    marginLeft: 12,
    flex: 1,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  levelCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  levelInfo: {
    marginLeft: 12,
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  levelPhase: {
    fontSize: 12,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  loginStreak: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  loginStreakLabel: {
    fontSize: 11,
    color: MibuBrand.tan,
  },
  loginStreakValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loginStreakNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  xpSection: {
    marginTop: 14,
  },
  xpProgressBg: {
    height: 8,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: MibuBrand.brown,
    borderRadius: 4,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  xpText: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  xpNextLevel: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  xpNeeded: {
    fontSize: 12,
    color: MibuBrand.tan,
    textAlign: 'center',
    marginTop: 6,
  },
  taskCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: MibuBrand.creamLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  taskProgress: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  taskRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  taskEarnedLabel: {
    fontSize: 11,
    color: MibuBrand.tan,
  },
  taskEarnedXp: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  taskProgressContainer: {
    marginTop: -8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  taskProgressBg: {
    height: 6,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    backgroundColor: MibuBrand.brown,
    borderRadius: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  announcementCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  flashEventCard: {
    borderColor: '#FEF3C7',
  },
  localActivityCard: {
    borderColor: '#E0F2FE',
  },
  announcementIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: MibuBrand.creamLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  announcementContent: {},
  announcementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 6,
  },
  announcementDesc: {
    fontSize: 13,
    color: MibuBrand.copper,
    lineHeight: 18,
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: MibuBrand.tan,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: MibuBrand.tan,
    marginTop: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});
