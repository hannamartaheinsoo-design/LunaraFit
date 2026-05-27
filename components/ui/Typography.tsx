import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

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
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: Colors.beige[400],
    marginBottom: 8,
  },
  serifTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.beige[800],
    lineHeight: 33,
    marginBottom: 10,
    fontStyle: 'normal',
  },
  serifHeading: {
    fontSize: 26,
    fontWeight: '600',
    color: Colors.beige[800],
    lineHeight: 30,
  },
  body: {
    fontSize: 14,
    color: Colors.beige[600],
    lineHeight: 23,
    fontWeight: '300',
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.beige[600],
    marginBottom: 6,
  },
  caption: {
    fontSize: 11,
    color: Colors.beige[600],
    fontWeight: '300',
  },
});
