/**
 * PlaceEditScreen - 地點編輯
 *
 * 功能說明：
 * - 編輯已認領店家的詳細資訊
 * - 基本資訊（名稱、位置、狀態）為唯讀
 * - 可編輯：店家介紹、Google 地圖連結、營業時間、優惠推廣
 *
 * 串接的 API：
 * - GET /merchant/places - 取得店家列表（找出特定店家）
 * - PUT /merchant/places/:id - 更新店家資訊
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { merchantApi } from '../../../services/merchantApi';
import { MerchantPlace, UpdateMerchantPlaceParams, MerchantPlaceOpeningHours } from '../../../types';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';

// ============ 主元件 ============
export function PlaceEditScreen() {
  // ============ Hooks ============
  const { state, t, getToken } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  // 將路由參數轉為數字 ID
  const placeId = id ? parseInt(id, 10) : null;

  // ============ 狀態變數 ============
  // place: 店家原始資料
  const [place, setPlace] = useState<MerchantPlace | null>(null);
  // loading: 資料載入狀態
  const [loading, setLoading] = useState(true);
  // saving: 儲存中狀態
  const [saving, setSaving] = useState(false);

  // ============ 可編輯欄位狀態 ============
  // description: 店家介紹
  const [description, setDescription] = useState('');
  // googleMapUrl: Google 地圖連結
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  // openingHoursText: 營業時間文字（多行）
  const [openingHoursText, setOpeningHoursText] = useState('');
  // promoTitle: 優惠標題
  const [promoTitle, setPromoTitle] = useState('');
  // promoDescription: 優惠說明
  const [promoDescription, setPromoDescription] = useState('');
  // isPromoActive: 是否啟用優惠推廣
  const [isPromoActive, setIsPromoActive] = useState(false);

  // ============ 多語系翻譯（透過 t 字典） ============
  const translations = {
    title: t.merchant_editPlace,
    basicInfo: t.merchant_basicInfoReadonly,
    placeName: t.merchant_placeName,
    location: t.merchant_location,
    status: t.common_status,
    editableInfo: t.merchant_editableInfo,
    description: t.merchant_description,
    descriptionPlaceholder: t.merchant_descriptionPlaceholder,
    googleMapUrl: t.merchant_googleMapUrl,
    googleMapUrlPlaceholder: t.merchant_googleMapUrlPlaceholder,
    openingHours: t.merchant_openingHours,
    openingHoursPlaceholder: t.merchant_openingHoursPlaceholder,
    openingHoursHint: t.merchant_openingHoursHint,
    promoSection: t.merchant_promoSection,
    promoTitle: t.merchant_promoTitle,
    promoTitlePlaceholder: t.merchant_promoTitlePlaceholder,
    promoDescription: t.merchant_promoDescription,
    promoDescriptionPlaceholder: t.merchant_promoDescriptionPlaceholder,
    isPromoActive: t.merchant_enablePromo,
    save: t.common_save,
    saving: t.merchant_saving,
    loading: t.loading,
    saveSuccess: t.merchant_saveSuccess,
    saveFailed: t.common_saveFailed,
    loadFailed: t.common_loadFailed,
    back: t.back,
    statusPending: t.common_pending,
    statusApproved: t.common_approved,
    statusRejected: t.common_rejected,
  };

  // ============ Effect Hooks ============
  // 當 placeId 變更時載入店家資料
  useEffect(() => {
    loadPlace();
  }, [placeId]);

  // ============ 資料載入函數 ============

  /**
   * loadPlace - 載入店家資料
   * 從 API 取得店家列表並找出對應 ID 的店家
   */
  const loadPlace = async () => {
    if (!placeId) return;
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      // 取得店家列表並找出對應的店家
      const data = await merchantApi.getMerchantPlaces(token);
      const foundPlace = data.places.find(p => p.id === placeId);
      if (foundPlace) {
        setPlace(foundPlace);
        // 設定表單初始值
        setDescription(foundPlace.description || '');
        setGoogleMapUrl(foundPlace.googleMapUrl || '');
        setPromoTitle(foundPlace.promoTitle || '');
        setPromoDescription(foundPlace.promoDescription || '');
        setIsPromoActive(foundPlace.isPromoActive || false);
        // 將 openingHours 物件轉成文字格式
        if (foundPlace.openingHours?.weekdayText) {
          setOpeningHoursText(foundPlace.openingHours.weekdayText.join('\n'));
        }
      }
    } catch (error) {
      console.error('Failed to load place:', error);
      Alert.alert(t.common_error, translations.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  // ============ 事件處理函數 ============

  /**
   * handleSave - 處理儲存
   * 將表單資料組裝後呼叫 API 更新店家資訊
   */
  const handleSave = async () => {
    if (!placeId || !place) return;
    try {
      setSaving(true);
      const token = await getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      // 將營業時間文字轉成 openingHours 格式
      let openingHours: MerchantPlaceOpeningHours | undefined;
      if (openingHoursText.trim()) {
        openingHours = {
          weekdayText: openingHoursText.split('\n').filter(line => line.trim()),
        };
      }

      // 組裝更新參數
      const params: UpdateMerchantPlaceParams = {
        description: description || undefined,
        googleMapUrl: googleMapUrl || undefined,
        openingHours,
        promoTitle: promoTitle || undefined,
        promoDescription: promoDescription || undefined,
        isPromoActive,
      };

      await merchantApi.updateMerchantPlace(token, placeId, params);
      Alert.alert(t.common_success, translations.saveSuccess, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to save place:', error);
      Alert.alert(t.common_error, translations.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  // ============ 工具函數 ============

  /**
   * getStatusText - 取得狀態顯示文字
   * @param status - 審核狀態
   * @returns 狀態顯示文字
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return translations.statusApproved;
      case 'rejected': return translations.statusRejected;
      default: return translations.statusPending;
    }
  };

  /**
   * getStatusColor - 取得狀態對應顏色
   * @param status - 審核狀態
   * @returns 背景色和文字色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return { bg: SemanticColors.successLight, text: SemanticColors.successDark };
      case 'rejected': return { bg: SemanticColors.errorLight, text: SemanticColors.errorDark };
      default: return { bg: SemanticColors.warningLight, text: SemanticColors.warningDark };
    }
  };

  // ============ 載入中畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  // ============ 載入失敗畫面 ============
  if (!place) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={UIColors.textSecondary} />
        <Text style={styles.loadingText}>{translations.loadFailed}</Text>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButtonLarge} onPress={() => router.back()} accessibilityLabel="返回">
          <Text style={styles.backButtonText}>{translations.back}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 取得狀態顏色
  const statusColor = getStatusColor(place.status);

  // ============ 主要 JSX 渲染 ============
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ============ 頂部標題區 ============ */}
        <View style={styles.header}>
          {/* 返回按鈕 */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="返回">
            <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
          </TouchableOpacity>
          <Text style={styles.title}>{translations.title}</Text>
        </View>

        {/* ============ 基本資訊區塊（唯讀） ============ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translations.basicInfo}</Text>
          <View style={styles.readOnlyCard}>
            {/* 店家名稱 */}
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>{translations.placeName}</Text>
              <Text style={styles.readOnlyValue}>{place.placeName}</Text>
            </View>
            {/* 地點 */}
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>{translations.location}</Text>
              <Text style={styles.readOnlyValue}>
                {[place.district, place.city, place.country].filter(Boolean).join(', ')}
              </Text>
            </View>
            {/* 審核狀態 */}
            <View style={styles.readOnlyRow}>
              <Text style={styles.readOnlyLabel}>{translations.status}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                <Text style={[styles.statusText, { color: statusColor.text }]}>
                  {getStatusText(place.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ============ 可編輯資訊區塊 ============ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translations.editableInfo}</Text>

          {/* 店家介紹 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{translations.description}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={translations.descriptionPlaceholder}
              placeholderTextColor={UIColors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Google 地圖連結 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{translations.googleMapUrl}</Text>
            <TextInput
              style={styles.textInput}
              value={googleMapUrl}
              onChangeText={setGoogleMapUrl}
              placeholder={translations.googleMapUrlPlaceholder}
              placeholderTextColor={UIColors.textSecondary}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* 營業時間 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{translations.openingHours}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={openingHoursText}
              onChangeText={setOpeningHoursText}
              placeholder={translations.openingHoursPlaceholder}
              placeholderTextColor={UIColors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.inputHint}>{translations.openingHoursHint}</Text>
          </View>
        </View>

        {/* ============ 優惠推廣區塊 ============ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translations.promoSection}</Text>

          {/* 啟用開關 */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{translations.isPromoActive}</Text>
            <Switch
              value={isPromoActive}
              onValueChange={setIsPromoActive}
              trackColor={{ false: MibuBrand.tanLight, true: MibuBrand.copperLight }}
              thumbColor={isPromoActive ? MibuBrand.brown : '#f4f4f5'}
            />
          </View>

          {/* 優惠標題 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{translations.promoTitle}</Text>
            <TextInput
              style={styles.textInput}
              value={promoTitle}
              onChangeText={setPromoTitle}
              placeholder={translations.promoTitlePlaceholder}
              placeholderTextColor={UIColors.textSecondary}
            />
          </View>

          {/* 優惠說明 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{translations.promoDescription}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={promoDescription}
              onChangeText={setPromoDescription}
              placeholder={translations.promoDescriptionPlaceholder}
              placeholderTextColor={UIColors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ============ 儲存按鈕 ============ */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityLabel="儲存"
        >
          {saving ? (
            <ActivityIndicator size="small" color={UIColors.white} />
          ) : (
            <Ionicons name="checkmark-circle" size={24} color={UIColors.white} />
          )}
          <Text style={styles.saveButtonText}>
            {saving ? translations.saving : translations.save}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  // 內容區
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  // 載入中容器
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.warmWhite,
  },
  // 載入中文字
  loadingText: {
    marginTop: 12,
    color: UIColors.textSecondary,
    fontSize: 16,
  },
  // 頂部標題區
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  // 返回按鈕
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: UIColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 大返回按鈕（用於錯誤頁面）
  backButtonLarge: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: MibuBrand.brown,
    borderRadius: 12,
  },
  // 返回按鈕文字
  backButtonText: {
    color: UIColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // 頁面標題
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.dark,
  },
  // 區塊容器
  section: {
    marginBottom: 24,
  },
  // 區塊標題
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: UIColors.textSecondary,
    marginBottom: 12,
  },
  // 唯讀卡片
  readOnlyCard: {
    backgroundColor: UIColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 唯讀列
  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  // 唯讀標籤
  readOnlyLabel: {
    fontSize: 14,
    color: UIColors.textSecondary,
  },
  // 唯讀數值
  readOnlyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.dark,
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  // 狀態標籤
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // 狀態文字
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // 輸入群組
  inputGroup: {
    marginBottom: 16,
  },
  // 輸入標籤
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.dark,
    marginBottom: 8,
  },
  // 文字輸入框
  textInput: {
    backgroundColor: UIColors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    color: MibuBrand.dark,
  },
  // 多行輸入框
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  // 輸入提示
  inputHint: {
    fontSize: 12,
    color: UIColors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  // 開關列
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: UIColors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    marginBottom: 16,
  },
  // 開關標籤
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.dark,
  },
  // 儲存按鈕
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  // 儲存按鈕（停用狀態）
  saveButtonDisabled: {
    backgroundColor: MibuBrand.copperLight,
  },
  // 儲存按鈕文字
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: UIColors.white,
  },
});
