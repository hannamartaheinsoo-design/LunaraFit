import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { DatePicker } from '../../components/ui/DatePicker';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useTranslation } from '../../lib/LangContext';

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

function calcAge(y: number, m: number, d: number) {
  const today = new Date();
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 - m < 0 || (today.getMonth() + 1 - m === 0 && today.getDate() < d)) age--;
  return age;
}

export default function BirthDateScreen() {
  const { t } = useTranslation();
  const [birthDate, setBirthDate] = useState('--');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const upsertProfile = useMutation(api.profiles.upsert);
  const today = new Date();

  const a0 = useFade(0); const a1 = useFade(120); const a2 = useFade(260);

  const handleContinue = async () => {
    const parts = birthDate.split('-');
    const yr = parseInt(parts[0] ?? '');
    const mo = parseInt(parts[1] ?? '');
    const dy = parseInt(parts[2] ?? '');
    const hasYear  = !isNaN(yr) && yr > 1900 && yr <= today.getFullYear();
    const hasMonth = !isNaN(mo) && mo >= 1 && mo <= 12;
    const hasDay   = !isNaN(dy) && dy >= 1 && dy <= 31;
    if (hasYear && hasMonth && hasDay) {
      if (calcAge(yr, mo, dy) < 16) { setError(t('name.err.age')); return; }
    } else if (hasYear) {
      if (today.getFullYear() - yr < 16) { setError(t('name.err.age')); return; }
    }
    setError('');
    setSaving(true);
    try {
      await upsertProfile({
        birth_year:  hasYear  ? yr : undefined,
        birth_month: hasMonth ? mo : undefined,
        birth_day:   hasDay   ? dy : undefined,
      });
    } catch (_) {}
    setSaving(false);
    router.push('/(onboarding)/cycle' as any);
  };

  return (
    <View style={styles.root}>
      <Animated.View style={a0}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(onboarding)/cycle' as any)} hitSlop={8}>
            <Text style={styles.skipTxt}>{t('cycle.skip')}</Text>
          </TouchableOpacity>
        </View>
        <StepBar step={2} total={7} />
      </Animated.View>

      <View style={styles.body}>
        <Animated.View style={[styles.orbWrap, a1]}>
          <LinearGradient
            colors={[Colors.sky[200], Colors.sky[600]]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.orb}
          >
            <Icon name="spark" size={40} color="#fff" strokeWidth={1.2} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={a1}>
          <Text style={styles.heading}>{t('ob.birth.title')}</Text>
          <Text style={styles.subtitle}>{t('ob.birth.sub')}</Text>
        </Animated.View>

        <Animated.View style={a2}>
          <View style={styles.card}>
            <DatePicker value={birthDate} onChange={v => { setBirthDate(v); setError(''); }} />
          </View>
          {error ? <Text style={styles.errTxt}>{error}</Text> : null}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.ctaBtn, saving && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.ctaBtnText}>{t('ob.birth.cta')}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  backIcon: { fontSize: 24, color: Colors.beige[600], lineHeight: 28, marginTop: -2 },
  skipTxt: { fontFamily: Fonts.sansLight, fontSize: 14, color: Colors.beige[400] },
  body: { flex: 1, paddingHorizontal: 28, paddingTop: 36 },
  orbWrap: { alignSelf: 'flex-start', marginBottom: 32 },
  orb: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: Colors.sky[400], shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  heading: {
    fontFamily: Fonts.sansBold, fontSize: 40,
    color: Colors.beige[800], lineHeight: 48, letterSpacing: -1, marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.sansLight, fontSize: 17,
    color: Colors.beige[400], lineHeight: 26, marginBottom: 36,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 24,
    paddingVertical: 28, paddingHorizontal: 20,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
  },
  errTxt: { fontFamily: Fonts.sansLight, fontSize: 13, color: Colors.error.text, marginTop: 12 },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  ctaBtn: {
    height: 60, borderRadius: 999, backgroundColor: Colors.beige[800],
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.beige[800], shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28, shadowRadius: 16, elevation: 8,
  },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 17, color: '#fff', letterSpacing: 0.2 },
});
