/**
 * ============================================================
 * EconomyScreen - 成就與任務畫面（#043 規則引擎整合）
 * ============================================================
 * 使用統一規則引擎 API 取代舊的分散成就/任務系統
 *
 * 主要功能:
 * - 每日任務（quests with resetType daily/weekly）
 * - 一次性任務（quests with resetType none）
 * - 成就徽章（achievements）
 * - 用戶權益（perks）
 * - 領取獎勵（claim completed rules）
 * - 前往導航（navigateTo）
 *
 * 串接 API:
 * - rulesApi.getRules() - 取得規則列表（#043 統一）
 * - rulesApi.claimReward() - 領取獎勵
 * - economyApi.getCoins() - 金幣資訊
 * - economyApi.getPerks() - 權益資訊
 *
 * @see 後端契約: contracts/APP.md #043
 * @updated 2026-02-10 #043 規則引擎整合
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
import { rulesApi } from '../../../services/rulesApi';
import { economyApi } from '../../../services/economyApi';
import { CoinReward } from '../../shared/components/ui/CoinReward';
import { SectionHeader } from '../../shared/components/ui/SectionHeader';
import { MibuBrand } from '../../../../constants/Colors';
import { UserPerksResponse } from '../../../types/economy';
import { RuleItem, RulesListResponse, NavigateTo, RuleStatus } from '../../../types/rules';

// ============================================================
// 常數定義
// ============================================================

/** Tab 類型 */
type TabType = 'daily' | 'onetime' | 'cumulative' | 'level';

/**
 * navigateTo 欄位對應 App 路由
 * 規則卡片上的「前往」按鈕目的地
 */
const NAVIGATE_ROUTE_MAP: Record<string, string> = {
  gacha: '/(tabs)/gacha',
  collection: '/(tabs)/collection',
  vote: '/contribution',
  shop: '/shop',
  referral: '/referral',
  crowdfund: '/crowdfund',
};

/**
 * 從 RuleItem 的 rewards 中提取金幣獎勵總數
 */
function getCoinsReward(rule: RuleItem): number {
  return rule.rewards
    .filter(r => r.type === 'coins')
    .reduce((sum, r) => sum + (r.amount ?? 0), 0);
}

/**
 * 取得規則狀態對應的圖示名稱
 */
function getStatusIcon(status: RuleStatus): keyof typeof Ionicons.glyphMap {
  switch (status) {
    case 'locked': return 'lock-closed-outline';
    case 'available': return 'radio-button-off-outline';
    case 'completed': return 'gift-outline';
    case 'claimed': return 'checkmark-circle';
    case 'triggered': return 'flash-outline';
    case 'expired': return 'time-outline';
    default: return 'help-outline';
  }
}

// ============================================================
// 主元件
// ============================================================

