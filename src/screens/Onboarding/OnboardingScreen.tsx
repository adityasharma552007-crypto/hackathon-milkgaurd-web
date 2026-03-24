import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Shield, Lock, ShieldCheck, ArrowRight } from 'lucide-react-native';

import { colors, fontSizes, fontWeights, spacing } from '../../theme';
import { GridBackground } from '../../components/common/GridBackground';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const ArchLogo = () => (
  <View style={styles.archContainer}>
    <Svg width="140" height="180" viewBox="0 0 140 180">
      <Path
        d="M0 70C0 31.3401 31.3401 0 70 0C108.66 0 140 31.3401 140 70V180H0V70Z"
        fill="white"
      />
    </Svg>
    <View style={styles.shieldWrapper}>
      <Shield color="#0A3121" size={48} strokeWidth={2.5} />
    </View>
  </View>
);

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleStart = () => {
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <GridBackground />
      
      <SafeAreaView style={styles.content}>
        <Animated.View 
          entering={FadeIn.delay(300).duration(800)} 
          style={styles.logoContainer}
        >
          <ArchLogo />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>MilkGuard</Text>
          <Text style={styles.tagline}>Safe Milk. Scanned in Seconds.</Text>
        </View>

        <Animated.View 
          entering={SlideInUp.delay(500).duration(800).springify()}
          style={styles.footer}
        >
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Get Started</Text>
            <ArrowRight color="white" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
          
          <View style={styles.bottomSection}>
            <Text style={styles.trusted}>TRUSTED BY FAMILIES ACROSS INDIA</Text>
            <View style={styles.socialProof}>
              <ShieldCheck color="rgba(255,255,255,0.4)" size={20} />
              <Lock color="rgba(255,255,255,0.4)" size={20} />
              <Shield color="rgba(255,255,255,0.4)" size={20} />
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['3xl'],
  },
  logoContainer: {
    marginTop: spacing['3xl'] * 1.5,
  },
  archContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldWrapper: {
    position: 'absolute',
    top: 60,
    width: 80,
    paddingHorizontal: spacing.xl,
    paddingVertical: 16,
    backgroundColor: '#F8FBF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: -spacing['3xl'],
  },
  title: {
    fontSize: 56,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: fontSizes.lg,
    color: colors.primaryMid,
    fontWeight: fontWeights.semibold,
  },
  footer: {
    width: '100%',
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    gap: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  startButton: {
    backgroundColor: colors.accent,
    width: '100%',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 12,
  },
  trusted: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
  socialProof: {
    flexDirection: 'row',
    gap: 20,
    opacity: 0.5,
  },
});
