/**
 * MerchantPlacesScreen - 地點管理
 *
 * 功能說明：
 * - 顯示商家已認領的店家列表
 * - 支援搜尋並認領新店家
 * - 顯示店家審核狀態（待審核/已核准/已拒絕）
 *
 * 串接的 API：
 * - GET /merchant/places - 取得已認領店家列表
 * - GET /merchant/places/search - 搜尋可認領店家
 * - POST /merchant/places/claim - 認領店家
 */
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
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { ErrorState } from '../../shared/components/ui/ErrorState';

// ============ 主元件 ============
export function MerchantPlacesScreen() {
  // ============ Hooks ============
  const { state, t, getToken } = useApp();
  const router = useRouter();

  // ============ 狀態變數 ============
  // places: 已認領的店家列表
  const [places, setPlaces] = useState<MerchantPlace[]>([]);
  // searchResults: 搜尋結果列表
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  // searchQuery: 搜尋關鍵字
  const [searchQuery, setSearchQuery] = useState('');
  // loading: 初始載入狀態
  const [loading, setLoading] = useState(true);
  // searching: 搜尋中狀態
  const [searching, setSearching] = useState(false);
  // claiming: 正在認領的店家 placeId
  const [claiming, setClaiming] = useState<string | null>(null);
  // showSearch: 是否顯示搜尋模式
  const [showSearch, setShowSearch] = useState(false);
  // loadError: API 載入錯誤狀態
  const [loadError, setLoadError] = useState(false);

  // ============ 工具函數 ============

  /**
   * getStatusConfig - 取得狀態標籤配置
   * @param status - 審核狀態
   * @returns 背景色、文字色、標籤文字
   */
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'approved':
        return { bg: SemanticColors.successLight, color: SemanticColors.successDark, text: t.common_approved };
      case 'rejected':
        return { bg: SemanticColors.errorLight, color: SemanticColors.errorDark, text: t.common_rejected };
      default:
        return { bg: SemanticColors.warningLight, color: SemanticColors.warningDark, text: t.common_pending };
    }
  };

  // ============ 多語系翻譯（透過 t 字典） ============
  const translations = {
    title: t.merchant_placeManagement,
    myPlaces: t.merchant_myPlaces,
    noPlaces: t.merchant_noPlaces,
    claimNew: t.merchant_claimNew,
    search: t.merchant_searchPlaceholder,
    searchBtn: t.common_search,
    claim: t.merchant_claimNew,
    claimed: t.merchant_claimed,
    verified: t.common_verified,
    pending: t.common_pending,
    approved: t.common_approved,
    rejected: t.common_rejected,
    edit: t.common_edit,
    noResults: t.merchant_noSearchResults,
    loading: t.loading,
    cancel: t.cancel,
    claimSuccess: t.merchant_claimSuccess,
    claimFailed: t.merchant_claimFailed,
    back: t.common_back,
  };

  // ============ Effect Hooks ============
  // 元件載入時取得店家列表
  useEffect(() => {
    loadPlaces();
  }, []);

  // ============ 資料載入函數 ============

  /**
   * loadPlaces - 載入已認領的店家列表
   */
  const loadPlaces = async () => {
    try {
      setLoadError(false);
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getMerchantPlaces(token);
      setPlaces(data.places || []);
    } catch (error) {
      console.error('Failed to load places:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  // ============ 事件處理函數 ============

  /**
   * handleSearch - 執行搜尋
   */
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
      // 401 未授權：Token 過期或無效，導回登入頁
      if ((error as any)?.status === 401) {
        router.push('/login');
        return;
      }
      Alert.alert(t.common_error, t.merchant_searchFailedRetry);
    } finally {
      setSearching(false);
    }
  };

  /**
   * handleClaim - 認領店家
   * @param place - 要認領的店家搜尋結果
   */
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
      Alert.alert(t.common_success, translations.claimSuccess);
      // 認領成功後返回列表模式並重新載入
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      loadPlaces();
    } catch (error) {
      console.error('Claim failed:', error);
      Alert.alert(t.common_error, translations.claimFailed);
    } finally {
      setClaiming(null);
    }
  };

  // ============ 載入中畫面 ============
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MibuBrand.brown} />
        <Text style={styles.loadingText}>{translations.loading}</Text>
      </View>
    );
  }

  // ============ 錯誤狀態畫面 ============
  if (loadError && places.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ErrorState
          icon="cloud-offline-outline"
          message={t.merchant_loadPlacesFailed}
          detail={t.merchant_checkConnection}
          onRetry={loadPlaces}
        />
      </View>
    );
  }

  // ============ 主要 JSX 渲染 ============
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ============ 頂部標題區 ============ */}
        <View style={styles.header}>
          {/* 返回按鈕 */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="返回">
            <Ionicons name="arrow-back" size={24} color={MibuBrand.brownDark} />
          </TouchableOpacity>
          <Text style={styles.title}>{translations.title}</Text>
        </View>

        {/* ============ 列表模式 ============ */}
        {!showSearch ? (
          <>
            {/* 認領新店家按鈕 */}
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => setShowSearch(true)}
              accessibilityLabel="認領新店家"
            >
              <Ionicons name="add-circle-outline" size={24} color={MibuBrand.warmWhite} />
              <Text style={styles.claimButtonText}>{translations.claimNew}</Text>
            </TouchableOpacity>

            {/* 區塊標題 */}
            <Text style={styles.sectionTitle}>{translations.myPlaces}</Text>

            {/* 店家列表或空狀態 */}
            {places.length === 0 ? (
              // 空狀態
              <EmptyState
                icon="location-outline"
                title={translations.noPlaces}
              />
            ) : (
              // 店家卡片列表
              <View style={styles.placesList}>
                {places.map(place => {
                  const statusConfig = getStatusConfig(place.status);
                  return (
                    <TouchableOpacity
                      key={place.id}
                      style={styles.placeCard}
                      onPress={() => router.push(`/merchant/place/${place.id}`)}
                      activeOpacity={0.7}
                      accessibilityLabel={`查看 ${place.placeName}`}
                    >
                      {/* 店家圖示 */}
                      <View style={styles.placeIcon}>
                        <Ionicons name="storefront" size={24} color={MibuBrand.brown} />
                      </View>
                      {/* 店家資訊 */}
                      <View style={styles.placeInfo}>
                        <Text style={styles.placeName}>{place.placeName}</Text>
                        <Text style={styles.placeLocation}>
                          {place.district ? `${place.district}, ` : ''}{place.city || ''}
                        </Text>
                      </View>
                      {/* 審核狀態標籤 */}
                      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                          {statusConfig.text}
                        </Text>
                      </View>
                      {/* 右箭頭 */}
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
          // ============ 搜尋模式 ============
          <>
            {/* 搜尋區塊 */}
            <View style={styles.searchSection}>
              {/* 搜尋輸入框與按鈕 */}
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
                  accessibilityLabel="搜尋"
                >
                  {searching ? (
                    <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
                  ) : (
                    <Ionicons name="search" size={20} color={MibuBrand.warmWhite} />
                  )}
                </TouchableOpacity>
              </View>
              {/* 取消按鈕 */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                accessibilityLabel="取消搜尋"
              >
                <Text style={styles.cancelButtonText}>{translations.cancel}</Text>
              </TouchableOpacity>
            </View>

            {/* 搜尋結果列表 */}
            {searchResults.length === 0 && searchQuery && !searching ? (
              // 無搜尋結果
              <View style={styles.emptyCard}>
                <Ionicons name="search-outline" size={48} color={MibuBrand.tan} />
                <Text style={styles.emptyText}>{translations.noResults}</Text>
              </View>
            ) : (
              // 搜尋結果卡片列表
              <View style={styles.placesList}>
                {searchResults.map(result => (
                  <View key={result.placeId} style={styles.placeCard}>
                    {/* 位置圖示 */}
                    <View style={styles.placeIcon}>
                      <Ionicons name="location" size={24} color={MibuBrand.brown} />
                    </View>
                    {/* 店家資訊 */}
                    <View style={styles.placeInfo}>
                      <Text style={styles.placeName}>{result.placeName}</Text>
                      <Text style={styles.placeLocation}>
                        {result.district ? `${result.district}, ` : ''}{result.city || ''}
                      </Text>
                    </View>
                    {/* 已認領標籤或認領按鈕 */}
                    {result.isClaimed ? (
                      <View style={styles.claimedBadge}>
                        <Text style={styles.claimedText}>{translations.claimed}</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.claimBadge}
                        onPress={() => handleClaim(result)}
                        disabled={claiming === result.placeId}
                        accessibilityLabel={`認領 ${result.placeName}`}
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

// ============ 樣式定義 ============
const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  // 內容區
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  // 載入中容器
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 載入中文字
  loadingText: {
    marginTop: 12,
    color: MibuBrand.copper,
    fontSize: 16,
  },
  // 頂部標題區
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  // 返回按鈕
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
  // 頁面標題
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: MibuBrand.brownDark,
  },
  // 認領新店家按鈕
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
  // 認領按鈕文字
  claimButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
  // 區塊標題
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 16,
  },
  // 空狀態卡片
  emptyCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 空狀態文字
  emptyText: {
    fontSize: 16,
    color: MibuBrand.copper,
    marginTop: 12,
  },
  // 店家列表
  placesList: {
    gap: 12,
  },
  // 店家卡片
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 店家圖示容器
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: MibuBrand.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  // 店家資訊區
  placeInfo: {
    flex: 1,
  },
  // 店家名稱
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 4,
  },
  // 店家位置
  placeLocation: {
    fontSize: 13,
    color: MibuBrand.copper,
  },
  // 狀態標籤
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  // 已驗證標籤（未使用但保留）
  verifiedBadge: {
    backgroundColor: SemanticColors.successLight,
  },
  // 待驗證標籤（未使用但保留）
  pendingBadge: {
    backgroundColor: SemanticColors.warningLight,
  },
  // 狀態標籤文字
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // 已驗證文字（未使用但保留）
  verifiedText: {
    color: SemanticColors.successDark,
  },
  // 待驗證文字（未使用但保留）
  pendingText: {
    color: SemanticColors.warningDark,
  },
  // 編輯圖示容器
  editIcon: {
    marginLeft: 8,
  },
  // 搜尋區塊
  searchSection: {
    marginBottom: 20,
    gap: 12,
  },
  // 搜尋輸入容器
  searchInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  // 搜尋輸入框
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
  // 搜尋按鈕
  searchButton: {
    width: 52,
    backgroundColor: MibuBrand.brown,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 取消按鈕
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  // 取消按鈕文字
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  // 已認領標籤
  claimedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: MibuBrand.tanLight,
  },
  // 已認領文字
  claimedText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  // 認領按鈕
  claimBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: MibuBrand.brown,
  },
  // 認領按鈕文字
  claimBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
});
