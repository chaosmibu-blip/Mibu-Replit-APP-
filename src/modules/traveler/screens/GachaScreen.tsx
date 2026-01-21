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
import { Country, Region, GachaItem, GachaPoolItem, GachaPoolResponse, RegionPoolCoupon, PrizePoolCoupon, PrizePoolResponse, ItineraryItemRaw, LocalizedContent, GachaMeta, CouponWon } from '../../../types';
import { MAX_DAILY_GENERATIONS, getCategoryColor } from '../../../constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';
import { ErrorCode, isAuthError } from '../../../shared/errors';

const UNLIMITED_EMAILS = ['s8869420@gmail.com'];

const DAILY_LIMIT_KEY = '@mibu_daily_limit';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RARITY_COLORS: Record<string, string> = {
  SP: MibuBrand.tierSP,
  SSR: MibuBrand.tierSSR,
  SR: MibuBrand.tierSR,
  S: MibuBrand.tierS,
  R: MibuBrand.tierR,
  N: MibuBrand.tan,
};

const RARITY_BG_COLORS: Record<string, string> = {
  SP: MibuBrand.tierSPBg,
  SSR: MibuBrand.tierSSRBg,
  SR: MibuBrand.tierSRBg,
  S: MibuBrand.tierSBg,
  R: MibuBrand.tierRBg,
  N: MibuBrand.creamLight,
};

