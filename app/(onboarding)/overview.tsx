import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { useTranslation } from '../../lib/LangContext';

const CARDS = [
  { icon: 'moon'    as const, keyTitle: 'overview.card1.title', keyBody: 'overview.card1.body', grad: [Colors.blush[200], Colors.blush[400]] as const },
  { icon: 'barbell' as const, keyTitle: 'overview.card2.title', keyBody: 'overview.card2.body', grad: [Colors.blush[200], Colors.blush[400]] as const },
  { icon: 'spark'   as const, keyTitle: 'overview.card3.title', keyBody: 'overview.card3.body', grad: [Colors.blush[200], Colors.blush[400]] as const },
] as const;

function useFade(delay: number) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(op, { toValue: 1, duration: 420, useNativeDriver: false }),
        Animated.spring(ty, { toValue: 0, damping: 20, stiffness: 180, mass: 0.7, useNativeDriver: false }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  return { opacity: op, transform: [{ translateY: ty }] };
}

export default function OverviewScreen() {
  const { t } = useTranslation();
  const a0 = useFade(0); const a1 = useFade(120); const a2 = useFade(240); const a3 = useFade(360);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.sky[50], Colors.sky[50], '#FFFFFF']} locations={[0, 0.45, 1]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} pointerEvents="none" />

      <Animated.View style={a0}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headGroup, a1]}>
          <Text style={styles.heading}>{t('overview.title')}</Text>
          <Text style={styles.subtitle}>{t('overview.subtitle')}</Text>
        </Animated.View>

        {CARDS.map((card, i) => (
          <Animated.View key={i} style={[styles.card, [a1, a2, a3][i]]}>
            <LinearGradient colors={card.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardOrb}>
              <Icon name={card.icon} size={22} color="#fff" strokeWidth={1.3} />
            </LinearGradient>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{t(card.keyTitle as any)}</Text>
              <Text style={styles.cardText}>{t(card.keyBody as any)}</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.88} style={styles.ctaBtn} onPress={() => router.push('/(onboarding)/signup' as any)}>
          <Text style={styles.ctaBtnText}>{t('overview.cta')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sky[50] },
  navRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24, color: Colors.beige[600], lineHeight: 28, marginTop: -2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
  headGroup: { marginBottom: 32 },
  heading: { fontFamily: Fonts.sansBold, fontSize: 38, color: Colors.beige[800], lineHeight: 46, letterSpacing: -0.8, marginBottom: 10 },
  subtitle: { fontFamily: Fonts.sansLight, fontSize: 16, color: Colors.beige[400], lineHeight: 24 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 18,
    padding: 22, borderRadius: 22, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  cardOrb: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  cardBody: { flex: 1, paddingTop: 2 },
  cardTitle: { fontFamily: Fonts.sansBold, fontSize: 15, color: Colors.beige[800], marginBottom: 6 },
  cardText: { fontFamily: Fonts.sansLight, fontSize: 13.5, color: Colors.beige[400], lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 44 },
  ctaBtn: {
    height: 58, borderRadius: 999, backgroundColor: Colors.blush[400],
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 8,
  },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 16, color: '#fff', letterSpacing: 0.2 },
});
