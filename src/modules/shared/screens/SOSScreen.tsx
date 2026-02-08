/**
 * SOSScreen - SOS 緊急求助畫面
 *
 * 功能說明：
 * - 長按 3 秒發送 SOS 求救訊號
 * - 自動取得並傳送當前位置
 * - 顯示求救記錄與狀態
 * - 整合 iOS Shortcuts Webhook 功能
 * - 檢查 SOS 功能使用資格
 *
 * 串接的 API：
 * - GET /api/user/sos-link - 取得 SOS Webhook URL
 * - GET /api/sos/eligibility - 檢查 SOS 使用資格
 * - GET /api/sos/alerts - 取得求救記錄
 * - POST /api/sos/send - 發送 SOS 求救
 * - PUT /api/sos/cancel/:id - 取消求救
 *
 * @see 後端合約: contracts/APP.md Phase 5
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../../constants/translations';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { SosAlert, SosAlertStatus } from '../../../types';
import { MibuBrand, SemanticColors, UIColors } from '../../../../constants/Colors';
import { STORAGE_KEYS } from '../../../constants/storageKeys';
import { LOCALE_MAP } from '../../../utils/i18n';

// ============ 元件本體 ============

export function SOSScreen() {
  const { t, state } = useApp();
  const router = useRouter();

  // ============ 狀態管理 ============

  const [webhookUrl, setWebhookUrl] = useState<string | null>(null); // Webhook URL
  const [sosKey, setSosKey] = useState<string | null>(null); // SOS 驗證 key
  const [loading, setLoading] = useState(true); // 頁面載入中
  const [sending, setSending] = useState(false); // 正在發送 SOS
  const [copied, setCopied] = useState(false); // 已複製到剪貼簿
  const [eligible, setEligible] = useState(true); // 是否有使用資格
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null); // 無資格原因
  const [alerts, setAlerts] = useState<SosAlert[]>([]); // 求救記錄列表

  // 長按動畫相關
  const progressAnim = useRef(new Animated.Value(0)).current; // 進度條動畫值
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 長按計時器

  /** SOS 狀態顏色對應（使用 t 翻譯） */
  const STATUS_COLORS: Record<SosAlertStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: SemanticColors.warningLight, text: SemanticColors.warningDark, label: t.sos_statusPending },
    acknowledged: { bg: '#dbeafe', text: '#2563eb', label: t.sos_statusAcknowledged },
    resolved: { bg: SemanticColors.successLight, text: SemanticColors.successDark, label: t.sos_statusResolved },
    cancelled: { bg: '#f1f5f9', text: UIColors.textSecondary, label: t.sos_statusCancelled },
  };

  // ============ 資料載入 ============

  /**
   * 載入所有 SOS 相關資料
   * 包含資格檢查、求救記錄、Webhook URL
   */
  const fetchData = useCallback(async () => {
    const userToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!userToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 並行請求資格與記錄
      const [eligibilityData, alertsData] = await Promise.allSettled([
        apiService.getSosEligibility(userToken),
        apiService.getSosAlerts(userToken),
      ]);

      // 處理資格資料
      if (eligibilityData.status === 'fulfilled') {
        setEligible(eligibilityData.value.eligible);
        setEligibilityReason(eligibilityData.value.reason);
      }

      // 處理求救記錄
      if (alertsData.status === 'fulfilled') {
        setAlerts(alertsData.value.alerts || []);
      }

      // 取得 Webhook URL
      const fullUrl = `${API_BASE_URL}/api/user/sos-link`;
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const url = data.webhookUrl || data.url;
        const key = data.key || data.sosKey;

        if (url) {
          setWebhookUrl(url);
          // 嘗試從 URL 或回應中取得 key
          if (key) {
            setSosKey(key);
          } else {
            try {
              const urlObj = new URL(url);
              const keyFromUrl = urlObj.searchParams.get('key');
              if (keyFromUrl) {
                setSosKey(keyFromUrl);
              }
            } catch {}
          }
        }
      }
    } catch (error: unknown) {
      console.error('Failed to fetch SOS data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============ 事件處理 ============

  /**
   * 複製 Webhook URL 到剪貼簿
   */
  const copyToClipboard = async () => {
    if (webhookUrl) {
      await Clipboard.setStringAsync(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * 處理長按開始
   * 開始進度條動畫並設定 3 秒後觸發 SOS
   */
  const handlePressIn = () => {
    if (!eligible || sending) return;

    // 重置並開始進度條動畫
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // 設定 3 秒後觸發 SOS
    holdTimerRef.current = setTimeout(() => {
      triggerSOS();
    }, 3000);
  };

  /**
   * 處理長按結束
   * 取消計時器並重置進度條
   */
  const handlePressOut = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    progressAnim.stopAnimation();
    progressAnim.setValue(0);
  };

  /**
   * 觸發 SOS 求救
   * 取得位置後發送求救訊號
   */
  const triggerSOS = async () => {
    setSending(true);
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) return;

      let locationData: { location?: string; locationAddress?: string } = {};

      // 嘗試取得位置資訊
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          locationData.location = `${position.coords.latitude},${position.coords.longitude}`;

          // 反向地理編碼取得地址
          try {
            const [address] = await Location.reverseGeocodeAsync({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            if (address) {
              locationData.locationAddress = [
                address.street,
                address.district,
                address.city,
                address.region,
                address.country,
              ].filter(Boolean).join(', ');
            }
          } catch {}
        }
      } catch {}

      // 發送 SOS
      const response = await apiService.sendSosAlert(token, locationData);

      if (response.success) {
        Alert.alert(
          t.sos_alertSent,
          response.message || t.sos_willContactYou,
          [{ text: 'OK', onPress: fetchData }]
        );
      }
    } catch (error: unknown) {
      // 如果主要 API 失敗，嘗試備用 Webhook
      if (sosKey) {
        const triggerUrl = `${API_BASE_URL}/api/sos/trigger?key=${sosKey}`;
        try {
          const response = await fetch(triggerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            Alert.alert(t.sent, t.sosSuccess);
            fetchData();
            return;
          }
        } catch {}
      }

      Alert.alert(
        t.sos_sendFailed,
        t.sos_tryAgainLater
      );
    } finally {
      setSending(false);
    }
  };

  /**
   * 處理取消求救
   */
  const handleCancelAlert = async (alertId: number) => {
    Alert.alert(
      t.sos_confirmCancel,
      t.sos_confirmCancelDesc,
      [
        { text: t.sos_no, style: 'cancel' },
        {
          text: t.sos_yes,
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
              if (!token) return;

              await apiService.cancelSosAlert(token, alertId);
              fetchData();
            } catch (error) {
              Alert.alert(
                t.common_error,
                t.sos_cancelFailed
              );
            }
          },
        },
      ]
    );
  };

  // ============ 輔助函數 ============

  /**
   * 格式化日期顯示（使用 LOCALE_MAP 取得正確 locale）
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(LOCALE_MAP[state.language], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============ 載入狀態 ============

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={SemanticColors.errorDark} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  // 進度條寬度動畫
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ============ 主要渲染 ============

  return (
    <View style={styles.container}>
      {/* ===== 頂部導航列 ===== */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="shield-checkmark" size={22} color={MibuBrand.brownDark} />
          <Text style={styles.headerTitle}>{t.safetyCenter}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* ===== 功能鎖定狀態（無資格時顯示） ===== */}
        {!eligible ? (
          <View style={styles.lockedCard}>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={48} color={UIColors.textSecondary} />
            </View>
            <Text style={styles.lockedTitle}>
              {t.sos_featureLocked}
            </Text>
            <Text style={styles.lockedText}>
              {eligibilityReason || t.sos_requirePurchase}
            </Text>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() => router.push('/purchase-service' as any)}
            >
              <Text style={styles.purchaseButtonText}>
                {t.sos_purchaseService}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ===== 標題區塊 ===== */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={48} color={SemanticColors.errorDark} />
              </View>
              <Text style={styles.title}>{t.safetyCenter}</Text>
              <Text style={styles.subtitle}>{t.safetyCenterDesc}</Text>
            </View>

            {/* ===== 緊急求救區塊 ===== */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.sos_emergencySOS}</Text>
              <Text style={styles.sectionDescription}>
                {t.sos_holdToSend}
              </Text>

              {/* SOS 按鈕 */}
              <TouchableOpacity
                style={[styles.sosButton, sending && styles.sosButtonDisabled]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={sending}
                activeOpacity={0.9}
              >
                {/* 進度條背景 */}
                <Animated.View
                  style={[
                    styles.sosButtonProgress,
                    { width: progressWidth }
                  ]}
                />
                <View style={styles.sosButtonContent}>
                  {sending ? (
                    <ActivityIndicator color={UIColors.white} size="large" />
                  ) : (
                    <>
                      <Ionicons name="warning" size={40} color={UIColors.white} />
                      <Text style={styles.sosButtonText}>SOS</Text>
                      <Text style={styles.sosButtonHint}>
                        {t.sos_hold3sec}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* ===== 求救記錄區塊 ===== */}
            {alerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.sos_alertHistory}</Text>
                {alerts.map(alert => {
                  const statusInfo = STATUS_COLORS[alert.status];
                  return (
                    <View key={alert.id} style={styles.alertCard}>
                      {/* 狀態與時間 */}
                      <View style={styles.alertHeader}>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                          <Text style={[styles.statusText, { color: statusInfo.text }]}>
                            {statusInfo.label}
                          </Text>
                        </View>
                        <Text style={styles.alertDate}>
                          {formatDate(alert.createdAt)}
                        </Text>
                      </View>

                      {/* 位置資訊 */}
                      {alert.locationAddress && (
                        <View style={styles.alertRow}>
                          <Ionicons name="location" size={16} color={UIColors.textSecondary} />
                          <Text style={styles.alertRowText}>{alert.locationAddress}</Text>
                        </View>
                      )}

                      {/* 取消按鈕（僅 pending 狀態顯示） */}
                      {alert.status === 'pending' && (
                        <TouchableOpacity
                          style={styles.cancelAlertButton}
                          onPress={() => handleCancelAlert(alert.id)}
                        >
                          <Text style={styles.cancelAlertButtonText}>
                            {t.sos_cancelAlert}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* ===== iOS Shortcuts 整合區塊 ===== */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.iosShortcutsIntegration}</Text>
              <Text style={styles.sectionDescription}>
                {t.iosShortcutsDesc}
              </Text>

              {/* Webhook URL 顯示區 */}
              <View style={styles.webhookBox}>
                <Text style={styles.webhookLabel}>{t.webhookUrl}</Text>
                <View style={styles.webhookContent}>
                  <Text style={styles.webhookUrl} numberOfLines={2} ellipsizeMode="middle">
                    {webhookUrl || t.notAvailable}
                  </Text>
                </View>

                {/* 複製按鈕 */}
                <TouchableOpacity
                  style={[styles.copyButton, copied && styles.copyButtonSuccess]}
                  onPress={copyToClipboard}
                  disabled={!webhookUrl}
                >
                  <Ionicons
                    name={copied ? "checkmark" : "copy-outline"}
                    size={20}
                    color={UIColors.white}
                  />
                  <Text style={styles.copyButtonText}>
                    {copied ? t.copied : t.copyLink}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 設定步驟說明 */}
              <View style={styles.instructionBox}>
                <Text style={styles.instructionTitle}>{t.setupSteps}</Text>
                <Text style={styles.instructionStep}>{t.step1}</Text>
                <Text style={styles.instructionStep}>{t.step2}</Text>
                <Text style={styles.instructionStep}>{t.step3}</Text>
                <Text style={styles.instructionStep}>{t.step4}</Text>
                <Text style={styles.instructionStep}>{t.step5}</Text>
              </View>
            </View>
          </>
        )}

        {/* 底部留白 */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  // 頂部導航列
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: MibuBrand.warmWhite,
    borderBottomWidth: 2,
    borderBottomColor: MibuBrand.tanLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  // 載入狀態
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: MibuBrand.copper,
  },
  // 功能鎖定卡片
  lockedCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  lockIcon: {
    width: 80,
    height: 80,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 12,
  },
  lockedText: {
    fontSize: 14,
    color: MibuBrand.copper,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  purchaseButton: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: UIColors.white,
  },
  // 標題區塊
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: SemanticColors.errorLight,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MibuBrand.copper,
    textAlign: 'center',
  },
  // 區塊
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MibuBrand.brownDark,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: MibuBrand.copper,
    marginBottom: 16,
    lineHeight: 20,
  },
  // SOS 按鈕
  sosButton: {
    height: 140,
    backgroundColor: SemanticColors.errorDark,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: SemanticColors.errorDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  sosButtonDisabled: {
    opacity: 0.7,
  },
  sosButtonProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: SemanticColors.errorDark,
  },
  sosButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: UIColors.white,
    marginTop: 4,
  },
  sosButtonHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // 求救記錄卡片
  alertCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertDate: {
    fontSize: 12,
    color: MibuBrand.tan,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  alertRowText: {
    flex: 1,
    fontSize: 14,
    color: MibuBrand.brownDark,
  },
  cancelAlertButton: {
    marginTop: 8,
    paddingVertical: 10,
    backgroundColor: SemanticColors.errorLight,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelAlertButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: SemanticColors.errorDark,
  },
  // Webhook 區塊
  webhookBox: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  webhookLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.copper,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  webhookContent: {
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  webhookUrl: {
    fontSize: 13,
    color: MibuBrand.brownDark,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MibuBrand.brown,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  copyButtonSuccess: {
    backgroundColor: SemanticColors.successDark,
  },
  copyButtonText: {
    color: UIColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  // 設定步驟說明
  instructionBox: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  instructionStep: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 6,
    lineHeight: 20,
  },
});
