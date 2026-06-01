import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
}

export function Eyebrow({ children, style }: Props) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

export function SerifTitle({ children, style }: Props) {
  return <Text style={[styles.serifTitle, style]}>{children}</Text>;
}

export function SerifHeading({ children, style }: Props) {
  return <Text style={[styles.serifHeading, style]}>{children}</Text>;
}

export function BodyText({ children, style }: Props) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Label({ children, style }: Props) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function Caption({ children, style, numberOfLines }: Props) {
  return <Text style={[styles.caption, style]} numberOfLines={numberOfLines}>{children}</Text>;
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.beige[400],
    marginBottom: 8,
  },
  serifTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 28,
    color: Colors.beige[800],
    lineHeight: 33,
    marginBottom: 10,
  },
  serifHeading: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 26,
    color: Colors.beige[800],
    lineHeight: 30,
  },
  body: {
    fontFamily: Fonts.sansLight,
    fontSize: 14,
    color: Colors.beige[600],
    lineHeight: 23,
    marginBottom: 24,
  },
  label: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.beige[600],
    marginBottom: 6,
  },
  caption: {
    fontFamily: Fonts.sansLight,
    fontSize: 11,
    color: Colors.beige[600],
  },
});
