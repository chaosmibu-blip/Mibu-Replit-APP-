/**
 * MerchantVerifyScreen - 驗證頁面
 *
 * 功能說明：
 * - 提供核銷碼驗證功能
 * - 輸入商家 ID 和核銷碼進行驗證
 * - 顯示驗證結果（成功/失敗）
 *
 * 串接的 API：
 * - POST /merchant/verify-code - 驗證核銷碼
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useI18n } from '../../../context/I18nContext';
import { useVerifyMerchantCode } from '../../../hooks/useMerchantQueries';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

// ============ 主元件 ============
export function MerchantVerifyScreen() {
  // ============ Hooks ============
  const { t } = useI18n();
  const router = useRouter();

  // ============ React Query：驗證碼 Mutation ============
  const verifyMutation = useVerifyMerchantCode();

  // 驗證中狀態（來自 mutation）
  const loading = verifyMutation.isPending;

  // ============ 本地 UI 狀態 ============
  // code: 核銷碼輸入值
  const [code, setCode] = useState('');
  // merchantId: 商家 ID 輸入值
  const [merchantId, setMerchantId] = useState('');
  // result: 驗證結果
  const [result, setResult] = useState<{ valid: boolean; message?: string } | null>(null);

  // ============ 事件處理函數 ============

  /**
   * handleVerify - 處理驗證（透過 mutation）
   * 驗證輸入後呼叫 API 進行核銷碼驗證
   */
  const handleVerify = () => {
    // 驗證必填欄位
    if (!code.trim() || !merchantId.trim()) {
      Alert.alert('', t.merchant_errorEmpty);
      return;
    }

    // 驗證商家 ID 為數字
    const merchantIdNum = parseInt(merchantId.trim(), 10);
    if (isNaN(merchantIdNum)) {
      Alert.alert('', t.merchant_merchantIdMustBeNumber);
      return;
    }

    setResult(null);
    verifyMutation.mutate(
      { merchantId: merchantIdNum, code: code.trim() },
      {
        onSuccess: (response) => {
          setResult({
            valid: response.valid,
            message: response.valid
              ? t.merchant_codeValid
              : (response.error || t.merchant_codeInvalid),
          });
        },
        onError: (error) => {
          console.error('Verify failed:', error);
          setResult({ valid: false, message: t.merchant_verifyFailed });
        },
      },
    );
  };

  /**
   * handleReset - 重置表單
   * 清空輸入和驗證結果，準備重新驗證
   */
  const handleReset = () => {
    setCode('');
    setMerchantId('');
    setResult(null);
  };

  // ============ 主要 JSX 渲染 ============
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ============ 頂部標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="返回">
          <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.merchant_verifyTitle}</Text>
      </View>

      {/* ============ 主要內容區 ============ */}
      <View style={styles.content}>
        {/* 根據是否有結果顯示不同內容 */}
        {result ? (
          // ============ 驗證結果畫面 ============
          <View style={styles.resultCard}>
            {/* 結果圖示 */}
            <View style={[styles.resultIcon, result.valid ? styles.resultValid : styles.resultInvalid]}>
              <Ionicons
                name={result.valid ? 'checkmark-circle' : 'close-circle'}
                size={64}
                color={UIColors.white}
              />
            </View>
            {/* 結果標題 */}
            <Text style={styles.resultTitle}>
              {result.valid ? t.merchant_verifyValid : t.merchant_verifyInvalid}
            </Text>
            {/* 結果訊息 */}
            {result.message && (
              <Text style={styles.resultMessage}>{result.message}</Text>
            )}
            {/* 重試按鈕 */}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset} accessibilityLabel="再試一次">
              <Text style={styles.resetButtonText}>{t.merchant_tryAgain}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ============ 輸入表單畫面 ============
          <View style={styles.formCard}>
            {/* 商家 ID 輸入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.merchant_merchantIdLabel}</Text>
              <TextInput
                style={styles.input}
                value={merchantId}
                onChangeText={setMerchantId}
                placeholder={t.merchant_merchantIdPlaceholder}
                placeholderTextColor={UIColors.textSecondary}
                keyboardType="number-pad"
              />
            </View>

            {/* 核銷碼輸入 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.merchant_codeLabel}</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={code}
                onChangeText={(text: string) => setCode(text.toUpperCase())}
                placeholder={t.merchant_codePlaceholder}
                placeholderTextColor={UIColors.textSecondary}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            {/* 驗證按鈕 */}
            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={loading}
              accessibilityLabel="驗證"
            >
              {loading ? (
                <ActivityIndicator size="small" color={UIColors.white} />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color={UIColors.white} />
                  <Text style={styles.verifyButtonText}>{t.merchant_verify}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  // 頂部標題區
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: UIColors.white,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  // 返回按鈕
  backButton: {
    marginRight: 16,
  },
  // 頁面標題
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.dark,
  },
  // 主要內容區
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  // 表單卡片
  formCard: {
    backgroundColor: UIColors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 輸入群組
  inputGroup: {
    marginBottom: 20,
  },
  // 輸入標籤
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: UIColors.textSecondary,
    marginBottom: 8,
  },
  // 輸入框
  input: {
    backgroundColor: MibuBrand.warmWhite,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: MibuBrand.dark,
  },
  // 核銷碼輸入框（特殊樣式）
  codeInput: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
  },
  // 驗證按鈕
  verifyButton: {
    backgroundColor: MibuBrand.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  // 驗證按鈕（停用狀態）
  verifyButtonDisabled: {
    backgroundColor: MibuBrand.copperLight,
  },
  // 驗證按鈕文字
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: UIColors.white,
  },
  // 結果卡片
  resultCard: {
    backgroundColor: UIColors.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 結果圖示容器
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  // 成功結果背景
  resultValid: {
    backgroundColor: SemanticColors.successDark,
  },
  // 失敗結果背景
  resultInvalid: {
    backgroundColor: SemanticColors.errorDark,
  },
  // 結果標題
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.dark,
    marginBottom: 8,
  },
  // 結果訊息
  resultMessage: {
    fontSize: 16,
    color: UIColors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  // 重試按鈕
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  // 重試按鈕文字
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
});
