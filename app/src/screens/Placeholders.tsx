import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export default function PlaceholderScreen({ name }: { name: string }) {
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}

// Map placeholder
export const MapPlaceholder = () => <PlaceholderScreen name="Map" />;
// History placeholder
export const HistoryPlaceholder = () => <PlaceholderScreen name="History" />;
// Scan placeholder
export const ScanPlaceholder = () => <PlaceholderScreen name="Scan" />;
// Result placeholder
export const ResultPlaceholder = () => <PlaceholderScreen name="Result" />;
// Report placeholder
export const ReportPlaceholder = () => <PlaceholderScreen name="Report" />;
