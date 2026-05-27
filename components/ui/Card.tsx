import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  flat?: boolean;
}

export function Card({ children, style, flat = false }: CardProps) {
  return (
    <View style={[flat ? styles.flat : styles.card, style]}>
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
  return (
    <View style={[styles.insightBase, styles[`insight_${variant}`], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.beige[100],
    borderRadius: Radius.xl,
    padding: 16,
  },
  flat: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    backgroundColor: Colors.beige[50],
    borderRadius: Radius.xl,
    padding: 14,
  },
  insightBase: {
    marginHorizontal: Spacing.xl,
    marginBottom: 10,
    borderRadius: Radius.lg,
    padding: 14,
    backgroundColor: Colors.beige[50],
    borderWidth: 1,
    borderColor: Colors.beige[100],
    borderLeftWidth: 3,
    borderLeftColor: Colors.beige[400],
  },
  insight_default: {},
  insight_blush: {
    backgroundColor: Colors.blush[50],
    borderColor: Colors.blush[100],
    borderLeftColor: Colors.blush[400],
  },
  insight_green: {
    backgroundColor: Colors.green[50],
    borderColor: Colors.green[100],
    borderLeftColor: Colors.green[400],
  },
} as any);
