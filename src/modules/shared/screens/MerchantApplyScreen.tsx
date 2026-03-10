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

import React, { useState, useCallback } from 'react';
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
import { MibuBrand } from '../../../../constants/Colors';
import { ErrorState } from '../components/ui/ErrorState';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import {
  SurveySectionTitle,
  TextInputField,
  SingleSelectField,
  MultiSelectField,
  RegionPickerField,
} from '../components/SurveyFields';
import type { MerchantApplyRequest, MerchantSurveyResponses, PlaceSearchResult, ResolvedPlace } from '../../../types/merchant';

// ============ 常數定義 ============

const HEADER_ICON_SIZE = 24;
const STATUS_ICON_SIZE = 64;
const MAX_CHALLENGES = 3;

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

  // 店家綁定
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [claimedPlace, setClaimedPlace] = useState<{
    placeId?: number;
    googlePlaceId?: string;
    googleMapsUrl?: string;
    placeName?: string;
    placeData?: MerchantApplyRequest['claimedPlaceData'];
  } | null>(null);

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

  const handleSearchPlace = () => {
    if (!placeSearchQuery.trim()) return;
    searchPlacesMutation.mutate({ query: placeSearchQuery.trim() });
  };

  const handleSelectSearchResult = (place: PlaceSearchResult) => {
    setClaimedPlace({
      placeId: place.id,
      placeName: place.placeName,
    });
    searchPlacesMutation.reset();
  };

  const handleResolveUrl = () => {
    if (!googleMapsUrl.trim()) return;
    resolveUrlMutation.mutate(googleMapsUrl.trim(), {
      onSuccess: (data) => {
        const p = data.place;
        setClaimedPlace({
          googlePlaceId: p.googlePlaceId,
          googleMapsUrl: googleMapsUrl.trim(),
          placeName: p.placeName,
          placeData: {
            address: p.address,
            district: p.district,
            city: p.city,
            country: p.country,
            locationLat: p.locationLat,
            locationLng: p.locationLng,
            openingHours: p.openingHours,
            phone: p.phone,
            website: p.website,
          },
        });
      },
    });
  };

  const handleClearClaimedPlace = () => setClaimedPlace(null);

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

    const request: MerchantApplyRequest = {
      businessName: businessName.trim(),
      email: email.trim(),
      surveyResponses,
      ...(claimedPlace?.placeId && { claimedPlaceId: claimedPlace.placeId }),
      ...(claimedPlace?.googlePlaceId && { claimedGooglePlaceId: claimedPlace.googlePlaceId }),
      ...(claimedPlace?.googleMapsUrl && { claimedGoogleMapsUrl: claimedPlace.googleMapsUrl }),
      ...(claimedPlace?.placeName && { claimedPlaceName: claimedPlace.placeName }),
      ...(claimedPlace?.placeData && { claimedPlaceData: claimedPlace.placeData }),
    };

    applyMutation.mutate(request, {
      onSuccess: () => {
        Alert.alert(
          t.merchant_applySuccess,
          t.merchant_applySuccessDesc,
          [{ text: 'OK', onPress: () => refetchStatus() }],
        );
      },
      onError: (error: Error) => {
        Alert.alert('Error', error.message);
      },
    });
  };

  const handleReapply = () => {
    setIsReapplying(true);
  };

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

      {/* ===== 店家綁定（選填） ===== */}
      <View style={styles.placeBindingSection}>
        <Text style={styles.placeBindingTitle}>
          {t.merchant_placeBinding || '綁定您的店家（選填）'}
        </Text>
        <Text style={styles.placeBindingDesc}>
          {t.merchant_placeBindingDesc || '綁定後可加速審核流程'}
        </Text>

        {claimedPlace ? (
          <View style={styles.claimedPlaceCard}>
            <Ionicons name="checkmark-circle" size={20} color={MibuBrand.success} />
            <Text style={styles.claimedPlaceName} numberOfLines={1}>
              {claimedPlace.placeName}
            </Text>
            <TouchableOpacity onPress={handleClearClaimedPlace}>
              <Ionicons name="close-circle" size={20} color={MibuBrand.tan} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 模式 1：搜尋景點 */}
            <View style={styles.placeSearchRow}>
              <TextInputField
                label={t.merchant_searchPlace || '搜尋景點名稱'}
                value={placeSearchQuery}
                onChangeText={setPlaceSearchQuery}
                placeholder={t.merchant_searchPlacePlaceholder || '輸入店名搜尋'}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchPlace}
                disabled={searchPlacesMutation.isPending}
              >
                {searchPlacesMutation.isPending ? (
                  <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
                ) : (
                  <Ionicons name="search" size={18} color={MibuBrand.warmWhite} />
                )}
              </TouchableOpacity>
            </View>

            {/* 搜尋結果 */}
            {searchPlacesMutation.data?.places && searchPlacesMutation.data.places.length > 0 && (
              <View style={styles.searchResults}>
                {searchPlacesMutation.data.places.slice(0, 5).map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectSearchResult(place)}
                  >
                    <Text style={styles.searchResultName}>{place.placeName}</Text>
                    <Text style={styles.searchResultLocation}>
                      {place.district}・{place.city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 模式 2：Google Maps 連結 */}
            <Text style={styles.orDivider}>{t.common_or || '或'}</Text>
            <View style={styles.placeSearchRow}>
              <TextInputField
                label={t.merchant_googleMapsUrl || 'Google Maps 連結'}
                value={googleMapsUrl}
                onChangeText={setGoogleMapsUrl}
                placeholder="https://maps.google.com/..."
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleResolveUrl}
                disabled={resolveUrlMutation.isPending}
              >
                {resolveUrlMutation.isPending ? (
                  <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
                ) : (
                  <Ionicons name="link" size={18} color={MibuBrand.warmWhite} />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* ===== 提交按鈕 ===== */}
      <TouchableOpacity
        style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isFormValid || applyMutation.isPending}
      >
        {applyMutation.isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
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
  submitButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: '#FFFFFF' },

  statusIconContainer: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: MibuBrand.creamLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl,
  },
  statusIconApproved: { backgroundColor: '#DCFCE7' },
  statusIconRejected: { backgroundColor: '#FEE2E2' },
  statusTitle: {
    fontSize: FontSize.xxl, fontWeight: '800', color: MibuBrand.brownDark,
    marginBottom: Spacing.md, textAlign: 'center',
  },
  statusDescription: {
    fontSize: FontSize.md, color: MibuBrand.brownLight, textAlign: 'center',
    lineHeight: 22, marginBottom: Spacing.xl,
  },
  rejectionReasonCard: {
    backgroundColor: '#FEE2E2', borderRadius: Radius.md, padding: Spacing.lg,
    marginBottom: Spacing.xl, width: '100%',
  },
  rejectionReasonText: {
    fontSize: FontSize.md, color: MibuBrand.error, lineHeight: 22, textAlign: 'center',
  },

  // 店家綁定
  placeBindingSection: {
    marginTop: Spacing.xl,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  placeBindingTitle: {
    fontSize: FontSize.lg, fontWeight: '600', color: MibuBrand.brownDark, marginBottom: Spacing.xs,
  },
  placeBindingDesc: {
    fontSize: FontSize.sm, color: MibuBrand.copper, marginBottom: Spacing.lg,
  },
  claimedPlaceCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: MibuBrand.warmWhite, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: MibuBrand.tanLight,
  },
  claimedPlaceName: {
    flex: 1, fontSize: FontSize.md, fontWeight: '500', color: MibuBrand.brownDark,
  },
  placeSearchRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
  },
  searchButton: {
    width: 44, height: 44, borderRadius: Radius.md, backgroundColor: MibuBrand.brown,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  searchResults: {
    backgroundColor: MibuBrand.warmWhite, borderRadius: Radius.md,
    borderWidth: 1, borderColor: MibuBrand.tanLight, marginBottom: Spacing.md,
  },
  searchResultItem: {
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: MibuBrand.tanLight,
  },
  searchResultName: {
    fontSize: FontSize.md, fontWeight: '500', color: MibuBrand.brownDark,
  },
  searchResultLocation: {
    fontSize: FontSize.sm, color: MibuBrand.copper, marginTop: 2,
  },
  orDivider: {
    textAlign: 'center', fontSize: FontSize.sm, color: MibuBrand.tan,
    marginVertical: Spacing.md,
  },
});
