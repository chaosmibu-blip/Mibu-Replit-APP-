/**
 * ProfileScreen - 個人資料畫面
 *
 * 功能說明：
 * - 顯示並編輯用戶個人資料
 * - 包含基本資訊（姓名、性別、生日、電話）
 * - 健康資訊（飲食禁忌、疾病史）
 * - 緊急聯絡人設定
 * - 頭像選擇功能（含自訂頭像上傳）
 *
 * 串接的 API：
 * - GET /api/user/profile - 取得個人資料
 * - PUT /api/user/profile - 更新個人資料
 * - POST /api/avatar/upload - 上傳自訂頭像 (#038)
 *
 * @see 後端合約: contracts/APP.md Phase 2
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Modal, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { authApi } from '../../../services/authApi';
import { ApiError } from '../../../services/base';
import { TagInput } from '../components/TagInput';
import { UserProfile, Gender } from '../../../types';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { STORAGE_KEYS } from '../../../constants/storageKeys';

// ============ 常數定義 ============

/**
 * 頭像選項型別
 * 支援本地圖片或 Ionicons 圖示
 */
interface AvatarPreset {
  id: string;
  icon?: string;      // Ionicons 圖示名稱（預設頭像用）
  image?: any;        // require() 本地圖片
  imageUrl?: string;  // 圖片網址（自訂頭像用）
  color: string;
}

/**
 * 預設頭像選項 — 貓咪系列插畫
 */
const DEFAULT_AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'chef', image: require('../../../../assets/images/avatars/avatar-chef.png'), color: '#F5E6D3' },
  { id: 'artist', image: require('../../../../assets/images/avatars/avatar-artist.png'), color: '#F5E6D3' },
  { id: 'musician', image: require('../../../../assets/images/avatars/avatar-musician.png'), color: '#F5E6D3' },
  { id: 'gardener', image: require('../../../../assets/images/avatars/avatar-gardener.png'), color: '#F5E6D3' },
  { id: 'explorer', image: require('../../../../assets/images/avatars/avatar-explorer.png'), color: '#F5E6D3' },
  { id: 'astronaut', image: require('../../../../assets/images/avatars/avatar-astronaut.png'), color: '#F5E6D3' },
  { id: 'diver', image: require('../../../../assets/images/avatars/avatar-diver.png'), color: '#F5E6D3' },
  { id: 'camper', image: require('../../../../assets/images/avatars/avatar-camper.png'), color: '#F5E6D3' },
];

/** 性別選項（labelKey 對應 translations.ts 翻譯鍵） */
const GENDER_OPTIONS: { value: Gender; labelKey: string }[] = [
  { value: 'male', labelKey: 'profile_genderMale' },
  { value: 'female', labelKey: 'profile_genderFemale' },
  { value: 'other', labelKey: 'profile_genderOther' },
];

