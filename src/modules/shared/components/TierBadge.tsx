import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MerchantCouponTier } from '../../../types';
import { getTierStyle } from '../../../constants/tierStyles';

interface TierBadgeProps {
  tier: MerchantCouponTier;
  isZh?: boolean;
  size?: 'small' | 'medium' | 'large';
  showProbability?: boolean;
}

export function TierBadge({ tier, isZh = true, size = 'medium', showProbability = false }: TierBadgeProps) {
  const style = getTierStyle(tier);
  
  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, fontSize: 10 },
    medium: { paddingHorizontal: 10, paddingVertical: 4, fontSize: 12 },
    large: { paddingHorizontal: 14, paddingVertical: 6, fontSize: 14 },
  };
  
  const currentSize = sizeStyles[size];

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        paddingHorizontal: currentSize.paddingHorizontal,
        paddingVertical: currentSize.paddingVertical,
      }
    ]}>
      <Text style={[styles.tierText, { color: style.textColor, fontSize: currentSize.fontSize }]}>
        {tier}
      </Text>
      {showProbability && (
        <Text style={[styles.probText, { color: style.textColor, fontSize: currentSize.fontSize - 2 }]}>
          {style.probability}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tierText: {
    fontWeight: '700',
  },
  probText: {
    fontWeight: '500',
    opacity: 0.8,
  },
});
