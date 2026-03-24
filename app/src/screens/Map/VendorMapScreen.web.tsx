import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  TextInput, 
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView
} from 'react-native';
import { Search, Map as MapIcon, Wifi, Filter, ChevronRight, Navigation as NavIcon } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { Card } from '../../components/common/Card';
import { MOCK_REPORTS } from '../../data/vendors';

const { width } = Dimensions.get('window');

type TabType = 'Nearby Safe' | 'Reported Unsafe' | 'My Scans';

export default function VendorMapScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('Nearby Safe');

  const renderVendorItem = ({ item }: { item: any }) => {
    return (
      <Card style={styles.vendorCard} shadow>
        <View style={styles.vendorHeader}>
           <View style={{ flex: 1 }}>
              <Text style={styles.vendorName}>{item.name}</Text>
              <Text style={styles.vendorArea}>{item.area}</Text>
           </View>
           <View style={styles.scoreChip}>
              <Text style={styles.scoreText}>9.8 PURE ✅</Text>
           </View>
        </View>

        <View style={styles.vendorFooter}>
           <View style={styles.historyPreview}>
              <View style={[styles.historyDot, { backgroundColor: '#10B981' }]} />
              <View style={[styles.historyDot, { backgroundColor: '#10B981' }]} />
              <View style={[styles.historyDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.historyText}>Scan history shows consistent purity</Text>
           </View>
           <TouchableOpacity style={styles.scanHereBtn}>
              <Text style={styles.scanHereText}>SCAN HERE</Text>
           </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
             <Image 
               source={{ uri: 'https://i.pravatar.cc/150?u=priya' }} 
               style={styles.avatarImg} 
             />
          </View>
          <View>
            <Text style={styles.greeting}>Good Morning, Priya 👋</Text>
          </View>
        </View>
        <View style={styles.podIndicator}>
          <Wifi color="#059669" size={16} />
        </View>
      </View>

      <View style={styles.mapContainer}>
         <View style={styles.mapImgPlaceholder}>
            {/* Greenish tinted map overlay */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F0FDF4', opacity: 0.8 }]} />
            <View style={styles.mapMarker}>
               <MapIcon color="#F43F5E" size={24} fill="#F43F5E" />
            </View>
         </View>

         <View style={styles.searchOverlay}>
            <View style={styles.searchBar}>
               <Search color="#9CA3AF" size={20} />
               <TextInput 
                 placeholder="Search safe vendors near you" 
                 style={styles.searchInput}
                 placeholderTextColor="#9CA3AF"
               />
               <Filter color="#059669" size={20} />
            </View>
         </View>
      </View>

      <View style={styles.listSection}>
         <View style={styles.tabBar}>
            {(['Nearby Safe', 'Reported Unsafe', 'My Scans'] as TabType[]).map(tab => (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
         </View>

         <FlatList
           data={MOCK_REPORTS.filter(v => activeTab === 'Nearby Safe' ? v.avgScore >= 80 : activeTab === 'Reported Unsafe' ? v.avgScore < 60 : true)}
           renderItem={renderVendorItem}
           keyExtractor={(item) => item.id}
           contentContainerStyle={styles.listContent}
           showsVerticalScrollIndicator={false}
         />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBF9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
    backgroundColor: '#F8FBF9',
  },
  headerLeft: {
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
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  podIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  mapImgPlaceholder: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  listSection: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 24,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: 12,
    marginBottom: 20,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTabItem: {
    backgroundColor: '#064E3B',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    gap: 16,
  },
  vendorCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  vendorArea: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  scoreChip: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  vendorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  historyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  historyText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginLeft: 4,
    fontWeight: '600',
  },
  scanHereBtn: {
    backgroundColor: '#FDBA74',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  scanHereText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#92400E',
  },
});
