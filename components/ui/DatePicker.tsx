import React, { useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';
import { useTranslation } from '../../lib/LangContext';

interface Props {
  /** ISO date string YYYY-MM-DD */
  value: string;
  onChange: (v: string) => void;
}

function pad2(s: string) {
  return s.replace(/\D/g, '').slice(0, 2);
}

/** Three-field date picker. ET order: year→month→day. EN order: year→day→month. */
export function DatePicker({ value, onChange }: Props) {
  const { lang, t } = useTranslation();
  const parts = value.split('-');
  const year  = parts[0] ?? '';
  const month = parts[1] ?? '';
  const day   = parts[2] ?? '';

  const secondRef = useRef<TextInput>(null);
  const thirdRef  = useRef<TextInput>(null);

  const rebuild = (y: string, m: string, d: string) => {
    const yp = y.replace(/\D/g, '').slice(0, 4);
    const mp = pad2(m);
    const dp = pad2(d);
    onChange(`${yp}-${mp}-${dp}`);
  };

  // ET: year / month / day;  EN: year / day / month
  const isET = lang === 'et';

  const yearField = (
    <Field
      label={t('date.year')}
      hint="aaaa"
      value={year}
      maxLength={4}
      onChangeText={(v) => {
        const clean = v.replace(/\D/g, '').slice(0, 4);
        rebuild(clean, month, day);
        if (clean.length === 4) secondRef.current?.focus();
      }}
    />
  );

  const monthField = (
    <Field
      ref={isET ? secondRef : thirdRef}
      label={t('date.month')}
      hint="KK"
      value={month}
      maxLength={2}
      onChangeText={(v) => {
        const clean = pad2(v);
        rebuild(year, clean, day);
        if (clean.length === 2) {
          if (isET) thirdRef.current?.focus();
        }
      }}
    />
  );

  const dayField = (
    <Field
      ref={isET ? thirdRef : secondRef}
      label={t('date.day')}
      hint="PP"
      value={day}
      maxLength={2}
      onChangeText={(v) => {
        const clean = pad2(v);
        rebuild(year, month, clean);
        if (clean.length === 2 && !isET) thirdRef.current?.focus();
      }}
    />
  );

  return (
    <View style={styles.row}>
      {yearField}
      <Text style={styles.sep}>–</Text>
      {isET ? monthField : dayField}
      <Text style={styles.sep}>–</Text>
      {isET ? dayField : monthField}
    </View>
  );
}

interface FieldProps {
  label: string;
  hint: string;
  value: string;
  maxLength: number;
  onChangeText: (v: string) => void;
}

const Field = React.forwardRef<TextInput, FieldProps>(
  ({ label, hint, value, maxLength, onChangeText }, ref) => (
    <View style={styles.field}>
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={hint}
        placeholderTextColor={Colors.beige[200]}
        keyboardType="number-pad"
        maxLength={maxLength}
        selectTextOnFocus
      />
      <Text style={styles.fieldLbl}>{label}</Text>
    </View>
  )
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  sep: {
    fontSize: 18,
    color: Colors.beige[200],
    marginBottom: 18,
    lineHeight: 24,
  },
  field: {
    alignItems: 'center',
    flex: 1,
  },
  input: {
    width: '100%',
    height: 36,
    borderWidth: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.beige[200],
    paddingHorizontal: 4,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: Colors.beige[800],
    backgroundColor: 'transparent',
  },
  fieldLbl: {
    fontSize: 10,
    color: Colors.beige[400],
    marginTop: 4,
    textAlign: 'center',
    fontFamily: Fonts.sans,
  },
});
