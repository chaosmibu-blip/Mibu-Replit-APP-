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
 * 更新日期：2026-02-20（#052 新增勿擾時段時間編輯）
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
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useI18n } from '../../../context/AppContext';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../../../hooks/useNotificationQueries';
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
  const { t } = useI18n();

  // ========== React Query 資料查詢 ==========

  const prefQuery = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  // 本地表單狀態（從 query 資料初始化，用於樂觀 UI 更新）
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences | null>(null);

  // 同步 query 資料到本地狀態（僅初次載入時）
  useEffect(() => {
    if (prefQuery.data && !localPrefs) {
      setLocalPrefs(prefQuery.data);
    }
  }, [prefQuery.data, localPrefs]);

  // 衍生狀態
  const loading = prefQuery.isLoading;
  const saving = updateMutation.isPending;
  const preferences = localPrefs;

  // ========== 切換開關 ==========

  const handleToggle = useCallback((key: string, value: boolean) => {
    if (!preferences || saving) return;

    // 樂觀更新 UI
    setLocalPrefs(prev => prev ? { ...prev, [key]: value } : prev);

    updateMutation.mutate({ [key]: value } as any, {
      onError: () => {
        // 回滾
        setLocalPrefs(prev => prev ? { ...prev, [key]: !value } : prev);
        Alert.alert(t.notifPref_saveFailed);
      },
    });
  }, [preferences, saving, updateMutation, t]);

  // ========== 切換勿擾時段 ==========

  const handleToggleQuietHours = useCallback((enabled: boolean) => {
    if (!preferences || saving) return;

    const updates: Partial<NotificationPreferences> = {
      quietHoursEnabled: enabled,
      // 預設勿擾時段 22:00 - 08:00
      ...(enabled && !preferences.quietHoursStart && {
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      }),
    };

    setLocalPrefs(prev => prev ? { ...prev, ...updates } : prev);

    updateMutation.mutate(updates as any, {
      onError: () => {
        setLocalPrefs(prev => prev ? { ...prev, quietHoursEnabled: !enabled } : prev);
        Alert.alert(t.notifPref_saveFailed);
      },
    });
  }, [preferences, saving, updateMutation, t]);

  // ========== 勿擾時段時間編輯 ==========

  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end' | null>(null);
  const [pendingHour, setPendingHour] = useState(22);
  const [pendingMinute, setPendingMinute] = useState(0);

  const openTimePicker = useCallback((target: 'start' | 'end') => {
    if (!preferences) return;
    const timeStr = target === 'start'
      ? (preferences.quietHoursStart || '22:00')
      : (preferences.quietHoursEnd || '08:00');
    const [h, m] = timeStr.split(':').map(Number);
    setPendingHour(h);
    setPendingMinute(m);
    setTimePickerTarget(target);
  }, [preferences]);

  const confirmTimePicker = useCallback(() => {
    if (!preferences || !timePickerTarget || saving) return;
    const timeStr = `${String(pendingHour).padStart(2, '0')}:${String(pendingMinute).padStart(2, '0')}`;
    const key = timePickerTarget === 'start' ? 'quietHoursStart' : 'quietHoursEnd';
    const oldValue = preferences[key];

    setLocalPrefs(prev => prev ? { ...prev, [key]: timeStr } : prev);
    setTimePickerTarget(null);

    updateMutation.mutate({ [key]: timeStr } as any, {
      onError: () => {
        setLocalPrefs(prev => prev ? { ...prev, [key]: oldValue } : prev);
        Alert.alert(t.notifPref_saveFailed);
      },
    });
  }, [preferences, timePickerTarget, pendingHour, pendingMinute, saving, updateMutation, t]);

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

          {/* 勿擾時段時間選擇（開啟時才顯示） */}
          {preferences?.quietHoursEnabled && (
            <>
              <View style={styles.divider} />
              <View style={styles.quietHoursRow}>
                <TouchableOpacity
                  style={styles.quietHoursItem}
                  onPress={() => openTimePicker('start')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quietHoursLabel}>{t.notifPref_quietHoursStart}</Text>
                  <View style={styles.timeDisplay}>
                    <Ionicons name="time-outline" size={16} color={MibuBrand.copper} />
                    <Text style={styles.timeText}>
                      {preferences.quietHoursStart || '22:00'}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={UIColors.textSecondary} />
                  </View>
                </TouchableOpacity>
                <Ionicons name="arrow-forward" size={16} color={UIColors.textSecondary} />
                <TouchableOpacity
                  style={styles.quietHoursItem}
                  onPress={() => openTimePicker('end')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quietHoursLabel}>{t.notifPref_quietHoursEnd}</Text>
                  <View style={styles.timeDisplay}>
                    <Ionicons name="time-outline" size={16} color={MibuBrand.copper} />
                    <Text style={styles.timeText}>
                      {preferences.quietHoursEnd || '08:00'}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={UIColors.textSecondary} />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* 時間選擇器 Modal */}
      <Modal
        visible={timePickerTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTimePickerTarget(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTimePickerTarget(null)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {timePickerTarget === 'start' ? t.notifPref_quietHoursStart : t.notifPref_quietHoursEnd}
            </Text>

            <View style={styles.pickerRow}>
              {/* 小時 */}
              <View style={styles.pickerColumn}>
                <FlatList
                  data={Array.from({ length: 24 }, (_, i) => i)}
                  keyExtractor={(item) => `h-${item}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.pickerList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        item === pendingHour && styles.pickerItemSelected,
                      ]}
                      onPress={() => setPendingHour(item)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        item === pendingHour && styles.pickerItemTextSelected,
                      ]}>
                        {String(item).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  getItemLayout={(_, index) => ({ length: 44, offset: 44 * index, index })}
                  initialScrollIndex={Math.max(0, pendingHour - 2)}
                />
                <Text style={styles.pickerUnitLabel}>時</Text>
              </View>

              <Text style={styles.pickerColon}>:</Text>

              {/* 分鐘（15 分鐘為單位） */}
              <View style={styles.pickerColumn}>
                <FlatList
                  data={[0, 15, 30, 45]}
                  keyExtractor={(item) => `m-${item}`}
                  showsVerticalScrollIndicator={false}
                  style={styles.pickerListMinute}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        item === pendingMinute && styles.pickerItemSelected,
                      ]}
                      onPress={() => setPendingMinute(item)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        item === pendingMinute && styles.pickerItemTextSelected,
                      ]}>
                        {String(item).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
                <Text style={styles.pickerUnitLabel}>分</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setTimePickerTarget(null)}
              >
                <Text style={styles.modalCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmTimePicker}
              >
                <Text style={styles.modalConfirmText}>{t.common_confirm}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  // ========== 時間選擇器 Modal ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: UIColors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: 280,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerList: {
    height: 220,
    width: 80,
  },
  pickerListMinute: {
    height: 176,
    width: 80,
  },
  pickerColon: {
    fontSize: 28,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginHorizontal: Spacing.sm,
  },
  pickerItem: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  pickerItemSelected: {
    backgroundColor: MibuBrand.creamLight,
  },
  pickerItemText: {
    fontSize: 22,
    color: UIColors.textSecondary,
  },
  pickerItemTextSelected: {
    color: MibuBrand.brown,
    fontWeight: '700',
  },
  pickerUnitLabel: {
    fontSize: FontSize.sm,
    color: UIColors.textSecondary,
    marginTop: Spacing.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: MibuBrand.creamLight,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: UIColors.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: MibuBrand.brown,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: UIColors.white,
  },
});
