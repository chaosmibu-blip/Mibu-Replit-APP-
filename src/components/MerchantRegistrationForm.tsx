import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { MerchantApplyParams } from '../types';

interface MerchantRegistrationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const BUSINESS_CATEGORIES = [
  { value: 'restaurant', labelZh: '餐飲', labelEn: 'Restaurant' },
  { value: 'retail', labelZh: '零售', labelEn: 'Retail' },
  { value: 'hotel', labelZh: '住宿', labelEn: 'Hotel' },
  { value: 'entertainment', labelZh: '娛樂', labelEn: 'Entertainment' },
  { value: 'service', labelZh: '服務', labelEn: 'Service' },
  { value: 'other', labelZh: '其他', labelEn: 'Other' },
];

export function MerchantRegistrationForm({ onSuccess, onCancel }: MerchantRegistrationFormProps) {
  const { state } = useApp();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MerchantApplyParams>({
    ownerName: '',
    businessName: '',
    taxId: '',
    businessCategory: 'restaurant',
    address: '',
    phone: '',
    mobile: '',
    email: state.user?.email || '',
  });

  const translations = {
    title: isZh ? '商家入駐申請' : 'Merchant Application',
    subtitle: isZh ? '填寫以下資料，我們將在 1-3 個工作天內審核' : 'Fill in the details below. Review takes 1-3 business days.',
    ownerName: isZh ? '負責人姓名 *' : 'Owner Name *',
    businessName: isZh ? '商家名稱 *' : 'Business Name *',
    taxId: isZh ? '統一編號' : 'Tax ID',
    businessCategory: isZh ? '商家類型 *' : 'Business Category *',
    address: isZh ? '商家地址 *' : 'Business Address *',
    phone: isZh ? '市話' : 'Phone',
    mobile: isZh ? '手機號碼 *' : 'Mobile *',
    email: isZh ? '聯絡信箱 *' : 'Contact Email *',
    submit: isZh ? '提交申請' : 'Submit Application',
    cancel: isZh ? '取消' : 'Cancel',
    requiredFields: isZh ? '請填寫所有必填欄位' : 'Please fill all required fields',
    submitSuccess: isZh ? '申請已提交，請等待審核' : 'Application submitted. Awaiting review.',
    submitFailed: isZh ? '提交失敗，請稍後再試' : 'Submission failed. Please try again.',
  };

  const handleSubmit = async () => {
    if (!formData.ownerName.trim() || !formData.businessName.trim() || 
        !formData.businessCategory || !formData.address.trim() ||
        !formData.mobile.trim() || !formData.email.trim()) {
      Alert.alert(isZh ? '錯誤' : 'Error', translations.requiredFields);
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('@mibu_token');
      if (!token) return;

      await apiService.applyMerchant(token, formData);
      Alert.alert(
        isZh ? '成功' : 'Success',
        translations.submitSuccess,
        [{ text: 'OK', onPress: onSuccess }]
      );
    } catch (error) {
      console.error('Apply failed:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', translations.submitFailed);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof MerchantApplyParams, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#64748b" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="storefront" size={32} color="#6366f1" />
        </View>
        <Text style={styles.title}>{translations.title}</Text>
        <Text style={styles.subtitle}>{translations.subtitle}</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>{translations.ownerName}</Text>
          <TextInput
            style={styles.input}
            value={formData.ownerName}
            onChangeText={text => updateField('ownerName', text)}
            placeholder={isZh ? '請輸入負責人姓名' : 'Enter owner name'}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{translations.businessName}</Text>
          <TextInput
            style={styles.input}
            value={formData.businessName}
            onChangeText={text => updateField('businessName', text)}
            placeholder={isZh ? '請輸入商家名稱' : 'Enter business name'}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{translations.businessCategory}</Text>
          <View style={styles.categoryGrid}>
            {BUSINESS_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryOption,
                  formData.businessCategory === cat.value && styles.categoryOptionActive,
                ]}
                onPress={() => updateField('businessCategory', cat.value)}
              >
                <Text style={[
                  styles.categoryText,
                  formData.businessCategory === cat.value && styles.categoryTextActive,
                ]}>
                  {isZh ? cat.labelZh : cat.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{translations.taxId}</Text>
          <TextInput
            style={styles.input}
            value={formData.taxId}
            onChangeText={text => updateField('taxId', text)}
            placeholder={isZh ? '選填' : 'Optional'}
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{translations.address}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={text => updateField('address', text)}
            placeholder={isZh ? '請輸入商家地址' : 'Enter business address'}
            placeholderTextColor="#94a3b8"
            multiline
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfSection}>
            <Text style={styles.label}>{translations.phone}</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={text => updateField('phone', text)}
              placeholder="02-1234-5678"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.label}>{translations.mobile}</Text>
            <TextInput
              style={styles.input}
              value={formData.mobile}
              onChangeText={text => updateField('mobile', text)}
              placeholder="0912-345-678"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{translations.email}</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={text => updateField('email', text)}
            placeholder="contact@example.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={18} color="#ffffff" />
                <Text style={styles.submitButtonText}>{translations.submit}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#eef2ff',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  categoryOptionActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b',
  },
  categoryTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfSection: {
    flex: 1,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
