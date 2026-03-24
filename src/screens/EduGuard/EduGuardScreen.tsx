import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { 
  Droplet, 
  BookOpen, 
  CheckCircle, 
  FlaskConical, 
  ShieldCheck, 
  ChevronRight, 
  Info,
  Clock,
  FlaskRound as Flask,
  Zap,
  ShieldAlert,
  Beaker,
  Thermometer,
  CloudRain
} from 'lucide-react-native';

import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { Card } from '../../components/common/Card';

const { width } = Dimensions.get('window');

const CRITICAL_ADULTERANTS = [
  { 
    id: 'urea', 
    name: 'Urea', 
    description: 'Increases nitrogen content. Highly toxic for kidneys.', 
    icon: Flask, 
    color: '#DC2626', 
    bg: '#FEE2E2' 
  },
  { 
    id: 'detergent', 
    name: 'Detergent', 
    description: 'Used for emulsification. Causes gastric issues.', 
    icon: Droplet, 
    color: '#F59E0B', 
    bg: '#FEF3C7' 
  },
  { 
    id: 'starch', 
    name: 'Starch', 
    description: 'Used as thickener. Lowers nutritional value.', 
    icon: Beaker, 
    color: '#059669', 
    bg: '#DCFCE7' 
  },
];

const TEST_GUIDES = [
  { id: 't1', name: 'Iodine Test', time: '2 MIN', icon: Flask, color: '#064E3B' },
  { id: 't2', name: 'Slip Test', time: '1 MIN', icon: Droplet, color: '#059669' },
  { id: 't3', name: 'Heat Test', time: '5 MIN', icon: Thermometer, color: '#B45309' },
  { id: 't4', name: 'Filter Test', time: '3 MIN', icon: CloudRain, color: '#1E40AF' },
];

export default function EduGuardScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerUser}>
             <View style={styles.avatar}>
                <Image 
                  source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' }} 
                  style={styles.avatarImg} 
                />
             </View>
             <Text style={styles.headerTitle}>EduGuard 🏡 — Know Your Milk</Text>
          </View>
          <TouchableOpacity>
             <View style={styles.podIcon}>
                <View style={styles.podDot} />
             </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Featured Card */}
        <TouchableOpacity activeOpacity={0.9}>
          <Card style={styles.featuredCard}>
            <View style={styles.featuredContent}>
               <Text style={styles.featuredTag}>FACT CHECK</Text>
               <Text style={styles.featuredTitle}>97% of samples collected by FSSAI were found to be safe.</Text>
               <Text style={styles.featuredDesc}>However, 12 states reported presence of carcinogenic substances. Stay cautious.</Text>
               <View style={styles.learnMoreRow}>
                  <Text style={styles.learnMoreText}>Learn More</Text>
                  <ChevronRight size={14} color="white" />
               </View>
            </View>
            <View style={styles.featuredIconBg}>
               <BookOpen color="white" size={32} />
            </View>
          </Card>
        </TouchableOpacity>

        {/* Critical Adulterants */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>⚠️ Critical Adulterants</Text>
           <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
           </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.horizontalScroll}
        >
           {CRITICAL_ADULTERANTS.map(item => (
             <Card key={item.id} style={styles.adulterantCard}>
                <View style={[styles.adulterantIcon, { backgroundColor: item.bg }]}>
                   <item.icon color={item.color} size={24} />
                </View>
                <Text style={styles.adulterantName}>{item.name}</Text>
                <Text style={styles.adulterantDesc}>{item.description}</Text>
             </Card>
           ))}
        </ScrollView>

        {/* Home Test Guides */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>📋 Home Test Guides</Text>
           <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
           </TouchableOpacity>
        </View>
        
        <View style={styles.grid}>
           {TEST_GUIDES.map(test => (
             <TouchableOpacity key={test.id} style={styles.gridItem}>
                <Card style={styles.testCard}>
                   <View style={styles.testHeader}>
                      <View style={[styles.testIconBg, { backgroundColor: test.color + '15' }]}>
                         <test.icon color={test.color} size={20} />
                      </View>
                      <View style={styles.timeBadge}>
                         <Clock size={10} color="#9CA3AF" />
                         <Text style={styles.timeText}>{test.time}</Text>
                      </View>
                   </View>
                   <Text style={styles.testName}>{test.name}</Text>
                   <Text style={styles.testSub}>Detection: Starch</Text>
                </Card>
             </TouchableOpacity>
           ))}
        </View>

        {/* FSSAI Standards */}
        <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>⚖️ FSSAI Safety Standards</Text>
        </View>
        <Card padded={false} style={styles.standardsCard}>
           <View style={styles.standardsHeader}>
              <Text style={[styles.th, { flex: 2 }]}>ADULTERANT</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>SAFE LIMIT</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>RISK LEVEL</Text>
           </View>
           
           {[
             { name: 'Formalin', limit: '0.0 mg/L', risk: 'HIGH HAZARD', color: '#DC2626', bg: '#FEE2E2' },
             { name: 'Detergent', limit: '0.0%', risk: 'MODERATE RISK', color: '#B45309', bg: '#FEF3C7' },
             { name: 'Hydrogen Perox.', limit: '0.1 mg/L', risk: 'LOW RISK', color: '#059669', bg: '#DCFCE7' },
             { name: 'Neutralizers', limit: '0.0%', risk: 'HIGH HAZARD', color: '#DC2626', bg: '#FEE2E2' },
           ].map((row, i) => (
             <View key={row.name} style={[styles.stdRow, i % 2 === 1 && { backgroundColor: '#F9FAFB' }]}>
                <Text style={[styles.stdName, { flex: 2 }]}>{row.name}</Text>
                <Text style={[styles.stdLimit, { flex: 1.2 }]}>{row.limit}</Text>
                <View style={[styles.stdRisk, { flex: 1.5 }]}>
                   <View style={[styles.riskChip, { backgroundColor: row.bg }]}>
                      <Text style={[styles.riskText, { color: row.color }]}>{row.risk}</Text>
                   </View>
                </View>
             </View>
           ))}
           
           <TouchableOpacity style={styles.fssaiBtn}>
              <Text style={styles.fssaiBtnText}>Download Full FSSAI Guide (2024)</Text>
              <Info size={14} color="#9CA3AF" />
           </TouchableOpacity>
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
  headerSafe: {
    backgroundColor: '#F8FBF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#059669',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  podIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#064E3B',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 90,
  },
  featuredCard: {
    backgroundColor: '#064E3B',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    marginTop: 8,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#059669',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    lineHeight: 24,
    marginBottom: 8,
  },
  featuredDesc: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 18,
    marginBottom: 16,
  },
  learnMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  learnMoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: 'white',
  },
  featuredIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  horizontalScroll: {
    paddingBottom: 32,
    gap: 16,
  },
  adulterantCard: {
    width: 180,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  adulterantIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  adulterantName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  adulterantDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  gridItem: {
    width: (width - 40 - 12) / 2,
  },
  testCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  testIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  testName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  testSub: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  standardsCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginBottom: 40,
  },
  standardsHeader: {
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
  stdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  stdName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  stdLimit: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '700',
  },
  stdRisk: {
    alignItems: 'flex-end',
  },
  riskChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 9,
    fontWeight: '900',
  },
  fssaiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  fssaiBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
  },
});
