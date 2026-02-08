/**
 * 旅客註冊頁面
 *
 * 提供 Email 註冊功能，讓用戶建立旅客帳號。
 *
 * 功能：
 * - Email + 密碼註冊
 * - 名字（選填）
 * - 多語系支援
 * - 表單驗證（密碼長度、密碼一致性）
 *
 * 註冊成功後自動登入並導向 /(tabs)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { API_BASE_URL } from '../src/constants/translations';
import { MibuBrand } from '../constants/Colors';

const AUTH_TOKEN_KEY = '@mibu_token';

const TRANSLATIONS = {
  'zh-TW': {
    title: '建立帳號',
    subtitle: '開始你的旅程探索之旅',
    email: 'Email',
    password: '密碼（至少 6 個字元）',
    confirmPassword: '確認密碼',
    firstName: '名字（選填）',
    register: '註冊',
    hasAccount: '已有帳號？',
    login: '返回登入',
    error: '錯誤',
    success: '成功',
    registerSuccess: '註冊成功！',
    registerFailed: '註冊失敗',
    passwordTooShort: '密碼至少需要 6 個字元',
    passwordMismatch: '兩次輸入的密碼不一致',
    emailRequired: '請輸入 Email',
    emailExists: '此電子郵件已被註冊',
    tryAgain: '請稍後再試',
  },
  'en': {
    title: 'Create Account',
    subtitle: 'Start your journey of exploration',
    email: 'Email',
    password: 'Password (at least 6 characters)',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name (optional)',
    register: 'Register',
    hasAccount: 'Already have an account?',
    login: 'Back to Login',
    error: 'Error',
    success: 'Success',
    registerSuccess: 'Registration successful!',
    registerFailed: 'Registration failed',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    emailRequired: 'Please enter your email',
    emailExists: 'This email is already registered',
    tryAgain: 'Please try again later',
  },
  'ja': {
    title: 'アカウント作成',
    subtitle: '探検の旅を始めよう',
    email: 'メールアドレス',
    password: 'パスワード（6文字以上）',
    confirmPassword: 'パスワード確認',
    firstName: '名前（任意）',
    register: '登録',
    hasAccount: 'アカウントをお持ちですか？',
    login: 'ログインに戻る',
    error: 'エラー',
    success: '成功',
    registerSuccess: '登録成功！',
    registerFailed: '登録失敗',
    passwordTooShort: 'パスワードは6文字以上必要です',
    passwordMismatch: 'パスワードが一致しません',
    emailRequired: 'メールアドレスを入力してください',
    emailExists: 'このメールアドレスは既に登録されています',
    tryAgain: '後でもう一度お試しください',
  },
  'ko': {
    title: '계정 만들기',
    subtitle: '탐험의 여정을 시작하세요',
    email: '이메일',
    password: '비밀번호 (6자 이상)',
    confirmPassword: '비밀번호 확인',
    firstName: '이름 (선택)',
    register: '가입',
    hasAccount: '이미 계정이 있으신가요?',
    login: '로그인으로 돌아가기',
    error: '오류',
    success: '성공',
    registerSuccess: '가입 완료!',
    registerFailed: '가입 실패',
    passwordTooShort: '비밀번호는 6자 이상이어야 합니다',
    passwordMismatch: '비밀번호가 일치하지 않습니다',
    emailRequired: '이메일을 입력해주세요',
    emailExists: '이미 등록된 이메일입니다',
    tryAgain: '나중에 다시 시도해주세요',
  },
};

export default function RegisterScreen() {
  const { setUser, state } = useApp();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const t = TRANSLATIONS[state.language] || TRANSLATIONS['zh-TW'];

  const handleRegister = async () => {
    if (!email.trim()) {
      Alert.alert(t.error, t.emailRequired);
      return;
    }

    if (password.length < 6) {
      Alert.alert(t.error, t.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t.error, t.passwordMismatch);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errorCode === 'E1005') {
          Alert.alert(t.error, t.emailExists);
        } else {
          Alert.alert(t.error, data.message || t.registerFailed);
        }
        return;
      }

      if (data.token && data.user) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
        await AsyncStorage.setItem('@mibu_user', JSON.stringify(data.user));

        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.firstName || data.user.email.split('@')[0],
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: data.user.role || 'traveler',
          isApproved: data.user.isApproved,
          provider: 'email',
          providerId: data.user.id,
        }, data.token);

        router.replace('/(tabs)');
      } else {
        Alert.alert(t.error, t.registerFailed);
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert(t.error, t.tryAgain);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel={t.login}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brown} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={MibuBrand.copper} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t.email}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor={MibuBrand.tan}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={MibuBrand.copper} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t.password}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholderTextColor={MibuBrand.tan}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={showPassword
                ? (state.language === 'zh-TW' ? '隱藏密碼' : 'Hide password')
                : (state.language === 'zh-TW' ? '顯示密碼' : 'Show password')}
              accessibilityRole="button"
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={MibuBrand.copper}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={MibuBrand.copper} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t.confirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              placeholderTextColor={MibuBrand.tan}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              accessibilityLabel={showConfirmPassword
                ? (state.language === 'zh-TW' ? '隱藏確認密碼' : 'Hide confirm password')
                : (state.language === 'zh-TW' ? '顯示確認密碼' : 'Show confirm password')}
              accessibilityRole="button"
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={MibuBrand.copper}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={MibuBrand.copper} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t.firstName}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              placeholderTextColor={MibuBrand.tan}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            accessibilityLabel={t.register}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={20} color="#ffffff" />
                <Text style={styles.registerButtonText}>{t.register}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t.hasAccount}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel={t.login}
            accessibilityRole="link"
          >
            <Text style={styles.loginLink}>{t.login}</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MibuBrand.warmWhite,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    marginBottom: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: MibuBrand.brown,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MibuBrand.copper,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: MibuBrand.brownDark,
    paddingVertical: 16,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: MibuBrand.brownDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
    color: MibuBrand.copper,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
});
