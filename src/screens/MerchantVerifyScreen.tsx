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
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

export function MerchantVerifyScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; message?: string } | null>(null);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '驗證核銷碼' : 'Verify Code',
    merchantIdLabel: isZh ? '商家 ID' : 'Merchant ID',
    merchantIdPlaceholder: isZh ? '輸入商家 ID' : 'Enter Merchant ID',
    codeLabel: isZh ? '核銷碼' : 'Verification Code',
    codePlaceholder: isZh ? '輸入核銷碼' : 'Enter code',
    verify: isZh ? '驗證' : 'Verify',
    verifying: isZh ? '驗證中...' : 'Verifying...',
    valid: isZh ? '驗證成功' : 'Valid',
    invalid: isZh ? '驗證失敗' : 'Invalid',
    errorEmpty: isZh ? '請輸入商家 ID 和核銷碼' : 'Please enter merchant ID and code',
    back: isZh ? '返回' : 'Back',
    tryAgain: isZh ? '再試一次' : 'Try Again',
  };

  const handleVerify = async () => {
    if (!code.trim() || !merchantId.trim()) {
      Alert.alert('', translations.errorEmpty);
      return;
    }

    const merchantIdNum = parseInt(merchantId.trim(), 10);
    if (isNaN(merchantIdNum)) {
      Alert.alert('', isZh ? '商家 ID 必須是數字' : 'Merchant ID must be a number');
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.verifyMerchantCode(token, merchantIdNum, code.trim());
      setResult({ 
        valid: response.valid, 
        message: response.valid 
          ? (isZh ? '核銷碼有效' : 'Code is valid')
          : (response.error || (isZh ? '核銷碼無效' : 'Code is invalid'))
      });
    } catch (error) {
      console.error('Verify failed:', error);
      setResult({ valid: false, message: isZh ? '驗證失敗' : 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setMerchantId('');
    setResult(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      <View style={styles.content}>
        {result ? (
          <View style={styles.resultCard}>
            <View style={[styles.resultIcon, result.valid ? styles.resultValid : styles.resultInvalid]}>
              <Ionicons
                name={result.valid ? 'checkmark-circle' : 'close-circle'}
                size={64}
                color="#ffffff"
              />
            </View>
            <Text style={styles.resultTitle}>
              {result.valid ? translations.valid : translations.invalid}
            </Text>
            {result.message && (
              <Text style={styles.resultMessage}>{result.message}</Text>
            )}
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>{translations.tryAgain}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{translations.merchantIdLabel}</Text>
              <TextInput
                style={styles.input}
                value={merchantId}
                onChangeText={setMerchantId}
                placeholder={translations.merchantIdPlaceholder}
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{translations.codeLabel}</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={code}
                onChangeText={(text) => setCode(text.toUpperCase())}
                placeholder={translations.codePlaceholder}
                placeholderTextColor="#94a3b8"
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#ffffff" />
                  <Text style={styles.verifyButtonText}>{translations.verify}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  codeInput: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  verifyButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  resultIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultValid: {
    backgroundColor: '#22c55e',
  },
  resultInvalid: {
    backgroundColor: '#ef4444',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
});
