import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusChip } from '../../components/common/StatusChip';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { AdulterantResult } from '../../data/mockScans';
import { ADULTERANT_DB } from '../../data/adulterantDB';

interface AdulterantRowProps {
  name: string;
  result: AdulterantResult;
  isLast?: boolean;
}

export function AdulterantRow({ name, result, isLast }: AdulterantRowProps) {
  const dbInfo = ADULTERANT_DB[name];
  
  return (
    <View style={[styles.container, isLast && styles.noBorder]}>
      <View style={styles.left}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{dbInfo?.name || name}</Text>
        <Text style={styles.limit}>Limit: {result.limit}{result.unit}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.value, { color: result.status === 'safe' || result.status === 'clear' ? colors.safe : colors.hazard }]}>
          {result.value}{result.unit}
        </Text>
        <StatusChip status={result.status} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  left: {
    flex: 1,
  },
  name: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.textPrimary,
  },
  limit: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 0,
  },
  value: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
  },
});
