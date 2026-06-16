import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useNavigation } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { Input } from '../../components/ui/Input';
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

export default function NameScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const upsertProfile = useMutation(api.profiles.upsert);

  const a0 = useFade(0);
  const a1 = useFade(120);
  const a2 = useFade(260);

  const handleContinue = async () => {
    if (!name.trim()) { setError(t('name.err.required')); return; }
    setError('');
    setSaving(true);
    try { await upsertProfile({ name: name.trim() }); } catch (_) {}
    setSaving(false);
    router.push('/(onboarding)/birthdate' as any);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Nav */}
      <Animated.View style={a0}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.replace('/(onboarding)/signup' as any)} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>
        <StepBar step={1} total={7} />
      </Animated.View>

      {/* Content */}
      <View style={styles.body}>
        <Animated.View style={[styles.orbWrap, a1]}>
          <LinearGradient
            colors={[Colors.blush[100], Colors.blush[400]]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.orb}
          >
            <Icon name="person" size={40} color="#fff" strokeWidth={1.2} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={a1}>
          <Text style={styles.heading}>{t('name.title')}</Text>
          <Text style={styles.subtitle}>{t('name.body')}</Text>
        </Animated.View>

        <Animated.View style={a2}>
          <Input
            label={t('name.lbl')}
            value={name}
            onChangeText={v => { setName(v); setError(''); }}
            placeholder={t('name.ph')}
            autoCapitalize="words"
            autoComplete="given-name"
            error={error}
            autoFocus
          />
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
            : <Text style={styles.ctaBtnText}>{t('name.cta')}</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sky[50] },

  navRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  backIcon: { fontSize: 24, color: Colors.beige[600], lineHeight: 28, marginTop: -2 },

  body: { flex: 1, paddingHorizontal: 28, paddingTop: 36 },

  orbWrap: { alignSelf: 'flex-start', marginBottom: 32 },
  orb: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
  },

  heading: {
    fontFamily: Fonts.sansBold, fontSize: 40,
    color: Colors.beige[800], lineHeight: 48, letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.sansLight, fontSize: 17,
    color: Colors.beige[600], lineHeight: 26, marginBottom: 40,
  },

  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  ctaBtn: {
    height: 60, borderRadius: 999, backgroundColor: Colors.blush[400],
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28, shadowRadius: 16, elevation: 8,
  },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 17, color: '#fff', letterSpacing: 0.2 },
});
