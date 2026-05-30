import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Colors, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NameScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [ageError, setAgeError] = useState('');

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('', 'Palun sisesta oma nimi');
      return;
    }
    const yr = parseInt(birthYear);
    if (yr && 2026 - yr < 16) {
      setAgeError('LunaraFit on mõeldud 16-aastastele ja vanematele.');
      return;
    }
    setAgeError('');

    const existing = await AsyncStorage.getItem('lf_profile');
    const profile = existing ? JSON.parse(existing) : {};
    await AsyncStorage.setItem('lf_profile', JSON.stringify({
      ...profile,
      name: name.trim(),
      birth_year: yr || null,
    }));

    router.push('/(onboarding)/cycle');
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {navigation.canGoBack() && (
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Tagasi</Text>
        </TouchableOpacity>
      )}

      <Eyebrow>Sinu andmed</Eyebrow>
      <SerifTitle>Kuidas sind kutsuda?</SerifTitle>
      <BodyText>Isikupärastab sinu kogemuse.</BodyText>

      <Input
        label="Eesnimi"
        value={name}
        onChangeText={setName}
        placeholder="Sinu nimi"
        autoCapitalize="words"
        autoComplete="given-name"
      />
      <Input
        label="Sünniaasta"
        value={birthYear}
        onChangeText={(v) => { setBirthYear(v); setAgeError(''); }}
        placeholder="aaaa"
        keyboardType="number-pad"
        maxLength={4}
        error={ageError}
      />

      <Button variant="dark" size="lg" fullWidth onPress={handleContinue} style={styles.btn}>
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
  btn: { marginTop: 22 },
});
