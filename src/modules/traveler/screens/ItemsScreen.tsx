/**
 * ItemsScreen - 扭蛋結果畫面
 *
 * 功能：
 * - 顯示扭蛋抽到的景點列表
 * - 每個景點卡片顯示：時間預估、分類、名稱、描述
 * - 商家優惠券區塊（若有）
 * - 點擊可在 Google 地圖查看位置
 * - 底部「重新扭蛋」按鈕返回扭蛋頁
 *
 * 資料來源：
 * - state.result.inventory - 扭蛋結果列表
 * - state.result.meta - 扭蛋元資料（城市、區域、主題等）
 */
import React, { useState, useEffect } from 'react';
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
import { useI18n, useGacha } from '../../../context/AppContext';
import { GachaItem, Language, LocalizedContent, GachaMeta } from '../../../types';
import { getCategoryLabel, getCategoryColor } from '../../../constants/translations';
import { MibuBrand, SemanticColors, getCategoryToken, deriveMerchantScheme } from '../../../../constants/Colors';
import { InfoToast } from '../../shared/components/InfoToast';

// ============================================================
// 稀有度顏色定義
// ============================================================

/**
 * 稀有度對應主色
 */
const RARITY_COLORS: Record<string, string> = {
  SP: MibuBrand.tierSP,
  SSR: MibuBrand.tierSSR,
  SR: MibuBrand.tierSR,
  S: MibuBrand.tierS,
  R: MibuBrand.tierR,
  N: MibuBrand.tan,
};

/**
 * 稀有度對應背景色
 */
const RARITY_BG_COLORS: Record<string, string> = {
  SP: MibuBrand.tierSPBg,
  SSR: MibuBrand.tierSSRBg,
  SR: MibuBrand.tierSRBg,
  S: MibuBrand.tierSBg,
  R: MibuBrand.tierRBg,
  N: MibuBrand.creamLight,
};

// ============================================================
// 子元件：單一景點卡片
// ============================================================

interface ItemCardProps {
  item: GachaItem;
  translations: Record<string, string>;
  language: Language;
}

/**
 * ItemCard - 單一景點卡片
 * 顯示景點的詳細資訊，包含商家優惠券（若有）
 */
