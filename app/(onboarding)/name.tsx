import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useNavigation } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Input } from '../../components/ui/Input';
import { DatePicker } from '../../components/ui/DatePicker';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useTranslation } from '../../lib/LangContext';

function calcAge(year: number, month: number, day: number): number {
  const today = new Date();
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 - month < 0 || (today.getMonth() + 1 - month === 0 && today.getDate() < day)) age--;
  return age;
}

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

export default function NameScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const today = new Date();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('--');
  const [nameError, setNameError] = useState('');
  const [birthError, setBirthError] = useState('');
  const upsertProfile = useMutation(api.profiles.upsert);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const navAnim  = useSpringIn(0);
  const headAnim = useSpringIn(100);
  const f1Anim   = useSpringIn(220);
  const f2Anim   = useSpringIn(340);

  const handleContinue = async () => {
    if (!name.trim()) { setNameError(t('name.err.required')); return; }
    const parts = birthDate.split('-');
    const yr = parseInt(parts[0] ?? '');
    const mo = parseInt(parts[1] ?? '');
    const dy = parseInt(parts[2] ?? '');
    const hasYear  = !isNaN(yr) && yr > 1900 && yr <= today.getFullYear();
    const hasMonth = !isNaN(mo) && mo >= 1 && mo <= 12;
    const hasDay   = !isNaN(dy) && dy >= 1 && dy <= 31;
    if (hasYear && hasMonth && hasDay) {
      if (calcAge(yr, mo, dy) < 16) { setBirthError(t('name.err.age')); return; }
    } else if (hasYear) {
      if (today.getFullYear() - yr < 16) { setBirthError(t('name.err.age')); return; }
    }
    setBirthError(''); setNameError(''); setSaveError('');
    setSaving(true);
    try {
      await upsertProfile({
        name: name.trim(),
        birth_year: hasYear ? yr : undefined,
        birth_month: hasMonth ? mo : undefined,
        birth_day: hasDay ? dy : undefined,
      });
      router.push('/(onboarding)/fitness');
    } catch (e: any) {
      setSaveError(e?.message ?? 'Midagi läks valesti. Proovi uuesti.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F5ECEA', '#EFE4E0', '#FAFAFA']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={navAnim}>
        <View style={styles.navRow}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
          )}
        </View>
        <StepBar step={1} />
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headGroup, headAnim]}>
          <Text style={styles.eyebrow}>{t('name.eyebrow')}</Text>
          <Text style={styles.title}>{t('name.title')}</Text>
          <Text style={styles.subtitle}>{t('name.body')}</Text>
        </Animated.View>

        <Animated.View style={f1Anim}>
          <Input
            label={t('name.lbl')} value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            placeholder={t('name.ph')} autoCapitalize="words"
            autoComplete="given-name" error={nameError}
          />
        </Animated.View>

        <Animated.View style={f2Anim}>
          <Text style={styles.dobLabel}>{t('name.birth.lbl')}</Text>
          <View style={styles.dobCard}>
            <DatePicker value={birthDate} onChange={(v) => { setBirthDate(v); setBirthError(''); }} />
          </View>
          {birthError ? <Text style={styles.errTxt}>{birthError}</Text> : null}
        </Animated.View>
        {saveError ? <Text style={[styles.errTxt, { marginTop: 8 }]}>{saveError}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.ctaBtn, saving && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.ctaBtnText}>{t('name.cta')}</Text>}
        </TouchableOpacity>
      </View>
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
  headGroup: { marginBottom: 36 },
  eyebrow: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 2,
    textTransform: 'uppercase', color: Colors.blush[400], marginBottom: 10,
  },
  title: {
    fontFamily: Fonts.sansBold, fontSize: 38,
    color: Colors.beige[800], lineHeight: 44, letterSpacing: -0.5, marginBottom: 10,
  },
  subtitle: { fontFamily: Fonts.sansLight, fontSize: 16, color: Colors.beige[400], lineHeight: 24 },
  dobLabel: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.4,
    textTransform: 'uppercase', color: Colors.beige[400], marginTop: 28, marginBottom: 14,
  },
  dobCard: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20,
    paddingVertical: 22, paddingHorizontal: 18,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 3 },
  },
  errTxt: { fontFamily: Fonts.sansLight, fontSize: 12.5, color: Colors.error.text, marginTop: 10 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 44 },
  ctaBtn: {
    height: 58, borderRadius: 999, backgroundColor: Colors.beige[800],
    alignItems: 'center', justifyContent: 'center',
  },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 16, color: '#fff', letterSpacing: 0.2 },
});
