/**
 * ============================================================
 * 通知偏好設定頁面 (NotificationPreferencesScreen.tsx)
 * ============================================================
 * 此模組提供: 通知類型開關 + 勿擾時段設定
 *
 * 主要功能:
 * - 各類通知開關（成就、任務、優惠券、公告）
 * - 勿擾時段開關 + 時間設定
 * - 自動儲存（切換即送 API）
 *
 * 串接 API:
 * - GET /api/notifications/preferences
 * - PUT /api/notifications/preferences
 *
 * 更新日期：2026-02-11（#042 通知系統全面翻新）
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { MibuBrand, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import type { NotificationPreferences } from '../../../types/notifications';

// ============ 通知類型設定項 ============

interface NotifToggleItem {
  key: keyof Pick<NotificationPreferences, 'achievement' | 'dailyTask' | 'coupon' | 'announcement'>;
  labelKey: string;
  descKey: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

const NOTIF_ITEMS: NotifToggleItem[] = [
  {
    key: 'achievement',
    labelKey: 'notifPref_achievement',
    descKey: 'notifPref_achievementDesc',
    icon: 'trophy-outline',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
  },
  {
    key: 'dailyTask',
    labelKey: 'notifPref_dailyTask',
    descKey: 'notifPref_dailyTaskDesc',
    icon: 'checkbox-outline',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
  },
  {
    key: 'coupon',
    labelKey: 'notifPref_coupon',
    descKey: 'notifPref_couponDesc',
    icon: 'ticket-outline',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    key: 'announcement',
    labelKey: 'notifPref_announcement',
    descKey: 'notifPref_announcementDesc',
    icon: 'megaphone-outline',
    iconBg: '#FDF2F8',
    iconColor: '#DB2777',
  },
];

// ============ 元件 ============

export function NotificationPreferencesScreen() {
  const router = useRouter();
  const { t, getToken } = useApp();

  // 狀態
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  // ========== 載入偏好設定 ==========

  const loadPreferences = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getNotificationPreferences(token);
      setPreferences(data);
    } catch (error) {
      console.error('[NotifPref] 載入失敗:', error);
      Alert.alert(t.notifPref_loadFailed);
    } finally {
      setLoading(false);
    }
  }, [getToken, t]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // ========== 切換開關 ==========

  const handleToggle = useCallback(async (key: string, value: boolean) => {
    if (!preferences || saving) return;

    // 樂觀更新 UI
    setPreferences(prev => prev ? { ...prev, [key]: value } : prev);
    setSaving(true);

    try {
      const token = await getToken();
      if (!token) return;
      await apiService.updateNotificationPreferences(token, { [key]: value });
    } catch (error) {
      console.error('[NotifPref] 儲存失敗:', error);
      // 回滾
      setPreferences(prev => prev ? { ...prev, [key]: !value } : prev);
      Alert.alert(t.notifPref_saveFailed);
    } finally {
      setSaving(false);
    }
  }, [preferences, saving, getToken, t]);

  // ========== 切換勿擾時段 ==========

  const handleToggleQuietHours = useCallback(async (enabled: boolean) => {
    if (!preferences || saving) return;

    const updates: Partial<NotificationPreferences> = {
      quietHoursEnabled: enabled,
      // 預設勿擾時段 22:00 - 08:00
      ...(enabled && !preferences.quietHoursStart && {
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      }),
    };

    setPreferences(prev => prev ? { ...prev, ...updates } : prev);
    setSaving(true);

    try {
      const token = await getToken();
      if (!token) return;
      await apiService.updateNotificationPreferences(token, updates);
    } catch (error) {
      console.error('[NotifPref] 勿擾設定失敗:', error);
      setPreferences(prev => prev ? { ...prev, quietHoursEnabled: !enabled } : prev);
      Alert.alert(t.notifPref_saveFailed);
    } finally {
      setSaving(false);
    }
  }, [preferences, saving, getToken, t]);

  // ========== 渲染 ==========

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MibuBrand.brown} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t.notifPref_title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 通知類型群組 */}
        <Text style={styles.sectionTitle}>{t.notifPref_categoryTitle}</Text>
        <View style={styles.card}>
          {NOTIF_ITEMS.map((item, index) => (
            <View key={item.key}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.settingItem}>
                <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
                </View>
                <View style={styles.labelContainer}>
                  <Text style={styles.itemLabel}>{t[item.labelKey]}</Text>
                  <Text style={styles.itemDesc}>{t[item.descKey]}</Text>
                </View>
                <Switch
                  value={preferences?.[item.key] ?? true}
                  onValueChange={(v) => handleToggle(item.key, v)}
                  disabled={saving}
                  trackColor={{ false: MibuBrand.tanLight, true: MibuBrand.brown }}
                  thumbColor={UIColors.white}
                />
              </View>
            </View>
          ))}
        </View>

        {/* 勿擾時段群組 */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          {t.notifPref_quietHoursTitle}
        </Text>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="moon-outline" size={22} color="#7C3AED" />
            </View>
            <View style={styles.labelContainer}>
              <Text style={styles.itemLabel}>{t.notifPref_quietHoursTitle}</Text>
              <Text style={styles.itemDesc}>{t.notifPref_quietHoursDesc}</Text>
            </View>
            <Switch
              value={preferences?.quietHoursEnabled ?? false}
              onValueChange={handleToggleQuietHours}
              disabled={saving}
              trackColor={{ false: MibuBrand.tanLight, true: MibuBrand.brown }}
              thumbColor={UIColors.white}
            />
          </View>

          {/* 勿擾時段顯示（開啟時才顯示） */}
          {preferences?.quietHoursEnabled && (
            <>
              <View style={styles.divider} />
              <View style={styles.quietHoursRow}>
                <View style={styles.quietHoursItem}>
                  <Text style={styles.quietHoursLabel}>{t.notifPref_quietHoursStart}</Text>
                  <View style={styles.timeDisplay}>
                    <Ionicons name="time-outline" size={16} color={MibuBrand.copper} />
                    <Text style={styles.timeText}>
                      {preferences.quietHoursStart || '22:00'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={16} color={UIColors.textSecondary} />
                <View style={styles.quietHoursItem}>
                  <Text style={styles.quietHoursLabel}>{t.notifPref_quietHoursEnd}</Text>
                  <View style={styles.timeDisplay}>
                    <Ionicons name="time-outline" size={16} color={MibuBrand.copper} />
                    <Text style={styles.timeText}>
                      {preferences.quietHoursEnd || '08:00'}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============ 樣式 ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Platform.OS === 'android' ? Spacing.xl : Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: MibuBrand.copper,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  card: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
  itemDesc: {
    fontSize: FontSize.sm,
    color: UIColors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: MibuBrand.creamDark,
    marginHorizontal: Spacing.lg,
  },
  quietHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: Spacing.lg,
  },
  quietHoursItem: {
    alignItems: 'center',
  },
  quietHoursLabel: {
    fontSize: FontSize.sm,
    color: UIColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: UIColors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  timeText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: MibuBrand.brownDark,
  },
});
