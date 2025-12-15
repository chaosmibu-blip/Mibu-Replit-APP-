import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { GachaItem } from '../types';
import { getCategoryLabel, getCategoryColor } from '../constants/translations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;

const RARITY_COLORS: Record<string, string> = {
  SP: '#fbbf24',
  SSR: '#a855f7',
  SR: '#3b82f6',
  R: '#22c55e',
  N: '#94a3b8',
};

const RARITY_BG_COLORS: Record<string, string> = {
  SP: '#fef3c7',
  SSR: '#f3e8ff',
  SR: '#dbeafe',
  R: '#dcfce7',
  N: '#f1f5f9',
};

interface ItemCardProps {
  item: GachaItem;
  index: number;
  onAddToBackpack: (item: GachaItem) => void;
  isInCollection: boolean;
  translations: Record<string, string>;
  language: string;
}

function ItemCard({ item, index, onAddToBackpack, isInCollection, translations, language }: ItemCardProps) {
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const isAdded = isInCollection;

  const popupScale = useSharedValue(0);
  const popupOpacity = useSharedValue(0);

  useEffect(() => {
    if (item.coupon_data || item.is_coupon) {
      const timer = setTimeout(() => {
        setShowCouponPopup(true);
        popupScale.value = withSequence(
          withSpring(1.2, { damping: 8 }),
          withSpring(1, { damping: 12 })
        );
        popupOpacity.value = withTiming(1, { duration: 300 });

        setTimeout(() => {
          popupOpacity.value = withTiming(0, { duration: 500 });
          setShowCouponPopup(false);
        }, 3000);
      }, 500 + index * 200);

      return () => clearTimeout(timer);
    }
  }, [item.coupon_data, item.is_coupon, index]);

  const couponPopupStyle = useAnimatedStyle(() => ({
    transform: [{ scale: popupScale.value }],
    opacity: popupOpacity.value,
  }));

  const rarity = item.rarity || 'N';
  const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.N;
  const rarityBg = RARITY_BG_COLORS[rarity] || RARITY_BG_COLORS.N;
  const categoryColor = getCategoryColor(item.category as string);
  const categoryLabel = getCategoryLabel(item.category as string, language as any);

  const getLocalizedContent = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['zh-TW'] || content['en'] || '';
    }
    return '';
  };

  const placeName = getLocalizedContent(item.place_name) || getLocalizedContent(item.verified_name) || '';
  const description = getLocalizedContent(item.ai_description) || getLocalizedContent(item.description) || '';

  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        marginHorizontal: 24,
        borderRadius: 24,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 8,
      }}
    >
      <View style={{ height: CARD_HEIGHT * 0.45, position: 'relative' }}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: categoryColor,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="location" size={64} color="rgba(255,255,255,0.4)" />
          </View>
        )}

        <View
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          <View
            style={{
              backgroundColor: rarityBg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '900', color: rarityColor }}>
              {rarity}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#ffffff' }}>
              {categoryLabel}
            </Text>
          </View>
        </View>

        {item.merchant && (
          <View
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: '#fef3c7',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#b45309' }}>
              {translations.partnerMerchant || '特約商家'}
            </Text>
          </View>
        )}

        {showCouponPopup && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: '30%',
                left: '50%',
                marginLeft: -80,
                width: 160,
                backgroundColor: '#10b981',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 20,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 10,
              },
              couponPopupStyle,
            ]}
          >
            <Ionicons name="gift" size={28} color="#ffffff" />
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#ffffff', marginTop: 8 }}>
              {translations.gotCoupon || '獲得優惠券！'}
            </Text>
          </Animated.View>
        )}
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        <Text
          style={{ fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 8 }}
          numberOfLines={2}
        >
          {placeName}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Ionicons name="location-outline" size={16} color="#64748b" />
          <Text style={{ fontSize: 14, color: '#64748b' }}>
            {item.districtDisplay || item.district || ''}, {item.cityDisplay || item.city || ''}
          </Text>
        </View>

        {item.google_rating && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e293b' }}>
              {item.google_rating.toFixed(1)}
            </Text>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>
              ({translations.rating || '評分'})
            </Text>
          </View>
        )}

        {item.merchant?.discount && (
          <View
            style={{
              backgroundColor: '#fef3c7',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 13, color: '#b45309', fontWeight: '600' }}>
              {item.merchant.discount}
            </Text>
          </View>
        )}

        {description ? (
          <Text
            style={{ fontSize: 13, color: '#64748b', lineHeight: 20 }}
            numberOfLines={3}
          >
            {description}
          </Text>
        ) : null}

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={{
            backgroundColor: isAdded ? '#e2e8f0' : '#6366f1',
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
          onPress={() => !isAdded && onAddToBackpack(item)}
          disabled={isAdded}
        >
          <Ionicons
            name={isAdded ? 'checkmark-circle' : 'add-circle-outline'}
            size={20}
            color={isAdded ? '#64748b' : '#ffffff'}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: isAdded ? '#64748b' : '#ffffff',
            }}
          >
            {isAdded
              ? (translations.addedToBackpack || '已加入背包')
              : (translations.addToBackpack || '加入背包')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ItemsScreen() {
  const router = useRouter();
  const { state, t, updateState, addToCollection } = useApp();
  const [locallyAdded, setLocallyAdded] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const items = state.result?.inventory || [];
  const collectionIds = new Set(state.collection.map(i => i.id));

  const isItemInCollection = (itemId: number) => {
    return collectionIds.has(itemId) || locallyAdded.has(itemId);
  };

  const handleAddToBackpack = async (item: GachaItem) => {
    try {
      await addToCollection([item]);
      setLocallyAdded(prev => new Set(prev).add(item.id));
    } catch (error) {
      console.error('Failed to add to backpack:', error);
    }
  };

  const handleBackToGacha = () => {
    router.push('/(tabs)/gacha');
  };

  if (items.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#f8fafc',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#f1f5f9',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <Ionicons name="cube-outline" size={48} color="#94a3b8" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#64748b', marginBottom: 8 }}>
          {t.noResults || '尚無結果'}
        </Text>
        <Text style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 32 }}>
          {t.tryGachaFirst || '先來一發扭蛋吧！'}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#6366f1',
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 16,
          }}
          onPress={handleBackToGacha}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>
            {t.startGacha || '開始扭蛋'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={handleBackToGacha}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff' }}>
          {t.gachaResults || '扭蛋結果'}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 6,
          marginBottom: 16,
        }}
      >
        {items.map((_, index) => (
          <View
            key={index}
            style={{
              width: index === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: index === currentIndex ? '#6366f1' : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </View>

      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={({ item, index }) => (
          <ItemCard
            item={item}
            index={index}
            onAddToBackpack={handleAddToBackpack}
            isInCollection={isItemInCollection(item.id)}
            translations={t}
            language={state.language}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 48}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: 20,
        }}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + 48));
          setCurrentIndex(index);
        }}
      />

      <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
          {currentIndex + 1} / {items.length}
        </Text>
      </View>
    </View>
  );
}
