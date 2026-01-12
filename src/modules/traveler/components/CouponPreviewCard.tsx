/**
 * CouponPreviewCard - 優惠券預覽卡片
 *
 * 用於在結果列表或物品箱中顯示優惠券資訊
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CouponTier } from '../../../types';

interface CouponPreviewCardProps {
  tier: CouponTier;
  name: string;
  content: string;
  placeName: string;
  validUntil?: string;
  onPress?: () => void;
  isCompact?: boolean;
  language?: 'zh-TW' | 'en';
}

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

const TIER_PROBABILITY: Record<CouponTier, string> = {
  SP: '0.1%',
  SSR: '0.9%',
  SR: '4%',
  S: '15%',
  R: '80%',
};

export default function CouponPreviewCard({
  tier,
  name,
  content,
  placeName,
  validUntil,
  onPress,
  isCompact = false,
  language = 'zh-TW',
}: CouponPreviewCardProps) {
  const styles = createStyles(TIER_STYLES[tier], isCompact);
  const isZh = language === 'zh-TW';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isZh
      ? `${date.getMonth() + 1}/${date.getDate()} 到期`
      : `Exp: ${date.getMonth() + 1}/${date.getDate()}`;
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Left: Tier badge */}
      <View style={styles.tierSection}>
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>{tier}</Text>
        </View>
        <Text style={styles.tierProb}>{TIER_PROBABILITY[tier]}</Text>
      </View>

      {/* Dashed separator */}
      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        <View style={styles.separatorCircleTop} />
        <View style={styles.separatorCircleBottom} />
      </View>

      {/* Right: Coupon info */}
      <View style={styles.infoSection}>
        <Text style={styles.couponName} numberOfLines={1}>
          {name}
        </Text>
        {!isCompact && (
          <Text style={styles.couponContent} numberOfLines={2}>
            {content}
          </Text>
        )}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color="#64748b" />
            <Text style={styles.metaText} numberOfLines={1}>
              {placeName}
            </Text>
          </View>
          {validUntil && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color="#64748b" />
              <Text style={styles.metaText}>{formatDate(validUntil)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Arrow for clickable cards */}
      {onPress && (
        <View style={styles.arrowSection}>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </View>
      )}
    </CardWrapper>
  );
}

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
      color: '#ffffff',
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
      backgroundColor: '#ffffff',
    },
    separatorCircleBottom: {
      position: 'absolute',
      bottom: -12,
      left: -6,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#ffffff',
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
      color: '#64748b',
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
      color: '#64748b',
      maxWidth: 100,
    },
    arrowSection: {
      justifyContent: 'center',
      paddingRight: 12,
    },
  });
