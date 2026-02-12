/**
 * CreateItineraryModal - 建立行程 Modal
 *
 * 從 ItineraryScreenV2 抽離的子元件，負責：
 * - 行程標題輸入
 * - 日期選擇（月曆）
 * - 國家/城市選擇
 * - 呼叫 API 建立行程
 *
 * 更新日期：2026-02-12（Phase 2A 元件抽離）
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useI18n } from '../../../context/AppContext';
import { itineraryApi } from '../../../services/itineraryApi';
import { preloadService } from '../../../services/preloadService';
import { MibuBrand } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import { Select } from '../../shared/components/ui/Select';
import type { Country, Region } from '../../../types';
import type { Itinerary } from '../../../types/itinerary';
import styles from './ItineraryScreenV2.styles';

// ============ Props ============

interface CreateItineraryModalProps {
  visible: boolean;
  onClose: () => void;
  /** 建立成功後的回調，傳回新行程 */
  onCreated: (itinerary: Itinerary) => void;
}

// ============ 主元件 ============

export function CreateItineraryModal({
  visible,
  onClose,
  onCreated,
}: CreateItineraryModalProps) {
  const insets = useSafeAreaInsets();
  const { getToken } = useAuth();
  const { t, language } = useI18n();

  // ===== 表單狀態 =====
  const [creating, setCreating] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [newItinerary, setNewItinerary] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    countryId: null as number | null,
    countryName: '',
    regionId: null as number | null,
    regionName: '',
  });

  // ===== 地區資料 =====
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);

  // ===== 開啟時重置表單 =====
  useEffect(() => {
    if (visible) {
      setShowCalendar(false);
      setNewItinerary({
        title: '',
        date: new Date().toISOString().split('T')[0],
        countryId: null,
        countryName: '',
        regionId: null,
        regionName: '',
      });
      setRegions([]);
      if (countries.length === 0) {
        loadCountries();
      }
    }
  }, [visible]);

  // ===== 選擇國家時載入城市 =====
  useEffect(() => {
    if (newItinerary.countryId) {
      loadRegions(newItinerary.countryId);
    }
  }, [newItinerary.countryId]);

  // ===== API 呼叫 =====

  const loadCountries = useCallback(async () => {
    setLoadingCountries(true);
    try {
      const data = await preloadService.getCountries();
      setCountries(data);
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  const loadRegions = useCallback(async (countryId: number) => {
    setLoadingRegions(true);
    setRegions([]);
    setNewItinerary(prev => ({ ...prev, regionId: null, regionName: '' }));
    try {
      const data = await preloadService.getRegions(countryId);
      setRegions(data);
    } catch (error) {
      console.error('Failed to load regions:', error);
    } finally {
      setLoadingRegions(false);
    }
  }, []);

  const getLocalizedName = useCallback((item: Country | Region): string => {
    if (language === 'zh-TW') return item.nameZh || item.nameEn || '';
    return item.nameEn || item.nameZh || '';
  }, [language]);

  // ===== 建立行程 =====

  const handleCreate = useCallback(async () => {
    if (!newItinerary.countryName || !newItinerary.regionName) {
      Alert.alert(t.itinerary_incomplete, t.itinerary_selectCountryCity);
      return;
    }
    const token = await getToken();
    if (!token) return;

    setCreating(true);
    try {
      const trimmedTitle = newItinerary.title.trim();
      const res = await itineraryApi.createItinerary({
        ...(trimmedTitle ? { title: trimmedTitle } : {}),
        date: newItinerary.date,
        country: newItinerary.countryName,
        city: newItinerary.regionName,
      }, token);

      if (res.success) {
        // 如果用戶有填標題但後端沒套用，補一次 updateItinerary
        let finalItinerary = res.itinerary;
        if (trimmedTitle && res.itinerary.title !== trimmedTitle) {
          const updateRes = await itineraryApi.updateItinerary(
            res.itinerary.id,
            { title: trimmedTitle },
            token,
          );
          if (updateRes.success) {
            finalItinerary = updateRes.itinerary;
          }
        }

        onClose();
        onCreated(finalItinerary);
      } else {
        Alert.alert(t.itinerary_createFailed, res.message || t.itinerary_tryAgainLater);
      }
    } catch (error) {
      console.error('Create itinerary error:', error);
      Alert.alert(t.itinerary_createFailed, t.itinerary_networkError);
    } finally {
      setCreating(false);
    }
  }, [newItinerary, getToken, t, onClose, onCreated]);

  // ===== 渲染 =====

  const canCreate = !!newItinerary.countryId && !!newItinerary.regionId;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.createModalContainer, { paddingTop: insets.top }]}>
        {/* Header：關閉 + 標題 */}
        <View style={styles.createModalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.modalCloseButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={MibuBrand.copper} />
          </TouchableOpacity>
          <Text style={styles.createModalTitle}>
            {t.itinerary_newItinerary}
          </Text>
          {/* 佔位，讓標題置中 */}
          <View style={{ width: 44 }} />
        </View>

        {/* 卡片區 */}
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.createCardScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.createCard}>
            {/* 行程標題（可選） */}
            <View style={styles.createFieldGroup}>
              <View style={styles.createFieldIcon}>
                <Ionicons name="create-outline" size={18} color={MibuBrand.copper} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.createFieldLabel}>{t.itinerary_tripTitle}</Text>
                <TextInput
                  style={styles.createFieldInput}
                  value={newItinerary.title}
                  onChangeText={(text) => setNewItinerary(prev => ({ ...prev, title: text }))}
                  placeholder={t.itinerary_tripTitlePlaceholder}
                  placeholderTextColor={MibuBrand.tan}
                  maxLength={50}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* 分隔線 */}
            <View style={styles.createDivider} />

            {/* 日期（月曆選擇器） */}
            <View style={styles.createFieldGroup}>
              <View style={styles.createFieldIcon}>
                <Ionicons name="calendar-outline" size={18} color={MibuBrand.copper} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.createFieldLabel}>{t.itinerary_date}</Text>
                <TouchableOpacity
                  style={[styles.createFieldInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                  onPress={() => setShowCalendar(!showCalendar)}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: FontSize.md, color: MibuBrand.brownDark }}>
                    {newItinerary.date}
                  </Text>
                  <Ionicons
                    name={showCalendar ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={MibuBrand.copper}
                  />
                </TouchableOpacity>
                {showCalendar && (
                  <View style={{ marginTop: Spacing.sm, borderRadius: Radius.md, overflow: 'hidden' }}>
                    <Calendar
                      current={newItinerary.date}
                      onDayPress={(day: { dateString: string }) => {
                        setNewItinerary(prev => ({ ...prev, date: day.dateString }));
                        setShowCalendar(false);
                      }}
                      markedDates={{
                        [newItinerary.date]: { selected: true, selectedColor: MibuBrand.brown },
                      }}
                      theme={{
                        backgroundColor: MibuBrand.warmWhite,
                        calendarBackground: MibuBrand.warmWhite,
                        todayTextColor: MibuBrand.copper,
                        selectedDayBackgroundColor: MibuBrand.brown,
                        selectedDayTextColor: MibuBrand.warmWhite,
                        arrowColor: MibuBrand.copper,
                        monthTextColor: MibuBrand.brownDark,
                        dayTextColor: MibuBrand.brownDark,
                        textDisabledColor: MibuBrand.tan,
                        textDayFontWeight: '500',
                        textMonthFontWeight: '700',
                        textDayHeaderFontWeight: '600',
                        textDayFontSize: FontSize.md,
                        textMonthFontSize: FontSize.lg,
                        textDayHeaderFontSize: FontSize.sm,
                      }}
                    />
                  </View>
                )}
              </View>
            </View>

            {/* 分隔線 */}
            <View style={styles.createDivider} />

            {/* 國家 + 城市並排 */}
            <View style={styles.createFieldGroup}>
              <View style={styles.createFieldIcon}>
                <Ionicons name="globe-outline" size={18} color={MibuBrand.copper} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.createLocationRow}>
                  {/* 國家 */}
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Select
                      label={t.itinerary_country}
                      options={countries.map(c => ({ label: getLocalizedName(c), value: c.id }))}
                      value={newItinerary.countryId || null}
                      onChange={(value) => {
                        const country = countries.find(c => c.id === value);
                        setNewItinerary(prev => ({
                          ...prev,
                          countryId: value as number,
                          countryName: country ? getLocalizedName(country) : '',
                          regionId: null,
                          regionName: '',
                        }));
                      }}
                      placeholder={t.itinerary_countryPlaceholder}
                      loading={loadingCountries}
                    />
                  </View>
                  {/* 城市 */}
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <Select
                      label={t.itinerary_city}
                      options={regions.map(r => ({ label: getLocalizedName(r), value: r.id }))}
                      value={newItinerary.regionId || null}
                      onChange={(value) => {
                        const region = regions.find(r => r.id === value);
                        setNewItinerary(prev => ({
                          ...prev,
                          regionId: value as number,
                          regionName: region?.nameZh || '',
                        }));
                      }}
                      placeholder={t.itinerary_cityPlaceholder}
                      loading={loadingRegions || !newItinerary.countryId}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* 底部建立按鈕 */}
        <View style={[styles.createBottomBar, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <TouchableOpacity
            onPress={handleCreate}
            style={[
              styles.createBottomButton,
              !canCreate && styles.createBottomButtonDisabled,
            ]}
            disabled={!canCreate || creating}
            activeOpacity={0.8}
          >
            {creating ? (
              <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color={MibuBrand.warmWhite} style={{ marginRight: Spacing.sm }} />
                <Text style={styles.createBottomButtonText}>
                  {t.itinerary_createItinerary}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
