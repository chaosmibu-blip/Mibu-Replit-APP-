import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { MerchantPlace, PlaceSearchResult } from '../types';

export function MerchantPlacesScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [places, setPlaces] = useState<MerchantPlace[]>([]);
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const isZh = state.language === 'zh-TW';

  const translations = {
    title: isZh ? '店家管理' : 'Place Management',
    myPlaces: isZh ? '我的店家' : 'My Places',
    noPlaces: isZh ? '尚未認領任何店家' : 'No places claimed yet',
    claimNew: isZh ? '認領新店家' : 'Claim New Place',
    search: isZh ? '搜尋店家名稱...' : 'Search place name...',
    searchBtn: isZh ? '搜尋' : 'Search',
    claim: isZh ? '認領' : 'Claim',
    claimed: isZh ? '已認領' : 'Claimed',
    verified: isZh ? '已驗證' : 'Verified',
    pending: isZh ? '待驗證' : 'Pending',
    noResults: isZh ? '找不到符合的店家' : 'No matching places found',
    loading: isZh ? '載入中...' : 'Loading...',
    cancel: isZh ? '取消' : 'Cancel',
    claimSuccess: isZh ? '認領成功！' : 'Claimed successfully!',
    claimFailed: isZh ? '認領失敗' : 'Claim failed',
    back: isZh ? '返回' : 'Back',
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getMerchantPlaces(token);
      setPlaces(data.places || []);
    } catch (error) {
      console.error('Failed to load places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const token = await getToken();
      if (!token) return;
      const data = await apiService.searchMerchantPlaces(token, searchQuery);
      setSearchResults(data.places || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleClaim = async (placeId: string) => {
    try {
      setClaiming(placeId);
      const token = await getToken();
      if (!token) return;
      await apiService.claimMerchantPlace(token, placeId);
      Alert.alert(isZh ? '成功' : 'Success', translations.claimSuccess);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      loadPlaces();
    } catch (error) {
      console.error('Claim failed:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', translations.claimFailed);
    } finally {
      setClaiming(null);
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      {!showSearch ? (
        <>
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => setShowSearch(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
            <Text style={styles.claimButtonText}>{translations.claimNew}</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>{translations.myPlaces}</Text>

          {places.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="storefront-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>{translations.noPlaces}</Text>
            </View>
          ) : (
            <View style={styles.placesList}>
              {places.map(place => (
                <View key={place.id} style={styles.placeCard}>
                  <View style={styles.placeIcon}>
                    <Ionicons name="storefront" size={24} color="#6366f1" />
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{place.placeName}</Text>
                    <Text style={styles.placeLocation}>
                      {place.district ? `${place.district}, ` : ''}{place.city || ''}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    place.isVerified ? styles.verifiedBadge : styles.pendingBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      place.isVerified ? styles.verifiedText : styles.pendingText
                    ]}>
                      {place.isVerified ? translations.verified : translations.pending}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <>
          <View style={styles.searchSection}>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={translations.search}
                placeholderTextColor="#94a3b8"
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                disabled={searching}
              >
                {searching ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="search" size={20} color="#ffffff" />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowSearch(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
            </TouchableOpacity>
          </View>

          {searchResults.length === 0 && searchQuery && !searching ? (
            <View style={styles.emptyCard}>
              <Ionicons name="search-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>{translations.noResults}</Text>
            </View>
          ) : (
            <View style={styles.placesList}>
              {searchResults.map(result => (
                <View key={result.placeId} style={styles.placeCard}>
                  <View style={styles.placeIcon}>
                    <Ionicons name="location" size={24} color="#6366f1" />
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{result.placeName}</Text>
                    <Text style={styles.placeLocation}>
                      {result.district ? `${result.district}, ` : ''}{result.city || ''}
                    </Text>
                  </View>
                  {result.isClaimed ? (
                    <View style={styles.claimedBadge}>
                      <Text style={styles.claimedText}>{translations.claimed}</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.claimBadge}
                      onPress={() => handleClaim(result.placeId)}
                      disabled={claiming === result.placeId}
                    >
                      {claiming === result.placeId ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.claimBadgeText}>{translations.claim}</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </>
      )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
  searchSection: {
    marginBottom: 20,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    color: '#1e293b',
  },
  searchButton: {
    width: 52,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  claimedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  claimedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  claimBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#6366f1',
  },
  claimBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});
