/**
 * EconomyScreen - 成就與任務畫面
 * 顯示用戶等級、經驗值、每日任務、成就徽章
 *
 * @see 後端合約: contracts/APP.md Phase 5
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { economyApi } from '../../../services/economyApi';
import { MibuBrand } from '../../../../constants/Colors';
import { LevelInfo, Achievement } from '../../../types/economy';

// 任務類型定義
type TaskCategory = 'daily' | 'onetime' | 'cumulative' | 'level';

interface Task {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  xp: number;
  isCompleted: boolean;
  category: TaskCategory;
}

// 每日任務靜態定義（實際應從 API 取得）
const DAILY_TASKS: Task[] = [
  { id: 'd1', icon: 'calendar-outline', title: '每日簽到', description: '登入 APP', xp: 5, isCompleted: false, category: 'daily' },
  { id: 'd2', icon: 'gift-outline', title: '每日扭蛋', description: '完成 1 次扭蛋', xp: 10, isCompleted: false, category: 'daily' },
  { id: 'd3', icon: 'book-outline', title: '瀏覽圖鑑', description: '查看圖鑑頁', xp: 5, isCompleted: false, category: 'daily' },
  { id: 'd4', icon: 'map-outline', title: '查看行程', description: '查看旅程策劃', xp: 5, isCompleted: false, category: 'daily' },
  { id: 'd5', icon: 'globe-outline', title: '探索地圖', description: '查看世界地圖', xp: 5, isCompleted: false, category: 'daily' },
  { id: 'd6', icon: 'grid-outline', title: '每日全勤', description: '完成全部每日任務', xp: 30, isCompleted: false, category: 'daily' },
];

// 新手任務靜態定義
const ONETIME_TASKS: Task[] = [
  { id: 'o1', icon: 'compass-outline', title: '初次探索', description: '完成第一次扭蛋', xp: 50, isCompleted: false, category: 'onetime' },
  { id: 'o2', icon: 'person-outline', title: '建立檔案', description: '設定個人暱稱', xp: 30, isCompleted: false, category: 'onetime' },
  { id: 'o3', icon: 'image-outline', title: '頭像達人', description: '更換個人頭像', xp: 15, isCompleted: false, category: 'onetime' },
  { id: 'o4', icon: 'options-outline', title: '選擇偏好', description: '設定旅遊偏好標籤', xp: 20, isCompleted: false, category: 'onetime' },
  { id: 'o5', icon: 'cart-outline', title: '首購達成', description: '購買第一個行程', xp: 150, isCompleted: false, category: 'onetime' },
  { id: 'o6', icon: 'people-outline', title: '推薦先鋒', description: '成功邀請第一位好友', xp: 100, isCompleted: false, category: 'onetime' },
  { id: 'o7', icon: 'cube-outline', title: '道具新手', description: '使用第一個道具', xp: 20, isCompleted: false, category: 'onetime' },
  { id: 'o8', icon: 'document-text-outline', title: '規劃達人', description: '建立第一個行程項目', xp: 30, isCompleted: false, category: 'onetime' },
];

export function EconomyScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedTab, setSelectedTab] = useState<TaskCategory>('daily');
  const [dailyTasks] = useState<Task[]>(DAILY_TASKS);
  const [onetimeTasks] = useState<Task[]>(ONETIME_TASKS);

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      const [levelData, achievementsData] = await Promise.all([
        economyApi.getLevelInfo(token),
        economyApi.getAchievements(token),
      ]);

      setLevelInfo(levelData);
      setAchievements(achievementsData.achievements);
    } catch (error) {
      console.error('Failed to load economy data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const expProgress = levelInfo
    ? (levelInfo.currentExp / levelInfo.nextLevelExp) * 100
    : 0;

  const xpToNextLevel = levelInfo
    ? levelInfo.nextLevelExp - levelInfo.currentExp
    : 0;

  // 統計數據
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const currentTier = levelInfo?.tier || 1;
  const loginStreak = levelInfo?.loginStreak || 0;

  // 完成的每日任務數
  const completedDailyCount = dailyTasks.filter(t => t.isCompleted).length;
  const totalDailyCount = dailyTasks.length;

  // 完成的新手任務數
  const completedOnetimeCount = onetimeTasks.filter(t => t.isCompleted).length;
  const totalOnetimeCount = onetimeTasks.length;

  const renderTaskItem = (task: Task) => (
    <TouchableOpacity
      key={task.id}
      style={styles.taskCard}
      activeOpacity={0.7}
    >
      <View style={[styles.taskIconContainer, task.isCompleted && styles.taskIconCompleted]}>
        <Ionicons
          name={task.icon}
          size={22}
          color={task.isCompleted ? MibuBrand.copper : MibuBrand.brown}
        />
      </View>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskDesc}>{task.description}</Text>
      </View>
      {task.isCompleted ? (
        <View style={styles.taskCheckmark}>
          <Ionicons name="checkmark" size={18} color="#ffffff" />
        </View>
      ) : (
        <Text style={styles.taskXp}>+{task.xp} XP</Text>
      )}
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'daily':
        return (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{isZh ? '每日任務' : 'Daily Tasks'}</Text>
              <Text style={styles.sectionCount}>{completedDailyCount}/{totalDailyCount} {isZh ? '完成' : 'done'}</Text>
            </View>
            {dailyTasks.map(renderTaskItem)}
          </>
        );
      case 'onetime':
        return (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{isZh ? '新手任務' : 'Beginner Tasks'}</Text>
              <Text style={styles.sectionCount}>{completedOnetimeCount}/{totalOnetimeCount} {isZh ? '完成' : 'done'}</Text>
            </View>
            {onetimeTasks.map(renderTaskItem)}
          </>
        );
      case 'cumulative':
        return (
          <View style={styles.emptyState}>
            <Ionicons name="stats-chart-outline" size={48} color={MibuBrand.tan} />
            <Text style={styles.emptyText}>
              {isZh ? '累計任務即將推出' : 'Cumulative tasks coming soon'}
            </Text>
          </View>
        );
      case 'level':
        return (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={48} color={MibuBrand.tan} />
            <Text style={styles.emptyText}>
              {isZh ? '等級任務即將推出' : 'Level tasks coming soon'}
            </Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="ribbon" size={24} color={MibuBrand.brownDark} />
          <Text style={styles.headerTitle}>
            {isZh ? '成就與任務' : 'Achievements & Tasks'}
          </Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={MibuBrand.brown}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* User Level Card */}
        <View style={styles.levelCard}>
          {/* 裝飾元素 */}
          <View style={styles.levelCardDecor}>
            <Ionicons name="sparkles" size={16} color={MibuBrand.tanLight} />
          </View>
          <View style={[styles.levelCardDecor, styles.levelCardDecorRight]}>
            <Ionicons name="star" size={14} color={MibuBrand.tanLight} />
          </View>

          <View style={styles.levelTop}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={32} color={MibuBrand.copper} />
                </View>
              </View>
              <View style={styles.levelBadge}>
                <Ionicons name="shield" size={10} color="#fff" style={{ marginRight: 2 }} />
                <Text style={styles.levelBadgeText}>Lv.{levelInfo?.level || 1}</Text>
              </View>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{state.user?.firstName || (isZh ? '旅行萌新' : 'Traveler')}</Text>
              <View style={styles.tierBadge}>
                <Ionicons name="layers" size={12} color={MibuBrand.brown} />
                <Text style={styles.userTier}>
                  {isZh ? `第 ${currentTier} 階段` : `Tier ${currentTier}`}
                </Text>
              </View>
            </View>

            <View style={styles.totalXpBox}>
              <View style={styles.xpIconRow}>
                <Ionicons name="flash" size={14} color={MibuBrand.warning} />
                <Text style={styles.totalXpLabel}>{isZh ? '總經驗' : 'Total XP'}</Text>
              </View>
              <Text style={styles.totalXpValue}>{levelInfo?.totalExp?.toLocaleString() || 0}</Text>
            </View>
          </View>

          <View style={styles.levelProgress}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min(expProgress, 100)}%` }]} />
              </View>
              <View style={styles.progressPercentBadge}>
                <Text style={styles.progressPercentText}>{Math.round(expProgress)}%</Text>
              </View>
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressCurrent}>
                {levelInfo?.currentExp || 0} / {levelInfo?.nextLevelExp || 0} XP
              </Text>
              <View style={styles.progressNextBadge}>
                <Text style={styles.progressNext}>
                  Lv.{levelInfo?.level || 1} → Lv.{(levelInfo?.level || 1) + 1}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={20} color={MibuBrand.warning} />
            <Text style={styles.statNumber}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>{isZh ? '已解鎖' : 'Unlocked'}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={20} color={MibuBrand.copper} />
            <Text style={styles.statNumber}>{currentTier}</Text>
            <Text style={styles.statLabel}>{isZh ? '當前階段' : 'Tier'}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={20} color="#f97316" />
            <Text style={styles.statNumber}>{loginStreak}</Text>
            <Text style={styles.statLabel}>{isZh ? '連續登入' : 'Streak'}</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          {(['daily', 'onetime', 'cumulative', 'level'] as TaskCategory[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab === 'daily' && (isZh ? '每日' : 'Daily')}
                {tab === 'onetime' && (isZh ? '一次性' : 'Once')}
                {tab === 'cumulative' && (isZh ? '累計' : 'Total')}
                {tab === 'level' && (isZh ? '等級' : 'Level')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },

  // Level Card
  levelCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  levelCardDecor: {
    position: 'absolute',
    top: 12,
    left: 12,
    opacity: 0.5,
  },
  levelCardDecorRight: {
    left: 'auto',
    right: 12,
    top: 16,
  },
  levelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarRing: {
    padding: 3,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: MibuBrand.highlight,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: MibuBrand.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  userTier: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  totalXpBox: {
    alignItems: 'flex-end',
    backgroundColor: MibuBrand.creamLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  xpIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  totalXpLabel: {
    fontSize: 11,
    color: MibuBrand.copper,
  },
  totalXpValue: {
    fontSize: 18,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },
  levelProgress: {},
  progressBarContainer: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: MibuBrand.brown,
    borderRadius: 6,
  },
  progressPercentBadge: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCurrent: {
    fontSize: 13,
    color: MibuBrand.copper,
    fontWeight: '500',
  },
  progressNextBadge: {
    backgroundColor: MibuBrand.creamLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressNext: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.brown,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: MibuBrand.copper,
    marginTop: 2,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: MibuBrand.brown,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  tabTextActive: {
    color: '#ffffff',
  },

  // Tab Content
  tabContent: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  sectionCount: {
    fontSize: 14,
    color: MibuBrand.copper,
  },

  // Task Card
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  taskIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MibuBrand.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIconCompleted: {
    backgroundColor: MibuBrand.cream,
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  taskDesc: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  taskXp: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  taskCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MibuBrand.brown,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
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
    height: 100,
  },
});
