import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../../context/AppContext';
import { collectionApi } from '../../../services/collectionApi';
import { GachaItem, Language } from '../../../types';
import { getCategoryLabel } from '../../../constants/translations';
import { MibuBrand, getCategoryToken, deriveMerchantScheme } from '../../../../constants/Colors';

const LAST_VIEWED_KEY = '@mibu_lastViewedCollection';

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

// 檢查是否為新收藏（在上次查看之後才收藏的）
const isNewSinceLastView = (collectedAt: string | undefined, lastViewedTimestamp: number): boolean => {
  if (!collectedAt || lastViewedTimestamp === 0) return false;
  try {
    const collected = new Date(collectedAt).getTime();
    return collected > lastViewedTimestamp;
  } catch {
    return false;
  }
};

interface PlaceDetailModalProps {
  item: GachaItem;
  language: Language;
  onClose: () => void;
}

function PlaceDetailModal({ item, language, onClose }: PlaceDetailModalProps) {
  const placeName = getPlaceName(item);
  const description = getDescription(item);
  const category = typeof item.category === 'string' ? item.category.toLowerCase() : '';
  const categoryToken = getCategoryToken(category);
  const date = formatDate(item.collectedAt);
  const cityDisplay = item.cityDisplay || item.city || '';
  const districtDisplay = item.districtDisplay || item.district || '';

  const handleNavigate = () => {
    let url: string;
    if (item.location) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${item.location.lat},${item.location.lng}`;
    } else {
      const query = [placeName, districtDisplay, cityDisplay].filter(Boolean).join(' ');
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
    }
    Linking.openURL(url);
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
            <TouchableOpacity 
              style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }} 
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={MibuBrand.dark} />
            </TouchableOpacity>
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
              <Ionicons name="navigate" size={20} color="#ffffff" />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>在 Google 地圖中查看</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function CollectionScreen() {
  const { state, t, getToken } = useApp();
  const { collection, language } = state;
  const [openRegions, setOpenRegions] = useState<Set<string>>(new Set());
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<GachaItem | null>(null);
  const [lastViewedTimestamp, setLastViewedTimestamp] = useState<number>(0);

  // 載入上次查看時間，並在短暫延遲後更新 + 呼叫後端 mark-read API
  useEffect(() => {
    const loadAndUpdateTimestamp = async () => {
      try {
        const stored = await AsyncStorage.getItem(LAST_VIEWED_KEY);
        const timestamp = stored ? parseInt(stored, 10) : 0;
        setLastViewedTimestamp(timestamp);

        // 短暫延遲後更新時間戳（讓用戶先看到 NEW 標籤）
        setTimeout(async () => {
          const now = Date.now();
          await AsyncStorage.setItem(LAST_VIEWED_KEY, now.toString());
          setLastViewedTimestamp(now);

          // 呼叫後端 API 標記已讀
          const token = await getToken();
          if (token) {
            collectionApi.markCollectionRead(token).catch(() => {
              // 靜默處理錯誤
            });
          }
        }, 2000);
      } catch {
        // 靜默處理錯誤
      }
    };
    loadAndUpdateTimestamp();
  }, [getToken]);

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
    const cityMap: Record<string, { displayName: string; items: GachaItem[]; newCount: number; byCategory: Record<string, GachaItem[]> }> = {};

    collection.forEach(item => {
      const city = item.city || 'Unknown';
      const cityDisplay = item.cityDisplay || city;
      const category = (typeof item.category === 'string' ? item.category : '').toLowerCase() || 'other';

      if (!cityMap[city]) {
        cityMap[city] = { displayName: cityDisplay, items: [], newCount: 0, byCategory: {} };
      }
      cityMap[city].items.push(item);
      if (isNewSinceLastView(item.collectedAt, lastViewedTimestamp)) {
        cityMap[city].newCount++;
      }

      if (!cityMap[city].byCategory[category]) {
        cityMap[city].byCategory[category] = [];
      }
      cityMap[city].byCategory[category].push(item);
    });

    return cityMap;
  }, [collection, lastViewedTimestamp]);

  if (collection.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: MibuBrand.creamLight }}>
        <Ionicons name="location-outline" size={64} color={MibuBrand.tanLight} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: MibuBrand.brownLight, marginTop: 16 }}>{t.noCollection}</Text>
        <Text style={{ fontSize: 14, color: MibuBrand.tan, marginTop: 8 }}>{t.startToCollect}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: MibuBrand.creamLight }} 
      contentContainerStyle={{ padding: 16, paddingTop: 60, paddingBottom: 100 }}
    >
      <Text style={{ fontSize: 28, fontWeight: '900', color: MibuBrand.dark, marginBottom: 16 }}>{t.myCollection}</Text>

      {Object.entries(groupedData)
        .sort((a, b) => b[1].items.length - a[1].items.length)
        .map(([regionKey, data]) => {
          const isRegionOpen = openRegions.has(regionKey);

          return (
            <View 
              key={regionKey} 
              style={{
                backgroundColor: MibuBrand.warmWhite,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: MibuBrand.tanLight,
                marginBottom: 12,
                overflow: 'hidden',
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
                    {data.newCount > 0 && (
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
                        borderColor: MibuBrand.warmWhite,
                      }}>
                        <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '700' }}>
                          {data.newCount > 9 ? '9+' : data.newCount}
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
                                const isNew = isNewSinceLastView(item.collectedAt, lastViewedTimestamp);

                                const hasPromo = item.merchant;
                                const hasCoupon = item.isCoupon && item.couponData;
                                
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
                                      borderRadius: 16,
                                      overflow: 'hidden',
                                      flexDirection: 'row',
                                      shadowColor: MibuBrand.brown,
                                      shadowOffset: { width: 0, height: 2 },
                                      shadowOpacity: 0.06,
                                      shadowRadius: 8,
                                      elevation: 2,
                                    }}
                                    onPress={() => setSelectedItem(item)}
                                  >
                                    <View style={{ width: 4, backgroundColor: stripeColor }} />
                                    <View style={{ flex: 1, padding: 16 }}>
                                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                          <Text style={{ fontSize: 12, color: MibuBrand.brownLight }}>{date}</Text>
                                          {isNew && (
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

