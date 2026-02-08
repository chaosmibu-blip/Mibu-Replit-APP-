/**
 * AuthScreen - 登入/註冊畫面
 *
 * 功能說明：
 * - 提供帳號密碼登入、註冊功能
 * - 支援訪客模式快速體驗
 * - 註冊時可選擇身份（旅客/商家/專員）
 * - 支援嵌入模式用於帳號合併流程（#036）
 *
 * 串接的 API：
 * - POST /api/auth/login - 帳號密碼登入
 * - POST /api/auth/register - 註冊新帳號
 *
 * @see 後端合約: contracts/APP.md Phase 1
 */
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
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { UserRole } from '../../../types';
import { MibuBrand, UIColors, SemanticColors } from '../../../../constants/Colors';

// ============ 介面定義 ============

interface AuthScreenProps {
  visible: boolean;
  onClose: () => void;
  /** 嵌入模式：不顯示 Modal 外殼，直接渲染內容 */
  embedded?: boolean;
  /** 登入成功時的 callback，傳回 token（用於帳號合併流程） */
  onLoginSuccess?: (token: string) => void;
  /** 自訂標題 */
  title?: string;
}

/** 認證模式：登入或註冊 */
type AuthMode = 'login' | 'register';

// ============ 常數定義 ============

/** 角色選項設定（使用 labelKey 對應 translations key） */
const ROLE_OPTIONS: { value: UserRole; labelKey: string; icon: string }[] = [
  { value: 'traveler', labelKey: 'auth_roleTraveler', icon: 'airplane-outline' },
  { value: 'merchant', labelKey: 'auth_roleMerchant', icon: 'storefront-outline' },
  { value: 'specialist', labelKey: 'auth_roleSpecialist', icon: 'shield-checkmark-outline' },
];

// ============ 元件本體 ============

