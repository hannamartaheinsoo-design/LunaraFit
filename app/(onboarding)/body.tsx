import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';
import { OnboardingProgress } from '../../components/ui/OnboardingProgress';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BodyScreen() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const proceed = async (skip: boolean) => {
    const existing = await AsyncStorage.getItem('lf_profile');
    const profile = existing ? JSON.parse(existing) : {};
    await AsyncStorage.setItem('lf_profile', JSON.stringify({
      ...profile,
      weight_kg: skip ? null : (parseFloat(weight) || null),
      height_cm: skip ? null : (parseInt(height) || null),
    }));
    router.push('/(onboarding)/cycle');
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

      <OnboardingProgress step={2} total={5} />

      <Eyebrow>Keha andmed</Eyebrow>
      <SerifTitle>Mõned mõõtmed.</SerifTitle>
      <BodyText>Aitab arvutada isiklikke tervisemõõdikuid. Saad hiljem muuta.</BodyText>

      <Input
        label="Kaal (kg)"
        value={weight}
        onChangeText={setWeight}
        placeholder="nt 65"
        keyboardType="decimal-pad"
      />
      <Input
        label="Pikkus (cm)"
        value={height}
        onChangeText={setHeight}
        placeholder="nt 168"
        keyboardType="number-pad"
        maxLength={3}
      />

      <Button variant="dark" size="lg" fullWidth onPress={() => proceed(false)} style={styles.btn}>
        Jätka →
      </Button>
      <Button variant="ghost" size="md" fullWidth onPress={() => proceed(true)} style={styles.skip}>
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
  btn: { marginTop: 22 },
  skip: { marginTop: 10 },
});
