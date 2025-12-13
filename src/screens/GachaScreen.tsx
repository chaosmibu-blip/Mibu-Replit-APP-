import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { apiService } from '../services/api';
import { Country, Region, GachaItem, Language } from '../types';
import { DEFAULT_LEVEL, MAX_DAILY_GENERATIONS } from '../constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_LIMIT_KEY = '@mibu_daily_limit';

export function GachaScreen() {
  const { state, t, updateState, addToCollection, setResult, setLoading } = useApp();
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [districtCount, setDistrictCount] = useState(0);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(false);

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountryId) {
      loadRegions(selectedCountryId);
    }
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedRegionId) {
      loadDistricts(selectedRegionId);
    }
  }, [selectedRegionId]);

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

  const loadDistricts = async (regionId: number) => {
    try {
      const data = await apiService.getDistricts(regionId);
      setDistrictCount(data.count);
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  };

  const getLocalizedName = (item: Country | Region): string => {
    switch (state.language) {
      case 'ja': return item.nameJa || item.nameZh || item.nameEn;
      case 'ko': return item.nameKo || item.nameZh || item.nameEn;
      case 'en': return item.nameEn;
      default: return item.nameZh || item.nameEn;
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

    setLoading(true);

    try {
      const response = await apiService.generateItinerary({
        countryId: selectedCountryId,
        regionId: selectedRegionId,
        language: state.language,
        itemCount: level,
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
      }));

      await incrementDailyCount();
      addToCollection(items);

      setResult({
        status: 'success',
        meta: {
          date: new Date().toISOString().split('T')[0],
          country: itinerary.location.country.name,
          city: itinerary.location.region.nameZh || itinerary.location.region.name,
          locked_district: itinerary.location.district.nameZh || itinerary.location.district.name,
          user_level: level,
        },
        inventory: items,
      });

      updateState({ view: 'result' as any });
    } catch (error) {
      console.error('Gacha failed:', error);
      Alert.alert('Error', 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const countryOptions = countries.map(c => ({
    label: getLocalizedName(c),
    value: c.id,
  }));

  const regionOptions = regions.map(r => ({
    label: getLocalizedName(r),
    value: r.id,
  }));

  const canSubmit = selectedCountryId && selectedRegionId && districtCount > 0;

  const getLevelLabel = () => {
    return `${level} ${t.stops}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.appTitle}</Text>
        {state.user?.firstName && (
          <Text style={styles.subtitle}>
            {state.language === 'zh-TW' ? `歡迎回來, ${state.user.firstName}` : `Welcome back, ${state.user.firstName}`}
          </Text>
        )}
      </View>

      <View style={styles.form}>
        <Select
          label={state.language === 'zh-TW' ? '選擇探索國家' : t.destination}
          options={countryOptions}
          value={selectedCountryId}
          onChange={(value) => {
            setSelectedCountryId(value as number);
            setSelectedRegionId(null);
            setRegions([]);
            setDistrictCount(0);
          }}
          placeholder={t.selectCountry}
          loading={loadingCountries}
        />

        {selectedCountryId && (
          <Select
            label={state.language === 'zh-TW' ? '選擇城市/地區' : t.selectRegion}
            options={regionOptions}
            value={selectedRegionId}
            onChange={(value) => setSelectedRegionId(value as number)}
            placeholder={t.selectRegion}
            loading={loadingRegions}
          />
        )}

        {selectedRegionId && (
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>{t.itineraryPace}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{getLevelLabel()}</Text>
              </View>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={12}
              step={1}
              value={level}
              onValueChange={setLevel}
              minimumTrackTintColor="#6366f1"
              maximumTrackTintColor="#e2e8f0"
              thumbTintColor="#6366f1"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>{t.relaxed}</Text>
              <Text style={styles.sliderLabelText}>{t.packed}</Text>
            </View>
          </View>
        )}

        <Button
          title={t.startGacha}
          onPress={handleGacha}
          disabled={!canSubmit}
          loading={state.loading}
          style={styles.gachaButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  levelBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  gachaButton: {
    marginTop: 16,
  },
});
