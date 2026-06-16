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

const LEVELS: { key: FitnessLevel; titleKey: any; subKey: any; icon: any; grad: readonly [string, string] }[] = [
  { key: 'beginner',     titleKey: 'fitness.lv1.title', subKey: 'fitness.lv1.sub', icon: 'leaf',    grad: [Colors.sky[200],   Colors.sky[600]]   },
  { key: 'intermediate', titleKey: 'fitness.lv2.title', subKey: 'fitness.lv2.sub', icon: 'wave',    grad: [Colors.blush[200], Colors.blush[600]] },
  { key: 'advanced',     titleKey: 'fitness.lv3.title', subKey: 'fitness.lv3.sub', icon: 'barbell', grad: [Colors.berry[200], Colors.berry[600]] },
];

function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={bar.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[bar.seg, i <= step ? bar.active : bar.inactive]} />
      ))}
    </View>
  );
}
const bar = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, paddingHorizontal: 24 },
  seg: { flex: 1, height: 4, borderRadius: 2 },
  active:   { backgroundColor: Colors.blush[400] },
  inactive: { backgroundColor: Colors.beige[100] },
});

function useFade(delay: number) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(op, { toValue: 1, duration: 420, useNativeDriver: false }),
        Animated.spring(ty, { toValue: 0, damping: 18, stiffness: 160, mass: 0.8, useNativeDriver: false }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  return { opacity: op, transform: [{ translateY: ty }] };
}

export default function FitnessScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<FitnessLevel | null>(null);
  const upsertProfile = useMutation(api.profiles.upsert);

  const a0 = useFade(0); const a1 = useFade(100); const a2 = useFade(220);
  const a3 = useFade(320); const a4 = useFade(420);
  const cardAnims = [a2, a3, a4];

  const handleContinue = async () => {
    if (!selected) return;
    try { await upsertProfile({ fitness_level: selected }); } catch (_) {}
    router.push('/(onboarding)/body');
  };

  return (
    <View style={styles.root}>
      <Animated.View style={a0}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>
        <StepBar step={4} total={7} />
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.orbWrap, a1]}>
          <LinearGradient colors={[Colors.sky[200], Colors.sky[600]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
            <Icon name="barbell" size={40} color="#fff" strokeWidth={1.2} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={a1}>
          <Text style={styles.heading}>{t('fitness.title')}</Text>
          <Text style={styles.subtitle}>{t('fitness.body')}</Text>
        </Animated.View>

        <View style={styles.stack}>
          {LEVELS.map((level, i) => {
            const sel = selected === level.key;
            return (
              <Animated.View key={level.key} style={cardAnims[i]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.card, sel && styles.cardSelected]}
                  onPress={() => setSelected(level.key)}
                >
                  <LinearGradient
                    colors={sel ? level.grad : [Colors.beige[100], Colors.beige[100]]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.cardIcon}
                  >
                    <Icon name={level.icon} size={26} color={sel ? '#fff' : Colors.beige[400]} strokeWidth={1.3} />
                  </LinearGradient>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, sel && { color: Colors.beige[800] }]}>{t(level.titleKey)}</Text>
                    <Text style={styles.cardSub}>{t(level.subKey)}</Text>
                  </View>
                  <View style={[styles.radio, sel && { borderColor: level.grad[1], backgroundColor: level.grad[1] }]}>
                    {sel && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={selected ? 0.88 : 1}
          style={[styles.ctaBtn, !selected && styles.ctaBtnDisabled]}
          onPress={handleContinue}
        >
          <Text style={[styles.ctaBtnText, !selected && { color: Colors.beige[400] }]}>
            {t('fitness.cta')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  navRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  backIcon: { fontSize: 24, color: Colors.beige[600], lineHeight: 28, marginTop: -2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  orbWrap: { alignSelf: 'flex-start', marginBottom: 28 },
  orb: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: Colors.sky[400], shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  heading: { fontFamily: Fonts.sansBold, fontSize: 40, color: Colors.beige[800], lineHeight: 48, letterSpacing: -1, marginBottom: 10 },
  subtitle: { fontFamily: Fonts.sansLight, fontSize: 17, color: Colors.beige[400], lineHeight: 26, marginBottom: 32 },
  stack: { gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 3 } },
  cardSelected: { borderColor: Colors.blush[200], backgroundColor: '#fff' },
  cardIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  cardText: { flex: 1 },
  cardTitle: { fontFamily: Fonts.sansBold, fontSize: 16, color: Colors.beige[600], marginBottom: 4 },
  cardSub: { fontFamily: Fonts.sansLight, fontSize: 13.5, color: Colors.beige[400], lineHeight: 18 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.beige[200], alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#fff' },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  ctaBtn: { height: 60, borderRadius: 999, backgroundColor: Colors.beige[800], alignItems: 'center', justifyContent: 'center', shadowColor: Colors.beige[800], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 8 },
  ctaBtnDisabled: { backgroundColor: Colors.beige[200], shadowOpacity: 0 },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 17, color: '#fff', letterSpacing: 0.2 },
});
