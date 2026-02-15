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
 * 更新日期：2026-02-12（Phase 2C 拆分 styles + AvatarSelectorModal）
 * @see 後端合約: contracts/APP.md Phase 2
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { useAuth, useI18n } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { avatarService } from '../../../services/avatarService';
import { ApiError } from '../../../services/base';
import { TagInput } from '../components/TagInput';
import { UserProfile, Gender, AvatarPreset } from '../../../types';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import { STORAGE_KEYS } from '../../../constants/storageKeys';
import styles from './ProfileScreen.styles';
import { AvatarSelectorModal } from './AvatarSelectorModal';

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
  const { user, getToken, setUser } = useAuth();
  const { t, language } = useI18n();

  // 根據語系切換月曆顯示語言（LocaleConfig 是全域的，行程頁月曆也會跟著變）
  LocaleConfig.defaultLocale = language === 'en' ? '' : language;
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

  // 頭像選項（從 avatarService 動態載入，主畫面和 Modal 都需要）
  const [avatarPresets, setAvatarPresets] = useState<AvatarPreset[]>([]);

  // #038 自訂頭像（URL 由父元件管理，因為主畫面需要顯示）
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

  // ============ 頭像選擇回呼 ============

  /**
   * 頭像選擇完成回呼（從 AvatarSelectorModal 傳回）
   * @param avatarId - 預設頭像 ID 或 'custom'
   * @param customUrl - 自訂頭像 URL（僅 custom 時有值）
   */
  const handleAvatarSelected = useCallback((avatarId: string, customUrl?: string) => {
    setSelectedAvatar(avatarId);
    if (avatarId === 'custom' && customUrl) {
      setCustomAvatarUrl(customUrl);
    }
  }, []);

  // ============ 資料載入 ============

  /**
   * 載入個人資料
   * 從後端 API 取得用戶 profile 並填入表單
   */
  const loadProfile = async () => {
    try {
      const token = await getToken();
      if (!token) return;

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
        if (user) {
          const updatedUser = {
            ...user,
            firstName: data.firstName || user.firstName,
            lastName: data.lastName || user.lastName,
            name: data.firstName && data.lastName
              ? `${data.firstName} ${data.lastName}`
              : data.firstName || data.lastName || user.name,
            email: data.email || user.email,
            // 直接使用後端回傳值（UserProfile 必含此欄位，null 代表用戶刪除頭像）
            profileImageUrl: data.profileImageUrl,
            role: data.role || user.role,
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

  // #051: 訪客有 JWT Token（#049），不再擋訪客，可查看/編輯個人資料

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
                    {firstName?.charAt(0) || profile?.firstName?.charAt(0) || user?.name?.charAt(0) || '?'}
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
            <Text style={styles.readOnlyText}>{displayUserId(profile?.id || user?.id)}</Text>
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

      {/* ===== 頭像選擇 Modal（獨立元件） ===== */}
      <AvatarSelectorModal
        visible={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onAvatarSelected={handleAvatarSelected}
        currentAvatarUrl={selectedAvatar}
        showToastMessage={showToastMessage}
        firstNameInitial={firstName?.charAt(0) || '?'}
        onUploadingChange={setUploadingAvatar}
        avatarPresets={avatarPresets}
      />

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
