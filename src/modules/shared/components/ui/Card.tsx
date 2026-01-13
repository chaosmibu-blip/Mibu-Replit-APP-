import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  borderColor?: string;
  backgroundColor?: string;
}

export function Card({ children, style, onPress, borderColor, backgroundColor }: CardProps) {
  const cardStyle = [
    styles.card,
    borderColor && { borderColor, borderWidth: 2 },
    backgroundColor && { backgroundColor },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
