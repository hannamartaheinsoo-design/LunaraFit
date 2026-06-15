import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

interface Props {
  step: number;
  total: number;
}

export function OnboardingProgress({ step, total }: Props) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round((step / total) * 100)}%` as any }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 2,
    backgroundColor: Colors.beige[100],
    borderRadius: 1,
    marginBottom: 36,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.blush[400],
    borderRadius: 1,
  },
});
