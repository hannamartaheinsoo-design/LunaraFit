import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';

type Variant = 'dark' | 'blush' | 'berry' | 'green' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  children: React.ReactNode;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  children,
  onPress,
  variant = 'dark',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  style,
}: Props) {
  const T = useTheme();

  const outlineBorderColor = T.dark ? T.border2 : Colors.beige[200];
  const ghostBorderColor   = T.dark ? T.border  : Colors.beige[100];
  const outlineTextColor   = T.dark ? T.textSec : Colors.beige[600];
  const ghostTextColor     = T.dark ? T.textMuted : Colors.beige[400];
  const darkBg             = T.dark ? '#EFEFEF' : Colors.beige[800];
  const darkText           = T.dark ? '#0C0C0C' : Colors.cream;

  const variantStyle: ViewStyle =
    variant === 'outline' ? { borderColor: outlineBorderColor } :
    variant === 'ghost'   ? { borderColor: ghostBorderColor } :
    variant === 'dark'    ? { backgroundColor: darkBg } : {};

  const textColor =
    variant === 'outline' ? outlineTextColor :
    variant === 'ghost'   ? ghostTextColor :
    variant === 'dark'    ? darkText : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        variantStyle,
        styles[`size_${size}` as any],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? outlineTextColor : '#fff'} size="small" />
      ) : (
        <Text style={[
          styles.text,
          styles[`text_${variant}` as any],
          styles[`textSize_${size}` as any],
          textColor ? { color: textColor } : undefined,
        ]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  dark:    { backgroundColor: Colors.beige[800] },
  blush:   { backgroundColor: Colors.blush[400] },
  berry:   { backgroundColor: Colors.berry[400] },
  green:   { backgroundColor: Colors.green[400] },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.beige[200] },
  ghost:   { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.beige[100] },
  danger:  { backgroundColor: Colors.error.bg, borderWidth: 1, borderColor: '#E0A0A0' },

  size_sm: { paddingVertical: 7, paddingHorizontal: 14 },
  size_md: { paddingVertical: 12, paddingHorizontal: 20 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 24 },

  text:          { fontFamily: Fonts.sansBold, letterSpacing: 0.9, textTransform: 'uppercase' },
  text_dark:     { color: Colors.cream },
  text_blush:    { color: '#fff' },
  text_berry:    { color: '#fff' },
  text_green:    { color: '#fff' },
  text_outline:  { color: Colors.beige[600] },
  text_ghost:    { color: Colors.beige[400] },
  text_danger:   { color: Colors.error.text },

  textSize_sm: { fontSize: 10 },
  textSize_md: { fontSize: 11 },
  textSize_lg: { fontSize: 13 },
} as any);
