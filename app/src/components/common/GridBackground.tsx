import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Svg, Pattern, Rect, Path, Line } from 'react-native-svg';
import { colors } from '../../theme';

const { width, height } = Dimensions.get('window');

export const GridBackground = () => {
  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%">
        <Pattern
          id="grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <Path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        </Pattern>
        <Rect width="100%" height="100%" fill="url(#grid)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A3121', // Darker forest green from design
  },
});
