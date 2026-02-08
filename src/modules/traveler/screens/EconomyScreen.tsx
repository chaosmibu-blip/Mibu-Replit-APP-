/**
 * EconomyScreen - 成就與任務畫面
 *
 * 功能：
 * - 顯示用戶金幣餘額和權益（#039 重構：等級 → 金幣）
 * - 每日任務列表（簽到、扭蛋、瀏覽圖鑑等）
 * - 新手任務列表（一次性任務）
 * - 成就徽章列表（累計任務進度）
 * - 統計數據卡片（金幣、已解鎖成就、連續登入）
 *
 * 串接 API：
 * - economyApi.getCoins() - 取得金幣資訊（#039 新增）
 * - economyApi.getPerks() - 取得權益資訊（#039 新增）
 * - economyApi.getAchievements() - 取得成就列表
 *
 * @see 後端合約: contracts/APP.md Phase 5
 * @updated 2026-02-05 #039 經濟系統重構
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
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { economyApi } from '../../../services/economyApi';
import { CoinReward } from '../../shared/components/ui/CoinReward';
import { SectionHeader } from '../../shared/components/ui/SectionHeader';
import { MibuBrand } from '../../../../constants/Colors';
import { UserCoinsResponse, UserPerksResponse, Achievement } from '../../../types/economy';

// ============================================================
// 常數定義
// ============================================================

/**
 * 任務類型
 * - daily: 每日任務
 * - onetime: 新手任務（一次性）
 * - cumulative: 累計成就
 * - level: 等級獎勵
 */
type TaskCategory = 'daily' | 'onetime' | 'cumulative' | 'level';

/**
 * 任務項目介面
 */
interface Task {
  id: string;                              // 任務 ID
  icon: keyof typeof Ionicons.glyphMap;    // 任務圖示
  title: string;                           // 任務標題
  description: string;                     // 任務描述
  coins: number;                            // 獎勵金幣
  isCompleted: boolean;                    // 是否已完成
  category: TaskCategory;                  // 任務類型
}

/**
 * 每日任務靜態定義
 * 注意：實際應從後端 API 取得
 */
const DAILY_TASKS: Task[] = [
  { id: 'd1', icon: 'calendar-outline', title: '每日簽到', description: '登入 APP', coins: 5, isCompleted: false, category: 'daily' },
  { id: 'd2', icon: 'gift-outline', title: '每日扭蛋', description: '完成 1 次扭蛋', coins: 10, isCompleted: false, category: 'daily' },
  { id: 'd3', icon: 'book-outline', title: '瀏覽圖鑑', description: '查看圖鑑頁', coins: 5, isCompleted: false, category: 'daily' },
  { id: 'd4', icon: 'map-outline', title: '查看行程', description: '查看旅程策劃', coins: 5, isCompleted: false, category: 'daily' },
  { id: 'd5', icon: 'globe-outline', title: '探索地圖', description: '查看世界地圖', coins: 5, isCompleted: false, category: 'daily' },
  { id: 'd6', icon: 'grid-outline', title: '每日全勤', description: '完成全部每日任務', coins: 30, isCompleted: false, category: 'daily' },
];

/**
 * 新手任務靜態定義
 * 一次性任務，完成後不會重置
 */
const ONETIME_TASKS: Task[] = [
  { id: 'o1', icon: 'compass-outline', title: '初次探索', description: '完成第一次扭蛋', coins: 50, isCompleted: false, category: 'onetime' },
  { id: 'o2', icon: 'person-outline', title: '建立檔案', description: '設定個人暱稱', coins: 30, isCompleted: false, category: 'onetime' },
  { id: 'o3', icon: 'image-outline', title: '頭像達人', description: '更換個人頭像', coins: 15, isCompleted: false, category: 'onetime' },
  { id: 'o4', icon: 'options-outline', title: '選擇偏好', description: '設定旅遊偏好標籤', coins: 20, isCompleted: false, category: 'onetime' },
  { id: 'o5', icon: 'cart-outline', title: '首購達成', description: '購買第一個行程', coins: 150, isCompleted: false, category: 'onetime' },
  { id: 'o6', icon: 'people-outline', title: '推薦先鋒', description: '成功邀請第一位好友', coins: 100, isCompleted: false, category: 'onetime' },
  { id: 'o7', icon: 'cube-outline', title: '道具新手', description: '使用第一個道具', coins: 20, isCompleted: false, category: 'onetime' },
  { id: 'o8', icon: 'document-text-outline', title: '規劃達人', description: '建立第一個行程項目', coins: 30, isCompleted: false, category: 'onetime' },
];

