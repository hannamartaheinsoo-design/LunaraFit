import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { todayISO } from '../../lib/cycle';
import { useTranslation } from '../../lib/LangContext';

export default function CycleScreen() {
  const T = useTheme();
  const { t } = useTranslation();
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLen, setCycleLen] = useState('28');
  const [periodLen, setPeriodLen] = useState('5');

  const upsertProfile = useMutation(api.profiles.upsert);

  const save = async () => {
    await upsertProfile({
      last_period_date: lastPeriod || undefined,
      cycle_length: parseInt(cycleLen) || 28,
      period_length: parseInt(periodLen) || 5,
    });
    router.push('/(onboarding)/fitness');
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: T.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{t('ob.back')}</Text>
      </TouchableOpacity>

      <Eyebrow>{t('cycle.eyebrow')}</Eyebrow>
      <SerifTitle>{t('cycle.title')}</SerifTitle>
      <BodyText>{t('cycle.body')}</BodyText>

      <Input label={t('cycle.lp.lbl')} value={lastPeriod} onChangeText={setLastPeriod} placeholder={todayISO()} keyboardType="numbers-and-punctuation" maxLength={10} />

      <View style={styles.row}>
        <Input label={t('cycle.cl.lbl')} value={cycleLen} onChangeText={setCycleLen} placeholder="28" keyboardType="number-pad" maxLength={2} containerStyle={styles.half} />
        <Input label={t('cycle.pl.lbl')} value={periodLen} onChangeText={setPeriodLen} placeholder="5" keyboardType="number-pad" maxLength={2} containerStyle={styles.half} />
      </View>

      <Button variant="dark" size="lg" fullWidth onPress={save} style={styles.btn}>
        {t('cycle.cta')}
      </Button>
      <Button variant="ghost" size="md" fullWidth onPress={() => router.push('/(onboarding)/fitness')} style={styles.skip}>
        {t('cycle.skip')}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: Spacing.xxl, paddingBottom: 60 },
  back: { marginBottom: 20 },
  backText: { color: Colors.beige[400], fontSize: 14 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  btn: { marginTop: 22 },
  skip: { marginTop: 10 },
});