export function GachaScreen() {
  const router = useRouter();
  const { state, t, addToCollection, setResult, getToken, setUser } = useApp();
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [pullCount, setPullCount] = useState(5);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(false);
  
  const [poolModalVisible, setPoolModalVisible] = useState(false);
  const [poolData, setPoolData] = useState<GachaPoolResponse | null>(null);
  const [loadingPool, setLoadingPool] = useState(false);
  const [couponPoolData, setCouponPoolData] = useState<RegionPoolCoupon[]>([]);
  const [prizePoolData, setPrizePoolData] = useState<PrizePoolResponse | null>(null);
  
  const [showLoadingAd, setShowLoadingAd] = useState(false);
  const [isApiComplete, setIsApiComplete] = useState(false);
  const pendingResultRef = useRef<{ items: GachaItem[]; meta: GachaMeta; couponsWon: CouponWon[] } | null>(null);
  
  const [rarityModalVisible, setRarityModalVisible] = useState(false);
  const [rarityConfig, setRarityConfig] = useState<{ rarity: string; probability: number }[]>([]);
  const [loadingRarity, setLoadingRarity] = useState(false);

  // 道具箱容量檢查
  const [inventorySlotCount, setInventorySlotCount] = useState(0);
  const [inventoryMaxSlots, setInventoryMaxSlots] = useState(30);
  const isInventoryFull = inventorySlotCount >= inventoryMaxSlots;
  const inventoryRemaining = inventoryMaxSlots - inventorySlotCount;

  useEffect(() => {
    loadCountries();
    checkInventoryCapacity();
  }, []);

  const checkInventoryCapacity = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // 使用新的 capacity API（如果可用），否則 fallback 到舊方式
      try {
        const capacity = await apiService.getInventoryCapacity(token);
        setInventorySlotCount(capacity.used);
        setInventoryMaxSlots(capacity.max);
      } catch {
        // Fallback: 使用 getInventory API
        const data = await apiService.getInventory(token);
        const activeItems = (data.items || []).filter((i: { isDeleted?: boolean; status?: string }) => !i.isDeleted && i.status !== 'deleted');
        setInventorySlotCount(activeItems.length);
        setInventoryMaxSlots(data.maxSlots || 30);
      }
    } catch (error) {
      console.error('Failed to check inventory capacity:', error);
    }
  };

  useEffect(() => {
    if (selectedCountryId) {
      loadRegions(selectedCountryId);
    }
  }, [selectedCountryId]);

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

  const loadRegions = async (countryId: number) => {
    setLoadingRegions(true);
    setRegions([]); // 清空舊資料
    try {
      // 設定 10 秒 timeout 防止卡住
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

  const getLocalizedName = (item: Country | Region): string => {
    const lang = state.language;
    if (lang === 'zh-TW') return item.nameZh || item.nameEn || '';
    if (lang === 'ja') return item.nameJa || item.nameEn || '';
    if (lang === 'ko') return item.nameKo || item.nameEn || '';
    return item.nameEn || '';
  };

  const getLocalizedPoolItemName = (name: LocalizedContent | string): string => {
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name !== null) {
      return name[state.language] || name['zh-TW'] || name['en'] || '';
    }
    return '';
  };

  const checkDailyLimit = async (): Promise<boolean> => {
    if (state.user?.email && UNLIMITED_EMAILS.includes(state.user.email)) {
      return true;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = await AsyncStorage.getItem(DAILY_LIMIT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === today && parsed.count >= MAX_DAILY_GENERATIONS) {
          return false;
        }
      }
      return true;
    } catch {
      return true;
    }
  };

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

  const handleViewRarity = async () => {
    setRarityModalVisible(true);
    setLoadingRarity(true);
    try {
      const result = await apiService.getRarityConfig();
      if (result.config) {
        const config = result.config;
        const probArray = [
          { rarity: 'R', probability: config.rRate },
          { rarity: 'S', probability: config.sRate },
          { rarity: 'SR', probability: config.srRate },
          { rarity: 'SSR', probability: config.ssrRate },
          { rarity: 'SP', probability: config.spRate },
        ].sort((a, b) => b.probability - a.probability);
        setRarityConfig(probArray);
      }
    } catch (error) {
      console.error('Failed to load rarity config:', error);
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

  const handleGacha = async () => {
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

    const canPull = await checkDailyLimit();
    if (!canPull) {
      Alert.alert(t.dailyLimitReached, t.dailyLimitReachedDesc);
      return;
    }

    setShowLoadingAd(true);
    setIsApiComplete(false);
    pendingResultRef.current = null;

    try {
      const selectedRegion = regions.find(r => r.id === selectedRegionId);
      console.log('🎰 [GachaScreen] Starting gacha pull:', { regionId: selectedRegionId, pullCount });

      const response = await apiService.generateItinerary({
        regionId: selectedRegionId,
        itemCount: pullCount,
      }, token);

      console.log('🎰 [GachaScreen] API response received:', {
        success: response.success,
        hasItinerary: !!response.itinerary,
        itineraryLength: response.itinerary?.length || 0,
        errorCode: response.errorCode || response.code,
        errorMsg: response.error || response.message,
      });

      // 錯誤處理：統一使用後端標準格式 { error, code }
      const errorCode = response.errorCode || response.code;
      const errorMsg = response.error || response.message; // 相容舊格式

      if (!response.success && (errorCode || errorMsg)) {
        console.warn('🎰 [GachaScreen] API returned error:', { errorCode, errorMsg });
        setShowLoadingAd(false);

        // 處理認證錯誤：使用 isAuthError helper 或檢查舊格式字串
        const legacyAuthErrors = ['UNAUTHORIZED', 'INVALID_TOKEN', 'USER_NOT_FOUND'];
        if (isAuthError(errorCode) || legacyAuthErrors.includes(errorCode)) {
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

        if (errorCode === ErrorCode.GACHA_NO_CREDITS) {
          Alert.alert(
            state.language === 'zh-TW' ? '次數不足' : 'No Credits',
            state.language === 'zh-TW' ? '請購買更多扭蛋次數' : 'Please purchase more gacha credits'
          );
          return;
        }

        if (errorCode === 'DAILY_LIMIT_EXCEEDED' || errorCode === ErrorCode.GACHA_DAILY_LIMIT) {
          Alert.alert(
            state.language === 'zh-TW' ? '今日額度已用完' : 'Daily Limit Reached',
            state.language === 'zh-TW' ? '請明天再來抽卡！' : 'Please come back tomorrow!'
          );
          return;
        }

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

      const couponsWon = response.couponsWon || [];

      const items: GachaItem[] = itineraryItems.map((item: ItineraryItemRaw, index: number) => {
        const hasMerchantCoupon = item.isCoupon || item.couponWon || (item.merchantPromo?.isPromoActive && item.couponWon);
        const place = item.place || item;
        const lat = place.locationLat || item.locationLat || null;
        const lng = place.locationLng || item.locationLng || null;
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
      });

      await incrementDailyCount();

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

      // 處理成就解鎖通知 (#020)
      const unlockedAchievements = response.unlockedAchievements || [];
      if (unlockedAchievements.length > 0) {
        const achievementNames = unlockedAchievements.map(a => a.title).join('、');
        const totalReward = unlockedAchievements.reduce((sum, a) => sum + (a.reward?.exp || 0), 0);
        setTimeout(() => {
          Alert.alert(
            state.language === 'zh-TW' ? '🏆 成就解鎖！' : '🏆 Achievement Unlocked!',
            state.language === 'zh-TW'
              ? `恭喜解鎖：${achievementNames}\n獲得 ${totalReward} 經驗值！`
              : `Unlocked: ${achievementNames}\nEarned ${totalReward} XP!`
          );
        }, 2000); // 延遲顯示，讓扭蛋結果先呈現
      }

      setIsApiComplete(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
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

  const handleLoadingComplete = useCallback(() => {
    if (pendingResultRef.current) {
      const { items, meta } = pendingResultRef.current;
      
      addToCollection(items);

      setResult({
        status: 'success',
        meta,
        inventory: items,
      });

      setShowLoadingAd(false);
      
      router.push('/(tabs)/gacha/items');
    }
  }, [addToCollection, setResult, router]);

  const countryOptions = countries.map(c => ({
    label: getLocalizedName(c),
    value: c.id,
  }));

  const regionOptions = regions.map(r => ({
    label: getLocalizedName(r),
    value: r.id,
  }));

  const canSubmit = selectedCountryId && selectedRegionId && !isInventoryFull;

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
        
        <View style={{ padding: 12 }}>
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
          
          <Text
            style={{ fontSize: 13, fontWeight: '700', color: MibuBrand.dark }}
            numberOfLines={2}
          >
            {getLocalizedPoolItemName(item.name)}
          </Text>
          
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

  const getJackpotItems = () => {
    if (!poolData?.pool?.jackpots) return [];
    return poolData.pool.jackpots;
  };

  // 取得選中的國家和城市名稱
  const selectedCountry = countries.find(c => c.id === selectedCountryId);
  const selectedRegion = regions.find(r => r.id === selectedRegionId);
  const countryName = selectedCountry ? getLocalizedName(selectedCountry) : '';
  const regionName = selectedRegion ? getLocalizedName(selectedRegion) : '';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MibuBrand.warmWhite }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
    >
      {/* 頂部 Logo 區 */}
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: MibuBrand.brown, letterSpacing: 3 }}>
          MIBU
        </Text>
        <Text style={{ fontSize: 15, color: MibuBrand.brownLight, marginTop: 6, fontWeight: '500' }}>
          {state.language === 'zh-TW' ? '今天去哪玩？老天說了算' : 'Let Fate Decide Your Trip'}
        </Text>
      </View>

      {/* 選擇區域卡片 */}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Ionicons name="globe-outline" size={20} color={MibuBrand.copper} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.brown, marginLeft: 8 }}>
            {state.language === 'zh-TW' ? '選擇探索區域' : 'Select Region'}
          </Text>
        </View>

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
        />

        {/* 國家選擇提示：解鎖更多國家 */}
        <View style={{
          backgroundColor: MibuBrand.highlight,
          borderRadius: 12,
          padding: 14,
          marginTop: 4,
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 13, color: MibuBrand.copper, lineHeight: 20 }}>
            {state.language === 'zh-TW'
              ? '🌍 我們正在努力增加更多國家！想解鎖其他國家嗎？'
              : '🌍 We\'re working on adding more countries! Want to unlock others?'}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/crowdfunding')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              backgroundColor: MibuBrand.brown,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              alignSelf: 'flex-start',
            }}
          >
            <Ionicons name="globe-outline" size={16} color={MibuBrand.warmWhite} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: MibuBrand.warmWhite, marginLeft: 6 }}>
              {state.language === 'zh-TW' ? '解鎖全球地圖' : 'Unlock Global Map'}
            </Text>
          </TouchableOpacity>
        </View>

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

      {/* 抽取張數卡片 */}
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
          {/* 標題行：扭蛋次數 + 數字顯示 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: MibuBrand.copper }}>
              {state.language === 'zh-TW' ? '扭蛋次數' : 'Pull Count'}
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: MibuBrand.brownDark }}>
              {pullCount} <Text style={{ fontSize: 16, fontWeight: '600' }}>{state.language === 'zh-TW' ? '次' : 'pulls'}</Text>
            </Text>
          </View>

          {/* Slider - 簡潔樣式 */}
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

      {/* 道具箱容量警告 */}
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
            onPress={() => router.push('/(tabs)/collection/itembox')}
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

      {/* 開始扭蛋按鈕 */}
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

      {/* 已選擇區域顯示 */}
      {selectedRegionId && (
        <View style={{
          backgroundColor: MibuBrand.cream,
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name="location" size={18} color={MibuBrand.copper} />
          <Text style={{ fontSize: 15, color: MibuBrand.brown, marginLeft: 10, fontWeight: '600' }}>
            {countryName} · {regionName}
          </Text>
        </View>
      )}

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

            {loadingPool ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={{ marginTop: 16, color: MibuBrand.tan, fontSize: 14 }}>
                  {t.loadingPool || '載入獎池中...'}
                </Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {((prizePoolData?.coupons?.length || 0) > 0 || (Array.isArray(couponPoolData) ? couponPoolData.length : 0) > 0) ? (
                  <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}>
                    {(prizePoolData?.region?.name || poolData?.pool?.city) && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="location" size={16} color="#6366f1" />
                        <Text style={{ fontSize: 13, color: '#6366f1', marginLeft: 6, fontWeight: '600' }}>
                          {prizePoolData?.region?.name || poolData?.pool?.city}
                        </Text>
                      </View>
                    )}
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <Ionicons name="ticket" size={18} color={SemanticColors.warningDark} />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: SemanticColors.warningDark, marginLeft: 6 }}>
                        {state.language === 'zh-TW' ? 'SP/SSR 稀有優惠券' : 'SP/SSR Rare Coupons'} ({(prizePoolData?.coupons?.length || 0) + (Array.isArray(couponPoolData) ? couponPoolData.length : 0)})
                      </Text>
                    </View>
                    
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
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 320,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b' }}>
                {state.language === 'zh-TW' ? '優惠券機率說明' : 'Coupon Probability'}
              </Text>
              <TouchableOpacity
                onPress={() => setRarityModalVisible(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: '#f1f5f9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {loadingRarity ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <View>
                <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 20 }}>
                  {state.language === 'zh-TW' 
                    ? '抽取優惠券時，各稀有度的出現機率如下：'
                    : 'When drawing coupons, the probability for each rarity is:'}
                </Text>
                
                {rarityConfig.map((item) => (
                  <View
                    key={item.rarity}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f1f5f9',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View
                        style={{
                          backgroundColor: RARITY_BG_COLORS[item.rarity] || '#f1f5f9',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                          minWidth: 44,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '800',
                            color: RARITY_COLORS[item.rarity] || '#64748b',
                          }}
                        >
                          {item.rarity}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1e293b' }}>
                      {item.probability}%
                    </Text>
                  </View>
                ))}

                <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 16, textAlign: 'center' }}>
                  {state.language === 'zh-TW' 
                    ? '※ 機率僅供參考，實際結果可能有所不同'
                    : '※ Probabilities are for reference only'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      */}

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

      {/* 新手教學 */}
      <TutorialOverlay
        storageKey="gacha_tutorial"
        steps={GACHA_TUTORIAL_STEPS}
        language={state.language}
      />
    </ScrollView>
  );
}
