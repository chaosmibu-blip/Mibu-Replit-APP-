import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiService } from '../../src/services/api';
import { HomeContentResponse, Announcement, AppEvent } from '../../src/types';
import { useApp } from '../../src/context/AppContext';

const AnnouncementCard = ({ item }: { item: Announcement }) => (
  <View style={styles.card}>
    <Text style={styles.cardTag}>公告</Text>
    <Text style={styles.cardContent}>{item.content}</Text>
  </View>
);

const EventCard = ({ item }: { item: AppEvent }) => (
  <View style={[styles.card, styles.eventCard]}>
    <Text style={styles.cardTag}>{item.eventType === 'flash' ? '快閃活動' : '節日限定'}</Text>
    <Text style={styles.cardTitle}>{item.title}</Text>
    <Text style={styles.cardContent}>{item.content}</Text>
  </View>
);

export default function HomeScreen() {
  const { state } = useApp();
  const [homeData, setHomeData] = useState<HomeContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHomeData = async () => {
    try {
      setError(null);
      const data = await apiService.getHomeContent();
      setHomeData(data);
    } catch (err) {
      setError('無法載入首頁資料，請稍後再試。');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchHomeData();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.headerTitle}>最新動態</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {!homeData || (homeData.announcements.length === 0 && homeData.events.length === 0) && !error && (
          <Text style={styles.emptyText}>目前沒有新的動態。</Text>
        )}

        {homeData?.events.map(event => <EventCard key={`event-${event.id}`} item={event} />)}
        
        {homeData?.announcements.map(announcement => <AnnouncementCard key={`announcement-${announcement.id}`} item={announcement} />)}
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCard: {
    borderColor: '#8A2BE2',
    borderWidth: 1,
  },
  cardTag: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#8A2BE2',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
    color: '#444',
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
});
