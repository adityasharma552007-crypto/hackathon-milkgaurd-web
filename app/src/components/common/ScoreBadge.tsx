import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, fontSizes, fontWeights } from '../../theme';
import { getSafetyLabel } from '../../utils/scoreCalculator';

const AnimatedCircle = Animated.createAnimatedComponent(Circle as any) as any;

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function ScoreBadge({ score, size = 'md', animated = true }: ScoreBadgeProps) {
  const labelConfig = getSafetyLabel(score);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(score / 100, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      });
    } else {
      progress.value = score / 100;
    }
  }, [score, animated]);

  const config = {
    sm: { radius: 18, strokeWidth: 3, fontSize: fontSizes.xs },
    md: { radius: 30, strokeWidth: 5, fontSize: fontSizes.lg },
    lg: { radius: 50, strokeWidth: 8, fontSize: fontSizes['2xl'] },
  }[size];

  const circumference = 2 * Math.PI * config.radius;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  } as any));

  return (
    <View style={styles.container}>
      <Svg 
        width={(config.radius + config.strokeWidth) * 2} 
        height={(config.radius + config.strokeWidth) * 2}
      >
        <Circle
          cx={config.radius + config.strokeWidth}
          cy={config.radius + config.strokeWidth}
          r={config.radius}
          stroke={colors.divider}
          strokeWidth={config.strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={config.radius + config.strokeWidth}
          cy={config.radius + config.strokeWidth}
          r={config.radius}
          stroke={labelConfig.color}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          originX={config.radius + config.strokeWidth}
          originY={config.radius + config.strokeWidth}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text 
          style={[styles.scoreText, { fontSize: config.fontSize, color: labelConfig.color }]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.7}
        >
          {score}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontWeight: fontWeights.bold,
  },
});
