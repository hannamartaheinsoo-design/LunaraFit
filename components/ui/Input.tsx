import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors, Fonts, Radius } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const T = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, { color: T.textSec }]}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          { backgroundColor: T.surface, borderColor: T.border, color: T.text },
          focused ? { borderColor: Colors.blush[400] } : null,
          error  ? styles.inputError : null,
          style,
        ]}
        placeholderTextColor={T.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  inputError: {
    borderColor: Colors.error.text,
  },
  error: {
    fontSize: 12,
    color: Colors.error.text,
    marginTop: 6,
  },
});
