/**
 * CollectionScreen - 圖鑑畫面
 *
 * 功能：
 * - 顯示用戶收集到的所有景點
 * - 麵包屑導航：全部 → 國家 → 城市 → 分類
 * - 搜尋功能（景點名稱、描述、城市）
 * - 點擊卡片查看詳情（Modal）
 * - 支援收藏/黑名單功能
 * - 下拉重新整理
 * - 未讀標記和優惠更新通知
 *
 * 串接 API：
 * - collectionApi.getCollection() - 取得圖鑑列表
 * - collectionApi.markAsRead() - 標記已讀
 *
 * 視覺設計：
 * - 麵包屑導航（全部 > 國家 > 城市）
 * - Level 0: 國家卡片列表
 * - Level 1: 城市卡片列表
 * - Level 2: 分類 Tab + 2 欄網格景點卡片
 * - 使用分類色彩區分不同類型景點
 * - PRO 商家顯示品牌色
 *
 * 更新日期：2026-02-07（手風琴改麵包屑導航 + 搜尋）
 */
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  RefreshControl,
  Alert,
  SafeAreaView,
  TextInput,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../../context/AppContext';
import { collectionApi } from '../../../services/collectionApi';
import { contributionApi } from '../../../services/contributionApi';
import { GachaItem, Language, CollectionItem } from '../../../types';
import { getCategoryLabel } from '../../../constants/translations';
import { MibuBrand, getCategoryToken, deriveMerchantScheme, UIColors } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';
import { EmptyState } from '../../shared/components/ui/EmptyState';
import { ErrorState } from '../../shared/components/ui/ErrorState';
import { tFormat } from '../../../utils/i18n';

// ============================================================
// 型別定義
// ============================================================

/**
 * 擴展 GachaItem 類型
 * 新增圖鑑特有欄位
 */
type GachaItemWithRead = GachaItem & {
  isRead?: boolean;           // 是否已讀
  collectionId?: number;      // 圖鑑 ID
  hasPromoUpdate?: boolean;   // #028 是否有優惠更新通知
  placeId?: string;           // 地點 ID（用於收藏/黑名單 API）
};

// ============================================================
// 輔助函數
// ============================================================

/**
 * 取得景點名稱
 */
const getPlaceName = (item: GachaItem): string => {
  return item.placeName || '';
};

/**
 * 取得景點描述
 */
const getDescription = (item: GachaItem): string => {
  return item.description || '';
};

/**
 * 格式化日期
 * @param dateStr ISO 日期字串
 * @returns YYYY/MM/DD 格式
 */
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
};

// ============================================================
// 子元件：景點詳情 Modal
// ============================================================

interface PlaceDetailModalProps {
  item: GachaItem;     // 景點資料
  language: Language;  // 語言設定
  onClose: () => void; // 關閉回調
  onFavorite: (item: GachaItem) => void;   // 收藏回調
  onBlacklist: (item: GachaItem) => void;  // 黑名單回調
}

/**
 * PlaceDetailModal - 景點詳情彈窗
 * 顯示景點完整資訊，可導航、收藏、加入黑名單
 *
 * 【截圖 6-8】實作收藏/黑名單功能
 */
