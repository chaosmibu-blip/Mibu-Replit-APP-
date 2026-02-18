/**
 * HomeScreen - 首頁
 *
 * 功能：
 * - 用戶問候（根據語言顯示不同文字）
 * - 用戶卡片（顯示金幣餘額、稱號、權益、連續登入）
 * - 每日任務卡片（點擊跳轉 /economy）
 * - 活動 Tab 切換（公告 / 在地活動 / 限時活動）
 *
 * 資料來源（React Query hooks）：
 * - useHomeEvents() - 首頁活動（不需認證）
 * - useCoins() / usePerks() - 金幣與權益（共用 economy hooks）
 * - useDailyTasks() - 每日任務摘要（衍生自 useRules）
 *
 * @updated 2026-02-12 Phase 3 遷移至 React Query
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';

// 取得螢幕高度，用於計算活動內容區最小高度
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth, useI18n } from '../../../context/AppContext';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';
import { Event } from '../../../types';
import { useHomeEvents, useDailyTasks } from '../../../hooks/useHomeQueries';
import { useCoins, usePerks } from '../../../hooks/useEconomyQueries';
import { useCollectionStats } from '../../../hooks/useCollectionQueries';
import { useGuestUpgradePrompt } from '../../../hooks/useGuestUpgradePrompt';
import { UpgradePromptToast } from '../components/UpgradePromptToast';
import { avatarService } from '../../../services/avatarService';
import { AvatarPreset } from '../../../types/asset';

// StorageKeys 已統一集中管理
import { STORAGE_KEYS } from '../../../constants/storageKeys';

// 頭像預設從 avatarService 動態載入（Cloudinary URL）

// ============================================================
// 型別定義
// ============================================================

/**
 * 用戶金幣資料介面（#039 重構）
 * 用於顯示用戶卡片的金幣相關數據
 */
interface UserCoinsData {
  balance: number;      // 當前金幣餘額
  totalEarned: number;  // 累計獲得金幣
  title: string;        // 稱號（根據累計金幣決定）
  loginStreak: number;  // 連續登入天數
}

/**
 * 用戶權益資料介面（#039 重構）
 */
interface UserPerksData {
  dailyPullLimit: number;    // 每日扭蛋上限
  inventorySlots: number;    // 背包格數
  canApplySpecialist: boolean; // 是否可申請策劃師
}

/**
 * 每日任務摘要介面
 * 用於顯示每日任務卡片
 */
interface DailyTaskSummary {
  completed: number;  // 已完成任務數
  total: number;      // 總任務數
  earnedCoins: number; // 已獲得金幣（#039：XP → 金幣）
}

// ============================================================
// 主元件
// ============================================================

