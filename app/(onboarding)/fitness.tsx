import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { FitnessLevel } from '../../types';
import { useTranslation } from '../../lib/LangContext';

const LEVELS: { key: FitnessLevel; titleKey: any; subKey: any; icon: any; accent: string; bg: string }[] = [
  { key: 'beginner',     titleKey: 'fitness.lv1.title', subKey: 'fitness.lv1.sub', icon: 'leaf',    accent: Colors.sky[600],   bg: Colors.sky[50]   },
  { key: 'intermediate', titleKey: 'fitness.lv2.title', subKey: 'fitness.lv2.sub', icon: 'wave',    accent: Colors.blush[600], bg: Colors.blush[50] },
  { key: 'advanced',     titleKey: 'fitness.lv3.title', subKey: 'fitness.lv3.sub', icon: 'barbell', accent: Colors.berry[600], bg: Colors.berry[50] },
];

function StepBar({ step }: { step: number }) {
  return (
    <View style={bar.row}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[bar.seg, i <= step ? bar.filled : bar.empty]} />
      ))}
    </View>
  );
}
const bar = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, paddingHorizontal: 24, marginBottom: 4 },
  seg: { flex: 1, height: 2, borderRadius: 1 },
  filled: { backgroundColor: Colors.blush[400] },
  empty: { backgroundColor: Colors.beige[100] },
});

function useSpringIn(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(32)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 380, useNativeDriver: false }),
        Animated.spring(translateY, { toValue: 0, damping: 20, stiffness: 180, mass: 0.7, useNativeDriver: false }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  return { opacity, transform: [{ translateY }] };
}

export default function FitnessScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<FitnessLevel | null>(null);
  const upsertProfile = useMutation(api.profiles.upsert);

  const navAnim  = useSpringIn(0);
  const headAnim = useSpringIn(100);
  const card0    = useSpringIn(220);
  const card1    = useSpringIn(320);
  const card2    = useSpringIn(420);
  const ctaAnim  = useSpringIn(500);
  const cardAnims = [card0, card1, card2];

  const handleContinue = async () => {
    if (!selected) return;
    try { await upsertProfile({ fitness_level: selected }); } catch (_) {}
    router.push('/(onboarding)/plan');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#EEE8F0', '#E8E0EC', '#FAFAFA']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={navAnim}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>
        <StepBar step={2} />
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headGroup, headAnim]}>
          <Text style={styles.eyebrow}>{t('fitness.eyebrow')}</Text>
          <Text style={styles.title}>{t('fitness.title')}</Text>
          <Text style={styles.subtitle}>{t('fitness.body')}</Text>
        </Animated.View>

        <View style={styles.stack}>
          {LEVELS.map((level, i) => {
            const sel = selected === level.key;
            return (
              <Animated.View key={level.key} style={cardAnims[i]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.card, sel && { borderColor: level.accent, borderWidth: 2 }]}
                  onPress={() => setSelected(level.key)}
                >
                  <View style={[styles.iconWrap, { backgroundColor: sel ? level.bg : Colors.beige[50] }]}>
                    <Icon name={level.icon} size={24} color={sel ? level.accent : Colors.beige[400]} strokeWidth={1.3} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, sel && { color: level.accent }]}>{t(level.titleKey)}</Text>
                    <Text style={styles.cardSub}>{t(level.subKey)}</Text>
                  </View>
                  <View style={[styles.radio, sel && { borderColor: level.accent, backgroundColor: level.accent }]}>
                    {sel && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <Animated.View style={[styles.footer, ctaAnim]}>
        <TouchableOpacity
          activeOpacity={selected ? 0.88 : 1}
          style={[styles.ctaBtn, !selected && styles.ctaBtnDisabled]}
          onPress={handleContinue}
        >
          <Text style={[styles.ctaBtnText, !selected && styles.ctaBtnTextDisabled]}>
            {t('fitness.cta')}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: Colors.beige[600], lineHeight: 28, marginTop: -2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 },
  headGroup: { marginBottom: 32 },
  eyebrow: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 2,
    textTransform: 'uppercase', color: Colors.blush[400], marginBottom: 10,
  },
  title: {
    fontFamily: Fonts.sansBold, fontSize: 36,
    color: Colors.beige[800], lineHeight: 42, letterSpacing: -0.5, marginBottom: 10,
  },
  subtitle: { fontFamily: Fonts.sansLight, fontSize: 16, color: Colors.beige[400], lineHeight: 24 },
  stack: { gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 20, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 3 },
  },
  iconWrap: {
    width: 54, height: 54, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardText: { flex: 1 },
  cardTitle: { fontFamily: Fonts.sansBold, fontSize: 15, color: Colors.beige[800], marginBottom: 4 },
  cardSub: { fontFamily: Fonts.sansLight, fontSize: 13, color: Colors.beige[400], lineHeight: 18 },
  radio: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.beige[200],
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#fff' },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 44 },
  ctaBtn: {
    height: 58, borderRadius: 999, backgroundColor: Colors.beige[800],
    alignItems: 'center', justifyContent: 'center',
  },
  ctaBtnDisabled: { backgroundColor: Colors.beige[200] },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 16, color: '#fff', letterSpacing: 0.2 },
  ctaBtnTextDisabled: { color: Colors.beige[400] },
});
