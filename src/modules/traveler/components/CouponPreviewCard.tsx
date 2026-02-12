/**
 * CouponPreviewCard - 優惠券預覽卡片
 *
 * 功能：
 * - 以票券樣式顯示優惠券資訊
 * - 左側顯示稀有度 badge 和機率
 * - 右側顯示優惠券名稱、內容、商家、有效期
 * - 支援緊湊模式（isCompact）
 * - 可點擊觸發回調
 *
 * 使用場景：
 * - 扭蛋結果列表
 * - 道具箱優惠券列表
 * - 優惠券詳情預覽
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CouponTier } from '../../../types';
import { UIColors } from '../../../../constants/Colors';
import { useI18n } from '../../../context/AppContext';
import { tFormat } from '../../../utils/i18n';

// ============================================================
// Props 介面定義
// ============================================================

interface CouponPreviewCardProps {
  tier: CouponTier;          // 稀有度等級
  name: string;              // 優惠券名稱
  content: string;           // 優惠券內容描述
  placeName: string;         // 商家名稱
  validUntil?: string;       // 有效期限（ISO 字串）
  onPress?: () => void;      // 點擊回調
  isCompact?: boolean;       // 是否為緊湊模式
  language?: 'zh-TW' | 'en'; // 語言設定
}

// ============================================================
// 常數定義
// ============================================================

/**
 * 稀有度樣式配置
 * - bg: 背景色
 * - border: 邊框色
 * - text: 文字色
 * - badge: 稀有度標籤背景色
 */
const TIER_STYLES: Record<CouponTier, {
  bg: string;
  border: string;
  text: string;
  badge: string;
}> = {
  SP: {
    bg: '#fffbeb',
    border: '#fbbf24',
    text: '#b45309',
    badge: '#fbbf24',
  },
  SSR: {
    bg: '#fdf2f8',
    border: '#f472b6',
    text: '#be185d',
    badge: '#f472b6',
  },
  SR: {
    bg: '#eff6ff',
    border: '#60a5fa',
    text: '#1d4ed8',
    badge: '#60a5fa',
  },
  S: {
    bg: '#f0fdf4',
    border: '#4ade80',
    text: '#16a34a',
    badge: '#4ade80',
  },
  R: {
    bg: '#f8fafc',
    border: '#cbd5e1',
    text: '#475569',
    badge: '#94a3b8',
  },
};

/**
 * 稀有度對應機率（顯示用）
 */
const TIER_PROBABILITY: Record<CouponTier, string> = {
  SP: '0.1%',
  SSR: '0.9%',
  SR: '4%',
  S: '15%',
  R: '80%',
};

// ============================================================
// 主元件
// ============================================================

const CouponPreviewCard = React.memo(function CouponPreviewCard({
  tier,
  name,
  content,
  placeName,
  validUntil,
  onPress,
  isCompact = false,
  language = 'zh-TW',
}: CouponPreviewCardProps) {
  // 根據稀有度和緊湊模式生成樣式（useMemo 避免每次渲染重建 StyleSheet）
  const styles = useMemo(() => createStyles(TIER_STYLES[tier], isCompact), [tier, isCompact]);

  // 多語系翻譯
  const { t } = useI18n();

  /**
   * 格式化有效期限
   * @param dateStr ISO 日期字串
   * @returns 格式化後的日期字串
   */
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return tFormat(t.economy_couponExpiry, {
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
  };

  // 可點擊時使用 TouchableOpacity，否則使用 View
  const CardWrapper = onPress ? TouchableOpacity : View;

  // ============================================================
  // 渲染
  // ============================================================

  return (
    <CardWrapper
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* ========== 左側：稀有度區塊 ========== */}
      <View style={styles.tierSection}>
        {/* 稀有度 badge */}
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>{tier}</Text>
        </View>
        {/* 機率顯示 */}
        <Text style={styles.tierProb}>{TIER_PROBABILITY[tier]}</Text>
      </View>

      {/* ========== 虛線分隔（票券撕裂效果） ========== */}
      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        {/* 上方半圓缺口 */}
        <View style={styles.separatorCircleTop} />
        {/* 下方半圓缺口 */}
        <View style={styles.separatorCircleBottom} />
      </View>

      {/* ========== 右側：優惠券資訊 ========== */}
      <View style={styles.infoSection}>
        {/* 優惠券名稱 */}
        <Text style={styles.couponName} numberOfLines={1}>
          {name}
        </Text>
        {/* 優惠券內容（非緊湊模式才顯示） */}
        {!isCompact && (
          <Text style={styles.couponContent} numberOfLines={2}>
            {content}
          </Text>
        )}
        {/* 元資訊列：商家 + 有效期 */}
        <View style={styles.metaRow}>
          {/* 商家名稱 */}
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color="#64748b" />
            <Text style={styles.metaText} numberOfLines={1}>
              {placeName}
            </Text>
          </View>
          {/* 有效期限 */}
          {validUntil && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color="#64748b" />
              <Text style={styles.metaText}>{formatDate(validUntil)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ========== 右側箭頭（可點擊時顯示） ========== */}
      {onPress && (
        <View style={styles.arrowSection}>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </View>
      )}
    </CardWrapper>
  );
});

export default CouponPreviewCard;

// ============================================================
// 樣式工廠函數
// ============================================================

/**
 * 根據稀有度樣式和緊湊模式動態生成樣式
 * @param tierStyle 稀有度樣式配置
 * @param isCompact 是否為緊湊模式
 */
const createStyles = (tierStyle: typeof TIER_STYLES.SP, isCompact: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: tierStyle.bg,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: tierStyle.border,
      overflow: 'hidden',
      minHeight: isCompact ? 80 : 100,
    },
    tierSection: {
      width: 60,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
    },
    tierBadge: {
      backgroundColor: tierStyle.badge,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 4,
    },
    tierText: {
      color: UIColors.white,
      fontSize: 14,
      fontWeight: '900',
    },
    tierProb: {
      color: tierStyle.text,
      fontSize: 10,
      fontWeight: '600',
    },
    separator: {
      width: 1,
      position: 'relative',
      marginVertical: 8,
    },
    separatorLine: {
      flex: 1,
      borderLeftWidth: 1,
      borderLeftColor: tierStyle.border,
      borderStyle: 'dashed',
    },
    separatorCircleTop: {
      position: 'absolute',
      top: -12,
      left: -6,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: UIColors.white,
    },
    separatorCircleBottom: {
      position: 'absolute',
      bottom: -12,
      left: -6,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: UIColors.white,
    },
    infoSection: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 14,
      justifyContent: 'center',
    },
    couponName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: isCompact ? 4 : 6,
    },
    couponContent: {
      fontSize: 13,
      color: UIColors.textSecondary,
      lineHeight: 18,
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 11,
      color: UIColors.textSecondary,
      maxWidth: 100,
    },
    arrowSection: {
      justifyContent: 'center',
      paddingRight: 12,
    },
  });
