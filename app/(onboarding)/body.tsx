import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
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

export default function BodyScreen() {
  const { t } = useTranslation();
  const [weightStr, setWeightStr] = useState('');
  const [heightStr, setHeightStr] = useState('');
  const [saving, setSaving] = useState(false);
  const upsertProfile = useMutation(api.profiles.upsert);

  const a0 = useFade(0); const a1 = useFade(100); const a2 = useFade(240);

  const handleContinue = async () => {
    setSaving(true);
    try {
      const weight = parseFloat(weightStr);
      const height = parseFloat(heightStr);
      await upsertProfile({
        weight_kg: isFinite(weight) && weight > 0 ? weight : undefined,
        height_cm: isFinite(height) && height > 0 ? height : undefined,
      });
      router.push('/(onboarding)/plan');
    } catch (_) {
      router.push('/(onboarding)/plan');
    } finally { setSaving(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View style={a0}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(onboarding)/plan')} hitSlop={8}>
            <Text style={styles.skipTxt}>{t('cycle.skip')}</Text>
          </TouchableOpacity>
        </View>
        <StepBar step={5} total={7} />
      </Animated.View>

      <View style={styles.body}>
        <Animated.View style={[styles.orbWrap, a1]}>
          <LinearGradient colors={[Colors.blush[100], Colors.blush[400]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
            <Icon name="heart" size={40} color="#fff" strokeWidth={1.2} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={a1}>
          <Text style={styles.heading}>{t('ob.body.title')}</Text>
          <Text style={styles.subtitle}>{t('ob.body.sub')}</Text>
        </Animated.View>

        <Animated.View style={[styles.statsRow, a2]}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('ob.weight.lbl')}</Text>
            <TextInput
              style={styles.statInput}
              value={weightStr}
              onChangeText={setWeightStr}
              placeholder={t('ob.weight.ph')}
              placeholderTextColor={Colors.beige[200]}
              keyboardType="decimal-pad"
              maxLength={5}
            />
            <Text style={styles.statUnit}>{t('ob.unit.kg')}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('ob.height.lbl')}</Text>
            <TextInput
              style={styles.statInput}
              value={heightStr}
              onChangeText={setHeightStr}
              placeholder={t('ob.height.ph')}
              placeholderTextColor={Colors.beige[200]}
              keyboardType="decimal-pad"
              maxLength={5}
            />
            <Text style={styles.statUnit}>{t('ob.unit.cm')}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.88} style={[styles.ctaBtn, saving && { opacity: 0.7 }]} onPress={handleContinue} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.ctaBtnText}>{t('name.cta')}</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  backIcon: { fontSize: 24, color: Colors.beige[600], lineHeight: 28, marginTop: -2 },
  skipTxt: { fontFamily: Fonts.sansLight, fontSize: 14, color: Colors.beige[400] },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  orbWrap: { alignSelf: 'flex-start', marginBottom: 28 },
  orb: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  heading: { fontFamily: Fonts.sansBold, fontSize: 40, color: Colors.beige[800], lineHeight: 48, letterSpacing: -1, marginBottom: 10 },
  subtitle: { fontFamily: Fonts.sansLight, fontSize: 17, color: Colors.beige[400], lineHeight: 26, marginBottom: 36 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  statLabel: { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.beige[400], marginBottom: 16 },
  statInput: { fontFamily: Fonts.sansBold, fontSize: 48, color: Colors.beige[800], padding: 0, minWidth: 80 },
  statUnit: { fontFamily: Fonts.sansLight, fontSize: 16, color: Colors.beige[400], marginTop: 6 },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  ctaBtn: { height: 60, borderRadius: 999, backgroundColor: Colors.beige[800], alignItems: 'center', justifyContent: 'center', shadowColor: Colors.beige[800], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 8 },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 17, color: '#fff', letterSpacing: 0.2 },
});
