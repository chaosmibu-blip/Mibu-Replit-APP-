import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MibuBrand } from '@/constants/Colors';
import { Spacing, Radius, FontSize, Shadow } from '@/theme/designTokens';

interface Segment {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function SegmentedControl({ segments, selectedKey, onSelect }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((segment) => {
        const isSelected = segment.key === selectedKey;
        return (
          <TouchableOpacity
            key={segment.key}
            style={[styles.segment, isSelected && styles.segmentSelected]}
            onPress={() => onSelect(segment.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {segment.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: MibuBrand.warmWhite,
    ...Shadow.sm,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: MibuBrand.brownLight,
  },
  labelSelected: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
});
