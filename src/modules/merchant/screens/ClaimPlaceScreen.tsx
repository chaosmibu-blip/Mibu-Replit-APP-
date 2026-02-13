/**
 * ClaimPlaceScreen - 搜尋並認領現有景點
 *
 * 更新日期：2026-02-12（Phase 3 遷移至 React Query）
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
import { useI18n } from '../../../context/I18nContext';
import {
  useSearchMerchantPlaces,
  useClaimMerchantPlace,
} from '../../../hooks/useMerchantQueries';
import { PlaceSearchResult } from '../../../types';
import { MibuBrand, UIColors } from '../../../../constants/Colors';

export function ClaimPlaceScreen() {
  const { getToken } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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
      // 401 未授權：Token 過期或無效，導回登入頁
      if ((error as any)?.status === 401) {
        router.push('/login');
        return;
      }
      Alert.alert(t.common_error, t.merchant_searchFailed);
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
      Alert.alert(t.common_success, t.merchant_claimSuccess, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Claim failed:', error);
      Alert.alert(t.common_error, t.merchant_claimFailed);
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="返回">
            <Ionicons name="arrow-back" size={24} color={MibuBrand.dark} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t.merchant_claimTitle}</Text>
            <Text style={styles.subtitle}>{t.merchant_claimSubtitle}</Text>
          </View>
        </View>

        {/* Search Box */}
        <View style={styles.searchBox}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={UIColors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t.merchant_searchPlaceholder}
              placeholderTextColor={UIColors.textSecondary}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={searching || !searchQuery.trim()}
            accessibilityLabel="搜尋"
          >
            {searching ? (
              <ActivityIndicator size="small" color={UIColors.white} />
            ) : (
              <Text style={styles.searchButtonText}>{t.common_search}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {!hasSearched ? (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>{t.merchant_searchHint}</Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>{t.merchant_noSearchResults}</Text>
            <Text style={styles.emptySubtitle}>{t.merchant_noResultsHint}</Text>
            <TouchableOpacity
              style={styles.addNewButton}
              onPress={() => router.push('/merchant/new-place' as any)}
              accessibilityLabel="新增自有店家"
            >
              <Ionicons name="add-circle-outline" size={20} color={MibuBrand.brown} />
              <Text style={styles.addNewButtonText}>{t.merchant_addNewPlace}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {searchResults.map((place) => (
              <View key={place.placeId} style={styles.placeCard}>
                <View style={styles.placeIcon}>
                  <Ionicons name="location" size={24} color={MibuBrand.brown} />
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.placeName}</Text>
                  <Text style={styles.placeLocation}>
                    {[place.district, place.city].filter(Boolean).join(', ')}
                  </Text>
                </View>
                {place.isClaimed ? (
                  <View style={styles.claimedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={UIColors.textSecondary} />
                    <Text style={styles.claimedText}>{t.merchant_claimed}</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={() => handleClaim(place)}
                    disabled={claiming === place.placeId}
                    accessibilityLabel={`認領 ${place.placeName}`}
                  >
                    {claiming === place.placeId ? (
                      <ActivityIndicator size="small" color={UIColors.white} />
                    ) : (
                      <Text style={styles.claimButtonText}>{t.merchant_claim}</Text>
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
    backgroundColor: MibuBrand.warmWhite,
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
    backgroundColor: UIColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.dark,
  },
  subtitle: {
    fontSize: 14,
    color: UIColors.textSecondary,
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
    backgroundColor: UIColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: MibuBrand.dark,
  },
  searchButton: {
    backgroundColor: MibuBrand.brown,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: MibuBrand.cream,
  },
  searchButtonText: {
    color: UIColors.white,
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
    color: UIColors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: UIColors.textSecondary,
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
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 12,
  },
  addNewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.brown,
  },
  resultsList: {
    gap: 12,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UIColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: MibuBrand.creamLight,
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
    color: MibuBrand.dark,
    marginBottom: 4,
  },
  placeLocation: {
    fontSize: 13,
    color: UIColors.textSecondary,
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
    color: UIColors.textSecondary,
  },
  claimButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: MibuBrand.brown,
    borderRadius: 20,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: UIColors.white,
  },
});