// ============================================================
// 主元件
// ============================================================

export function EconomyScreen() {
  const { state, t, getToken } = useApp();
  const router = useRouter();

  // ============================================================
  // 狀態管理
  // ============================================================

  // 載入狀態
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 用戶金幣資訊（#039 新增）
  const [coinsInfo, setCoinsInfo] = useState<UserCoinsResponse | null>(null);

  // 用戶權益資訊（#039 新增）
  const [perksInfo, setPerksInfo] = useState<UserPerksResponse | null>(null);

  // 成就列表
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // 當前選中的 Tab
  const [selectedTab, setSelectedTab] = useState<TaskCategory>('daily');

  // 任務列表（靜態資料）
  const [dailyTasks] = useState<Task[]>(DAILY_TASKS);
  const [onetimeTasks] = useState<Task[]>(ONETIME_TASKS);

  // ============================================================
  // API 呼叫
  // ============================================================

  /**
   * 載入金幣、權益和成就資料
   * #039: 改用 getCoins() 和 getPerks() 取代 getLevelInfo()
   */
  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      // 並行呼叫三個 API
      const [coinsResponse, perksResponse, achievementsData] = await Promise.all([
        economyApi.getCoins(token),
        economyApi.getPerks(token),
        economyApi.getAchievements(token),
      ]);

      setCoinsInfo(coinsResponse);
      setPerksInfo(perksResponse);
      setAchievements(achievementsData.achievements);
    } catch (error) {
      console.error('Failed to load economy data:', error);
      // 用戶可見的錯誤提示
      Alert.alert(t.economy_loadFailed, t.economy_loadFailedDesc);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router]);

  // 初始載入
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 下拉重新整理
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // ============================================================
  // 計算衍生數據
  // ============================================================

  // 權益資訊（#039 新增，#041 支援超管無限額度）
  // 用 ?? 而非 ||，避免 dailyPullLimit=0（被封禁）時錯誤 fallback 為預設值
  const rawDailyPullLimit = perksInfo?.dailyPullLimit ?? 36;
  const rawInventorySlots = perksInfo?.inventorySlots ?? 30;
  // dailyPullLimit === -1 代表無限（超管）；inventorySlots === 999 代表無限
  const isUnlimitedPulls = rawDailyPullLimit === -1;
  const isUnlimitedSlots = rawInventorySlots >= 999;
  const dailyPullLimitDisplay = isUnlimitedPulls ? '∞' : String(rawDailyPullLimit);
  const inventorySlotsDisplay = isUnlimitedSlots ? '∞' : String(rawInventorySlots);

  // 已解鎖成就數量
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  // 每日任務完成統計
  const completedDailyCount = dailyTasks.filter(t => t.isCompleted).length;
  const totalDailyCount = dailyTasks.length;

  // 新手任務完成統計
  const completedOnetimeCount = onetimeTasks.filter(t => t.isCompleted).length;
  const totalOnetimeCount = onetimeTasks.length;

  // ============================================================
  // 子元件渲染
  // ============================================================

  /**
   * 渲染單一任務項目
   */
  const renderTaskItem = (task: Task) => (
    <TouchableOpacity
      style={styles.taskItem}
      activeOpacity={0.7}
    >
      <View style={[styles.taskIconContainer, task.isCompleted && styles.taskIconCompleted]}>
        <Ionicons
          name={task.icon}
          size={20}
          color={task.isCompleted ? MibuBrand.tan : MibuBrand.copper}
        />
      </View>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, task.isCompleted && styles.taskTitleCompleted]}>{task.title}</Text>
        <Text style={styles.taskDesc}>{task.description}</Text>
      </View>
      {task.isCompleted ? (
        <View style={styles.taskCheckmark}>
          <Ionicons name="checkmark" size={16} color={MibuBrand.warmWhite} />
        </View>
      ) : (
        <View style={styles.taskRewardBadge}>
          <CoinReward amount={task.coins} />
        </View>
      )}
    </TouchableOpacity>
  );

  /**
   * 根據選中的 Tab 渲染對應內容
   */
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'daily':
        // ===== 每日任務 Tab =====
        return (
          <>
            {/* 每日任務列表 */}
            <View style={styles.taskGroup}>
              {dailyTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  {renderTaskItem(task)}
                  {index < dailyTasks.length - 1 && <View style={styles.taskDivider} />}
                </React.Fragment>
              ))}
            </View>

            {/* 新手任務區塊 */}
            <SectionHeader
              title={t.economy_beginnerTasks}
              subtitle={`${completedOnetimeCount}/${totalOnetimeCount} ${t.economy_done}`}
            />
            <View style={styles.taskGroup}>
              {onetimeTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  {renderTaskItem(task)}
                  {index < onetimeTasks.length - 1 && <View style={styles.taskDivider} />}
                </React.Fragment>
              ))}
            </View>
          </>
        );
      case 'onetime':
        // ===== 一次性任務 Tab =====
        return (
          <>
            <SectionHeader
              title={t.economy_beginnerTasks}
              subtitle={`${completedOnetimeCount}/${totalOnetimeCount} ${t.economy_done}`}
            />
            <View style={styles.taskGroup}>
              {onetimeTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  {renderTaskItem(task)}
                  {index < onetimeTasks.length - 1 && <View style={styles.taskDivider} />}
                </React.Fragment>
              ))}
            </View>
          </>
        );
      case 'cumulative':
        // ===== 累計成就 Tab（顯示進度條） =====
        return (
          <>
            <SectionHeader
              title={t.economy_achievementProgress}
              subtitle={`${unlockedCount}/${achievements.length} ${t.economy_unlocked}`}
            />
            {achievements.length > 0 ? (
              <View style={styles.taskGroup}>
                {achievements.map((achievement, index) => {
                  const progressPercent = achievement.requirement > 0
                    ? Math.min((achievement.progress / achievement.requirement) * 100, 100)
                    : 0;
                  return (
                    <View key={achievement.id}>
                      <View style={styles.achievementItem}>
                        <View style={[
                          styles.achievementIconContainer,
                          achievement.isUnlocked && styles.achievementIconUnlocked,
                        ]}>
                          <Ionicons
                            name={achievement.isUnlocked ? 'trophy' : 'trophy-outline'}
                            size={20}
                            color={achievement.isUnlocked ? MibuBrand.warning : MibuBrand.copper}
                          />
                        </View>
                        <View style={styles.achievementContent}>
                          <View style={styles.achievementHeader}>
                            <Text style={styles.achievementTitle}>{achievement.title}</Text>
                            {achievement.isUnlocked && (
                              <View style={styles.unlockedBadge}>
                                <Ionicons name="checkmark" size={10} color="#fff" />
                              </View>
                            )}
                          </View>
                          <Text style={styles.achievementDesc}>{achievement.description}</Text>
                          <View style={styles.achievementProgressRow}>
                            <View style={styles.achievementProgressBar}>
                              <View
                                style={[
                                  styles.achievementProgressFill,
                                  { width: `${progressPercent}%` },
                                  achievement.isUnlocked && styles.achievementProgressComplete,
                                ]}
                              />
                            </View>
                            <Text style={styles.achievementProgressText}>
                              {achievement.progress}/{achievement.requirement}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.achievementReward}>
                          <CoinReward amount={achievement.reward.coinReward || 0} />
                        </View>
                      </View>
                      {index < achievements.length - 1 && <View style={styles.taskDivider} />}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={48} color={MibuBrand.tan} />
                <Text style={styles.emptyText}>
                  {t.economy_noAchievements}
                </Text>
              </View>
            )}
          </>
        );
      case 'level':
        // ===== 權益 Tab（#039 重構） =====
        return (
          <>
            <SectionHeader title={t.economy_myPerks} />
            <View style={styles.taskGroup}>
              {/* 每日扭蛋上限 */}
              <View style={styles.perkDetailItem}>
                <View style={styles.perkDetailIcon}>
                  <Ionicons name="dice" size={20} color={MibuBrand.copper} />
                </View>
                <View style={styles.perkDetailContent}>
                  <Text style={styles.perkDetailTitle}>
                    {t.economy_dailyPullLimit}
                  </Text>
                  <Text style={styles.perkDetailDesc}>
                    {t.economy_pullsPerDay}
                  </Text>
                </View>
                <Text style={styles.perkDetailValue}>{dailyPullLimitDisplay}</Text>
              </View>
              <View style={styles.taskDivider} />

              {/* 背包格數 */}
              <View style={styles.perkDetailItem}>
                <View style={styles.perkDetailIcon}>
                  <Ionicons name="cube" size={20} color={MibuBrand.copper} />
                </View>
                <View style={styles.perkDetailContent}>
                  <Text style={styles.perkDetailTitle}>
                    {t.economy_inventorySlots}
                  </Text>
                  <Text style={styles.perkDetailDesc}>
                    {t.economy_itemsCanHold}
                  </Text>
                </View>
                <Text style={styles.perkDetailValue}>{inventorySlotsDisplay}</Text>
              </View>
              <View style={styles.taskDivider} />

              {/* 策劃師資格 */}
              <View style={styles.perkDetailItem}>
                <View style={styles.perkDetailIcon}>
                  <Ionicons
                    name={perksInfo?.canApplySpecialist ? "ribbon" : "ribbon-outline"}
                    size={20}
                    color={perksInfo?.canApplySpecialist ? MibuBrand.success : MibuBrand.copper}
                  />
                </View>
                <View style={styles.perkDetailContent}>
                  <Text style={styles.perkDetailTitle}>
                    {t.economy_specialistEligibility}
                  </Text>
                  <Text style={styles.perkDetailDesc}>
                    {perksInfo?.canApplySpecialist
                      ? t.economy_canApplyNow
                      : t.economy_unlockRequirement}
                  </Text>
                </View>
                {perksInfo?.canApplySpecialist && (
                  <Ionicons name="checkmark-circle" size={24} color={MibuBrand.success} />
                )}
              </View>
            </View>

            {/* 金幣說明 */}
            <View style={{ marginTop: 16 }}>
              <SectionHeader title={t.economy_aboutCoins} />
            </View>
            <View style={styles.taskGroup}>
              <View style={styles.coinInfoItem}>
                <Ionicons name="information-circle-outline" size={20} color={MibuBrand.copper} />
                <Text style={styles.coinInfoText}>
                  {t.economy_coinsInfo}
                </Text>
              </View>
            </View>
          </>
        );
    }
  };

  // ============================================================
  // 載入中狀態
  // ============================================================

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MibuBrand.brown} />
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // 主畫面渲染
  // ============================================================

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}>
      <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t.economy_achievementsTitle}
        </Text>
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
            colors={[MibuBrand.brown]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Card：僅顯示成就 */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={20} color={MibuBrand.copper} />
            <Text style={styles.statNumber}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>{t.economy_statAchievements}</Text>
          </View>
        </View>

        {/* Tab Switcher（#039：等級 → 權益） */}
        <View style={styles.tabContainer}>
          {(['daily', 'onetime', 'cumulative', 'level'] as TaskCategory[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab === 'daily' && t.economy_tabDaily}
                {tab === 'onetime' && t.economy_tabOnce}
                {tab === 'cumulative' && t.economy_tabTotal}
                {tab === 'level' && t.economy_tabPerks}
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
    </SafeAreaView>
  );
}

// ============================================================
// 樣式定義
// ============================================================

const styles = StyleSheet.create({
  // 容器樣式
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.warmWhite,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
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

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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

  // Task Group (grouped card container)
  taskGroup: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    overflow: 'hidden',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  taskDivider: {
    height: 1,
    backgroundColor: MibuBrand.tanLight,
    marginLeft: 60,
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MibuBrand.creamLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIconCompleted: {
    backgroundColor: MibuBrand.tanLight,
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
  taskTitleCompleted: {
    color: MibuBrand.tan,
  },
  taskDesc: {
    fontSize: 13,
    color: MibuBrand.copper,
    marginTop: 2,
  },
  taskRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${MibuBrand.warning}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MibuBrand.tan,
    justifyContent: 'center',
    alignItems: 'center',
  },


  // Empty State
  // Achievement Styles
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  achievementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MibuBrand.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIconUnlocked: {
    backgroundColor: `${MibuBrand.warning}20`,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  unlockedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: MibuBrand.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementDesc: {
    fontSize: 12,
    color: MibuBrand.brownLight,
    marginBottom: 8,
  },
  achievementProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: MibuBrand.tanLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: MibuBrand.brown,
    borderRadius: 3,
  },
  achievementProgressComplete: {
    backgroundColor: MibuBrand.success,
  },
  achievementProgressText: {
    fontSize: 11,
    fontWeight: '600',
    color: MibuBrand.copper,
    minWidth: 40,
    textAlign: 'right',
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${MibuBrand.warning}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
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

  // ===== 權益詳情樣式 =====
  perkDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  perkDetailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MibuBrand.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perkDetailContent: {
    flex: 1,
  },
  perkDetailTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 2,
  },
  perkDetailDesc: {
    fontSize: 12,
    color: MibuBrand.copper,
  },
  perkDetailValue: {
    fontSize: 20,
    fontWeight: '800',
    color: MibuBrand.brown,
  },
  coinInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  coinInfoText: {
    flex: 1,
    fontSize: 14,
    color: MibuBrand.copper,
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 100,
  },
});