export function HomeScreen() {
  // ============================================================
  // Hooks & Context
  // ============================================================
  const { user } = useAuth();
  const { t, language } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();

  // ============================================================
  // React Query 資料查詢
  // ============================================================

  const eventsQuery = useHomeEvents();
  const coinsQuery = useCoins();
  const perksQuery = usePerks();
  const dailyTasksQuery = useDailyTasks();
  const collectionStatsQuery = useCollectionStats();
  const guestUpgrade = useGuestUpgradePrompt();

  // 衍生狀態
  const loading = eventsQuery.isLoading;
  const refreshing = eventsQuery.isFetching && !eventsQuery.isLoading;

  const events = eventsQuery.data ?? { announcements: [], festivals: [], limitedEvents: [] };
  const coinsData = coinsQuery.data;
  const perksData = perksQuery.data;
  const dailyTask = dailyTasksQuery.dailyTask;

  // #051: 訪客升級提示 — 連續登入 3 天 / 收集 10 個景點
  useEffect(() => {
    const streak = coinsData?.loginStreak ?? 0;
    if (streak >= 3) {
      guestUpgrade.checkLoginStreak(streak);
    }
  }, [coinsData?.loginStreak]);

  useEffect(() => {
    const total = collectionStatsQuery.data?.total ?? 0;
    if (total >= 10) {
      guestUpgrade.checkCollectionMilestone(total);
    }
  }, [collectionStatsQuery.data?.total]);

  /**
   * 根據累計金幣決定稱號
   * 5000+ = 傳奇旅者 / 2000+ = 資深冒險家 / 500+ = 旅行達人
   * 100+ = 探索者 / 0+ = 旅行新手
   */
  const getCoinTitle = (totalEarned: number): string => {
    if (totalEarned >= 5000) return t.home_titleLegendary;
    if (totalEarned >= 2000) return t.home_titleExpert;
    if (totalEarned >= 500) return t.home_titleTraveler;
    if (totalEarned >= 100) return t.home_titleExplorer;
    return t.home_titleNewbie;
  };

  // 金幣衍生資料
  const userCoins: UserCoinsData = {
    balance: coinsData?.balance ?? 0,
    totalEarned: coinsData?.totalEarned ?? 0,
    title: getCoinTitle(coinsData?.totalEarned ?? 0),
    loginStreak: coinsData?.loginStreak ?? perksData?.loginStreak ?? 1,
  };

  // 權益衍生資料
  const userPerks: UserPerksData = {
    dailyPullLimit: perksData?.dailyPullLimit ?? 36,
    inventorySlots: perksData?.inventorySlots ?? 30,
    canApplySpecialist: perksData?.canApplySpecialist ?? false,
  };

  // ============================================================
  // 本地狀態（非 API 資料）
  // ============================================================

  // 活動 Tab 當前選中項（公告/在地/限時）

  // 用戶頭像設定（從 AsyncStorage 讀取）
  const [userAvatar, setUserAvatar] = useState<string>('default');
  // #038 自訂頭像 URL（上傳的照片）
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  // 頭像預設列表（從 avatarService 動態載入）
  const [avatarPresets, setAvatarPresets] = useState<AvatarPreset[]>([]);

  /**
   * 載入用戶頭像設定
   * 從 AsyncStorage 讀取用戶在個人資料中設定的頭像
   */
  const loadUserAvatar = useCallback(async () => {
    try {
      const [savedAvatar, savedCustomUrl, presets] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AVATAR_PRESET),
        AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_AVATAR_URL),
        avatarService.getPresets(),
      ]);
      if (savedAvatar) setUserAvatar(savedAvatar);
      if (savedCustomUrl) setCustomAvatarUrl(savedCustomUrl);
      setAvatarPresets(presets);
    } catch {
      // 頭像載入失敗，使用預設頭像
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
   * 下拉刷新：失效所有首頁相關查詢
   */
  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['home'] });
    queryClient.invalidateQueries({ queryKey: ['economy'] });
  }, [queryClient]);

  // ============================================================
  // 輔助函數
  // ============================================================

  /**
   * 取得活動的在地化標題
   * 根據當前語言返回對應的標題
   */
  const getLocalizedTitle = (event: Event): string => {
    if (language === 'zh-TW') return event.title;
    if (language === 'en' && event.titleEn) return event.titleEn;
    return event.title;
  };

  /**
   * 取得活動的在地化描述
   * 根據當前語言返回對應的描述
   */
  const getLocalizedDesc = (event: Event): string => {
    if (language === 'zh-TW') return event.description;
    if (language === 'en' && event.descriptionEn) return event.descriptionEn;
    return event.description;
  };

  /**
   * 格式化日期為 YYYY/MM/DD
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  // 計算任務進度條百分比
  const taskProgress = dailyTask.total > 0
    ? (dailyTask.completed / dailyTask.total) * 100
    : 0;

  // ============================================================
  // 載入中畫面
  // ============================================================
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: MibuBrand.warmWhite }}>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: MibuBrand.warmWhite }}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
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
      {/* ========== 頂部問候區 ========== */}
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>
            {t.home_greeting}
          </Text>
          <Text style={styles.greetingSubtitle}>
            {t.home_greetingSubtitle}
          </Text>
        </View>
      </View>

      {/* [HIDDEN] 送審隱藏 #9 用戶卡片（稱號+連續登入） */}
      {/* <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.avatarWithBadge}>
            {(() => {
              if (userAvatar === 'custom' && customAvatarUrl) {
                return (
                  <ExpoImage
                    source={{ uri: customAvatarUrl }}
                    style={styles.levelAvatar}
                    contentFit="cover"
                  />
                );
              }
              const avatarPreset = avatarPresets.find(a => a.id === userAvatar);
              const avatarColor = avatarPreset?.color || MibuBrand.brown;
              // 有圖片 URL 的頭像（Cloudinary）
              if (avatarPreset?.imageUrl) {
                return (
                  <View style={[styles.levelAvatar, { backgroundColor: avatarColor, overflow: 'hidden' }]}>
                    <ExpoImage
                      source={{ uri: avatarPreset.imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </View>
                );
              }
              // Fallback：首字母
              return (
                <View style={[styles.levelAvatar, { backgroundColor: avatarColor }]}>
                  <Text style={styles.avatarInitial}>
                    {user?.firstName?.charAt(0) || user?.name?.charAt(0) || '?'}
                  </Text>
                </View>
              );
            })()}
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>{userCoins.title}</Text>
          </View>
          <View style={styles.loginStreak}>
            <Text style={styles.loginStreakLabel}>
              {t.home_loginStreak}
            </Text>
            <View style={styles.loginStreakValue}>
              <Ionicons name="flame" size={16} color="#F97316" />
              <Text style={styles.loginStreakNumber}>{userCoins.loginStreak} {t.home_days}</Text>
            </View>
          </View>
        </View>
        {userPerks.canApplySpecialist && (
          <View style={styles.perksSection}>
            <View style={styles.perkItem}>
              <Ionicons name="ribbon-outline" size={16} color={MibuBrand.success} />
              <Text style={[styles.perkText, { color: MibuBrand.success }]}>
                {t.home_specialistReady}
              </Text>
            </View>
          </View>
        )}
      </View> */}

      {/* [HIDDEN] 送審隱藏 #10 每日任務卡片 */}
      {/* <TouchableOpacity
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
              {t.home_dailyTasks}
            </Text>
            <Text style={styles.taskProgress}>
              {dailyTask.completed}/{dailyTask.total} {t.home_done}
            </Text>
          </View>
        </View>
        <View style={styles.taskRight}>
          <Text style={styles.taskEarnedLabel}>{t.home_earned}</Text>
          <Text style={styles.taskEarnedCoins}>+{dailyTask.earnedCoins} {t.home_coinsUnit}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
      </TouchableOpacity>
      <View style={styles.taskProgressContainer}>
        <View style={styles.taskProgressBg}>
          <View style={[styles.taskProgressFill, { width: `${taskProgress}%` }]} />
        </View>
      </View> */}

      {/* ========== 公告卡片 ========== */}
      {events.announcements.length > 0 && (
        <View style={styles.announcementSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="megaphone-outline" size={20} color={MibuBrand.brown} />
            <Text style={styles.sectionHeaderText}>{t.home_newsTab}</Text>
          </View>
          {events.announcements.map(event => (
            <TouchableOpacity
              key={event.id}
              onPress={() => router.push(`/event/${event.id}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.announcementItem}>
                ・{getLocalizedDesc(event)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ========== 快閃活動卡片 ========== */}
      {events.limitedEvents.length > 0 && (
        <View style={styles.flashSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash" size={20} color={MibuBrand.cream} />
            <Text style={styles.flashSectionHeaderText}>{t.home_flashTab}</Text>
          </View>
          {events.limitedEvents.map(event => (
            <TouchableOpacity
              key={event.id}
              onPress={() => router.push(`/event/${event.id}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.flashItem}>
                {getLocalizedDesc(event)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ========== 在地活動卡片 ========== */}
      {events.festivals.length > 0 && (
        <View style={styles.localSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={SemanticColors.infoDark} />
            <Text style={styles.localSectionHeaderText}>{t.home_localTab}</Text>
          </View>
          {events.festivals.map(event => (
            <TouchableOpacity
              key={event.id}
              onPress={() => router.push(`/event/${event.id}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.localItem}>
                ・{getLocalizedDesc(event)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 三類活動都沒有時顯示空狀態 */}
      {events.announcements.length === 0 && events.limitedEvents.length === 0 && events.festivals.length === 0 && (
        <View style={styles.tabEmptyState}>
          <Ionicons name="megaphone-outline" size={40} color={MibuBrand.tan} />
          <Text style={styles.tabEmptyText}>
            {t.home_noAnnouncements}
          </Text>
          <Text style={styles.tabEmptySubtext}>
            {t.home_stayTuned}
          </Text>
        </View>
      )}
    </ScrollView>

    {/* #051 訪客升級提示 */}
    <UpgradePromptToast
      visible={!!guestUpgrade.activePrompt}
      message={guestUpgrade.promptMessage}
      actionLabel={guestUpgrade.promptActionLabel}
      onAction={guestUpgrade.handlePromptAction}
      onDismiss={guestUpgrade.dismissPrompt}
    />
    </SafeAreaView>
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
    paddingHorizontal: 16,
  },

  // 頂部問候區（下移避免頂部太擠、下方太空）
  header: {
    marginTop: 40,
    marginBottom: 28,
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
    color: UIColors.white,
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

  // 權益區塊（#039 新增，取代 XP 進度區）
  perksSection: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MibuBrand.warmWhite,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  perkText: {
    fontSize: 12,
    color: MibuBrand.copper,
    fontWeight: '500',
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
  taskEarnedCoins: {
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

  // 區塊共用標題
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },

  // 公告卡片
  announcementSection: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  announcementItem: {
    fontSize: 14,
    color: MibuBrand.brownDark,
    lineHeight: 22,
    marginBottom: 4,
  },

  // 快閃活動卡片（棕色深底）
  flashSection: {
    backgroundColor: MibuBrand.brown,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  flashSectionHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: MibuBrand.cream,
  },
  flashItem: {
    fontSize: 14,
    color: MibuBrand.cream,
    lineHeight: 22,
    marginBottom: 4,
  },

  // 在地活動卡片
  localSection: {
    backgroundColor: SemanticColors.infoLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: SemanticColors.infoLight,
  },
  localSectionHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: SemanticColors.infoDark,
  },
  localItem: {
    fontSize: 14,
    color: MibuBrand.brownDark,
    lineHeight: 22,
    marginBottom: 4,
  },

  // 空狀態
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

});
