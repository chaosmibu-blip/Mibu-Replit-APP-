/**
 * GachaScreen - 扭蛋主頁面
 *
 * 功能：
 * - 選擇國家 → 選擇城市/地區
 * - 調整扭蛋次數（5~12 張）
 * - 檢查道具箱容量
 * - 執行扭蛋抽卡
 * - 顯示獎池預覽（SP/SSR 優惠券）
 * - 新手教學引導
 *
 * 串接 API：
 * - apiService.getCountries() - 國家列表
 * - apiService.getRegions() - 城市列表
 * - apiService.getInventoryCapacity() - 道具箱容量
 * - apiService.generateItinerary() - 核心扭蛋抽卡
 * - apiService.getGachaPool() - 獎池預覽
 * - apiService.getRegionCouponPool() - 區域優惠券池
 * - apiService.getPrizePool() - 獎品池
 * - apiService.getRarityConfig() - 稀有度機率
 *
 * 跳轉頁面：
 * - /(tabs)/gacha/items - 扭蛋結果
 * - /login - 未登入時
 * - /crowdfunding - 解鎖全球地圖
 * - /(tabs)/collection/itembox - 道具箱已滿時
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../shared/components/ui/Button';
import { Select } from '../../shared/components/ui/Select';
import { LoadingAdScreen } from '../../shared/components/LoadingAdScreen';
import { TutorialOverlay, GACHA_TUTORIAL_STEPS } from '../../shared/components/TutorialOverlay';
import { apiService } from '../../../services/api';
import { preloadService } from '../../../services/preloadService';
import { gachaApi, getDeviceId } from '../../../services/gachaApi';
import { Country, Region, GachaItem, GachaPoolItem, GachaPoolResponse, RegionPoolCoupon, PrizePoolCoupon, PrizePoolResponse, ItineraryItemRaw, LocalizedContent, GachaMeta, CouponWon } from '../../../types';
import { getCategoryColor } from '../../../constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';
import { ErrorCode, isAuthError } from '../../../shared/errors';
import { ApiError } from '../../../services/base';
import { ErrorState } from '../../shared/components/ui/ErrorState';

// ============================================================
// 常數定義
// ============================================================

// #043: 移除 UNLIMITED_EMAILS 硬編碼白名單，改用後端 isSuperAdmin 判斷
import { STORAGE_KEYS } from '../../../constants/storageKeys';

// 螢幕寬度（用於計算獎池項目寬度）
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 稀有度對應顏色
 * SP = 金色（最稀有）
 * SSR = 紫銅色
 * SR = 深銅色
 * S = 淺銅色
 * R = 米黃色
 * N = 一般
 */
const RARITY_COLORS: Record<string, string> = {
  SP: MibuBrand.tierSP,
  SSR: MibuBrand.tierSSR,
  SR: MibuBrand.tierSR,
  S: MibuBrand.tierS,
  R: MibuBrand.tierR,
  N: MibuBrand.tan,
};

/**
 * 稀有度對應背景色
 */
const RARITY_BG_COLORS: Record<string, string> = {
  SP: MibuBrand.tierSPBg,
  SSR: MibuBrand.tierSSRBg,
  SR: MibuBrand.tierSRBg,
  S: MibuBrand.tierSBg,
  R: MibuBrand.tierRBg,
  N: MibuBrand.creamLight,
};

// ============================================================
// 主元件
// ============================================================

