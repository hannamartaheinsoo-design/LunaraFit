import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';
import { OnboardingProgress } from '../../components/ui/OnboardingProgress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FitnessLevel } from '../../types';

const LEVELS: { key: FitnessLevel; title: string; sub: string; emoji: string }[] = [
  { key: 'beginner', title: 'Alles alustan', sub: 'Uus või naasmas jõusaali', emoji: '🌱' },
  { key: 'intermediate', title: 'Leidmas oma rütmi', sub: 'Käin regulaarselt, ehitan rutiini', emoji: '🌊' },
  { key: 'advanced', title: 'Järjepidev ja kogenud', sub: 'Treenin regulaarselt eesmärkidega', emoji: '🏋️' },
];

export default function FitnessScreen() {
  const [selected, setSelected] = useState<FitnessLevel | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    const existing = await AsyncStorage.getItem('lf_profile');
    const profile = existing ? JSON.parse(existing) : {};
    await AsyncStorage.setItem('lf_profile', JSON.stringify({
      ...profile,
      fitness_level: selected,
    }));
    router.push('/(onboarding)/plan');
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

      <OnboardingProgress step={4} total={5} />

      <Eyebrow>Spordikogemus</Eyebrow>
      <SerifTitle>Milline on sinu treeningkogemus?</SerifTitle>
      <BodyText>Vale vastust pole.</BodyText>

      <View style={styles.stack}>
        {LEVELS.map((level) => (
          <TouchableOpacity
            key={level.key}
            activeOpacity={0.8}
            style={[styles.card, selected === level.key && styles.cardSel]}
            onPress={() => setSelected(level.key)}
          >
            <View style={[styles.icon, selected === level.key && styles.iconSel]}>
              <Text style={styles.emoji}>{level.emoji}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{level.title}</Text>
              <Text style={styles.cardSub}>{level.sub}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        variant="dark"
        size="lg"
        fullWidth
        onPress={handleContinue}
        disabled={!selected}
        style={styles.btn}
      >
        Jätka →
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: Spacing.xxl, paddingBottom: 60 },
  back: { marginBottom: 20 },
  backText: { color: Colors.beige[400], fontSize: 14 },
  stack: { gap: 10, marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.beige[100],
    backgroundColor: Colors.cream,
  },
  cardSel: { borderColor: Colors.blush[400], backgroundColor: Colors.blush[50] },
  icon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.beige[50],
    borderWidth: 1,
    borderColor: Colors.beige[100],
    alignItems: 'center', justifyContent: 'center',
  },
  iconSel: { backgroundColor: Colors.blush[100], borderColor: Colors.blush[200] },
  emoji: { fontSize: 22 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.beige[800], marginBottom: 2 },
  cardSub: { fontSize: 12, color: Colors.beige[600], fontWeight: '300' },
  btn: { marginTop: 22 },
});
