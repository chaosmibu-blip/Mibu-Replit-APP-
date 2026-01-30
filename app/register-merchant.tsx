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
  { value: 'restaurant', label: { zh: '餐飲', en: 'Restaurant' } },
  { value: 'hotel', label: { zh: '住宿', en: 'Hotel' } },
  { value: 'attraction', label: { zh: '景點', en: 'Attraction' } },
  { value: 'shopping', label: { zh: '購物', en: 'Shopping' } },
  { value: 'activity', label: { zh: '活動', en: 'Activity' } },
  { value: 'other', label: { zh: '其他', en: 'Other' } },
];

export default function RegisterMerchantScreen() {
  const router = useRouter();
  const { state } = useApp();
  const isZh = state.language === 'zh-TW';

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
    title: isZh ? '商家註冊' : 'Merchant Registration',
    email: isZh ? 'Email（帳號）' : 'Email (Account)',
    password: isZh ? '密碼（至少6字）' : 'Password (min 6 chars)',
    confirmPassword: isZh ? '確認密碼' : 'Confirm Password',
    businessName: isZh ? '商家名稱' : 'Business Name',
    contactName: isZh ? '聯絡人名稱' : 'Contact Name',
    taxId: isZh ? '統一編號（選填）' : 'Tax ID (Optional)',
    businessCategory: isZh ? '產業類別' : 'Business Category',
    address: isZh ? '營業地址' : 'Business Address',
    otherContact: isZh ? '其他聯絡方式（選填）' : 'Other Contact (Optional)',
    submit: isZh ? '提交申請' : 'Submit Application',
    back: isZh ? '返回登入' : 'Back to Login',
    selectCategory: isZh ? '請選擇產業類別' : 'Select Business Category',
    required: isZh ? '必填' : 'Required',
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '請輸入 Email' : 'Please enter email');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? 'Email 格式不正確' : 'Invalid email format');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '密碼至少需要6個字' : 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '密碼不一致' : 'Passwords do not match');
      return false;
    }
    if (!formData.businessName.trim()) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '請輸入商家名稱' : 'Please enter business name');
      return false;
    }
    if (!formData.contactName.trim()) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '請輸入聯絡人名稱' : 'Please enter contact name');
      return false;
    }
    if (!formData.businessCategory) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '請選擇產業類別' : 'Please select business category');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '請輸入營業地址' : 'Please enter business address');
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
        Alert.alert(isZh ? '註冊失敗' : 'Registration Failed', data.message || (isZh ? '請稍後再試' : 'Please try again later'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '註冊失敗，請稍後再試' : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (value: string) => {
    const cat = BUSINESS_CATEGORIES.find(c => c.value === value);
    return cat ? cat.label[isZh ? 'zh' : 'en'] : texts.selectCategory;
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
            placeholder={isZh ? '請輸入商家名稱' : 'Enter business name'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.contactName} <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.contactName}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, contactName: text }))}
            placeholder={isZh ? '請輸入聯絡人姓名' : 'Enter contact name'}
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
                    {cat.label[isZh ? 'zh' : 'en']}
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
            placeholder={isZh ? '請輸入營業地址' : 'Enter business address'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.taxId}</Text>
          <TextInput
            style={styles.input}
            value={formData.taxId}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, taxId: text }))}
            placeholder={isZh ? '統一編號' : 'Tax ID'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.otherContact}</Text>
          <TextInput
            style={styles.input}
            value={formData.otherContact}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, otherContact: text }))}
            placeholder={isZh ? 'LINE ID 或電話' : 'LINE ID or Phone'}
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