export function EconomyScreen() {
  const { state, t, getToken } = useApp();
  const router = useRouter();

  // ============================================================
  // 狀態管理
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState<number | null>(null); // 正在領取中的 rule ID

  // 規則引擎資料（#043 統一）
  const [rulesData, setRulesData] = useState<RulesListResponse | null>(null);

  // 用戶權益（沿用舊 API）
  const [perksInfo, setPerksInfo] = useState<UserPerksResponse | null>(null);

  // 當前選中的 Tab
  const [selectedTab, setSelectedTab] = useState<TabType>('daily');

  // ============================================================
  // 衍生資料
  // ============================================================

  // 每日/每週任務（resetType = daily | weekly）
  const dailyQuests = rulesData?.quests.items.filter(
    q => q.resetType === 'daily' || q.resetType === 'weekly'
  ) ?? [];

  // 一次性任務（resetType = none）
  const onetimeQuests = rulesData?.quests.items.filter(
    q => q.resetType === 'none'
  ) ?? [];

  // 成就列表
  const achievements = rulesData?.achievements.items ?? [];

  // 統計
  const unlockedCount = rulesData?.achievements.unlocked ?? 0;
  const pendingClaims = rulesData?.pendingClaims ?? 0;
  const completedDailyCount = dailyQuests.filter(q => q.status === 'completed' || q.status === 'claimed').length;
  const completedOnetimeCount = onetimeQuests.filter(q => q.status === 'completed' || q.status === 'claimed').length;

  // 權益顯示
  const rawDailyPullLimit = perksInfo?.dailyPullLimit ?? 36;
  const rawInventorySlots = perksInfo?.inventorySlots ?? 30;
  const isUnlimitedPulls = rawDailyPullLimit === -1;
  const isUnlimitedSlots = rawInventorySlots >= 999;
  const dailyPullLimitDisplay = isUnlimitedPulls ? '∞' : String(rawDailyPullLimit);
  const inventorySlotsDisplay = isUnlimitedSlots ? '∞' : String(rawInventorySlots);

  // ============================================================
  // API 呼叫
  // ============================================================

  const loadData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      // 並行呼叫：規則引擎 + 權益
      const [rulesResponse, perksResponse] = await Promise.all([
        rulesApi.getRules(token),
        economyApi.getPerks(token),
      ]);

      setRulesData(rulesResponse);
      setPerksInfo(perksResponse);
    } catch (error) {
      console.error('Failed to load economy data:', error);
      Alert.alert(t.economy_loadFailed, t.economy_loadFailedDesc);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken, router, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // ============================================================
  // 事件處理
  // ============================================================

  /**
   * 領取已完成規則的獎勵
   */
  const handleClaim = useCallback(async (ruleId: number) => {
    if (claiming) return; // 防重複點擊

    setClaiming(ruleId);
    try {
      const token = await getToken();
      if (!token) return;

      const result = await rulesApi.claimReward(token, ruleId);

      // 顯示領取結果
      const rewardText = result.rewards.map(r => {
        if (r.type === 'coins') return `+${r.amount} 金幣`;
        if (r.type === 'perk') return r.itemName || '權益加成';
        return r.itemName || '獎勵';
      }).join('、');

      Alert.alert(t.economy_claimSuccess, rewardText);

      // 重新載入資料以更新狀態
      loadData();
    } catch (error) {
      console.error('Claim failed:', error);
      Alert.alert(t.economy_claimFailed);
    } finally {
      setClaiming(null);
    }
  }, [claiming, getToken, loadData, t]);

  /**
   * 導航到規則指定的頁面
   */
  const handleNavigate = useCallback((navigateTo: NavigateTo) => {
    if (!navigateTo) return;
    const route = NAVIGATE_ROUTE_MAP[navigateTo];
    if (route) {
      router.push(route as any);
    }
  }, [router]);

  // ============================================================
  // 子元件渲染
  // ============================================================

  /**
   * 渲染規則項目（任務/成就通用）
   */
  const renderRuleItem = (rule: RuleItem, showProgress: boolean = false) => {
    const coins = getCoinsReward(rule);
    const isLocked = rule.status === 'locked';
    const isCompleted = rule.status === 'completed';
    const isClaimed = rule.status === 'claimed';
    const isAvailable = rule.status === 'available';

    // 從 conditionResults 取得整體進度
    const overallProgress = rule.conditionResults.length > 0
      ? rule.conditionResults.reduce((sum, c) => sum + c.progressPercent, 0) / rule.conditionResults.length
      : 0;

    return (
      <View style={[styles.taskItem, isLocked && styles.taskItemLocked]}>
        {/* 圖示 */}
        <View style={[
          styles.taskIconContainer,
          isClaimed && styles.taskIconCompleted,
          isCompleted && styles.taskIconReady,
        ]}>
          <Ionicons
            name={rule.icon as any || getStatusIcon(rule.status)}
            size={20}
            color={isClaimed ? MibuBrand.tan : isCompleted ? MibuBrand.success : MibuBrand.copper}
          />
        </View>

        {/* 內容 */}
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, isLocked && styles.taskTitleLocked, isClaimed && styles.taskTitleCompleted]}>
            {rule.nameZh}
          </Text>
          <Text style={styles.taskDesc} numberOfLines={1}>{rule.description}</Text>

          {/* 進度條（成就用） */}
          {showProgress && rule.conditionResults.length > 0 && (
            <View style={styles.achievementProgressRow}>
              <View style={styles.achievementProgressBar}>
                <View
                  style={[
                    styles.achievementProgressFill,
                    { width: `${Math.min(overallProgress, 100)}%` },
                    isClaimed && styles.achievementProgressComplete,
                  ]}
                />
              </View>
              <Text style={styles.achievementProgressText}>
                {Math.round(overallProgress)}%
              </Text>
            </View>
          )}
        </View>

        {/* 右側動作區域 */}
        {isClaimed ? (
          // 已領取：打勾
          <View style={styles.taskCheckmark}>
            <Ionicons name="checkmark" size={16} color={MibuBrand.warmWhite} />
          </View>
        ) : isCompleted ? (
          // 可領取：領取按鈕
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => handleClaim(rule.id)}
            disabled={claiming === rule.id}
          >
            {claiming === rule.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.claimButtonText}>{t.economy_collect}</Text>
            )}
          </TouchableOpacity>
        ) : isLocked ? (
          // 未解鎖：鎖頭
          <Ionicons name="lock-closed" size={18} color={MibuBrand.tan} />
        ) : isAvailable && rule.navigateTo ? (
          // 可用 + 有導航：前往按鈕 + 金幣
          <View style={styles.actionGroup}>
            {coins > 0 && (
              <View style={styles.taskRewardBadge}>
                <CoinReward amount={coins} size="sm" />
              </View>
            )}
            <TouchableOpacity
              style={styles.goButton}
              onPress={() => handleNavigate(rule.navigateTo)}
            >
              <Text style={styles.goButtonText}>{t.economy_goDoIt}</Text>
              <Ionicons name="chevron-forward" size={14} color={MibuBrand.brown} />
            </TouchableOpacity>
          </View>
        ) : (
          // 可用但沒導航：顯示金幣
          coins > 0 ? (
            <View style={styles.taskRewardBadge}>
              <CoinReward amount={coins} />
            </View>
          ) : null
        )}
      </View>
    );
  };

  /**
   * 渲染規則列表（帶空狀態處理）
   */
  const renderRuleList = (rules: RuleItem[], emptyText: string, showProgress: boolean = false) => {
    if (rules.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={MibuBrand.tan} />
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      );
    }

    return (
      <View style={styles.taskGroup}>
        {rules.map((rule, index) => (
          <React.Fragment key={rule.id}>
            {renderRuleItem(rule, showProgress)}
            {index < rules.length - 1 && <View style={styles.taskDivider} />}
          </React.Fragment>
        ))}
      </View>
    );
  };

  /**
   * 根據選中的 Tab 渲染對應內容
   */
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'daily':
        return (
          <>
            {/* 每日/每週任務 */}
            <SectionHeader
              title={t.economy_tabDaily}
              subtitle={`${completedDailyCount}/${dailyQuests.length} ${t.economy_done}`}
            />
            {renderRuleList(dailyQuests, t.economy_noQuests)}

            {/* 一次性任務 */}
            {onetimeQuests.length > 0 && (
              <>
                <SectionHeader
                  title={t.economy_beginnerTasks}
                  subtitle={`${completedOnetimeCount}/${onetimeQuests.length} ${t.economy_done}`}
                />
                {renderRuleList(onetimeQuests, t.economy_noQuests)}
              </>
            )}
          </>
        );
      case 'onetime':
        return (
          <>
            <SectionHeader
              title={t.economy_beginnerTasks}
              subtitle={`${completedOnetimeCount}/${onetimeQuests.length} ${t.economy_done}`}
            />
            {renderRuleList(onetimeQuests, t.economy_noQuests)}
          </>
        );
      case 'cumulative':
        return (
          <>
            <SectionHeader
              title={t.economy_achievementProgress}
              subtitle={`${unlockedCount}/${rulesData?.achievements.total ?? 0} ${t.economy_unlocked}`}
            />
            {renderRuleList(achievements, t.economy_noAchievements, true)}
          </>
        );
      case 'level':
        // 權益 Tab（沿用舊 API 資料）
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
                  <Text style={styles.perkDetailTitle}>{t.economy_dailyPullLimit}</Text>
                  <Text style={styles.perkDetailDesc}>{t.economy_pullsPerDay}</Text>
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
                  <Text style={styles.perkDetailTitle}>{t.economy_inventorySlots}</Text>
                  <Text style={styles.perkDetailDesc}>{t.economy_itemsCanHold}</Text>
                </View>
                <Text style={styles.perkDetailValue}>{inventorySlotsDisplay}</Text>
              </View>
              <View style={styles.taskDivider} />

              {/* 策劃師資格 */}
              <View style={styles.perkDetailItem}>
                <View style={styles.perkDetailIcon}>
                  <Ionicons
                    name={perksInfo?.canApplySpecialist ? 'ribbon' : 'ribbon-outline'}
                    size={20}
                    color={perksInfo?.canApplySpecialist ? MibuBrand.success : MibuBrand.copper}
                  />
                </View>
                <View style={styles.perkDetailContent}>
                  <Text style={styles.perkDetailTitle}>{t.economy_specialistEligibility}</Text>
                  <Text style={styles.perkDetailDesc}>
                    {perksInfo?.canApplySpecialist ? t.economy_canApplyNow : t.economy_unlockRequirement}
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
                <Text style={styles.coinInfoText}>{t.economy_coinsInfo}</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.economy_achievementsTitle}</Text>
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
          {/* Stats 卡片 */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={20} color={MibuBrand.copper} />
              <Text style={styles.statNumber}>{unlockedCount}</Text>
              <Text style={styles.statLabel}>{t.economy_statAchievements}</Text>
            </View>
            {pendingClaims > 0 && (
              <View style={[styles.statCard, styles.statCardHighlight]}>
                <Ionicons name="gift" size={20} color={MibuBrand.success} />
                <Text style={styles.statNumber}>{pendingClaims}</Text>
                <Text style={styles.statLabel}>{t.economy_pendingClaims}</Text>
              </View>
            )}
          </View>

          {/* Tab 切換器 */}
          <View style={styles.tabContainer}>
            {(['daily', 'onetime', 'cumulative', 'level'] as TabType[]).map(tab => (
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

          {/* Tab 內容 */}
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
  statCardHighlight: {
    borderWidth: 1.5,
    borderColor: MibuBrand.success,
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
  tabContent: {},

  // Task Items
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
  taskItemLocked: {
    opacity: 0.5,
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
  taskIconReady: {
    backgroundColor: `${MibuBrand.success}15`,
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
  taskTitleLocked: {
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

  // 領取按鈕
  claimButton: {
    backgroundColor: MibuBrand.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // 前往按鈕
  goButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: `${MibuBrand.brown}12`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  goButtonText: {
    color: MibuBrand.brown,
    fontSize: 12,
    fontWeight: '600',
  },

  // 動作群組（金幣 + 前往）
  actionGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },

  // Achievement Progress
  achievementProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
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
    minWidth: 32,
    textAlign: 'right',
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

  // Perk Details
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