export function GachaScreen() {
  // ============================================================
  // Hooks & Context
  // ============================================================
  const router = useRouter();
  const { state, t, addToCollection, setResult, getToken, setUser } = useApp();

  // ============================================================
  // 狀態管理 - 選擇區域
  // ============================================================

  // 國家列表 & 載入狀態
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  // 國家載入錯誤狀態
  const [countriesError, setCountriesError] = useState(false);

  // 城市/地區列表 & 載入狀態
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // 選中的國家 ID 和城市 ID
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

  // 扭蛋次數（預設 5，範圍 5~12）
  const [pullCount, setPullCount] = useState(5);

  // ============================================================
  // 狀態管理 - 獎池預覽 Modal
  // ============================================================

  const [poolModalVisible, setPoolModalVisible] = useState(false);
  const [poolData, setPoolData] = useState<GachaPoolResponse | null>(null);
  const [loadingPool, setLoadingPool] = useState(false);
  const [couponPoolData, setCouponPoolData] = useState<RegionPoolCoupon[]>([]);
  const [prizePoolData, setPrizePoolData] = useState<PrizePoolResponse | null>(null);

  // ============================================================
  // 狀態管理 - 扭蛋載入畫面
  // ============================================================

  // 是否顯示載入畫面
  const [showLoadingAd, setShowLoadingAd] = useState(false);

  // API 是否已完成（用於控制載入畫面結束時機）
  const [isApiComplete, setIsApiComplete] = useState(false);

  // 暫存扭蛋結果（等待載入動畫結束後顯示）
  const pendingResultRef = useRef<{ items: GachaItem[]; meta: GachaMeta; couponsWon: CouponWon[] } | null>(null);

  // ============================================================
  // 狀態管理 - 機率說明 Modal（目前隱藏）
  // ============================================================

  const [rarityModalVisible, setRarityModalVisible] = useState(false);
  const [rarityConfig, setRarityConfig] = useState<{ rarity: string; probability: number }[]>([]);
  const [loadingRarity, setLoadingRarity] = useState(false);

  // ============================================================
  // 狀態管理 - 扭蛋說明 Tooltip（淡入淡出）
  // ============================================================

  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const infoTooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 卸載時清理 tooltip timer */
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, []);

  /**
   * 顯示扭蛋說明 tooltip，3 秒後自動淡出
   */
  const showGachaInfoTooltip = useCallback(() => {
    // 清理前一個 timer（防止重複觸發累積）
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    setShowInfoTooltip(true);
    // 淡入
    Animated.timing(infoTooltipOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // 3 秒後淡出
      tooltipTimerRef.current = setTimeout(() => {
        Animated.timing(infoTooltipOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowInfoTooltip(false);
        });
        tooltipTimerRef.current = null;
      }, 3000);
    });
  }, [infoTooltipOpacity]);

  // ============================================================
  // 狀態管理 - 道具箱容量
  // ============================================================

  const [inventorySlotCount, setInventorySlotCount] = useState(0);   // 已使用格數
  const [inventoryMaxSlots, setInventoryMaxSlots] = useState(30);    // 最大格數

  // 道具箱是否已滿
  const isInventoryFull = inventorySlotCount >= inventoryMaxSlots;

  // 剩餘格數
  const inventoryRemaining = inventoryMaxSlots - inventorySlotCount;

  // ============================================================
  // 初始化載入
  // ============================================================

  useEffect(() => {
    loadCountries();         // 載入國家列表
    checkInventoryCapacity(); // 檢查道具箱容量
  }, []);

  /**
   * 檢查道具箱容量
   * 優先使用 capacity API，失敗則 fallback 到 getInventory
   */
  const checkInventoryCapacity = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      try {
        // 嘗試使用新的 capacity API
        const capacity = await apiService.getInventoryCapacity(token);
        setInventorySlotCount(capacity.used);
        setInventoryMaxSlots(capacity.max);
      } catch {
        // Fallback: 使用 getInventory API 計算
        const data = await apiService.getInventory(token);
        const activeItems = (data.items || []).filter((i: { isDeleted?: boolean; status?: string }) => !i.isDeleted && i.status !== 'deleted');
        setInventorySlotCount(activeItems.length);
        setInventoryMaxSlots(data.maxSlots || 30);
      }
    } catch (error) {
      console.error('Failed to check inventory capacity:', error);
    }
  };

  /**
   * 當選擇國家時，自動載入該國家的城市列表
   */
  useEffect(() => {
    if (selectedCountryId) {
      loadRegions(selectedCountryId);
    }
  }, [selectedCountryId]);

  /**
   * 載入國家列表
   */
  const loadCountries = async () => {
    try {
      setCountriesError(false);
      // 使用預載入快取，避免重複請求
      const data = await preloadService.getCountries();
      setCountries(data);
    } catch (error) {
      console.error('🌍 Failed to load countries:', error);
      setCountriesError(true);
    } finally {
      setLoadingCountries(false);
    }
  };

  /**
   * 載入指定國家的城市列表
   * 設定 10 秒 timeout 防止卡住
   *
   * 【截圖 3】加入 debug log（🏙️ 前綴）方便追蹤城市載入問題
   * - Loading: 開始載入
   * - Loaded: 載入成功，顯示數量
   * - Failed: 載入失敗
   */
  const loadRegions = async (countryId: number) => {
    setLoadingRegions(true);
    setRegions([]); // 清空舊資料

    try {
      // 設定 10 秒 timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      // 使用預載入快取，避免重複請求
      const data = await Promise.race([
        preloadService.getRegions(countryId),
        timeoutPromise,
      ]);
      setRegions(data);
    } catch (error) {
      console.error('🏙️ Failed to load regions:', error);
      setRegions([]); // 確保 regions 為空，讓 UI 顯示「暫無選項」
    } finally {
      setLoadingRegions(false);
    }
  };

  // ============================================================
  // 輔助函數 - 多語言
  // ============================================================

  /**
   * 取得國家/城市的在地化名稱
   * 根據當前語言返回對應名稱
   */
  const getLocalizedName = (item: Country | Region): string => {
    const lang = state.language;
    if (lang === 'zh-TW') return item.nameZh || item.nameEn || '';
    if (lang === 'ja') return item.nameJa || item.nameEn || '';
    if (lang === 'ko') return item.nameKo || item.nameEn || '';
    return item.nameEn || '';
  };

  /**
   * 取得獎池項目的在地化名稱
   * 支援字串或 LocalizedContent 物件
   */
  const getLocalizedPoolItemName = (name: LocalizedContent | string): string => {
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name !== null) {
      return name[state.language] || name['zh-TW'] || name['en'] || '';
    }
    return '';
  };

  // ============================================================
  // 每日次數限制
  // ============================================================

  /**
   * 檢查是否還有每日扭蛋額度
   *
   * #043: 改用後端 API 判斷，移除前端本地追蹤
   * - 超管 isSuperAdmin → 無限
   * - 一般用戶 → 呼叫 getQuota() 檢查後端額度
   * - API 失敗 → 放行（讓後端在抽取時擋）
   *
   * 限額單位是「卡片張數」（36 張），不是生成次數
   */
  const checkDailyLimit = async (): Promise<boolean> => {
    // 超級管理員不限次數（後端 isSuperAdmin 判斷，不用 email）
    if (state.user?.isSuperAdmin) {
      return true;
    }

    try {
      const token = await getToken();
      if (!token) return true; // 未登入讓後續流程處理

      const quota = await gachaApi.getQuota(token);
      // dailyLimit === -1 表示無限（超管或特殊權益）
      if (quota.dailyLimit === -1) return true;
      // remaining > 0 才允許抽
      if (quota.remaining !== undefined && quota.remaining <= 0) return false;
      return true;
    } catch {
      // API 失敗時放行，讓後端在實際抽取時擋
      return true;
    }
  };

  // ============================================================
  // 獎池預覽 & 機率說明
  // ============================================================

  /**
   * 查看機率說明（目前隱藏）
   * 從後端取得各稀有度的機率配置
   */
  const handleViewRarity = async () => {
    setRarityModalVisible(true);
    setLoadingRarity(true);

    try {
      const result = apiService.getRarityConfig();
      // getRarityConfig 返回 { SP: { rate, color }, SSR: { rate, color }, ... }
      // 依機率高到低排序
      const probArray = [
        { rarity: 'R', probability: result.R.rate },
        { rarity: 'S', probability: result.S.rate },
        { rarity: 'SR', probability: result.SR.rate },
        { rarity: 'SSR', probability: result.SSR.rate },
        { rarity: 'SP', probability: result.SP.rate },
      ].sort((a, b) => b.probability - a.probability);
      setRarityConfig(probArray);
    } catch (error) {
      console.error('Failed to load rarity config:', error);
      // 使用預設值
      setRarityConfig([
        { rarity: 'R', probability: 32 },
        { rarity: 'S', probability: 23 },
        { rarity: 'SR', probability: 15 },
        { rarity: 'SSR', probability: 8 },
        { rarity: 'SP', probability: 2 },
      ]);
    } finally {
      setLoadingRarity(false);
    }
  };

  /**
   * 查看獎池預覽
   * 載入該區域的景點池、優惠券池、獎品池
   */
  const handleViewPool = async () => {
    if (!selectedRegionId) return;

    const selectedRegion = regions.find(r => r.id === selectedRegionId);
    if (!selectedRegion) return;

    setLoadingPool(true);
    setPoolModalVisible(true);
    setPoolData(null);
    setCouponPoolData([]);
    setPrizePoolData(null);

    try {
      const city = selectedRegion.nameZh || selectedRegion.nameEn || '';
      const token = await getToken();

      // 並行載入三種獎池資料
      const [poolResult, couponResult, prizePoolResult] = await Promise.allSettled([
        apiService.getGachaPool(city),
        token ? apiService.getRegionCouponPool(token, selectedRegionId) : Promise.resolve([]),
        apiService.getPrizePool(selectedRegionId)
      ]);

      if (poolResult.status === 'fulfilled') {
        setPoolData(poolResult.value);
      }
      if (couponResult.status === 'fulfilled') {
        const couponData = couponResult.value as RegionPoolCoupon[] | { coupons: RegionPoolCoupon[] };
        setCouponPoolData(Array.isArray(couponData) ? couponData : (couponData?.coupons || []));
      }
      if (prizePoolResult.status === 'fulfilled') {
        setPrizePoolData(prizePoolResult.value);
      }
    } catch (error) {
      console.error('Failed to load pool:', error);
      setPoolData(null);
    } finally {
      setLoadingPool(false);
    }
  };

  // ============================================================
  // 核心：執行扭蛋
  // ============================================================

  /**
   * 執行扭蛋抽卡
   * 這是整個扭蛋流程的核心函數
   */
  const handleGacha = async () => {
    // 檢查是否已選擇國家和城市
    if (!selectedCountryId || !selectedRegionId) return;

    // 檢查是否有 Token（訪客登入沒有 Token）
    const token = await getToken();
    if (!token) {
      Alert.alert(
        t.gacha_loginRequired,
        t.gacha_loginRequiredDesc,
        [
          { text: t.cancel, style: 'cancel' },
          { text: t.gacha_goToLogin, onPress: () => router.push('/login') },
        ]
      );
      return;
    }

    // 檢查每日次數限制
    const canPull = await checkDailyLimit();
    if (!canPull) {
      Alert.alert(t.dailyLimitReached, t.dailyLimitReachedDesc);
      return;
    }

    // 顯示載入畫面
    setShowLoadingAd(true);
    setIsApiComplete(false);
    pendingResultRef.current = null;

    try {
      const selectedRegion = regions.find(r => r.id === selectedRegionId);
      // #031: 取得裝置識別碼用於防刷機制
      const deviceId = await getDeviceId();

      // ========== 呼叫 V2 API ==========
      const response = await gachaApi.pullGachaV2({
        regionId: selectedRegionId,
        count: pullCount,
        deviceId,
      }, token);

      // ========== 錯誤處理 ==========
      if (!response.success) {
        setShowLoadingAd(false);
        Alert.alert(t.common_notice, t.common_errorTryAgain);
        return;
      }

      // ========== 處理額度不足 ==========
      if (response.meta?.remainingQuota !== undefined && response.meta.remainingQuota < 0) {
        setShowLoadingAd(false);
        Alert.alert(t.dailyLimitReached, t.dailyLimitReachedDesc);
        return;
      }

      // ========== 處理空結果 ==========
      const cards = response.cards || [];
      if (cards.length === 0) {
        setShowLoadingAd(false);
        Alert.alert(t.common_notice, t.gacha_noPlacesInArea);
        return;
      }

      // ========== 轉換 V2 API 回應為 GachaItem ==========
      // V2 API 回傳 cards[] 格式，需要映射到前端 GachaItem 格式
      // - V2: { cards: [{ type, place, coupon, isNew }], meta: {...} }
      // - 前端: GachaItem[] with placeName, category, couponData, etc.

      // 1. 提取獲得的優惠券（用於結果頁顯示）
      const couponsWon: CouponWon[] = cards
        .filter(card => card.coupon)
        .map(card => ({
          tier: (card.coupon!.rarity || 'R') as CouponWon['tier'],
          placeName: card.place.placeName,
          couponName: card.coupon!.title,
        }));

      // 2. 將 V2 cards 轉換為 GachaItem 格式
      const items = cards.map((card, index: number) => {
        const place = card.place;
        const hasCoupon = !!card.coupon;

        return {
          id: place.id || Date.now() + index,
          placeName: place.placeName,
          description: place.description || '',
          category: place.category || '',
          subcategory: place.subcategory || null,
          address: place.address || null,
          rating: place.rating || null,
          locationLat: place.locationLat || null,
          locationLng: place.locationLng || null,
          location: place.locationLat && place.locationLng
            ? { lat: place.locationLat, lng: place.locationLng }
            : null,
          googlePlaceId: place.googlePlaceId || null,
          country: '',
          city: response.meta?.city || '',
          cityDisplay: response.meta?.city || '',
          district: response.meta?.district || '',
          districtDisplay: response.meta?.district || '',
          collectedAt: new Date().toISOString(),
          isCoupon: hasCoupon,
          couponData: card.coupon ? {
            id: card.coupon.id,
            title: card.coupon.title,
            code: card.coupon.code,
            terms: card.coupon.terms,
            rarity: card.coupon.rarity,
          } : null,
          rarity: card.coupon?.rarity || 'N',
        };
      }) as GachaItem[];

      // #043: 不再前端追蹤每日計數，由後端管理額度

      // ========== 暫存結果，等待載入動畫結束 ==========
      pendingResultRef.current = {
        items,
        meta: {
          date: new Date().toISOString().split('T')[0],
          country: '',
          city: response.meta?.city || '',
          lockedDistrict: response.meta?.district || '',
          userLevel: pullCount,
          couponsWon: response.meta?.couponCount || couponsWon.length,
          dailyPullCount: response.meta?.dailyPullCount,
          remainingQuota: response.meta?.remainingQuota,
        },
        couponsWon,
      };

      // 注意：V2 API 不支援成就解鎖通知，成就功能需另外處理

      // 標記 API 完成，讓載入畫面知道可以結束了
      setIsApiComplete(true);

    } catch (error) {
      // ========== 錯誤處理 ==========
      const errorMessage = error instanceof Error ? error.message : String(error);

      // 檢查是否為用戶主動取消
      const isUserAbort = errorMessage.includes('Network request failed') ||
                          errorMessage.includes('AbortError') ||
                          errorMessage.includes('cancelled');

      if (isUserAbort) {
        setShowLoadingAd(false);
        return;
      }

      console.error('Gacha failed:', error);
      setShowLoadingAd(false);

      // 依據錯誤類型顯示對應訊息
      if (error instanceof ApiError && error.status === 429) {
        // 429 限速：操作太頻繁
        Alert.alert(t.common_notice, t.gacha_rateLimited);
      } else if (error instanceof ApiError && error.status === 401) {
        // 401 認證過期：導向重新登入
        Alert.alert(t.gacha_loginRequired, t.gacha_loginRequiredDesc, [
          { text: t.cancel, style: 'cancel' },
          { text: t.gacha_goToLogin, onPress: () => router.push('/login') },
        ]);
      } else {
        Alert.alert(t.common_error, t.gacha_generationFailed);
      }
    }
  };

  /**
   * 載入動畫結束後的處理
   * 將暫存的結果加入收藏，並跳轉到結果頁
   */
  const handleLoadingComplete = useCallback(() => {
    if (pendingResultRef.current) {
      const { items, meta } = pendingResultRef.current;

      // 加入收藏
      addToCollection(items);

      // 設定結果（供 ItemsScreen 讀取）
      setResult({
        status: 'success',
        meta,
        inventory: items,
      });

      setShowLoadingAd(false);

      // 跳轉到結果頁
      router.push('/(tabs)/gacha/items');
    }
  }, [addToCollection, setResult, router]);

  // ============================================================
  // 下拉選單選項
  // ============================================================

  // 國家選項
  const countryOptions = countries.map(c => ({
    label: getLocalizedName(c),
    value: c.id,
  }));

  // 城市選項
  const regionOptions = regions.map(r => ({
    label: getLocalizedName(r),
    value: r.id,
  }));

  // 是否可以提交（已選國家、城市，且道具箱未滿）
  const canSubmit = selectedCountryId && selectedRegionId && !isInventoryFull;

  // ============================================================
  // 獎池項目渲染
  // ============================================================

  /**
   * 渲染單個獎池項目
   */
  const renderPoolItem = ({ item }: { item: GachaPoolItem }) => {
    const rarity = item.rarity || 'N';
    const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.N;
    const rarityBg = RARITY_BG_COLORS[rarity] || RARITY_BG_COLORS.N;

    return (
      <View
        style={{
          width: (SCREEN_WIDTH - 60) / 2,
          backgroundColor: UIColors.white,
          borderRadius: 16,
          marginBottom: 12,
          marginHorizontal: 6,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: rarityBg,
        }}
      >
        {/* 圖片區 */}
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', height: 100 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 100,
              backgroundColor: getCategoryColor(item.category),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="location" size={32} color={UIColors.white} />
          </View>
        )}

        {/* 資訊區 */}
        <View style={{ padding: 12 }}>
          {/* 稀有度 + 分類 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View
              style={{
                backgroundColor: rarityBg,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 8,
                marginRight: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: rarityColor }}>
                {rarity}
              </Text>
            </View>
            <Text
              style={{ fontSize: 10, color: getCategoryColor(item.category), fontWeight: '600' }}
              numberOfLines={1}
            >
              {item.category}
            </Text>
          </View>

          {/* 名稱 */}
          <Text
            style={{ fontSize: 13, fontWeight: '700', color: MibuBrand.dark }}
            numberOfLines={2}
          >
            {getLocalizedPoolItemName(item.name)}
          </Text>

          {/* 商家標籤 */}
          {item.merchant && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 6,
                backgroundColor: SemanticColors.starBg,
                paddingHorizontal: 6,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Ionicons name="star" size={10} color={SemanticColors.starYellow} />
              <Text style={{ fontSize: 10, color: SemanticColors.warningDark, marginLeft: 4, fontWeight: '600' }}>
                {t.merchant || '特約商家'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  /**
   * 取得 Jackpot 項目（大獎）
   */
  const getJackpotItems = () => {
    if (!poolData?.pool?.jackpots) return [];
    return poolData.pool.jackpots;
  };

  // 取得選中的國家和城市名稱（用於顯示）
  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  const selectedRegion = regions.find(r => r.id === selectedRegionId);
  const countryName = selectedCountry ? getLocalizedName(selectedCountry) : '';
  const regionName = selectedRegion ? getLocalizedName(selectedRegion) : '';

  // ============================================================
  // 主畫面渲染
  // ============================================================

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MibuBrand.warmWhite }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
    >
      {/* ========== 頂部 Logo 區 ========== */}
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: MibuBrand.brown, letterSpacing: 3 }}>
          MIBU
        </Text>
        <Text style={{ fontSize: 15, color: MibuBrand.brownLight, marginTop: 6, fontWeight: '500' }}>
          {t.appSubtitle}
        </Text>
      </View>

      {/* ========== 國家載入錯誤提示 ========== */}
      {countriesError && countries.length === 0 && (
        <ErrorState
          icon="globe-outline"
          message={t.gacha_loadRegionsFailed}
          detail={t.gacha_loadRegionsRetry}
          onRetry={loadCountries}
        />
      )}

      {/* ========== 選擇區域卡片 ========== */}
      <View style={{
        backgroundColor: MibuBrand.creamLight,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: MibuBrand.tanLight,
        shadowColor: MibuBrand.brown,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
      }}>
        {/* 標題 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Ionicons name="globe-outline" size={20} color={MibuBrand.copper} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.brown, marginLeft: 8 }}>
            {t.gacha_selectExploreRegion}
          </Text>
        </View>

        {/* 國家下拉選單 */}
        <Select
          label={t.gacha_countryLabel}
          options={countryOptions}
          value={selectedCountryId}
          onChange={(value) => {
            const newCountryId = value as number;

            // 如果選擇相同的國家，不做任何處理
            // 避免 loadingRegions 被設為 true 但 useEffect 不觸發的問題
            if (newCountryId === selectedCountryId) {
              return;
            }

            setSelectedCountryId(newCountryId);
            setSelectedRegionId(null);
            setRegions([]);
            // 【截圖 3 修復】立即設定 loading 狀態
            // 問題：選擇國家後，城市選單開啟會短暫顯示「暫無選項」
            // 原因：setRegions([]) 清空資料後，useEffect 的 loadRegions 還沒執行
            //       造成 loadingRegions=false 且 regions=[] 的短暫狀態
            // 解法：在這裡立即設定 loadingRegions=true，讓城市選單顯示「載入中...」
            setLoadingRegions(true);
          }}
          placeholder={t.selectCountry}
          loading={loadingCountries}
          // [HIDDEN] 送審隱藏 #11 解鎖全球地圖 CTA
          // footerContent={(closeModal) => (
          //   <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 8 }}>
          //     <Text style={{ fontSize: 15, color: MibuBrand.copper, lineHeight: 24, textAlign: 'center' }}>
          //       {state.language === 'zh-TW'
          //         ? '我們正在努力增加更多國家\n現在你也可以一起幫助我們！'
          //         : 'We\'re working on adding more countries.\nNow you can help us too!'}
          //     </Text>
          //     <TouchableOpacity
          //       onPress={() => {
          //         closeModal();
          //         router.push('/crowdfunding');
          //       }}
          //       style={{
          //         flexDirection: 'row',
          //         alignItems: 'center',
          //         marginTop: 16,
          //         backgroundColor: MibuBrand.brown,
          //         paddingVertical: 10,
          //         paddingHorizontal: 14,
          //         borderRadius: 10,
          //       }}
          //     >
          //       <Ionicons name="globe-outline" size={16} color={MibuBrand.warmWhite} />
          //       <Text style={{ fontSize: 13, fontWeight: '700', color: MibuBrand.warmWhite, marginLeft: 6 }}>
          //         {state.language === 'zh-TW' ? '解鎖全球地圖' : 'Unlock Global Map'}
          //       </Text>
          //     </TouchableOpacity>
          //   </View>
          // )}
        />

        {/* 城市下拉選單（選擇國家後才顯示） */}
        {selectedCountryId && (
          <View style={{ marginTop: 12 }}>
            <Select
              label={t.gacha_cityRegionLabel}
              options={regionOptions}
              value={selectedRegionId}
              onChange={(value) => {
                setSelectedRegionId(value as number);
              }}
              placeholder={t.selectRegion}
              loading={loadingRegions}
            />
          </View>
        )}
      </View>

      {/* ========== 抽取張數卡片（選擇城市後才顯示）========== */}
      {selectedRegionId && (
        <View style={{
          backgroundColor: MibuBrand.creamLight,
          borderRadius: 24,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: MibuBrand.tanLight,
          shadowColor: MibuBrand.brown,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
        }}>
          {/* 標題行：扭蛋次數 + 說明按鈕 + 數字顯示 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: MibuBrand.copper }}>
                {t.gacha_pullCountLabel}
              </Text>
              {/* 說明按鈕（點擊顯示 Tooltip） */}
              <TouchableOpacity
                onPress={showGachaInfoTooltip}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{
                  marginLeft: 6,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: MibuBrand.tan,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: MibuBrand.warmWhite }}>!</Text>
              </TouchableOpacity>
              {/* Tooltip（淡入淡出）
                  - 取代原本的 Alert.alert 彈窗
                  - 點擊 ! 按鈕後顯示 3 秒自動淡出
                  - 顯示在標題行上方，避免擋住滑桿 */}
              {showInfoTooltip && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: '100%',  // 完全顯示在父容器上方
                    marginBottom: 6,
                    backgroundColor: 'rgba(128, 128, 128, 0.5)',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    opacity: infoTooltipOpacity,
                    zIndex: 10,
                    minWidth: 180,
                  }}
                >
                  <Text style={{ fontSize: 13, color: UIColors.white, fontWeight: '500' }}>
                    {t.gacha_dailyLimitInfo}
                  </Text>
                </Animated.View>
              )}
            </View>
            {/* 當前選擇的次數 */}
            <Text style={{ fontSize: 28, fontWeight: '800', color: MibuBrand.brownDark }}>
              {pullCount} <Text style={{ fontSize: 16, fontWeight: '600' }}>{t.gacha_pullUnit}</Text>
            </Text>
          </View>

          {/* Slider 滑桿 */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{ flex: 1 }}>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={5}
                maximumValue={12}
                step={1}
                value={pullCount}
                onValueChange={(value) => setPullCount(Math.round(value))}
                minimumTrackTintColor={MibuBrand.brown}
                maximumTrackTintColor={MibuBrand.tanLight}
                thumbTintColor={MibuBrand.brown}
              />
            </View>
          </View>

          {/* 範圍標籤 */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 13, color: MibuBrand.tan }}>5</Text>
            <Text style={{ fontSize: 13, color: MibuBrand.tan }}>12</Text>
          </View>
        </View>
      )}

      {/* ========== 道具箱已滿警告 ========== */}
      {isInventoryFull && (
        <View style={{
          backgroundColor: SemanticColors.errorLight,
          borderRadius: 20,
          padding: 18,
          marginBottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: SemanticColors.errorLight,
        }}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: SemanticColors.errorLight,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="warning" size={22} color={SemanticColors.errorDark} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: SemanticColors.errorDark }}>
              {t.gacha_itemBoxFull}
            </Text>
            <Text style={{ fontSize: 13, color: SemanticColors.errorDark, marginTop: 2 }}>
              {t.gacha_itemBoxFullDesc}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/collection' as any)}
            style={{
              backgroundColor: SemanticColors.errorDark,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: UIColors.white }}>
              {t.gacha_goTo}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ========== 道具箱快滿提醒（剩餘 5 格以內）========== */}
      {!isInventoryFull && inventoryRemaining <= 5 && inventoryRemaining > 0 && (
        <View style={{
          backgroundColor: MibuBrand.highlight,
          borderRadius: 20,
          padding: 16,
          marginBottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Ionicons name="alert-circle" size={20} color={MibuBrand.copper} />
          <Text style={{ fontSize: 14, color: MibuBrand.brown, marginLeft: 10, flex: 1 }}>
            {t.gacha_slotsRemaining.replace('{count}', String(inventoryRemaining))}
          </Text>
        </View>
      )}

      {/* ========== 開始扭蛋按鈕 ========== */}
      <TouchableOpacity
        style={{
          backgroundColor: (!canSubmit || showLoadingAd) ? MibuBrand.cream : MibuBrand.brown,
          borderRadius: 24,
          height: 64,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: MibuBrand.brown,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: (!canSubmit || showLoadingAd) ? 0 : 0.25,
          shadowRadius: 16,
          elevation: (!canSubmit || showLoadingAd) ? 0 : 8,
          marginBottom: 24,
        }}
        onPress={handleGacha}
        disabled={!canSubmit || showLoadingAd}
        accessibilityLabel={t.gacha_startGachaExcl}
      >
        <Text style={{
          fontSize: 20,
          fontWeight: '800',
          color: (!canSubmit || showLoadingAd) ? MibuBrand.brownLight : MibuBrand.warmWhite,
          letterSpacing: 1,
        }}>
          {isInventoryFull ? t.gacha_itemBoxFull : t.gacha_startGachaExcl}
        </Text>
      </TouchableOpacity>

      {/* TODO: 商家端開放後取消註解顯示機率說明按鈕
        <TouchableOpacity
          onPress={handleViewRarity}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 16,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }}
        >
          <Ionicons name="information-circle-outline" size={18} color="#6366f1" />
          <Text style={{ fontSize: 14, color: '#6366f1', marginLeft: 6, fontWeight: '600' }}>
            {t.gacha_probabilityInfo}
          </Text>
        </TouchableOpacity>
      */}

      {/* ========== 獎池預覽 Modal ========== */}
      <Modal
        visible={poolModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPoolModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: UIColors.overlayMedium,
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: UIColors.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '85%',
              minHeight: '60%',
            }}
          >
            {/* Modal 標題列 */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: MibuBrand.creamLight,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: MibuBrand.dark }}>
                {t.poolPreview || '獎池預覽'}
              </Text>
              <TouchableOpacity
                onPress={() => setPoolModalVisible(false)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: MibuBrand.creamLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color={MibuBrand.tan} />
              </TouchableOpacity>
            </View>

            {/* Modal 內容 */}
            {loadingPool ? (
              // 載入中
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={{ marginTop: 16, color: MibuBrand.tan, fontSize: 14 }}>
                  {t.loadingPool || '載入獎池中...'}
                </Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* 有優惠券：顯示列表 */}
                {((prizePoolData?.coupons?.length || 0) > 0 || (Array.isArray(couponPoolData) ? couponPoolData.length : 0) > 0) ? (
                  <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}>
                    {/* 區域名稱 */}
                    {(prizePoolData?.region?.name || poolData?.pool?.city) && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="location" size={16} color="#6366f1" />
                        <Text style={{ fontSize: 13, color: '#6366f1', marginLeft: 6, fontWeight: '600' }}>
                          {prizePoolData?.region?.name || poolData?.pool?.city}
                        </Text>
                      </View>
                    )}

                    {/* 標題：SP/SSR 稀有優惠券 */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <Ionicons name="ticket" size={18} color={SemanticColors.warningDark} />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: SemanticColors.warningDark, marginLeft: 6 }}>
                        {t.gacha_rareCoupons} ({(prizePoolData?.coupons?.length || 0) + (Array.isArray(couponPoolData) ? couponPoolData.length : 0)})
                      </Text>
                    </View>

                    {/* 獎品池優惠券 */}
                    {prizePoolData?.coupons?.map((coupon) => (
                      <View
                        key={`prize-${coupon.id}`}
                        style={{
                          backgroundColor: coupon.rarity === 'SP' ? SemanticColors.starBg : '#ddd6fe',
                          borderRadius: 12,
                          padding: 14,
                          marginBottom: 10,
                          borderWidth: 2,
                          borderColor: coupon.rarity === 'SP' ? SemanticColors.starYellow : '#8b5cf6',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                          <View
                            style={{
                              backgroundColor: coupon.rarity === 'SP' ? SemanticColors.starYellow : '#8b5cf6',
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              marginRight: 8,
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '800', color: UIColors.white }}>
                              {coupon.rarity}
                            </Text>
                          </View>
                        </View>

                        <Text style={{ fontSize: 14, fontWeight: '700', color: MibuBrand.dark, marginBottom: 4 }} numberOfLines={2} ellipsizeMode="tail">
                          {coupon.title}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="location-outline" size={12} color={MibuBrand.tan} />
                          <Text style={{ fontSize: 11, color: MibuBrand.tan, marginLeft: 4, flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">
                            {coupon.placeName}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* 區域優惠券 */}
                    {(Array.isArray(couponPoolData) ? couponPoolData : []).map((coupon) => (
                      <View
                        key={`coupon-${coupon.id}`}
                        style={{
                          backgroundColor: coupon.rarity === 'SSR' ? SemanticColors.starBg : '#f3e8ff',
                          borderRadius: 12,
                          padding: 14,
                          marginBottom: 10,
                          borderWidth: 2,
                          borderColor: coupon.rarity === 'SSR' ? '#fbbf24' : '#a855f7',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                          <View
                            style={{
                              backgroundColor: coupon.rarity === 'SSR' ? '#fbbf24' : '#a855f7',
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              marginRight: 8,
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '800', color: UIColors.white }}>
                              {coupon.rarity}
                            </Text>
                          </View>
                          {coupon.discount && (
                            <View
                              style={{
                                backgroundColor: SemanticColors.errorDark,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4,
                              }}
                            >
                              <Text style={{ fontSize: 10, fontWeight: '700', color: UIColors.white }}>
                                {coupon.discount}
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text style={{ fontSize: 14, fontWeight: '700', color: MibuBrand.dark, marginBottom: 2 }} numberOfLines={2} ellipsizeMode="tail">
                          {coupon.title}
                        </Text>

                        {coupon.merchantName && (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="storefront-outline" size={12} color={MibuBrand.tan} />
                            <Text style={{ fontSize: 11, color: MibuBrand.tan, marginLeft: 4, flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">
                              {coupon.merchantName}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  // 無優惠券：顯示空狀態
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: SemanticColors.warningLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="ticket-outline" size={40} color={SemanticColors.warningDark} />
                    </View>
                    <Text style={{ fontSize: 14, color: MibuBrand.tan, textAlign: 'center' }}>
                      {t.gacha_noRareCoupons}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* TODO: 商家端開放後取消註解顯示機率說明 Modal
      <Modal
        visible={rarityModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setRarityModalVisible(false)}
      >
        ... (機率說明 Modal 內容)
      </Modal>
      */}

      {/* ========== 載入畫面（扭蛋等待）========== */}
      <LoadingAdScreen
        visible={showLoadingAd}
        onComplete={handleLoadingComplete}
        onCancel={() => {
          setShowLoadingAd(false);
          setIsApiComplete(false);
        }}
        isApiComplete={isApiComplete}
        language={state.language}
        translations={{
          generatingItinerary: t.generatingItinerary || '正在生成行程...',
          sponsorAd: t.sponsorAd || '贊助商廣告 (模擬)',
          pleaseWait: t.pleaseWait || '請稍候',
          almostReady: t.almostReady || '即將完成',
        }}
      />

      {/* ========== 新手教學 ========== */}
      <TutorialOverlay
        storageKey="gacha_tutorial"
        steps={GACHA_TUTORIAL_STEPS}
        language={state.language as 'zh-TW' | 'en'}
      />
    </ScrollView>
  );
}
