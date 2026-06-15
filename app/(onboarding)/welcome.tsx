import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '../../constants/theme';
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
      <Eyebrow>Tere tulemast / Welcome</Eyebrow>
      <SerifTitle>Vali oma keel.</SerifTitle>
      <BodyText>Saad seda igal ajal muuta.</BodyText>

      <View style={styles.options}>
        {[
          { code: 'et', label: 'Eesti keel' },
          { code: 'en', label: 'English' },
        ].map((lang) => (
          <TouchableOpacity
            key={lang.code}
            activeOpacity={0.8}
            style={[styles.option, selected === lang.code && styles.optionSel]}
            onPress={() => setSelected(lang.code as 'et' | 'en')}
          >
            <Text style={[styles.optionText, selected === lang.code && styles.optionTextSel]}>
              {lang.label}
            </Text>
            {selected === lang.code && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
      </View>

      <Button
        variant="dark"
        size="lg"
        fullWidth
        onPress={() => router.push('/(onboarding)/name')}
        style={styles.btn}
      >
        Jätka →
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: Spacing.xxl, paddingTop: 72, paddingBottom: 60 },
  options: { gap: 8, marginTop: 28, marginBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.beige[100],
    backgroundColor: Colors.cream,
  },
  optionSel: {
    borderColor: Colors.blush[400],
    backgroundColor: Colors.blush[50],
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.beige[600],
  },
  optionTextSel: {
    color: Colors.blush[600],
    fontWeight: '700',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.blush[400],
  },
  btn: { marginTop: 24 },
});
