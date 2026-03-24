import React, { useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  Scan, 
  Map as MapIcon, 
  History as HistoryIcon, 
  BookOpen, 
  AlertTriangle,
  ChevronRight,
  Battery,
  Wifi,
  Search,
  Layout
} from 'lucide-react-native';
import Animated, { FadeInUp, SlideInDown } from 'react-native-reanimated';

import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { useBluetoothStore } from '../../store/useBluetoothStore';
import { useScanStore } from '../../store/useScanStore';
import { BottomTabParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<BottomTabParamList>>();
  const { isConnected, batteryLevel, connect } = useBluetoothStore();
  const { scans } = useScanStore();
  
  const lastScan = scans[0] || {
    id: '1',
    vendor: 'Ramesh Dairy, Vaishali Nagar',
    timestamp: new Date().toISOString(),
    score: 91,
    area: 'Vaishali Nagar',
    status: 'safe'
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning, Priya 👋</Text>
            <View style={styles.statusRow}>
              <Text style={[styles.statusText, { color: colors.safe }]}>Your Pod is connected</Text>
              <View style={[styles.statusDot, { backgroundColor: colors.safe }]} />
            </View>
          </View>
          <View style={styles.headerIcons}>
            <Wifi color={colors.textPrimary} size={22} />
            <View style={styles.avatar}>
               <Image 
                 source={{ uri: 'https://i.pravatar.cc/150?u=priya' }} 
                 style={styles.avatarImg} 
               />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.podCard}>
          <View style={styles.podLeftAccent} />
          <View style={styles.podMain}>
            <View style={styles.podIconBg}>
              <Wifi color={colors.safe} size={24} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.podTitle}>MilkGuard Pod</Text>
              <Text style={[styles.podSub, { color: colors.safe }]}>• Connected</Text>
            </View>
            <View style={styles.batteryBadge}>
               <Battery color={colors.textPrimary} size={14} />
               <Text style={styles.batteryText}>84%</Text>
            </View>
          </View>
        </Card>

        <TouchableOpacity 
          style={styles.alertBanner}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Map')}
        >
          <View style={styles.alertIconBg}>
            <AlertTriangle color="#B45309" size={20} fill="#FDE68A" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.alertTitle}>Adulteration alert in Mansarovar area — 3 reports today</Text>
            <Text style={[styles.alertLink, { color: colors.accent }]}>VIEW MAP →</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Latest Insights</Text>
        <Card shadow style={styles.insightsCard}>
          <View style={styles.insightsHeader}>
            <Text style={styles.lastScanTime}>LAST SCAN — TODAY 8:42 AM</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreBig}>91</Text>
              <Text style={styles.scoreSmall}>/100</Text>
            </View>
          </View>

          <View style={styles.vendorRow}>
            <View style={styles.shopIconBg}>
               <MapIcon color="white" size={16} fill="white" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.vendorName}>{lastScan.vendor}</Text>
            </View>
            <View style={styles.pureChip}>
               <Text style={styles.pureText}>PURE & SAFE ✅</Text>
            </View>
          </View>

          <View style={styles.purityProgress}>
             <View style={[styles.purityFill, { width: '91%' }]} />
          </View>

          <View style={styles.insightsFooter}>
            <TouchableOpacity onPress={() => navigation.navigate('Scan' as any, { screen: 'DetailedReportScreen', params: { scanId: lastScan.id } })}>
              <Text style={styles.viewReportLink}>View Full Report →</Text>
            </TouchableOpacity>
            <View style={styles.tagRow}>
              <View style={styles.tag}><Text style={styles.tagText}>Fat</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>SNF</Text></View>
              <View style={[styles.tag, { backgroundColor: '#065F46' }]}><Text style={[styles.tagText, { color: 'white' }]}>+2</Text></View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#FDBA74' }]}
            onPress={() => navigation.navigate('Scan')}
          >
            <Scan color="#92400E" size={40} strokeWidth={1.5} />
            <Text style={[styles.actionLabel, { color: '#92400E' }]}>Scan Now</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Map')}
          >
            <MapIcon color={colors.textMuted} size={40} strokeWidth={1.5} />
            <Text style={styles.actionLabel}>Vendor Map</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('History')}
          >
            <HistoryIcon color={colors.textMuted} size={40} strokeWidth={1.5} />
            <Text style={styles.actionLabel}>My Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('EduGuard' as any)}
          >
            <BookOpen color={colors.textMuted} size={40} strokeWidth={1.5} />
            <Text style={styles.actionLabel}>Learn</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.mapPreviewCard}>
           <View style={styles.mapImgPlaceholder}>
              {/* This would be a static map image */}
              <View style={styles.mapOverlay}>
                 <MapIcon color="#F43F5E" size={24} fill="#F43F5E" />
              </View>
           </View>
           <View style={styles.mapPreviewFooter}>
              <View style={styles.trustIndicator}>
                 <MapIcon color="#F43F5E" size={16} fill="#F43F5E" />
                 <Text style={styles.trustText}>Local Trust Score: 88%</Text>
              </View>
              <View style={styles.stableChip}>
                 <Text style={styles.stableText}>STABLE</Text>
              </View>
           </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBF9',
  },
  safeArea: {
    backgroundColor: '#F8FBF9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  greeting: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: '#0D3D2C',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: 90,
  },
  podCard: {
    flexDirection: 'row',
    height: 80,
    padding: 0,
    backgroundColor: '#F0FDF4',
  },
  podLeftAccent: {
    width: 3,
    height: '100%',
    backgroundColor: '#166534',
  },
  podMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  podIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  podSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  batteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    padding: 16,
    borderRadius: 40,
  },
  alertIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    lineHeight: 18,
  },
  alertLink: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: -8,
  },
  insightsCard: {
    borderRadius: 32,
    padding: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastScanTime: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.4)',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreBig: {
    fontSize: 48,
    fontWeight: '900',
    color: '#065F46',
  },
  scoreSmall: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.2)',
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  shopIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#065F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  pureChip: {
    backgroundColor: '#6EE7B7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  pureText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  purityProgress: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginTop: 20,
    overflow: 'hidden',
  },
  purityFill: {
    height: '100%',
    backgroundColor: '#064E3B',
  },
  insightsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  viewReportLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    minWidth: (width - spacing.xl * 2 - 12) / 2,
    height: 140,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  mapPreviewCard: {
     padding: 0,
     borderRadius: 32,
     backgroundColor: '#CBD5E1',
     overflow: 'hidden',
  },
  mapImgPlaceholder: {
     height: 160,
     backgroundColor: '#E2E8F0', // Simulating map
     alignItems: 'center',
     justifyContent: 'center',
  },
  mapOverlay: {
     width: 48,
     height: 48,
     borderRadius: 24,
     backgroundColor: 'rgba(255,255,255,0.8)',
     alignItems: 'center',
     justifyContent: 'center',
  },
  mapPreviewFooter: {
     backgroundColor: '#F8FAFC',
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingHorizontal: 20,
     paddingVertical: 12,
     position: 'absolute',
     bottom: 12,
     left: 12,
     right: 12,
     borderRadius: 20,
  },
  trustIndicator: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
  },
  trustText: {
     fontSize: 12,
     fontWeight: '700',
     color: '#1E293B',
  },
  stableChip: {
     backgroundColor: '#064E3B',
     paddingHorizontal: 10,
     paddingVertical: 4,
     borderRadius: 100,
  },
  stableText: {
     fontSize: 10,
     fontWeight: '800',
     color: 'white',
  },
});
