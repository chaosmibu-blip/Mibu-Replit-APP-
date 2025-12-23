import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useApp } from '../context/AppContext';
import { GachaItem } from '../types';
import { getCategoryLabel, getCategoryColor } from '../constants/translations';
import { MibuBrand, getCategoryToken, deriveMerchantScheme } from '../../constants/Colors';

const RARITY_COLORS: Record<string, string> = {
  SP: MibuBrand.tierSP,
  SSR: MibuBrand.tierSSR,
  SR: MibuBrand.tierSR,
  S: MibuBrand.tierS,
  R: MibuBrand.tierR,
  N: '#94a3b8',
};

const RARITY_BG_COLORS: Record<string, string> = {
  SP: MibuBrand.tierSPBg,
  SSR: MibuBrand.tierSSRBg,
  SR: MibuBrand.tierSRBg,
  S: MibuBrand.tierSBg,
  R: MibuBrand.tierRBg,
  N: '#f1f5f9',
};

interface ItemCardProps {
  item: GachaItem;
  translations: Record<string, string>;
  language: string;
}

function ItemCard({ item, translations, language }: ItemCardProps) {
  const categoryToken = getCategoryToken(item.category as string);
  const categoryLabel = getCategoryLabel(item.category as string, language as any);

  const isMerchantPro = item.merchant?.isPro && item.merchant?.brandColor;
  const merchantScheme = isMerchantPro 
    ? deriveMerchantScheme(item.merchant!.brandColor!) 
    : null;
  
  const stripeColor = merchantScheme ? merchantScheme.accent : categoryToken.stripe;
  const titleColor = merchantScheme ? merchantScheme.accent : MibuBrand.dark;
  const merchantPromo = item.merchant?.promo;

  const getLocalizedContent = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['zh-TW'] || content['en'] || '';
    }
    return '';
  };

  const placeName = item.placeName || '';
  const description = item.description || '';

  const getDurationText = () => {
    const category = (item.category || '').toString().toLowerCase();
    if (category.includes('food') || category.includes('美食') || category === 'f') {
      return '0.5-1h';
    }
    if (category.includes('shop') || category.includes('購物') || category === 's') {
      return '1-2h';
    }
    return '2-3h';
  };

  const handleOpenMaps = async () => {
    if (!placeName) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(placeName)}`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.log('Failed to open URL:', error);
    }
  };

  const rarity = item.rarity || 'N';
  const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.N;
  const rarityBg = RARITY_BG_COLORS[rarity] || RARITY_BG_COLORS.N;

  const hasCoupon = item.couponData;
  const couponText = item.couponData?.title || '';
  const couponCode = item.couponData?.code || '';

  return (
    <View
      style={{
        backgroundColor: MibuBrand.warmWhite,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: MibuBrand.brown,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
      {/* 左側條紋（商家PRO用品牌色，一般用類別色） */}
      <View
        style={{
          width: 4,
          backgroundColor: stripeColor,
        }}
      />
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View
            style={{
              backgroundColor: MibuBrand.creamLight,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: MibuBrand.copper }}>
              {getDurationText()}
            </Text>
          </View>

          {/* 類別標籤使用柔和色 */}
          <View
            style={{
              backgroundColor: categoryToken.badge,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: categoryToken.badgeText }}>
              {categoryLabel}
            </Text>
          </View>
        </View>

        <Text
          style={{ fontSize: 20, fontWeight: '700', color: titleColor, marginBottom: 8, letterSpacing: -0.3 }}
          numberOfLines={2}
        >
          {placeName}
        </Text>

        {description ? (
          <Text
            style={{ fontSize: 14, color: MibuBrand.brownLight, lineHeight: 22, marginBottom: 16 }}
          >
            {description}
          </Text>
        ) : null}

        {/* 商家優惠公告（PRO商家專屬） */}
        {merchantPromo && (
          <View
            style={{
              borderWidth: 1.5,
              borderColor: merchantScheme?.accent || MibuBrand.copper,
              borderStyle: 'dashed',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: MibuBrand.dark }}>
              🎁 {merchantPromo}
            </Text>
          </View>
        )}

        {/* 優惠券區塊（扭蛋獎勵） */}
        {hasCoupon && (
          <View
            style={{
              backgroundColor: MibuBrand.highlight,
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                backgroundColor: rarityBg,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                marginRight: 10,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: rarityColor }}>
                {rarity}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: MibuBrand.dark, marginBottom: 2 }}>
                {couponText}
              </Text>
              {couponCode && (
                <Text style={{ fontSize: 11, color: MibuBrand.copper }}>
                  CODE: {couponCode}
                </Text>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: MibuBrand.creamLight,
            borderRadius: 12,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={handleOpenMaps}
        >
          <Ionicons name="location-outline" size={16} color={MibuBrand.copper} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: MibuBrand.copper, marginLeft: 6 }}>
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
    router.back();
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

  const getLocalizedString = (content: any): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content[state.language] || content['zh-TW'] || content['en'] || '';
    }
    return '';
  };

  const cityName = getLocalizedString(meta?.city) || '';
  const districtName = getLocalizedString(meta?.locked_district) || '';

  const themeIntro = (meta as any)?.themeIntro;

  return (
    <View style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}>
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 16,
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={{ width: 28, height: 28, marginRight: 6 }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 16, fontWeight: '600', color: MibuBrand.brown, letterSpacing: 1 }}>
            MIBU
          </Text>
        </View>

        <Text style={{ fontSize: 32, fontWeight: '800', color: MibuBrand.dark, marginBottom: 4, letterSpacing: -0.5 }}>
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
          <Text style={{ fontSize: 13, color: MibuBrand.copper, marginTop: 8, textAlign: 'center', fontStyle: 'italic' }}>
            "{themeIntro}"
          </Text>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
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
    </View>
  );
}
