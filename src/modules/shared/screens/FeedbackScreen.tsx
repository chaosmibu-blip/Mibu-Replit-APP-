/**
 * ============================================================
 * 意見回饋畫面 (FeedbackScreen.tsx)
 * ============================================================
 * 此模組提供: 使用者提交問題回報或功能建議
 *
 * 主要功能:
 * - 選擇回饋類型（問題回報 / 功能建議）
 * - 輸入回饋內容（最多 2000 字）
 * - 可選上傳截圖（最多 3 張，每張 ≤ 2MB）
 * - 自動帶入裝置資訊
 * - 提交後顯示感謝提示
 *
 * 串接 API: POST /api/feedback（JWT 認證）
 *
 * 更新日期：2026-02-28（#064 新增）
 * @see 後端契約: contracts/APP.md > 使用者回饋系統
 */

import React, { useState, useCallback } from 'react';
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Application from 'expo-application';
import * as ImagePicker from 'expo-image-picker';
import { useI18n } from '../../../context/AppContext';
import { useSubmitFeedback } from '../../../hooks/useFeedbackQueries';
import { MibuBrand } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import type { FeedbackType, DeviceInfo } from '../../../types/feedback';

// ============ 常數定義 ============

const MAX_MESSAGE_LENGTH = 2000;
const MAX_SCREENSHOTS = 3;
const MAX_SCREENSHOT_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const HEADER_ICON_SIZE = 24;
const SCREENSHOT_PREVIEW_SIZE = 80;

// ============ 輔助函數 ============

/**
 * 取得裝置資訊（自動帶入，使用者不需填寫）
 */
function getDeviceInfo(): DeviceInfo {
  return {
    os: `${Platform.OS} ${Platform.Version}`,
    appVersion: Application.nativeApplicationVersion ?? '1.0.0',
    deviceModel: Platform.OS === 'ios'
      ? 'iPhone'
      : `Android ${Platform.Version}`,
  };
}

// ============ 元件本體 ============

