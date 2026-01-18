import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../../context/AppContext';
import { Card } from '../components/ui/Card';
import { MibuBrand } from '../../../../constants/Colors';
import { Announcement, Event } from '../../../types';
import { apiService, eventApi } from '../../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function HomeScreen() {
  const { t, state } = useApp();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<{
    announcements: Event[];
    festivals: Event[];
    limitedEvents: Event[];
  }>({ announcements: [], festivals: [], limitedEvents: [] });
  const [loading, setLoading] = useState(true);

  const isZh = state.language === 'zh-TW';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // 同時載入舊版公告和新版活動
      const [announcementRes, eventsRes] = await Promise.all([
        apiService.getAnnouncements().catch(() => ({ announcements: [] })),
        eventApi.getHomeEvents().catch(() => ({ announcements: [], festivals: [], limitedEvents: [] })),
      ]);
      setAnnouncements(announcementRes.announcements || []);
      setEvents(eventsRes);
    } catch (error) {
      console.log('Failed to load home data:', error);
      setAnnouncements([]);
      setEvents({ announcements: [], festivals: [], limitedEvents: [] });
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedEventTitle = (event: Event): string => {
    if (state.language === 'zh-TW') return event.title;
    if (state.language === 'en' && event.titleEn) return event.titleEn;
    if (state.language === 'ja' && event.titleJa) return event.titleJa;
    if (state.language === 'ko' && event.titleKo) return event.titleKo;
    return event.title;
  };

  const getLocalizedEventDesc = (event: Event): string => {
    if (state.language === 'zh-TW') return event.description;
    if (state.language === 'en' && event.descriptionEn) return event.descriptionEn;
    if (state.language === 'ja' && event.descriptionJa) return event.descriptionJa;
    if (state.language === 'ko' && event.descriptionKo) return event.descriptionKo;
    return event.description;
  };

  const handleEventPress = (event: Event) => {
    router.push(`/event/${event.id}`);
  };

  const isAnnouncementVisible = (a: Announcement): boolean => {
    if (!a.isActive) return false;
    
    const now = new Date();
    
    if (a.startDate) {
      const start = new Date(a.startDate);
      if (now < start) return false;
    }
    
    if (a.endDate) {
      const end = new Date(a.endDate);
      if (now > end) return false;
    }
    
    return true;
  };

  const activeAnnouncements = announcements.filter(isAnnouncementVisible);
  const generalAnnouncements = activeAnnouncements.filter(a => a.type === 'announcement');
  const flashEvents = activeAnnouncements.filter(a => a.type === 'flash_event');
  const holidayEvents = activeAnnouncements.filter(a => a.type === 'holiday_event');

  const handleAnnouncementPress = (announcement: Announcement) => {
    if (announcement.linkUrl) {
      Linking.openURL(announcement.linkUrl).catch(() => {});
    }
  };

  const renderEventCard = (event: Event, bgColor: string, textColor: string = '#ffffff') => (
    <TouchableOpacity
      key={event.id}
      style={[styles.eventCard, { backgroundColor: bgColor }]}
      onPress={() => handleEventPress(event)}
      activeOpacity={0.8}
    >
      {event.imageUrl && (
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.eventCardContent}>
        <Text style={[styles.eventTitle, { color: textColor }]} numberOfLines={2}>
          {getLocalizedEventTitle(event)}
        </Text>
        <Text style={[styles.eventDesc, { color: textColor, opacity: 0.85 }]} numberOfLines={2}>
          {getLocalizedEventDesc(event)}
        </Text>
        {event.endDate && (
          <View style={styles.eventDateRow}>
            <Ionicons name="time-outline" size={12} color={textColor} style={{ opacity: 0.7 }} />
            <Text style={[styles.eventDate, { color: textColor, opacity: 0.7 }]}>
              {isZh ? '至 ' : 'Until '}{new Date(event.endDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAnnouncementItem = (item: Announcement, isLight: boolean = true) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => handleAnnouncementPress(item)}
      disabled={!item.linkUrl}
      activeOpacity={item.linkUrl ? 0.7 : 1}
    >
      <View style={styles.announcementItem}>
        <Text style={[
          styles.announcementText,
          !isLight && { color: 'rgba(255,255,255,0.95)' }
        ]}>
          • {item.title}
        </Text>
        {item.content && (
          <Text style={[
            styles.announcementDescription,
            !isLight && { color: 'rgba(255,255,255,0.8)' }
          ]}>
            {item.content}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Mibu</Text>
        <Text style={styles.subtitle}>{t.appSubtitle}</Text>
      </View>

      {generalAnnouncements.length > 0 && (
        <Card style={styles.announcementCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="megaphone" size={24} color={MibuBrand.brown} />
            <Text style={styles.cardTitle}>{t.announcements}</Text>
          </View>
          <View style={styles.announcementContent}>
            {generalAnnouncements.map(item => renderAnnouncementItem(item, true))}
          </View>
        </Card>
      )}

      {flashEvents.length > 0 && (
        <Card style={styles.flashCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash" size={24} color="#ffffff" />
            <Text style={[styles.cardTitle, { color: '#ffffff' }]}>{t.flashEvents}</Text>
          </View>
          <View style={styles.announcementContent}>
            {flashEvents.map(item => renderAnnouncementItem(item, false))}
          </View>
        </Card>
      )}

      {holidayEvents.length > 0 && (
        <Card style={styles.holidayCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="gift" size={24} color="#ffffff" />
            <Text style={[styles.cardTitle, { color: '#ffffff' }]}>
              {isZh ? '節慶活動' : 'Holiday Events'}
            </Text>
          </View>
          <View style={styles.announcementContent}>
            {holidayEvents.map(item => renderAnnouncementItem(item, false))}
          </View>
        </Card>
      )}

      {/* 新版活動系統 - 節慶活動 */}
      {events.festivals.length > 0 && (
        <View style={styles.eventSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={22} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {isZh ? '節慶活動' : 'Festival Events'}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventScrollContent}
          >
            {events.festivals.map(event => renderEventCard(event, '#dc2626'))}
          </ScrollView>
        </View>
      )}

      {/* 新版活動系統 - 限時活動 */}
      {events.limitedEvents.length > 0 && (
        <View style={styles.eventSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={22} color={MibuBrand.brown} />
            <Text style={styles.sectionTitle}>
              {isZh ? '限時活動' : 'Limited Events'}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventScrollContent}
          >
            {events.limitedEvents.map(event => renderEventCard(event, '#7c3aed'))}
          </ScrollView>
        </View>
      )}

      {announcements.length === 0 && events.festivals.length === 0 && events.limitedEvents.length === 0 && (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyContent}>
            <Ionicons name="information-circle-outline" size={48} color={MibuBrand.copper} />
            <Text style={styles.emptyText}>
              {isZh ? '目前沒有公告' : 'No announcements'}
            </Text>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: MibuBrand.brown,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: MibuBrand.copper,
    marginTop: 4,
  },
  announcementCard: {
    backgroundColor: MibuBrand.highlight,
    borderWidth: 1,
    borderColor: MibuBrand.tan,
    marginBottom: 20,
    padding: 20,
  },
  flashCard: {
    backgroundColor: MibuBrand.brown,
    marginBottom: 20,
    padding: 20,
  },
  holidayCard: {
    backgroundColor: '#dc2626',
    marginBottom: 20,
    padding: 20,
  },
  emptyCard: {
    backgroundColor: MibuBrand.highlight,
    borderWidth: 1,
    borderColor: MibuBrand.tan,
    marginBottom: 20,
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: MibuBrand.copper,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  announcementContent: {
    gap: 12,
  },
  announcementItem: {
    gap: 4,
  },
  announcementText: {
    fontSize: 16,
    color: MibuBrand.brownDark,
    lineHeight: 24,
    fontWeight: '600',
  },
  announcementDescription: {
    fontSize: 14,
    color: MibuBrand.copper,
    lineHeight: 20,
    marginLeft: 12,
  },
  // 活動系統樣式
  eventSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  eventScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  eventCard: {
    width: SCREEN_WIDTH * 0.7,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 120,
  },
  eventCardContent: {
    padding: 14,
    gap: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  eventDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  eventDate: {
    fontSize: 11,
  },
});
