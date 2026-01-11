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

export default function RegisterSpecialistScreen() {
  const router = useRouter();
  const { state } = useApp();
  const isZh = state.language === 'zh-TW';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    otherContact: '',
    serviceRegion: '',
  });

  const texts = {
    title: isZh ? '專員註冊' : 'Specialist Registration',
    email: isZh ? 'Email（帳號）' : 'Email (Account)',
    password: isZh ? '密碼（至少6字）' : 'Password (min 6 chars)',
    confirmPassword: isZh ? '確認密碼' : 'Confirm Password',
    name: isZh ? '名稱' : 'Name',
    otherContact: isZh ? '其他聯絡方式（選填）' : 'Other Contact (Optional)',
    serviceRegion: isZh ? '服務地區（選填）' : 'Service Region (Optional)',
    submit: isZh ? '提交申請' : 'Submit Application',
    back: isZh ? '返回登入' : 'Back to Login',
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
    if (!formData.name.trim()) {
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '請輸入名稱' : 'Please enter name');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/register/specialist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
          otherContact: formData.otherContact.trim() || undefined,
          serviceRegion: formData.serviceRegion.trim() || undefined,
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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#9B7BB8" />
          <Text style={[styles.backText, { color: '#9B7BB8' }]}>{texts.back}</Text>
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
          <Text style={styles.label}>{texts.name} <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder={isZh ? '請輸入您的名稱' : 'Enter your name'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.serviceRegion}</Text>
          <TextInput
            style={styles.input}
            value={formData.serviceRegion}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, serviceRegion: text }))}
            placeholder={isZh ? '例如：台北、宜蘭' : 'e.g., Taipei, Yilan'}
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
  container: { flex: 1, backgroundColor: '#F5F0FA' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  backButton: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, marginLeft: 4 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#5B3D6B', marginBottom: 24, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#5B3D6B', marginBottom: 8 },
  required: { color: '#ef4444' },
  input: { backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#333333', borderWidth: 1, borderColor: '#E0D6E8' },
  submitButton: { backgroundColor: '#9B7BB8', borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitButtonText: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
});
