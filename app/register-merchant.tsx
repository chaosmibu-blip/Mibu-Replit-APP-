/**
 * 商家註冊頁面（OAuth 入口用）
 *
 * 提供商家申請帳號的表單，需填寫：
 * - Email 和密碼
 * - 商家名稱
 * - 聯絡人名稱
 * - 產業類別（餐飲、住宿、景點等）
 * - 營業地址
 * - 統一編號（選填）
 * - 其他聯絡方式（選填）
 *
 * 提交後導向 /register-success，等待後台審核
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { API_BASE_URL } from '../src/constants/translations';
import { MibuBrand } from '../constants/Colors';

const BUSINESS_CATEGORIES = [
  { value: 'restaurant', labelKey: 'merchant_catRestaurant' },
  { value: 'hotel', labelKey: 'merchant_catHotel' },
  { value: 'attraction', labelKey: 'merchant_catAttraction' },
  { value: 'shopping', labelKey: 'merchant_catShopping' },
  { value: 'activity', labelKey: 'merchant_catExperience' },
  { value: 'other', labelKey: 'merchant_catOther' },
];

export default function RegisterMerchantScreen() {
  const router = useRouter();
  const { state, t } = useApp();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    contactName: '',
    taxId: '',
    businessCategory: '',
    address: '',
    otherContact: '',
  });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const texts = {
    title: t.merchant_registration,
    email: t.merchant_regEmail,
    password: t.merchant_regPassword,
    confirmPassword: t.merchant_regConfirmPassword,
    businessName: t.merchant_regBusinessName,
    contactName: t.merchant_regContactName,
    taxId: t.merchant_regTaxId,
    businessCategory: t.merchant_regIndustryCategory,
    address: t.merchant_regBusinessAddress,
    otherContact: t.merchant_regOtherContact,
    submit: t.merchant_submitApplication,
    back: t.merchant_regBackToLogin,
    selectCategory: t.merchant_regSelectCategory,
    required: t.common_required,
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert(t.common_error, t.merchant_regEnterEmail);
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert(t.common_error, t.merchant_regInvalidEmailFormat);
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert(t.common_error, t.merchant_regPasswordMinLength);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert(t.common_error, t.merchant_regPasswordMismatch);
      return false;
    }
    if (!formData.businessName.trim()) {
      Alert.alert(t.common_error, t.merchant_regEnterBusinessName);
      return false;
    }
    if (!formData.contactName.trim()) {
      Alert.alert(t.common_error, t.merchant_regEnterContactName);
      return false;
    }
    if (!formData.businessCategory) {
      Alert.alert(t.common_error, t.merchant_regSelectIndustry);
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert(t.common_error, t.merchant_regEnterAddress);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/register/merchant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          businessName: formData.businessName.trim(),
          contactName: formData.contactName.trim(),
          taxId: formData.taxId.trim() || undefined,
          businessCategory: formData.businessCategory,
          address: formData.address.trim(),
          otherContact: formData.otherContact.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.replace('/register-success');
      } else {
        Alert.alert(t.auth_registrationFailed, data.message || t.auth_tryAgainLater);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(t.common_error, t.auth_registrationError);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (value: string) => {
    const cat = BUSINESS_CATEGORIES.find(c => c.value === value);
    return cat ? t[cat.labelKey] : texts.selectCategory;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brown} />
          <Text style={styles.backText}>{texts.back}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{texts.title}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.email} <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.password} <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, password: text }))}
            placeholder="******"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.confirmPassword} <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
            placeholder="******"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.businessName} <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.businessName}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, businessName: text }))}
            placeholder={t.merchant_regBusinessNamePlaceholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.contactName} <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.contactName}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, contactName: text }))}
            placeholder={t.merchant_regContactNamePlaceholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.businessCategory} <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity style={styles.selectInput} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
            <Text style={[styles.selectText, !formData.businessCategory && styles.placeholder]}>
              {getCategoryLabel(formData.businessCategory)}
            </Text>
            <Ionicons name="chevron-down" size={20} color={MibuBrand.copper} />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={styles.picker}>
              {BUSINESS_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.pickerItem, formData.businessCategory === cat.value && styles.pickerItemSelected]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, businessCategory: cat.value }));
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={[styles.pickerText, formData.businessCategory === cat.value && styles.pickerTextSelected]}>
                    {t[cat.labelKey]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.address} <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, address: text }))}
            placeholder={t.merchant_regAddressPlaceholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.taxId}</Text>
          <TextInput
            style={styles.input}
            value={formData.taxId}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, taxId: text }))}
            placeholder={t.merchant_regTaxIdShort}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.otherContact}</Text>
          <TextInput
            style={styles.input}
            value={formData.otherContact}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, otherContact: text }))}
            placeholder={t.merchant_regLineOrPhone}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>{texts.submit}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MibuBrand.creamLight },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, color: MibuBrand.brown, marginLeft: 4 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '800', color: MibuBrand.brownDark, marginBottom: 24, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: MibuBrand.brownDark, marginBottom: 8 },
  required: { color: '#ef4444' },
  input: { backgroundColor: MibuBrand.warmWhite, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: MibuBrand.brownDark, borderWidth: 1, borderColor: MibuBrand.tanLight },
  selectInput: { backgroundColor: MibuBrand.warmWhite, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: MibuBrand.tanLight },
  selectText: { fontSize: 16, color: MibuBrand.brownDark },
  placeholder: { color: MibuBrand.copper },
  picker: { backgroundColor: MibuBrand.warmWhite, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: MibuBrand.tanLight, overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: MibuBrand.tanLight },
  pickerItemSelected: { backgroundColor: MibuBrand.highlight },
  pickerText: { fontSize: 15, color: MibuBrand.brownDark },
  pickerTextSelected: { color: MibuBrand.brown, fontWeight: '600' },
  submitButton: { backgroundColor: MibuBrand.success, borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitButtonText: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
});
