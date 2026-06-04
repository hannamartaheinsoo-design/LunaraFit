import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';

interface Props {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
}

export function Eyebrow({ children, style }: Props) {
  const T = useTheme();
  return <Text style={[{ fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: T.textMuted, marginBottom: 8 }, style]}>{children}</Text>;
}

export function SerifTitle({ children, style }: Props) {
  const T = useTheme();
  return <Text style={[{ fontFamily: Fonts.serifSemiBold, fontSize: 28, color: T.text, lineHeight: 33, marginBottom: 10 }, style]}>{children}</Text>;
}

export function SerifHeading({ children, style }: Props) {
  const T = useTheme();
  return <Text style={[{ fontFamily: Fonts.serifSemiBold, fontSize: 26, color: T.text, lineHeight: 30 }, style]}>{children}</Text>;
}

export function BodyText({ children, style }: Props) {
  const T = useTheme();
  return <Text style={[{ fontFamily: Fonts.sansLight, fontSize: 14, color: T.textSec, lineHeight: 23, marginBottom: 24 }, style]}>{children}</Text>;
}

export function Label({ children, style }: Props) {
  const T = useTheme();
  return <Text style={[{ fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: T.textSec, marginBottom: 6 }, style]}>{children}</Text>;
}

export function Caption({ children, style, numberOfLines }: Props) {
  const T = useTheme();
  return <Text style={[{ fontFamily: Fonts.sansLight, fontSize: 11, color: T.textSec }, style]} numberOfLines={numberOfLines}>{children}</Text>;
}
