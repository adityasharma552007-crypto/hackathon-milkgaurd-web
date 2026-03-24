import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  Droplet, 
  Info, 
  Wifi, 
  Lightbulb,
  ArrowRight,
  Box,
  Zap,
  Fingerprint
} from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';

import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useBluetoothStore } from '../../store/useBluetoothStore';
import { useScanStore } from '../../store/useScanStore';
import { ScanEngine } from '../../services/scanEngine.mock';
import { ScanStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

const SCAN_MESSAGES = [
  "Reading spectral signature...",
  "Checking for urea and neutralizers...",
  "Analysing fat content profile...",
  "Almost done — finalising result..."
];

export default function ScanScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ScanStackParamList>>();
  const { isConnected } = useBluetoothStore();
  const { addScan, setCurrentScan } = useScanStore();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);
  const [countdown, setCountdown] = useState(8);
  
  const rotateValue = useSharedValue(0);
  const progressValue = useSharedValue(0);
  const pulseValue = useSharedValue(1);

  // Ready State Animation (Pulse)
  useEffect(() => {
    if (!isScanning && isConnected) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseValue);
      pulseValue.value = 1;
    }
  }, [isScanning, isConnected]);

  useEffect(() => {
    if (isScanning) {
      rotateValue.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotateValue);
      rotateValue.value = 0;
    }
  }, [isScanning]);

  const handleStartScan = async () => {
    setIsScanning(true);
    setCountdown(8);
    setScanMessageIndex(0);
    progressValue.value = withTiming(1, { duration: 8000, easing: Easing.linear });

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const messageInterval = setInterval(() => {
      setScanMessageIndex(prev => (prev < SCAN_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 2000);

    try {
      const result = await ScanEngine.triggerScan();
      clearInterval(countdownInterval);
      clearInterval(messageInterval);
      
      addScan(result);
      setCurrentScan(result);
      
      setIsScanning(false);
      navigation.navigate('ScanResultScreen', { scanId: result.id });
    } catch (error) {
      setIsScanning(false);
      clearInterval(countdownInterval);
      clearInterval(messageInterval);
    }
  };

  const animatedPodStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>InstaScan 🔬</Text>
            <Text style={styles.headerSub}>Place milk in the cup. Set it in the Pod cradle.</Text>
          </View>
          <View style={styles.podIndicator}>
             <Wifi color="#059669" size={16} />
          </View>
        </View>

        <View style={styles.stepContainer}>
           <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.activeStep]}>
                 <Droplet color="white" size={16} />
              </View>
              <Text style={styles.stepLabel}>Pour 20ml</Text>
           </View>
           <View style={[styles.stepLine, styles.activeLine]} />
           <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.activeStep]}>
                 <Box color="white" size={16} />
              </View>
              <Text style={styles.stepLabel}>Place in Pod</Text>
           </View>
           <View style={styles.stepLine} />
           <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                 <Fingerprint color="#9CA3AF" size={16} />
              </View>
              <Text style={styles.stepLabel}>Tap Scan</Text>
           </View>
        </View>

        <View style={styles.centerSection}>
           <Animated.View style={[styles.podGraphicContainer, animatedPodStyle]}>
              <View style={styles.podOuter}>
                 <View style={styles.podInner}>
                    <View style={styles.podHole} />
                 </View>
              </View>
           </Animated.View>
           
           <View style={styles.alignmentChip}>
              <Text style={styles.alignmentText}>ALIGNMENT: READY ✅</Text>
           </View>

           {isScanning && (
             <View style={styles.scanningOverlay}>
               <Text style={styles.scanningCountdown}>{countdown}s</Text>
               <View style={styles.progressContainer}>
                 <Animated.View style={[styles.progressFill, progressStyle]} />
               </View>
               <Text style={styles.scanningMessage}>{SCAN_MESSAGES[scanMessageIndex]}</Text>
             </View>
           )}
        </View>

        <View style={styles.footer}>
           <TouchableOpacity 
             style={[styles.startBtn, isScanning && styles.disabledBtn]} 
             onPress={handleStartScan}
             disabled={isScanning}
           >
              <Text style={styles.startBtnText}>{isScanning ? 'SCANNING...' : 'Start Scan'}</Text>
           </TouchableOpacity>

           <Card style={styles.tipCard}>
              <View style={styles.tipIconBg}>
                 <Lightbulb color="#B45309" size={20} fill="#FDE68A" />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                 <Text style={styles.tipTitle}>Precision Tip</Text>
                 <Text style={styles.tipSub}>Ensure the cup is dry from outside for most accurate results.</Text>
              </View>
           </Card>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBF9',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  podIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  stepItem: {
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: '#059669',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginTop: -18,
  },
  activeLine: {
    backgroundColor: '#059669',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podGraphicContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'white',
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  podInner: {
    flex: 1,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    borderWidth: 8,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podHole: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1F2937',
  },
  alignmentChip: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 40,
  },
  alignmentText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 251, 249, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    padding: 24,
  },
  scanningCountdown: {
    fontSize: 72,
    fontWeight: '900',
    color: '#064E3B',
    marginBottom: 40,
  },
  progressContainer: {
    width: width - 40,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
  scanningMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    minHeight: 40,
  },
  footer: {
    padding: 20,
    gap: 24,
  },
  startBtn: {
    backgroundColor: '#064E3B',
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    backgroundColor: '#D1D5DB',
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tipIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  tipSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 18,
  },
});
