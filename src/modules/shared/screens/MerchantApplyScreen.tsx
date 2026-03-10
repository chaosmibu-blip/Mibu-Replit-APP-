/**
 * ============================================================
 * 商家申請畫面 (MerchantApplyScreen.tsx)
 * ============================================================
 * 此模組提供: 用戶申請成為 Mibu 合作商家的完整流程
 *
 * 主要功能:
 * - 依申請狀態顯示不同畫面（none/pending/approved/rejected）
 * - 12 題問卷表單（基本資料、經營現況、合作意願、聯絡方式）
 * - 填寫問卷並提交申請
 * - 被拒絕後可重新申請
 *
 * 串接的 API:
 * - GET /api/merchant/application-status — 查詢申請狀態
 * - POST /api/merchant/apply — 提交商家申請（businessName, email, surveyResponses: JSONB）
 *
 * 更新日期：2026-02-22（問卷改版：3 題 → 12 題）
 * @see 後端合約: contracts/APP.md
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, useI18n } from '../../../context/AppContext';
import {
  useMerchantApplicationStatus,
  useApplyMerchant,
  useSearchPlaces,
  useResolveGoogleMapsUrl,
} from '../../../hooks/useMerchantQueries';
import type { PlaceSearchResult, ResolveUrlResponse, MerchantApplyRequest, MerchantSurveyResponses, ResolvedPlace } from '../../../types/merchant';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';
import { ErrorState } from '../components/ui/ErrorState';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import {
  SurveySectionTitle,
  TextInputField,
  SingleSelectField,
  MultiSelectField,
  RegionPickerField,
} from '../components/SurveyFields';

// ============ 常數定義 ============

const HEADER_ICON_SIZE = 24;
const STATUS_ICON_SIZE = 64;
const MAX_CHALLENGES = 3;
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_CHARS = 2;

type BindingMode = 'none' | 'search' | 'url' | 'manual';

// ============ 元件本體 ============

export function MerchantApplyScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: statusData, isLoading: isLoadingStatus, isError: isStatusError, refetch: refetchStatus } = useMerchantApplicationStatus();
  const applyMutation = useApplyMerchant();

  // ========== 表單狀態 ==========

  // 第一段：基本資料
  const [contactName, setContactName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessRegion, setBusinessRegion] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // 第二段：經營現況
  const [customerSources, setCustomerSources] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [monthlyMarketingBudget, setMonthlyMarketingBudget] = useState('');
  const [onlineChannels, setOnlineChannels] = useState<string[]>([]);

  // 第三段：合作意願
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [gamificationInterest, setGamificationInterest] = useState('');

  // 第四段：聯絡方式
  const [contactMethod, setContactMethod] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');

  // 店家綁定（選填）
  const [bindingMode, setBindingMode] = useState<BindingMode>('none');
  const [isBindingExpanded, setIsBindingExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [resolvedPlace, setResolvedPlace] = useState<ResolveUrlResponse['place'] | null>(null);
  const [manualPlaceName, setManualPlaceName] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPlacesMutation = useSearchPlaces();
  const resolveUrlMutation = useResolveGoogleMapsUrl();

  // 重新申請模式：覆蓋 API 狀態，強制顯示表單
  const [isReapplying, setIsReapplying] = useState(false);

  // ========== 衍生狀態 ==========
  const rawStatus = statusData?.status ?? 'none';
  const applicationStatus = isReapplying ? 'none' : rawStatus;
  const rejectionReason = statusData?.application?.rejectionReason ?? null;

  const isFormValid =
    contactName.trim().length > 0 &&
    businessName.trim().length > 0 &&
    businessCategory.length > 0 &&
    businessRegion.length > 0 &&
    customerSources.length > 0 &&
    challenges.length > 0 &&
    monthlyMarketingBudget.length > 0 &&
    onlineChannels.length > 0 &&
    desiredOutcome.length > 0 &&
    gamificationInterest.length > 0 &&
    contactMethod.trim().length > 0 &&
    email.trim().length > 0;

  // ========== 選項定義 ==========

  const categoryOptions = [
    { value: 'restaurant', label: t.merchant_catRestaurant },
    { value: 'hotel', label: t.merchant_catHotel },
    { value: 'attraction', label: t.merchant_catAttraction },
    { value: 'specialty_shop', label: t.merchant_catSpecialtyShop },
    { value: 'experience', label: t.merchant_catExperience },
    { value: 'other', label: t.merchant_catOther },
  ];

  const customerSourceOptions = [
    { value: 'walk_in', label: t.merchant_srcWalkIn },
    { value: 'online_search', label: t.merchant_srcOnlineSearch },
    { value: 'social_media', label: t.merchant_srcSocialMedia },
    { value: 'travel_platform', label: t.merchant_srcTravelPlatform },
    { value: 'word_of_mouth', label: t.merchant_srcWordOfMouth },
    { value: 'other', label: t.merchant_srcOther },
  ];

  const challengeOptions = [
    { value: 'attract_tourists', label: t.merchant_chalAttract },
    { value: 'online_presence', label: t.merchant_chalOnline },
    { value: 'repeat_customers', label: t.merchant_chalRepeat },
    { value: 'competition', label: t.merchant_chalCompetition },
    { value: 'marketing_cost', label: t.merchant_chalCost },
    { value: 'language_barrier', label: t.merchant_chalLanguage },
    { value: 'other', label: t.merchant_chalOther },
  ];

  const budgetOptions = [
    { value: 'none', label: t.merchant_budgetNone },
    { value: 'under5k', label: t.merchant_budgetUnder5k },
    { value: '5k-20k', label: t.merchant_budget5to20k },
    { value: 'over20k', label: t.merchant_budgetOver20k },
  ];

  const onlineChannelOptions = [
    { value: 'google_maps', label: t.merchant_chanGoogleMaps },
    { value: 'facebook', label: t.merchant_chanFacebook },
    { value: 'instagram', label: t.merchant_chanInstagram },
    { value: 'line_oa', label: t.merchant_chanLineOA },
    { value: 'own_website', label: t.merchant_chanWebsite },
    { value: 'none', label: t.merchant_chanNone },
  ];

  const outcomeOptions = [
    { value: 'more_tourists', label: t.merchant_outMoreTourists },
    { value: 'brand_awareness', label: t.merchant_outBrand },
    { value: 'higher_revenue', label: t.merchant_outRevenue },
    { value: 'repeat_visit', label: t.merchant_outRepeat },
    { value: 'other', label: t.merchant_outOther },
  ];

  const gamificationOptions = [
    { value: 'very_interested', label: t.merchant_gamVeryInterested },
    { value: 'willing_to_try', label: t.merchant_gamWillingToTry },
    { value: 'need_more_info', label: t.merchant_gamNeedInfo },
    { value: 'not_interested', label: t.merchant_gamNotInterested },
  ];

  // ========== 事件處理 ==========

  const handleGoBack = () => router.back();

  const handleToggleCustomerSource = useCallback((value: string) => {
    setCustomerSources(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }, []);

  const handleToggleChallenge = useCallback((value: string) => {
    setChallenges(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }, []);

  const handleToggleOnlineChannel = useCallback((value: string) => {
    setOnlineChannels(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }, []);

  const handleSubmit = () => {
    if (!isFormValid) return;

    const surveyResponses: MerchantSurveyResponses = {
      contactName: contactName.trim(),
      taxId: taxId.trim() || undefined,
      industryCategory: businessCategory,
      region: businessRegion,
      address: businessAddress.trim() || undefined,
      customerSources,
      challenges,
      marketingBudget: monthlyMarketingBudget,
      onlineChannels,
      expectedOutcome: desiredOutcome,
      gamificationView: gamificationInterest,
      contactInfo: contactMethod.trim(),
    };

    // 組合綁定資料（選填）
    const bindingParams: Partial<Pick<MerchantApplyRequest, 'claimedPlaceId' | 'claimedPlaceName' | 'claimedGooglePlaceId' | 'claimedGoogleMapsUrl' | 'claimedPlaceData'>> = {};
    if (selectedPlace) {
      bindingParams.claimedPlaceId = selectedPlace.id;
      bindingParams.claimedPlaceName = selectedPlace.placeName;
    }
    if (resolvedPlace) {
      bindingParams.claimedGooglePlaceId = resolvedPlace.googlePlaceId;
      bindingParams.claimedGoogleMapsUrl = googleMapsUrl;
      bindingParams.claimedPlaceName = resolvedPlace.placeName;
      bindingParams.claimedPlaceData = resolvedPlace;
    }
    if (manualPlaceName.trim()) {
      bindingParams.claimedPlaceName = manualPlaceName.trim();
    }

    applyMutation.mutate(
      {
        businessName: businessName.trim(),
        email: email.trim(),
        surveyResponses,
        ...bindingParams,
      },
      {
        onSuccess: () => {
          Alert.alert(
            t.merchant_applySuccess,
            t.merchant_applySuccessDesc,
            [{ text: 'OK', onPress: () => refetchStatus() }],
          );
        },
        onError: (error: Error) => {
          Alert.alert(t.common_error, error.message);
        },
      },
    );
  };

  const handleReapply = () => setIsReapplying(true);

  // ========== 店家綁定事件 ==========

  // 清理 debounce timer
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleSearchQueryChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (text.trim().length < MIN_SEARCH_CHARS) {
      setSearchResults([]);
      return;
    }

    searchTimerRef.current = setTimeout(() => {
      searchPlacesMutation.mutate({ query: text.trim() }, {
        onSuccess: (data: { places?: PlaceSearchResult[] }) => {
          setSearchResults(data?.places ?? []);
        },
      });
    }, SEARCH_DEBOUNCE_MS);
  }, [searchPlacesMutation]);

  const handleSelectPlace = useCallback((place: PlaceSearchResult) => {
    setSelectedPlace(place);
    setSearchResults([]);
    setSearchQuery(place.placeName ?? '');
  }, []);

  const handleClearSelectedPlace = useCallback(() => {
    setSelectedPlace(null);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleResolveUrl = useCallback(() => {
    if (!googleMapsUrl.trim()) return;
    resolveUrlMutation.mutate(googleMapsUrl.trim(), {
      onSuccess: (data: ResolveUrlResponse) => {
        setResolvedPlace(data.place);
      },
      onError: (error: Error) => {
        Alert.alert(t.common_error, error.message);
      },
    });
  }, [googleMapsUrl, resolveUrlMutation, t]);

  const handleClearResolvedPlace = useCallback(() => {
    setResolvedPlace(null);
    setGoogleMapsUrl('');
  }, []);

  const handleBindingModeChange = useCallback((mode: BindingMode) => {
    setBindingMode(mode);
    // 切換模式時清理其他模式的狀態
    setSelectedPlace(null);
    setSearchQuery('');
    setSearchResults([]);
    setResolvedPlace(null);
    setGoogleMapsUrl('');
    setManualPlaceName('');
  }, []);

  // ========== 渲染子函數 ==========

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="chevron-back" size={HEADER_ICON_SIZE} color={MibuBrand.brownDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t.merchant_applyTitle}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={MibuBrand.brown} />
    </View>
  );

  const renderPendingStatus = () => (
    <View style={styles.centerContainer}>
      <View style={styles.statusIconContainer}>
        <Ionicons name="hourglass-outline" size={STATUS_ICON_SIZE} color={MibuBrand.copper} />
      </View>
      <Text style={styles.statusTitle}>{t.merchant_statusPending}</Text>
      <Text style={styles.statusDescription}>{t.merchant_statusPendingDesc}</Text>
    </View>
  );

  const renderApprovedStatus = () => (
    <View style={styles.centerContainer}>
      <View style={[styles.statusIconContainer, styles.statusIconApproved]}>
        <Ionicons name="checkmark-circle-outline" size={STATUS_ICON_SIZE} color={MibuBrand.success} />
      </View>
      <Text style={styles.statusTitle}>{t.merchant_statusApproved}</Text>
      <Text style={styles.statusDescription}>{t.merchant_applyDesc}</Text>
    </View>
  );

  const renderRejectedStatus = () => (
    <View style={styles.centerContainer}>
      <View style={[styles.statusIconContainer, styles.statusIconRejected]}>
        <Ionicons name="close-circle-outline" size={STATUS_ICON_SIZE} color={MibuBrand.error} />
      </View>
      <Text style={styles.statusTitle}>{t.merchant_statusRejected}</Text>
      <Text style={styles.statusDescription}>{t.merchant_statusRejectedDesc}</Text>
      {rejectionReason && (
        <View style={styles.rejectionReasonCard}>
          <Text style={styles.rejectionReasonText}>{rejectionReason}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.submitButton} onPress={handleReapply}>
        <Text style={styles.submitButtonText}>{t.merchant_reapply}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderApplicationForm = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ===== 介紹卡片 ===== */}
      <View style={styles.introCard}>
        <Ionicons name="storefront-outline" size={32} color={MibuBrand.copper} style={styles.introIcon} />
        <Text style={styles.introTitle}>{t.merchant_applyTitle}</Text>
        <Text style={styles.introDescription}>{t.merchant_applyDesc}</Text>
      </View>

      {/* ===== 店家綁定（選填） ===== */}
      <TouchableOpacity
        style={styles.bindingHeader}
        onPress={() => setIsBindingExpanded(prev => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.bindingHeaderLeft}>
          <Ionicons name="location-outline" size={20} color={MibuBrand.copper} />
          <Text style={styles.bindingHeaderTitle}>
            {t.merchant_bindStore || '綁定店家（選填）'}
          </Text>
        </View>
        <Ionicons
          name={isBindingExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={MibuBrand.brownLight}
        />
      </TouchableOpacity>

      {isBindingExpanded && (
        <View style={styles.bindingContent}>
          {/* 模式切換 tabs */}
          <View style={styles.bindingTabs}>
            {([
              { mode: 'search' as BindingMode, label: t.merchant_claimSubtitle || '搜尋現有', icon: 'search-outline' as const },
              { mode: 'url' as BindingMode, label: 'Google 地圖', icon: 'map-outline' as const },
              { mode: 'manual' as BindingMode, label: t.merchant_manualInput || '手動輸入', icon: 'create-outline' as const },
            ]).map(({ mode, label, icon }) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.bindingTab,
                  bindingMode === mode && styles.bindingTabActive,
                ]}
                onPress={() => handleBindingModeChange(mode)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={icon}
                  size={16}
                  color={bindingMode === mode ? UIColors.white : MibuBrand.brown}
                />
                <Text
                  style={[
                    styles.bindingTabText,
                    bindingMode === mode && styles.bindingTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 搜尋現有模式 */}
          {bindingMode === 'search' && (
            <View style={styles.bindingModeContent}>
              {selectedPlace ? (
                <View style={styles.selectedPlaceCard}>
                  <View style={styles.selectedPlaceInfo}>
                    <Ionicons name="checkmark-circle" size={20} color={MibuBrand.success} />
                    <Text style={styles.selectedPlaceName} numberOfLines={1}>
                      {selectedPlace.placeName}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleClearSelectedPlace}>
                    <Ionicons name="close-circle" size={22} color={MibuBrand.brownLight} />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={18} color={MibuBrand.brownLight} style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      value={searchQuery}
                      onChangeText={handleSearchQueryChange}
                      placeholder={t.merchant_claimSubtitle || '搜尋並認領您的店家'}
                      placeholderTextColor={MibuBrand.brownLight}
                    />
                    {searchPlacesMutation.isPending && (
                      <ActivityIndicator size="small" color={MibuBrand.brown} />
                    )}
                  </View>
                  {searchResults.length > 0 && (
                    <View style={styles.searchResultsList}>
                      {searchResults.map((place, index) => (
                        <TouchableOpacity
                          key={place.id ?? index}
                          style={[
                            styles.searchResultItem,
                            index < searchResults.length - 1 && styles.searchResultItemBorder,
                          ]}
                          onPress={() => handleSelectPlace(place)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="location" size={16} color={MibuBrand.copper} />
                          <View style={styles.searchResultTextContainer}>
                            <Text style={styles.searchResultName} numberOfLines={1}>
                              {place.placeName}
                            </Text>
                            {(place.district || place.city) && (
                              <Text style={styles.searchResultAddress} numberOfLines={1}>
                                {[place.district, place.city].filter(Boolean).join(', ')}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* Google 地圖連結模式 */}
          {bindingMode === 'url' && (
            <View style={styles.bindingModeContent}>
              {resolvedPlace ? (
                <View style={styles.selectedPlaceCard}>
                  <View style={styles.selectedPlaceInfo}>
                    <Ionicons name="checkmark-circle" size={20} color={MibuBrand.success} />
                    <Text style={styles.selectedPlaceName} numberOfLines={1}>
                      {resolvedPlace.placeName}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleClearResolvedPlace}>
                    <Ionicons name="close-circle" size={22} color={MibuBrand.brownLight} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.urlInputRow}>
                  <TextInput
                    style={styles.urlInput}
                    value={googleMapsUrl}
                    onChangeText={setGoogleMapsUrl}
                    placeholder={t.merchant_googleMapUrlPlaceholder || '貼上 Google 地圖連結'}
                    placeholderTextColor={MibuBrand.brownLight}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={[
                      styles.resolveButton,
                      (!googleMapsUrl.trim() || resolveUrlMutation.isPending) && styles.resolveButtonDisabled,
                    ]}
                    onPress={handleResolveUrl}
                    disabled={!googleMapsUrl.trim() || resolveUrlMutation.isPending}
                    activeOpacity={0.7}
                  >
                    {resolveUrlMutation.isPending ? (
                      <ActivityIndicator size="small" color={UIColors.white} />
                    ) : (
                      <Text style={styles.resolveButtonText}>
                        {t.merchant_resolveUrl || '解析'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* 手動輸入模式 */}
          {bindingMode === 'manual' && (
            <View style={styles.bindingModeContent}>
              <TextInput
                style={styles.manualInput}
                value={manualPlaceName}
                onChangeText={setManualPlaceName}
                placeholder={t.merchant_manualPlaceholder || '輸入店家名稱'}
                placeholderTextColor={MibuBrand.brownLight}
              />
            </View>
          )}
        </View>
      )}

      {/* ===== 第一段：基本資料 ===== */}
      <SurveySectionTitle step={1} title={t.merchant_surveySection1} />
      <TextInputField label={t.merchant_surveyQ1Contact} value={contactName} onChangeText={setContactName} required />
      <TextInputField label={t.merchant_surveyQ2Business} value={businessName} onChangeText={setBusinessName} required />
      <TextInputField label={t.merchant_surveyTaxId} value={taxId} onChangeText={setTaxId} placeholder={t.merchant_surveyTaxIdPlaceholder} />
      <SingleSelectField label={t.merchant_surveyQ3Category} options={categoryOptions} selected={businessCategory} onSelect={setBusinessCategory} required />
      <RegionPickerField label={t.merchant_surveyQ4Region} value={businessRegion} onSelect={setBusinessRegion} required placeholder={t.merchant_surveyQ4Placeholder} />
      <TextInputField label={t.merchant_surveyAddress} value={businessAddress} onChangeText={setBusinessAddress} placeholder={t.merchant_surveyAddressPlaceholder} />

      {/* ===== 第二段：經營現況 ===== */}
      <SurveySectionTitle step={2} title={t.merchant_surveySection2} />
      <MultiSelectField
        label={t.merchant_surveyQ5Sources}
        options={customerSourceOptions}
        selected={customerSources}
        onToggle={handleToggleCustomerSource}
        required
      />
      <MultiSelectField
        label={t.merchant_surveyQ6Challenges}
        options={challengeOptions}
        selected={challenges}
        onToggle={handleToggleChallenge}
        required
        maxSelect={MAX_CHALLENGES}
        maxSelectHint={t.merchant_surveyQ6Hint}
      />
      <SingleSelectField label={t.merchant_surveyQ7Budget} options={budgetOptions} selected={monthlyMarketingBudget} onSelect={setMonthlyMarketingBudget} required />
      <MultiSelectField
        label={t.merchant_surveyQ8Channels}
        options={onlineChannelOptions}
        selected={onlineChannels}
        onToggle={handleToggleOnlineChannel}
        required
      />

      {/* ===== 第三段：合作意願 ===== */}
      <SurveySectionTitle step={3} title={t.merchant_surveySection3} />
      <SingleSelectField label={t.merchant_surveyQ9Outcome} options={outcomeOptions} selected={desiredOutcome} onSelect={setDesiredOutcome} required />
      <SingleSelectField label={t.merchant_surveyQ10Gamification} options={gamificationOptions} selected={gamificationInterest} onSelect={setGamificationInterest} required />

      {/* ===== 第四段：聯絡方式 ===== */}
      <SurveySectionTitle step={4} title={t.merchant_surveySection4} />
      <TextInputField label={t.merchant_surveyQ11ContactMethod} value={contactMethod} onChangeText={setContactMethod} required placeholder={t.merchant_surveyQ11Placeholder} />
      <TextInputField label={t.merchant_surveyQ12Email} value={email} onChangeText={setEmail} required keyboardType="email-address" />

      {/* ===== 提交按鈕 ===== */}
      <TouchableOpacity
        style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isFormValid || applyMutation.isPending}
      >
        {applyMutation.isPending ? (
          <ActivityIndicator size="small" color={UIColors.white} />
        ) : (
          <Text style={styles.submitButtonText}>{t.merchant_applyButton}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderError = () => (
    <View style={styles.centerContainer}>
      <ErrorState
        message={t.common_loadFailed}
        onRetry={() => refetchStatus()}
      />
    </View>
  );

  const renderContent = () => {
    if (isLoadingStatus) return renderLoading();
    if (isStatusError) return renderError();

    switch (applicationStatus) {
      case 'pending':
        return renderPendingStatus();
      case 'approved':
        return renderApprovedStatus();
      case 'rejected':
        return renderRejectedStatus();
      case 'none':
      default:
        return renderApplicationForm();
    }
  };

  // ========== 主要渲染 ==========

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderHeader()}
        {renderContent()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: MibuBrand.warmWhite },
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: MibuBrand.creamLight, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: MibuBrand.brownDark },
  headerSpacer: { width: 40 },

  introCard: {
    backgroundColor: MibuBrand.creamLight, borderRadius: Radius.xl, padding: Spacing.xl,
    alignItems: 'center', marginBottom: Spacing.md,
  },
  introIcon: { marginBottom: Spacing.md },
  introTitle: {
    fontSize: FontSize.xxl, fontWeight: '800', color: MibuBrand.brownDark,
    marginBottom: Spacing.sm, textAlign: 'center',
  },
  introDescription: {
    fontSize: FontSize.md, color: MibuBrand.brownLight, textAlign: 'center', lineHeight: 22,
  },

  submitButton: {
    backgroundColor: MibuBrand.brown, borderRadius: Radius.lg, paddingVertical: Spacing.lg,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xl,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: UIColors.white },

  statusIconContainer: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: MibuBrand.creamLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
  },
  statusIconApproved: { backgroundColor: SemanticColors.successLight },
  statusIconRejected: { backgroundColor: SemanticColors.errorLight },
  statusTitle: {
    fontSize: FontSize.xxl, fontWeight: '800', color: MibuBrand.brownDark,
    marginBottom: Spacing.md, textAlign: 'center',
  },
  statusDescription: {
    fontSize: FontSize.md, color: MibuBrand.brownLight, textAlign: 'center',
    lineHeight: 22, marginBottom: Spacing.xl,
  },
  rejectionReasonCard: {
    backgroundColor: SemanticColors.errorLight, borderRadius: Radius.md, padding: Spacing.lg,
    marginBottom: Spacing.xl, width: '100%',
  },
  rejectionReasonText: {
    fontSize: FontSize.md, color: MibuBrand.error, lineHeight: 22, textAlign: 'center',
  },

  // ========== 店家綁定樣式 ==========
  bindingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  bindingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bindingHeaderTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  bindingContent: {
    marginBottom: Spacing.lg,
  },
  bindingTabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  bindingTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    backgroundColor: UIColors.white,
  },
  bindingTabActive: {
    backgroundColor: MibuBrand.brown,
    borderColor: MibuBrand.brown,
  },
  bindingTabText: {
    fontSize: FontSize.sm,
    color: MibuBrand.brown,
    fontWeight: '500',
  },
  bindingTabTextActive: {
    color: UIColors.white,
  },
  bindingModeContent: {
    marginTop: Spacing.xs,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UIColors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  searchResultsList: {
    backgroundColor: UIColors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  searchResultItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  searchResultAddress: {
    fontSize: FontSize.sm,
    color: MibuBrand.brownLight,
    marginTop: 2,
  },
  selectedPlaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SemanticColors.successLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  selectedPlaceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  selectedPlaceName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    flex: 1,
  },
  urlInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  urlInput: {
    flex: 1,
    height: 44,
    backgroundColor: UIColors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  resolveButton: {
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolveButtonDisabled: {
    opacity: 0.5,
  },
  resolveButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: UIColors.white,
  },
  manualInput: {
    height: 44,
    backgroundColor: UIColors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
});
