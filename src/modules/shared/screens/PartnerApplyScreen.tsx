/**
 * ============================================================
 * 自己人申請畫面 (PartnerApplyScreen.tsx)
 * ============================================================
 * 此模組提供: 用戶申請成為 Mibu 自己人（在地夥伴）的完整流程
 *
 * 主要功能:
 * - 依申請狀態顯示不同畫面（none/pending/approved/rejected）
 * - 12 題問卷表單（基本資料、在地能力、動機可用性、收尾）
 * - 填寫問卷並提交申請
 * - 被拒絕後可重新申請
 *
 * 串接的 API:
 * - GET /api/partner/application-status — 查詢申請狀態
 * - POST /api/partner/apply — 提交自己人申請（surveyResponses: JSONB）
 *
 * 更新日期：2026-02-22（問卷改版：4 題 → 12 題）
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
import { useI18n } from '../../../context/AppContext';
import { usePartnerApplicationStatus, useApplyPartner } from '../../../hooks/useEconomyQueries';
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

// ============ 元件本體 ============

export function PartnerApplyScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { data: statusData, isLoading: isLoadingStatus, refetch: refetchStatus } = usePartnerApplicationStatus();
  const applyMutation = useApplyPartner();

  // ========== 表單狀態 ==========

  // 第一段：基本資料
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');

  // 第二段：在地能力驗證
  const [localRecommendation, setLocalRecommendation] = useState('');
  const [scenarioResponse, setScenarioResponse] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);

  // 第三段：動機與可用性
  const [expectations, setExpectations] = useState<string[]>([]);
  const [expectedIncome, setExpectedIncome] = useState('');
  const [dailyAvailability, setDailyAvailability] = useState('');
  const [onSiteWillingness, setOnSiteWillingness] = useState('');

  // 第四段：收尾
  const [additionalNotes, setAdditionalNotes] = useState('');

  // ========== 衍生狀態 ==========
  const applicationStatus = statusData?.status ?? 'none';
  const rejectionReason = statusData?.application?.rejectionReason ?? null;

  const isFormValid =
    name.trim().length > 0 &&
    region.length > 0 &&
    email.trim().length > 0 &&
    contact.trim().length > 0 &&
    localRecommendation.trim().length > 0 &&
    scenarioResponse.trim().length > 0 &&
    languages.length > 0 &&
    expectations.length > 0 &&
    expectedIncome.length > 0 &&
    dailyAvailability.length > 0 &&
    onSiteWillingness.length > 0;

  // ========== 選項定義 ==========

  const languageOptions = [
    { value: 'zh', label: t.partner_langZh },
    { value: 'en', label: t.partner_langEn },
    { value: 'ja', label: t.partner_langJa },
    { value: 'ko', label: t.partner_langKo },
    { value: 'tw', label: t.partner_langTw },
    { value: 'other', label: t.partner_langOther },
  ];

  const expectationOptions = [
    { value: 'income', label: t.partner_expectIncome },
    { value: 'people', label: t.partner_expectPeople },
    { value: 'tourism', label: t.partner_expectTourism },
    { value: 'experience', label: t.partner_expectExperience },
    { value: 'other', label: t.partner_expectOther },
  ];

  const incomeOptions = [
    { value: 'under5k', label: t.partner_incomeUnder5k },
    { value: '5k-10k', label: t.partner_income5to10k },
    { value: '10k-30k', label: t.partner_income10to30k },
    { value: 'over30k', label: t.partner_incomeOver30k },
    { value: 'none', label: t.partner_incomeNone },
  ];

  const availabilityOptions = [
    { value: 'under1h', label: t.partner_availUnder1h },
    { value: '1-3h', label: t.partner_avail1to3h },
    { value: '3-5h', label: t.partner_avail3to5h },
    { value: 'over5h', label: t.partner_availOver5h },
    { value: 'flexible', label: t.partner_availFlexible },
  ];

  const onSiteOptions = [
    { value: 'willing', label: t.partner_onSiteWilling },
    { value: 'depends', label: t.partner_onSiteDepends },
    { value: 'online_only', label: t.partner_onSiteOnlineOnly },
  ];

  // ========== 事件處理 ==========

  const handleGoBack = () => router.back();

  const handleToggleLanguage = useCallback((value: string) => {
    setLanguages(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }, []);

  const handleToggleExpectation = useCallback((value: string) => {
    setExpectations(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }, []);

  const handleSubmit = () => {
    if (!isFormValid) return;

    const surveyResponses: Record<string, unknown> = {
      name: name.trim(),
      region,
      email: email.trim(),
      contact: contact.trim(),
      localRecommendation: localRecommendation.trim(),
      scenarioResponse: scenarioResponse.trim(),
      languages,
      expectations,
      expectedIncome,
      dailyAvailability,
      onSiteWillingness,
    };

    if (additionalNotes.trim().length > 0) {
      surveyResponses.additionalNotes = additionalNotes.trim();
    }

    applyMutation.mutate(surveyResponses, {
      onSuccess: () => {
        Alert.alert(
          t.partner_applySuccess,
          t.partner_applySuccessDesc,
          [{ text: 'OK', onPress: () => refetchStatus() }],
        );
      },
      onError: (error: Error) => {
        Alert.alert('Error', error.message);
      },
    });
  };

  const handleReapply = () => refetchStatus();

  // ========== 渲染子函數 ==========

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="chevron-back" size={HEADER_ICON_SIZE} color={MibuBrand.brownDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t.partner_applyTitle}</Text>
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
      <Text style={styles.statusTitle}>{t.partner_statusPending}</Text>
      <Text style={styles.statusDescription}>{t.partner_statusPendingDesc}</Text>
    </View>
  );

  const renderApprovedStatus = () => (
    <View style={styles.centerContainer}>
      <View style={[styles.statusIconContainer, styles.statusIconApproved]}>
        <Ionicons name="checkmark-circle-outline" size={STATUS_ICON_SIZE} color={MibuBrand.success} />
      </View>
      <Text style={styles.statusTitle}>{t.partner_statusApproved}</Text>
      <Text style={styles.statusDescription}>{t.partner_alreadyPartner}</Text>
    </View>
  );

  const renderRejectedStatus = () => (
    <View style={styles.centerContainer}>
      <View style={[styles.statusIconContainer, styles.statusIconRejected]}>
        <Ionicons name="close-circle-outline" size={STATUS_ICON_SIZE} color={MibuBrand.error} />
      </View>
      <Text style={styles.statusTitle}>{t.partner_statusRejected}</Text>
      <Text style={styles.statusDescription}>{t.partner_statusRejectedDesc}</Text>
      {rejectionReason && (
        <View style={styles.rejectionReasonCard}>
          <Text style={styles.rejectionReasonText}>{rejectionReason}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.submitButton} onPress={handleReapply}>
        <Text style={styles.submitButtonText}>{t.partner_reapply}</Text>
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
        <Ionicons name="people-outline" size={32} color={MibuBrand.copper} style={styles.introIcon} />
        <Text style={styles.introTitle}>{t.partner_applyTitle}</Text>
        <Text style={styles.introDescription}>{t.partner_applyDesc}</Text>
      </View>

      {/* ===== 第一段：基本資料 ===== */}
      <SurveySectionTitle step={1} title={t.partner_section1} />
      <TextInputField label={t.partner_q1Name} value={name} onChangeText={setName} required />
      <RegionPickerField label={t.partner_q2Region} value={region} onSelect={setRegion} required placeholder={t.partner_q2Placeholder} />
      <TextInputField label={t.partner_q3Email} value={email} onChangeText={setEmail} required keyboardType="email-address" />
      <TextInputField label={t.partner_q4Contact} value={contact} onChangeText={setContact} required placeholder={t.partner_q4Placeholder} />

      {/* ===== 第二段：在地能力驗證 ===== */}
      <SurveySectionTitle step={2} title={t.partner_section2} />
      <TextInputField label={t.partner_q5Local} value={localRecommendation} onChangeText={setLocalRecommendation} required multiline />
      <TextInputField label={t.partner_q6Scenario} value={scenarioResponse} onChangeText={setScenarioResponse} required multiline />
      <MultiSelectField
        label={t.partner_q7Languages}
        options={languageOptions}
        selected={languages}
        onToggle={handleToggleLanguage}
        required
      />

      {/* ===== 第三段：動機與可用性 ===== */}
      <SurveySectionTitle step={3} title={t.partner_section3} />
      <MultiSelectField
        label={t.partner_q8Expectations}
        options={expectationOptions}
        selected={expectations}
        onToggle={handleToggleExpectation}
        required
      />
      <SingleSelectField label={t.partner_q9Income} options={incomeOptions} selected={expectedIncome} onSelect={setExpectedIncome} required />
      <SingleSelectField label={t.partner_q10Availability} options={availabilityOptions} selected={dailyAvailability} onSelect={setDailyAvailability} required />
      <SingleSelectField label={t.partner_q11OnSite} options={onSiteOptions} selected={onSiteWillingness} onSelect={setOnSiteWillingness} required />

      {/* ===== 第四段：收尾 ===== */}
      <SurveySectionTitle step={4} title={t.partner_section4} />
      <TextInputField label={t.partner_q12Notes} value={additionalNotes} onChangeText={setAdditionalNotes} multiline />

      {/* ===== 提交按鈕 ===== */}
      <TouchableOpacity
        style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isFormValid || applyMutation.isPending}
      >
        {applyMutation.isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>{t.partner_applyButton}</Text>
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
