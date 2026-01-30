/**
 * ProfileScreen - 個人資料畫面
 *
 * 功能說明：
 * - 顯示並編輯用戶個人資料
 * - 包含基本資訊（姓名、性別、生日、電話）
 * - 健康資訊（飲食禁忌、疾病史）
 * - 緊急聯絡人設定
 * - 頭像選擇功能
 *
 * 串接的 API：
 * - GET /api/user/profile - 取得個人資料
 * - PUT /api/user/profile - 更新個人資料
 *
 * @see 後端合約: contracts/APP.md Phase 2
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { TagInput } from '../components/TagInput';
import { UserProfile, Gender } from '../../../types';
import { MibuBrand } from '../../../../constants/Colors';

// ============ 常數定義 ============

/** 預設頭像選項 */
const AVATAR_PRESETS = [
  { id: 'default', icon: 'person', color: MibuBrand.brown },
  { id: 'cat', icon: 'paw', color: '#F59E0B' },
  { id: 'star', icon: 'star', color: '#8B5CF6' },
  { id: 'heart', icon: 'heart', color: '#EF4444' },
  { id: 'leaf', icon: 'leaf', color: '#10B981' },
  { id: 'compass', icon: 'compass', color: '#3B82F6' },
  { id: 'flame', icon: 'flame', color: '#F97316' },
  { id: 'diamond', icon: 'diamond', color: '#EC4899' },
];

/** 性別選項 */
const GENDER_OPTIONS: { value: Gender; labelZh: string; labelEn: string }[] = [
  { value: 'male', labelZh: '男', labelEn: 'Male' },
  { value: 'female', labelZh: '女', labelEn: 'Female' },
  { value: 'other', labelZh: '其他', labelEn: 'Other' },
];

/** 關係選項（緊急聯絡人） */
const RELATION_OPTIONS = [
  { value: 'spouse', labelZh: '配偶', labelEn: 'Spouse' },
  { value: 'parent', labelZh: '父母', labelEn: 'Parent' },
  { value: 'sibling', labelZh: '兄弟姊妹', labelEn: 'Sibling' },
  { value: 'friend', labelZh: '朋友', labelEn: 'Friend' },
  { value: 'other', labelZh: '其他', labelEn: 'Other' },
];

// ============ 輔助函數 ============

/**
 * #037: 截斷用戶 ID 顯示
 * Apple 登入的 ID 格式為 apple_001841.4e76a5ef7a914a4694d7ae760d3bd943.1507
 * 只顯示第一個點之前的部分：apple_001841
 */
const displayUserId = (userId: string | undefined): string => {
  if (!userId) return '-';
  const dotIndex = userId.indexOf('.');
  return dotIndex > 0 ? userId.substring(0, dotIndex) : userId;
};

// ============ 元件本體 ============

