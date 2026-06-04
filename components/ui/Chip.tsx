import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Radius } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: Props) {
  const T = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        { backgroundColor: T.surface, borderColor: T.border },
        selected && { backgroundColor: T.blushBg, borderColor: Colors.blush[400] },
      ]}
    >
      <Text style={[
        styles.label,
        { color: T.textSec },
        selected && { fontFamily: Fonts.sansSemiBold, color: Colors.blush[T.dark ? 200 : 800] },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
});
