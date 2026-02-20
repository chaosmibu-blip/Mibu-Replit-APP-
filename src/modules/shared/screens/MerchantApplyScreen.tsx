/**
 * ============================================================
 * 商家申請頁面 (MerchantApplyScreen.tsx)
 * ============================================================
 * 此模組提供: 一般用戶申請成為商家的完整流程
 *
 * 主要功能:
 * - 依據申請狀態顯示不同內容（無申請 / 審核中 / 已通過 / 被拒絕）
 * - 申請表單：商家名稱、Email、額外資訊
 * - 送出申請後自動刷新狀態
 *
 * 串接 API:
 * - GET  /api/merchant/application-status（查詢申請狀態）
 * - POST /api/merchant/apply（提交商家申請）
 *
 * 更新日期：2026-02-20
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
import { useMerchantApplicationStatus, useApplyMerchant } from '../../../hooks/useMerchantQueries';
import { useAuth, useI18n } from '../../../context/AppContext';
import { MibuBrand } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';

// ============ 型別定義 ============

type ApplicationStatus = 'none' | 'pending' | 'approved' | 'rejected';

// ============ 元件 ============

export function MerchantApplyScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();

  // ========== React Query 資料查詢 ==========

  const statusQuery = useMerchantApplicationStatus();
  const applyMutation = useApplyMerchant();

  // ========== 本地 UI 狀態 ==========

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [surveyExtra, setSurveyExtra] = useState('');

  // ========== 衍生狀態 ==========

  const applicationStatus: ApplicationStatus = statusQuery.data?.status ?? 'none';
  const rejectionReason: string = statusQuery.data?.rejectionReason ?? '';
  const isLoading = statusQuery.isLoading;
  const isSubmitting = applyMutation.isPending;
  const isFormValid = businessName.trim().length > 0 && email.trim().length > 0;

  // ========== 事件處理 ==========

  const handleSubmit = () => {
    if (!isFormValid || isSubmitting) return;

    const params: { businessName: string; email: string; surveyResponses?: Record<string, unknown> } = {
      businessName: businessName.trim(),
      email: email.trim(),
    };

    if (surveyExtra.trim()) {
      params.surveyResponses = { extra: surveyExtra.trim() };
    }

    applyMutation.mutate(params, {
      onSuccess: () => {
        Alert.alert(
          t.merchant_applySuccessTitle,
          t.merchant_applySuccessMessage,
          [{ text: t.common_ok }],
        );
      },
      onError: () => {
        Alert.alert(
          t.merchant_applyErrorTitle,
          t.merchant_applyErrorMessage,
          [{ text: t.common_ok }],
        );
      },
    });
  };

  const handleReapply = () => {
    setBusinessName('');
    setEmail(user?.email ?? '');
    setSurveyExtra('');
    statusQuery.refetch();
  };

  // ========== 渲染：載入中 ==========

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color={MibuBrand.brownDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.merchant_applyTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={MibuBrand.brown} />
        </View>
      </SafeAreaView>
    );
  }

  // ========== 渲染：審核中狀態 ==========

  const renderPendingStatus = () => (
    <View style={styles.statusCard}>
      <View style={styles.statusIconContainer}>
        <Ionicons name="hourglass-outline" size={48} color={MibuBrand.warning} />
      </View>
      <Text style={styles.statusTitle}>{t.merchant_pendingTitle}</Text>
      <Text style={styles.statusDescription}>{t.merchant_pendingDescription}</Text>
    </View>
  );

  // ========== 渲染：已通過狀態 ==========

  const renderApprovedStatus = () => (
    <View style={styles.statusCard}>
      <View style={[styles.statusIconContainer, { backgroundColor: '#DCFCE7' }]}>
        <Ionicons name="checkmark-circle" size={48} color={MibuBrand.success} />
      </View>
      <Text style={styles.statusTitle}>{t.merchant_approvedTitle}</Text>
      <Text style={styles.statusDescription}>{t.merchant_approvedDescription}</Text>
    </View>
  );

  // ========== 渲染：被拒絕狀態 ==========

  const renderRejectedStatus = () => (
    <View style={styles.statusCard}>
      <View style={[styles.statusIconContainer, { backgroundColor: '#FEE2E2' }]}>
        <Ionicons name="close-circle" size={48} color={MibuBrand.error} />
      </View>
      <Text style={styles.statusTitle}>{t.merchant_rejectedTitle}</Text>
      <Text style={styles.statusDescription}>{t.merchant_rejectedDescription}</Text>
      {rejectionReason ? (
        <View style={styles.rejectionReasonCard}>
          <Text style={styles.rejectionReasonLabel}>{t.merchant_rejectionReason}</Text>
          <Text style={styles.rejectionReasonText}>{rejectionReason}</Text>
        </View>
      ) : null}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleReapply}
        activeOpacity={0.7}
      >
        <Text style={styles.submitButtonText}>{t.merchant_reapply}</Text>
      </TouchableOpacity>
    </View>
  );

  // ========== 渲染：申請表單 ==========

  const renderApplicationForm = () => (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>{t.merchant_formTitle}</Text>
      <Text style={styles.formSubtitle}>{t.merchant_formSubtitle}</Text>

      {/* 商家名稱 */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t.merchant_businessName}</Text>
        <TextInput
          style={styles.textInput}
          value={businessName}
          onChangeText={setBusinessName}
          placeholder={t.merchant_businessNamePlaceholder}
          placeholderTextColor={MibuBrand.tanLight}
          autoCapitalize="none"
          returnKeyType="next"
        />
      </View>

      {/* Email */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{t.merchant_email}</Text>
        <TextInput
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
          placeholder={t.merchant_emailPlaceholder}
          placeholderTextColor={MibuBrand.tanLight}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />
      </View>

      {/* 額外資訊 */}
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {t.merchant_surveyExtra}
          <Text style={styles.optionalLabel}> ({t.merchant_optional})</Text>
        </Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={surveyExtra}
          onChangeText={setSurveyExtra}
          placeholder={t.merchant_surveyExtraPlaceholder}
          placeholderTextColor={MibuBrand.tanLight}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          returnKeyType="done"
        />
      </View>

      {/* 送出按鈕 */}
      <TouchableOpacity
        style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        activeOpacity={0.7}
        disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>{t.merchant_submit}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // ========== 主渲染 ==========

  const renderContent = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.merchant_applyTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============ 樣式 ============

const styles = StyleSheet.create({
  // ========== 容器 ==========
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 100,
  },

  // ========== Header ==========
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Platform.OS === 'android' ? Spacing.xl : Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerSpacer: {
    width: 44,
  },

  // ========== 狀態卡片 ==========
  statusCard: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  statusDescription: {
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ========== 拒絕原因 ==========
  rejectionReasonCard: {
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: MibuBrand.error,
  },
  rejectionReasonLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.error,
    marginBottom: Spacing.sm,
  },
  rejectionReasonText: {
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
    lineHeight: 20,
  },

  // ========== 表單卡片 ==========
  formCard: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 20,
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.sm,
  },
  formSubtitle: {
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
    marginBottom: Spacing.xl,
    lineHeight: 20,
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
  optionalLabel: {
    fontSize: FontSize.sm,
    fontWeight: '400',
    color: MibuBrand.brownLight,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DCC8',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: MibuBrand.brownDark,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },

  // ========== 送出按鈕 ==========
  submitButton: {
    backgroundColor: MibuBrand.brown,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#ffffff',
  },
});
