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
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../constants/translations';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { SosAlert, SosAlertStatus } from '../types';

const AUTH_TOKEN_KEY = '@mibu_token';

const STATUS_COLORS: Record<SosAlertStatus, { bg: string; text: string; label: string; labelEn: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706', label: '等待處理', labelEn: 'Pending' },
  acknowledged: { bg: '#dbeafe', text: '#2563eb', label: '已確認', labelEn: 'Acknowledged' },
  resolved: { bg: '#dcfce7', text: '#16a34a', label: '已解決', labelEn: 'Resolved' },
  cancelled: { bg: '#f1f5f9', text: '#64748b', label: '已取消', labelEn: 'Cancelled' },
};

export function SOSScreen() {
  const { t, state } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';
  
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [sosKey, setSosKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [eligible, setEligible] = useState(true);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    const userToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (!userToken) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const [eligibilityData, alertsData] = await Promise.allSettled([
        apiService.getSosEligibility(userToken),
        apiService.getSosAlerts(userToken),
      ]);
      
      if (eligibilityData.status === 'fulfilled') {
        setEligible(eligibilityData.value.eligible);
        setEligibilityReason(eligibilityData.value.reason);
      }
      
      if (alertsData.status === 'fulfilled') {
        setAlerts(alertsData.value.alerts || []);
      }
      
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
    } catch (error: any) {
      console.error('Failed to fetch SOS data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyToClipboard = async () => {
    if (webhookUrl) {
      await Clipboard.setStringAsync(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePressIn = () => {
    if (!eligible || sending) return;

    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    holdTimerRef.current = setTimeout(() => {
      triggerSOS();
    }, 3000);
  };

  const handlePressOut = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    progressAnim.stopAnimation();
    progressAnim.setValue(0);
  };

  const triggerSOS = async () => {
    setSending(true);
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!token) return;

      let locationData: { location?: string; locationAddress?: string } = {};

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          locationData.location = `${position.coords.latitude},${position.coords.longitude}`;

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

      const response = await apiService.sendSosAlert(token, locationData);

      if (response.success) {
        Alert.alert(
          isZh ? '求救訊號已發送' : 'SOS Alert Sent',
          response.message || (isZh ? '我們會盡快聯繫您' : 'We will contact you as soon as possible'),
          [{ text: 'OK', onPress: fetchData }]
        );
      }
    } catch (error: any) {
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
        isZh ? '發送失敗' : 'Failed to Send',
        isZh ? '請稍後再試' : 'Please try again later'
      );
    } finally {
      setSending(false);
    }
  };

  const handleCancelAlert = async (alertId: number) => {
    Alert.alert(
      isZh ? '確認取消' : 'Confirm Cancel',
      isZh ? '確定要取消這個求救訊號嗎？' : 'Are you sure you want to cancel this alert?',
      [
        { text: isZh ? '否' : 'No', style: 'cancel' },
        {
          text: isZh ? '是' : 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
              if (!token) return;

              await apiService.cancelSosAlert(token, alertId);
              fetchData();
            } catch (error) {
              Alert.alert(
                isZh ? '錯誤' : 'Error',
                isZh ? '取消失敗' : 'Failed to cancel'
              );
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isZh ? 'zh-TW' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isZh ? '安全中心' : 'Safety Center'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {!eligible ? (
          <View style={styles.lockedCard}>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={48} color="#94a3b8" />
            </View>
            <Text style={styles.lockedTitle}>
              {isZh ? 'SOS 功能已鎖定' : 'SOS Feature Locked'}
            </Text>
            <Text style={styles.lockedText}>
              {eligibilityReason || (isZh ? '需購買旅程服務才能使用安全中心功能' : 'Purchase travel service to unlock Safety Center')}
            </Text>
            <TouchableOpacity 
              style={styles.purchaseButton}
              onPress={() => router.push('/purchase-service' as any)}
            >
              <Text style={styles.purchaseButtonText}>
                {isZh ? '購買服務' : 'Purchase Service'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={48} color="#ef4444" />
              </View>
              <Text style={styles.title}>{t.safetyCenter}</Text>
              <Text style={styles.subtitle}>{t.safetyCenterDesc}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{isZh ? '緊急求救' : 'Emergency SOS'}</Text>
              <Text style={styles.sectionDescription}>
                {isZh 
                  ? '長按下方按鈕 3 秒發送求救訊號，我們會立即通知您的旅程策畫師'
                  : 'Press and hold the button for 3 seconds to send an SOS alert'}
              </Text>
              
              <TouchableOpacity
                style={[styles.sosButton, sending && styles.sosButtonDisabled]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={sending}
                activeOpacity={0.9}
              >
                <Animated.View 
                  style={[
                    styles.sosButtonProgress,
                    { width: progressWidth }
                  ]} 
                />
                <View style={styles.sosButtonContent}>
                  {sending ? (
                    <ActivityIndicator color="#ffffff" size="large" />
                  ) : (
                    <>
                      <Ionicons name="warning" size={40} color="#ffffff" />
                      <Text style={styles.sosButtonText}>SOS</Text>
                      <Text style={styles.sosButtonHint}>
                        {isZh ? '長按 3 秒' : 'Hold 3 sec'}
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {alerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{isZh ? '求救記錄' : 'Alert History'}</Text>
                {alerts.map(alert => {
                  const statusInfo = STATUS_COLORS[alert.status];
                  return (
                    <View key={alert.id} style={styles.alertCard}>
                      <View style={styles.alertHeader}>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                          <Text style={[styles.statusText, { color: statusInfo.text }]}>
                            {isZh ? statusInfo.label : statusInfo.labelEn}
                          </Text>
                        </View>
                        <Text style={styles.alertDate}>
                          {formatDate(alert.createdAt)}
                        </Text>
                      </View>

                      {alert.locationAddress && (
                        <View style={styles.alertRow}>
                          <Ionicons name="location" size={16} color="#64748b" />
                          <Text style={styles.alertRowText}>{alert.locationAddress}</Text>
                        </View>
                      )}

                      {alert.status === 'pending' && (
                        <TouchableOpacity
                          style={styles.cancelAlertButton}
                          onPress={() => handleCancelAlert(alert.id)}
                        >
                          <Text style={styles.cancelAlertButtonText}>
                            {isZh ? '取消求救' : 'Cancel Alert'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.iosShortcutsIntegration}</Text>
              <Text style={styles.sectionDescription}>
                {t.iosShortcutsDesc}
              </Text>
              
              <View style={styles.webhookBox}>
                <Text style={styles.webhookLabel}>{t.webhookUrl}</Text>
                <View style={styles.webhookContent}>
                  <Text style={styles.webhookUrl} numberOfLines={2} ellipsizeMode="middle">
                    {webhookUrl || t.notAvailable}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.copyButton, copied && styles.copyButtonSuccess]}
                  onPress={copyToClipboard}
                  disabled={!webhookUrl}
                >
                  <Ionicons 
                    name={copied ? "checkmark" : "copy-outline"} 
                    size={20} 
                    color="#ffffff" 
                  />
                  <Text style={styles.copyButtonText}>
                    {copied ? t.copied : t.copyLink}
                  </Text>
                </TouchableOpacity>
              </View>

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

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    color: '#1e293b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  lockedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  lockIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  lockedText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  purchaseButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#fef2f2',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  sosButton: {
    height: 140,
    backgroundColor: '#ef4444',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ef4444',
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
    backgroundColor: '#dc2626',
  },
  sosButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosButtonText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 4,
  },
  sosButtonHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#94a3b8',
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
    color: '#334155',
  },
  cancelAlertButton: {
    marginTop: 8,
    paddingVertical: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelAlertButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  webhookBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  webhookLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  webhookContent: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  webhookUrl: {
    fontSize: 13,
    color: '#334155',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  copyButtonSuccess: {
    backgroundColor: '#22c55e',
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
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
