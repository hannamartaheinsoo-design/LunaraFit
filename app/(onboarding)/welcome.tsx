import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';

export default function WelcomeScreen() {
  const [selected, setSelected] = useState<'et' | 'en'>('et');

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.logo}>
        <Text style={styles.logoAccent}>lunara</Text>fit
      </Text>

      <Eyebrow>Tere tulemast</Eyebrow>
      <SerifTitle>Vali oma keel.</SerifTitle>
      <BodyText>Saad seda igal ajal muuta.</BodyText>

      <View style={styles.grid}>
        {[
          { code: 'et', flag: '🇪🇪', name: 'Eesti', native: 'Estonian' },
          { code: 'en', flag: '🇬🇧', name: 'English', native: 'English' },
        ].map((lang) => (
          <TouchableOpacity
            key={lang.code}
            activeOpacity={0.8}
            style={[styles.langCard, selected === lang.code && styles.langCardSel]}
            onPress={() => setSelected(lang.code as 'et' | 'en')}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <Text style={styles.langName}>{lang.name}</Text>
            <Text style={styles.langNative}>{lang.native}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button variant="dark" size="lg" fullWidth onPress={() => router.push('/(onboarding)/name')} style={styles.btn}>
        Jätka →
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: Spacing.xxl, paddingBottom: 60 },
  logo: {
    fontSize: 21,
    fontStyle: 'italic',
    color: Colors.beige[400],
    textAlign: 'center',
    paddingVertical: 20,
    marginBottom: 36,
    letterSpacing: 0.4,
  },
  logoAccent: { fontStyle: 'normal', color: Colors.blush[400] },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  langCard: {
    flex: 1,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.beige[100],
    backgroundColor: Colors.cream,
    alignItems: 'center',
  },
  langCardSel: { borderColor: Colors.blush[400], backgroundColor: Colors.blush[50] },
  flag: { fontSize: 26, marginBottom: 8 },
  langName: { fontSize: 14, fontWeight: '700', color: Colors.beige[800] },
  langNative: { fontSize: 11, color: Colors.beige[400], marginTop: 2 },
  btn: { marginTop: 22 },
});
