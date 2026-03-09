/**
 * SpecialistProfileScreen - 專員資料畫面
 *
 * 功能說明：
 * - 顯示專員的個人資料（姓名、頭像、上線狀態）
 * - 提供可接單/暫停接單的開關切換
 * - 顯示服務地區、目前服務人數、最大服務人數
 *
 * 串接的 API：
 * - GET /specialist/me - 取得專員資訊
 * - PATCH /specialist/availability - 更新可接單狀態
 *
 * 更新日期：2026-02-13（遷移至 React Query hooks）
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth, useI18n } from '../../../context/AppContext';
import { SpecialistInfo } from '../../../types';
import {
  useSpecialistMe,
  useUpdateSpecialistAvailability,
} from '../../../hooks/useSpecialistQueries';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MibuBrand, UIColors, SemanticColors } from '../../../../constants/Colors';
import { PerkDefaults } from '../../../constants/businessDefaults';

// ============ 元件主體 ============
export function SpecialistProfileScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ============ React Query Hooks ============

  /** 專員資訊查詢 */
  const specialistQuery = useSpecialistMe();
  /** 更新可接單狀態 mutation */
  const availabilityMutation = useUpdateSpecialistAvailability();

  // ============ 衍生狀態 ============

  /** 專員資訊（預設 null） */
  const specialist = (specialistQuery.data as SpecialistInfo) ?? null;
  /** 資料載入中 */
  const loading = specialistQuery.isLoading;

  // ============ 事件處理函數 ============

  /**
   * 切換可接單狀態
   * 透過 mutation 更新 isAvailable 欄位，完成後自動刷新專員資料
   */
  const handleToggleAvailable = () => {
    if (!specialist) return;
    availabilityMutation.mutate(!specialist.isAvailable);
  };

  // ============ Loading 畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.info} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  // ============ 主畫面 JSX ============
  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
      {/* ============ 頁面標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.specialist_profile}</Text>
      </View>

      {/* ============ 頭像與名稱區 ============ */}
      <View style={styles.avatarSection}>
        {/* 專員頭像 */}
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={MibuBrand.info} />
        </View>
        {/* 專員名稱 */}
        <Text style={styles.name}>{specialist?.name || user?.name || '-'}</Text>
        {/* 上線狀態標籤 */}
        <View style={[
          styles.onlineBadge,
          specialist?.isOnline ? styles.onlineBadgeActive : styles.onlineBadgeInactive
        ]}>
          <View style={[
            styles.onlineDot,
            specialist?.isOnline ? styles.onlineDotActive : styles.onlineDotInactive
          ]} />
          <Text style={[
            styles.onlineText,
            specialist?.isOnline ? styles.onlineTextActive : styles.onlineTextInactive
          ]}>
            {specialist?.isOnline ? t.specialist_online : t.specialist_offline}
          </Text>
        </View>
      </View>

      {/* ============ 可接單狀態卡片 ============ */}
      <View style={styles.availabilityCard}>
        <View style={styles.availabilityInfo}>
          {/* 狀態圖示 */}
          <View style={styles.availabilityIcon}>
            <Ionicons
              name={specialist?.isAvailable ? "checkmark-circle" : "pause-circle"}
              size={24}
              color={specialist?.isAvailable ? SemanticColors.successMain : SemanticColors.warningMain}
            />
          </View>
          {/* 狀態文字 */}
          <View style={styles.availabilityContent}>
            <Text style={styles.availabilityLabel}>
              {specialist?.isAvailable ? t.specialist_available : t.specialist_unavailable}
            </Text>
          </View>
        </View>
        {/* 切換開關 */}
        {availabilityMutation.isPending ? (
          <ActivityIndicator size="small" color={MibuBrand.info} />
        ) : (
          <Switch
            value={specialist?.isAvailable || false}
            onValueChange={handleToggleAvailable}
            trackColor={{ false: MibuBrand.tanLight, true: MibuBrand.creamLight }}
            thumbColor={specialist?.isAvailable ? MibuBrand.info : UIColors.textSecondary}
          />
        )}
      </View>

      {/* ============ 詳細資訊卡片 ============ */}
      <View style={styles.infoCard}>
        {/* 服務地區 */}
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="location-outline" size={20} color={MibuBrand.info} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t.specialist_serviceRegion}</Text>
            <Text style={styles.infoValue}>
              {specialist?.serviceRegion || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 目前服務中人數 */}
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="people-outline" size={20} color={MibuBrand.info} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t.specialist_currentlyServing}</Text>
            <Text style={styles.infoValue}>
              {specialist?.currentTravelers ?? 0} {t.specialist_people}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 最大服務人數 */}
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="person-add-outline" size={20} color={MibuBrand.info} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t.specialist_maxTravelers}</Text>
            <Text style={styles.infoValue}>
              {specialist?.maxTravelers ?? PerkDefaults.maxTravelers} {t.specialist_people}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 容器樣式
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  // Loading 狀態樣式
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: UIColors.textSecondary,
    fontSize: 16,
  },
  // 頁面標題樣式
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.brownDark,
  },
  // 頭像區樣式
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: MibuBrand.tanLight,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginBottom: 12,
  },
  // 上線狀態標籤樣式
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  onlineBadgeActive: {
    backgroundColor: SemanticColors.successLight,
  },
  onlineBadgeInactive: {
    backgroundColor: MibuBrand.creamLight,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineDotActive: {
    backgroundColor: SemanticColors.successMain,
  },
  onlineDotInactive: {
    backgroundColor: UIColors.textSecondary,
  },
  onlineText: {
    fontSize: 14,
    fontWeight: '600',
  },
  onlineTextActive: {
    color: SemanticColors.successDark,
  },
  onlineTextInactive: {
    color: UIColors.textSecondary,
  },
  // 可接單狀態卡片樣式
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UIColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityIcon: {
    marginRight: 12,
  },
  availabilityContent: {
    flex: 1,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  // 詳細資訊卡片樣式
  infoCard: {
    backgroundColor: UIColors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: UIColors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  // 分隔線樣式
  divider: {
    height: 1,
    backgroundColor: MibuBrand.tanLight,
    marginVertical: 4,
  },
});
