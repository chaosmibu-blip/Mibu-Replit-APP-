import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useApp } from '../../../context/AppContext';
import { GachaItem, Language, LocalizedContent } from '../../../types';
import { getCategoryLabel } from '../../../constants/translations';
import { MibuBrand, getCategoryToken, deriveMerchantScheme } from '../../../../constants/Colors';
import { InfoToast } from '../../shared/components/InfoToast';
import FilterChips from '../../shared/components/FilterChips';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_MARGIN = 16;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_MARGIN * 2 - CARD_GAP) / 2;

const RARITY_COLORS: Record<string, string> = {
  SP: MibuBrand.tierSP,
  SSR: MibuBrand.tierSSR,
  SR: MibuBrand.tierSR,
  S: MibuBrand.tierS,
  R: MibuBrand.tierR,
  N: MibuBrand.tan,
};

const RARITY_BG_COLORS: Record<string, string> = {
  SP: MibuBrand.tierSPBg,
  SSR: MibuBrand.tierSSRBg,
  SR: MibuBrand.tierSRBg,
  S: MibuBrand.tierSBg,
  R: MibuBrand.tierRBg,
  N: MibuBrand.creamLight,
};

const RARITY_ICONS: Record<string, string> = {
  SP: 'star',
  SSR: 'diamond',
  SR: 'ribbon',
  S: 'trophy',
  R: 'medal',
  N: 'cube',
};

// Filter options
type FilterType = 'all' | 'coupon' | 'item' | 'used';

interface GridItemCardProps {
  item: GachaItem;
  language: Language;
  onPress: () => void;
}

