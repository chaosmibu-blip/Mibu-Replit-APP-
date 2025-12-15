import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { GachaItem } from '../types';
import { getCategoryLabel, getCategoryColor } from '../constants/translations';

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
  translations: Record<string, string>;
  language: string;
}

function ItemCard({ item, translations, language }: ItemCardProps) {
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

  const getDurationText = () => {
    if (item.duration) return item.duration;
    if (item.suggested_time) return item.suggested_time;
    const category = (item.category || '').toString().toLowerCase();
    if (category.includes('food') || category.includes('美食') || category === 'f') {
      return '0.5-1h';
    }
    if (category.includes('shop') || category.includes('購物') || category === 's') {
      return '1-2h';
    }
    return '2-3h';
  };

  const handleOpenMaps = () => {
    const query = item.verified_address || placeName;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  const rarity = item.rarity || 'N';
  const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.N;
  const rarityBg = RARITY_BG_COLORS[rarity] || RARITY_BG_COLORS.N;

  const hasCoupon = item.coupon_data || item.merchant?.discount;
  const couponText = (item.coupon_data?.title ? getLocalizedContent(item.coupon_data.title) : '') || item.merchant?.discount || '';
  const couponCode = item.coupon_data?.code || '';

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: categoryColor,
        overflow: 'hidden',
      }}
    >
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <View
            style={{
              backgroundColor: '#f8fafc',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#475569' }}>
              {getDurationText()}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: categoryColor + '20',
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: categoryColor }}>
              {categoryLabel}
            </Text>
          </View>
        </View>

        <Text
          style={{ fontSize: 24, fontWeight: '800', color: '#1e293b', marginBottom: 12 }}
          numberOfLines={2}
        >
          {placeName}
        </Text>

        {description ? (
          <Text
            style={{ fontSize: 15, color: '#64748b', lineHeight: 24, marginBottom: 16 }}
          >
            {description}
          </Text>
        ) : null}

        {hasCoupon && (
          <View
            style={{
              borderWidth: 2,
              borderColor: '#e5e7eb',
              borderStyle: 'dashed',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: rarityBg,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '900', color: rarityColor }}>
                {rarity}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 2 }}>
                {couponText}
              </Text>
              {couponCode && (
                <Text style={{ fontSize: 12, color: '#64748b' }}>
                  CODE: {couponCode}
                </Text>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }}
          onPress={handleOpenMaps}
        >
          <Ionicons name="location-outline" size={18} color="#64748b" />
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#64748b', marginLeft: 8 }}>
            {translations.viewOnMap || '在 Google 地圖中查看'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ItemsScreen() {
  const router = useRouter();
  const { state, t } = useApp();

  const items = state.result?.inventory || [];
  const meta = state.result?.meta;

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

  const getLocalizedString = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content[state.language] || content['zh-TW'] || content['en'] || '';
    }
    return '';
  };

  const cityName = getLocalizedString(meta?.city) || '';
  const districtName = getLocalizedString(meta?.locked_district) || '';

  return (
    <View style={{ flex: 1, backgroundColor: '#fdf2f2' }}>
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 20,
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={{ width: 32, height: 32, marginRight: 8 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1e293b' }}>
            MIBU
          </Text>
        </View>

        <Text style={{ fontSize: 36, fontWeight: '900', color: '#1e293b', marginBottom: 8 }}>
          {cityName}
        </Text>

        {districtName && (
          <Text style={{ fontSize: 16, color: '#64748b' }}>
            {t.exploring || '正在探索'}{' '}
            <Text style={{ color: '#6366f1', fontWeight: '700' }}>
              {districtName}
            </Text>
          </Text>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item, index) => (
          <ItemCard
            key={item.id || index}
            item={item}
            translations={t}
            language={state.language}
          />
        ))}
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 40,
          paddingTop: 16,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: '#1e293b',
            paddingVertical: 18,
            borderRadius: 30,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}
          onPress={handleBackToGacha}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#ffffff', marginRight: 8 }}>
            {t.reGacha || '重新扭蛋'}
          </Text>
          <Ionicons name="refresh" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
