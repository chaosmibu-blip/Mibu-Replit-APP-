/**
 * ============================================================
 * 頭像選擇器 Modal (AvatarSelectorModal.tsx)
 * ============================================================
 * 從 ProfileScreen.tsx 拆分出來的獨立元件，
 * 負責頭像預設選擇、自訂頭像上傳、圓形預覽確認等流程。
 *
 * 主要功能:
 * - 顯示頭像預設清單（從 Cloudinary 載入）
 * - 支援自訂頭像上傳（#038）
 * - 圓形預覽確認流程
 *
 * Props:
 * - visible: 是否顯示 Modal
 * - onClose: 關閉 Modal 回呼
 * - onAvatarSelected: 選擇頭像後的回呼（avatarId, customUrl?）
 * - currentAvatarUrl: 目前選中的頭像 ID
 *
 * 更新日期：2026-02-12（Phase 2C 拆分）
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image as RNImage,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth, useI18n } from '../../../context/AppContext';
import { authApi } from '../../../services/authApi';
import { AvatarPreset } from '../../../types';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { STORAGE_KEYS } from '../../../constants/storageKeys';

// ============ Props 型別定義 ============

export interface AvatarSelectorModalProps {
  /** 是否顯示 Modal */
  visible: boolean;
  /** 關閉 Modal 回呼 */
  onClose: () => void;
  /**
   * 選擇頭像後的回呼
   * @param avatarId - 頭像 ID（預設頭像 ID 或 'custom'）
   * @param customUrl - 自訂頭像的 Cloudinary URL（僅 avatarId === 'custom' 時有值）
   */
  onAvatarSelected: (avatarId: string, customUrl?: string) => void;
  /** 目前選中的頭像 ID */
  currentAvatarUrl: string;
  /** 顯示 Toast 訊息的函數（由父元件提供） */
  showToastMessage: (message: string) => void;
  /** 用戶名字首字母（fallback 用） */
  firstNameInitial: string;
  /** 上傳狀態變更回呼（讓父元件同步顯示上傳中的 UI） */
  onUploadingChange?: (uploading: boolean) => void;
  /** 頭像預設清單（由父元件載入，因為主畫面也需要顯示） */
  avatarPresets: AvatarPreset[];
}

// ============ 元件本體 ============

