import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';
import { Card } from '../components/ui/Card';
import { MibuBrand } from '../../../../constants/Colors';
import { Announcement } from '../../../types';
import { apiService } from '../../../services/api';

export function HomeScreen() {
  const { t, state } = useApp();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const isZh = state.language === 'zh-TW';

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnnouncements();
      setAnnouncements(response.announcements || []);
    } catch (error) {
      console.log('Failed to load announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
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

      {announcements.length === 0 && (
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
});
