import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { todayISO } from '../../lib/cycle';

export default function CycleScreen() {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLen, setCycleLen] = useState('28');
  const [periodLen, setPeriodLen] = useState('5');

  const save = async () => {
    const existing = await AsyncStorage.getItem('lf_profile');
    const profile = existing ? JSON.parse(existing) : {};
    await AsyncStorage.setItem('lf_profile', JSON.stringify({
      ...profile,
      last_period_date: lastPeriod || null,
      cycle_length: parseInt(cycleLen) || 28,
      period_length: parseInt(periodLen) || 5,
    }));
    router.push('/(onboarding)/fitness');
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Tagasi</Text>
      </TouchableOpacity>

      <Eyebrow>Tsükliandmed</Eyebrow>
      <SerifTitle>Räägi oma tsüklist.</SerifTitle>
      <BodyText>Aitab siduda treeningu tsüklifa asidega. Saad igal ajal muuta.</BodyText>

      <Input
        label="Viimase menstruatsiooni esimene päev"
        value={lastPeriod}
        onChangeText={setLastPeriod}
        placeholder={todayISO()}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />

      <View style={styles.row}>
        <Input
          label="Tsükli pikkus (päevad)"
          value={cycleLen}
          onChangeText={setCycleLen}
          placeholder="28"
          keyboardType="number-pad"
          maxLength={2}
          containerStyle={styles.half}
        />
        <Input
          label="Perioodi pikkus (päevad)"
          value={periodLen}
          onChangeText={setPeriodLen}
          placeholder="5"
          keyboardType="number-pad"
          maxLength={2}
          containerStyle={styles.half}
        />
      </View>

      <Button variant="dark" size="lg" fullWidth onPress={save} style={styles.btn}>
        Jätka →
      </Button>
      <Button variant="ghost" size="md" fullWidth onPress={() => router.push('/(onboarding)/fitness')} style={styles.skip}>
        Jäta vahele
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
