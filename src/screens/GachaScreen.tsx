import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { LoadingAdScreen } from '../components/LoadingAdScreen';
import { apiService } from '../services/api';
import { Country, Region, GachaItem } from '../types';
import { MAX_DAILY_GENERATIONS } from '../constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_LIMIT_KEY = '@mibu_daily_limit';

const PULL_COUNT_OPTIONS = [
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '8', value: 8 },
];

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

  const checkDailyLimit = async (): Promise<boolean> => {
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

      const { itinerary } = response;

      const items: GachaItem[] = itinerary.items.map((item: any, index: number) => ({
        id: Date.now() + index,
        place_name: item.place?.name || `${itinerary.location.district.name} ${item.subcategory.name}`,
        description: `${itinerary.location.region.name} ${itinerary.location.district.name}`,
        ai_description: item.place?.description || '',
        category: item.category.code,
        suggested_time: '',
        duration: '1h',
        search_query: '',
        color_hex: item.category.colorHex || '#6366f1',
        country: itinerary.location.country.name,
        city: itinerary.location.region.nameZh || itinerary.location.region.name,
        cityDisplay: itinerary.location.region.name,
        district: itinerary.location.district.nameZh || itinerary.location.district.name,
        districtDisplay: itinerary.location.district.name,
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
          country: itinerary.location.country.name,
          city: itinerary.location.region.nameZh || itinerary.location.region.name,
          locked_district: itinerary.location.district.nameZh || itinerary.location.district.name,
          user_level: pullCount,
        },
      };

      setIsApiComplete(true);
    } catch (error) {
      console.error('Gacha failed:', error);
      setShowLoadingAd(false);
      Alert.alert('Error', 'Failed to generate itinerary. Please try again.');
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

  const pullCountOptions = PULL_COUNT_OPTIONS.map(opt => ({
    label: `${opt.value} ${t.pulls || '張'}`,
    value: opt.value,
  }));

  const canSubmit = selectedCountryId && selectedRegionId;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
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
          <Select
            label={state.language === 'zh-TW' ? '抽取張數' : (t.pullCount || 'Pull Count')}
            options={pullCountOptions}
            value={pullCount}
            onChange={(value) => setPullCount(value as number)}
            placeholder={`${pullCount} ${t.pulls || '張'}`}
          />
        )}

        <Button
          title={t.startGacha}
          onPress={handleGacha}
          disabled={!canSubmit || showLoadingAd}
          style={{ marginTop: 8 }}
        />
      </View>

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
