import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts, Radius } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useTranslation } from '../../lib/LangContext';

function useFadeIn(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: false }),
        Animated.spring(translateY, { toValue: 0, damping: 18, stiffness: 160, mass: 0.8, useNativeDriver: false }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  return { opacity, transform: [{ translateY }] };
}

const FEATURE_ICONS = [
  { icon: 'moon'    as const, grad: [Colors.blush[200],  Colors.blush[400]]  as const },
  { icon: 'barbell' as const, grad: [Colors.sky[200],    Colors.sky[600]]    as const },
  { icon: 'spark'   as const, grad: [Colors.berry[200],  Colors.berry[600]]  as const },
];

export default function ReadyScreen() {
  const { t } = useTranslation();
  const profile = useQuery(api.profiles.get);
  const upsertProfile = useMutation(api.profiles.upsert);
  const firstName = profile?.name?.split(' ')[0] ?? '';

  const a0 = useFadeIn(0);
  const a1 = useFadeIn(180);
  const a2 = useFadeIn(340);
  const a3 = useFadeIn(500);

  const handleDone = async () => {
    try { await upsertProfile({ onboarding_complete: true }); } catch (_) {}
    router.replace('/(tabs)/home' as any);
  };

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        {/* Large check orb */}
        <Animated.View style={[styles.orbWrap, a0]}>
          <LinearGradient
            colors={[Colors.blush[200], Colors.blush[600]]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.orb}
          >
            <Icon name="check" size={44} color="#fff" strokeWidth={2} />
          </LinearGradient>
        </Animated.View>

        {/* Heading */}
        <Animated.View style={[styles.headGroup, a1]}>
          <Text style={styles.heading}>
            {t('ob.ready.title')}{firstName ? ` ${firstName}` : ''}
          </Text>
          <Text style={styles.subtitle}>{t('ob.ready.body')}</Text>
        </Animated.View>

        {/* Feature icon row */}
        <Animated.View style={[styles.iconRow, a2]}>
          {FEATURE_ICONS.map((f, i) => (
            <LinearGradient key={i} colors={f.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconPill}>
              <Icon name={f.icon} size={24} color="#fff" strokeWidth={1.3} />
            </LinearGradient>
          ))}
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, a3]}>
        <TouchableOpacity activeOpacity={0.88} style={styles.ctaBtn} onPress={handleDone}>
          <Text style={styles.ctaBtnText}>{t('ob.ready.cta')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  body: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 28 },
  orbWrap: { marginBottom: 36 },
  orb: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35, shadowRadius: 24, elevation: 10,
  },
  headGroup: { marginBottom: 44 },
  heading: {
    fontFamily: Fonts.sansBold, fontSize: 40,
    color: Colors.beige[800], lineHeight: 48, letterSpacing: -1, marginBottom: 14,
  },
  subtitle: {
    fontFamily: Fonts.sansLight, fontSize: 17,
    color: Colors.beige[400], lineHeight: 26,
  },
  iconRow: { flexDirection: 'row', gap: 16 },
  iconPill: {
    width: 68, height: 68, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  ctaBtn: {
    height: 60, borderRadius: Radius.full, backgroundColor: Colors.beige[800],
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.beige[800], shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28, shadowRadius: 16, elevation: 8,
  },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 17, color: '#fff', letterSpacing: 0.2 },
});
