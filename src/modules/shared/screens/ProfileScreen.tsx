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
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Modal, Image as RNImage, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// ============ 月曆語系設定（全域生效） ============
LocaleConfig.locales['zh-TW'] = {
  monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天',
};
LocaleConfig.locales['ja'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日',
};
LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
// en 是預設，不需要額外設定
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { authApi } from '../../../services/authApi';
import { avatarService } from '../../../services/avatarService';
import { ApiError } from '../../../services/base';
import { TagInput } from '../components/TagInput';
import { UserProfile, Gender, AvatarPreset } from '../../../types';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { STORAGE_KEYS } from '../../../constants/storageKeys';

// ============ 常數定義 ============

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

  // 根據語系切換月曆顯示語言（LocaleConfig 是全域的，行程頁月曆也會跟著變）
  LocaleConfig.defaultLocale = state.language === 'en' ? '' : state.language;
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
  const [showBirthCalendar, setShowBirthCalendar] = useState(false); // 生日月曆開關
  // 月曆顯示的年月（用於年份快速切換，格式 YYYY-MM-DD）
  const [calendarViewDate, setCalendarViewDate] = useState('');
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

  // 頭像選項（從 avatarService 動態載入）
  const [avatarPresets, setAvatarPresets] = useState<AvatarPreset[]>([]);

  // #038 自訂頭像上傳
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // 圓形預覽：暫存用戶選好但尚未上傳的圖片
  const [pendingAvatarAsset, setPendingAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

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
    // 從 avatarService 載入頭像清單（Cloudinary URL）
    avatarService.getPresets().then(setAvatarPresets).catch(() => {});
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
  // 步驟一：選圖 → 顯示圓形預覽
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

      // 暫存圖片，顯示圓形預覽讓用戶確認
      setPendingAvatarAsset(asset);
      setShowAvatarModal(false);
      setShowAvatarPreview(true);
    } catch (error) {
      console.error('Pick avatar error:', error);
      showToastMessage(t.profile_uploadFailedRetry);
    }
  };

  // 步驟二：用戶確認 → 上傳
  const handleConfirmUpload = async () => {
    if (!pendingAvatarAsset?.base64) return;

    setShowAvatarPreview(false);
    setUploadingAvatar(true);

    try {
      const token = await getToken();
      if (!token) {
        showToastMessage(t.settings_pleaseLoginFirst);
        setUploadingAvatar(false);
        return;
      }

      // 判斷 mimeType（從副檔名判斷）
      const mimeType = pendingAvatarAsset.uri?.match(/\.png$/i) ? 'image/png'
        : pendingAvatarAsset.uri?.match(/\.webp$/i) ? 'image/webp'
        : 'image/jpeg';

      // 上傳圖片（Base64 JSON 格式）
      const uploadResult = await authApi.uploadAvatar(token, pendingAvatarAsset.base64, mimeType);

      if (uploadResult.success && uploadResult.avatarUrl) {
        setCustomAvatarUrl(uploadResult.avatarUrl);
        setSelectedAvatar('custom');
        await saveAvatarChoice('custom');
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
      setPendingAvatarAsset(null);
    }
  };

  // 取消預覽 → 回到頭像選擇器
  const handleCancelPreview = () => {
    setShowAvatarPreview(false);
    setPendingAvatarAsset(null);
    setShowAvatarModal(true);
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
              <ExpoImage
                source={{ uri: customAvatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (() => {
              const preset = avatarPresets.find(a => a.id === selectedAvatar);
              // 有圖片 URL 的頭像（Cloudinary）
              if (preset?.imageUrl) {
                return (
                  <View style={[styles.avatar, { backgroundColor: preset.color, overflow: 'hidden' }]}>
                    <ExpoImage
                      source={{ uri: preset.imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
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

        {/* ===== 出生日期欄位（月曆選擇器） ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile_birthDate}</Text>
          <TouchableOpacity
            style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            onPress={() => setShowBirthCalendar(!showBirthCalendar)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16, color: birthDate ? MibuBrand.dark : UIColors.textSecondary }}>
              {birthDate || 'YYYY-MM-DD'}
            </Text>
            <Ionicons
              name={showBirthCalendar ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={MibuBrand.copper}
            />
          </TouchableOpacity>
          {showBirthCalendar && (() => {
            // 決定月曆顯示的日期（優先用切換狀態 → 已選日期 → 今天）
            const viewDate = calendarViewDate || birthDate || new Date().toISOString().split('T')[0];
            const viewYear = parseInt(viewDate.substring(0, 4), 10);
            const thisYear = new Date().getFullYear();
            // 年份快速跳轉
            const jumpYear = (delta: number) => {
              const d = new Date(viewDate);
              d.setFullYear(d.getFullYear() + delta);
              setCalendarViewDate(d.toISOString().split('T')[0]);
            };
            return (
              <View style={{ marginTop: 8, borderRadius: 12, overflow: 'hidden', backgroundColor: MibuBrand.warmWhite }}>
                {/* 年份快速切換列 */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 16 }}>
                  <TouchableOpacity onPress={() => jumpYear(-10)} style={{ padding: 8 }}>
                    <Ionicons name="play-back" size={14} color={MibuBrand.copper} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => jumpYear(-1)} style={{ padding: 8 }}>
                    <Ionicons name="chevron-back" size={18} color={MibuBrand.copper} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: MibuBrand.brownDark, minWidth: 50, textAlign: 'center' }}>
                    {viewYear}
                  </Text>
                  <TouchableOpacity onPress={() => jumpYear(1)} disabled={viewYear >= thisYear} style={{ padding: 8, opacity: viewYear >= thisYear ? 0.3 : 1 }}>
                    <Ionicons name="chevron-forward" size={18} color={MibuBrand.copper} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => jumpYear(10)} disabled={viewYear >= thisYear} style={{ padding: 8, opacity: viewYear >= thisYear ? 0.3 : 1 }}>
                    <Ionicons name="play-forward" size={14} color={MibuBrand.copper} />
                  </TouchableOpacity>
                </View>
                <Calendar
                  key={viewDate.substring(0, 7)}
                  current={viewDate}
                  maxDate={new Date().toISOString().split('T')[0]}
                  onDayPress={(day: { dateString: string }) => {
                    setBirthDate(day.dateString);
                    setCalendarViewDate('');
                    setShowBirthCalendar(false);
                  }}
                  onMonthChange={(month: { dateString: string }) => {
                    setCalendarViewDate(month.dateString);
                  }}
                  markedDates={birthDate ? {
                    [birthDate]: { selected: true, selectedColor: MibuBrand.brown },
                  } : {}}
                  theme={{
                    backgroundColor: MibuBrand.warmWhite,
                    calendarBackground: MibuBrand.warmWhite,
                    todayTextColor: MibuBrand.copper,
                    selectedDayBackgroundColor: MibuBrand.brown,
                    selectedDayTextColor: MibuBrand.warmWhite,
                    arrowColor: MibuBrand.copper,
                    monthTextColor: MibuBrand.brownDark,
                    dayTextColor: MibuBrand.brownDark,
                    textDisabledColor: MibuBrand.tan,
                    textDayFontWeight: '500' as const,
                    textMonthFontWeight: '700' as const,
                    textDayHeaderFontWeight: '600' as const,
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12,
                  }}
                />
              </View>
            );
          })()}
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
                    {preset.imageUrl ? (
                      <ExpoImage source={{ uri: preset.imageUrl }} style={styles.avatarOptionImage} contentFit="cover" />
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

      {/* 自訂頭像圓形預覽 Modal */}
      <Modal
        visible={showAvatarPreview}
        transparent
        animationType="fade"
        onRequestClose={handleCancelPreview}
      >
        <TouchableOpacity
          style={styles.avatarModalOverlay}
          activeOpacity={1}
          onPress={handleCancelPreview}
        >
          <View style={styles.avatarPreviewContainer} onStartShouldSetResponder={() => true}>
            <Text style={styles.avatarModalTitle}>{t.profile_previewAvatar}</Text>

            {/* 圓形預覽 */}
            <View style={styles.avatarPreviewCircle}>
              {pendingAvatarAsset?.uri && (
                <RNImage
                  source={{ uri: pendingAvatarAsset.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              )}
            </View>

            {/* 確認 / 取消按鈕 */}
            <View style={styles.avatarPreviewButtons}>
              <TouchableOpacity style={styles.avatarPreviewCancelBtn} onPress={handleCancelPreview}>
                <Text style={styles.avatarPreviewCancelText}>{t.profile_previewCancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarPreviewConfirmBtn} onPress={handleConfirmUpload}>
                <Text style={styles.avatarPreviewConfirmText}>{t.profile_previewConfirm}</Text>
              </TouchableOpacity>
            </View>
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
    width: 88,
    height: 88,
    borderRadius: 44,
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
    borderRadius: 38,       // 內圈 76px 的一半（88 - 2*(3 padding + 3 border) = 76）
    overflow: 'hidden',     // 裁切圖片超出圓形範圍
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  // 自訂頭像圓形預覽
  avatarPreviewContainer: {
    backgroundColor: UIColors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  avatarPreviewCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
    backgroundColor: MibuBrand.creamLight,
    marginVertical: 20,
    borderWidth: 4,
    borderColor: MibuBrand.creamLight,
  },
  avatarPreviewButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  avatarPreviewCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
  },
  avatarPreviewCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  avatarPreviewConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
  },
  avatarPreviewConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: UIColors.white,
  },
});
