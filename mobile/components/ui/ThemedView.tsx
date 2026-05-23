import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '../../lib/theme';

interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'surface' | 'primary';
}

export function ThemedView({ variant = 'default', style, ...props }: ThemedViewProps) {
  const bg = variant === 'surface' ? colors.surface : variant === 'primary' ? colors.primary : colors.white;
  return <View style={[{ backgroundColor: bg }, style]} {...props} />;
}
