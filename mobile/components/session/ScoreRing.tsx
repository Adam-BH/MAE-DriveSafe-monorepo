import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ThemedText } from '../ui/ThemedText';
import { colors, scoreColor } from '../../lib/theme';

interface ScoreRingProps {
  score: number;
  size?: number;
}

export function ScoreRing({ score, size = 160 }: ScoreRingProps) {
  const animatedScore = useSharedValue(score);
  const color = scoreColor(score);

  useEffect(() => {
    animatedScore.value = withTiming(score, { duration: 600, easing: Easing.out(Easing.quad) });
  }, [score]);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[StyleSheet.absoluteFillObject, styles.ring, { borderRadius: size / 2, borderColor: colors.border, borderWidth: strokeWidth }]} />
      <View style={[StyleSheet.absoluteFillObject, styles.ring, {
        borderRadius: size / 2,
        borderColor: color,
        borderWidth: strokeWidth,
        opacity: 0.25,
      }]} />
      <View style={styles.center}>
        <ThemedText variant="display" color={color} style={{ lineHeight: size * 0.4 }}>
          {score}
        </ThemedText>
        <ThemedText variant="small">/ 100</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute' },
  center: { alignItems: 'center' },
});
