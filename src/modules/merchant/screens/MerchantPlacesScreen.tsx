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
import { useApp } from '../../../context/AppContext';
import { apiService } from '../../../services/api';
import { MerchantPlace, PlaceSearchResult } from '../../../types';
import { MibuBrand } from '../../../../constants/Colors';

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

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'approved':
        return { bg: '#dcfce7', color: '#16a34a', text: isZh ? '已核准' : 'Approved' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#dc2626', text: isZh ? '已拒絕' : 'Rejected' };
      default:
        return { bg: '#fef3c7', color: '#d97706', text: isZh ? '待審核' : 'Pending' };
    }
  };

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
    approved: isZh ? '已核准' : 'Approved',
    rejected: isZh ? '已拒絕' : 'Rejected',
    edit: isZh ? '編輯' : 'Edit',
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
      Alert.alert(isZh ? '錯誤' : 'Error', isZh ? '搜尋失敗，請稍後再試' : 'Search failed, please try again');
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
        <ActivityIndicator size="large" color={MibuBrand.brown} />
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
          <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{translations.title}</Text>
      </View>

      {!showSearch ? (
        <>
          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => setShowSearch(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color={MibuBrand.warmWhite} />
            <Text style={styles.claimButtonText}>{translations.claimNew}</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>{translations.myPlaces}</Text>

          {places.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="storefront-outline" size={48} color={MibuBrand.tan} />
              <Text style={styles.emptyText}>{translations.noPlaces}</Text>
            </View>
          ) : (
            <View style={styles.placesList}>
              {places.map(place => {
                const statusConfig = getStatusConfig(place.status);
                return (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.placeCard}
                    onPress={() => router.push(`/merchant/place/${place.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.placeIcon}>
                      <Ionicons name="storefront" size={24} color={MibuBrand.brown} />
                    </View>
                    <View style={styles.placeInfo}>
                      <Text style={styles.placeName}>{place.placeName}</Text>
                      <Text style={styles.placeLocation}>
                        {place.district ? `${place.district}, ` : ''}{place.city || ''}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.text}
                      </Text>
                    </View>
                    <View style={styles.editIcon}>
                      <Ionicons name="chevron-forward" size={20} color={MibuBrand.tan} />
                    </View>
                  </TouchableOpacity>
                );
              })}
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
                placeholderTextColor={MibuBrand.tan}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                disabled={searching}
              >
                {searching ? (
                  <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
                ) : (
                  <Ionicons name="search" size={20} color={MibuBrand.warmWhite} />
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
              <Ionicons name="search-outline" size={48} color={MibuBrand.tan} />
              <Text style={styles.emptyText}>{translations.noResults}</Text>
            </View>
          ) : (
            <View style={styles.placesList}>
              {searchResults.map(result => (
                <View key={result.placeId} style={styles.placeCard}>
                  <View style={styles.placeIcon}>
                    <Ionicons name="location" size={24} color={MibuBrand.brown} />
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
                      onPress={() => handleClaim(result)}
                      disabled={claiming === result.placeId}
                    >
                      {claiming === result.placeId ? (
                        <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
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
    backgroundColor: MibuBrand.creamLight,
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
    color: MibuBrand.copper,
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
    backgroundColor: MibuBrand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.brownDark,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: MibuBrand.brown,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  emptyText: {
    fontSize: 16,
    color: MibuBrand.copper,
    marginTop: 12,
  },
  placesList: {
    gap: 12,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: MibuBrand.highlight,
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
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  placeLocation: {
    fontSize: 13,
    color: MibuBrand.copper,
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
  editIcon: {
    marginLeft: 8,
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
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    color: MibuBrand.brownDark,
  },
  searchButton: {
    width: 52,
    backgroundColor: MibuBrand.brown,
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
    color: MibuBrand.copper,
  },
  claimedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: MibuBrand.tanLight,
  },
  claimedText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  claimBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: MibuBrand.brown,
  },
  claimBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
});
