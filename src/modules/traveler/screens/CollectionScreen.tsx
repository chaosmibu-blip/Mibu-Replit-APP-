import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';
import { collectionApi } from '../../../services/collectionApi';
import { GachaItem, Language, CollectionItem } from '../../../types';
import { getCategoryLabel } from '../../../constants/translations';
import { MibuBrand, getCategoryToken, deriveMerchantScheme } from '../../../../constants/Colors';

// 擴展 GachaItem 類型以包含 isRead 和優惠更新狀態
type GachaItemWithRead = GachaItem & {
  isRead?: boolean;
  collectionId?: number;
  hasPromoUpdate?: boolean; // #028 優惠更新通知
};

const getPlaceName = (item: GachaItem): string => {
  return item.placeName || '';
};

const getDescription = (item: GachaItem): string => {
  return item.description || '';
};

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
};

interface PlaceDetailModalProps {
  item: GachaItem;
  language: Language;
  onClose: () => void;
}

function PlaceDetailModal({ item, language, onClose }: PlaceDetailModalProps) {
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
    // TODO: 實作收藏功能
    console.log('Favorite:', item.id);
    setShowActionMenu(false);
    onClose();
  };

  const handleBlacklist = () => {
    // TODO: 實作黑名單功能
    console.log('Blacklist:', item.id);
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
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>在 Google 搜尋</Text>
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
  const [openRegions, setOpenRegions] = useState<Set<string>>(new Set());
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
        const items: GachaItemWithRead[] = response.items.map(item => ({
          id: item.placeId || item.id?.toString() || '',
          placeId: item.placeId,
          placeName: item.placeName,
          description: item.description,
          category: item.category,
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
        }));
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

  const toggleRegion = (region: string) => {
    setOpenRegions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(region)) newSet.delete(region);
      else newSet.add(region);
      return newSet;
    });
  };

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        const regionPrefix = key.split('-')[0];
        prev.forEach(existingKey => {
          if (existingKey.startsWith(regionPrefix + '-')) {
            newSet.delete(existingKey);
          }
        });
        newSet.add(key);
      }
      return newSet;
    });
  };

  const groupedData = useMemo(() => {
    const cityMap: Record<string, { displayName: string; items: GachaItemWithRead[]; unreadCount: number; byCategory: Record<string, GachaItemWithRead[]> }> = {};

    collection.forEach(item => {
      const city = item.city || 'Unknown';
      const cityDisplay = item.cityDisplay || city;
      const category = (typeof item.category === 'string' ? item.category : '').toLowerCase() || 'other';

      if (!cityMap[city]) {
        cityMap[city] = { displayName: cityDisplay, items: [], unreadCount: 0, byCategory: {} };
      }
      cityMap[city].items.push(item);
      // 使用後端的 isRead 欄位判斷未讀
      if (item.isRead === false) {
        cityMap[city].unreadCount++;
      }

      if (!cityMap[city].byCategory[category]) {
        cityMap[city].byCategory[category] = [];
      }
      cityMap[city].byCategory[category].push(item);
    });

    return cityMap;
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
      style={{ flex: 1, backgroundColor: MibuBrand.warmWhite }}
      contentContainerStyle={{ padding: 16, paddingTop: 60, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[MibuBrand.brown]}
          tintColor={MibuBrand.brown}
        />
      }
    >
      {/* Header */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: MibuBrand.brown }}>
          {language === 'zh-TW' ? '我的圖鑑' : 'My Collection'}
        </Text>
      </View>

      {/* 統計卡片 - StatCard-like 設計 */}
      <View style={{
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
      }}>
        <View style={{
          flex: 1,
          backgroundColor: MibuBrand.creamLight,
          borderRadius: 16,
          padding: 16,
          minHeight: 100,
        }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: `${MibuBrand.brown}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
            <Ionicons name="location" size={18} color={MibuBrand.brown} />
          </View>
          <Text style={{ fontSize: 13, color: MibuBrand.copper, marginBottom: 4 }}>
            {language === 'zh-TW' ? '已收集' : 'Collected'}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: MibuBrand.brownDark }}>{totalSpots}</Text>
        </View>

        <View style={{
          flex: 1,
          backgroundColor: MibuBrand.creamLight,
          borderRadius: 16,
          padding: 16,
          minHeight: 100,
        }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: `${MibuBrand.copper}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
            <Ionicons name="map" size={18} color={MibuBrand.copper} />
          </View>
          <Text style={{ fontSize: 13, color: MibuBrand.copper, marginBottom: 4 }}>
            {language === 'zh-TW' ? '城市' : 'Cities'}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: MibuBrand.brownDark }}>{uniqueCities}</Text>
        </View>

        <View style={{
          flex: 1,
          backgroundColor: MibuBrand.creamLight,
          borderRadius: 16,
          padding: 16,
          minHeight: 100,
        }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: `${MibuBrand.tan}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}>
            <Ionicons name="grid" size={18} color={MibuBrand.tan} />
          </View>
          <Text style={{ fontSize: 13, color: MibuBrand.copper, marginBottom: 4 }}>
            {language === 'zh-TW' ? '類別' : 'Categories'}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: MibuBrand.brownDark }}>{uniqueCategories}</Text>
        </View>
      </View>

      {/* 城市列表標題 */}
      {collection.length > 0 && (
        <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.brownLight, marginBottom: 12 }}>
          {language === 'zh-TW' ? '依城市分類' : 'By City'}
        </Text>
      )}

      {Object.entries(groupedData)
        .sort((a, b) => b[1].items.length - a[1].items.length)
        .map(([regionKey, data]) => {
          const isRegionOpen = openRegions.has(regionKey);

          return (
            <View
              key={regionKey}
              style={{
                backgroundColor: MibuBrand.creamLight,
                borderRadius: 20,
                marginBottom: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
                onPress={() => toggleRegion(regionKey)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ position: 'relative' }}>
                    <View style={{ width: 40, height: 40, backgroundColor: MibuBrand.brown, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '900' }}>
                        {data.displayName.charAt(0)}
                      </Text>
                    </View>
                    {data.unreadCount > 0 && (
                      <View style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        backgroundColor: '#ef4444',
                        borderRadius: 10,
                        minWidth: 18,
                        height: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 4,
                        borderWidth: 2,
                        borderColor: MibuBrand.creamLight,
                      }}>
                        <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '700' }}>
                          {data.unreadCount > 9 ? '9+' : data.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.dark }}>{data.displayName}</Text>
                    <Text style={{ fontSize: 12, color: MibuBrand.brownLight }}>
                      {data.items.length} {t.spots}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={isRegionOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={MibuBrand.brownLight}
                />
              </TouchableOpacity>

              {isRegionOpen && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
                  {Object.entries(data.byCategory)
                    .sort((a, b) => b[1].length - a[1].length)
                    .map(([category, categoryItems]) => {
                      const catToken = getCategoryToken(category);
                      const categoryKey = `${regionKey}-${category}`;
                      const isCategoryOpen = openCategories.has(categoryKey);

                      return (
                        <View key={categoryKey}>
                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: 12,
                              borderRadius: 12,
                              backgroundColor: catToken.badge + '20',
                            }}
                            onPress={() => toggleCategory(categoryKey)}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                              <View
                                style={{
                                  width: 6,
                                  height: 24,
                                  borderRadius: 3,
                                  backgroundColor: catToken.stripe,
                                }}
                              />
                              <Text style={{ fontSize: 14, fontWeight: '700', color: MibuBrand.dark }}>
                                {getCategoryLabel(category, language)}
                              </Text>
                              <View
                                style={{
                                  backgroundColor: catToken.badge,
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                  borderRadius: 10,
                                }}
                              >
                                <Text style={{ fontSize: 12, fontWeight: '700', color: catToken.badgeText }}>
                                  {categoryItems.length}
                                </Text>
                              </View>
                            </View>
                            <Ionicons
                              name={isCategoryOpen ? 'chevron-up' : 'chevron-down'}
                              size={16}
                              color={MibuBrand.brownLight}
                            />
                          </TouchableOpacity>

                          {isCategoryOpen && (
                            <View style={{ marginTop: 8, paddingLeft: 8, gap: 8 }}>
                              {categoryItems.map((item, idx) => {
                                const placeName = getPlaceName(item);
                                const description = getDescription(item);
                                const date = formatDate(item.collectedAt);
                                const isUnread = item.isRead === false;

                                const hasPromo = item.merchant;
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
                                      borderRadius: 20,
                                      overflow: 'hidden',
                                      flexDirection: 'row',
                                      shadowColor: '#000',
                                      shadowOffset: { width: 0, height: 3 },
                                      shadowOpacity: 0.08,
                                      shadowRadius: 10,
                                      elevation: 3,
                                    }}
                                    onPress={() => handleItemPress(item)}
                                  >
                                    <View style={{ width: 4, backgroundColor: stripeColor }} />
                                    <View style={{ flex: 1, padding: 16 }}>
                                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                          <Text style={{ fontSize: 12, color: MibuBrand.brownLight }}>{date}</Text>
                                          {isUnread && (
                                            <View style={{
                                              backgroundColor: '#ef4444',
                                              paddingHorizontal: 6,
                                              paddingVertical: 2,
                                              borderRadius: 6,
                                            }}>
                                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ffffff' }}>
                                                NEW
                                              </Text>
                                            </View>
                                          )}
                                          {/* #028 優惠更新標籤 */}
                                          {hasPromoUpdate && !isUnread && (
                                            <View style={{
                                              backgroundColor: MibuBrand.tierSP,
                                              paddingHorizontal: 6,
                                              paddingVertical: 2,
                                              borderRadius: 6,
                                              flexDirection: 'row',
                                              alignItems: 'center',
                                              gap: 2,
                                            }}>
                                              <Ionicons name="gift" size={10} color="#ffffff" />
                                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ffffff' }}>
                                                {language === 'zh-TW' ? '優惠更新' : 'Promo Update'}
                                              </Text>
                                            </View>
                                          )}
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                          {hasPromo && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: MibuBrand.copper, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, gap: 3 }}>
                                              <Ionicons name="storefront" size={10} color="#ffffff" />
                                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ffffff' }}>
                                                {language === 'zh-TW' ? '合作' : 'Partner'}
                                              </Text>
                                            </View>
                                          )}
                                          {hasCoupon && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: MibuBrand.tierSP, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, gap: 3 }}>
                                              <Ionicons name="ticket" size={10} color="#ffffff" />
                                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ffffff' }}>
                                                {language === 'zh-TW' ? '優惠' : 'Coupon'}
                                              </Text>
                                            </View>
                                          )}
                                          <View
                                            style={{
                                              backgroundColor: catToken.badge,
                                              paddingHorizontal: 8,
                                              paddingVertical: 4,
                                              borderRadius: 8,
                                            }}
                                          >
                                            <Text style={{ fontSize: 10, fontWeight: '700', color: catToken.badgeText }}>
                                              {getCategoryLabel(category, language)}
                                            </Text>
                                          </View>
                                        </View>
                                      </View>
                                      <Text style={{ fontSize: 16, fontWeight: '900', color: merchantScheme ? merchantScheme.accent : MibuBrand.dark, marginBottom: 4 }}>{placeName}</Text>
                                      {description && (
                                        <Text
                                          style={{ fontSize: 14, color: MibuBrand.brownLight, lineHeight: 20 }}
                                          numberOfLines={2}
                                        >
                                          {description}
                                        </Text>
                                      )}
                                      {item.merchant && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
                                          <Ionicons name="business-outline" size={12} color={MibuBrand.copper} />
                                          <Text style={{ fontSize: 12, color: MibuBrand.copper, fontWeight: '600' }}>{item.merchant.name}</Text>
                                        </View>
                                      )}
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

      {selectedItem && (
        <PlaceDetailModal
          item={selectedItem}
          language={language}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </ScrollView>
  );
}

