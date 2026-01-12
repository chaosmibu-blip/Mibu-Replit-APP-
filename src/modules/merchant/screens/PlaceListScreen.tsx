/**
 * PlaceListScreen - 已認領景點列表
 */
import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { MerchantPlace } from '../../../types';

export default function PlaceListScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const isZh = state.language === 'zh-TW';

  const [places, setPlaces] = useState<MerchantPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const t = {
    title: isZh ? '我的店家' : 'My Places',
    subtitle: isZh ? '管理您認領的店家' : 'Manage your claimed places',
    noPlaces: isZh ? '尚未認領任何店家' : 'No places claimed yet',
    noPlacesHint: isZh ? '開始認領或新增您的店家' : 'Start claiming or adding your places',
    claimPlace: isZh ? '認領現有店家' : 'Claim Existing Place',
    addPlace: isZh ? '新增自有店家' : 'Add New Place',
    verified: isZh ? '已驗證' : 'Verified',
    pending: isZh ? '待驗證' : 'Pending',
    loading: isZh ? '載入中...' : 'Loading...',
    placesCount: (n: number) => isZh ? `共 ${n} 間店家` : `${n} place${n !== 1 ? 's' : ''}`,
  };

  const loadPlaces = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const token = await getToken();
      if (!token) return;

      const data = await apiService.getMerchantPlaces(token);
      setPlaces(data.places || []);
    } catch (error) {
      console.error('Failed to load places:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  // 從其他頁面返回時重新載入
  useFocusEffect(
    useCallback(() => {
      loadPlaces();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadPlaces(true)} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/merchant/claim-place' as any)}
        >
          <Ionicons name="search" size={20} color="#6366f1" />
          <Text style={styles.actionButtonText}>{t.claimPlace}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push('/merchant/new-place' as any)}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={[styles.actionButtonText, styles.actionButtonTextPrimary]}>{t.addPlace}</Text>
        </TouchableOpacity>
      </View>

      {/* Places List */}
      {places.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="storefront-outline" size={48} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>{t.noPlaces}</Text>
          <Text style={styles.emptySubtitle}>{t.noPlacesHint}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.countText}>{t.placesCount(places.length)}</Text>
          <View style={styles.placesList}>
            {places.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeCard}
                onPress={() => router.push(`/merchant/place/${place.linkId}` as any)}
              >
                <View style={styles.placeIcon}>
                  <Ionicons name="storefront" size={24} color="#6366f1" />
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.placeName}</Text>
                  <Text style={styles.placeLocation}>
                    {[place.district, place.city].filter(Boolean).join(', ')}
                  </Text>
                </View>
                <View style={styles.placeRight}>
                  <View
                    style={[
                      styles.statusBadge,
                      place.isVerified ? styles.verifiedBadge : styles.pendingBadge,
                    ]}
                  >
                    <Ionicons
                      name={place.isVerified ? 'checkmark-circle' : 'time'}
                      size={14}
                      color={place.isVerified ? '#16a34a' : '#d97706'}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        place.isVerified ? styles.verifiedText : styles.pendingText,
                      ]}
                    >
                      {place.isVerified ? t.verified : t.pending}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
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
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  actionButtonPrimary: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  actionButtonTextPrimary: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  countText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  placesList: {
    gap: 12,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  placeLocation: {
    fontSize: 13,
    color: '#64748b',
  },
  placeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedText: {
    color: '#16a34a',
  },
  pendingText: {
    color: '#d97706',
  },
});
