import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, View, Alert, Platform } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Colors, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DatePicker } from '../../components/ui/DatePicker';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useTranslation } from '../../lib/LangContext';

function calcAge(year: number, month: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && today.getDate() < day)) age--;
  return age;
}

export default function NameScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  // date string YYYY-MM-DD (blank parts allowed)
  const today = new Date();
  const [birthDate, setBirthDate] = useState(`${today.getFullYear()}--`);
  const [ageError, setAgeError] = useState('');
  const [birthError, setBirthError] = useState('');
  const upsertProfile = useMutation(api.profiles.upsert);

  const handleContinue = async () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        setAgeError('');
        setBirthError('');
        // reuse ageError slot for name error
        setAgeError(t('name.err.required'));
      } else {
        Alert.alert('', t('name.err.required'));
      }
      return;
    }

    const parts = birthDate.split('-');
    const yr  = parseInt(parts[0] ?? '');
    const mo  = parseInt(parts[1] ?? '');
    const dy  = parseInt(parts[2] ?? '');

    const hasYear  = !isNaN(yr) && yr > 1900 && yr <= today.getFullYear();
    const hasMonth = !isNaN(mo) && mo >= 1 && mo <= 12;
    const hasDay   = !isNaN(dy) && dy >= 1 && dy <= 31;

    if (hasYear && hasMonth && hasDay) {
      const age = calcAge(yr, mo, dy);
      if (age < 16) {
        setBirthError(t('name.err.age'));
        return;
      }
    } else if (hasYear) {
      // only year entered — use year-only check
      const age = today.getFullYear() - yr;
      if (age < 16) {
        setBirthError(t('name.err.age'));
        return;
      }
    }

    setBirthError('');
    setAgeError('');

    await upsertProfile({
      name: name.trim(),
      birth_year:  hasYear  ? yr : undefined,
      birth_month: hasMonth ? mo : undefined,
      birth_day:   hasDay   ? dy : undefined,
    });
    router.push('/(onboarding)/cycle');
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {navigation.canGoBack() && (
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{t('ob.back')}</Text>
        </TouchableOpacity>
      )}

      <Eyebrow>{t('name.eyebrow')}</Eyebrow>
      <SerifTitle>{t('name.title')}</SerifTitle>
      <BodyText>{t('name.body')}</BodyText>

      <Input
        label={t('name.lbl')}
        value={name}
        onChangeText={(v) => { setName(v); setAgeError(''); }}
        placeholder={t('name.ph')}
        autoCapitalize="words"
        autoComplete="given-name"
        error={ageError}
      />

      <Text style={styles.birthLbl}>{t('name.birth.lbl')}</Text>
      <DatePicker value={birthDate} onChange={(v) => { setBirthDate(v); setBirthError(''); }} />
      {birthError ? <Text style={styles.errTxt}>{birthError}</Text> : null}

      <Button variant="dark" size="lg" fullWidth onPress={handleContinue} style={styles.btn}>
        {t('name.cta')}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: Spacing.xxl, paddingBottom: 60 },
  back: { marginBottom: 20 },
  backText: { color: Colors.beige[400], fontSize: 14 },
  btn: { marginTop: 22 },
  birthLbl: { fontSize: 13, color: Colors.dark, marginBottom: 8, marginTop: 16 },
  errTxt: { color: '#C0392B', fontSize: 12, marginTop: 6 },
});
