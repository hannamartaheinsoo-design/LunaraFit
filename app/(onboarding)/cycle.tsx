import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useTranslation } from '../../lib/LangContext';
import { DatePicker } from '../../components/ui/DatePicker';

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

export default function OnboardingCycleScreen() {
  const { t } = useTranslation();
  const upsertProfile = useMutation(api.profiles.upsert);

  const [lastPeriod, setLastPeriod] = useState('--');
  const [cycleLen, setCycleLen]   = useState('28');
  const [periodLen, setPeriodLen] = useState('5');
  const [pill, setPill] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const a0 = useFade(0); const a1 = useFade(100); const a2 = useFade(200);
  const a3 = useFade(300); const a4 = useFade(400);

  const save = async () => {
    setSaving(true);
    try {
      const parts = lastPeriod.split('-');
      const yr = parseInt(parts[0] ?? ''); const mo = parseInt(parts[1] ?? ''); const dy = parseInt(parts[2] ?? '');
      const hasDate = !isNaN(yr) && yr > 2000 && !isNaN(mo) && !isNaN(dy);
      await upsertProfile({
        last_period_date: hasDate ? lastPeriod : undefined,
        cycle_length:  Math.max(20, Math.min(45, parseInt(cycleLen) || 28)),
        period_length: Math.max(2,  Math.min(10, parseInt(periodLen) || 5)),
        uses_birth_control: pill === true,
      });
      router.push('/(onboarding)/fitness');
    } catch (_) { router.push('/(onboarding)/fitness'); }
    finally { setSaving(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View style={a0}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(onboarding)/fitness')} hitSlop={8}>
            <Text style={styles.skipTxt}>{t('cycle.skip')}</Text>
          </TouchableOpacity>
        </View>
        <StepBar step={3} total={7} />
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.orbWrap, a1]}>
          <LinearGradient colors={[Colors.blush[100], Colors.blush[400]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
            <Icon name="moon" size={40} color="#fff" strokeWidth={1.2} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={a1}>
          <Text style={styles.heading}>{t('cycle.title')}</Text>
          <Text style={styles.subtitle}>{t('cycle.body')}</Text>
        </Animated.View>

        {/* Last period */}
        <Animated.View style={a2}>
          <Text style={styles.sectionLabel}>{t('cycle.lp.lbl')}</Text>
          <View style={styles.card}>
            <DatePicker value={lastPeriod} onChange={setLastPeriod} />
          </View>
        </Animated.View>

        {/* Cycle + period length */}
        <Animated.View style={[styles.dualRow, a3]}>
          <View style={[styles.card, styles.dualCard]}>
            <Text style={styles.cardLabel}>{t('cycle.cl.lbl')}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setCycleLen(v => String(Math.max(20, (parseInt(v) || 28) - 1)))} hitSlop={8}>
                <Text style={styles.stepBtnTxt}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepVal}>{cycleLen}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setCycleLen(v => String(Math.min(45, (parseInt(v) || 28) + 1)))} hitSlop={8}>
                <Text style={styles.stepBtnTxt}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.stepUnit}>days</Text>
          </View>

          <View style={[styles.card, styles.dualCard]}>
            <Text style={styles.cardLabel}>{t('cycle.pl.lbl')}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setPeriodLen(v => String(Math.max(2, (parseInt(v) || 5) - 1)))} hitSlop={8}>
                <Text style={styles.stepBtnTxt}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepVal}>{periodLen}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setPeriodLen(v => String(Math.min(10, (parseInt(v) || 5) + 1)))} hitSlop={8}>
                <Text style={styles.stepBtnTxt}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.stepUnit}>days</Text>
          </View>
        </Animated.View>

        {/* Pill toggle */}
        <Animated.View style={a4}>
          <View style={styles.card}>
            <View style={styles.pillHeader}>
              <View style={styles.pillIconWrap}>
                <Icon name="pill" size={18} color={Colors.berry[600]} strokeWidth={1.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pillQ}>{t('cycle.pill.q')}</Text>
                <Text style={styles.pillSub}>{t('cycle.pill.sub')}</Text>
              </View>
            </View>
            <View style={styles.pillToggle}>
              <TouchableOpacity style={[styles.pillBtn, pill === true && styles.pillBtnActive]} onPress={() => setPill(pill === true ? null : true)} activeOpacity={0.8}>
                <Text style={[styles.pillBtnTxt, pill === true && styles.pillBtnTxtActive]}>{t('cycle.pill.yes')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pillBtn, pill === false && styles.pillBtnActive]} onPress={() => setPill(pill === false ? null : false)} activeOpacity={0.8}>
                <Text style={[styles.pillBtnTxt, pill === false && styles.pillBtnTxtActive]}>{t('cycle.pill.no')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.88} style={[styles.ctaBtn, saving && { opacity: 0.7 }]} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.ctaBtnText}>{t('cycle.cta')}</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sky[50] },
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  backIcon: { fontSize: 24, color: Colors.beige[600], lineHeight: 28, marginTop: -2 },
  skipTxt: { fontFamily: Fonts.sansLight, fontSize: 14, color: Colors.beige[400] },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  orbWrap: { alignSelf: 'flex-start', marginBottom: 28 },
  orb: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  heading: { fontFamily: Fonts.sansBold, fontSize: 40, color: Colors.beige[800], lineHeight: 48, letterSpacing: -1, marginBottom: 10 },
  subtitle: { fontFamily: Fonts.sansLight, fontSize: 17, color: Colors.beige[400], lineHeight: 26, marginBottom: 32 },
  sectionLabel: { fontFamily: Fonts.sansBold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.beige[400], marginBottom: 10 },
  card: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 22, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
  dualRow: { flexDirection: 'row', gap: 12 },
  dualCard: { flex: 1 },
  cardLabel: { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.beige[400], marginBottom: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  stepBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.beige[100], alignItems: 'center', justifyContent: 'center' },
  stepBtnTxt: { fontFamily: Fonts.sansMedium, fontSize: 16, color: Colors.beige[400], lineHeight: 20 },
  stepVal: { fontFamily: Fonts.sansMedium, fontSize: 22, color: Colors.beige[800], textAlign: 'center', minWidth: 36 },
  stepUnit: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], marginTop: 6 },
  pillHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 18 },
  pillIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.berry[50], alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pillQ: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.beige[800], marginBottom: 4, lineHeight: 20 },
  pillSub: { fontFamily: Fonts.sansLight, fontSize: 13, color: Colors.beige[400], lineHeight: 18 },
  pillToggle: { flexDirection: 'row', gap: 10 },
  pillBtn: { flex: 1, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.beige[200], alignItems: 'center', backgroundColor: 'transparent' },
  pillBtnActive: { borderColor: Colors.berry[400], backgroundColor: Colors.berry[50] },
  pillBtnTxt: { fontFamily: Fonts.sansMedium, fontSize: 14, color: Colors.beige[600] },
  pillBtnTxtActive: { color: Colors.berry[600] },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  ctaBtn: { height: 60, borderRadius: 999, backgroundColor: Colors.blush[400], alignItems: 'center', justifyContent: 'center', shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 8 },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 17, color: '#fff', letterSpacing: 0.2 },
});
