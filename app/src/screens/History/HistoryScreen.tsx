import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Filter, Calendar, Activity, CheckCircle, AlertTriangle, Wifi, Microscope, CheckCircle2, XCircle } from 'lucide-react-native';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';

import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { Card } from '../../components/common/Card';
import { useScanStore } from '../../store/useScanStore';
import { HistoryStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HistoryStackParamList>>();
  const { scans } = useScanStore();
  const [filter, setFilter] = useState('All');

  const filteredScans = scans.filter(s => {
    if (filter === 'Safe ✅') return s.score >= 85;
    if (filter === 'Warning ⚠️') return s.score >= 60 && s.score < 85;
    if (filter === 'Unsafe ❌') return s.score < 60;
    return true;
  });

  const stats = [
    { label: 'TOTAL', value: scans.length, icon: Microscope, color: '#374151', bg: '#F3F4F6' },
    { label: 'SAFE', value: scans.filter(s => s.score >= 85).length, icon: CheckCircle2, color: '#059669', bg: '#DCFCE7' },
    { label: 'UNSAFE', value: scans.filter(s => s.score < 85).length, icon: XCircle, color: '#DC2626', bg: '#FEE2E2' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>My Scan History 📋</Text>
          <View style={styles.podIndicator}>
            <Wifi color="#059669" size={16} />
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.statsRow}>
        {stats.map((stat, i) => (
          <View key={i} style={styles.statItem}>
             <View style={[styles.statCircle, { backgroundColor: stat.bg }]}>
                <stat.icon color={stat.color} size={20} />
             </View>
             <Text style={styles.statLabel}>{stat.label}</Text>
             <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <Card style={styles.overviewCard}>
         <View style={styles.overviewHeader}>
            <View>
               <Text style={styles.overviewTitle}>Safety Overview</Text>
               <Text style={styles.overviewSub}>Your milk has been safe 83% of the time</Text>
            </View>
            <View style={styles.optimalChip}>
               <Text style={styles.optimalText}>OPTIMAL</Text>
            </View>
         </View>

         <View style={styles.chartContainer}>
            <Svg width={width - 80} height={100} viewBox="0 0 300 100">
               <Path 
                 d="M0 80 Q 50 20 100 50 T 200 10 T 300 40" 
                 fill="none" 
                 stroke="#059669" 
                 strokeWidth="3"
               />
               <SvgCircle cx="100" cy="50" r="4" fill="#059669" />
               <SvgCircle cx="200" cy="10" r="4" fill="#059669" />
               <SvgCircle cx="300" cy="40" r="4" fill="#059669" />
            </Svg>
            <View style={styles.chartLabels}>
               <Text style={styles.chartLabel}>Mon</Text>
               <Text style={styles.chartLabel}>Tue</Text>
               <Text style={styles.chartLabel}>Wed</Text>
               <Text style={styles.chartLabel}>Thu</Text>
               <Text style={styles.chartLabel}>Fri</Text>
            </View>
         </View>
      </Card>

      <View style={styles.filtersWrapper}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {['All', 'Safe ✅', 'Warning ⚠️', 'Unsafe ❌'].map((f) => (
              <TouchableOpacity 
                key={f} 
                style={[styles.filterPill, filter === f && styles.activeFilter]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text>
              </TouchableOpacity>
            ))}
         </ScrollView>
      </View>

      <View style={styles.historyList}>
         <Text style={styles.sectionTitle}>Recent Scans</Text>
         {filteredScans.length > 0 ? (
           filteredScans.map(item => (
             <TouchableOpacity 
               key={item.id}
               style={[styles.scanItem, { borderLeftColor: item.score >= 85 ? '#059669' : item.score >= 60 ? '#F59E0B' : '#DC2626' }]}
               onPress={() => navigation.navigate('DetailedReportScreen', { scanId: item.id })}
             >
               <View style={styles.itemInfo}>
                 <Text style={styles.vendorName}>{item.vendor}</Text>
                 <Text style={styles.itemMeta}>
                   {new Date(item.timestamp).toLocaleDateString()} · {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </Text>
                 {item.score < 85 && (
                   <Text style={styles.issueText}>Trace amounts of urea detected ⚠️</Text>
                 )}
               </View>
               <View style={styles.scoreBadge}>
                 <Text style={styles.scoreTitle}>SCORE</Text>
                 <Text style={[styles.scoreText, { color: item.score >= 85 ? '#059669' : '#DC2626' }]}>{item.score}</Text>
               </View>
             </TouchableOpacity>
           ))
         ) : (
           <View style={styles.emptyContainer}>
             <Text style={styles.emptyText}>No matching scans found.</Text>
           </View>
         )}
      </View>
      </ScrollView>
    </View>
  );
}

// Added ScrollView import directly in local context for consistency
import { ScrollView } from 'react-native';

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
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  podIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: 12,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  statCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
  },
  overviewCard: {
    marginHorizontal: spacing.xl,
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  overviewSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  optimalChip: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  optimalText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'white',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  filtersWrapper: {
    marginBottom: 20,
  },
  filtersScroll: {
    paddingHorizontal: spacing.xl,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilter: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeFilterText: {
    color: 'white',
  },
  historyList: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 90,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  itemMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '600',
  },
  issueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 6,
  },
  scoreBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  scoreTitle: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '900',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
