import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

const FEATURES = [
  { icon: 'barbell' as const, title: 'Treeningute jälgimine', sub: 'Logi harjutused, seeriad ja kaalud.' },
  { icon: 'moon'    as const, title: 'Tsükli teadlikkus',     sub: 'Mõista oma faaside mõju energiale.' },
  { icon: 'spark'   as const, title: 'Isiklikud mustrid',     sub: 'Avasta, millal treening kõige paremini läheb.' },
];

export default function WelcomeScreen() {
  const [lang, setLang] = useState<'et' | 'en'>('et');

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <View style={styles.logoWrap}>
        <Text style={styles.logo}>
          <Text style={styles.logoAccent}>Lunara</Text>Fit
        </Text>
        <Text style={styles.tagline}>Treening kohtub tsükliga.</Text>
      </View>

      {/* Feature list */}
      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Icon name={f.icon} size={18} color={Colors.blush[600]} strokeWidth={1.4} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureSub}>{f.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Language picker */}
      <Text style={styles.langLabel}>Vali keel</Text>
      <View style={styles.langRow}>
        {[
          { code: 'et', flag: '🇪🇪', name: 'Eesti' },
          { code: 'en', flag: '🇬🇧', name: 'English' },
        ].map((l) => (
          <TouchableOpacity
            key={l.code}
            activeOpacity={0.8}
            style={[styles.langBtn, lang === l.code && styles.langBtnSel]}
            onPress={() => setLang(l.code as 'et' | 'en')}
          >
            <Text style={styles.langFlag}>{l.flag}</Text>
            <Text style={[styles.langName, lang === l.code && styles.langNameSel]}>{l.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA */}
      <Button variant="dark" size="lg" fullWidth onPress={() => router.push('/(onboarding)/name')} style={styles.btn}>
        Alusta →
      </Button>

      <Text style={styles.privacy}>
        Privaatsus ennekõike — andmed jäävad ainult sinu seadmesse.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingHorizontal: Spacing.xxl, paddingTop: 60, paddingBottom: 50 },

  // Logo block
  logoWrap: { alignItems: 'center', marginBottom: 44 },
  logo: {
    fontFamily: Fonts.serifItalic,
    fontSize: 38,
    color: Colors.beige[600],
    letterSpacing: 0.5,
    lineHeight: 44,
  },
  logoAccent: { fontFamily: Fonts.serif, color: Colors.blush[400] },
  tagline: {
    fontFamily: Fonts.sansLight,
    fontSize: 14,
    color: Colors.beige[400],
    marginTop: 8,
    letterSpacing: 0.3,
  },

  // Features
  features: {
    backgroundColor: Colors.beige[50],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.beige[100],
    padding: 20,
    gap: 18,
    marginBottom: 32,
  },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  featureIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.blush[50],
    borderWidth: 1, borderColor: Colors.blush[100],
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13, color: Colors.beige[800], marginBottom: 2,
  },
  featureSub: {
    fontFamily: Fonts.sansLight,
    fontSize: 12, color: Colors.beige[600], lineHeight: 17,
  },

  // Language
  langLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase',
    color: Colors.beige[400], marginBottom: 10,
  },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  langBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.beige[100],
    backgroundColor: Colors.cream,
  },
  langBtnSel: { borderColor: Colors.blush[400], backgroundColor: Colors.blush[50] },
  langFlag: { fontSize: 18 },
  langName: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 13, color: Colors.beige[600],
  },
  langNameSel: { color: Colors.blush[800] },

  btn: { marginBottom: 16 },

  privacy: {
    fontFamily: Fonts.sansLight,
    fontSize: 11, color: Colors.beige[400],
    textAlign: 'center', lineHeight: 16,
  },
});
