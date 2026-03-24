import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';

export type StatusType = 'safe' | 'warning' | 'danger' | 'hazard' | 'clear';

interface StatusChipProps {
  status: StatusType;
  label?: string;
}

const statusConfig: Record<StatusType, { icon: string; text: string; bg: string; color: string }> = {
  safe: { icon: '✅', text: 'Safe', bg: colors.safeBg, color: colors.safe },
  warning: { icon: '⚠️', text: 'Caution', bg: colors.warningBg, color: colors.warning },
  danger: { icon: '🚨', text: 'Detected', bg: colors.dangerBg, color: colors.danger },
  hazard: { icon: '☠️', text: 'Toxic', bg: colors.hazardBg, color: colors.hazard },
  clear: { icon: '✓', text: 'Clear', bg: '#E8F8EE', color: colors.safe },
};

export function StatusChip({ status, label }: StatusChipProps) {
  const cfg = statusConfig[status];
  return (
    <View style={[styles.chip, { backgroundColor: cfg.bg }]}>
      <Text style={styles.icon}>{cfg.icon}</Text>
      <Text style={[styles.label, { color: cfg.color }]}>{label ?? cfg.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 4,
  },
  icon: {
    fontSize: fontSizes.xs,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
});
