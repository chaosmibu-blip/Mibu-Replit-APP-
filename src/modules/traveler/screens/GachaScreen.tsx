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
import { getDeviceId } from '../../../services/gachaApi';
import { Country, Region, GachaItem, GachaPoolItem, GachaPoolResponse, RegionPoolCoupon, PrizePoolCoupon, PrizePoolResponse, ItineraryItemRaw, LocalizedContent, GachaMeta, CouponWon } from '../../../types';
import { MAX_DAILY_GENERATIONS, getCategoryColor } from '../../../constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';
import { ErrorCode, isAuthError } from '../../../shared/errors';

// ============================================================
// 常數定義
// ============================================================

// 不限次數的特殊帳號（測試用）
const UNLIMITED_EMAILS = ['s8869420@gmail.com'];

// 每日扭蛋次數儲存 key
const DAILY_LIMIT_KEY = '@mibu_daily_limit';

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
      console.log('🌍 Loading countries...');
      const data = await apiService.getCountries();
      console.log('🌍 Countries loaded:', JSON.stringify(data));
      setCountries(data);
    } catch (error) {
      console.error('🌍 Failed to load countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

  /**
   * 載入指定國家的城市列表
   * 設定 10 秒 timeout 防止卡住
   */
  const loadRegions = async (countryId: number) => {
    setLoadingRegions(true);
    setRegions([]); // 清空舊資料

    try {
      // 設定 10 秒 timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const data = await Promise.race([
        apiService.getRegions(countryId),
        timeoutPromise,
      ]);
      setRegions(data);
    } catch (error) {
      console.error('Failed to load regions:', error);
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
   * 檢查是否還有每日扭蛋次數
   * 特殊帳號（UNLIMITED_EMAILS）不受限制
   */
  const checkDailyLimit = async (): Promise<boolean> => {
    // 特殊帳號不限次數
    if (state.user?.email && UNLIMITED_EMAILS.includes(state.user.email)) {
      return true;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = await AsyncStorage.getItem(DAILY_LIMIT_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        // 如果是今天且已達上限，返回 false
        if (parsed.date === today && parsed.count >= MAX_DAILY_GENERATIONS) {
          return false;
        }
      }
      return true;
    } catch {
      return true;
    }
  };

  /**
   * 增加今日扭蛋次數計數
   */
  const incrementDailyCount = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = await AsyncStorage.getItem(DAILY_LIMIT_KEY);

      let count = 1;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) {
          count = parsed.count + 1;
        }
      }

      await AsyncStorage.setItem(DAILY_LIMIT_KEY, JSON.stringify({ date: today, count }));
    } catch (error) {
      console.error('Failed to increment daily count:', error);
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
        state.language === 'zh-TW' ? '請先登入' : 'Login Required',
        state.language === 'zh-TW' ? '使用扭蛋功能需要登入帳號' : 'Please login to use the gacha feature',
        [
          { text: state.language === 'zh-TW' ? '取消' : 'Cancel', style: 'cancel' },
          { text: state.language === 'zh-TW' ? '前往登入' : 'Login', onPress: () => router.push('/login') }
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
      console.log('🎰 [GachaScreen] Starting gacha pull:', { regionId: selectedRegionId, pullCount });

      // #031: 取得裝置識別碼用於防刷機制
      const deviceId = await getDeviceId();
      console.log('🎰 [GachaScreen] Device ID:', deviceId ? `${deviceId.substring(0, 8)}...` : 'none');

      // ========== 呼叫核心 API ==========
      const response = await apiService.generateItinerary({
        regionId: selectedRegionId,
        itemCount: pullCount,
        deviceId,
      }, token);

      console.log('🎰 [GachaScreen] API response received:', {
        success: response.success,
        hasItinerary: !!response.itinerary,
        itineraryLength: response.itinerary?.length || 0,
        errorCode: response.errorCode || response.code,
        errorMsg: response.error || response.message,
      });

      // ========== 錯誤處理 ==========
      const errorCode = response.errorCode || response.code;
      const errorMsg = response.error || response.message;

      if (!response.success && (errorCode || errorMsg)) {
        console.warn('🎰 [GachaScreen] API returned error:', { errorCode, errorMsg });
        setShowLoadingAd(false);

        // 處理認證錯誤：Token 過期
        if (isAuthError(errorCode)) {
          setUser(null);
          Alert.alert(
            state.language === 'zh-TW' ? '登入已過期' : 'Session Expired',
            state.language === 'zh-TW' ? '請重新登入' : 'Please login again'
          );
          router.push('/login');
          return;
        }

        // 處理權限不足
        if (errorCode === 'FORBIDDEN') {
          Alert.alert(
            state.language === 'zh-TW' ? '權限不足' : 'Access Denied',
            state.language === 'zh-TW' ? '您沒有權限執行此操作' : 'You do not have permission to perform this action'
          );
          return;
        }

        // 處理扭蛋次數不足
        if (errorCode === ErrorCode.GACHA_NO_CREDITS) {
          Alert.alert(
            state.language === 'zh-TW' ? '次數不足' : 'No Credits',
            state.language === 'zh-TW' ? '請購買更多扭蛋次數' : 'Please purchase more gacha credits'
          );
          return;
        }

        // 處理每日額度用完
        if (errorCode === 'DAILY_LIMIT_EXCEEDED' || errorCode === ErrorCode.GACHA_RATE_LIMITED || errorCode === ErrorCode.DAILY_LIMIT_REACHED) {
          Alert.alert(
            state.language === 'zh-TW' ? '今日額度已用完' : 'Daily Limit Reached',
            state.language === 'zh-TW' ? '請明天再來抽卡！' : 'Please come back tomorrow!'
          );
          return;
        }

        // #031: 裝置額度用完（防刷機制）
        if (errorCode === 'DEVICE_LIMIT_EXCEEDED' || errorCode === 'DEVICE_DAILY_LIMIT') {
          Alert.alert(
            state.language === 'zh-TW' ? '裝置額度已達上限' : 'Device Limit Reached',
            state.language === 'zh-TW' ? '此裝置今日抽卡次數已達上限' : 'This device has reached its daily pull limit'
          );
          return;
        }

        // 處理超過剩餘額度
        if (errorCode === 'EXCEEDS_REMAINING_QUOTA') {
          const remaining = response.remainingQuota || 0;
          Alert.alert(
            state.language === 'zh-TW' ? '額度不足' : 'Quota Exceeded',
            state.language === 'zh-TW' ? `今日剩餘 ${remaining} 張` : `Today's remaining quota: ${remaining}`
          );
          return;
        }

        // 其他錯誤：顯示後端回傳的訊息
        Alert.alert(
          state.language === 'zh-TW' ? '提示' : 'Notice',
          errorMsg || (state.language === 'zh-TW' ? '發生錯誤，請稍後再試' : 'An error occurred. Please try again.')
        );
        return;
      }

      // ========== 處理空結果 ==========
      const itineraryItems = response.itinerary || [];
      if (!itineraryItems || itineraryItems.length === 0) {
        setShowLoadingAd(false);

        if (response.meta?.code === 'NO_PLACES_AVAILABLE') {
          const metaMessage = response.meta?.message || (state.language === 'zh-TW' ? '該區域暫無景點' : 'No places available in this area');
          Alert.alert(
            state.language === 'zh-TW' ? '提示' : 'Notice',
            metaMessage
          );
        } else {
          Alert.alert(
            state.language === 'zh-TW' ? '提示' : 'Notice',
            state.language === 'zh-TW' ? '該區域暫無景點，請嘗試其他地區' : 'No places available in this area. Please try another region.'
          );
        }
        return;
      }

      // ========== 轉換 API 回應為 GachaItem ==========
      const couponsWon = response.couponsWon || [];

      const items = itineraryItems.map((item: ItineraryItemRaw, index: number) => {
        // 判斷是否有商家優惠券
        const hasMerchantCoupon = item.isCoupon || item.couponWon || (item.merchantPromo?.isPromoActive && item.couponWon);
        const place = item.place || item;

        // 取得經緯度
        const lat = place.locationLat || item.locationLat || null;
        const lng = place.locationLng || item.locationLng || null;

        // 取得城市和區域
        const cityVal = item.city || response.meta?.city || response.city || '';
        const districtVal = item.district || response.meta?.district || response.anchorDistrict || response.targetDistrict || '';

        return {
          id: Date.now() + index,
          placeName: place.placeName || item.placeName || `${item.district || response.anchorDistrict || ''} ${item.subCategory || ''}`,
          description: place.description || item.description || `${item.city || ''} ${item.district || ''}`,
          category: place.category || item.category || '',
          subcategory: place.subcategory || item.subcategory || null,
          address: place.address || item.address || null,
          rating: place.rating || item.rating || null,
          locationLat: lat,
          locationLng: lng,
          location: lat && lng ? { lat, lng } : null,
          googlePlaceId: place.googlePlaceId || item.googlePlaceId || null,
          country: item.country || response.country || '',
          city: cityVal,
          cityDisplay: cityVal,
          district: districtVal,
          districtDisplay: districtVal,
          collectedAt: new Date().toISOString(),
          isCoupon: hasMerchantCoupon,
          couponData: item.couponWon || item.couponData || null,
          merchant: item.merchantPromo ? {
            id: item.merchantPromo?.merchantId || '',
            name: item.merchantPromo?.promoTitle || '',
            description: item.merchantPromo?.promoDescription,
            badge: item.merchantPromo?.badge,
            discount: item.merchantPromo?.discount,
          } : undefined,
          rarity: item.rarity || 'N',
        };
      }) as GachaItem[];

      // 更新每日計數
      await incrementDailyCount();

      // ========== 暫存結果，等待載入動畫結束 ==========
      pendingResultRef.current = {
        items,
        meta: {
          date: new Date().toISOString().split('T')[0],
          country: response.country || '',
          city: response.meta?.city || response.city || '',
          lockedDistrict: response.meta?.district || response.anchorDistrict || response.targetDistrict || '',
          userLevel: pullCount,
          couponsWon: couponsWon.length,
          themeIntro: response.themeIntro,
          sortingMethod: response.meta?.sortingMethod || response.sortingMethod,
          requestedCount: response.meta?.requestedCount,
          totalPlaces: response.meta?.totalPlaces,
          isShortfall: response.meta?.isShortfall,
          shortfallMessage: response.meta?.shortfallMessage,
          dailyPullCount: response.meta?.dailyPullCount,
          remainingQuota: response.meta?.remainingQuota,
        },
        couponsWon,
      };

      // ========== 處理成就解鎖通知 (#020) ==========
      const unlockedAchievements = response.unlockedAchievements || [];
      if (unlockedAchievements.length > 0) {
        const achievementNames = unlockedAchievements.map(a => a.title).join('、');
        const totalReward = unlockedAchievements.reduce((sum, a) => sum + (a.reward?.exp || 0), 0);

        // 延遲 2 秒顯示，讓扭蛋結果先呈現
        setTimeout(() => {
          Alert.alert(
            state.language === 'zh-TW' ? '🏆 成就解鎖！' : '🏆 Achievement Unlocked!',
            state.language === 'zh-TW'
              ? `恭喜解鎖：${achievementNames}\n獲得 ${totalReward} 經驗值！`
              : `Unlocked: ${achievementNames}\nEarned ${totalReward} XP!`
          );
        }, 2000);
      }

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
      Alert.alert(
        state.language === 'zh-TW' ? '錯誤' : 'Error',
        state.language === 'zh-TW' ? '生成行程失敗，請稍後再試' : 'Failed to generate itinerary. Please try again.'
      );
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
          backgroundColor: '#ffffff',
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
            <Ionicons name="location" size={32} color="#ffffff" />
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
          {state.language === 'zh-TW' ? '今天去哪玩？老天說了算' : 'Let Fate Decide Your Trip'}
        </Text>
      </View>

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
            {state.language === 'zh-TW' ? '選擇探索區域' : 'Select Region'}
          </Text>
        </View>

        {/* 國家下拉選單 */}
        <Select
          label={state.language === 'zh-TW' ? '國家' : 'Country'}
          options={countryOptions}
          value={selectedCountryId}
          onChange={(value) => {
            setSelectedCountryId(value as number);
            setSelectedRegionId(null);
            setRegions([]);
          }}
          placeholder={t.selectCountry}
          loading={loadingCountries}
          footerContent={
            // 國家選單底部：解鎖全球地圖 CTA
            <View style={{ alignItems: 'center', paddingTop: 16 }}>
              <Text style={{ fontSize: 13, color: MibuBrand.copper, lineHeight: 20, textAlign: 'center' }}>
                {state.language === 'zh-TW'
                  ? '我們正在努力增加更多國家\n現在你也可以一起幫助我們！'
                  : 'We\'re working on adding more countries.\nNow you can help us too!'}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/crowdfunding')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 12,
                  backgroundColor: MibuBrand.brown,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                }}
              >
                <Ionicons name="globe-outline" size={16} color={MibuBrand.warmWhite} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: MibuBrand.warmWhite, marginLeft: 6 }}>
                  {state.language === 'zh-TW' ? '解鎖全球地圖' : 'Unlock Global Map'}
                </Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* 城市下拉選單（選擇國家後才顯示） */}
        {selectedCountryId && (
          <View style={{ marginTop: 12 }}>
            <Select
              label={state.language === 'zh-TW' ? '城市/地區' : 'City/Region'}
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: MibuBrand.copper }}>
                {state.language === 'zh-TW' ? '扭蛋次數' : 'Pull Count'}
              </Text>
              {/* 說明按鈕（點擊顯示 Alert） */}
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    state.language === 'zh-TW' ? '扭蛋說明' : 'Gacha Info',
                    state.language === 'zh-TW'
                      ? '每次扭蛋都會消耗 Token，因此每天的扭蛋限額為 36 張。\n\n請善用每日額度，探索更多精彩景點！'
                      : 'Each gacha pull consumes tokens. Daily limit is 36 pulls.\n\nMake the most of your daily quota to explore more amazing places!',
                    [{ text: state.language === 'zh-TW' ? '了解' : 'Got it' }]
                  );
                }}
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
            </View>
            {/* 當前選擇的次數 */}
            <Text style={{ fontSize: 28, fontWeight: '800', color: MibuBrand.brownDark }}>
              {pullCount} <Text style={{ fontSize: 16, fontWeight: '600' }}>{state.language === 'zh-TW' ? '次' : 'pulls'}</Text>
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
              {state.language === 'zh-TW' ? '道具箱已滿' : 'Item Box Full'}
            </Text>
            <Text style={{ fontSize: 13, color: SemanticColors.errorDark, marginTop: 2 }}>
              {state.language === 'zh-TW' ? '請先清理道具箱再抽卡' : 'Please clear some items first'}
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
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff' }}>
              {state.language === 'zh-TW' ? '前往' : 'Go'}
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
            {state.language === 'zh-TW'
              ? `道具箱剩餘 ${inventoryRemaining} 格`
              : `${inventoryRemaining} slots remaining`}
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
      >
        <Text style={{
          fontSize: 20,
          fontWeight: '800',
          color: (!canSubmit || showLoadingAd) ? MibuBrand.brownLight : MibuBrand.warmWhite,
          letterSpacing: 1,
        }}>
          {isInventoryFull
            ? (state.language === 'zh-TW' ? '道具箱已滿' : 'Item Box Full')
            : (state.language === 'zh-TW' ? '開始扭蛋！' : 'Start Gacha!')}
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
            {state.language === 'zh-TW' ? '機率說明' : 'Probability Info'}
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#ffffff',
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
                        {state.language === 'zh-TW' ? 'SP/SSR 稀有優惠券' : 'SP/SSR Rare Coupons'} ({(prizePoolData?.coupons?.length || 0) + (Array.isArray(couponPoolData) ? couponPoolData.length : 0)})
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
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff' }}>
                              {coupon.rarity}
                            </Text>
                          </View>
                        </View>

                        <Text style={{ fontSize: 14, fontWeight: '700', color: MibuBrand.dark, marginBottom: 4 }}>
                          {coupon.title}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="location-outline" size={12} color={MibuBrand.tan} />
                          <Text style={{ fontSize: 11, color: MibuBrand.tan, marginLeft: 4 }}>
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
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff' }}>
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
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ffffff' }}>
                                {coupon.discount}
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text style={{ fontSize: 14, fontWeight: '700', color: MibuBrand.dark, marginBottom: 2 }}>
                          {coupon.title}
                        </Text>

                        {coupon.merchantName && (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="storefront-outline" size={12} color={MibuBrand.tan} />
                            <Text style={{ fontSize: 11, color: MibuBrand.tan, marginLeft: 4 }}>
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
                      {state.language === 'zh-TW' ? '此區域尚無稀有優惠券' : 'No rare coupons in this region'}
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
