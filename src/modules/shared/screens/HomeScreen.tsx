/**
 * HomeScreen - 首頁
 *
 * 功能：
 * - 用戶問候（根據語言顯示不同文字）
 * - 等級卡片（顯示 Lv、稱號、階段、連續登入、XP 進度）
 * - 每日任務卡片（點擊跳轉 /economy）
 * - 活動 Tab 切換（公告 / 在地活動 / 限時活動）
 *
 * 串接 API：
 * - eventApi.getHomeEvents() - 取得首頁活動
 * - economyApi.getLevelInfo() - 取得用戶等級資料
 * - economyApi.getDailyTasks() - 取得每日任務進度
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
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 取得螢幕高度，用於計算活動內容區最小高度
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../../context/AppContext';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';
import { Event } from '../../../types';
import { eventApi } from '../../../services/api';
import { economyApi } from '../../../services/economyApi';

/** AsyncStorage key for avatar preference（與 ProfileScreen 共用）*/
const AVATAR_STORAGE_KEY = '@mibu_avatar_preset';

/**
 * 預設頭像選項
 * 與 ProfileScreen 保持一致
 */
const AVATAR_PRESETS = [
  { id: 'default', icon: 'person', color: MibuBrand.brown },
  { id: 'cat', icon: 'paw', color: '#F59E0B' },
  { id: 'star', icon: 'star', color: '#8B5CF6' },
  { id: 'heart', icon: 'heart', color: '#EF4444' },
  { id: 'leaf', icon: 'leaf', color: '#10B981' },
  { id: 'compass', icon: 'compass', color: '#3B82F6' },
  { id: 'flame', icon: 'flame', color: '#F97316' },
  { id: 'diamond', icon: 'diamond', color: '#EC4899' },
];

// ============================================================
// 型別定義
// ============================================================

/**
 * 用戶等級資料介面
 * 用於顯示等級卡片的各項數據
 */
interface UserLevelData {
  level: number;        // 當前等級
  title: string;        // 等級稱號（如：旅行新手、探索者）
  phase: number;        // 階段（用於顯示進度）
  currentXp: number;    // 當前經驗值
  nextLevelXp: number;  // 升級所需經驗值
  totalXp: number;      // 總經驗值
  loginStreak: number;  // 連續登入天數
}

/**
 * 每日任務摘要介面
 * 用於顯示每日任務卡片
 */
interface DailyTaskSummary {
  completed: number;  // 已完成任務數
  total: number;      // 總任務數
  earnedXp: number;   // 已獲得經驗值
}

// ============================================================
// 主元件
// ============================================================