export function FeedbackScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const submitMutation = useSubmitFeedback();

  // ========== 表單狀態 ==========
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);

  // ========== 衍生狀態 ==========
  const isFormValid = feedbackType !== null && message.trim().length > 0;
  const remainingChars = MAX_MESSAGE_LENGTH - message.length;

  // ========== 事件處理 ==========

  const handleGoBack = () => router.back();

  const handlePickImage = useCallback(async () => {
    if (screenshots.length >= MAX_SCREENSHOTS) {
      Alert.alert(t.feedback_screenshotLimitTitle, t.feedback_screenshotLimitDesc);
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(t.feedback_permissionTitle, t.feedback_permissionDesc);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    const asset = result.assets[0];
    // 後端檢查 base64 字串長度 ≤ MAX_SCREENSHOT_SIZE * 1.37
    const estimatedBytes = (asset.base64?.length ?? 0) * 0.75;
    if (estimatedBytes > MAX_SCREENSHOT_SIZE_BYTES) {
      Alert.alert(t.feedback_imageTooLargeTitle, t.feedback_imageTooLargeDesc);
      return;
    }

    setScreenshots(prev => [...prev, asset.base64!]);
  }, [screenshots.length, t]);

  const handleRemoveScreenshot = useCallback((index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!isFormValid || !feedbackType) return;

    submitMutation.mutate(
      {
        type: feedbackType,
        message: message.trim(),
        screenshots: screenshots.length > 0 ? screenshots : undefined,
        deviceInfo: getDeviceInfo(),
      },
      {
        onSuccess: () => {
          Alert.alert(
            t.feedback_successTitle,
            t.feedback_successDesc,
            [{ text: 'OK', onPress: () => router.back() }],
          );
        },
        onError: (error: Error) => {
          Alert.alert(t.feedback_errorTitle, error.message);
        },
      },
    );
  }, [isFormValid, feedbackType, message, screenshots, submitMutation, t, router]);

  // ========== 渲染子函數 ==========

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="chevron-back" size={HEADER_ICON_SIZE} color={MibuBrand.brownDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t.feedback_title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {t.feedback_typeLabel}
        <Text style={styles.requiredMark}> *</Text>
      </Text>
      <View style={styles.typeRow}>
        {(['bug_report', 'suggestion'] as FeedbackType[]).map((type) => {
          const isSelected = feedbackType === type;
          const icon = type === 'bug_report' ? 'bug-outline' : 'bulb-outline';
          const label = type === 'bug_report' ? t.feedback_typeBugReport : t.feedback_typeSuggestion;

          return (
            <TouchableOpacity
              key={type}
              style={[styles.typeCard, isSelected && styles.typeCardSelected]}
              onPress={() => setFeedbackType(type)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={28}
                color={isSelected ? MibuBrand.brown : MibuBrand.copper}
              />
              <Text style={[styles.typeCardText, isSelected && styles.typeCardTextSelected]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderMessageInput = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>
        {t.feedback_messageLabel}
        <Text style={styles.requiredMark}> *</Text>
      </Text>
      <TextInput
        style={styles.messageInput}
        value={message}
        onChangeText={setMessage}
        multiline
        textAlignVertical="top"
        placeholder={t.feedback_messagePlaceholder}
        placeholderTextColor={MibuBrand.tanLight}
        maxLength={MAX_MESSAGE_LENGTH}
      />
      <Text style={[styles.charCount, remainingChars < 100 && styles.charCountWarning]}>
        {remainingChars}/{MAX_MESSAGE_LENGTH}
      </Text>
    </View>
  );

  const renderScreenshots = () => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{t.feedback_screenshotLabel}</Text>
      <Text style={styles.fieldHint}>{t.feedback_screenshotHint}</Text>
      <View style={styles.screenshotRow}>
        {screenshots.map((base64, index) => (
          <View key={index} style={styles.screenshotPreview}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${base64}` }}
              style={styles.screenshotImage}
            />
            <TouchableOpacity
              style={styles.screenshotRemove}
              onPress={() => handleRemoveScreenshot(index)}
            >
              <Ionicons name="close-circle" size={22} color={MibuBrand.error} />
            </TouchableOpacity>
          </View>
        ))}
        {screenshots.length < MAX_SCREENSHOTS && (
          <TouchableOpacity style={styles.screenshotAdd} onPress={handlePickImage}>
            <Ionicons name="camera-outline" size={28} color={MibuBrand.copper} />
            <Text style={styles.screenshotAddText}>{t.feedback_addScreenshot}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ========== 主要渲染 ==========

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {renderHeader()}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 介紹卡片 */}
          <View style={styles.introCard}>
            <Ionicons name="chatbubbles-outline" size={32} color={MibuBrand.copper} style={styles.introIcon} />
            <Text style={styles.introTitle}>{t.feedback_introTitle}</Text>
            <Text style={styles.introDescription}>{t.feedback_introDesc}</Text>
          </View>

          {renderTypeSelector()}
          {renderMessageInput()}
          {renderScreenshots()}

          {/* 提交按鈕 */}
          <TouchableOpacity
            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>{t.feedback_submit}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
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

  // ========== Header ==========
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

  // ========== 介紹卡片 ==========
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

  // ========== 欄位通用 ==========
  fieldContainer: { marginTop: Spacing.xl },
  fieldLabel: {
    fontSize: FontSize.md, fontWeight: '600', color: MibuBrand.brownDark,
    lineHeight: 22, marginBottom: Spacing.md,
  },
  requiredMark: { color: MibuBrand.error },
  fieldHint: {
    fontSize: FontSize.sm, color: MibuBrand.copper, marginBottom: Spacing.sm,
  },

  // ========== 類型選擇 ==========
  typeRow: { flexDirection: 'row', gap: Spacing.md },
  typeCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.xl, borderRadius: Radius.xl,
    borderWidth: 2, borderColor: MibuBrand.tanLight, backgroundColor: '#FFFFFF',
  },
  typeCardSelected: {
    borderColor: MibuBrand.brown, backgroundColor: MibuBrand.creamLight,
  },
  typeCardText: {
    fontSize: FontSize.md, fontWeight: '600', color: MibuBrand.copper, marginTop: Spacing.sm,
  },
  typeCardTextSelected: { color: MibuBrand.brown },

  // ========== 訊息輸入 ==========
  messageInput: {
    backgroundColor: '#FFFFFF', borderRadius: Radius.md,
    borderWidth: 1, borderColor: MibuBrand.tanLight,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: FontSize.md, color: MibuBrand.brownDark,
    minHeight: 150, paddingTop: Spacing.md,
  },
  charCount: {
    fontSize: FontSize.sm, color: MibuBrand.copper,
    textAlign: 'right', marginTop: Spacing.xs,
  },
  charCountWarning: { color: MibuBrand.error },

  // ========== 截圖 ==========
  screenshotRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  screenshotPreview: {
    width: SCREENSHOT_PREVIEW_SIZE, height: SCREENSHOT_PREVIEW_SIZE,
    borderRadius: Radius.md, overflow: 'hidden',
  },
  screenshotImage: { width: '100%', height: '100%' },
  screenshotRemove: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#FFFFFF', borderRadius: Radius.full,
  },
  screenshotAdd: {
    width: SCREENSHOT_PREVIEW_SIZE, height: SCREENSHOT_PREVIEW_SIZE,
    borderRadius: Radius.md, borderWidth: 1, borderColor: MibuBrand.tanLight,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  screenshotAddText: { fontSize: FontSize.xs, color: MibuBrand.copper, marginTop: 2 },

  // ========== 提交按鈕 ==========
  submitButton: {
    backgroundColor: MibuBrand.brown, borderRadius: Radius.lg, paddingVertical: Spacing.lg,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.xxl,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: '#FFFFFF' },
});