export function ProfileScreen() {
  const { state, getToken, setUser } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  // ============ 狀態管理 ============

  const [loading, setLoading] = useState(true); // 頁面載入中
  const [saving, setSaving] = useState(false); // 儲存中
  const [profile, setProfile] = useState<UserProfile | null>(null); // 完整的 profile 資料

  // 基本資訊欄位
  const [email, setEmail] = useState(''); // Email（#037 可編輯）
  const [firstName, setFirstName] = useState(''); // 名
  const [lastName, setLastName] = useState(''); // 姓
  const [gender, setGender] = useState<Gender | null>(null); // 性別
  const [birthDate, setBirthDate] = useState(''); // 出生日期
  const [phone, setPhone] = useState(''); // 手機號碼

  // 健康資訊欄位
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]); // 飲食禁忌
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]); // 疾病史

  // 緊急聯絡人欄位
  const [emergencyContactName, setEmergencyContactName] = useState(''); // 聯絡人姓名
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(''); // 聯絡人電話
  const [emergencyContactRelation, setEmergencyContactRelation] = useState(''); // 聯絡人關係

  // UI 控制狀態
  const [showGenderPicker, setShowGenderPicker] = useState(false); // 顯示性別選擇器
  const [showRelationPicker, setShowRelationPicker] = useState(false); // 顯示關係選擇器
  const [showAvatarModal, setShowAvatarModal] = useState(false); // 顯示頭像選擇 Modal
  const [selectedAvatar, setSelectedAvatar] = useState<string>('default'); // 選中的頭像

  // ============ 生命週期 ============

  useEffect(() => {
    loadProfile();
  }, []);

  // ============ 資料載入 ============

  /**
   * 載入個人資料
   * 從後端 API 取得用戶 profile 並填入表單
   */
  const loadProfile = async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.back();
        return;
      }

      const data = await apiService.getProfile(token);
      setProfile(data);

      // 將資料填入各欄位
      setEmail(data.email || ''); // #037: Email 可編輯
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setGender(data.gender);
      setBirthDate(data.birthDate || '');
      setPhone(data.phone || '');
      setDietaryRestrictions(data.dietaryRestrictions || []);
      setMedicalHistory(data.medicalHistory || []);
      setEmergencyContactName(data.emergencyContactName || '');
      setEmergencyContactPhone(data.emergencyContactPhone || '');
      setEmergencyContactRelation(data.emergencyContactRelation || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert(
        isZh ? '錯誤' : 'Error',
        isZh ? '無法載入個人資料' : 'Failed to load profile'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============ 事件處理 ============

  /**
   * 處理儲存
   * 將表單資料送到後端更新
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await apiService.updateProfile(token, {
        email: email || undefined, // #037: 支援 Email 更新
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        gender: gender || undefined,
        birthDate: birthDate || undefined,
        phone: phone || undefined,
        dietaryRestrictions,
        medicalHistory,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone || undefined,
        emergencyContactRelation: emergencyContactRelation || undefined,
      });

      // 用回傳的新資料更新本地狀態
      if (response && response.profile) {
        const data = response.profile;
        setProfile(data);
        setEmail(data.email || ''); // #037: 更新 Email
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setGender(data.gender);
        setBirthDate(data.birthDate || '');
        setPhone(data.phone || '');
        setDietaryRestrictions(data.dietaryRestrictions || []);
        setMedicalHistory(data.medicalHistory || []);
        setEmergencyContactName(data.emergencyContactName || '');
        setEmergencyContactPhone(data.emergencyContactPhone || '');
        setEmergencyContactRelation(data.emergencyContactRelation || '');

        // 同步更新全域用戶狀態（修復 #017 用戶名消失問題）
        if (state.user) {
          const updatedUser = {
            ...state.user,
            firstName: data.firstName || state.user.firstName,
            lastName: data.lastName || state.user.lastName,
            name: data.firstName && data.lastName
              ? `${data.firstName} ${data.lastName}`
              : data.firstName || data.lastName || state.user.name,
          };
          setUser(updatedUser);
        }
      }

      Alert.alert(
        isZh ? '成功' : 'Success',
        isZh ? '個人資料已更新' : 'Profile updated successfully'
      );
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert(
        isZh ? '錯誤' : 'Error',
        isZh ? '儲存失敗' : 'Failed to save'
      );
    } finally {
      setSaving(false);
    }
  };

  // ============ 載入狀態 ============

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  // ============ 主要渲染 ============

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* ===== 頂部導航列 ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isZh ? '個人資料' : 'Profile'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator size="small" color={MibuBrand.brown} />
          ) : (
            <Text style={styles.saveButtonText}>{isZh ? '儲存' : 'Save'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* ===== 頭像區塊 ===== */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowAvatarModal(true)}
          >
            <View style={[styles.avatar, { backgroundColor: AVATAR_PRESETS.find(a => a.id === selectedAvatar)?.color || MibuBrand.brown }]}>
              {selectedAvatar === 'default' ? (
                <Text style={styles.avatarText}>
                  {firstName?.charAt(0) || profile?.firstName?.charAt(0) || state.user?.name?.charAt(0) || '?'}
                </Text>
              ) : (
                <Ionicons
                  name={AVATAR_PRESETS.find(a => a.id === selectedAvatar)?.icon as any || 'person'}
                  size={44}
                  color="#ffffff"
                />
              )}
            </View>
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={14} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {isZh ? '點擊更換頭像' : 'Tap to change avatar'}
          </Text>
        </View>

        {/* ===== 唯讀欄位：用戶 ID（#037 截斷顯示）===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '用戶 ID' : 'User ID'}</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{displayUserId(profile?.id)}</Text>
          </View>
        </View>

        {/* ===== Email 欄位（#037 改為可編輯）===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={isZh ? '請輸入 Email' : 'Enter email'}
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* ===== 姓名欄位 ===== */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>{isZh ? '姓' : 'Last Name'}</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder={isZh ? '請輸入姓氏' : 'Enter last name'}
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.sectionTitle}>{isZh ? '名' : 'First Name'}</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={isZh ? '請輸入名字' : 'Enter first name'}
              placeholderTextColor="#94a3b8"
            />
          </View>
        </View>

        {/* ===== 性別欄位 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '性別' : 'Gender'}</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowGenderPicker(!showGenderPicker)}
          >
            <Text style={gender ? styles.pickerText : styles.pickerPlaceholder}>
              {gender
                ? GENDER_OPTIONS.find(g => g.value === gender)?.[isZh ? 'labelZh' : 'labelEn'] || gender
                : isZh ? '請選擇' : 'Select'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </TouchableOpacity>
          {/* 性別選項下拉 */}
          {showGenderPicker && (
            <View style={styles.pickerOptions}>
              {GENDER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.pickerOption, gender === option.value && styles.pickerOptionActive]}
                  onPress={() => {
                    setGender(option.value);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, gender === option.value && styles.pickerOptionTextActive]}>
                    {isZh ? option.labelZh : option.labelEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ===== 出生日期欄位 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '出生年月日' : 'Birth Date'}</Text>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* ===== 手機欄位 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '手機' : 'Phone'}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={isZh ? '請輸入手機號碼' : 'Enter phone number'}
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
        </View>

        {/* ===== 飲食禁忌欄位 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '飲食禁忌' : 'Dietary Restrictions'}</Text>
          <TagInput
            value={dietaryRestrictions}
            onChange={setDietaryRestrictions}
            placeholder={isZh ? '輸入飲食禁忌，如：素食、海鮮過敏' : 'e.g., Vegetarian, Seafood allergy'}
          />
        </View>

        {/* ===== 疾病史欄位 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '疾病史' : 'Medical History'}</Text>
          <TagInput
            value={medicalHistory}
            onChange={setMedicalHistory}
            placeholder={isZh ? '輸入疾病史，如：糖尿病、高血壓' : 'e.g., Diabetes, Hypertension'}
          />
        </View>

        {/* ===== 分隔線 ===== */}
        <View style={styles.divider} />

        {/* ===== 緊急聯絡人區塊 ===== */}
        <Text style={styles.groupTitle}>{isZh ? '緊急聯絡人' : 'Emergency Contact'}</Text>

        {/* 緊急聯絡人姓名 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '姓名' : 'Name'}</Text>
          <TextInput
            style={styles.input}
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            placeholder={isZh ? '請輸入姓名' : 'Enter name'}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* 緊急聯絡人電話 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '電話' : 'Phone'}</Text>
          <TextInput
            style={styles.input}
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
            placeholder={isZh ? '請輸入電話' : 'Enter phone'}
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
          />
        </View>

        {/* 緊急聯絡人關係 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isZh ? '關係' : 'Relationship'}</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowRelationPicker(!showRelationPicker)}
          >
            <Text style={emergencyContactRelation ? styles.pickerText : styles.pickerPlaceholder}>
              {emergencyContactRelation
                ? RELATION_OPTIONS.find(r => r.value === emergencyContactRelation)?.[isZh ? 'labelZh' : 'labelEn'] || emergencyContactRelation
                : isZh ? '請選擇' : 'Select'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </TouchableOpacity>
          {/* 關係選項下拉 */}
          {showRelationPicker && (
            <View style={styles.pickerOptions}>
              {RELATION_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.pickerOption, emergencyContactRelation === option.value && styles.pickerOptionActive]}
                  onPress={() => {
                    setEmergencyContactRelation(option.value);
                    setShowRelationPicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionText, emergencyContactRelation === option.value && styles.pickerOptionTextActive]}>
                    {isZh ? option.labelZh : option.labelEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 底部留白 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ===== 頭像選擇 Modal ===== */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <TouchableOpacity
          style={styles.avatarModalOverlay}
          activeOpacity={1}
          onPress={() => setShowAvatarModal(false)}
        >
          <View style={styles.avatarModalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.avatarModalTitle}>
              {isZh ? '選擇頭像' : 'Choose Avatar'}
            </Text>

            {/* 頭像選項網格 */}
            <View style={styles.avatarGrid}>
              {AVATAR_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === preset.id && styles.avatarOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedAvatar(preset.id);
                    setShowAvatarModal(false);
                  }}
                >
                  <View style={[styles.avatarOptionCircle, { backgroundColor: preset.color }]}>
                    {preset.id === 'default' ? (
                      <Text style={styles.avatarOptionText}>
                        {firstName?.charAt(0) || '?'}
                      </Text>
                    ) : (
                      <Ionicons name={preset.icon as any} size={28} color="#ffffff" />
                    )}
                  </View>
                  {selectedAvatar === preset.id && (
                    <View style={styles.avatarCheckmark}>
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* 上傳自訂頭像按鈕（功能尚未實作） */}
            <TouchableOpacity
              style={styles.avatarUploadButton}
              onPress={() => {
                setShowAvatarModal(false);
                Alert.alert(
                  isZh ? '上傳頭像' : 'Upload Avatar',
                  isZh ? '自訂頭像功能即將開放' : 'Custom avatar upload coming soon'
                );
              }}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={MibuBrand.brown} />
              <Text style={styles.avatarUploadText}>
                {isZh ? '上傳自訂頭像' : 'Upload Custom Avatar'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  // 載入狀態容器
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },
  // 頭像區塊
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: MibuBrand.creamLight,
    shadowColor: MibuBrand.brown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MibuBrand.copper,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: MibuBrand.warmWhite,
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 13,
    color: MibuBrand.copper,
  },
  // 頂部導航列
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.creamLight,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.cream,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brown,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  // 內容區
  content: {
    flex: 1,
    padding: 20,
  },
  // 欄位區塊
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.brownLight,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // 輸入框
  input: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: MibuBrand.dark,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  // 唯讀欄位
  readOnlyField: {
    backgroundColor: MibuBrand.cream,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  readOnlyText: {
    fontSize: 16,
    color: MibuBrand.brownLight,
  },
  // 橫向排列
  row: {
    flexDirection: 'row',
  },
  // 選擇器按鈕
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  pickerText: {
    fontSize: 16,
    color: MibuBrand.dark,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: MibuBrand.tan,
  },
  // 選擇器選項
  pickerOptions: {
    marginTop: 8,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.cream,
  },
  pickerOptionActive: {
    backgroundColor: MibuBrand.highlight,
  },
  pickerOptionText: {
    fontSize: 16,
    color: MibuBrand.brownLight,
  },
  pickerOptionTextActive: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
  // 分隔線
  divider: {
    height: 1,
    backgroundColor: MibuBrand.cream,
    marginVertical: 24,
  },
  // 群組標題
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brown,
    marginBottom: 16,
  },
  // 頭像 Modal 樣式
  avatarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  avatarModalContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  avatarModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatarOption: {
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: MibuBrand.brown,
  },
  avatarOptionCircle: {
    flex: 1,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarCheckmark: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.warmWhite,
  },
  avatarUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: MibuBrand.highlight,
  },
  avatarUploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
});