/** 關係選項（緊急聯絡人，labelKey 對應 translations.ts 翻譯鍵） */
const RELATION_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'spouse', labelKey: 'profile_relationSpouse' },
  { value: 'parent', labelKey: 'profile_relationParent' },
  { value: 'sibling', labelKey: 'profile_relationSibling' },
  { value: 'friend', labelKey: 'profile_relationFriend' },
  { value: 'other', labelKey: 'profile_relationOther' },
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
  const { state, t, getToken, setUser } = useApp();
  const router = useRouter();

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

  // 【截圖 19-21】頭像選項（支援動態載入）
  const [avatarPresets, setAvatarPresets] = useState<AvatarPreset[]>(DEFAULT_AVATAR_PRESETS);

  // #038 自訂頭像上傳
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // 【截圖 19】Toast 訊息（取代彈窗）
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  /**
   * 【截圖 19】顯示 Toast 訊息，淡入淡出 3 秒
   */
  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    // 淡入
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // 3 秒後淡出
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowToast(false);
        });
      }, 3000);
    });
  }, [toastOpacity]);

  // ============ 生命週期 ============

  useEffect(() => {
    loadProfile();
    loadSavedAvatar();
  }, []);

  /**
   * 載入已儲存的頭像設定
   * 從 AsyncStorage 讀取用戶之前選擇的頭像和自訂頭像 URL
   */
  const loadSavedAvatar = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem(STORAGE_KEYS.AVATAR_PRESET);
      if (savedAvatar) {
        setSelectedAvatar(savedAvatar);
      }
      // #038 載入自訂頭像 URL
      const savedCustomUrl = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_AVATAR_URL);
      if (savedCustomUrl) {
        setCustomAvatarUrl(savedCustomUrl);
      }
    } catch (error) {
      console.error('Failed to load saved avatar:', error);
    }
  };

  /**
   * 儲存頭像選擇到 AsyncStorage
   * 讓其他頁面（如首頁）可以讀取
   */
  const saveAvatarChoice = async (avatarId: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AVATAR_PRESET, avatarId);
    } catch (error) {
      console.error('Failed to save avatar choice:', error);
    }
  };

  /**
   * #038 上傳自訂頭像
   * 使用 expo-image-picker 選擇圖片並上傳到後端
   */
  const handleUploadAvatar = async () => {
    try {
      // 請求相簿權限
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToastMessage(t.profile_photoPermissionRequired);
        return;
      }

      // 開啟圖片選擇器（含 base64 輸出）
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],  // 正方形裁切
        quality: 0.8,    // 壓縮品質
        base64: true,    // 直接取得 base64
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];

      // 檢查是否有 base64 資料
      if (!asset.base64) {
        showToastMessage(t.profile_cannotReadImage);
        return;
      }

      setShowAvatarModal(false);
      setUploadingAvatar(true);

      // 取得 token
      const token = await getToken();
      if (!token) {
        showToastMessage(t.settings_pleaseLoginFirst);
        setUploadingAvatar(false);
        return;
      }

      // 判斷 mimeType（從副檔名判斷）
      const mimeType = asset.uri?.match(/\.png$/i) ? 'image/png'
        : asset.uri?.match(/\.webp$/i) ? 'image/webp'
        : 'image/jpeg';

      // 上傳圖片（Base64 JSON 格式）
      const uploadResult = await authApi.uploadAvatar(token, asset.base64, mimeType);

      if (uploadResult.success && uploadResult.avatarUrl) {
        // 更新自訂頭像 URL
        setCustomAvatarUrl(uploadResult.avatarUrl);
        setSelectedAvatar('custom');
        await saveAvatarChoice('custom');
        // 儲存自訂頭像 URL 到 AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_AVATAR_URL, uploadResult.avatarUrl);
        showToastMessage(t.profile_avatarUploaded);
      } else {
        showToastMessage(uploadResult.message || t.profile_uploadFailed);
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      showToastMessage(t.profile_uploadFailedRetry);
    } finally {
      setUploadingAvatar(false);
    }
  };

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
        t.error,
        t.profile_loadFailed
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
        // 保留原始 id：後端更新回傳可能不含 id 欄位
        if (!data.id && profile?.id) {
          data.id = profile.id;
        }
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

        // 同步更新全域用戶狀態（#017 修復用戶名消失、#040 merge 完整欄位）
        if (state.user) {
          const updatedUser = {
            ...state.user,
            firstName: data.firstName || state.user.firstName,
            lastName: data.lastName || state.user.lastName,
            name: data.firstName && data.lastName
              ? `${data.firstName} ${data.lastName}`
              : data.firstName || data.lastName || state.user.name,
            email: data.email || state.user.email,
            // 直接使用後端回傳值（UserProfile 必含此欄位，null 代表用戶刪除頭像）
            profileImageUrl: data.profileImageUrl,
            role: data.role || state.user.role,
            // #040: merge 後端補齊的欄位，防止不完整回應覆蓋本地狀態
            ...(data.isSuperAdmin !== undefined && { isSuperAdmin: data.isSuperAdmin }),
            ...(data.roles && { accessibleRoles: data.roles }),
          };
          setUser(updatedUser, response.token || undefined);
        }
      }

      // 【截圖 19】改用 Toast 取代彈窗
      showToastMessage(t.profile_profileUpdated);
    } catch (error) {
      console.error('Failed to save profile:', error);
      // 提取後端錯誤訊息（如 Email 重複等）
      const serverMsg = error instanceof ApiError ? error.serverMessage : undefined;
      Alert.alert(
        t.error,
        serverMsg || t.profile_saveFailed
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
          <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.profile_title}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator size="small" color={MibuBrand.brown} />
          ) : (
            <Text style={styles.saveButtonText}>{t.profile_save}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* ===== 頭像區塊 ===== */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setShowAvatarModal(true)}
            disabled={uploadingAvatar}
          >
            {/* #038 支援自訂頭像顯示 */}
            {selectedAvatar === 'custom' && customAvatarUrl ? (
              <Image
                source={{ uri: customAvatarUrl }}
                style={styles.avatar}
              />
            ) : (() => {
              const preset = avatarPresets.find(a => a.id === selectedAvatar);
              // 有圖片的頭像（貓咪系列）
              if (preset?.image) {
                return (
                  <View style={[styles.avatar, { backgroundColor: preset.color, overflow: 'hidden' }]}>
                    <Image source={preset.image} style={{ width: '100%', height: '100%', transform: [{ scale: 1.15 }] }} resizeMode="cover" />
                  </View>
                );
              }
              // Fallback：首字母
              return (
                <View style={[styles.avatar, { backgroundColor: preset?.color || MibuBrand.brown }]}>
                  <Text style={styles.avatarText}>
                    {firstName?.charAt(0) || profile?.firstName?.charAt(0) || state.user?.name?.charAt(0) || '?'}
                  </Text>
                </View>
              );
            })()}
            <View style={styles.avatarEditBadge}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={UIColors.white} />
              ) : (
                <Ionicons name="camera" size={14} color={UIColors.white} />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {uploadingAvatar ? t.profile_uploading : t.profile_tapToChange}
          </Text>
        </View>

        {/* ===== 唯讀欄位：用戶 ID（#037 截斷顯示）===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile_userId}</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{displayUserId(profile?.id || state.user?.id)}</Text>
          </View>
        </View>

        {/* ===== Email 欄位（#037 改為可編輯）===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t.profile_enterEmail}
            placeholderTextColor={UIColors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* ===== 姓名欄位 ===== */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>{t.profile_lastName}</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t.profile_enterLastName}
              placeholderTextColor={UIColors.textSecondary}
            />
          </View>
          <View style={[styles.section, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.sectionTitle}>{t.profile_firstName}</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t.profile_enterFirstName}
              placeholderTextColor={UIColors.textSecondary}
            />
          </View>
        </View>

        {/* ===== 性別欄位 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile_gender}</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowGenderPicker(!showGenderPicker)}
          >
            <Text style={gender ? styles.pickerText : styles.pickerPlaceholder}>
              {gender
                ? t[GENDER_OPTIONS.find(g => g.value === gender)?.labelKey || ''] || gender
                : t.profile_select}
            </Text>
            <Ionicons name="chevron-down" size={20} color={UIColors.textSecondary} />
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
                    {t[option.labelKey]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ===== 出生日期欄位 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile_birthDate}</Text>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={UIColors.textSecondary}
          />
        </View>

        {/* ===== 手機欄位 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile_phone}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t.profile_enterPhone}
            placeholderTextColor={UIColors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        {/* ===== 飲食禁忌欄位 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile_dietaryRestrictions}</Text>
          <TagInput
            value={dietaryRestrictions}
            onChange={setDietaryRestrictions}
            placeholder={t.profile_dietaryPlaceholder}
          />
        </View>

        {/* ===== 疾病史欄位 ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile_medicalHistory}</Text>
          <TagInput
            value={medicalHistory}
            onChange={setMedicalHistory}
            placeholder={t.profile_medicalPlaceholder}
          />
        </View>

        {/* ===== 分隔線 ===== */}
        <View style={styles.divider} />

        {/* ===== 緊急聯絡人區塊 ===== */}
        <Text style={styles.groupTitle}>{t.profile_emergencyContact}</Text>

        {/* 緊急聯絡人姓名 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile_contactName}</Text>
          <TextInput
            style={styles.input}
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            placeholder={t.profile_enterName}
            placeholderTextColor={UIColors.textSecondary}
          />
        </View>

        {/* 緊急聯絡人電話 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile_contactPhone}</Text>
          <TextInput
            style={styles.input}
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
            placeholder={t.profile_enterContactPhone}
            placeholderTextColor={UIColors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        {/* 緊急聯絡人關係 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile_relationship}</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowRelationPicker(!showRelationPicker)}
          >
            <Text style={emergencyContactRelation ? styles.pickerText : styles.pickerPlaceholder}>
              {emergencyContactRelation
                ? t[RELATION_OPTIONS.find(r => r.value === emergencyContactRelation)?.labelKey || ''] || emergencyContactRelation
                : t.profile_select}
            </Text>
            <Ionicons name="chevron-down" size={20} color={UIColors.textSecondary} />
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
                    {t[option.labelKey]}
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
              {t.profile_chooseAvatar}
            </Text>

            {/* 頭像選項網格 */}
            <View style={styles.avatarGrid}>
              {avatarPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === preset.id && styles.avatarOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedAvatar(preset.id);
                    saveAvatarChoice(preset.id); // 儲存到 AsyncStorage
                    setShowAvatarModal(false);
                  }}
                >
                  <View style={[styles.avatarOptionCircle, { backgroundColor: preset.color }]}>
                    {preset.image ? (
                      <Image source={preset.image} style={styles.avatarOptionImage} />
                    ) : (
                      <Text style={styles.avatarOptionText}>
                        {firstName?.charAt(0) || '?'}
                      </Text>
                    )}
                  </View>
                  {selectedAvatar === preset.id && (
                    <View style={styles.avatarCheckmark}>
                      <Ionicons name="checkmark" size={14} color={UIColors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* #038 上傳自訂頭像按鈕 */}
            <TouchableOpacity
              style={[styles.avatarUploadButton, uploadingAvatar && { opacity: 0.5 }]}
              onPress={handleUploadAvatar}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={MibuBrand.brown} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={20} color={MibuBrand.brown} />
              )}
              <Text style={styles.avatarUploadText}>
                {uploadingAvatar ? t.profile_uploading : t.profile_uploadAvatar}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 【截圖 19】Toast 訊息 - 淡入淡出 3 秒 */}
      {showToast && (
        <Animated.View
          style={[
            styles.toast,
            { opacity: toastOpacity },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
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
    color: UIColors.white,
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
    minWidth: 44,
    minHeight: 44,
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
    minHeight: 44,
    justifyContent: 'center',
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
    backgroundColor: UIColors.overlayMedium,
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
    borderRadius: 26,       // 內圈 52px 的一半（64 - 2*(3 padding + 3 border) = 52）
    overflow: 'hidden',     // 裁切圖片超出圓形範圍
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    transform: [{ scale: 1.15 }],
  },
  avatarOptionText: {
    fontSize: 24,
    fontWeight: '700',
    color: UIColors.white,
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
  // 【截圖 19】Toast 樣式
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: MibuBrand.brownDark,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
    color: UIColors.white,
    textAlign: 'center',
  },
});
