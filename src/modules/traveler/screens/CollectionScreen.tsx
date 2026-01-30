/**
 * CollectionScreen - 圖鑑畫面
 *
 * 功能：
 * - 顯示用戶收集到的所有景點（以方格卡片呈現）
 * - 依分類分群顯示
 * - 支援篩選和搜尋
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
 * - 使用分類色彩區分不同類型景點
 * - PRO 商家顯示品牌色
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';
import { collectionApi } from '../../../services/collectionApi';
import { contributionApi } from '../../../services/contributionApi';
import { GachaItem, Language, CollectionItem } from '../../../types';
import { getCategoryLabel } from '../../../constants/translations';
import { MibuBrand, getCategoryToken, deriveMerchantScheme } from '../../../../constants/Colors';
import { Spacing, Radius, FontSize } from '../../../theme/designTokens';

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
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' }}
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
                  >
                    <Ionicons name="heart-outline" size={20} color={MibuBrand.tierSP} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                    onPress={onClose}
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
            >
              <Ionicons name="search" size={20} color="#ffffff" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>在 Google 中查看</Text>
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
  // 【圖鑑三層分類】展開狀態
  const [openCountries, setOpenCountries] = useState<Set<string>>(new Set());
  const [openCities, setOpenCities] = useState<Set<string>>(new Set());
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<GachaItemWithRead | null>(null);
  const [apiCollection, setApiCollection] = useState<GachaItemWithRead[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedFromApi, setHasLoadedFromApi] = useState(false);
  // #028 優惠更新通知
  const [promoUpdateIds, setPromoUpdateIds] = useState<Set<number>>(new Set());

  // 使用 API 資料或本地資料
  const collection = hasLoadedFromApi ? apiCollection : localCollection as GachaItemWithRead[];

  // 統計資料
  const totalSpots = collection.length;
  const uniqueCities = new Set(collection.map(item => item.city || 'Unknown')).size;
  const uniqueCategories = new Set(collection.map(item =>
    (typeof item.category === 'string' ? item.category : '').toLowerCase() || 'other'
  )).size;
  const unreadCount = collection.filter(item => item.isRead === false).length;

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
      const token = await getToken();
      if (!token) return;

      const response = await collectionApi.getCollections(token, { sort: 'unread' });
      if (response.items) {
        // 將 CollectionItem 轉換為 GachaItemWithRead
        const items = response.items.map(item => ({
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
    }
  }, [getToken]);

  useEffect(() => {
    loadCollections();
    loadPromoUpdates(); // #028
  }, [loadCollections, loadPromoUpdates]);

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

  /**
   * 【圖鑑三層分類】切換國家展開/收合（手風琴模式）
   */
  const toggleCountry = (country: string) => {
    setOpenCountries(prev => {
      if (prev.has(country)) {
        return new Set<string>();
      }
      return new Set([country]);
    });
    // 切換國家時，清空城市和分類展開狀態
    setOpenCities(new Set());
    setOpenCategories(new Set());
  };

  /**
   * 【圖鑑三層分類】切換城市展開/收合（手風琴模式）
   */
  const toggleCity = (cityKey: string) => {
    setOpenCities(prev => {
      if (prev.has(cityKey)) {
        return new Set<string>();
      }
      return new Set([cityKey]);
    });
    // 切換城市時，清空分類展開狀態
    setOpenCategories(new Set());
  };

  /**
   * 【圖鑑三層分類】切換分類展開/收合（手風琴模式）
   */
  const toggleCategory = (key: string) => {
    setOpenCategories(prev => {
      if (prev.has(key)) {
        return new Set<string>();
      }
      return new Set([key]);
    });
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
      const country = (item as any).country || '台灣'; // 預設台灣
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

  if (collection.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: MibuBrand.warmWhite }}>
        <Ionicons name="location-outline" size={64} color={MibuBrand.tanLight} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: MibuBrand.brownLight, marginTop: 16 }}>{t.noCollection}</Text>
        <Text style={{ fontSize: 14, color: MibuBrand.tan, marginTop: 8 }}>{t.startToCollect}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}
      contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: 120 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[MibuBrand.brown]}
          tintColor={MibuBrand.brown}
        />
      }
    >
      {/* ========== Header 區塊 ========== */}
      {/* 【截圖 6-8 重新設計】更溫暖的標題設計 */}
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

      {/* ========== 統計區塊 ========== */}
      {/* 【截圖 6-8 重新設計】更精緻的統計卡片 */}
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
        {/* 已收集 */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: MibuBrand.brown }}>{totalSpots}</Text>
          <Text style={{ fontSize: FontSize.sm, color: MibuBrand.brownLight, marginTop: 2 }}>
            {language === 'zh-TW' ? '已收集' : 'Collected'}
          </Text>
        </View>

        {/* 分隔線 */}
        <View style={{ width: 1, backgroundColor: MibuBrand.tanLight, marginVertical: Spacing.xs }} />

        {/* 城市 */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: MibuBrand.copper }}>{uniqueCities}</Text>
          <Text style={{ fontSize: FontSize.sm, color: MibuBrand.brownLight, marginTop: 2 }}>
            {language === 'zh-TW' ? '城市' : 'Cities'}
          </Text>
        </View>

        {/* 分隔線 */}
        <View style={{ width: 1, backgroundColor: MibuBrand.tanLight, marginVertical: Spacing.xs }} />

        {/* 類別 */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: MibuBrand.tan }}>{uniqueCategories}</Text>
          <Text style={{ fontSize: FontSize.sm, color: MibuBrand.brownLight, marginTop: 2 }}>
            {language === 'zh-TW' ? '類別' : 'Categories'}
          </Text>
        </View>
      </View>

      {/* ========== 國家/城市列表標題 ========== */}
      {collection.length > 0 && (
        <Text style={{
          fontSize: FontSize.md,
          fontWeight: '600',
          color: MibuBrand.brownLight,
          marginBottom: Spacing.md,
          marginLeft: Spacing.xs,
        }}>
          {language === 'zh-TW' ? '依地區分類' : 'By Region'}
        </Text>
      )}

      {/* ========== 三層手風琴：國家 → 城市 → 分類 ========== */}
      {Object.entries(groupedData)
        .sort((a, b) => b[1].totalItems - a[1].totalItems)
        .map(([countryKey, countryData]) => {
          const isCountryOpen = openCountries.has(countryKey);

          return (
            <View
              key={countryKey}
              style={{
                backgroundColor: MibuBrand.warmWhite,
                borderRadius: Radius.xl,
                marginBottom: Spacing.md,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: isCountryOpen ? MibuBrand.brown : MibuBrand.tanLight,
              }}
            >
              {/* ===== 第一層：國家標題列 ===== */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: Spacing.lg,
                  backgroundColor: isCountryOpen ? `${MibuBrand.brown}08` : 'transparent',
                }}
                onPress={() => toggleCountry(countryKey)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                  {/* 國家旗幟圖標 */}
                  <View style={{ position: 'relative' }}>
                    <View style={{
                      width: 44,
                      height: 44,
                      backgroundColor: isCountryOpen ? MibuBrand.brown : MibuBrand.cream,
                      borderRadius: Radius.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Ionicons
                        name="flag"
                        size={20}
                        color={isCountryOpen ? '#ffffff' : MibuBrand.brown}
                      />
                    </View>
                    {/* 未讀徽章 */}
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
                        <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '700' }}>
                          {countryData.unreadCount > 9 ? '9+' : countryData.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  {/* 國家名稱和數量 */}
                  <View>
                    <Text style={{
                      fontSize: FontSize.lg,
                      fontWeight: '700',
                      color: MibuBrand.brownDark,
                    }}>
                      {countryData.displayName}
                    </Text>
                    <Text style={{ fontSize: FontSize.sm, color: MibuBrand.brownLight }}>
                      {countryData.totalItems} {t.spots} • {Object.keys(countryData.cities).length} {language === 'zh-TW' ? '城市' : 'cities'}
                    </Text>
                  </View>
                </View>
                {/* 展開/收合箭頭 */}
                <Ionicons
                  name={isCountryOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={isCountryOpen ? MibuBrand.brown : MibuBrand.brownLight}
                />
              </TouchableOpacity>

              {/* ===== 第二層：城市列表（展開時顯示）===== */}
              {isCountryOpen && (
                <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg, gap: Spacing.sm }}>
                  {Object.entries(countryData.cities)
                    .sort((a, b) => b[1].items.length - a[1].items.length)
                    .map(([cityKey, cityData]) => {
                      const cityFullKey = `${countryKey}-${cityKey}`;
                      const isCityOpen = openCities.has(cityFullKey);

                      return (
                        <View
                          key={cityFullKey}
                          style={{
                            backgroundColor: MibuBrand.creamLight,
                            borderRadius: Radius.lg,
                            overflow: 'hidden',
                            borderWidth: isCityOpen ? 1 : 0,
                            borderColor: isCityOpen ? MibuBrand.copper : 'transparent',
                          }}
                        >
                          {/* 城市標題列 */}
                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: Spacing.md,
                              backgroundColor: isCityOpen ? `${MibuBrand.copper}10` : 'transparent',
                            }}
                            onPress={() => toggleCity(cityFullKey)}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                              {/* 城市首字圖標 */}
                              <View style={{ position: 'relative' }}>
                                <View style={{
                                  width: 36,
                                  height: 36,
                                  backgroundColor: isCityOpen ? MibuBrand.copper : MibuBrand.cream,
                                  borderRadius: Radius.sm,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <Text style={{
                                    color: isCityOpen ? '#ffffff' : MibuBrand.copper,
                                    fontSize: FontSize.md,
                                    fontWeight: '700',
                                  }}>
                                    {cityData.displayName.charAt(0)}
                                  </Text>
                                </View>
                                {/* 未讀徽章 */}
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
                                    borderColor: MibuBrand.creamLight,
                                  }}>
                                    <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: '700' }}>
                                      {cityData.unreadCount > 9 ? '9+' : cityData.unreadCount}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              {/* 城市名稱和數量 */}
                              <View>
                                <Text style={{
                                  fontSize: FontSize.md,
                                  fontWeight: '600',
                                  color: MibuBrand.brownDark,
                                }}>
                                  {cityData.displayName}
                                </Text>
                                <Text style={{ fontSize: FontSize.xs, color: MibuBrand.brownLight }}>
                                  {cityData.items.length} {t.spots}
                                </Text>
                              </View>
                            </View>
                            {/* 展開/收合箭頭 */}
                            <Ionicons
                              name={isCityOpen ? 'chevron-up' : 'chevron-down'}
                              size={18}
                              color={isCityOpen ? MibuBrand.copper : MibuBrand.brownLight}
                            />
                          </TouchableOpacity>

                          {/* ===== 第三層：分類列表（展開時顯示）===== */}
                          {isCityOpen && (
                            <View style={{ paddingHorizontal: Spacing.sm, paddingBottom: Spacing.md, gap: Spacing.xs }}>
                              {Object.entries(cityData.byCategory)
                                .sort((a, b) => b[1].length - a[1].length)
                                .map(([category, categoryItems]) => {
                                  const catToken = getCategoryToken(category);
                                  const categoryFullKey = `${cityFullKey}-${category}`;
                                  const isCategoryOpen = openCategories.has(categoryFullKey);

                                  return (
                                    <View key={categoryFullKey}>
                                      {/* 分類標題列 */}
                                      <TouchableOpacity
                                        style={{
                                          flexDirection: 'row',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          paddingVertical: Spacing.sm,
                                          paddingHorizontal: Spacing.sm,
                                          borderRadius: Radius.sm,
                                          backgroundColor: isCategoryOpen ? `${catToken.badge}30` : 'transparent',
                                        }}
                                        onPress={() => toggleCategory(categoryFullKey)}
                                      >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                                          {/* 分類色條 */}
                                          <View
                                            style={{
                                              width: 3,
                                              height: 16,
                                              borderRadius: 2,
                                              backgroundColor: catToken.stripe,
                                            }}
                                          />
                                          {/* 分類名稱 */}
                                          <Text style={{
                                            fontSize: FontSize.sm,
                                            fontWeight: '600',
                                            color: MibuBrand.brownDark,
                                          }}>
                                            {getCategoryLabel(category, language)}
                                          </Text>
                                          {/* 數量徽章 */}
                                          <View
                                            style={{
                                              backgroundColor: catToken.badge,
                                              paddingHorizontal: 6,
                                              paddingVertical: 1,
                                              borderRadius: Radius.full,
                                            }}
                                          >
                                            <Text style={{
                                              fontSize: FontSize.xs,
                                              fontWeight: '700',
                                              color: catToken.badgeText,
                                            }}>
                                              {categoryItems.length}
                                            </Text>
                                          </View>
                                        </View>
                                        <Ionicons
                                          name={isCategoryOpen ? 'chevron-up' : 'chevron-down'}
                                          size={14}
                                          color={isCategoryOpen ? catToken.stripe : MibuBrand.brownLight}
                                        />
                                      </TouchableOpacity>

                                      {/* 景點列表（展開時顯示）*/}
                                      {isCategoryOpen && (
                                        <View style={{ marginTop: Spacing.xs, gap: Spacing.xs }}>
                                          {categoryItems.map((item, idx) => {
                                            const placeName = getPlaceName(item);
                                            const description = getDescription(item);
                                            const date = formatDate(item.collectedAt);
                                            const isUnread = item.isRead === false;

                                            const hasCoupon = item.isCoupon && item.couponData;
                                            // #028 優惠更新通知
                                            const hasPromoUpdate = item.collectionId ? promoUpdateIds.has(item.collectionId) : false;

                                            const isMerchantPro = item.merchant?.isPro && item.merchant?.brandColor;
                                            const merchantScheme = isMerchantPro
                                              ? deriveMerchantScheme(item.merchant!.brandColor!)
                                              : null;
                                            const stripeColor = merchantScheme ? merchantScheme.accent : catToken.stripe;

                                            return (
                                              <TouchableOpacity
                                                key={`${item.id}-${idx}`}
                                                style={{
                                                  backgroundColor: MibuBrand.warmWhite,
                                                  borderRadius: Radius.md,
                                                  overflow: 'hidden',
                                                  flexDirection: 'row',
                                                  borderWidth: isUnread ? 1 : 0,
                                                  borderColor: isUnread ? MibuBrand.tierSP : 'transparent',
                                                }}
                                                onPress={() => handleItemPress(item)}
                                                activeOpacity={0.7}
                                              >
                                                {/* 左側分類色條 */}
                                                <View style={{ width: 3, backgroundColor: stripeColor }} />

                                                {/* 卡片內容 */}
                                                <View style={{ flex: 1, padding: Spacing.sm }}>
                                                  {/* 第一行：名稱 + 標籤 */}
                                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                                                    <Text
                                                      style={{
                                                        flex: 1,
                                                        fontSize: FontSize.sm,
                                                        fontWeight: '600',
                                                        color: merchantScheme ? merchantScheme.accent : MibuBrand.brownDark,
                                                      }}
                                                      numberOfLines={1}
                                                    >
                                                      {placeName}
                                                    </Text>

                                                    {/* 標籤區 */}
                                                    <View style={{ flexDirection: 'row', gap: 3, marginLeft: Spacing.xs }}>
                                                      {isUnread && (
                                                        <View style={{
                                                          backgroundColor: MibuBrand.tierSP,
                                                          paddingHorizontal: 4,
                                                          paddingVertical: 1,
                                                          borderRadius: Radius.xs,
                                                        }}>
                                                          <Text style={{ fontSize: 8, fontWeight: '700', color: '#ffffff' }}>
                                                            NEW
                                                          </Text>
                                                        </View>
                                                      )}
                                                      {hasPromoUpdate && !isUnread && (
                                                        <View style={{
                                                          backgroundColor: MibuBrand.copper,
                                                          paddingHorizontal: 4,
                                                          paddingVertical: 1,
                                                          borderRadius: Radius.xs,
                                                        }}>
                                                          <Ionicons name="gift" size={8} color="#ffffff" />
                                                        </View>
                                                      )}
                                                      {hasCoupon && (
                                                        <View style={{
                                                          backgroundColor: MibuBrand.success,
                                                          paddingHorizontal: 4,
                                                          paddingVertical: 1,
                                                          borderRadius: Radius.xs,
                                                        }}>
                                                          <Ionicons name="ticket" size={8} color="#ffffff" />
                                                        </View>
                                                      )}
                                                    </View>
                                                  </View>

                                                  {/* 第二行：描述（最多1行）*/}
                                                  {description && (
                                                    <Text
                                                      style={{
                                                        fontSize: FontSize.xs,
                                                        color: MibuBrand.brownLight,
                                                        lineHeight: 16,
                                                      }}
                                                      numberOfLines={1}
                                                    >
                                                      {description}
                                                    </Text>
                                                  )}

                                                  {/* 第三行：日期 + 商家（如果有）*/}
                                                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                                    <Text style={{ fontSize: 10, color: MibuBrand.tan }}>{date}</Text>
                                                    {item.merchant && (
                                                      <>
                                                        <Text style={{ marginHorizontal: 4, color: MibuBrand.tanLight }}>•</Text>
                                                        <Ionicons name="storefront-outline" size={9} color={MibuBrand.copper} />
                                                        <Text style={{ fontSize: 10, color: MibuBrand.copper, marginLeft: 2 }}>
                                                          {item.merchant.name}
                                                        </Text>
                                                      </>
                                                    )}
                                                  </View>
                                                </View>
                                              </TouchableOpacity>
                                            );
                                          })}
                                        </View>
                                      )}
                                    </View>
                                  );
                                })}
                            </View>
                          )}
                        </View>
                      );
                    })}
                </View>
              )}
            </View>
          );
        })}

      {selectedItem && (
        <PlaceDetailModal
          item={selectedItem}
          language={language}
          onClose={() => setSelectedItem(null)}
          onFavorite={handleFavorite}
          onBlacklist={handleBlacklist}
        />
      )}
    </ScrollView>
  );
}

