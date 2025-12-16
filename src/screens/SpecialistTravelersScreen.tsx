import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { ServiceRelation } from '../types';

interface TravelerData {
  serviceRelation: ServiceRelation;
  traveler: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export function SpecialistTravelersScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [travelers, setTravelers] = useState<TravelerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '服務中旅客' : 'Active Travelers',
    noTravelers: isZh ? '目前無服務中旅客' : 'No active travelers',
    loading: isZh ? '載入中...' : 'Loading...',
    since: isZh ? '開始於' : 'Since',
    status: isZh ? '狀態' : 'Status',
    active: isZh ? '服務中' : 'Active',
    viewLocation: isZh ? '查看位置' : 'View Location',
    chat: isZh ? '聊天' : 'Chat',
  };

  useEffect(() => {
    loadTravelers();
  }, []);

  const loadTravelers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const response = await apiService.getSpecialistTravelers(token);
      setTravelers(response.travelers || []);
    } catch (error) {
      console.error('Failed to load travelers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTravelers();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(isZh ? 'zh-TW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {travelers.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>{translations.noTravelers}</Text>
          </View>
        ) : (
          <View style={styles.travelersList}>
            {travelers.map(({ serviceRelation, traveler }) => (
              <View key={serviceRelation.id} style={styles.travelerCard}>
                <View style={styles.travelerAvatar}>
                  <Ionicons name="person" size={28} color="#ffffff" />
                </View>
                <View style={styles.travelerInfo}>
                  <Text style={styles.travelerName}>
                    {traveler.firstName} {traveler.lastName}
                  </Text>
                  <Text style={styles.travelerDate}>
                    {translations.since}: {formatDate(serviceRelation.createdAt)}
                  </Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>{translations.active}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/specialist/tracking?travelerId=${traveler.id}` as any)}
                  >
                    <Ionicons name="location" size={20} color="#6366f1" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/specialist/chat/${traveler.id}` as any)}
                  >
                    <Ionicons name="chatbubble" size={20} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
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
  travelersList: {
    gap: 12,
  },
  travelerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  travelerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  travelerInfo: {
    flex: 1,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  travelerDate: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
