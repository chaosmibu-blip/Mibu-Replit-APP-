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
 */
import React, { useState, useEffect } from 'react';
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
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { SpecialistInfo } from '../../../types';
import { UIColors } from '../../../../constants/Colors';

// ============ 元件主體 ============
export function SpecialistProfileScreen() {
  const { state, getToken, t } = useApp();
  const router = useRouter();

  // ============ 狀態變數 ============
  // specialist: 專員資訊
  const [specialist, setSpecialist] = useState<SpecialistInfo | null>(null);
  // loading: 是否正在載入資料
  const [loading, setLoading] = useState(true);
  // updating: 是否正在更新可接單狀態
  const [updating, setUpdating] = useState(false);

  // 元件載入時取得專員資訊
  useEffect(() => {
    loadSpecialist();
  }, []);

  // ============ 資料載入函數 ============

  /**
   * 載入專員資訊
   * 從 API 取得專員詳細資料
   */
  const loadSpecialist = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getSpecialistMe(token);
      setSpecialist(data);
    } catch (error) {
      console.error('Failed to load specialist:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ 事件處理函數 ============

  /**
   * 切換可接單狀態
   * 呼叫 API 更新 isAvailable 欄位
   */
  const handleToggleAvailable = async () => {
    if (!specialist) return;
    try {
      setUpdating(true);
      const token = await getToken();
      if (!token) return;
      const data = await apiService.updateSpecialistAvailability(token, !specialist.isAvailable);
      setSpecialist(data.specialist);
    } catch (error) {
      console.error('Failed to update availability:', error);
    } finally {
      setUpdating(false);
    }
  };

  // ============ Loading 畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  // ============ 主畫面 JSX ============
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ============ 頁面標題區 ============ */}
      <View style={styles.header}>
        {/* 返回按鈕 */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{t.specialist_profile}</Text>
      </View>

      {/* ============ 頭像與名稱區 ============ */}
      <View style={styles.avatarSection}>
        {/* 專員頭像 */}
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#6366f1" />
        </View>
        {/* 專員名稱 */}
        <Text style={styles.name}>{specialist?.name || state.user?.name || '-'}</Text>
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
              color={specialist?.isAvailable ? "#22c55e" : "#f59e0b"}
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
        {updating ? (
          <ActivityIndicator size="small" color="#6366f1" />
        ) : (
          <Switch
            value={specialist?.isAvailable || false}
            onValueChange={handleToggleAvailable}
            trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
            thumbColor={specialist?.isAvailable ? '#6366f1' : '#94a3b8'}
          />
        )}
      </View>

      {/* ============ 詳細資訊卡片 ============ */}
      <View style={styles.infoCard}>
        {/* 服務地區 */}
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="location-outline" size={20} color="#6366f1" />
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
            <Ionicons name="people-outline" size={20} color="#6366f1" />
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
            <Ionicons name="person-add-outline" size={20} color="#6366f1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{t.specialist_maxTravelers}</Text>
            <Text style={styles.infoValue}>
              {specialist?.maxTravelers ?? 5} {t.specialist_people}
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
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 60,
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
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
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
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#c7d2fe',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
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
    backgroundColor: '#dcfce7',
  },
  onlineBadgeInactive: {
    backgroundColor: '#f1f5f9',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineDotActive: {
    backgroundColor: '#22c55e',
  },
  onlineDotInactive: {
    backgroundColor: '#94a3b8',
  },
  onlineText: {
    fontSize: 14,
    fontWeight: '600',
  },
  onlineTextActive: {
    color: '#16a34a',
  },
  onlineTextInactive: {
    color: UIColors.textSecondary,
  },
  // 可接單狀態卡片樣式
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
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
    color: '#1e293b',
  },
  // 詳細資訊卡片樣式
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
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
    backgroundColor: '#eef2ff',
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
    color: '#1e293b',
  },
  // 分隔線樣式
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
});