function GridItemCard({ item, language, onPress }: GridItemCardProps) {
  const rarity = item.rarity || 'N';
  const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.N;
  const rarityBg = RARITY_BG_COLORS[rarity] || RARITY_BG_COLORS.N;
  const rarityIcon = RARITY_ICONS[rarity] || 'cube';

  const categoryToken = getCategoryToken(item.category as string);
  const categoryLabel = getCategoryLabel(item.category as string, language);

  const hasCoupon = !!item.couponData;
  const isUsed = item.isRedeemed || false;

  const placeName = item.placeName || '';

  // Format expiry date
  const getExpiryText = () => {
    if (isUsed) return '已使用';
    if (item.couponData?.expiresAt) {
      const expiry = new Date(item.couponData.expiresAt);
      const now = new Date();
      const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) return '已過期';
      if (daysLeft <= 3) return `${daysLeft} 天後到期`;
      return expiry.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    }
    return hasCoupon ? '優惠券' : '道具';
  };

  const expiryText = getExpiryText();
  const isExpiringSoon = expiryText.includes('天後到期');
  const isExpired = expiryText === '已過期';

  return (
    <TouchableOpacity
      style={{
        width: CARD_WIDTH,
        backgroundColor: isUsed ? MibuBrand.tanLight : rarityBg,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: MibuBrand.brown,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        opacity: isUsed || isExpired ? 0.7 : 1,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Rarity badge */}
      <View
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          backgroundColor: rarityColor,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 8,
          zIndex: 1,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '800', color: MibuBrand.warmWhite }}>
          {rarity}
        </Text>
      </View>

      {/* Coupon/Item badge */}
      {hasCoupon && (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: MibuBrand.copper,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 6,
            zIndex: 1,
          }}
        >
          <Ionicons name="ticket" size={12} color={MibuBrand.warmWhite} />
        </View>
      )}

      {/* Icon area */}
      <View
        style={{
          height: 100,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 20,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: isUsed ? MibuBrand.tan : rarityColor + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={isUsed ? 'checkmark-circle' : (rarityIcon as any)}
            size={28}
            color={isUsed ? MibuBrand.brownLight : rarityColor}
          />
        </View>
      </View>

      {/* Content */}
      <View style={{ padding: 12, paddingTop: 8 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: isUsed ? MibuBrand.brownLight : MibuBrand.dark,
            marginBottom: 4,
            textAlign: 'center',
          }}
          numberOfLines={2}
        >
          {placeName}
        </Text>

        {/* Category label */}
        <View
          style={{
            alignSelf: 'center',
            backgroundColor: categoryToken.badge,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '500', color: categoryToken.badgeText }}>
            {categoryLabel}
          </Text>
        </View>

        {/* Expiry/status */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={isUsed ? 'checkmark' : isExpiringSoon ? 'time' : 'calendar-outline'}
            size={12}
            color={
              isUsed
                ? MibuBrand.success
                : isExpiringSoon
                ? MibuBrand.warning
                : isExpired
                ? MibuBrand.error
                : MibuBrand.brownLight
            }
          />
          <Text
            style={{
              fontSize: 11,
              marginLeft: 4,
              color: isUsed
                ? MibuBrand.success
                : isExpiringSoon
                ? MibuBrand.warning
                : isExpired
                ? MibuBrand.error
                : MibuBrand.brownLight,
              fontWeight: isExpiringSoon || isExpired ? '600' : '400',
            }}
          >
            {expiryText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface ItemDetailModalProps {
  item: GachaItem | null;
  visible: boolean;
  onClose: () => void;
  language: Language;
  translations: Record<string, string>;
}

function ItemDetailModal({ item, visible, onClose, language, translations }: ItemDetailModalProps) {
  if (!item) return null;

  const rarity = item.rarity || 'N';
  const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.N;
  const rarityBg = RARITY_BG_COLORS[rarity] || RARITY_BG_COLORS.N;
  const categoryToken = getCategoryToken(item.category as string);
  const categoryLabel = getCategoryLabel(item.category as string, language);

  const isMerchantPro = item.merchant?.isPro && item.merchant?.brandColor;
  const merchantScheme = isMerchantPro
    ? deriveMerchantScheme(item.merchant!.brandColor!)
    : null;

  const stripeColor = merchantScheme ? merchantScheme.accent : categoryToken.stripe;
  const placeName = item.placeName || '';
  const description = item.description || '';
  const hasCoupon = !!item.couponData;
  const couponText = item.couponData?.title || '';
  const couponCode = item.couponData?.code || '';
  const merchantPromo = item.merchant?.promo;
  const isUsed = item.isRedeemed || false;

  const handleOpenMaps = async () => {
    if (!placeName) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(placeName)}`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.log('Failed to open URL:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: MibuBrand.warmWhite,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
            overflow: 'hidden',
          }}
        >
          {/* Header with gradient */}
          <View
            style={{
              backgroundColor: rarityBg,
              paddingTop: 20,
              paddingBottom: 24,
              paddingHorizontal: 20,
              borderBottomWidth: 4,
              borderBottomColor: stripeColor,
            }}
          >
            {/* Close button */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: MibuBrand.warmWhite,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={MibuBrand.brown} />
            </TouchableOpacity>

            {/* Rarity and Category badges */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View
                style={{
                  backgroundColor: rarityColor,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: MibuBrand.warmWhite }}>
                  {rarity}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: categoryToken.badge,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: categoryToken.badgeText }}>
                  {categoryLabel}
                </Text>
              </View>
              {isUsed && (
                <View
                  style={{
                    backgroundColor: MibuBrand.success,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                    marginLeft: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: MibuBrand.warmWhite }}>
                    已使用
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: '800',
                color: MibuBrand.dark,
                letterSpacing: -0.5,
              }}
              numberOfLines={2}
            >
              {placeName}
            </Text>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Description */}
            {description ? (
              <Text
                style={{
                  fontSize: 15,
                  color: MibuBrand.brownLight,
                  lineHeight: 24,
                  marginBottom: 20,
                }}
              >
                {description}
              </Text>
            ) : null}

            {/* Merchant promo (PRO merchants) */}
            {merchantPromo && (
              <View
                style={{
                  borderWidth: 1.5,
                  borderColor: merchantScheme?.accent || MibuBrand.copper,
                  borderStyle: 'dashed',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  backgroundColor: merchantScheme?.accentLight || MibuBrand.highlight,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: MibuBrand.dark }}>
                  {merchantPromo}
                </Text>
              </View>
            )}

            {/* Coupon section */}
            {hasCoupon && (
              <View
                style={{
                  backgroundColor: MibuBrand.highlight,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: rarityBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="ticket" size={18} color={rarityColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: MibuBrand.brownLight, marginBottom: 2 }}>
                      優惠券
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.dark }}>
                      {couponText}
                    </Text>
                  </View>
                </View>

                {couponCode && (
                  <View
                    style={{
                      backgroundColor: MibuBrand.warmWhite,
                      borderRadius: 12,
                      padding: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 11, color: MibuBrand.brownLight, marginBottom: 2 }}>
                        優惠代碼
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: MibuBrand.copper, letterSpacing: 2 }}>
                        {couponCode}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: MibuBrand.copper,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: MibuBrand.warmWhite }}>
                        複製
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Map button */}
            <TouchableOpacity
              style={{
                backgroundColor: MibuBrand.brown,
                borderRadius: 14,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleOpenMaps}
            >
              <Ionicons name="location" size={18} color={MibuBrand.warmWhite} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: MibuBrand.warmWhite, marginLeft: 8 }}>
                {translations.viewOnMap || '在 Google 地圖中查看'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function ItemsScreen() {
  const router = useRouter();
  const { state, t } = useApp();

  const inventory = state.result?.inventory;
  const meta = state.result?.meta;

  // Memoize items to avoid dependency issues
  const items = useMemo(() => inventory || [], [inventory]);

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedItem, setSelectedItem] = useState<GachaItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShortfallToast, setShowShortfallToast] = useState(false);
  const [shortfallMessage, setShortfallMessage] = useState('');

  // Calculate counts for each filter
  const filterCounts = useMemo(() => {
    const couponCount = items.filter(item => item.couponData).length;
    const itemCount = items.filter(item => !item.couponData).length;
    const usedCount = items.filter(item => item.isRedeemed).length;
    return {
      all: items.length,
      coupon: couponCount,
      item: itemCount,
      used: usedCount,
    };
  }, [items]);

  // Filter items based on selected filter
  const filteredItems = useMemo(() => {
    switch (selectedFilter) {
      case 'coupon':
        return items.filter(item => item.couponData);
      case 'item':
        return items.filter(item => !item.couponData);
      case 'used':
        return items.filter(item => item.isRedeemed);
      default:
        return items;
    }
  }, [items, selectedFilter]);

  const filterOptions = [
    { key: 'all', label: '全部', count: filterCounts.all },
    { key: 'coupon', label: '優惠券', count: filterCounts.coupon },
    { key: 'item', label: '道具', count: filterCounts.item },
    { key: 'used', label: '已使用', count: filterCounts.used },
  ];

  useEffect(() => {
    if (meta?.isShortfall && meta?.shortfallMessage) {
      const timer = setTimeout(() => {
        setShortfallMessage(meta.shortfallMessage || '');
        setShowShortfallToast(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [meta?.isShortfall, meta?.shortfallMessage]);

  const handleBackToGacha = () => {
    router.back();
  };

  const handleItemPress = (item: GachaItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  if (items.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: MibuBrand.creamLight,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: MibuBrand.cream,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Ionicons name="cube-outline" size={40} color={MibuBrand.copper} />
        </View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: MibuBrand.brown, marginBottom: 6 }}>
          {t.noResults || '尚無結果'}
        </Text>
        <Text style={{ fontSize: 14, color: MibuBrand.brownLight, textAlign: 'center', marginBottom: 28 }}>
          {t.tryGachaFirst || '先來一發扭蛋吧！'}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: MibuBrand.brown,
            paddingVertical: 14,
            paddingHorizontal: 28,
            borderRadius: 24,
          }}
          onPress={handleBackToGacha}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: MibuBrand.warmWhite }}>
            {t.startGacha || '開始扭蛋'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getLocalizedString = (content: LocalizedContent | string | null | undefined): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content[state.language] || content['zh-TW'] || content['en'] || '';
    }
    return '';
  };

  const cityName = getLocalizedString(meta?.city) || '';
  const districtName = getLocalizedString(meta?.lockedDistrict) || '';
  const themeIntro = meta?.themeIntro;

  // Render items in grid layout (2 columns)
  const renderGrid = () => {
    const rows = [];
    for (let i = 0; i < filteredItems.length; i += 2) {
      const item1 = filteredItems[i];
      const item2 = filteredItems[i + 1];
      rows.push(
        <View
          key={`row-${i}`}
          style={{
            flexDirection: 'row',
            paddingHorizontal: CARD_MARGIN,
            marginBottom: CARD_GAP,
            gap: CARD_GAP,
          }}
        >
          <GridItemCard
            item={item1}
            language={state.language}
            onPress={() => handleItemPress(item1)}
          />
          {item2 ? (
            <GridItemCard
              item={item2}
              language={state.language}
              onPress={() => handleItemPress(item2)}
            />
          ) : (
            <View style={{ width: CARD_WIDTH }} />
          )}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 12,
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Image
            source={require('../../../../assets/images/icon.png')}
            style={{ width: 28, height: 28, marginRight: 6 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 16, fontWeight: '600', color: MibuBrand.brown, letterSpacing: 1 }}>
            MIBU
          </Text>
        </View>

        <Text style={{ fontSize: 28, fontWeight: '800', color: MibuBrand.dark, marginBottom: 4, letterSpacing: -0.5 }}>
          {cityName}
        </Text>

        {districtName && (
          <Text style={{ fontSize: 14, color: MibuBrand.brownLight }}>
            {t.exploring || '正在探索'}{' '}
            <Text style={{ color: MibuBrand.brown, fontWeight: '600' }}>
              {districtName}
            </Text>
          </Text>
        )}

        {themeIntro && (
          <Text style={{ fontSize: 13, color: MibuBrand.copper, marginTop: 6, textAlign: 'center', fontStyle: 'italic' }}>
            {`"${themeIntro}"`}
          </Text>
        )}
      </View>

      {/* Filter Chips */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <FilterChips
          options={filterOptions}
          selected={selectedFilter}
          onSelect={(key) => setSelectedFilter(key as FilterType)}
          scrollable={true}
        />
      </View>

      {/* Items Grid */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="search" size={48} color={MibuBrand.tanLight} />
            <Text style={{ fontSize: 16, color: MibuBrand.brownLight, marginTop: 12 }}>
              沒有符合條件的項目
            </Text>
          </View>
        ) : (
          renderGrid()
        )}
      </ScrollView>

      {/* Bottom button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 36,
          paddingTop: 12,
          backgroundColor: 'transparent',
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: MibuBrand.brown,
            paddingVertical: 16,
            borderRadius: 28,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: MibuBrand.dark,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={handleBackToGacha}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: MibuBrand.warmWhite, marginRight: 8 }}>
            {t.reGacha || '重新扭蛋'}
          </Text>
          <Ionicons name="refresh" size={18} color={MibuBrand.warmWhite} />
        </TouchableOpacity>
      </View>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        language={state.language}
        translations={t}
      />

      <InfoToast
        visible={showShortfallToast}
        message={shortfallMessage}
        duration={4000}
        onHide={() => setShowShortfallToast(false)}
      />
    </View>
  );
}
