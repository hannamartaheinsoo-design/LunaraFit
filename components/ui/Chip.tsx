import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius } from '../../constants/theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <Text style={[styles.label, selected && styles.labelOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.beige[100],
    backgroundColor: Colors.cream,
  },
  chipOn: {
    backgroundColor: Colors.blush[50],
    borderColor: Colors.blush[400],
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.beige[600],
  },
  labelOn: {
    fontFamily: Fonts.sansSemiBold,
    color: Colors.blush[800],
  },
});
