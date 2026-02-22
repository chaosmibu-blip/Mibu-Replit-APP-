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
import { useMerchantApplicationStatus, useApplyMerchant } from '../../../hooks/useMerchantQueries';
import { MibuBrand } from '../../../../constants/Colors';
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

// ============ 元件本體 ============

export function MerchantApplyScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: statusData, isLoading: isLoadingStatus, refetch: refetchStatus } = useMerchantApplicationStatus();
  const applyMutation = useApplyMerchant();

  // ========== 表單狀態 ==========

  // 第一段：基本資料
  const [contactName, setContactName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [businessRegion, setBusinessRegion] = useState('');

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

  // ========== 衍生狀態 ==========
  const applicationStatus = statusData?.status ?? 'none';
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
    { value: 'souvenir', label: t.merchant_surveyCatSouvenir },
    { value: 'experience', label: t.merchant_catExperience },
    { value: 'transport', label: t.merchant_catTransportation },
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

    const surveyResponses: Record<string, unknown> = {
      contactName: contactName.trim(),
      businessCategory,
      businessRegion,
      customerSources,
      challenges,
      monthlyMarketingBudget,
      onlineChannels,
      desiredOutcome,
      gamificationInterest,
      contactMethod: contactMethod.trim(),
    };

    applyMutation.mutate(
      {
        businessName: businessName.trim(),
        email: email.trim(),
        surveyResponses,
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
          Alert.alert('Error', error.message);
        },
      },
    );
  };

  const handleReapply = () => refetchStatus();

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
      <SingleSelectField label={t.merchant_surveyQ3Category} options={categoryOptions} selected={businessCategory} onSelect={setBusinessCategory} required />
      <RegionPickerField label={t.merchant_surveyQ4Region} value={businessRegion} onSelect={setBusinessRegion} required placeholder={t.merchant_surveyQ4Placeholder} />

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
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>{t.merchant_applyButton}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContent = () => {
    if (isLoadingStatus) return renderLoading();

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
    alignItems: 'center', marginBottom: Spacing.sm,
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
});
