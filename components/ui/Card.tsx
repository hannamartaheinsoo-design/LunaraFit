import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  flat?: boolean;
}

export function Card({ children, style, flat = false }: CardProps) {
  const T = useTheme();
  return (
    <View style={[
      flat ? styles.flat : styles.card,
      { backgroundColor: T.surface, borderColor: T.border },
      style,
    ]}>
      {children}
    </View>
  );
}

interface InsightCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'blush' | 'green';
  style?: ViewStyle;
}

export function InsightCard({ children, variant = 'default', style }: InsightCardProps) {
  const T = useTheme();
  const variantStyle = variant === 'blush'
    ? { backgroundColor: T.blushBg, borderColor: T.blushBorder, borderLeftColor: '#D9898B' }
    : variant === 'green'
    ? { backgroundColor: T.skyBg, borderColor: T.skyBorder, borderLeftColor: '#7A9AB0' }
    : { backgroundColor: T.surface2, borderColor: T.border, borderLeftColor: T.border2 };

  return (
    <View style={[styles.insightBase, variantStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: 16,
  },
  flat: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderRadius: Radius.xl,
    padding: 14,
  },
  insightBase: {
    marginHorizontal: Spacing.xl,
    marginBottom: 10,
    borderRadius: Radius.lg,
    padding: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
});
