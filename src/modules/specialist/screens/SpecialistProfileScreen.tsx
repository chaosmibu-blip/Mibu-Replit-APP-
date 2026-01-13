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

export function SpecialistProfileScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [specialist, setSpecialist] = useState<SpecialistInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '專員資料' : 'Specialist Profile',
    name: isZh ? '姓名' : 'Name',
    region: isZh ? '服務地區' : 'Service Region',
    status: isZh ? '帳號狀態' : 'Account Status',
    online: isZh ? '上線狀態' : 'Online Status',
    available: isZh ? '可接單' : 'Available',
    unavailable: isZh ? '暫停接單' : 'Unavailable',
    onlineYes: isZh ? '上線中' : 'Online',
    onlineNo: isZh ? '離線' : 'Offline',
    currentTravelers: isZh ? '目前服務中' : 'Currently Serving',
    maxTravelers: isZh ? '最大服務人數' : 'Max Travelers',
    loading: isZh ? '載入中...' : 'Loading...',
    people: isZh ? '人' : '',
  };

  useEffect(() => {
    loadSpecialist();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#6366f1" />
        </View>
        <Text style={styles.name}>{specialist?.name || state.user?.name || '-'}</Text>
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
            {specialist?.isOnline ? translations.onlineYes : translations.onlineNo}
          </Text>
        </View>
      </View>

      <View style={styles.availabilityCard}>
        <View style={styles.availabilityInfo}>
          <View style={styles.availabilityIcon}>
            <Ionicons 
              name={specialist?.isAvailable ? "checkmark-circle" : "pause-circle"} 
              size={24} 
              color={specialist?.isAvailable ? "#22c55e" : "#f59e0b"} 
            />
          </View>
          <View style={styles.availabilityContent}>
            <Text style={styles.availabilityLabel}>
              {specialist?.isAvailable ? translations.available : translations.unavailable}
            </Text>
          </View>
        </View>
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

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="location-outline" size={20} color="#6366f1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{translations.region}</Text>
            <Text style={styles.infoValue}>
              {specialist?.serviceRegion || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="people-outline" size={20} color="#6366f1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{translations.currentTravelers}</Text>
            <Text style={styles.infoValue}>
              {specialist?.currentTravelers ?? 0} {translations.people}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="person-add-outline" size={20} color="#6366f1" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{translations.maxTravelers}</Text>
            <Text style={styles.infoValue}>
              {specialist?.maxTravelers ?? 5} {translations.people}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
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
    color: '#64748b',
  },
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
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
});
