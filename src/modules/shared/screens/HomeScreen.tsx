/**
 * HomeScreen - 首頁
 *
 * 功能：
 * - 用戶問候（根據語言顯示不同文字）
 * - 用戶卡片（顯示金幣餘額、稱號、權益、連續登入）
 * - 每日任務卡片（點擊跳轉 /economy）
 * - 活動 Tab 切換（公告 / 全台活動 / 限時活動）
 *
 * 資料來源（React Query hooks）：
 * - useHomeEvents() - 首頁活動（不需認證）
 * - useCoins() / usePerks() - 金幣與權益（共用 economy hooks）
 * - useDailyTasks() - 每日任務摘要（衍生自 useRules）
 *
 * @updated 2026-02-12 Phase 3 遷移至 React Query
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  canApplyPartner: boolean; // 是否可申請自己人（#053 改名）
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
// 預設活動內容（API 尚未有資料時顯示）
// ============================================================

const now = new Date().toISOString();

// 全台活動每頁最多顯示幾則，超過則左右滑切換 + 無操作時自動輪播
const MAX_VISIBLE_FESTIVALS = 6;
// 輪播間隔（毫秒）
const FESTIVAL_ROTATE_INTERVAL = 5000;

const DEFAULT_ANNOUNCEMENTS: Event[] = [
  {
    id: -1,
    type: 'announcement',
    title: '歡迎使用 Mibu 旅遊扭蛋！探索台灣各地的精彩景點',
    titleEn: 'Welcome to Mibu! Explore amazing attractions across Taiwan',
    titleJa: 'Mibu へようこそ！台湾各地の素敵なスポットを探索しよう',
    titleKo: 'Mibu에 오신 것을 환영합니다! 대만 각지의 멋진 명소를 탐험하세요',
    content: '歡迎使用 Mibu 旅遊扭蛋！探索台灣各地的精彩景點',
    description: '歡迎使用 Mibu 旅遊扭蛋！探索台灣各地的精彩景點',
    descriptionEn: 'Welcome to Mibu! Explore amazing attractions across Taiwan',
    descriptionJa: 'Mibu へようこそ！台湾各地の素敵なスポットを探索しよう',
    descriptionKo: 'Mibu에 오신 것을 환영합니다! 대만 각지의 멋진 명소를 탐험하세요',
    status: 'active',
    priority: 1,
    startDate: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: -2,
    type: 'announcement',
    title: '新功能：旅程策劃模組已上線，規劃你的完美行程',
    titleEn: 'New: Trip planner is live — plan your perfect itinerary',
    titleJa: '新機能：旅行プランナーがリリース、完璧な旅程を計画しよう',
    titleKo: '새 기능: 여행 플래너가 출시되었습니다 — 완벽한 여행을 계획하세요',
    content: '新功能：旅程策劃模組已上線，規劃你的完美行程',
    description: '新功能：旅程策劃模組已上線，規劃你的完美行程',
    descriptionEn: 'New: Trip planner is live — plan your perfect itinerary',
    descriptionJa: '新機能：旅行プランナーがリリース、完璧な旅程を計画しよう',
    descriptionKo: '새 기능: 여행 플래너가 출시되었습니다 — 완벽한 여행을 계획하세요',
    status: 'active',
    priority: 0,
    startDate: now,
    createdAt: now,
    updatedAt: now,
  },
];

const DEFAULT_LIMITED_EVENTS: Event[] = [
  {
    id: -3,
    type: 'limited',
    title: '🎁 春季限定：陽明山花季 — 收集花卉景點獲得特別優惠！',
    titleEn: '🎁 Spring special: Yangmingshan Flower Festival — collect flower spots for rewards!',
    titleJa: '🎁 春限定：陽明山花祭り — 花スポットを集めて特別特典をゲット！',
    titleKo: '🎁 봄 한정: 양밍산 꽃 축제 — 꽃 명소를 수집하고 특별 혜택을 받으세요!',
    content: '🎁 春季限定：陽明山花季 — 收集花卉景點獲得特別優惠！',
    description: '🎁 春季限定：陽明山花季 — 收集花卉景點獲得特別優惠！',
    descriptionEn: '🎁 Spring special: Yangmingshan Flower Festival — collect flower spots for rewards!',
    descriptionJa: '🎁 春限定：陽明山花祭り — 花スポットを集めて特別特典をゲット！',
    descriptionKo: '🎁 봄 한정: 양밍산 꽃 축제 — 꽃 명소를 수집하고 특별 혜택을 받으세요!',
    status: 'active',
    priority: 1,
    startDate: now,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: -4,
    type: 'limited',
    title: '🌟 本週熱門：台南古蹟巡禮 — 走訪府城經典景點',
    titleEn: '🌟 Trending: Tainan heritage tour — visit classic landmarks',
    titleJa: '🌟 今週の人気：台南古跡巡り — 府城の名所を訪ねよう',
    titleKo: '🌟 이번 주 인기: 타이난 유적 투어 — 부성의 명소를 방문하세요',
    content: '🌟 本週熱門：台南古蹟巡禮 — 走訪府城經典景點',
    description: '🌟 本週熱門：台南古蹟巡禮 — 走訪府城經典景點',
    descriptionEn: '🌟 Trending: Tainan heritage tour — visit classic landmarks',
    descriptionJa: '🌟 今週の人気：台南古跡巡り — 府城の名所を訪ねよう',
    descriptionKo: '🌟 이번 주 인기: 타이난 유적 투어 — 부성의 명소를 방문하세요',
    status: 'active',
    priority: 0,
    startDate: now,
    createdAt: now,
    updatedAt: now,
  },
];

const DEFAULT_FESTIVALS: Event[] = [
  {
    id: -5,
    type: 'festival',
    title: '🏮 2026 台灣燈會在高雄 — 元宵節限定活動開跑',
    titleEn: '🏮 2026 Taiwan Lantern Festival in Kaohsiung — Lantern Festival event starts now',
    titleJa: '🏮 2026 台湾ランタンフェスティバル in 高雄 — 元宵節イベント開催中',
    titleKo: '🏮 2026 대만 랜턴 페스티벌 in 가오슝 — 원소절 이벤트 시작',
    content: '🏮 2026 台灣燈會在高雄 — 元宵節限定活動開跑',
    description: '🏮 2026 台灣燈會在高雄 — 元宵節限定活動開跑',
    descriptionEn: '🏮 2026 Taiwan Lantern Festival in Kaohsiung — Lantern Festival event starts now',
    descriptionJa: '🏮 2026 台湾ランタンフェスティバル in 高雄 — 元宵節イベント開催中',
    descriptionKo: '🏮 2026 대만 랜턴 페스티벌 in 가오슝 — 원소절 이벤트 시작',
    city: '高雄市',
    status: 'active',
    priority: 1,
    startDate: now,
    createdAt: now,
    updatedAt: now,
  },
];

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

  const apiEvents = eventsQuery.data ?? { announcements: [], festivals: [], limitedEvents: [] };

  // 預設內容（API 尚未有資料時顯示）
  const events = {
    announcements: apiEvents.announcements.length > 0 ? apiEvents.announcements : DEFAULT_ANNOUNCEMENTS,
    festivals: apiEvents.festivals.length > 0 ? apiEvents.festivals : DEFAULT_FESTIVALS,
    limitedEvents: apiEvents.limitedEvents.length > 0 ? apiEvents.limitedEvents : DEFAULT_LIMITED_EVENTS,
  };
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
    canApplyPartner: perksData?.canApplyPartner ?? false,
  };

  // ============================================================
  // 本地狀態（非 API 資料）
  // ============================================================

  // 全台活動輪播頁碼與滑動控制
  const [festivalPage, setFestivalPage] = useState(0);
  const festivalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const festivalScrollRef = useRef<ScrollView>(null);
  const [festivalContainerWidth, setFestivalContainerWidth] = useState(0);

  // 用戶頭像設定（從 AsyncStorage 讀取）
  const [userAvatar, setUserAvatar] = useState<string>('default');
  // #038 自訂頭像 URL（上傳的照片）
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  // 頭像預設列表（從 avatarService 動態載入）
  const [avatarPresets, setAvatarPresets] = useState<AvatarPreset[]>([]);

  // 全台活動分頁與自動輪播
  const festivalTotalPages = Math.ceil(events.festivals.length / MAX_VISIBLE_FESTIVALS);
  const visibleFestivals = events.festivals.slice(
    festivalPage * MAX_VISIBLE_FESTIVALS,
    (festivalPage + 1) * MAX_VISIBLE_FESTIVALS,
  );

  // 啟動自動輪播 timer
  const startFestivalTimer = useCallback(() => {
    if (festivalTimerRef.current) {
      clearInterval(festivalTimerRef.current);
      festivalTimerRef.current = null;
    }
    if (festivalTotalPages <= 1) return;

    festivalTimerRef.current = setInterval(() => {
      setFestivalPage(prev => {
        const next = (prev + 1) % festivalTotalPages;
        if (festivalContainerWidth > 0) {
          festivalScrollRef.current?.scrollTo({ x: next * festivalContainerWidth, animated: true });
        }
        return next;
      });
    }, FESTIVAL_ROTATE_INTERVAL);
  }, [festivalTotalPages, festivalContainerWidth]);

  // 頁數或寬度改變時啟動 timer
  useEffect(() => {
    startFestivalTimer();
    return () => {
      if (festivalTimerRef.current) {
        clearInterval(festivalTimerRef.current);
        festivalTimerRef.current = null;
      }
    };
  }, [startFestivalTimer]);

  // 用戶開始手動滑動 → 暫停自動輪播（避免 timer 和手指同時搶控制 ScrollView 導致卡住）
  const handleFestivalScrollBeginDrag = useCallback(() => {
    if (festivalTimerRef.current) {
      clearInterval(festivalTimerRef.current);
      festivalTimerRef.current = null;
    }
  }, []);

  // 用戶滑動結束 → 更新頁碼 + 重啟 timer
  const handleFestivalScrollEnd = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
    if (festivalContainerWidth <= 0) return;
    const page = Math.round(e.nativeEvent.contentOffset.x / festivalContainerWidth);
    setFestivalPage(page);
    startFestivalTimer();
  }, [festivalContainerWidth, startFestivalTimer]);

  // 點擊指示點切換頁面
  const handleFestivalDotPress = useCallback((page: number) => {
    setFestivalPage(page);
    if (festivalContainerWidth > 0) {
      festivalScrollRef.current?.scrollTo({ x: page * festivalContainerWidth, animated: true });
    }
    startFestivalTimer();
  }, [festivalContainerWidth, startFestivalTimer]);

  // 資料變動時重置頁碼（避免超出範圍）
  useEffect(() => {
    if (festivalPage >= festivalTotalPages && festivalTotalPages > 0) {
      setFestivalPage(0);
      festivalScrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [festivalTotalPages, festivalPage]);

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
    const desc = event.description ?? event.content;
    if (language === 'zh-TW') return desc;
    if (language === 'en' && event.descriptionEn) return event.descriptionEn;
    return desc;
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
      directionalLockEnabled
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

      {/* #9 用戶卡片（稱號+連續登入）— 暫時隱藏，重新打包後移除 */}
      {false && <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.avatarWithBadge}>
            {(() => {
              if (userAvatar === 'custom' && customAvatarUrl) {
                return (
                  <ExpoImage
                    source={{ uri: customAvatarUrl ?? undefined }}
                    style={styles.levelAvatar}
                    contentFit="cover"
                  />
                );
              }
              const foundPreset = avatarPresets.find(a => a.id === userAvatar);
              const avatarColor = foundPreset?.color || MibuBrand.brown;
              const presetImageUrl = foundPreset?.imageUrl;
              // 有圖片 URL 的頭像（Cloudinary）
              if (presetImageUrl) {
                return (
                  <View style={[styles.levelAvatar, { backgroundColor: avatarColor, overflow: 'hidden' }]}>
                    <ExpoImage
                      source={{ uri: presetImageUrl }}
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
        {userPerks.canApplyPartner && (
          <View style={styles.perksSection}>
            <View style={styles.perkItem}>
              <Ionicons name="ribbon-outline" size={16} color={MibuBrand.success} />
              <Text style={[styles.perkText, { color: MibuBrand.success }]}>
                {t.home_partnerReady}
              </Text>
            </View>
          </View>
        )}
      </View>}

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
              onPress={event.id > 0 ? () => router.push(`/event/${event.id}`) : undefined}
              activeOpacity={event.id > 0 ? 0.8 : 1}
            >
              <Text style={styles.announcementItem}>
                ・{getLocalizedTitle(event)}
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
              onPress={event.id > 0 ? () => router.push(`/event/${event.id}`) : undefined}
              activeOpacity={event.id > 0 ? 0.8 : 1}
            >
              <Text style={styles.flashItem}>
                {getLocalizedTitle(event)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ========== 全台活動卡片（最多 6 則/頁，左右滑 + 自動輪播）========== */}
      {events.festivals.length > 0 && (
        <View
          style={styles.localSection}
          onLayout={(e) => {
            // localSection 有 padding: 20，ScrollView 可見寬度 = 外層寬度 - 左右 padding
            const innerWidth = e.nativeEvent.layout.width - 40;
            if (innerWidth > 0) setFestivalContainerWidth(innerWidth);
          }}
        >
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={MibuBrand.copper} />
            <Text style={styles.localSectionHeaderText}>{t.home_localTab}</Text>
          </View>
          {festivalTotalPages > 1 && festivalContainerWidth > 0 ? (
            <ScrollView
              ref={festivalScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScrollBeginDrag={handleFestivalScrollBeginDrag}
              onMomentumScrollEnd={handleFestivalScrollEnd}
              scrollEventThrottle={16}
              nestedScrollEnabled
              directionalLockEnabled
            >
              {Array.from({ length: festivalTotalPages }, (_, pageIdx) => {
                const pageItems = events.festivals.slice(
                  pageIdx * MAX_VISIBLE_FESTIVALS,
                  (pageIdx + 1) * MAX_VISIBLE_FESTIVALS,
                );
                return (
                  <View key={pageIdx} style={{ width: festivalContainerWidth }}>
                    {pageItems.map(event => (
                      <TouchableOpacity
                        key={event.id}
                        onPress={event.id > 0 ? () => router.push(`/event/${event.id}`) : undefined}
                        activeOpacity={event.id > 0 ? 0.8 : 1}
                      >
                        <Text style={styles.localItem}>
                          ・{getLocalizedTitle(event)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            // 只有一頁時不需要 ScrollView
            visibleFestivals.map(event => (
              <TouchableOpacity
                key={event.id}
                onPress={event.id > 0 ? () => router.push(`/event/${event.id}`) : undefined}
                activeOpacity={event.id > 0 ? 0.8 : 1}
              >
                <Text style={styles.localItem}>
                  ・{getLocalizedTitle(event)}
                </Text>
              </TouchableOpacity>
            ))
          )}
          {festivalTotalPages > 1 && (
            <View style={styles.festivalPagination}>
              {Array.from({ length: festivalTotalPages }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleFestivalDotPress(i)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <View
                    style={[
                      styles.festivalDot,
                      i === festivalPage && styles.festivalDotActive,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
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

  // 全台活動卡片
  localSection: {
    backgroundColor: MibuBrand.cream,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  localSectionHeaderText: {
    fontSize: 18,
    fontWeight: '800',
    color: MibuBrand.brownDark,
  },
  localItem: {
    fontSize: 14,
    color: MibuBrand.brownDark,
    lineHeight: 22,
    marginBottom: 4,
  },
  festivalPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  festivalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: MibuBrand.tanLight,
  },
  festivalDotActive: {
    backgroundColor: MibuBrand.copper,
    width: 8,
    height: 8,
    borderRadius: 4,
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