export function AvatarSelectorModal({
  visible,
  onClose,
  onAvatarSelected,
  currentAvatarUrl,
  showToastMessage,
  firstNameInitial,
  onUploadingChange,
  avatarPresets,
}: AvatarSelectorModalProps) {
  const { getToken } = useAuth();
  const { t } = useI18n();

  // ============ 狀態管理 ============

  // #038 自訂頭像上傳
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // 圓形預覽：暫存用戶選好但尚未上傳的圖片
  const [pendingAvatarAsset, setPendingAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);

  // ============ 事件處理 ============

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
   * #038 上傳自訂頭像 - 步驟一：選圖 → 顯示圓形預覽
   * 使用 expo-image-picker 選擇圖片
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

      // 暫存圖片，顯示圓形預覽讓用戶確認
      setPendingAvatarAsset(asset);
      onClose(); // 關閉選擇 Modal
      setShowAvatarPreview(true);
    } catch (error) {
      console.error('Pick avatar error:', error);
      showToastMessage(t.profile_uploadFailedRetry);
    }
  };

  /**
   * #038 上傳自訂頭像 - 步驟二：用戶確認 → 上傳
   */
  const handleConfirmUpload = async () => {
    if (!pendingAvatarAsset?.base64) return;

    setShowAvatarPreview(false);
    setUploadingAvatar(true);
    onUploadingChange?.(true);

    try {
      const token = await getToken();
      if (!token) {
        showToastMessage(t.settings_pleaseLoginFirst);
        setUploadingAvatar(false);
        onUploadingChange?.(false);
        return;
      }

      // 判斷 mimeType（從副檔名判斷）
      const mimeType = pendingAvatarAsset.uri?.match(/\.png$/i) ? 'image/png'
        : pendingAvatarAsset.uri?.match(/\.webp$/i) ? 'image/webp'
        : 'image/jpeg';

      // 上傳圖片（Base64 JSON 格式）
      const uploadResult = await authApi.uploadAvatar(token, pendingAvatarAsset.base64, mimeType);

      if (uploadResult.success && uploadResult.avatarUrl) {
        await saveAvatarChoice('custom');
        await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_AVATAR_URL, uploadResult.avatarUrl);
        onAvatarSelected('custom', uploadResult.avatarUrl);
        showToastMessage(t.profile_avatarUploaded);
      } else {
        showToastMessage(uploadResult.message || t.profile_uploadFailed);
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      showToastMessage(t.profile_uploadFailedRetry);
    } finally {
      setUploadingAvatar(false);
      onUploadingChange?.(false);
      setPendingAvatarAsset(null);
    }
  };

  /**
   * 取消預覽 → 回到頭像選擇器
   */
  const handleCancelPreview = useCallback(() => {
    setShowAvatarPreview(false);
    setPendingAvatarAsset(null);
    // 注意：不在這裡呼叫「重新打開選擇 Modal」，而是讓父元件決定
    // 透過 onClose 的反向邏輯：取消預覽時父元件需要重新開啟 visible
  }, []);

  // ============ 渲染 ============

  return (
    <>
      {/* ===== 頭像選擇 Modal ===== */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={modalStyles.content} onStartShouldSetResponder={() => true}>
            <Text style={modalStyles.title}>
              {t.profile_chooseAvatar}
            </Text>

            {/* 頭像選項網格 */}
            <View style={modalStyles.grid}>
              {avatarPresets.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={[
                    modalStyles.option,
                    currentAvatarUrl === preset.id && modalStyles.optionSelected,
                  ]}
                  onPress={() => {
                    saveAvatarChoice(preset.id); // 儲存到 AsyncStorage
                    onAvatarSelected(preset.id);
                    onClose();
                  }}
                >
                  <View style={[modalStyles.optionCircle, { backgroundColor: preset.color }]}>
                    {preset.imageUrl ? (
                      <ExpoImage source={{ uri: preset.imageUrl }} style={modalStyles.optionImage} contentFit="cover" />
                    ) : (
                      <Text style={modalStyles.optionText}>
                        {firstNameInitial || '?'}
                      </Text>
                    )}
                  </View>
                  {currentAvatarUrl === preset.id && (
                    <View style={modalStyles.checkmark}>
                      <Ionicons name="checkmark" size={14} color={UIColors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* #038 上傳自訂頭像按鈕 */}
            <TouchableOpacity
              style={[modalStyles.uploadButton, uploadingAvatar && { opacity: 0.5 }]}
              onPress={handleUploadAvatar}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={MibuBrand.brown} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={20} color={MibuBrand.brown} />
              )}
              <Text style={modalStyles.uploadText}>
                {uploadingAvatar ? t.profile_uploading : t.profile_uploadAvatar}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ===== 自訂頭像圓形預覽 Modal ===== */}
      <Modal
        visible={showAvatarPreview}
        transparent
        animationType="fade"
        onRequestClose={handleCancelPreview}
      >
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={handleCancelPreview}
        >
          <View style={modalStyles.previewContainer} onStartShouldSetResponder={() => true}>
            <Text style={modalStyles.title}>{t.profile_previewAvatar}</Text>

            {/* 圓形預覽 */}
            <View style={modalStyles.previewCircle}>
              {pendingAvatarAsset?.uri && (
                <RNImage
                  source={{ uri: pendingAvatarAsset.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              )}
            </View>

            {/* 確認 / 取消按鈕 */}
            <View style={modalStyles.previewButtons}>
              <TouchableOpacity style={modalStyles.previewCancelBtn} onPress={handleCancelPreview}>
                <Text style={modalStyles.previewCancelText}>{t.profile_previewCancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.previewConfirmBtn} onPress={handleConfirmUpload}>
                <Text style={modalStyles.previewConfirmText}>{t.profile_previewConfirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ============ 頭像 Modal 樣式定義 ============

const modalStyles = StyleSheet.create({
  // Modal 遮罩
  overlay: {
    flex: 1,
    backgroundColor: UIColors.overlayMedium,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // 選擇器內容區
  content: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  // Modal 標題
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  // 頭像選項網格
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  // 單個頭像選項
  option: {
    position: 'relative',
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 3,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: MibuBrand.brown,
  },
  // 頭像圓形容器
  optionCircle: {
    flex: 1,
    borderRadius: 38,       // 內圈 76px 的一半（88 - 2*(3 padding + 3 border) = 76）
    overflow: 'hidden',     // 裁切圖片超出圓形範圍
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  optionText: {
    fontSize: 24,
    fontWeight: '700',
    color: UIColors.white,
  },
  // 選中勾號
  checkmark: {
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
  // 上傳按鈕
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: MibuBrand.highlight,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  // 自訂頭像圓形預覽
  previewContainer: {
    backgroundColor: UIColors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  previewCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
    backgroundColor: MibuBrand.creamLight,
    marginVertical: 20,
    borderWidth: 4,
    borderColor: MibuBrand.creamLight,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  previewCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
  },
  previewCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  previewConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
  },
  previewConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: UIColors.white,
  },
});
