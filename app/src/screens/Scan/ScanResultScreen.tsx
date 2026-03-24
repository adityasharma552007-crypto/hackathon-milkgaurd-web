import React, { useEffect, useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Animated as RNAnimated
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  Easing,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
import { MapPin, Share2, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react-native';

import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { AdulterantRow } from '../../components/scan/AdulterantRow';
import { useScanStore } from '../../store/useScanStore';
import { ScanStackParamList } from '../../navigation/types';
import { getSafetyLabel } from '../../utils/scoreCalculator';

type ScanResultRouteProp = RouteProp<ScanStackParamList, 'ScanResultScreen'>;

export default function ScanResultScreen() {
  const route = useRoute<ScanResultRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<ScanStackParamList>>();
  const { scans } = useScanStore();
  
  const scanResult = useMemo(() => 
    scans.find(s => s.id === route.params.scanId), 
    [scans, route.params.scanId]
  );

  const [counter, setCounter] = useState(0);
  const flashOpacity = useSharedValue(0);

  const labelConfig = useMemo(() => 
    scanResult ? getSafetyLabel(scanResult.score) : null, 
    [scanResult]
  );

  useEffect(() => {
    if (!scanResult) return;

    // Count-up animation logic
    let start = 0;
    const end = scanResult.score;
    const duration = 800;
    const stepTime = Math.abs(Math.floor(duration / end));
    
    const timer = setInterval(() => {
      start += 1;
      setCounter(start);
      if (start >= end) clearInterval(timer);
    }, stepTime);

    // Background Flash/Pulse Logic
    if (scanResult.score >= 85) {
      flashOpacity.value = withSequence(
        withTiming(0.3, { duration: 400 }),
        withTiming(0, { duration: 400 })
      );
    } else if (scanResult.score <= 29) {
      flashOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        1
      );
    }

    return () => clearInterval(timer);
  }, [scanResult]);

  if (!scanResult || !labelConfig) return null;

  const flashStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: scanResult.score >= 85 ? colors.safe : colors.hazard,
    opacity: flashOpacity.value,
    zIndex: -1,
  }));

  const adulterants = [
    { key: 'waterAddition', value: scanResult.waterAddition },
    { key: 'urea', value: scanResult.urea },
    { key: 'detergent', value: scanResult.detergent },
    { key: 'starch', value: scanResult.starch },
    { key: 'formalin', value: scanResult.formalin },
    { key: 'neutralizers', value: scanResult.neutralizers },
    { key: 'fatContent', value: scanResult.fatContent },
  ];

  return (
    <View style={styles.container}>
      <Animated.View style={flashStyle} />
      <SafeAreaView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.topArea}>
            <View style={styles.badgeContainer}>
              <ScoreBadge score={scanResult.score} size="lg" animated />
            </View>
            <Text style={[styles.safetyLabel, { color: labelConfig.color }]}>
              {labelConfig.label}
            </Text>
            <Text style={styles.summaryText}>
              7 adulterants tested · {adulterants.filter(a => a.value.status !== 'clear' && a.value.status !== 'safe').length} flags
            </Text>
          </View>

          {scanResult.score <= 29 && (
            <View style={styles.hazardAlert}>
              <View style={styles.hazardIcon}>
                <AlertCircle color="white" size={24} />
              </View>
              <View style={styles.hazardContent}>
                <Text style={styles.hazardTitle}>Toxic substances detected.</Text>
                <Text style={styles.hazardSub}>FSSAI auto-notified.</Text>
                <TouchableOpacity>
                  <Text style={styles.hazardLink}>Track Complaint →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Card shadow style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>Scan Report</Text>
              <Text style={styles.timestamp}>
                {new Date(scanResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            
            <View style={styles.vendorBox}>
              <MapPin color={colors.textMuted} size={16} />
              <Text style={styles.vendorName}>{scanResult.vendor}</Text>
            </View>

            <View style={styles.divider} />

            {adulterants.map((item, index) => (
              <AdulterantRow 
                key={item.key} 
                name={item.key} 
                result={item.value} 
                isLast={index === adulterants.length - 1}
              />
            ))}
          </Card>

          <View style={styles.actionContainer}>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.outlineButton}>
                <MapPin color={colors.primaryDark} size={20} />
                <Text style={styles.outlineButtonText}>Pin to Map</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineButton}>
                <Share2 color={colors.textMuted} size={20} />
                <Text style={[styles.outlineButtonText, { color: colors.textMuted }]}>Share Report</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.detailedLink}
              onPress={() => navigation.navigate('DetailedReportScreen', { scanId: scanResult.id })}
            >
              <Text style={styles.detailedLinkText}>View Detailed Report →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reportProblem}>
              <Text style={styles.reportProblemText}>Report a problem with this vendor →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Utility for repeat animation (Reanimated 3 style helper)
function withRepeat(animation: any, numberOfReps = -1, reverse = false) {
  'worklet';
  return withTiming(animation.value, { duration: 0 }); // Placeholder for the actual reanimated function used in ScanScreen
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 90,
  },
  topArea: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  safetyLabel: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    marginTop: spacing.md,
  },
  summaryText: {
    fontSize: fontSizes.base,
    color: colors.textMuted,
    marginTop: 4,
  },
  hazardAlert: {
    flexDirection: 'row',
    backgroundColor: '#C0392B',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  hazardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hazardContent: {
    flex: 1,
  },
  hazardTitle: {
    color: 'white',
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
  },
  hazardSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSizes.sm,
  },
  hazardLink: {
    color: 'white',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  reportCard: {
    marginBottom: spacing.xl,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  vendorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  vendorName: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: spacing.xs,
  },
  actionContainer: {
    gap: spacing.xl,
    alignItems: 'center',
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.divider,
    gap: 8,
  },
  outlineButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.primaryDark,
  },
  badgeContainer: {
    padding: 4,
  },
  detailedLink: {
    paddingVertical: 12,
  },
  detailedLinkText: {
    fontSize: fontSizes.md,
    color: colors.primaryMid,
    fontWeight: fontWeights.bold,
  },
  reportProblem: {
    marginTop: spacing.sm,
    paddingVertical: 8,
  },
  reportProblemText: {
    fontSize: fontSizes.sm,
    color: colors.hazard,
    opacity: 0.8,
  },
});
