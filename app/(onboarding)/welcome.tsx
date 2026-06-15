import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts, Radius } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { useTranslation } from '../../lib/LangContext';

const LANGS = [
  { code: 'et' as const, flag: '🇪🇪', name: 'Eesti' },
  { code: 'en' as const, flag: '🇬🇧', name: 'English' },
  { code: 'de' as const, flag: '🇩🇪', name: 'Deutsch' },
  { code: 'es' as const, flag: '🇪🇸', name: 'Español' },
];

const FEATURES = [
  { icon: 'barbell' as const, key: 'feat1' as const },
  { icon: 'moon'    as const, key: 'feat2' as const },
  { icon: 'spark'   as const, key: 'feat3' as const },
] as const;

function useFade(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 600, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(translateY, { toValue: 0, duration: 600, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
}

export default function WelcomeScreen() {
  const { lang, setLang, t } = useTranslation();

  const a0 = useFade(0);
  const a1 = useFade(180);
  const a2 = useFade(340);
  const a3 = useFade(480);

  return (
    <View style={styles.root}>
      {/* Full-screen warm gradient background */}
      <LinearGradient
        colors={['#F2E8F0', '#F8EFF5', '#FAF6F8', Colors.cream]}
        locations={[0, 0.3, 0.6, 1]}
        start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Ambient blobs — Chatia-style soft glow orbs */}
      <View style={styles.orbTop} pointerEvents="none" />
      <View style={styles.orbMid} pointerEvents="none" />
      <View style={styles.orbBot} pointerEvents="none" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: glowing orb + wordmark */}
        <Animated.View style={[styles.heroSection, a0]}>
          {/* Orb container */}
          <View style={styles.orbWrap}>
            <LinearGradient
              colors={[Colors.blush[200], Colors.berry[200], Colors.blush[100]]}
              start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
              style={styles.orbGradient}
            />
            {/* Inner glow */}
            <View style={styles.orbInner} />
            {/* Icon centered in orb */}
            <View style={styles.orbIcon}>
              <Icon name="moon" size={32} color="rgba(255,255,255,0.9)" strokeWidth={1.2} />
            </View>
          </View>

          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkAccent}>Lunara</Text>
            <Text style={styles.wordmarkDark}>Fit</Text>
          </Text>
          <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
        </Animated.View>

        {/* Feature list card */}
        <Animated.View style={[styles.featureCard, a1]}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureRowBorder]}>
              <View style={styles.featureIconWrap}>
                <Icon name={f.icon} size={18} color={Colors.blush[600]} strokeWidth={1.4} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{t(`welcome.${f.key}.title` as any)}</Text>
                <Text style={styles.featureSub}>{t(`welcome.${f.key}.sub` as any)}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Language picker */}
        <Animated.View style={a2}>
          <Text style={styles.langLabel}>{t('welcome.langLabel')}</Text>
          <View style={styles.langGrid}>
            {LANGS.map((l) => {
              const active = lang === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  activeOpacity={0.75}
                  style={[styles.langChip, active && styles.langChipActive]}
                  onPress={() => setLang(l.code)}
                >
                  <Text style={styles.langFlag}>{l.flag}</Text>
                  <Text style={[styles.langName, active && styles.langNameActive]}>{l.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* CTA */}
      <Animated.View style={[styles.footer, a3]}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.ctaBtn}
          onPress={() => router.push('/(onboarding)/signup' as any)}
        >
          <Text style={styles.ctaBtnText}>{t('welcome.cta')}</Text>
        </TouchableOpacity>
        <Text style={styles.privacy}>{t('welcome.privacy')}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },

  orbTop: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: Colors.blush[200], opacity: 0.28,
    top: -120, right: -80,
  },
  orbMid: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.berry[100], opacity: 0.2,
    top: 180, left: -60,
  },
  orbBot: {
    position: 'absolute', width: 240, height: 240, borderRadius: 120,
    backgroundColor: Colors.blush[100], opacity: 0.22,
    bottom: 60, right: -80,
  },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 28, paddingTop: 60, paddingBottom: 20 },

  heroSection: { alignItems: 'center', marginBottom: 40 },

  orbWrap: {
    width: 120, height: 120, borderRadius: 60,
    marginBottom: 28, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 12,
  },
  orbGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 60 },
  orbInner: {
    position: 'absolute', width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.25)',
    top: 10, left: 25,
  },
  orbIcon: { zIndex: 1 },

  wordmark: { fontSize: 42, letterSpacing: -0.8, lineHeight: 48, marginBottom: 8 },
  wordmarkAccent: { fontFamily: Fonts.sansLight, color: Colors.blush[400] },
  wordmarkDark:   { fontFamily: Fonts.sansBold,  color: Colors.beige[800] },
  tagline: { fontFamily: Fonts.sansLight, fontSize: 15, color: Colors.beige[400], letterSpacing: 0.2, textAlign: 'center' },

  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.beige[100],
    paddingHorizontal: 18,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, gap: 14,
  },
  featureRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.beige[100] },
  featureIconWrap: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: Colors.blush[50],
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  featureText: { flex: 1 },
  featureTitle: { fontFamily: Fonts.sansSemiBold, fontSize: 13.5, color: Colors.beige[800], marginBottom: 2 },
  featureSub:   { fontFamily: Fonts.sansLight,    fontSize: 12,   color: Colors.beige[400], lineHeight: 17 },

  langLabel: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.4,
    textTransform: 'uppercase', color: Colors.beige[400], marginBottom: 12,
  },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  langChip: {
    flexBasis: '47%', flexGrow: 1,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 13, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1.5, borderColor: Colors.beige[100],
  },
  langChipActive: { backgroundColor: Colors.blush[50], borderColor: Colors.blush[300] },
  langFlag: { fontSize: 20 },
  langName: { fontFamily: Fonts.sansMedium, fontSize: 13, color: Colors.beige[600] },
  langNameActive: { color: Colors.blush[800] },

  footer: { paddingHorizontal: 28, paddingTop: 12, paddingBottom: 44 },
  ctaBtn: {
    height: 56, borderRadius: 999,
    backgroundColor: Colors.beige[800],
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: Colors.beige[800], shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 16, color: '#fff', letterSpacing: 0.2 },
  privacy: { fontFamily: Fonts.sansLight, fontSize: 11.5, color: Colors.beige[400], textAlign: 'center', lineHeight: 17 },
});
