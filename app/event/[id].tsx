/**
 * 活動詳情頁面（動態路由）
 *
 * 路由參數：id - 活動 ID
 * 對應後端 sync-app.md #006
 *
 * 功能：
 * - 顯示活動的詳細資訊（標題、日期、地點、說明）
 * - 支援多語系內容
 * - 活動類型標籤（公告、節慶、限時活動）
 * - 外部連結開啟
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { eventApi } from '../../src/services/api';
import { Event } from '../../src/types';
import { MibuBrand } from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EVENT_TYPE_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; label: { zh: string; en: string } }> = {
  announcement: { icon: 'megaphone', color: MibuBrand.brown, label: { zh: '公告', en: 'Announcement' } },
  festival: { icon: 'calendar', color: '#dc2626', label: { zh: '節慶活動', en: 'Festival' } },
  limited: { icon: 'time', color: '#7c3aed', label: { zh: '限時活動', en: 'Limited Event' } },
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state } = useApp();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const isZh = state.language === 'zh-TW';

  useEffect(() => {
    if (id) {
      loadEvent(parseInt(id, 10));
    }
  }, [id]);

  const loadEvent = async (eventId: number) => {
    try {
      setLoading(true);
      const response = await eventApi.getEventById(eventId);
      if (response?.event) {
        setEvent(response.event);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedTitle = (): string => {
    if (!event) return '';
    if (state.language === 'zh-TW') return event.title;
    if (state.language === 'en' && event.titleEn) return event.titleEn;
    if (state.language === 'ja' && event.titleJa) return event.titleJa;
    if (state.language === 'ko' && event.titleKo) return event.titleKo;
    return event.title;
  };

  const getLocalizedDesc = (): string => {
    if (!event) return '';
    if (state.language === 'zh-TW') return event.description;
    if (state.language === 'en' && event.descriptionEn) return event.descriptionEn;
    if (state.language === 'ja' && event.descriptionJa) return event.descriptionJa;
    if (state.language === 'ko' && event.descriptionKo) return event.descriptionKo;
    return event.description;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(state.language === 'zh-TW' ? 'zh-TW' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleExternalLink = () => {
    if (event?.externalUrl) {
      Linking.openURL(event.externalUrl).catch(() => {});
    }
  };

  const typeConfig = event ? EVENT_TYPE_CONFIG[event.type] : null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={MibuBrand.brown} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={64} color={MibuBrand.copper} />
        <Text style={styles.errorText}>
          {isZh ? '找不到此活動' : 'Event not found'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>
            {isZh ? '返回' : 'Go Back'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {getLocalizedTitle()}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Banner Image */}
        {(event.bannerUrl || event.imageUrl) && (
          <Image
            source={{ uri: event.bannerUrl || event.imageUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        )}

        {/* Event Type Badge */}
        {typeConfig && (
          <View style={[styles.typeBadge, { backgroundColor: typeConfig.color }]}>
            <Ionicons name={typeConfig.icon} size={14} color="#ffffff" />
            <Text style={styles.typeBadgeText}>
              {isZh ? typeConfig.label.zh : typeConfig.label.en}
            </Text>
          </View>
        )}

        {/* Title */}
        <Text style={styles.title}>{getLocalizedTitle()}</Text>

        {/* Date Info */}
        <View style={styles.dateSection}>
          <Ionicons name="calendar-outline" size={18} color={MibuBrand.copper} />
          <Text style={styles.dateText}>
            {formatDate(event.startDate)}
            {event.endDate && ` ~ ${formatDate(event.endDate)}`}
          </Text>
        </View>

        {/* Location */}
        {(event.city || event.location) && (
          <View style={styles.locationSection}>
            <Ionicons name="location-outline" size={18} color={MibuBrand.copper} />
            <Text style={styles.locationText}>
              {[event.city, event.location].filter(Boolean).join(' · ')}
            </Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionLabel}>
            {isZh ? '活動說明' : 'Description'}
          </Text>
          <Text style={styles.descriptionText}>{getLocalizedDesc()}</Text>
        </View>

        {/* External Link */}
        {event.externalUrl && (
          <TouchableOpacity style={styles.externalLinkButton} onPress={handleExternalLink}>
            <Ionicons name="open-outline" size={20} color="#ffffff" />
            <Text style={styles.externalLinkText}>
              {isZh ? '查看更多' : 'Learn More'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MibuBrand.creamLight,
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    color: MibuBrand.copper,
  },
  backButton: {
    backgroundColor: MibuBrand.brown,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: MibuBrand.creamLight,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  headerBackButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: MibuBrand.warmWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  bannerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.56,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: MibuBrand.brownDark,
    marginHorizontal: 20,
    marginTop: 16,
    lineHeight: 32,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
  },
  dateText: {
    fontSize: 14,
    color: MibuBrand.copper,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: MibuBrand.copper,
  },
  descriptionSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: MibuBrand.dark,
    lineHeight: 24,
  },
  externalLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  externalLinkText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
