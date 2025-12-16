import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { ServiceRelation } from '../types';

export function SpecialistHistoryScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [services, setServices] = useState<ServiceRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '服務歷史' : 'Service History',
    all: isZh ? '全部' : 'All',
    active: isZh ? '進行中' : 'Active',
    completed: isZh ? '已完成' : 'Completed',
    cancelled: isZh ? '已取消' : 'Cancelled',
    noServices: isZh ? '尚無服務記錄' : 'No service history',
    loading: isZh ? '載入中...' : 'Loading...',
    since: isZh ? '開始於' : 'Started',
    traveler: isZh ? '旅客' : 'Traveler',
    status: isZh ? '狀態' : 'Status',
  };

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getSpecialistServices(token);
      setServices(data.relations || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    if (filter === 'all') return true;
    if (filter === 'active') return service.status === 'active';
    if (filter === 'completed') return service.status === 'completed';
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isZh ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return translations.active;
      case 'completed': return translations.completed;
      case 'cancelled': return translations.cancelled;
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { badge: styles.activeBadge, text: styles.activeText };
      case 'completed': return { badge: styles.completedBadge, text: styles.completedText };
      case 'cancelled': return { badge: styles.cancelledBadge, text: styles.cancelledText };
      default: return { badge: styles.activeBadge, text: styles.activeText };
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

      <View style={styles.filterRow}>
        {(['all', 'active', 'completed'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? translations.all : f === 'active' ? translations.active : translations.completed}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredServices.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="time-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>{translations.noServices}</Text>
        </View>
      ) : (
        <View style={styles.servicesList}>
          {filteredServices.map(service => {
            const statusStyle = getStatusStyle(service.status);
            return (
              <View key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceAvatar}>
                  <Ionicons name="person" size={24} color="#ffffff" />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>
                    {service.traveler?.name || `${translations.traveler} #${service.travelerId.slice(0, 8)}`}
                  </Text>
                  <Text style={styles.serviceDate}>
                    {translations.since}: {formatDate(service.createdAt)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, statusStyle.badge]}>
                  <Text style={[styles.statusText, statusStyle.text]}>
                    {getStatusLabel(service.status)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  serviceAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  serviceDate: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  activeText: {
    color: '#16a34a',
  },
  completedBadge: {
    backgroundColor: '#e0e7ff',
  },
  completedText: {
    color: '#6366f1',
  },
  cancelledBadge: {
    backgroundColor: '#fef2f2',
  },
  cancelledText: {
    color: '#ef4444',
  },
});
