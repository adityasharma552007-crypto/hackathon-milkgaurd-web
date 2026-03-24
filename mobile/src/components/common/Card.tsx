import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  padded?: boolean;
  shadow?: boolean;
  borderColor?: string;
  style?: ViewStyle;
}

export function Card({ children, padded = true, shadow = false, borderColor, style }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        shadow && styles.shadow,
        borderColor ? { borderLeftWidth: 3, borderLeftColor: borderColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});
