/**
 * ============================================================
 * AI 資料分享同意彈窗 (AiDisclosureModal.tsx)
 * ============================================================
 * 此模組提供: Apple Guideline 5.1.2(i) 要求的第三方 AI 資料分享同意
 *
 * 主要功能:
 * - 首次使用 AI 功能時彈出同意彈窗
 * - 明確揭露：服務商名稱、傳送資料類型、用途說明
 * - 用戶可同意或拒絕，拒絕後 AI 功能不可用但核心功能不受影響
 * - 設定頁可隨時撤回同意（透過 revokeAiConsent）
 * - 支援四語系（zh-TW / en / ja / ko）
 *
 * 更新日期：2026-02-25（#062 Apple Guideline 5.1.2(i)）
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '@/constants/Colors';
import { Spacing, Radius, FontSize, FontWeight, Shadow } from '@/src/theme/designTokens';
import { STORAGE_KEYS } from '@/src/constants/storageKeys';
import { useI18n } from '@/src/context/I18nContext';

interface AiDisclosureModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

/** 檢查用戶是否已同意 AI 資料分享 */
export async function hasAcceptedAiDisclosure(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.AI_DISCLOSURE_ACCEPTED);
    return value === 'true';
  } catch {
    return false;
  }
}

/** 儲存用戶已同意 AI 資料分享 */
async function saveAiDisclosureAccepted(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AI_DISCLOSURE_ACCEPTED, 'true');
  } catch {
    // 儲存失敗不阻擋用戶操作
  }
}

/** 撤回 AI 資料分享同意（設定頁使用） */
export async function revokeAiConsent(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AI_DISCLOSURE_ACCEPTED);
  } catch {
    // 靜默處理
  }
}

/** 授予 AI 資料分享同意（設定頁使用） */
export async function grantAiConsent(): Promise<void> {
  await saveAiDisclosureAccepted();
}

export default function AiDisclosureModal({ visible, onAccept, onDecline }: AiDisclosureModalProps) {
  const { t } = useI18n();

  const handleAccept = async () => {
    await saveAiDisclosureAccepted();
    onAccept();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 圖示 */}
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark-outline" size={28} color={MibuBrand.brown} />
          </View>

          {/* 標題 */}
          <Text style={styles.title}>{t.aiDisclosure_title}</Text>

          {/* 說明 */}
          <Text style={styles.message}>{t.aiDisclosure_message}</Text>

          {/* 資料處理說明列表 */}
          <View style={styles.featureList}>
            <View style={styles.featureRow}>
              <Ionicons name="cloud-upload-outline" size={16} color={MibuBrand.copper} />
              <Text style={styles.featureText}>{t.aiDisclosure_feature1}</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="map-outline" size={16} color={MibuBrand.copper} />
              <Text style={styles.featureText}>{t.aiDisclosure_feature2}</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="lock-closed-outline" size={16} color={MibuBrand.success} />
              <Text style={styles.featureText}>{t.aiDisclosure_dataNote}</Text>
            </View>
          </View>

          {/* 同意按鈕 */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleAccept}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t.aiDisclosure_accept}</Text>
          </TouchableOpacity>

          {/* 不同意按鈕 */}
          <TouchableOpacity
            style={styles.declineButton}
            onPress={onDecline}
            activeOpacity={0.8}
          >
            <Text style={styles.declineButtonText}>{t.aiDisclosure_decline}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  container: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...Shadow.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MibuBrand.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: MibuBrand.dark,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.md,
    color: MibuBrand.brownLight,
    textAlign: 'center',
    lineHeight: FontSize.md * 1.5,
    marginBottom: Spacing.lg,
  },
  featureList: {
    alignSelf: 'stretch',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSize.md,
    color: MibuBrand.dark,
    flex: 1,
  },
  button: {
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: MibuBrand.warmWhite,
  },
  declineButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  declineButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: MibuBrand.brownLight,
  },
});
