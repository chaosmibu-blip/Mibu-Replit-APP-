/**
 * ClaimPlaceScreen - 搜尋並認領現有景點
 */
import React, { useState } from 'react';
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
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { PlaceSearchResult } from '../../../types';

export default function ClaimPlaceScreen() {
  const { state, getToken } = useApp();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const isZh = state.language === 'zh-TW';

  const t = {
    title: isZh ? '認領店家' : 'Claim Place',
    subtitle: isZh ? '搜尋並認領您的店家' : 'Search and claim your place',
    searchPlaceholder: isZh ? '輸入店家名稱...' : 'Enter place name...',
    search: isZh ? '搜尋' : 'Search',
    claim: isZh ? '認領' : 'Claim',
    claimed: isZh ? '已認領' : 'Claimed',
    noResults: isZh ? '找不到符合的店家' : 'No matching places found',
    noResultsHint: isZh ? '試試其他關鍵字，或新增自有店家' : 'Try other keywords, or add your own place',
    addNewPlace: isZh ? '新增自有店家' : 'Add New Place',
    claimSuccess: isZh ? '認領成功！' : 'Claimed successfully!',
    claimFailed: isZh ? '認領失敗' : 'Claim failed',
    searchHint: isZh ? '輸入店家名稱開始搜尋' : 'Enter place name to search',
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      setHasSearched(true);
      const token = await getToken();
      if (!token) {
        router.push('/login');
        return;
      }
      const data = await apiService.searchMerchantPlaces(token, searchQuery);
      setSearchResults(data.places || []);
    } catch (error: unknown) {
      console.error('Search failed:', error);
      if (error.message === 'UNAUTHORIZED') {
        router.push('/login');
        return;
      }
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '搜尋失敗' : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleClaim = async (place: PlaceSearchResult) => {
    try {
      setClaiming(place.placeId);
      const token = await getToken();
      if (!token) return;
      await apiService.claimMerchantPlace(token, {
        placeName: place.placeName,
        district: place.district,
        city: place.city,
        country: '台灣',
        placeCacheId: String(place.id),
        googlePlaceId: place.placeId,
      });
      Alert.alert(isZh ? '成功' : 'Success', t.claimSuccess, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Claim failed:', error);
      Alert.alert(isZh ? '錯誤' : 'Error', t.claimFailed);
    } finally {
      setClaiming(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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

        {/* Search Box */}
        <View style={styles.searchBox}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#94a3b8"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={searching || !searchQuery.trim()}
          >
            {searching ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.searchButtonText}>{t.search}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {!hasSearched ? (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>{t.searchHint}</Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>{t.noResults}</Text>
            <Text style={styles.emptySubtitle}>{t.noResultsHint}</Text>
            <TouchableOpacity
              style={styles.addNewButton}
              onPress={() => router.push('/merchant/new-place' as any)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#6366f1" />
              <Text style={styles.addNewButtonText}>{t.addNewPlace}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {searchResults.map((place) => (
              <View key={place.placeId} style={styles.placeCard}>
                <View style={styles.placeIcon}>
                  <Ionicons name="location" size={24} color="#6366f1" />
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.placeName}</Text>
                  <Text style={styles.placeLocation}>
                    {[place.district, place.city].filter(Boolean).join(', ')}
                  </Text>
                </View>
                {place.isClaimed ? (
                  <View style={styles.claimedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#64748b" />
                    <Text style={styles.claimedText}>{t.claimed}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => handleClaim(place)}
                    disabled={claiming === place.placeId}
                  >
                    {claiming === place.placeId ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.claimButtonText}>{t.claim}</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
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
    paddingBottom: 40,
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
  searchBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  searchButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#c7d2fe',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
  },
  addNewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  resultsList: {
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
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  claimedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  claimButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#6366f1',
    borderRadius: 20,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