function ItemCard({ item, translations, language }: ItemCardProps) {
  // 取得分類顏色 token
  const categoryToken = getCategoryToken(item.category as string);
  const categoryLabel = getCategoryLabel(item.category as string, language);

  // 判斷是否為 PRO 商家（有品牌色）
  const isMerchantPro = item.merchant?.isPro && item.merchant?.brandColor;
  const merchantScheme = isMerchantPro
    ? deriveMerchantScheme(item.merchant!.brandColor!)
    : null;

  // PRO 商家使用品牌色，否則使用分類色
  const stripeColor = merchantScheme ? merchantScheme.accent : categoryToken.stripe;
  const titleColor = merchantScheme ? merchantScheme.accent : MibuBrand.dark;
  const merchantPromo = item.merchant?.promo;

  /**
   * 取得多語言內容
   * 支援字串或 LocalizedContent 物件
   */
  const getLocalizedContent = (content: LocalizedContent | string | null | undefined): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['zh-TW'] || content['en'] || '';
    }
    return '';
  };

  const placeName = item.placeName || '';
  const description = item.description || '';

  /**
   * 根據分類估算遊玩時間
   * - 美食：0.5-1h
   * - 購物：1-2h
   * - 其他：2-3h
   */
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

  /**
   * 開啟 Google 搜尋（查看景點位置）
   */
  const handleOpenMaps = async () => {
    if (!placeName) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(placeName)}`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      // 靜默處理，URL 開啟失敗不影響主流程
    }
  };

  // 稀有度顏色
  const rarity = item.rarity || 'N';
  const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.N;
  const rarityBg = RARITY_BG_COLORS[rarity] || RARITY_BG_COLORS.N;

  // 優惠券資訊
  const hasCoupon = item.couponData;
  // 處理 title 可能是 LocalizedContent 或 string
  const titleVal = item.couponData?.title;
  const couponText = typeof titleVal === 'string'
    ? titleVal
    : (titleVal as { [key: string]: string })?.[language] || (titleVal as { [key: string]: string })?.['zh-TW'] || '';
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
        {/* 頂部：時間預估 + 分類標籤 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          {/* 時間預估 badge */}
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

        {/* 景點名稱 */}
        <Text
          style={{ fontSize: 20, fontWeight: '700', color: titleColor, marginBottom: 8, letterSpacing: -0.3 }}
          numberOfLines={2}
        >
          {placeName}
        </Text>

        {/* 景點描述 */}
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
            {/* 稀有度 badge */}
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
            {/* 優惠券內容 */}
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

        {/* 底部：查看地圖按鈕 */}
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

// ============================================================
// 主元件
// ============================================================

export function ItemsScreen() {
  const router = useRouter();
  const { t, language } = useI18n();
  const { gachaState } = useGacha();

  // 從 gachaState 取得扭蛋結果
  const items = gachaState.result?.inventory || [];
  const meta = gachaState.result?.meta;

  // ============================================================
  // 狀態管理 - 數量不足提示
  // ============================================================

  const [showShortfallToast, setShowShortfallToast] = useState(false);
  const [shortfallMessage, setShortfallMessage] = useState('');

  /**
   * 若扭蛋結果數量不足（isShortfall），延遲顯示提示訊息
   */
  useEffect(() => {
    if (meta?.isShortfall && meta?.shortfallMessage) {
      const timer = setTimeout(() => {
        setShortfallMessage(meta.shortfallMessage || '');
        setShowShortfallToast(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [meta?.isShortfall, meta?.shortfallMessage]);

  /**
   * 返回扭蛋頁面
   */
  const handleBackToGacha = () => {
    router.back();
  };

  // ============================================================
  // 空狀態：尚無扭蛋結果
  // ============================================================

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
        {/* 空狀態圖示 */}
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
        {/* 返回扭蛋按鈕 */}
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

  // ============================================================
  // 輔助函數
  // ============================================================

  /**
   * 取得多語言字串
   */
  const getLocalizedString = (content: LocalizedContent | string | null | undefined): string => {
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      return content[language] || content['zh-TW'] || content['en'] || '';
    }
    return '';
  };

  // 取得城市和區域名稱
  const cityName = getLocalizedString(meta?.city) || '';
  const districtName = getLocalizedString(meta?.lockedDistrict) || '';

  // 主題介紹文字
  const themeIntro = meta?.themeIntro;

  // ============================================================
  // 主畫面渲染
  // ============================================================

  return (
    <View style={{ flex: 1, backgroundColor: MibuBrand.creamLight }}>
      {/* ========== 頂部區域：Logo + 城市名 ========== */}
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 16,
          alignItems: 'center',
        }}
      >
        {/* MIBU Logo */}
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

        {/* 城市名稱 */}
        <Text style={{ fontSize: 32, fontWeight: '800', color: MibuBrand.dark, marginBottom: 4, letterSpacing: -0.5 }}>
          {cityName}
        </Text>

        {/* 區域名稱 */}
        {districtName && (
          <Text style={{ fontSize: 14, color: MibuBrand.brownLight }}>
            {t.exploring || '正在探索'}{' '}
            <Text style={{ color: MibuBrand.brown, fontWeight: '600' }}>
              {districtName}
            </Text>
          </Text>
        )}

        {/* 主題介紹（若有） */}
        {themeIntro && (
          <Text style={{ fontSize: 13, color: MibuBrand.copper, marginTop: 8, textAlign: 'center', fontStyle: 'italic' }}>
            "{themeIntro}"
          </Text>
        )}
      </View>

      {/* ========== 景點列表 ========== */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item, index) => (
          <ItemCard
            key={`${item.id}-${index}`}
            item={item}
            translations={t}
            language={language}
          />
        ))}
      </ScrollView>

      {/* ========== 底部：重新扭蛋按鈕 ========== */}
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

      {/* ========== 數量不足提示 Toast ========== */}
      <InfoToast
        visible={showShortfallToast}
        message={shortfallMessage}
        duration={4000}
        onHide={() => setShowShortfallToast(false)}
      />
    </View>
  );
}
