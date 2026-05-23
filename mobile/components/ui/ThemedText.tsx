import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, fontSize } from '../../lib/theme';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label';

const styles = StyleSheet.create({
  display: { fontSize: fontSize.display, fontWeight: '600', color: colors.textPrimary },
  h1: { fontSize: fontSize.h1, fontWeight: '600', color: colors.textPrimary },
  h2: { fontSize: fontSize.h2, fontWeight: '600', color: colors.textPrimary },
  h3: { fontSize: fontSize.h3, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: fontSize.body, fontWeight: '400', color: colors.textPrimary },
  small: { fontSize: fontSize.small, fontWeight: '400', color: colors.textMuted },
  label: { fontSize: fontSize.small, fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
});

interface ThemedTextProps extends TextProps {
  variant?: Variant;
  color?: string;
}

export function ThemedText({ variant = 'body', color, style, ...props }: ThemedTextProps) {
  return <Text style={[styles[variant], color ? { color } : null, style]} {...props} />;
}
