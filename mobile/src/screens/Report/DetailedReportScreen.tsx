import React, { useMemo, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Share2,
  MoreVertical,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Info,
  ChevronRight,
  TrendingUp,
  Droplet,
  FlaskConical,
  Zap,
  Activity,
  User,
  ShoppingBag
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp, Layout } from 'react-native-reanimated';
import Svg, { Circle, Rect, Path, G, Text as SvgText } from 'react-native-svg';

import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { Card } from '../../components/common/Card';
import { ScoreBadge } from '../../components/common/ScoreBadge';
import { useScanStore } from '../../store/useScanStore';
import { ScanStackParamList } from '../../navigation/types';
import { getSafetyLabel } from '../../utils/scoreCalculator';

const { width } = Dimensions.get('window');

type DetailedReportRouteProp = RouteProp<ScanStackParamList, 'DetailedReportScreen'>;

export default function DetailedReportScreen() {
  const route = useRoute<DetailedReportRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<ScanStackParamList>>();
  const { scans } = useScanStore();
  
  const scan = useMemo(() => 
    scans.find(s => s.id === route.params.scanId) || scans[0], 
    [scans, route.params.scanId]
  );

  if (!scan) return null;

  const isSafe = scan.score >= 80;
  const isHazardous = scan.score < 50;
  const statusColor = isSafe ? '#059669' : isHazardous ? '#DC2626' : '#F59E0B';
  const statusBg = isSafe ? '#DCFCE7' : isHazardous ? '#FEE2E2' : '#FEF3C7';

  const parameters = [
    { name: 'Water Level', status: 'Normal / Safe', icon: CheckCircle2, iconColor: '#059669', chipBg: '#DCFCE7', chipText: '#059669' },
    { name: 'Urea', status: 'Within Limit', icon: CheckCircle2, iconColor: '#059669', chipBg: '#DCFCE7', chipText: '#059669' },
    { name: 'Detergent', status: 'Not Detected', icon: CheckCircle2, iconColor: '#059669', chipBg: '#DCFCE7', chipText: '#059669' },
    { name: 'Starch', status: 'Not Detected', icon: CheckCircle2, iconColor: '#059669', chipBg: '#DCFCE7', chipText: '#059669' },
    { name: 'Formalin', status: 'Not Detected', icon: CheckCircle2, iconColor: '#059669', chipBg: '#DCFCE7', chipText: '#059669' },
    { name: 'Fat Content', status: 'Low / Caution', icon: AlertTriangle, iconColor: '#F59E0B', chipBg: '#FFEDD5', chipText: '#92400E' },
  ];

  const scorecard = [
    { label: 'PURITY', value: '97.2%', sub: 'Excellent', color: '#059669' },
    { label: 'PROTEIN', value: '3.2 g/100ml', sub: 'Normal', color: '#059669' },
    { label: 'FAT', value: '2.8 g/100ml', sub: 'Low', color: '#F59E0B' },
    { label: 'SOLIDS (SNF)', value: '8.1%', sub: 'Balanced', color: '#064E3B' },
    { label: 'SAT', value: '0.5%', sub: 'Normal', color: '#059669' },
    { label: 'ADULTER.', value: '0 Detected', sub: 'Clean', color: '#059669' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color="#111827" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis Report</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionIcon}>
              <Share2 color="#111827" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionIcon}>
              <MoreVertical color="#111827" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Vendor Header */}
        <View style={styles.vendorHeader}>
          <Text style={styles.vendorName}>{scan.vendor}</Text>
          <View style={styles.vendorMeta}>
            <Clock size={12} color="#9CA3AF" />
            <Text style={styles.metaText}>
              {new Date(scan.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} — {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={styles.dot} />
            <Text style={styles.metaText}>RN: 292839324-99478</Text>
          </View>
        </View>

        <View style={styles.scoreSection}>
          <View style={styles.badgeContainer}>
            <ScoreBadge score={scan.score} size="lg" animated />
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
             <CheckCircle2 color={statusColor} size={16} />
             <Text style={[styles.statusBadgeText, { color: statusColor }]}>
               {isHazardous ? "Hazardous ☠️" : "Pure & Safe ✅"}
             </Text>
          </View>
          
          <Text style={styles.adulterantCount}>
            {isSafe ? "0 adulterants tested · 1 minor flag" : "Toxic substances detected. FSSAI notified."}
          </Text>
          
          <View style={styles.confidenceRow}>
             <Activity size={12} color="#9CA3AF" />
             <Text style={styles.confidenceText}>AI Confidence: 99.8%</Text>
          </View>
        </View>

        {/* Adulterant Analysis Table */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>🧪 Adulterant Analysis</Text>
        </View>
        <Card padded={false} style={styles.tableCard}>
           <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>PARAMETER</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>FOUND</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>STATUS</Text>
           </View>
           {parameters.map((p, i) => (
             <View key={p.name} style={[styles.tableRow, i % 2 === 1 && { backgroundColor: '#F9FAFB' }]}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.tdName}>{p.name}</Text>
                  <Text style={styles.tdLimit}>Limit: &lt; 3.0%</Text>
                </View>
                <Text style={[styles.tdValue, { flex: 1, textAlign: 'center' }]}>2.1%</Text>
                <View style={[styles.tdStatus, { flex: 1.5 }]}>
                   <View style={[styles.statusChip, { backgroundColor: p.chipBg }]}>
                      <p.icon size={10} color={p.iconColor} />
                      <Text style={[styles.statusChipText, { color: p.chipText }]}>{p.status.split(' / ')[0]}</Text>
                   </View>
                </View>
             </View>
           ))}
        </Card>

        {/* Concentration Levels */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>📊 Concentration Levels</Text>
        </View>
        <Card style={styles.barsCard}>
           {[
             { label: 'WATER CONTENT', value: 25, color: '#F59E0B' },
             { label: 'UREA LEVEL', value: 63, color: '#064E3B' },
             { label: 'FAT CONTENT', value: 82, color: '#F59E0B' },
           ].map(bar => (
             <View key={bar.label} style={styles.barItem}>
                <View style={styles.barLabelRow}>
                   <Text style={styles.barLabelText}>{bar.label}</Text>
                   <Text style={styles.barValueText}>{bar.value}%</Text>
                </View>
                <View style={styles.barTrack}>
                   <View style={[styles.barFill, { width: `${bar.value}%`, backgroundColor: bar.color }]} />
                   <View style={[styles.limitMarker, { left: '85%' }]} />
                </View>
             </View>
           ))}
           <Text style={styles.limitDisclaimer}>---- FSSAI SAFETY LIMIT</Text>
        </Card>

        {/* Quality Scorecard */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>🍀 Quality Scorecard</Text>
        </View>
        <View style={styles.scorecardGrid}>
           {scorecard.map(item => (
             <View key={item.label} style={styles.scorecardItem}>
                <Text style={styles.scoreLabel}>{item.label}</Text>
                <Text style={styles.scoreValue}>{item.value}</Text>
                <View style={styles.scoreStatusRow}>
                   <CheckCircle2 size={10} color={item.color} />
                   <Text style={[styles.scoreStatusText, { color: item.color }]}>{item.sub}</Text>
                </View>
             </View>
           ))}
        </View>

        {/* Recommendation */}
        <Card style={styles.recommendCard}>
           <CheckCircle2 color="#059669" size={24} />
           <View style={styles.recommendContent}>
              <Text style={styles.recommendTitle}>Our Recommendation</Text>
              <Text style={styles.recommendText}>
                This milk is safe to consume. Fat content is slightly below standard, which might affect the nutritional richness but doesn't pose health risks. Adulterants like Urea and Water are within permissible limits.
              </Text>
              <View style={styles.recommendFoot}>
                 <TouchableOpacity style={styles.recLink}>
                    <MapPin size={14} color="#059669" />
                    <Text style={styles.recLinkText}>Find Safer Vendor Nearby</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.recLink}>
                    <AlertTriangle size={14} color="#DC2626" />
                    <Text style={[styles.recLinkText, { color: '#DC2626' }]}>Report to FSSAI</Text>
                 </TouchableOpacity>
              </View>
           </View>
        </Card>

        {/* Spectral Fingerprint */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>📡 Spectral Fingerprint</Text>
           <TouchableOpacity>
              <Info size={16} color="#9CA3AF" />
           </TouchableOpacity>
        </View>
        <Text style={styles.spectralSub}>18-channel NIR reading from your MilkGuard Pod</Text>
        
        <View style={styles.expertNote}>
           <Text style={styles.expertNoteText}>
             <Text style={{ fontWeight: '800' }}>EXPERT NOTE:</Text> This chart shows the wavelengths light returns similar to medium absorption peaks, which in case to detect molecular substructures.
           </Text>
        </View>

        <Card style={styles.chartCard}>
           <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                 <View style={[styles.legendBox, { backgroundColor: '#064E3B' }]} />
                 <Text style={styles.legendText}>YOUR MILK READING</Text>
              </View>
              <View style={styles.legendItem}>
                 <View style={[styles.legendLine, { backgroundColor: '#9CA3AF' }]} />
                 <Text style={styles.legendText}>PURE MILK BASELINE</Text>
              </View>
           </View>
           
           <View style={styles.barChart}>
              {[50, 45, 40, 35, 30, 28, 35, 42, 55, 62, 70, 85, 95, 105, 115, 100, 90, 80].map((h, i) => (
                <View key={i} style={styles.chartColumn}>
                   <View style={[styles.chartBar, { height: h, backgroundColor: i > 12 && i < 15 ? '#F59E0B' : '#064E3B' }]} />
                   <View style={[styles.baselineMarker, { bottom: h - 5 }]} />
                </View>
              ))}
           </View>
           <View style={styles.chartLabels}>
              {['440nm', '650nm', '850nm', '940nm'].map(l => (
                <Text key={l} style={styles.chartLabelText}>{l}</Text>
              ))}
           </View>
        </Card>

        {/* Sticky Bottom Actions */}
        <View style={styles.bottomActions}>
           <TouchableOpacity style={styles.pinBtn}>
              <MapPin size={18} color="#064E3B" />
              <Text style={styles.pinText}>Pin to Map</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.shareBtn}>
              <Share2 size={18} color="#92400E" />
              <Text style={styles.shareText}>Save / Share PDF</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBF9',
  },
  headerSafe: {
    backgroundColor: '#F8FBF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionIcon: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  vendorHeader: {
    marginTop: 12,
    marginBottom: 24,
  },
  vendorName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#E7F3ED',
    paddingVertical: 32,
    borderRadius: 32,
  },
  badgeContainer: {
    padding: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },
  statusBadgeText: {
    fontSize: 15,
    fontWeight: '800',
  },
  adulterantCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34495E',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  tableCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    backgroundColor: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  th: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tdName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  tdValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  tdLimit: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  tdStatus: {
    alignItems: 'flex-end',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  barsCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    backgroundColor: 'white',
  },
  barItem: {
    marginBottom: 20,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  barValueText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  limitMarker: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 16,
    backgroundColor: '#EF4444',
  },
  limitDisclaimer: {
    fontSize: 9,
    fontWeight: '900',
    color: '#EF4444',
    textAlign: 'right',
    marginTop: -8,
  },
  scorecardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  scorecardItem: {
    width: (width - 40 - 24) / 3,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  scoreStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  recommendCard: {
    flexDirection: 'row',
    padding: 24,
    gap: 20,
    backgroundColor: '#DCFCE7',
    borderRadius: 24,
    borderWidth: 0,
    marginBottom: 40,
  },
  recommendContent: {
    flex: 1,
  },
  recommendTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#064E3B',
    marginBottom: 8,
  },
  recommendText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#065F46',
    marginBottom: 20,
  },
  recommendFoot: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  recLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  spectralSub: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 16,
  },
  expertNote: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  expertNoteText: {
    fontSize: 11,
    lineHeight: 18,
    color: '#4B5563',
  },
  chartCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 40,
    backgroundColor: 'white',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLine: {
    width: 16,
    height: 1,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 8,
  },
  chartColumn: {
    width: 6,
    alignItems: 'center',
    position: 'relative',
  },
  chartBar: {
    width: 6,
    borderRadius: 3,
  },
  baselineMarker: {
    position: 'absolute',
    width: 10,
    height: 1,
    backgroundColor: '#9CA3AF',
    zIndex: -1,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 12,
  },
  chartLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  pinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#064E3B',
  },
  pinText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#064E3B',
  },
  shareBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFEDD5',
  },
  shareText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
});
