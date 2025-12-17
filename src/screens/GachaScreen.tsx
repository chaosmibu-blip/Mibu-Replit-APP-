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
import { Country, Region, GachaItem, GachaPoolItem, GachaPoolResponse, RegionPoolCoupon } from '../types';
import { MAX_DAILY_GENERATIONS, getCategoryColor } from '../constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UNLIMITED_EMAILS = ['s8869420@gmail.com'];

const DAILY_LIMIT_KEY = '@mibu_daily_limit';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RARITY_COLORS: Record<string, string> = {
  SP: '#fbbf24',
  SSR: '#a855f7',
  SR: '#3b82f6',
  R: '#22c55e',
  N: '#94a3b8',
};

const RARITY_BG_COLORS: Record<string, string> = {
  SP: '#fef3c7',
  SSR: '#f3e8ff',
  SR: '#dbeafe',
  R: '#dcfce7',
  N: '#f1f5f9',
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
  
  const [couponPoolModalVisible, setCouponPoolModalVisible] = useState(false);
  const [couponPoolData, setCouponPoolData] = useState<RegionPoolCoupon[]>([]);
  const [loadingCouponPool, setLoadingCouponPool] = useState(false);
  
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
    
    try {
      const city = selectedRegion.nameZh || selectedRegion.nameEn || '';
      const data = await apiService.getGachaPool(city);
      setPoolData(data);
    } catch (error) {
      console.error('Failed to load pool:', error);
      setPoolData(null);
    } finally {
      setLoadingPool(false);
    }
  };

  const handleViewCouponPool = async () => {
    if (!selectedRegionId) return;
    
    setLoadingCouponPool(true);
    setCouponPoolModalVisible(true);
    
    try {
      const token = await AsyncStorage.getItem('@mibu_token');
      if (token) {
        const data = await apiService.getRegionCouponPool(token, selectedRegionId);
        setCouponPoolData(data || []);
      } else {
        setCouponPoolData([]);
      }
    } catch (error) {
      console.error('Failed to load coupon pool:', error);
      setCouponPoolData([]);
    } finally {
      setLoadingCouponPool(false);
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
      const response = await apiService.generateItinerary({
        countryId: selectedCountryId,
        regionId: selectedRegionId,
        language: state.language,
        itemCount: pullCount,
      });

      if (response.meta?.code === 'NO_PLACES_AVAILABLE' || response.error) {
        setShowLoadingAd(false);
        const errorMessage = response.error || (state.language === 'zh-TW' ? '該區域暫無景點' : 'No places available in this area');
        Alert.alert(
          state.language === 'zh-TW' ? '提示' : 'Notice',
          errorMessage
        );
        return;
      }

      if (!response.itinerary || !response.itinerary.items || response.itinerary.items.length === 0) {
        setShowLoadingAd(false);
        Alert.alert(
          state.language === 'zh-TW' ? '提示' : 'Notice',
          state.language === 'zh-TW' ? '該區域暫無景點，請嘗試其他地區' : 'No places available in this area. Please try another region.'
        );
        return;
      }

      const { itinerary } = response;

      const items: GachaItem[] = itinerary.items.map((item: any, index: number) => ({
        id: Date.now() + index,
        place_name: item.place?.name || `${itinerary.location.district?.name || ''} ${item.subcategory?.name || ''}`,
        description: `${itinerary.location.region?.name || ''} ${itinerary.location.district?.name || ''}`,
        ai_description: item.place?.description || '',
        category: item.category?.code || '',
        suggested_time: '',
        duration: '1h',
        search_query: '',
        color_hex: item.category?.colorHex || '#6366f1',
        country: itinerary.location.country?.name || '',
        city: itinerary.location.region?.nameZh || itinerary.location.region?.name || '',
        cityDisplay: itinerary.location.region?.name || '',
        district: itinerary.location.district?.nameZh || itinerary.location.district?.name || '',
        districtDisplay: itinerary.location.district?.name || '',
        collectedAt: new Date().toISOString(),
        is_coupon: false,
        coupon_data: null,
        place_id: item.place?.placeId || null,
        verified_name: item.place?.name || null,
        verified_address: item.place?.address || null,
        google_rating: item.place?.rating || null,
        google_types: item.place?.googleTypes || [],
        primary_type: item.place?.primaryType || null,
        location: item.place?.location || null,
        is_location_verified: item.isVerified || false,
        merchant: item.merchant || null,
        coupon: item.coupon || null,
        rarity: item.rarity || 'N',
      }));

      await incrementDailyCount();

      pendingResultRef.current = {
        items,
        meta: {
          date: new Date().toISOString().split('T')[0],
          country: itinerary.location.country?.name || '',
          city: itinerary.location.region?.nameZh || itinerary.location.region?.name || '',
          locked_district: itinerary.location.district?.nameZh || itinerary.location.district?.name || '',
          user_level: pullCount,
        },
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

  const canViewPool = selectedRegionId;
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

  const getRareItems = () => {
    if (!poolData?.items) return [];
    return poolData.items.filter(item => 
      item.rarity === 'SP' || item.rarity === 'SSR' || item.rarity === 'SR'
    );
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
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 12 }}>
              {state.language === 'zh-TW' ? '抽取張數' : (t.pullCount || 'Pull Count')}
            </Text>
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

        {canViewPool && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#eef2ff',
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 6,
              }}
              onPress={handleViewPool}
            >
              <Ionicons name="eye-outline" size={18} color="#6366f1" />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#6366f1' }}>
                {t.viewPool || '獎池'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fef3c7',
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 6,
              }}
              onPress={handleViewCouponPool}
            >
              <Ionicons name="ticket-outline" size={18} color="#d97706" />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#d97706' }}>
                {state.language === 'zh-TW' ? '優惠券' : 'Coupons'}
              </Text>
            </TouchableOpacity>
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
              <View style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748b' }}>
                    {t.rareItems || '稀有道具'} ({getRareItems().length})
                  </Text>
                </View>
                
                {getRareItems().length > 0 ? (
                  <FlatList
                    data={getRareItems()}
                    renderItem={renderPoolItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: '#f1f5f9',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="cube-outline" size={40} color="#94a3b8" />
                    </View>
                    <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center' }}>
                      {t.noRareItems || '此區域尚無稀有道具'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={couponPoolModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCouponPoolModalVisible(false)}
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
              minHeight: '50%',
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
                {state.language === 'zh-TW' ? '稀有優惠券' : 'Rare Coupons'}
              </Text>
              <TouchableOpacity
                onPress={() => setCouponPoolModalVisible(false)}
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

            {loadingCouponPool ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color="#d97706" />
                <Text style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>
                  {state.language === 'zh-TW' ? '載入優惠券中...' : 'Loading coupons...'}
                </Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1, padding: 16 }}>
                {couponPoolData.length > 0 ? (
                  couponPoolData.map((coupon) => (
                    <View
                      key={coupon.id}
                      style={{
                        backgroundColor: coupon.rarity === 'SSR' ? '#fef3c7' : '#f3e8ff',
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 2,
                        borderColor: coupon.rarity === 'SSR' ? '#fbbf24' : '#a855f7',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View
                          style={{
                            backgroundColor: coupon.rarity === 'SSR' ? '#fbbf24' : '#a855f7',
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 8,
                            marginRight: 8,
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff' }}>
                            {coupon.rarity}
                          </Text>
                        </View>
                        {coupon.discount && (
                          <View
                            style={{
                              backgroundColor: '#ef4444',
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>
                              {coupon.discount}
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 }}>
                        {coupon.title}
                      </Text>
                      
                      {coupon.description && (
                        <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                          {coupon.description}
                        </Text>
                      )}
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="storefront-outline" size={14} color="#94a3b8" />
                        <Text style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
                          {coupon.merchantName}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: '#f1f5f9',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="ticket-outline" size={40} color="#94a3b8" />
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
