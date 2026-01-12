import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { UserRole } from '../types';

interface AuthScreenProps {
  visible: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register';

const ROLE_OPTIONS: { value: UserRole; labelZh: string; labelEn: string; icon: string }[] = [
  { value: 'traveler', labelZh: '旅客', labelEn: 'Traveler', icon: 'airplane-outline' },
  { value: 'merchant', labelZh: '商家', labelEn: 'Merchant', icon: 'storefront-outline' },
  { value: 'specialist', labelZh: '專員', labelEn: 'Specialist', icon: 'shield-checkmark-outline' },
];

export function AuthScreen({ visible, onClose }: AuthScreenProps) {
  const { setUser, state } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('traveler');

  const isZh = state.language === 'zh-TW';

  const translations = {
    login: isZh ? '登入' : 'Sign In',
    register: isZh ? '註冊' : 'Sign Up',
    username: isZh ? '帳號（Email）' : 'Username (Email)',
    password: isZh ? '密碼' : 'Password',
    name: isZh ? '姓名' : 'Name',
    selectRole: isZh ? '選擇身份' : 'Select Role',
    noAccount: isZh ? '還沒有帳號？' : "Don't have an account?",
    hasAccount: isZh ? '已有帳號？' : 'Already have an account?',
    guestLogin: isZh ? '以訪客身份繼續' : 'Continue as Guest',
    guestNote: isZh ? '訪客模式下，資料僅保存在本機裝置' : 'In guest mode, data is only saved locally',
    pendingApproval: isZh ? '商家和專員帳號需管理員審核後才能使用' : 'Merchant and Specialist accounts require admin approval',
    loginFailed: isZh ? '登入失敗，請檢查帳號密碼' : 'Login failed, please check your credentials',
    registerFailed: isZh ? '註冊失敗，請稍後再試' : 'Registration failed, please try again',
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setName('');
    setSelectedRole('traveler');
    setError(null);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError(isZh ? '請填寫帳號和密碼' : 'Please enter username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login(username.trim(), password);
      setUser(response.user, response.token);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      setError(translations.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !name.trim()) {
      setError(isZh ? '請填寫所有欄位' : 'Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.register({
        username: username.trim(),
        password,
        name: name.trim(),
        role: selectedRole,
      });
      setUser(response.user, response.token);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Register error:', err);
      setError(translations.registerFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setUser({
      id: 'guest',
      name: 'Guest User',
      email: null,
      avatar: null,
      firstName: 'Guest',
      role: 'traveler',
      provider: 'guest',
      providerId: 'guest',
    });
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {mode === 'login' ? translations.login : translations.register}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle" size={64} color="#6366f1" />
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {mode === 'register' && (
                <TextInput
                  style={styles.input}
                  placeholder={translations.name}
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                />
              )}

              <TextInput
                style={styles.input}
                placeholder={translations.username}
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder={translations.password}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#94a3b8"
                secureTextEntry
              />

              {mode === 'register' && (
                <>
                  <Text style={styles.roleLabel}>{translations.selectRole}</Text>
                  <View style={styles.roleGrid}>
                    {ROLE_OPTIONS.map(role => (
                      <TouchableOpacity
                        key={role.value}
                        style={[
                          styles.roleCard,
                          selectedRole === role.value && styles.roleCardActive,
                        ]}
                        onPress={() => setSelectedRole(role.value)}
                      >
                        <Ionicons 
                          name={role.icon as any} 
                          size={24} 
                          color={selectedRole === role.value ? '#6366f1' : '#64748b'} 
                        />
                        <Text style={[
                          styles.roleText,
                          selectedRole === role.value && styles.roleTextActive,
                        ]}>
                          {isZh ? role.labelZh : role.labelEn}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {selectedRole !== 'traveler' && (
                    <Text style={styles.approvalNote}>{translations.pendingApproval}</Text>
                  )}
                </>
              )}

              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                onPress={mode === 'login' ? handleLogin : handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {mode === 'login' ? translations.login : translations.register}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.switchButton}
                onPress={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
              >
                <Text style={styles.switchText}>
                  {mode === 'login' ? translations.noAccount : translations.hasAccount}
                  <Text style={styles.switchTextBold}>
                    {' '}{mode === 'login' ? translations.register : translations.login}
                  </Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
                <Ionicons name="person-outline" size={20} color="#6366f1" />
                <Text style={styles.guestButtonText}>{translations.guestLogin}</Text>
              </TouchableOpacity>

              <Text style={styles.note}>{translations.guestNote}</Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    maxHeight: 600,
  },
  content: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
    marginTop: 8,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  roleCardActive: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  roleTextActive: {
    color: '#6366f1',
  },
  approvalNote: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  switchButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#64748b',
  },
  switchTextBold: {
    fontWeight: '700',
    color: '#6366f1',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#94a3b8',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#eef2ff',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  note: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
  },
});
