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
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { LoadingAdScreen } from '../components/LoadingAdScreen';
import { apiService } from '../services/api';
import { Country, Region, GachaItem, GachaPoolItem, GachaPoolResponse, RegionPoolCoupon, PrizePoolCoupon, PrizePoolResponse } from '../types';
import { MAX_DAILY_GENERATIONS, getCategoryColor } from '../constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MibuBrand } from '../../constants/Colors';
import { ErrorCode, ApiError } from '../shared/errors';

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
  const { state, t, addToCollection, setResult } = useApp();
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
  const pendingResultRef = useRef<any>(null);

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountryId) {
      loadRegions(selectedCountryId);
    }
  }, [selectedCountryId]);

  const loadCountries = async () => {
    try {
      const data = await apiService.getCountries();
      setCountries(data);
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const loadRegions = async (countryId: number) => {
    setLoadingRegions(true);
    try {
      const data = await apiService.getRegions(countryId);
      setRegions(data);
    } catch (error) {
      console.error('Failed to load regions:', error);
    } finally {
      setLoadingRegions(false);
    }
  };

  const getLocalizedName = (item: Country | Region | { nameZh?: string; nameEn?: string; nameJa?: string; nameKo?: string; name?: string }): string => {
    switch (state.language) {
      case 'ja': return (item as any).nameJa || (item as any).nameZh || (item as any).nameEn || (item as any).name || '';
      case 'ko': return (item as any).nameKo || (item as any).nameZh || (item as any).nameEn || (item as any).name || '';
      case 'en': return (item as any).nameEn || (item as any).name || '';
      default: return (item as any).nameZh || (item as any).nameEn || (item as any).name || '';
    }
  };

  const getLocalizedPoolItemName = (name: any): string => {
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
      const token = await AsyncStorage.getItem('@mibu_token');
      
      const [poolResult, couponResult, prizePoolResult] = await Promise.allSettled([
        apiService.getGachaPool(city),
        token ? apiService.getRegionCouponPool(token, selectedRegionId) : Promise.resolve([]),
        apiService.getPrizePool(selectedRegionId)
      ]);
      
      if (poolResult.status === 'fulfilled') {
        setPoolData(poolResult.value);
      }
      if (couponResult.status === 'fulfilled') {
        const couponData = couponResult.value as any;
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

    const canPull = await checkDailyLimit();
    if (!canPull) {
      Alert.alert(t.dailyLimitReached, t.dailyLimitReachedDesc);
      return;
    }

    setShowLoadingAd(true);
    setIsApiComplete(false);
    pendingResultRef.current = null;

    try {
      const token = await AsyncStorage.getItem('@mibu_token');
      const selectedRegion = regions.find(r => r.id === selectedRegionId);
      console.log('[Gacha] API Request:', {
        endpoint: '/api/gacha/itinerary/v3',
        regionId: selectedRegionId,
        regionName: selectedRegion?.name || selectedRegion?.nameZh,
        itemCount: pullCount,
        hasToken: !!token
      });
      const response = await apiService.generateItinerary({
        regionId: selectedRegionId,
        itemCount: pullCount,
      }, token || undefined);

      if (response.errorCode || response.error || (response as any).code) {
        setShowLoadingAd(false);
        const errorCode = response.errorCode || (response as any).code;
        
        if (errorCode === ErrorCode.AUTH_REQUIRED || errorCode === ErrorCode.AUTH_TOKEN_EXPIRED) {
          await AsyncStorage.removeItem('@mibu_token');
          Alert.alert(
            state.language === 'zh-TW' ? '登入已過期' : 'Session Expired',
            state.language === 'zh-TW' ? '請重新登入' : 'Please login again'
          );
          router.push('/login');
          return;
        }
        
        if (errorCode === ErrorCode.GACHA_NO_CREDITS) {
          Alert.alert(
            state.language === 'zh-TW' ? '次數不足' : 'No Credits',
            state.language === 'zh-TW' ? '請購買更多扭蛋次數' : 'Please purchase more gacha credits'
          );
          return;
        }

        if (errorCode === 'DAILY_LIMIT_EXCEEDED') {
          Alert.alert(
            state.language === 'zh-TW' ? '今日額度已用完' : 'Daily Limit Reached',
            state.language === 'zh-TW' ? '請明天再來抽卡！' : 'Please come back tomorrow!'
          );
          return;
        }

        if (errorCode === 'EXCEEDS_REMAINING_QUOTA') {
          const remaining = (response as any).remainingQuota || 0;
          Alert.alert(
            state.language === 'zh-TW' ? '額度不足' : 'Quota Exceeded',
            state.language === 'zh-TW' ? `今日剩餘 ${remaining} 張` : `Today's remaining quota: ${remaining}`
          );
          return;
        }
        
        const errorMessage = response.message || response.error || (state.language === 'zh-TW' ? '該區域暫無景點' : 'No places available in this area');
        Alert.alert(
          state.language === 'zh-TW' ? '提示' : 'Notice',
          errorMessage
        );
        return;
      }

      const itineraryItems = response.itinerary || [];
      if (!itineraryItems || itineraryItems.length === 0) {
        setShowLoadingAd(false);
        Alert.alert(
          state.language === 'zh-TW' ? '提示' : 'Notice',
          state.language === 'zh-TW' ? '該區域暫無景點，請嘗試其他地區' : 'No places available in this area. Please try another region.'
        );
        return;
      }

      const couponsWon = response.couponsWon || response.coupons_won || [];

      const items: GachaItem[] = itineraryItems.map((item: any, index: number) => {
        const hasMerchantCoupon = item.isCoupon || item.is_coupon || (item.merchantPromo?.isPromoActive && item.couponData);
        
        return {
          id: Date.now() + index,
          place_name: item.placeName || item.place_name || item.verifiedName || `${item.district || response.anchorDistrict || ''} ${item.subCategory || ''}`,
          description: item.description || `${item.city || ''} ${item.district || ''}`,
          ai_description: item.description || '',
          category: item.category || '',
          suggested_time: item.suggestedTime || item.timeSlot || '',
          duration: item.duration || '1h',
          search_query: '',
          color_hex: item.colorHex || '#6366f1',
          country: item.country || response.country || '',
          city: item.city || response.meta?.city || response.city || '',
          cityDisplay: item.city || response.meta?.city || response.city || '',
          district: item.district || response.meta?.district || response.anchorDistrict || response.targetDistrict || '',
          districtDisplay: item.district || response.meta?.district || response.anchorDistrict || response.targetDistrict || '',
          collectedAt: new Date().toISOString(),
          is_coupon: hasMerchantCoupon,
          coupon_data: item.couponData || item.coupon_data || null,
          place_id: item.placeId || null,
          verified_name: item.verifiedName || item.placeName || null,
          verified_address: item.verifiedAddress || null,
          google_rating: item.googleRating || null,
          google_types: [],
          primary_type: null,
          location: item.location || null,
          is_location_verified: item.isLocationVerified || false,
          merchant: item.merchantPromo ? {
            id: item.merchantPromo?.merchantId || '',
            name: item.merchantPromo?.promoTitle || '',
            description: item.merchantPromo?.promoDescription,
            badge: item.merchantPromo?.badge,
            discount: item.merchantPromo?.discount,
          } : undefined,
          coupon: item.couponData || null,
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
          locked_district: response.meta?.district || response.anchorDistrict || response.targetDistrict || '',
          user_level: pullCount,
          coupons_won: couponsWon.length,
          themeIntro: response.themeIntro,
          sortingMethod: response.meta?.sortingMethod || response.sortingMethod,
        },
        couponsWon,
      };

      setIsApiComplete(true);
    } catch (error) {
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

  const canSubmit = selectedCountryId && selectedRegionId;

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
            style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}
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
                backgroundColor: '#fef3c7',
                paddingHorizontal: 6,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Ionicons name="star" size={10} color="#f59e0b" />
              <Text style={{ fontSize: 10, color: '#b45309', marginLeft: 4, fontWeight: '600' }}>
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      contentContainerStyle={{ padding: 20, paddingTop: 20 }}
    >
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 }}>
          {t.appTitle}
        </Text>
        {state.user?.firstName && (
          <Text style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>
            {state.language === 'zh-TW' ? `歡迎回來, ${state.user.firstName}` : `Welcome back, ${state.user.firstName}`}
          </Text>
        )}
      </View>

      <View style={{ gap: 16 }}>
        <Select
          label={state.language === 'zh-TW' ? '選擇探索國家' : t.destination}
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

        {selectedCountryId && (
          <Select
            label={state.language === 'zh-TW' ? '選擇城市/地區' : t.selectRegion}
            options={regionOptions}
            value={selectedRegionId}
            onChange={(value) => {
              setSelectedRegionId(value as number);
            }}
            placeholder={t.selectRegion}
            loading={loadingRegions}
          />
        )}

        {selectedRegionId && (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b' }}>
                {state.language === 'zh-TW' ? '抽取張數' : (t.pullCount || 'Pull Count')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    state.language === 'zh-TW' ? '抽取張數說明' : 'Pull Count Info',
                    state.language === 'zh-TW' 
                      ? '每次扭蛋可抽取 5-12 張景點卡片。張數越多，行程越豐富！每日上限 36 張。'
                      : 'You can draw 5-12 place cards per gacha. More cards mean a richer itinerary! Daily limit is 36 cards.'
                  );
                }}
                style={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: 12, 
                  backgroundColor: '#e2e8f0', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Ionicons name="information-circle-outline" size={18} color="#6366f1" />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>5</Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#6366f1' }}>
                {pullCount} {t.pulls || '張'}
              </Text>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>12</Text>
            </View>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={5}
              maximumValue={12}
              step={1}
              value={pullCount}
              onValueChange={(value) => setPullCount(Math.round(value))}
              minimumTrackTintColor="#6366f1"
              maximumTrackTintColor="#e2e8f0"
              thumbTintColor="#6366f1"
            />
          </View>
        )}

        <Button
          title={t.startGacha}
          onPress={handleGacha}
          disabled={!canSubmit || showLoadingAd}
          style={{ marginTop: 8 }}
        />
      </View>

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
                borderBottomColor: '#f1f5f9',
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b' }}>
                {t.poolPreview || '獎池預覽'}
              </Text>
              <TouchableOpacity
                onPress={() => setPoolModalVisible(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#f1f5f9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {loadingPool ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>
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
                      <Ionicons name="ticket" size={18} color="#d97706" />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#d97706', marginLeft: 6 }}>
                        {state.language === 'zh-TW' ? 'SP/SSR 稀有優惠券' : 'SP/SSR Rare Coupons'} ({(prizePoolData?.coupons?.length || 0) + (Array.isArray(couponPoolData) ? couponPoolData.length : 0)})
                      </Text>
                    </View>
                    
                    {prizePoolData?.coupons?.map((coupon) => (
                      <View
                        key={`prize-${coupon.id}`}
                        style={{
                          backgroundColor: coupon.rarity === 'SP' ? '#fef3c7' : '#ddd6fe',
                          borderRadius: 12,
                          padding: 14,
                          marginBottom: 10,
                          borderWidth: 2,
                          borderColor: coupon.rarity === 'SP' ? '#f59e0b' : '#8b5cf6',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                          <View
                            style={{
                              backgroundColor: coupon.rarity === 'SP' ? '#f59e0b' : '#8b5cf6',
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
                        
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 4 }}>
                          {coupon.title}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="location-outline" size={12} color="#94a3b8" />
                          <Text style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>
                            {coupon.placeName}
                          </Text>
                        </View>
                      </View>
                    ))}
                    
                    {(Array.isArray(couponPoolData) ? couponPoolData : []).map((coupon) => (
                      <View
                        key={`coupon-${coupon.id}`}
                        style={{
                          backgroundColor: coupon.rarity === 'SSR' ? '#fef3c7' : '#f3e8ff',
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
                                backgroundColor: '#ef4444',
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
                        
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 2 }}>
                          {coupon.title}
                        </Text>
                        
                        {coupon.merchantName && (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="storefront-outline" size={12} color="#94a3b8" />
                            <Text style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>
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
                        backgroundColor: '#fef3c7',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="ticket-outline" size={40} color="#d97706" />
                    </View>
                    <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
                      {state.language === 'zh-TW' ? '此區域尚無稀有優惠券' : 'No rare coupons in this region'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <LoadingAdScreen
        visible={showLoadingAd}
        onComplete={handleLoadingComplete}
        isApiComplete={isApiComplete}
        translations={{
          generatingItinerary: t.generatingItinerary || '正在生成行程...',
          sponsorAd: t.sponsorAd || '贊助商廣告 (模擬)',
          pleaseWait: t.pleaseWait || '請稍候',
          almostReady: t.almostReady || '即將完成',
        }}
      />
    </ScrollView>
  );
}
