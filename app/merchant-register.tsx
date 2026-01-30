/**
 * 商家註冊頁面（已登入用戶申請成為商家）
 *
 * 供已登入的旅客用戶申請成為商家。
 * 需填寫：
 * - 負責人姓名
 * - 商家名稱
 * - 統一編號（選填）
 * - 營業類別
 * - 商家地址
 * - 電話/手機
 * - Email
 *
 * 提交後導向 /pending-approval，等待後台審核
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../src/context/AppContext';
import { apiService } from '../src/services/api';
import { MibuBrand } from '../constants/Colors';
import { MerchantApplyParams } from '../src/types';

const BUSINESS_CATEGORIES = [
  { value: 'restaurant', labelZh: '餐飲業', labelEn: 'Restaurant' },
  { value: 'hotel', labelZh: '住宿業', labelEn: 'Hotel/Accommodation' },
  { value: 'attraction', labelZh: '景點/遊樂', labelEn: 'Attraction/Entertainment' },
  { value: 'shopping', labelZh: '購物零售', labelEn: 'Shopping/Retail' },
  { value: 'transportation', labelZh: '交通服務', labelEn: 'Transportation' },
  { value: 'experience', labelZh: '體驗活動', labelEn: 'Experience/Activity' },
  { value: 'culture', labelZh: '文化藝術', labelEn: 'Culture/Art' },
  { value: 'other', labelZh: '其他', labelEn: 'Other' },
];

export default function MerchantRegisterScreen() {
  const { state } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  const translations = {
    title: isZh ? '商家註冊' : 'Merchant Registration',
    subtitle: isZh ? '填寫資料以申請成為合作商家' : 'Fill in your details to apply as a partner merchant',
    ownerName: isZh ? '負責人姓名' : 'Owner Name',
    ownerNamePlaceholder: isZh ? '請輸入負責人姓名' : 'Enter owner name',
    businessName: isZh ? '商家名稱' : 'Business Name',
    businessNamePlaceholder: isZh ? '請輸入商家名稱' : 'Enter business name',
    taxId: isZh ? '統一編號（選填）' : 'Tax ID (Optional)',
    taxIdPlaceholder: isZh ? '請輸入統一編號' : 'Enter tax ID',
    businessCategory: isZh ? '營業類別' : 'Business Category',
    businessCategoryPlaceholder: isZh ? '請選擇營業類別' : 'Select business category',
    address: isZh ? '商家地址' : 'Business Address',
    addressPlaceholder: isZh ? '請輸入商家地址' : 'Enter business address',
    phone: isZh ? '電話（選填）' : 'Phone (Optional)',
    phonePlaceholder: isZh ? '請輸入電話' : 'Enter phone number',
    mobile: isZh ? '手機' : 'Mobile',
    mobilePlaceholder: isZh ? '請輸入手機號碼' : 'Enter mobile number',
    email: isZh ? 'Email' : 'Email',
    emailPlaceholder: isZh ? '請輸入 Email' : 'Enter email',
    cancel: isZh ? '取消' : 'Cancel',
    submit: isZh ? '送審' : 'Submit for Review',
    submitting: isZh ? '提交中...' : 'Submitting...',
    success: isZh ? '送審成功' : 'Submitted Successfully',
    successMessage: isZh ? '您的申請已提交，請等待審核通過。' : 'Your application has been submitted. Please wait for approval.',
    error: isZh ? '錯誤' : 'Error',
    errorMessage: isZh ? '提交失敗，請稍後再試' : 'Submission failed. Please try again.',
    requiredFields: isZh ? '請填寫所有必填欄位' : 'Please fill in all required fields',
    invalidEmail: isZh ? '請輸入有效的 Email' : 'Please enter a valid email',
  };

  const validateForm = (): boolean => {
    if (!ownerName.trim() || !businessName.trim() || !businessCategory || !address.trim() || !mobile.trim() || !email.trim()) {
      Alert.alert(translations.error, translations.requiredFields);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(translations.error, translations.invalidEmail);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@mibu_token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const params: MerchantApplyParams = {
        ownerName: ownerName.trim(),
        businessName: businessName.trim(),
        taxId: taxId.trim() || undefined,
        businessCategory,
        address: address.trim(),
        phone: phone.trim() || undefined,
        mobile: mobile.trim(),
        email: email.trim(),
      };

      await apiService.applyMerchant(token, params);

      Alert.alert(translations.success, translations.successMessage, [
        { text: 'OK', onPress: () => router.replace('/pending-approval') },
      ]);
    } catch (error: any) {
      console.error('Merchant registration failed:', error);
      Alert.alert(translations.error, error?.message || translations.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.replace('/');
  };

  const selectedCategory = BUSINESS_CATEGORIES.find(c => c.value === businessCategory);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{translations.subtitle}</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translations.ownerName} *</Text>
          <TextInput
            style={styles.input}
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder={translations.ownerNamePlaceholder}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translations.businessName} *</Text>
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder={translations.businessNamePlaceholder}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translations.taxId}</Text>
          <TextInput
            style={styles.input}
            value={taxId}
            onChangeText={setTaxId}
            placeholder={translations.taxIdPlaceholder}
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translations.businessCategory} *</Text>
          <TouchableOpacity 
            style={styles.picker}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={[styles.pickerText, !selectedCategory && styles.placeholderText]}>
              {selectedCategory 
                ? (isZh ? selectedCategory.labelZh : selectedCategory.labelEn)
                : translations.businessCategoryPlaceholder
              }
            </Text>
            <Ionicons 
              name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#64748b" 
            />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={styles.pickerOptions}>
              {BUSINESS_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.pickerOption,
                    businessCategory === cat.value && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    setBusinessCategory(cat.value);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    businessCategory === cat.value && styles.pickerOptionTextSelected
                  ]}>
                    {isZh ? cat.labelZh : cat.labelEn}
                  </Text>
                  {businessCategory === cat.value && (
                    <Ionicons name="checkmark" size={18} color={MibuBrand.brown} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translations.address} *</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder={translations.addressPlaceholder}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translations.phone}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={translations.phonePlaceholder}
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translations.mobile} *</Text>
          <TextInput
            style={styles.input}
            value={mobile}
            onChangeText={setMobile}
            placeholder={translations.mobilePlaceholder}
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{translations.email} *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={translations.emailPlaceholder}
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>{translations.submit}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: MibuBrand.cream,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MibuBrand.dark,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: MibuBrand.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: MibuBrand.dark,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  pickerText: {
    fontSize: 16,
    color: MibuBrand.dark,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  pickerOptions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  pickerOptionSelected: {
    backgroundColor: MibuBrand.highlight,
  },
  pickerOptionText: {
    fontSize: 15,
    color: MibuBrand.dark,
  },
  pickerOptionTextSelected: {
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 2,
    backgroundColor: MibuBrand.brown,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
