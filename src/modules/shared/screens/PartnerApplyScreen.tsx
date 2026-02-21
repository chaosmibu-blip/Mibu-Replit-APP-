/**
 * ============================================================
 * 自己人申請畫面 (PartnerApplyScreen.tsx)
 * ============================================================
 * 此模組提供: 用戶申請成為 Mibu 自己人（在地夥伴）的完整流程
 *
 * 主要功能:
 * - 依申請狀態顯示不同畫面（none/pending/approved/rejected）
 * - 填寫問卷表單並提交申請
 * - 被拒絕後可重新申請
 *
 * 串接的 API:
 * - GET /api/partner/application-status — 查詢申請狀態
 * - POST /api/partner/apply — 提交自己人申請
 *
 * 更新日期：2026-02-20（#053 新增自己人申請畫面）
 * @see 後端合約: contracts/APP.md
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { usePartnerApplicationStatus, useApplyPartner } from '../../../hooks/useEconomyQueries';
import { MibuBrand } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';

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
  const [realName, setRealName] = useState('');
  const [region, setRegion] = useState('');
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');

  // ========== 衍生狀態 ==========
  const applicationStatus = statusData?.status ?? 'none';
  const rejectionReason = statusData?.application?.rejectionReason ?? null;
  const isFormValid = realName.trim().length > 0 && region.trim().length > 0 && motivation.trim().length > 0;

  // ========== 事件處理 ==========

  /** 返回上一頁 */
  const handleGoBack = () => {
    router.back();
  };

  /** 提交自己人申請 */
  const handleSubmit = () => {
    if (!isFormValid) return;

    const surveyResponses: Record<string, string> = {
      name: realName.trim(),
      region: region.trim(),
      motivation: motivation.trim(),
    };

    // 經驗為選填，有值才送
    if (experience.trim().length > 0) {
      surveyResponses.experience = experience.trim();
    }

    applyMutation.mutate(surveyResponses, {
      onSuccess: () => {
        Alert.alert(
          t.partner_applySuccess,
          t.partner_applySuccessDesc,
          [{ text: 'OK', onPress: () => refetchStatus() }],
        );
        // 清空表單
        setRealName('');
        setRegion('');
        setMotivation('');
        setExperience('');
      },
      onError: (error: Error) => {
        Alert.alert('Error', error.message);
      },
    });
  };

  /** 重新申請（rejected 狀態） */
  const handleReapply = () => {
    // 重置表單，讓畫面切回 none 的表單顯示
    refetchStatus();
  };

  // ========== 渲染子函數 ==========

  /** 渲染頂部 Header（返回按鈕 + 標題） */
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="chevron-back" size={HEADER_ICON_SIZE} color={MibuBrand.brownDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t.partner_applyTitle}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  /** 渲染載入中狀態 */
  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={MibuBrand.brown} />
    </View>
  );

  /** 渲染審核中狀態 */
  const renderPendingStatus = () => (
    <View style={styles.centerContainer}>
      <View style={styles.statusIconContainer}>
        <Ionicons name="hourglass-outline" size={STATUS_ICON_SIZE} color={MibuBrand.copper} />
      </View>
      <Text style={styles.statusTitle}>{t.partner_statusPending}</Text>
      <Text style={styles.statusDescription}>{t.partner_statusPendingDesc}</Text>
    </View>
  );

  /** 渲染已通過狀態 */
  const renderApprovedStatus = () => (
    <View style={styles.centerContainer}>
      <View style={[styles.statusIconContainer, styles.statusIconApproved]}>
        <Ionicons name="checkmark-circle-outline" size={STATUS_ICON_SIZE} color={MibuBrand.success} />
      </View>
      <Text style={styles.statusTitle}>{t.partner_statusApproved}</Text>
      <Text style={styles.statusDescription}>{t.partner_alreadyPartner}</Text>
    </View>
  );

  /** 渲染被拒絕狀態 */
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

  /** 渲染輸入欄位 */
  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    isRequired: boolean,
    isMultiline: boolean = false,
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {label}
        {isRequired && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, isMultiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        multiline={isMultiline}
        textAlignVertical={isMultiline ? 'top' : 'center'}
        placeholderTextColor={MibuBrand.tanLight}
      />
    </View>
  );

  /** 渲染申請表單 */
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

      {/* ===== 問卷區塊 ===== */}
      <View style={styles.formCard}>
        <Text style={styles.formSectionTitle}>{t.partner_surveyIntro}</Text>

        {renderInputField(t.partner_surveyName, realName, setRealName, true)}
        {renderInputField(t.partner_surveyRegion, region, setRegion, true)}
        {renderInputField(t.partner_surveyMotivation, motivation, setMotivation, true, true)}
        {renderInputField(t.partner_surveyExperience, experience, setExperience, false, true)}
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
          <Text style={styles.submitButtonText}>{t.partner_applyButton}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  /** 依狀態渲染對應內容 */
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
  // ========== 佈局 ==========
  safeArea: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },

  // ========== Header ==========
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerSpacer: {
    width: 40,
  },

  // ========== 介紹卡片 ==========
  introCard: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  introIcon: {
    marginBottom: Spacing.md,
  },
  introTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  introDescription: {
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ========== 表單卡片 ==========
  formCard: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  formSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.lg,
  },

  // ========== 表單欄位 ==========
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.sm,
  },
  requiredMark: {
    color: MibuBrand.error,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },

  // ========== 提交按鈕 ==========
  submitButton: {
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ========== 狀態畫面 ==========
  statusIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  statusIconApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusIconRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },

  // ========== 拒絕原因 ==========
  rejectionReasonCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  rejectionReasonText: {
    fontSize: FontSize.md,
    color: MibuBrand.error,
    lineHeight: 22,
    textAlign: 'center',
  },
});
