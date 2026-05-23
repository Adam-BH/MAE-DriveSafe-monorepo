import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { colors, fontSize, spacing, radius } from '../../lib/theme';

interface AlertBannerProps {
  visible: boolean;
  message?: string;
}

export function AlertBanner({ visible, message = 'Put your phone down!' }: AlertBannerProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withRepeat(
        withSequence(withTiming(1.02, { duration: 400 }), withTiming(1, { duration: 400 })),
        -1,
        true
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = 1;
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, animStyle]}>
      <Text style={styles.icon}>📵</Text>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    marginHorizontal: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 10,
  },
  icon: { fontSize: 24 },
  text: { flex: 1, color: '#fff', fontWeight: '700', fontSize: fontSize.h3 },
});
