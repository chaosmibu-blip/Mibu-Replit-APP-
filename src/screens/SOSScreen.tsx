import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../constants/translations';
import { useApp } from '../context/AppContext';

export function SOSScreen() {
  const { t } = useApp();
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchWebhookUrl = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/sos/webhook`);
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Received Data:', data);
        const url = data.webhookUrl || data.url;
        setWebhookUrl(url || null);
      }
    } catch (error) {
      console.error('Failed to fetch webhook URL:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhookUrl();
  }, [fetchWebhookUrl]);

  const copyToClipboard = async () => {
    if (webhookUrl) {
      await Clipboard.setStringAsync(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sendSOS = async () => {
    Alert.alert(
      t.confirmSOS,
      t.confirmSOSDesc,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.confirmSend,
          style: 'destructive',
          onPress: async () => {
            try {
              setSending(true);
              const response = await fetch(`${API_BASE_URL}/api/sos/trigger`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              
              if (response.ok) {
                Alert.alert(t.sent, t.sosSuccess);
              } else {
                Alert.alert(t.sendFailed, t.tryAgainLater);
              }
            } catch (error) {
              console.error('Failed to send SOS:', error);
              Alert.alert(t.sendFailed, t.networkError);
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={48} color="#ef4444" />
        </View>
        <Text style={styles.title}>{t.safetyCenter}</Text>
        <Text style={styles.subtitle}>{t.safetyCenterDesc}</Text>
      </View>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.emergencyNow}</Text>
        <Text style={styles.sectionDescription}>
          {t.emergencyNowDesc}
        </Text>
        
        <TouchableOpacity
          style={styles.sosButton}
          onPress={sendSOS}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Ionicons name="alert-circle" size={32} color="#ffffff" />
              <Text style={styles.sosButtonText}>{t.sosButton}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
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
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 20,
    gap: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sosButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
});
