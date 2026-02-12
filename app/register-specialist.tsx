/**
 * 專員註冊頁面
 *
 * 提供專員申請帳號的表單，需填寫：
 * - Email 和密碼
 * - 名稱
 * - 服務地區（選填）
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
import { useI18n } from '../src/context/AppContext';
import { API_BASE_URL } from '../src/constants/translations';
import { MibuBrand } from '../constants/Colors';

export default function RegisterSpecialistScreen() {
  const router = useRouter();
  const { t } = useI18n();

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
    title: t.specialist_registration,
    email: t.specialist_emailAccount,
    password: t.specialist_passwordMin,
    confirmPassword: t.specialist_confirmPassword,
    name: t.specialist_nameLabel,
    otherContact: t.specialist_otherContact,
    serviceRegion: t.specialist_serviceRegionOptional,
    submit: t.specialist_submitApplication,
    back: t.specialist_backToLogin,
    required: t.common_required,
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert(t.common_error, t.specialist_enterEmail);
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert(t.common_error, t.specialist_invalidEmailFormat);
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert(t.common_error, t.specialist_passwordMinLength);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert(t.common_error, t.specialist_passwordMismatch);
      return false;
    }
    if (!formData.name.trim()) {
      Alert.alert(t.common_error, t.specialist_enterName);
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
        Alert.alert(t.auth_registrationFailed, data.message || t.auth_tryAgainLater);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(t.common_error, t.auth_registrationError);
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
            placeholder={t.specialist_namePlaceholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.serviceRegion}</Text>
          <TextInput
            style={styles.input}
            value={formData.serviceRegion}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, serviceRegion: text }))}
            placeholder={t.specialist_regionPlaceholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{texts.otherContact}</Text>
          <TextInput
            style={styles.input}
            value={formData.otherContact}
            onChangeText={(text: string) => setFormData(prev => ({ ...prev, otherContact: text }))}
            placeholder={t.specialist_lineOrPhone}
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