export function HomeScreen() {
  // ============================================================
  // Hooks & Context
  // ============================================================
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  // ============================================================
  // 狀態管理
  // ============================================================

  // 載入狀態
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 活動 Tab 當前選中項（公告/在地/限時）
  const [activeEventTab, setActiveEventTab] = useState<'announcements' | 'local' | 'flash'>('announcements');

  // 用戶頭像設定（從 AsyncStorage 讀取）
  const [userAvatar, setUserAvatar] = useState<string>('default');

  // 用戶等級資料（預設值）
  const [userLevel, setUserLevel] = useState<UserLevelData>({
    level: 1,
    title: isZh ? '旅行新手' : 'Newbie',
    phase: 1,
    currentXp: 0,
    nextLevelXp: 100,
    totalXp: 0,
    loginStreak: 1,
  });

  // 每日任務資料（預設值）
  const [dailyTask, setDailyTask] = useState<DailyTaskSummary>({
    completed: 0,
    total: 5,
    earnedXp: 0,
  });

  // 活動資料（公告、節日、限時活動）
  const [events, setEvents] = useState<{
    announcements: Event[];
    festivals: Event[];
    limitedEvents: Event[];
  }>({ announcements: [], festivals: [], limitedEvents: [] });

  // ============================================================
  // 資料載入
  // ============================================================

  /**
   * 載入首頁所有資料
   * 包含：活動列表、用戶等級、每日任務
   */
  const loadData = useCallback(async () => {
    try {
      const token = await getToken();

      // 載入活動列表（公告、節日、限時活動）
      const eventsRes = await eventApi.getHomeEvents().catch(() => ({
        announcements: [],
        festivals: [],
        limitedEvents: [],
      }));
      setEvents(eventsRes);

      // 載入用戶等級資料（需要登入）
      if (token) {
        try {
          const levelResponse = await economyApi.getLevelInfo(token);
          if (levelResponse) {
            // 處理後端 API 回應格式（可能是 { level: {...} } 或直接 {...}）
            const rawLevel = (levelResponse as any)?.level || levelResponse;

            // 後端返回 currentLevel，前端需要映射
            const userLv = rawLevel?.currentLevel ?? rawLevel?.level ?? 1;

            /**
             * 根據等級決定稱號
             * Lv 50+ = 傳奇旅者
             * Lv 30+ = 資深冒險家
             * Lv 15+ = 旅行達人
             * Lv 5+  = 探索者
             * Lv 1+  = 旅行新手
             */
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

  // 初始載入
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 載入用戶頭像設定
   * 從 AsyncStorage 讀取用戶在個人資料中設定的頭像
   */
  const loadUserAvatar = useCallback(async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
      if (savedAvatar) {
        setUserAvatar(savedAvatar);
      }
    } catch (error) {
      console.log('Failed to load user avatar:', error);
    }
  }, []);

  /**
   * 每次畫面獲得焦點時重新載入頭像
   * 確保用戶在個人資料中更新頭像後，首頁能即時反映
   */
  useFocusEffect(
    useCallback(() => {
      loadUserAvatar();
    }, [loadUserAvatar])
  );

  /**
   * 下拉刷新處理
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // ============================================================
  // 輔助函數
  // ============================================================

  /**
   * 取得活動的在地化標題
   * 根據當前語言返回對應的標題
   */
  const getLocalizedTitle = (event: Event): string => {
    if (state.language === 'zh-TW') return event.title;
    if (state.language === 'en' && event.titleEn) return event.titleEn;
    return event.title;
  };

  /**
   * 取得活動的在地化描述
   * 根據當前語言返回對應的描述
   */
  const getLocalizedDesc = (event: Event): string => {
    if (state.language === 'zh-TW') return event.description;
    if (state.language === 'en' && event.descriptionEn) return event.descriptionEn;
    return event.description;
  };

  /**
   * 格式化日期為 YYYY/MM/DD
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  // 計算 XP 進度條百分比
  const xpProgress = userLevel.nextLevelXp > 0
    ? (userLevel.currentXp / userLevel.nextLevelXp) * 100
    : 0;

  // 計算任務進度條百分比
  const taskProgress = dailyTask.total > 0
    ? (dailyTask.completed / dailyTask.total) * 100
    : 0;

  // ============================================================
  // 載入中畫面
  // ============================================================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  // ============================================================
  // 主畫面渲染
  // ============================================================
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
      {/* ========== 頂部問候區 ========== */}
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

      {/* ========== 用戶等級卡片（純顯示，不可點擊）========== */}
      <View style={styles.levelCard}>
        {/* 等級卡片頭部：頭像 + 等級徽章 + 稱號 + 連續登入 */}
        <View style={styles.levelHeader}>
          {/* 圓形頭像 + 等級徽章 */}
          <View style={styles.avatarWithBadge}>
            {/* 根據用戶設定顯示對應頭像 */}
            {(() => {
              const avatarPreset = AVATAR_PRESETS.find(a => a.id === userAvatar);
              const avatarColor = avatarPreset?.color || MibuBrand.brown;

              if (userAvatar === 'default') {
                // 預設頭像：顯示用戶名稱首字
                return (
                  <View style={[styles.levelAvatar, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarInitial}>
                      {state.user?.firstName?.charAt(0) || state.user?.name?.charAt(0) || '?'}
                    </Text>
                  </View>
                );
              } else {
                // 其他頭像：顯示對應 icon
                return (
                  <View style={[styles.levelAvatar, { backgroundColor: avatarColor }]}>
                    <Ionicons
                      name={avatarPreset?.icon as any || 'person'}
                      size={32}
                      color="#ffffff"
                    />
                  </View>
                );
              }
            })()}
            <View style={styles.levelBadgeCircle}>
              <Text style={styles.levelBadgeText}>Lv.{userLevel.level}</Text>
            </View>
          </View>

          {/* 等級資訊：稱號 + 階段 */}
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{userLevel.title}</Text>
            <Text style={styles.levelPhase}>
              {isZh ? `第 ${userLevel.phase} 階段` : `Phase ${userLevel.phase}`}
            </Text>
          </View>

          {/* 連續登入天數 */}
          <View style={styles.loginStreak}>
            <Text style={styles.loginStreakLabel}>
              {isZh ? '連續登入' : 'Streak'}
            </Text>
            <View style={styles.loginStreakValue}>
              <Ionicons name="flame" size={16} color="#F97316" />
              <Text style={styles.loginStreakNumber}>{userLevel.loginStreak} {isZh ? '天' : 'd'}</Text>
            </View>
          </View>
        </View>

        {/* XP 進度區塊 */}
        <View style={styles.xpSection}>
          {/* XP 進度條 */}
          <View style={styles.xpProgressBg}>
            <View style={[styles.xpProgressFill, { width: `${xpProgress}%` }]} />
          </View>

          {/* XP 數值顯示 */}
          <View style={styles.xpRow}>
            <Text style={styles.xpText}>
              {userLevel.currentXp} / {userLevel.nextLevelXp} XP
            </Text>
            <Text style={styles.xpNextLevel}>
              Lv.{userLevel.level} → Lv.{userLevel.level + 1}
            </Text>
          </View>

          {/* 還需多少 XP 升級 */}
          <Text style={styles.xpNeeded}>
            {isZh
              ? `還需 ${userLevel.nextLevelXp - userLevel.currentXp} XP 升級`
              : `${userLevel.nextLevelXp - userLevel.currentXp} XP to level up`}
          </Text>
        </View>
      </View>

      {/* ========== 每日任務卡片（可點擊，跳轉 /economy）========== */}
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => router.push('/economy')}
        activeOpacity={0.8}
      >
        {/* 左側：圖示 + 任務資訊 */}
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

        {/* 右側：已獲得 XP */}
        <View style={styles.taskRight}>
          <Text style={styles.taskEarnedLabel}>{isZh ? '已獲得' : 'Earned'}</Text>
          <Text style={styles.taskEarnedXp}>+{dailyTask.earnedXp} XP</Text>
        </View>

        {/* 箭頭圖示 */}
        <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
      </TouchableOpacity>

      {/* 任務進度條 */}
      <View style={styles.taskProgressContainer}>
        <View style={styles.taskProgressBg}>
          <View style={[styles.taskProgressFill, { width: `${taskProgress}%` }]} />
        </View>
      </View>

      {/* ========== 活動 Tab 導航（公告/在地/限時）========== */}
      <View style={styles.eventTabsContainer}>
        {/* 公告 Tab */}
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

        {/* 在地活動 Tab */}
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

        {/* 限時活動 Tab */}
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

      {/* ========== 活動內容區（延伸到底部）========== */}
      <View style={styles.eventContentContainer}>
        {/* 公告內容 */}
        {activeEventTab === 'announcements' && (
          <View style={styles.section}>
            {events.announcements.length > 0 ? (
              // 有公告：顯示公告列表
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
              // 無公告：顯示空狀態
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

        {/* 在地活動內容 */}
        {activeEventTab === 'local' && (
          <View style={styles.section}>
            {events.festivals.length > 0 ? (
              // 有在地活動：顯示活動列表
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
              // 無在地活動：顯示空狀態
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

        {/* 限時活動內容 */}
        {activeEventTab === 'flash' && (
          <View style={styles.section}>
            {events.limitedEvents.length > 0 ? (
              // 有限時活動：顯示活動列表
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
              // 無限時活動：顯示空狀態
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
    </ScrollView>
  );
}

// ============================================================
// 樣式定義
// ============================================================
const styles = StyleSheet.create({
  // 容器
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
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
  },

  // 頂部問候區
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

  // 等級卡片
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
  /** 頭像 + 等級徽章容器 */
  avatarWithBadge: {
    position: 'relative',
    width: 64,
    height: 64,
    marginRight: 4, // 給 badge 一點右側空間
  },
  /** 圓形頭像（支援 icon 或首字母） */
  levelAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: MibuBrand.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** 頭像首字母文字 */
  avatarInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  /** Lv badge，置於頭像右下角（不擋住頭像） */
  levelBadgeCircle: {
    position: 'absolute',
    bottom: -6,
    right: -12,
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.creamLight,
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

  // XP 進度區
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

  // 每日任務卡片
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

  // 活動 Tab 導航
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

  // 活動內容區（延伸到底部）
  // 使用 minHeight 確保內容區延伸到螢幕底部
  // 計算：螢幕高度 - 頂部內容估算高度(~420px) - 底部 Tab Bar(~90px)
  eventContentContainer: {
    minHeight: SCREEN_HEIGHT - 420 - 90,
    backgroundColor: MibuBrand.warmWhite,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: MibuBrand.tanLight,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    paddingBottom: 100, // 底部 Tab Bar 間距
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

  // 公告/活動卡片
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

  // 空狀態
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: MibuBrand.tan,
    marginTop: 12,
  },

});
