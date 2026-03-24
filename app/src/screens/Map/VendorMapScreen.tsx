import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  TextInput, 
  TouchableOpacity,
  FlatList
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Search, Navigation as NavIcon, Filter, AlertTriangle, Crosshair, Plus } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { Card } from '../../components/common/Card';
import { MOCK_REPORTS } from '../../data/vendors';
import { StatusChip } from '../../components/common/StatusChip';

const { width, height } = Dimensions.get('window');

const JAIPUR_REGION = {
  latitude: 26.9124,
  longitude: 75.7873,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function VendorMapScreen() {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const renderPin = (vendor: any) => {
    const color = vendor.avgScore >= 85 ? colors.safe : vendor.avgScore >= 60 ? colors.warning : colors.hazard;
    return (
      <Marker
        key={vendor.id}
        coordinate={{ latitude: vendor.lat, longitude: vendor.lng }}
        onPress={() => setSelectedVendor(vendor)}
      >
        <View style={[styles.marker, { backgroundColor: color }]}>
          <Text style={styles.markerText}>{vendor.avgScore}</Text>
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={JAIPUR_REGION}
        provider={PROVIDER_DEFAULT}
      >
        {MOCK_REPORTS.map(renderPin)}
      </MapView>

      <View style={styles.topContainer}>
        <View style={styles.searchBar}>
          <Search color={colors.textMuted} size={20} />
          <TextInput 
            placeholder="Search safe vendors near you" 
            style={styles.searchInput}
          />
          <TouchableOpacity>
            <Filter color={colors.primaryDark} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {selectedVendor ? (
        <Animated.View entering={FadeIn} style={styles.bottomDrawer}>
          <Card shadow style={styles.vendorCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.vendorName}>{selectedVendor.name}</Text>
                <Text style={styles.vendorArea}>{selectedVendor.area}</Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: selectedVendor.avgScore >= 85 ? colors.safeBg : colors.hazardBg }]}>
                <Text style={[styles.scoreVal, { color: selectedVendor.avgScore >= 85 ? colors.safe : colors.hazard }]}>
                  {selectedVendor.avgScore}
                </Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Total Scans</Text>
                <Text style={styles.statVal}>{selectedVendor.scanCount}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Status</Text>
                <StatusChip status={selectedVendor.status} />
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnNavigate}>
                <NavIcon color="white" size={18} />
                <Text style={styles.btnNavigateText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnClose} onPress={() => setSelectedVendor(null)}>
                <Text style={styles.btnCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>
      ) : (
        <View style={styles.legendOverlay}>
           <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: colors.safe }]} />
             <Text style={styles.legendText}>Safe</Text>
           </View>
           <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
             <Text style={styles.legendText}>Caution</Text>
           </View>
           <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: colors.hazard }]} />
             <Text style={styles.legendText}>Unsafe</Text>
           </View>
        </View>
      )}

      <View style={[styles.fabContainer, { bottom: selectedVendor ? 220 : 100 }]}>
        <TouchableOpacity style={styles.fabSecondary}>
          <Crosshair color={colors.primaryDark} size={24} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabPrimary}>
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topContainer: {
    position: 'absolute',
    top: 60,
    left: spacing.xl,
    right: spacing.xl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 50,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.textPrimary,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  markerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomDrawer: {
    position: 'absolute',
    bottom: 20,
    left: spacing.xl,
    right: spacing.xl,
  },
  vendorCard: {
    padding: spacing.xl,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  vendorName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  vendorArea: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  scoreBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreVal: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  stat: {
    gap: 4,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btnNavigate: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.safe,
    height: 48,
    borderRadius: 12,
  },
  btnNavigateText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: fontSizes.base,
  },
  btnClose: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    height: 48,
    borderRadius: 12,
  },
  btnCloseText: {
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  legendOverlay: {
    position: 'absolute',
    bottom: 40,
    left: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: spacing.md,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  fabContainer: {
    position: 'absolute',
    right: spacing.xl,
    gap: 12,
    alignItems: 'center',
  },
  fabPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: colors.divider,
  },
});