export function AuthScreen({ visible, onClose, embedded, onLoginSuccess, title }: AuthScreenProps) {
  const { setUser, t } = useApp();

  // ============ 狀態管理 ============

  const [mode, setMode] = useState<AuthMode>('login'); // 當前模式：登入或註冊
  const [loading, setLoading] = useState(false); // 是否正在載入（API 請求中）
  const [error, setError] = useState<string | null>(null); // 錯誤訊息

  // 表單欄位
  const [username, setUsername] = useState(''); // 帳號（Email）
  const [password, setPassword] = useState(''); // 密碼
  const [name, setName] = useState(''); // 姓名（註冊時使用）
  const [selectedRole, setSelectedRole] = useState<UserRole>('traveler'); // 選擇的身份

  // ============ 輔助函數 ============

  /**
   * 重置表單
   * 清空所有欄位並還原預設值
   */
  const resetForm = () => {
    setUsername('');
    setPassword('');
    setName('');
    setSelectedRole('traveler');
    setError(null);
  };

  // ============ 事件處理 ============

  /**
   * 處理登入
   * 驗證欄位後呼叫登入 API
   */
  const handleLogin = async () => {
    // 驗證必填欄位
    if (!username.trim() || !password.trim()) {
      setError(t.auth_enterUsernamePassword);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login(username.trim(), password);

      // #036 帳號合併：如果有 onLoginSuccess callback，只回傳 token 不設定用戶
      if (onLoginSuccess && response.token) {
        resetForm();
        onLoginSuccess(response.token);
        return;
      }

      // 正常登入流程：設定用戶並關閉 Modal
      setUser(response.user, response.token);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      setError(t.auth_loginFailed);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 處理註冊
   * 驗證欄位後呼叫註冊 API
   */
  const handleRegister = async () => {
    // 驗證必填欄位
    if (!username.trim() || !password.trim() || !name.trim()) {
      setError(t.auth_fillAllFields);
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
      setError(t.auth_registerFailed);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 處理訪客登入
   * 建立本地訪客帳號，不需要 API 呼叫
   */
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

  /**
   * 處理關閉
   * 重置表單並關閉 Modal
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ============ 渲染內容 ============

  /**
   * 渲染主要內容
   * #036 帳號合併：抽出共用內容供 Modal 和嵌入模式使用
   */
  const renderContent = () => (
    <View style={embedded ? styles.embeddedContainer : styles.container}>
      {/* ===== 標題列（僅 Modal 模式顯示） ===== */}
      {!embedded && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {title || (mode === 'login' ? t.auth_signIn : t.auth_signUp)}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={MibuBrand.copper} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* ===== 頭像圖示（僅 Modal 模式顯示） ===== */}
          {!embedded && (
            <View style={styles.iconContainer}>
              <Ionicons name="person-circle" size={64} color={MibuBrand.brown} />
            </View>
          )}

          {/* ===== 錯誤訊息 ===== */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={SemanticColors.errorDark} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ===== 姓名欄位（僅註冊模式） ===== */}
          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder={t.auth_name}
              value={name}
              onChangeText={setName}
              placeholderTextColor={UIColors.textSecondary}
              autoCapitalize="words"
            />
          )}

          {/* ===== 帳號欄位 ===== */}
          <TextInput
            style={styles.input}
            placeholder={t.auth_username}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor={UIColors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* ===== 密碼欄位 ===== */}
          <TextInput
            style={styles.input}
            placeholder={t.auth_password}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={UIColors.textSecondary}
            secureTextEntry
          />

          {/* ===== 身份選擇（僅註冊模式） ===== */}
          {mode === 'register' && (
            <>
              <Text style={styles.roleLabel}>{t.auth_selectRole}</Text>
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
                      color={selectedRole === role.value ? MibuBrand.brown : MibuBrand.copper}
                    />
                    <Text style={[
                      styles.roleText,
                      selectedRole === role.value && styles.roleTextActive,
                    ]}>
                      {t[role.labelKey]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* 非旅客身份的審核提示 */}
              {selectedRole !== 'traveler' && (
                <Text style={styles.approvalNote}>{t.auth_pendingApproval}</Text>
              )}
            </>
          )}

          {/* ===== 送出按鈕 ===== */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={UIColors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? t.auth_signIn : t.auth_signUp}
              </Text>
            )}
          </TouchableOpacity>

          {/* ===== 模式切換按鈕 ===== */}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
          >
            <Text style={styles.switchText}>
              {mode === 'login' ? t.auth_noAccount : t.auth_hasAccount}
              <Text style={styles.switchTextBold}>
                {' '}{mode === 'login' ? t.auth_signUp : t.auth_signIn}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* ===== 訪客登入區塊（嵌入模式不顯示） ===== */}
          {!embedded && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
                <Ionicons name="person-outline" size={20} color={MibuBrand.brown} />
                <Text style={styles.guestButtonText}>{t.auth_guestLogin}</Text>
              </TouchableOpacity>

              <Text style={styles.note}>{t.auth_guestNote}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );

  // #036 帳號合併：嵌入模式直接返回內容，不包 Modal
  if (embedded) {
    return renderContent();
  }

  // ============ Modal 模式渲染 ============

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {renderContent()}
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 背景遮罩
  overlay: {
    flex: 1,
    backgroundColor: UIColors.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Modal 容器
  container: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // #036 帳號合併：嵌入模式容器
  embeddedContainer: {
    width: '100%',
    paddingTop: 8,
  },
  // 標題列
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  closeButton: {
    padding: 4,
  },
  // 可捲動內容區
  scrollContent: {
    maxHeight: 600,
  },
  content: {
    padding: 24,
  },
  // 頭像圖示容器
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  // 錯誤訊息
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.errorLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: SemanticColors.errorDark,
    fontSize: 14,
    flex: 1,
  },
  // 輸入欄位
  input: {
    backgroundColor: MibuBrand.creamLight,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: MibuBrand.brownDark,
    marginBottom: 12,
  },
  // 身份選擇
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.copper,
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
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    gap: 8,
  },
  roleCardActive: {
    borderColor: MibuBrand.brown,
    backgroundColor: MibuBrand.highlight,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  roleTextActive: {
    color: MibuBrand.brown,
  },
  approvalNote: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 16,
  },
  // 送出按鈕
  submitButton: {
    backgroundColor: MibuBrand.brown,
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
    color: UIColors.white,
  },
  // 模式切換
  switchButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: MibuBrand.copper,
  },
  switchTextBold: {
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  // 分隔線
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: MibuBrand.tanLight,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    color: MibuBrand.tan,
  },
  // 訪客登入按鈕
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.highlight,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  // 底部備註
  note: {
    fontSize: 12,
    color: MibuBrand.tan,
    textAlign: 'center',
    marginTop: 16,
  },
});
