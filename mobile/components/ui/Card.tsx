import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, radius, shadow, spacing } from '../../lib/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    ...shadow.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