function PlaceDetailModal({ item, language, onClose, onFavorite, onBlacklist }: PlaceDetailModalProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const { t } = useApp();
  const placeName = getPlaceName(item);
  const description = getDescription(item);
  const category = typeof item.category === 'string' ? item.category.toLowerCase() : '';
  const categoryToken = getCategoryToken(category);
  const date = formatDate(item.collectedAt);
  const cityDisplay = item.cityDisplay || item.city || '';
  const districtDisplay = item.districtDisplay || item.district || '';

  const handleNavigate = () => {
    // 使用 Google Search 搜尋店名，與扭蛋卡片行為一致
    const query = [placeName, districtDisplay, cityDisplay].filter(Boolean).join(' ');
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  const handleFavorite = () => {
    onFavorite(item);
    setShowActionMenu(false);
    onClose();
  };

  const handleBlacklist = () => {
    onBlacklist(item);
    setShowActionMenu(false);
    onClose();
  };

  const handleClosePress = () => {
    setShowActionMenu(true);
  };

  const locationText = [districtDisplay, cityDisplay].filter(Boolean).join(' • ') || cityDisplay;

  return (
    <Modal visible transparent animationType="slide">
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: UIColors.overlayLight, justifyContent: 'flex-end' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={{ backgroundColor: MibuBrand.warmWhite, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' }}
          onStartShouldSetResponder={() => true}
        >
          <View style={{ height: 120, position: 'relative', backgroundColor: categoryToken.badge, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            {/* X 按鈕 / 彈出按鈕組 */}
            <View style={{ position: 'absolute', top: 16, right: 16 }}>
              {!showActionMenu ? (
                <TouchableOpacity
                  style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                  onPress={handleClosePress}
                >
                  <Ionicons name="close" size={20} color={MibuBrand.dark} />
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                    onPress={handleFavorite}
                    accessibilityLabel={t.collection_addToFavorites}
                  >
                    <Ionicons name="heart-outline" size={20} color={MibuBrand.tierSP} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                    onPress={onClose}
                    accessibilityLabel={t.collection_closeDetails}
                  >
                    <Ionicons name="close" size={20} color={MibuBrand.dark} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                    onPress={handleBlacklist}
                  >
                    <Ionicons name="ban-outline" size={20} color={MibuBrand.copper} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={{ position: 'absolute', bottom: 16, left: 20, backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: categoryToken.badgeText }}>
                {getCategoryLabel(category, language)}
              </Text>
            </View>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: MibuBrand.dark, marginBottom: 8 }}>{placeName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: MibuBrand.brownLight }}>{date}</Text>
              {locationText && (
                <>
                  <Text style={{ marginHorizontal: 8, color: MibuBrand.tanLight }}>•</Text>
                  <Text style={{ fontSize: 14, color: MibuBrand.brownLight }}>{locationText}</Text>
                </>
              )}
            </View>

            {description && (
              <Text style={{ fontSize: 16, color: MibuBrand.brownLight, lineHeight: 24, marginBottom: 20 }}>{description}</Text>
            )}

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: MibuBrand.brown, paddingVertical: 16, borderRadius: 16 }}
              onPress={handleNavigate}
              accessibilityLabel={t.collection_viewOnMap}
            >
              <Ionicons name="search" size={20} color={UIColors.white} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: UIColors.white }}>在 Google 中查看</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function CollectionScreen() {
  const { state, t, getToken } = useApp();
  const { collection: localCollection, language } = state;
  // 【圖鑑導航】麵包屑導航狀態
  const [navLevel, setNavLevel] = useState<0 | 1 | 2>(0);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GachaItemWithRead | null>(null);
  const [apiCollection, setApiCollection] = useState<GachaItemWithRead[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedFromApi, setHasLoadedFromApi] = useState(false);
  // #028 優惠更新通知
  const [promoUpdateIds, setPromoUpdateIds] = useState<Set<number>>(new Set());
  // 錯誤狀態（API 載入失敗時顯示）
  const [loadError, setLoadError] = useState(false);

  // 使用 API 資料或本地資料
  const collection = hasLoadedFromApi ? apiCollection : localCollection as GachaItemWithRead[];

  // 統計資料（useMemo 避免每次渲染重算）
  const { totalSpots, uniqueCities, uniqueCategories, unreadCount } = useMemo(() => ({
    totalSpots: collection.length,
    uniqueCities: new Set(collection.map(item => item.city || 'Unknown')).size,
    uniqueCategories: new Set(collection.map(item =>
      (typeof item.category === 'string' ? item.category : '').toLowerCase() || 'other'
    )).size,
    unreadCount: collection.filter(item => item.isRead === false).length,
  }), [collection]);

  // #028 載入優惠更新通知
  const loadPromoUpdates = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const response = await collectionApi.getPromoUpdates(token);
      if (response.success && response.unreadCollectionIds) {
        setPromoUpdateIds(new Set(response.unreadCollectionIds));
      }
    } catch (error) {
      console.error('Failed to load promo updates:', error);
    }
  }, [getToken]);

  // 從後端載入圖鑑資料，使用 sort=unread 排序
  const loadCollections = useCallback(async () => {
    try {
      setLoadError(false);
      const token = await getToken();
      if (!token) return;

      const response = await collectionApi.getCollections(token, { sort: 'unread' });
      if (response.collections) {
        // 將 CollectionItem 轉換為 GachaItemWithRead
        const items = response.collections.map(item => ({
          id: parseInt(item.placeId || item.id?.toString() || '0', 10) || 0,
          placeId: item.placeId,
          placeName: item.placeName,
          description: item.description,
          category: item.category,
          subcategory: null,
          address: null,
          rating: null,
          locationLat: null,
          locationLng: null,
          city: item.city,
          cityDisplay: item.cityDisplay,
          district: item.district,
          districtDisplay: item.districtDisplay,
          collectedAt: item.collectedAt,
          isRead: item.isRead,
          collectionId: item.id,
          merchant: item.merchant,
          isCoupon: item.isCoupon,
          couponData: item.couponData,
        })) as GachaItemWithRead[];
        setApiCollection(items);
        setHasLoadedFromApi(true);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
      setLoadError(true);
    }
  }, [getToken]);

  // 首次掛載時載入
  const hasInitialLoaded = useRef(false);
  useEffect(() => {
    loadCollections();
    loadPromoUpdates(); // #028
    hasInitialLoaded.current = true;
  }, [loadCollections, loadPromoUpdates]);

  // 每次頁面獲得焦點時重新載入（修復：登入後切回圖鑑不會重新拉資料的問題）
  useFocusEffect(
    useCallback(() => {
      // 跳過首次（useEffect 已處理），避免重複呼叫
      if (!hasInitialLoaded.current) return;
      loadCollections();
      loadPromoUpdates();
    }, [loadCollections, loadPromoUpdates])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadCollections(), loadPromoUpdates()]); // #028
    setRefreshing(false);
  }, [loadCollections, loadPromoUpdates]);

  // 點擊項目時標記為已讀
  const handleItemPress = useCallback(async (item: GachaItemWithRead) => {
    setSelectedItem(item);

    const token = await getToken();
    if (!token || !item.collectionId) return;

    // 如果是未讀項目，標記為已讀
    if (item.isRead === false) {
      try {
        await collectionApi.markCollectionItemRead(token, item.collectionId);
        setApiCollection(prev =>
          prev.map(i =>
            i.collectionId === item.collectionId ? { ...i, isRead: true } : i
          )
        );
      } catch (error) {
        console.error('Failed to mark item as read:', error);
      }
    }

    // #028 如果有優惠更新，標記優惠已讀
    if (promoUpdateIds.has(item.collectionId)) {
      try {
        await collectionApi.markPromoRead(token, item.collectionId);
        setPromoUpdateIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.collectionId!);
          return newSet;
        });
      } catch (error) {
        console.error('Failed to mark promo as read:', error);
      }
    }
  }, [getToken, promoUpdateIds]);

  // ========== 麵包屑導航函數 ==========

  /** 導航到國家層（選擇國家後進入城市列表） */
  const navigateToCountry = (countryKey: string) => {
    setSelectedCountry(countryKey);
    setSelectedCity(null);
    setNavLevel(1);
    setActiveCategoryTab(null);
  };

  /** 導航到城市層（選擇城市後進入景點列表） */
  const navigateToCity = (cityKey: string) => {
    setSelectedCity(cityKey);
    setNavLevel(2);
    setActiveCategoryTab(null);
  };

  /** 麵包屑：導航回指定層級 */
  const navigateBack = (level: 0 | 1 | 2) => {
    setNavLevel(level);
    if (level === 0) {
      setSelectedCountry(null);
      setSelectedCity(null);
    } else if (level === 1) {
      setSelectedCity(null);
    }
    setActiveCategoryTab(null);
  };

  /**
   * 加入我的最愛
   * 【截圖 6-8】實作收藏功能
   */
  const handleFavorite = useCallback(async (item: GachaItemWithRead) => {
    const token = await getToken();
    if (!token) {
      Alert.alert(
        language === 'zh-TW' ? '請先登入' : 'Please Login',
        language === 'zh-TW' ? '登入後才能使用收藏功能' : 'Login to use favorites'
      );
      return;
    }

    const placeId = item.placeId || item.id?.toString();
    if (!placeId) return;

    try {
      const response = await collectionApi.addFavorite(token, placeId);
      if (response.success) {
        Alert.alert(
          language === 'zh-TW' ? '已加入最愛' : 'Added to Favorites',
          language === 'zh-TW' ? `${item.placeName} 已加入我的最愛` : `${item.placeName} has been added to favorites`
        );
      }
    } catch (error) {
      console.error('Failed to add favorite:', error);
      Alert.alert(
        language === 'zh-TW' ? '操作失敗' : 'Failed',
        language === 'zh-TW' ? '請稍後再試' : 'Please try again later'
      );
    }
  }, [getToken, language]);

  /**
   * 加入黑名單
   * 【截圖 6-8】實作黑名單功能
   */
  const handleBlacklist = useCallback(async (item: GachaItemWithRead) => {
    const token = await getToken();
    if (!token) {
      Alert.alert(
        language === 'zh-TW' ? '請先登入' : 'Please Login',
        language === 'zh-TW' ? '登入後才能使用黑名單功能' : 'Login to use blacklist'
      );
      return;
    }

    const placeId = item.placeId || item.id?.toString();
    if (!placeId) return;

    // 確認對話框
    Alert.alert(
      language === 'zh-TW' ? '加入黑名單' : 'Add to Blacklist',
      language === 'zh-TW'
        ? `確定要將「${item.placeName}」加入黑名單嗎？\n加入後扭蛋將不會再抽到此景點。`
        : `Are you sure you want to blacklist "${item.placeName}"?\nThis place will not appear in future gacha pulls.`,
      [
        { text: language === 'zh-TW' ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: language === 'zh-TW' ? '確定' : 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await contributionApi.addToBlacklist(token, placeId);
              if (response.success) {
                Alert.alert(
                  language === 'zh-TW' ? '已加入黑名單' : 'Added to Blacklist',
                  language === 'zh-TW' ? `${item.placeName} 已加入黑名單` : `${item.placeName} has been blacklisted`
                );
              }
            } catch (error) {
              console.error('Failed to add to blacklist:', error);
              Alert.alert(
                language === 'zh-TW' ? '操作失敗' : 'Failed',
                language === 'zh-TW' ? '請稍後再試' : 'Please try again later'
              );
            }
          },
        },
      ]
    );
  }, [getToken, language]);

  /**
   * 【圖鑑三層分類】國家 → 城市 → 分類
   * 後端回傳的 collection item 包含 country, city, category 欄位
   * 前端按這三層進行分組
   */
  const groupedData = useMemo(() => {
    type CityData = {
      displayName: string;
      items: GachaItemWithRead[];
      unreadCount: number;
      byCategory: Record<string, GachaItemWithRead[]>;
    };
    type CountryData = {
      displayName: string;
      cities: Record<string, CityData>;
      totalItems: number;
      unreadCount: number;
    };

    const countryMap: Record<string, CountryData> = {};

    collection.forEach(item => {
      // 取得國家、城市、分類
      const country = item.country || '台灣'; // 預設台灣
      const city = item.city || 'Unknown';
      const cityDisplay = item.cityDisplay || city;
      const category = (typeof item.category === 'string' ? item.category : '').toLowerCase() || 'other';

      // 初始化國家
      if (!countryMap[country]) {
        countryMap[country] = {
          displayName: country,
          cities: {},
          totalItems: 0,
          unreadCount: 0,
        };
      }

      // 初始化城市
      if (!countryMap[country].cities[city]) {
        countryMap[country].cities[city] = {
          displayName: cityDisplay,
          items: [],
          unreadCount: 0,
          byCategory: {},
        };
      }

      // 添加到城市
      countryMap[country].cities[city].items.push(item);
      countryMap[country].totalItems++;

      // 統計未讀
      if (item.isRead === false) {
        countryMap[country].cities[city].unreadCount++;
        countryMap[country].unreadCount++;
      }

      // 添加到分類
      if (!countryMap[country].cities[city].byCategory[category]) {
        countryMap[country].cities[city].byCategory[category] = [];
      }
      countryMap[country].cities[city].byCategory[category].push(item);
    });

    return countryMap;
  }, [collection]);

  // 搜尋結果篩選
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return collection.filter(item =>
      getPlaceName(item).toLowerCase().includes(query) ||
      getDescription(item).toLowerCase().includes(query) ||
      (item.city || '').toLowerCase().includes(query) ||
      (item.cityDisplay || '').toLowerCase().includes(query)
    );
  }, [collection, searchQuery]);

  // 當前城市資料（Level 2 使用）
  const currentCityData = useMemo(() => {
    if (!selectedCountry || !selectedCity) return null;
    return groupedData[selectedCountry]?.cities[selectedCity] || null;
  }, [groupedData, selectedCountry, selectedCity]);

  // 當前城市的分類列表
  const currentCategories = useMemo(() => {
    if (!currentCityData) return [];
    return Object.keys(currentCityData.byCategory)
      .sort((a, b) => currentCityData.byCategory[b].length - currentCityData.byCategory[a].length);
  }, [currentCityData]);

  // 依分類篩選的景點
  const filteredPlaces = useMemo(() => {
    if (!currentCityData) return [];
    return activeCategoryTab
      ? currentCityData.byCategory[activeCategoryTab] || []
      : currentCityData.items;
  }, [currentCityData, activeCategoryTab]);

  // 網格卡片寬度（2 欄）
  const cardWidth = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    return (screenWidth - Spacing.lg * 2 - Spacing.md) / 2;
  }, []);

  // 錯誤狀態：API 載入失敗且沒有本地資料時顯示
  if (loadError && collection.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: MibuBrand.warmWhite }}>
          <ErrorState
          icon="cloud-offline-outline"
          message={language === 'zh-TW' ? '圖鑑載入失敗' : 'Failed to load collection'}
          detail={language === 'zh-TW' ? '請檢查網路連線後再試' : 'Please check your connection and try again'}
            onRetry={loadCollections}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (collection.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: MibuBrand.warmWhite }}>
          <EmptyState
            icon="albums-outline"
            title={t.noCollection}
            description={t.startToCollect}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ========== 景點卡片渲染（搜尋結果 & 網格共用） ==========
  const renderPlaceCard = (item: GachaItemWithRead, idx: number, mode: 'list' | 'grid') => {
    const placeName = getPlaceName(item);
    const description = getDescription(item);
    const date = formatDate(item.collectedAt);
    const category = (typeof item.category === 'string' ? item.category : '').toLowerCase() || 'other';
    const catToken = getCategoryToken(category);
    const isUnread = item.isRead === false;
    const isMerchantPro = item.merchant?.isPro && item.merchant?.brandColor;
    const merchantScheme = isMerchantPro ? deriveMerchantScheme(item.merchant!.brandColor!) : null;
    const accentColor = merchantScheme ? merchantScheme.accent : catToken.stripe;

    if (mode === 'grid') {
      return (
        <TouchableOpacity
          key={`place-${item.id}-${idx}`}
          style={{
            width: cardWidth,
            backgroundColor: MibuBrand.warmWhite,
            borderRadius: Radius.xl,
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: isUnread ? accentColor : MibuBrand.tanLight,
          }}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.7}
        >
          {/* 分類色條 */}
          <View style={{ height: 4, backgroundColor: accentColor }} />
          <View style={{ padding: Spacing.md }}>
            {/* 未讀紅點 + 分類標籤 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs }}>
              {isUnread && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: MibuBrand.tierSP }} />
              )}
              <View style={{ backgroundColor: catToken.badge, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, marginLeft: 'auto' }}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: catToken.badgeText }}>
                  {getCategoryLabel(category, language)}
                </Text>
              </View>
            </View>
            {/* 景點名稱 */}
            <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: MibuBrand.brownDark, marginBottom: Spacing.xs }} numberOfLines={2}>
              {placeName}
            </Text>
            {/* 描述 */}
            {description ? (
              <Text style={{ fontSize: FontSize.xs, color: MibuBrand.brownLight, lineHeight: 16 }} numberOfLines={2}>
                {description}
              </Text>
            ) : null}
            {/* 地區 */}
            <Text style={{ fontSize: FontSize.xs, color: MibuBrand.copper, marginTop: Spacing.xs }}>
              {item.districtDisplay || item.district || ''}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // mode === 'list'（搜尋結果用）
    return (
      <TouchableOpacity
        key={`search-${item.id}-${idx}`}
        style={{
          backgroundColor: MibuBrand.warmWhite,
          borderRadius: Radius.xl,
          padding: Spacing.lg,
          borderWidth: 1,
          borderColor: isUnread ? accentColor : MibuBrand.tanLight,
        }}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
          <Text style={{ fontSize: FontSize.xs, color: MibuBrand.brownLight }}>{date}</Text>
          <View style={{ backgroundColor: catToken.badge, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full }}>
            <Text style={{ fontSize: FontSize.xs, fontWeight: '600', color: catToken.badgeText }}>
              {getCategoryLabel(category, language)}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: accentColor, marginBottom: Spacing.xs }}>
          {placeName}
        </Text>
        {description ? (
          <Text style={{ fontSize: FontSize.sm, color: MibuBrand.brownLight, lineHeight: 20 }} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <Text style={{ fontSize: FontSize.xs, color: MibuBrand.copper, marginTop: Spacing.xs }}>
          {item.cityDisplay || item.city || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  // Level 2 景點網格模式：用 FlatList 獨立滾動，避免 VirtualizedList 嵌套
  const isGridMode = navLevel === 2 && currentCityData && !searchQuery.trim();

  // ========== 共用 UI 區塊（ScrollView / FlatList 共用）==========

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[MibuBrand.brown]}
      tintColor={MibuBrand.brown}
    />
  );

  // Header + 統計 + 搜尋框
  const headerBlock = (
    <>
      <View style={{ marginBottom: Spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <View style={{
            width: 4,
            height: 28,
            backgroundColor: MibuBrand.brown,
            borderRadius: 2,
          }} />
          <Text style={{ fontSize: 24, fontWeight: '800', color: MibuBrand.brownDark }}>
            {language === 'zh-TW' ? '我的圖鑑' : 'My Collection'}
          </Text>
        </View>
        {unreadCount > 0 && (
          <Text style={{ fontSize: FontSize.sm, color: MibuBrand.copper, marginTop: Spacing.xs, marginLeft: 12 }}>
            {language === 'zh-TW' ? `${unreadCount} 個新景點` : `${unreadCount} new places`}
          </Text>
        )}
      </View>

      <View style={{
        backgroundColor: MibuBrand.warmWhite,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        flexDirection: 'row',
        justifyContent: 'space-around',
        shadowColor: MibuBrand.brownDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: MibuBrand.brown }}>{totalSpots}</Text>
          <Text style={{ fontSize: FontSize.sm, color: MibuBrand.brownLight, marginTop: 2 }}>
            {language === 'zh-TW' ? '已收集' : 'Collected'}
          </Text>
        </View>
        <View style={{ width: 1, backgroundColor: MibuBrand.tanLight, marginVertical: Spacing.xs }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: MibuBrand.copper }}>{uniqueCities}</Text>
          <Text style={{ fontSize: FontSize.sm, color: MibuBrand.brownLight, marginTop: 2 }}>
            {language === 'zh-TW' ? '城市' : 'Cities'}
          </Text>
        </View>
        <View style={{ width: 1, backgroundColor: MibuBrand.tanLight, marginVertical: Spacing.xs }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: MibuBrand.tan }}>{uniqueCategories}</Text>
          <Text style={{ fontSize: FontSize.sm, color: MibuBrand.brownLight, marginTop: 2 }}>
            {language === 'zh-TW' ? '類別' : 'Categories'}
          </Text>
        </View>
      </View>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MibuBrand.warmWhite,
        borderRadius: Radius.xl,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: MibuBrand.tanLight,
        gap: Spacing.sm,
      }}>
        <Ionicons name="search-outline" size={18} color={MibuBrand.brownLight} />
        <TextInput
          style={{ flex: 1, fontSize: FontSize.md, color: MibuBrand.brownDark, padding: 0 }}
          placeholder={language === 'zh-TW' ? '搜尋景點名稱...' : 'Search places...'}
          placeholderTextColor={MibuBrand.brownLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel={t.collection_clearSearch}>
            <Ionicons name="close-circle" size={18} color={MibuBrand.brownLight} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  // 麵包屑導航
  const breadcrumbBlock = (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.lg,
      gap: Spacing.xs,
      flexWrap: 'wrap',
    }}>
      <TouchableOpacity onPress={() => navigateBack(0)}>
        <Text style={{
          fontSize: FontSize.md,
          color: navLevel === 0 ? MibuBrand.brownDark : MibuBrand.brown,
          fontWeight: navLevel === 0 ? '700' : '500',
        }}>
          {language === 'zh-TW' ? '全部' : 'All'}
        </Text>
      </TouchableOpacity>
      {selectedCountry && groupedData[selectedCountry] && (
        <>
          <Ionicons name="chevron-forward" size={14} color={MibuBrand.brownLight} />
          <TouchableOpacity onPress={() => navigateBack(1)}>
            <Text style={{
              fontSize: FontSize.md,
              color: navLevel >= 2 ? MibuBrand.brown : MibuBrand.brownDark,
              fontWeight: navLevel === 1 ? '700' : '500',
            }}>
              {groupedData[selectedCountry].displayName}
            </Text>
          </TouchableOpacity>
        </>
      )}
      {selectedCity && selectedCountry && groupedData[selectedCountry]?.cities[selectedCity] && (
        <>
          <Ionicons name="chevron-forward" size={14} color={MibuBrand.brownLight} />
          <Text style={{ fontSize: FontSize.md, color: MibuBrand.brownDark, fontWeight: '700' }}>
            {groupedData[selectedCountry].cities[selectedCity].displayName}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}>

    {/* ========== Level 2 景點網格：FlatList 獨立滾動 ========== */}
    {isGridMode ? (
      <FlatList
        style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 120 }}
        data={filteredPlaces}
        numColumns={2}
        renderItem={({ item, index }) => renderPlaceCard(item, index, 'grid')}
        keyExtractor={(item, index) => String(item.id || item.placeId || index)}
        columnWrapperStyle={{ gap: Spacing.md }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        refreshControl={refreshControl}
        ListHeaderComponent={
          <>
            {headerBlock}
            {breadcrumbBlock}
            {/* 分類 Tab */}
            {currentCityData && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: Spacing.lg }}
                contentContainerStyle={{ gap: Spacing.sm }}
              >
                <TouchableOpacity
                  style={{
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.sm,
                    borderRadius: Radius.full,
                    backgroundColor: !activeCategoryTab ? MibuBrand.brown : MibuBrand.warmWhite,
                    borderWidth: 1,
                    borderColor: !activeCategoryTab ? MibuBrand.brown : MibuBrand.tanLight,
                  }}
                  onPress={() => setActiveCategoryTab(null)}
                >
                  <Text style={{
                    fontSize: FontSize.sm,
                    fontWeight: '600',
                    color: !activeCategoryTab ? UIColors.white : MibuBrand.brownDark,
                  }}>
                    {language === 'zh-TW' ? '全部' : 'All'} ({currentCityData.items.length})
                  </Text>
                </TouchableOpacity>
                {currentCategories.map(cat => {
                  const catToken = getCategoryToken(cat);
                  const isActive = activeCategoryTab === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={{
                        paddingHorizontal: Spacing.lg,
                        paddingVertical: Spacing.sm,
                        borderRadius: Radius.full,
                        backgroundColor: isActive ? catToken.stripe : MibuBrand.warmWhite,
                        borderWidth: 1,
                        borderColor: isActive ? catToken.stripe : MibuBrand.tanLight,
                      }}
                      onPress={() => setActiveCategoryTab(cat)}
                    >
                      <Text style={{
                        fontSize: FontSize.sm,
                        fontWeight: '600',
                        color: isActive ? UIColors.white : MibuBrand.brownDark,
                      }}>
                        {getCategoryLabel(cat, language)} ({currentCityData.byCategory[cat].length})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </>
        }
      />
    ) : (

    /* ========== 非 Level 2：原本的 ScrollView ========== */
    <ScrollView
      style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}
      contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 120 }}
      refreshControl={refreshControl}
    >
      {headerBlock}

      {searchQuery.trim() ? (
        /* ========== 搜尋結果 ========== */
        <>
          <Text style={{ fontSize: FontSize.sm, color: MibuBrand.brownLight, marginBottom: Spacing.md }}>
            {language === 'zh-TW'
              ? `找到 ${searchResults.length} 個結果`
              : `${searchResults.length} results found`}
          </Text>
          {searchResults.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: Spacing.xxl }}>
              <Ionicons name="search-outline" size={48} color={MibuBrand.tanLight} />
              <Text style={{ fontSize: FontSize.md, color: MibuBrand.brownLight, marginTop: Spacing.md }}>
                {language === 'zh-TW' ? '找不到符合的景點' : 'No matching places'}
              </Text>
            </View>
          ) : (
            <View style={{ gap: Spacing.md }}>
              {searchResults.map((item, idx) => renderPlaceCard(item, idx, 'list'))}
            </View>
          )}
        </>
      ) : (
        /* ========== 麵包屑導航 + 分層內容 ========== */
        <>
          {breadcrumbBlock}

          {/* ===== Level 0：國家列表 ===== */}
          {navLevel === 0 && (
            <View style={{ gap: Spacing.md }}>
              {Object.entries(groupedData)
                .sort((a, b) => b[1].totalItems - a[1].totalItems)
                .map(([countryKey, countryData]) => (
                  <TouchableOpacity
                    key={countryKey}
                    style={{
                      backgroundColor: MibuBrand.warmWhite,
                      borderRadius: Radius.xl,
                      padding: Spacing.lg,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: MibuBrand.tanLight,
                    }}
                    onPress={() => navigateToCountry(countryKey)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                      <View style={{ position: 'relative' }}>
                        <View style={{
                          width: 44,
                          height: 44,
                          backgroundColor: MibuBrand.cream,
                          borderRadius: Radius.md,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Ionicons name="flag" size={20} color={MibuBrand.brown} />
                        </View>
                        {countryData.unreadCount > 0 && (
                          <View style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            backgroundColor: MibuBrand.tierSP,
                            borderRadius: 10,
                            minWidth: 20,
                            height: 20,
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: 4,
                            borderWidth: 2,
                            borderColor: MibuBrand.warmWhite,
                          }}>
                            <Text style={{ color: UIColors.white, fontSize: 10, fontWeight: '700' }}>
                              {countryData.unreadCount > 9 ? '9+' : countryData.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View>
                        <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: MibuBrand.brownDark }}>
                          {countryData.displayName}
                        </Text>
                        <Text style={{ fontSize: FontSize.sm, color: MibuBrand.brownLight }}>
                          {countryData.totalItems} {t.spots} • {Object.keys(countryData.cities).length} {language === 'zh-TW' ? '城市' : 'cities'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={MibuBrand.brownLight} />
                  </TouchableOpacity>
                ))}
            </View>
          )}

          {/* ===== Level 1：城市列表 ===== */}
          {navLevel === 1 && selectedCountry && groupedData[selectedCountry] && (
            <View style={{ gap: Spacing.md }}>
              {Object.entries(groupedData[selectedCountry].cities)
                .sort((a, b) => b[1].items.length - a[1].items.length)
                .map(([cityKey, cityData]) => (
                  <TouchableOpacity
                    key={cityKey}
                    style={{
                      backgroundColor: MibuBrand.warmWhite,
                      borderRadius: Radius.xl,
                      padding: Spacing.lg,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: MibuBrand.tanLight,
                    }}
                    onPress={() => navigateToCity(cityKey)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                      <View style={{ position: 'relative' }}>
                        <View style={{
                          width: 40,
                          height: 40,
                          backgroundColor: MibuBrand.cream,
                          borderRadius: Radius.sm,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Text style={{ color: MibuBrand.copper, fontSize: FontSize.lg, fontWeight: '700' }}>
                            {cityData.displayName.charAt(0)}
                          </Text>
                        </View>
                        {cityData.unreadCount > 0 && (
                          <View style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            backgroundColor: MibuBrand.tierSP,
                            borderRadius: 8,
                            minWidth: 16,
                            height: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: 3,
                            borderWidth: 1.5,
                            borderColor: MibuBrand.warmWhite,
                          }}>
                            <Text style={{ color: UIColors.white, fontSize: 9, fontWeight: '700' }}>
                              {cityData.unreadCount > 9 ? '9+' : cityData.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View>
                        <Text style={{ fontSize: FontSize.md, fontWeight: '600', color: MibuBrand.brownDark }}>
                          {cityData.displayName}
                        </Text>
                        <Text style={{ fontSize: FontSize.xs, color: MibuBrand.brownLight }}>
                          {cityData.items.length} {t.spots} • {Object.keys(cityData.byCategory).length} {language === 'zh-TW' ? '類別' : 'categories'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={MibuBrand.brownLight} />
                  </TouchableOpacity>
                ))}
            </View>
          )}

        </>
      )}
    </ScrollView>
    )}

      {selectedItem && (
        <PlaceDetailModal
          item={selectedItem}
          language={language}
          onClose={() => setSelectedItem(null)}
          onFavorite={handleFavorite}
          onBlacklist={handleBlacklist}
        />
      )}
    </SafeAreaView>
  );
}
