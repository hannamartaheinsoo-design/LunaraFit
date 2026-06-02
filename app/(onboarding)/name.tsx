import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Colors, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useTranslation } from '../../lib/LangContext';

export default function NameScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [ageError, setAgeError] = useState('');
  const upsertProfile = useMutation(api.profiles.upsert);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('', t('name.err.required'));
      return;
    }
    const yr = parseInt(birthYear);
    if (yr && 2026 - yr < 16) {
      setAgeError(t('name.err.age'));
      return;
    }
    setAgeError('');
    await upsertProfile({ name: name.trim(), birth_year: yr || undefined });
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

      <Input label={t('name.lbl')} value={name} onChangeText={setName} placeholder={t('name.ph')} autoCapitalize="words" autoComplete="given-name" />
      <Input
        label={t('name.year.lbl')}
        value={birthYear}
        onChangeText={(v) => { setBirthYear(v); setAgeError(''); }}
        placeholder={t('name.year.ph')}
        keyboardType="number-pad"
        maxLength={4}
        error={ageError}
      />

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
});
