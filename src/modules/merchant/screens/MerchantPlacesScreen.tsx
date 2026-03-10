/**
 * ============================================================
 * MerchantPlacesScreen - 地點管理（#074 對齊新 API）
 * ============================================================
 * 功能說明：
 * - 顯示商家已認領的店家列表
 * - 支援搜尋並認領新店家
 * - 顯示店家審核狀態（待審核/已核准/已拒絕）
 *
 * 串接的 API：
 * - GET /api/merchant/places - 取得已認領店家列表
 * - POST /api/merchant/places/search - 搜尋可認領店家
 * - POST /api/merchant/places/claim - 認領店家
 *
 * 更新日期：2026-03-10（#074 商家後台完整重做）
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
  useMerchantPlaces,
  useSearchPlaces,
  useClaimPlace,
} from '../../../hooks/useMerchantQueries';
import { MerchantPlace, PlaceSearchResult } from '../../../types';
import { MibuBrand, SemanticColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { ErrorState } from '../../shared/components/ui/ErrorState';

// ============ 主元件 ============
export function MerchantPlacesScreen() {
  // ============ Hooks ============
  const { t } = useI18n();
  const router = useRouter();

  // ============ React Query：已認領店家列表 ============
  const {
    data: placesData,
    isLoading,
    isError: loadError,
    refetch: refetchPlaces,
  } = useMerchantPlaces();

  // 從 API 回傳取出店家列表，預設空陣列
  const places: MerchantPlace[] = placesData?.places ?? [];

  // ============ React Query：搜尋與認領 Mutations ============
  const searchMutation = useSearchPlaces();
  const claimMutation = useClaimPlace();

  // ============ 本地 UI 狀態 ============
  // searchResults: 搜尋結果列表
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  // searchQuery: 搜尋關鍵字
  const [searchQuery, setSearchQuery] = useState('');
  // claiming: 正在認領的店家 id（用於個別按鈕 loading 狀態）
  const [claiming, setClaiming] = useState<number | null>(null);
  // showSearch: 是否顯示搜尋模式
  const [showSearch, setShowSearch] = useState(false);

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

  // ============ 事件處理函數 ============

  /**
   * handleSearch - 執行搜尋（透過 mutation）
   */
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    searchMutation.mutate({ query: searchQuery }, {
      onSuccess: (data) => {
        setSearchResults(data.places ?? []);
      },
      onError: (error: any) => {
        console.error('Search failed:', error);
        // 401 未授權：Token 過期或無效，導回登入頁
        if (error?.status === 401) {
          router.push('/login');
          return;
        }
        Alert.alert(t.common_error, t.merchant_searchFailedRetry);
      },
    });
  };

  /**
   * handleClaim - 認領店家（透過 mutation）
   * @param place - 要認領的店家搜尋結果
   */
  const handleClaim = (place: PlaceSearchResult) => {
    setClaiming(place.id);
    claimMutation.mutate(
      {
        placeName: place.placeName,
        district: place.district,
        city: place.city,
        country: place.country,
        placeCacheId: place.id,
      },
      {
        onSuccess: () => {
          Alert.alert(t.common_success, translations.claimSuccess);
          // 認領成功後返回列表模式（React Query 的 onSuccess 已自動 invalidate places）
          setShowSearch(false);
          setSearchQuery('');
          setSearchResults([]);
          setClaiming(null);
        },
        onError: (error) => {
          console.error('Claim failed:', error);
          Alert.alert(t.common_error, translations.claimFailed);
          setClaiming(null);
        },
      },
    );
  };

  // ============ 載入中畫面 ============
  if (isLoading) {
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
          onRetry={() => refetchPlaces()}
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

        {/* ============ 錯誤橫幅（有資料但刷新失敗） ============ */}
        {loadError && places.length > 0 && (
          <TouchableOpacity
            style={styles.errorBanner}
            onPress={() => refetchPlaces()}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle-outline" size={18} color={SemanticColors.errorDark} />
            <Text style={styles.errorBannerText}>{t.common_loadFailed}</Text>
            <Ionicons name="refresh" size={16} color={SemanticColors.errorDark} />
          </TouchableOpacity>
        )}

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
                  disabled={searchMutation.isPending}
                  accessibilityLabel="搜尋"
                >
                  {searchMutation.isPending ? (
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
            {searchResults.length === 0 && searchQuery && !searchMutation.isPending ? (
              // 無搜尋結果
              <View style={styles.emptyCard}>
                <Ionicons name="search-outline" size={48} color={MibuBrand.tan} />
                <Text style={styles.emptyText}>{translations.noResults}</Text>
              </View>
            ) : (
              // 搜尋結果卡片列表
              <View style={styles.placesList}>
                {searchResults.map(result => (
                  <View key={result.id} style={styles.placeCard}>
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
                    {/* 認領按鈕 */}
                    <TouchableOpacity
                      style={styles.claimBadge}
                      onPress={() => handleClaim(result)}
                      disabled={claiming === result.id}
                      accessibilityLabel={`認領 ${result.placeName}`}
                    >
                      {claiming === result.id ? (
                        <ActivityIndicator size="small" color={MibuBrand.warmWhite} />
                      ) : (
                        <Text style={styles.claimBadgeText}>{translations.claim}</Text>
                      )}
                    </TouchableOpacity>
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
    padding: Spacing.xl,
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
    marginTop: Spacing.md,
    color: MibuBrand.copper,
    fontSize: FontSize.lg,
  },
  // 頂部標題區
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  // 返回按鈕
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: MibuBrand.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 頁面標題
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: MibuBrand.brownDark,
  },
  // 認領新店家按鈕
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: MibuBrand.brown,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
  },
  // 認領按鈕文字
  claimButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.warmWhite,
  },
  // 區塊標題
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.lg,
  },
  // 空狀態卡片
  emptyCard: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 空狀態文字
  emptyText: {
    fontSize: FontSize.lg,
    color: MibuBrand.copper,
    marginTop: Spacing.md,
  },
  // 店家列表
  placesList: {
    gap: Spacing.md,
  },
  // 店家卡片
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  // 店家圖示容器
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: MibuBrand.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  // 店家資訊區
  placeInfo: {
    flex: 1,
  },
  // 店家名稱
  placeName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: Spacing.xs,
  },
  // 店家位置
  placeLocation: {
    fontSize: FontSize.sm,
    color: MibuBrand.copper,
  },
  // 狀態標籤
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.xl,
  },
  // 狀態標籤文字
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  // 編輯圖示容器
  editIcon: {
    marginLeft: Spacing.sm,
  },
  // 搜尋區塊
  searchSection: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  // 搜尋輸入容器
  searchInputContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  // 搜尋輸入框
  searchInput: {
    flex: 1,
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    fontSize: FontSize.lg,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    color: MibuBrand.brownDark,
  },
  // 搜尋按鈕
  searchButton: {
    width: 52,
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 取消按鈕
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  // 取消按鈕文字
  cancelButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  // 已認領標籤
  claimedBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.xl,
    backgroundColor: MibuBrand.tanLight,
  },
  // 已認領文字
  claimedText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.copper,
  },
  // 認領按鈕
  claimBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    backgroundColor: MibuBrand.brown,
  },
  // 認領按鈕文字
  claimBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: MibuBrand.warmWhite,
  },
  // 錯誤橫幅（有資料但刷新失敗時顯示）
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: SemanticColors.errorLight,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: SemanticColors.errorMain,
  },
  // 錯誤橫幅文字
  errorBannerText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: SemanticColors.errorDark,
  },
});
