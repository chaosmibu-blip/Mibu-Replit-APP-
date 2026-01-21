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
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';
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
  const [activeEventTab, setActiveEventTab] = useState<'announcements' | 'local' | 'flash'>('announcements');

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
          const levelResponse = await economyApi.getLevelInfo(token);
          if (levelResponse) {
            // 處理後端 API 回應格式（可能是 { level: {...} } 或直接 {...}）
            const rawLevel = (levelResponse as any)?.level || levelResponse;

            // 後端返回 currentLevel，前端需要映射
            const userLv = rawLevel?.currentLevel ?? rawLevel?.level ?? 1;

            // 根據等級決定稱號
            const getLevelTitle = (level: number): string => {
              if (level >= 50) return isZh ? '傳奇旅者' : 'Legendary';
              if (level >= 30) return isZh ? '資深冒險家' : 'Expert';
              if (level >= 15) return isZh ? '旅行達人' : 'Traveler';
              if (level >= 5) return isZh ? '探索者' : 'Explorer';
              return isZh ? '旅行新手' : 'Newbie';
            };

            setUserLevel({
              level: userLv,
              title: getLevelTitle(userLv),
              phase: rawLevel?.tier ?? 1,
              currentXp: rawLevel?.currentExp ?? 0,
              nextLevelXp: rawLevel?.nextLevelExp ?? 100,
              totalXp: rawLevel?.totalExp ?? rawLevel?.currentExp ?? 0,
              loginStreak: rawLevel?.loginStreak ?? 1,
            });
          }
        } catch {
          // 忽略錯誤，使用預設值
        }

        // 載入每日任務進度
        try {
          const dailyTasksRes = await economyApi.getDailyTasks(token);
          if (dailyTasksRes.summary) {
            setDailyTask({
              completed: dailyTasksRes.summary.completedTasks || 0,
              total: dailyTasksRes.summary.totalTasks || 5,
              earnedXp: dailyTasksRes.summary.claimedRewards || 0,
            });
          }
        } catch {
          // 使用預設值
          setDailyTask({ completed: 0, total: 5, earnedXp: 0 });
        }
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
          {/* Circular Avatar with Level Badge */}
          <View style={styles.avatarWithBadge}>
            <Image
              source={require('../../../../assets/images/icon.png')}
              style={styles.levelAvatar}
            />
            <View style={styles.levelBadgeCircle}>
              <Text style={styles.levelBadgeText}>Lv.{userLevel.level}</Text>
            </View>
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

      {/* Event Tabs Navigation - 連接下方內容區 */}
      <View style={styles.eventTabsContainer}>
        <TouchableOpacity
          style={[
            styles.eventTab,
            activeEventTab === 'announcements' && styles.eventTabActive,
          ]}
          onPress={() => setActiveEventTab('announcements')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.eventTabText,
              activeEventTab === 'announcements' && styles.eventTabTextActive,
            ]}
          >
            {isZh ? '公告' : 'News'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.eventTab,
            activeEventTab === 'local' && styles.eventTabActive,
          ]}
          onPress={() => setActiveEventTab('local')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.eventTabText,
              activeEventTab === 'local' && styles.eventTabTextActive,
            ]}
          >
            {isZh ? '在地活動' : 'Local'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.eventTab,
            activeEventTab === 'flash' && styles.eventTabActive,
          ]}
          onPress={() => setActiveEventTab('flash')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.eventTabText,
              activeEventTab === 'flash' && styles.eventTabTextActive,
            ]}
          >
            {isZh ? '限時活動' : 'Flash'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Event Content Based on Active Tab - 與 Tab 連接 */}
      <View style={styles.eventContentContainer}>
        {/* Announcements Tab Content */}
        {activeEventTab === 'announcements' && (
          <View style={styles.section}>
            {events.announcements.length > 0 ? (
              events.announcements.map(event => (
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
              ))
            ) : (
              <View style={styles.tabEmptyState}>
                <Ionicons name="megaphone-outline" size={40} color={MibuBrand.tan} />
                <Text style={styles.tabEmptyText}>
                  {isZh ? '目前沒有公告' : 'No announcements'}
                </Text>
                <Text style={styles.tabEmptySubtext}>
                  {isZh ? '敬請期待最新消息！' : 'Stay tuned for updates!'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Local Activities Tab Content */}
        {activeEventTab === 'local' && (
          <View style={styles.section}>
            {events.festivals.length > 0 ? (
              events.festivals.map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.announcementCard, styles.localActivityCard]}
                  onPress={() => router.push(`/event/${event.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.announcementIcon, { backgroundColor: SemanticColors.infoLight }]}>
                    <Ionicons name="location-outline" size={18} color={SemanticColors.infoDark} />
                  </View>
                  <View style={styles.announcementContent}>
                    <Text style={styles.announcementTitle}>{getLocalizedTitle(event)}</Text>
                    <Text style={styles.announcementDesc} numberOfLines={2}>
                      {getLocalizedDesc(event)}
                    </Text>
                    <Text style={[styles.announcementDate, { color: SemanticColors.infoDark }]}>
                      {formatDate(event.startDate || event.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.tabEmptyState}>
                <Ionicons name="location-outline" size={40} color={MibuBrand.tan} />
                <Text style={styles.tabEmptyText}>
                  {isZh ? '目前沒有在地活動' : 'No local activities'}
                </Text>
                <Text style={styles.tabEmptySubtext}>
                  {isZh ? '探索附近的精彩活動！' : 'Discover events near you!'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Flash Events Tab Content */}
        {activeEventTab === 'flash' && (
          <View style={styles.section}>
            {events.limitedEvents.length > 0 ? (
              events.limitedEvents.map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.announcementCard, styles.flashEventCard]}
                  onPress={() => router.push(`/event/${event.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.announcementIcon, { backgroundColor: SemanticColors.warningLight }]}>
                    <Ionicons name="sparkles" size={18} color={SemanticColors.warningDark} />
                  </View>
                  <View style={styles.announcementContent}>
                    <Text style={styles.announcementTitle}>{getLocalizedTitle(event)}</Text>
                    <Text style={styles.announcementDesc} numberOfLines={2}>
                      {getLocalizedDesc(event)}
                    </Text>
                    <Text style={[styles.announcementDate, { color: SemanticColors.warningDark }]}>
                      {formatDate(event.startDate || event.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.tabEmptyState}>
                <Ionicons name="sparkles" size={40} color={MibuBrand.tan} />
                <Text style={styles.tabEmptyText}>
                  {isZh ? '目前沒有限時活動' : 'No flash events'}
                </Text>
                <Text style={styles.tabEmptySubtext}>
                  {isZh ? '限時優惠即將到來！' : 'Limited offers coming soon!'}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
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
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWithBadge: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  levelAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: MibuBrand.cream,
  },
  levelBadgeCircle: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: [{ translateX: -24 }],
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 48,
    alignItems: 'center',
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: MibuBrand.warmWhite,
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
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
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
  eventTabsContainer: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.creamLight,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: MibuBrand.tanLight,
    overflow: 'hidden',
  },
  eventTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  eventTabActive: {
    borderBottomColor: MibuBrand.brown,
    backgroundColor: MibuBrand.warmWhite,
  },
  eventTabText: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.tan,
  },
  eventTabTextActive: {
    color: MibuBrand.brownDark,
  },
  eventContentContainer: {
    minHeight: 150,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: MibuBrand.tanLight,
    padding: 16,
    marginBottom: 16,
  },
  tabEmptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  tabEmptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginTop: 12,
  },
  tabEmptySubtext: {
    fontSize: 13,
    color: MibuBrand.tan,
    marginTop: 4,
  },
  section: {
    marginBottom: 0,
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
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  flashEventCard: {
    borderColor: SemanticColors.warningLight,
  },
  localActivityCard: {
    borderColor: SemanticColors.infoLight,
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
