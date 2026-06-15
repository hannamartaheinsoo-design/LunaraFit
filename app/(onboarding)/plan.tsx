import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Plan } from '../../types';
import { useTranslation } from '../../lib/LangContext';

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

export default function PlanScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Plan>('monthly');
  const upsertProfile = useMutation(api.profiles.upsert);

  const navAnim  = useSpringIn(0);
  const headAnim = useSpringIn(100);
  const p0 = useSpringIn(220);
  const p1 = useSpringIn(320);
  const p2 = useSpringIn(420);
  const ctaAnim  = useSpringIn(520);

  const handleContinue = async () => {
    try { await upsertProfile({ plan: selected }); } catch (_) {}
    router.replace('/(tabs)/home' as any);
  };

  const PLANS = [
    {
      key: 'free' as Plan, anim: p0,
      name: t('plan.free.name'), price: '0€', per: t('plan.free.per'), badge: t('plan.free.badge'),
      features: [
        { text: t('plan.free.f1'), on: true }, { text: t('plan.free.f2'), on: false },
        { text: t('plan.free.f3'), on: false }, { text: t('plan.free.f4'), on: false },
      ],
    },
    {
      key: 'monthly' as Plan, anim: p1,
      name: t('plan.monthly.name'), price: '4.99€', per: t('plan.monthly.per'),
      badge: 'PRO', popular: true, trial: true,
      features: [
        { text: t('plan.monthly.f1'), on: true }, { text: t('plan.monthly.f2'), on: true },
        { text: t('plan.monthly.f3'), on: true }, { text: t('plan.monthly.f4'), on: true },
      ],
    },
    {
      key: 'yearly' as Plan, anim: p2,
      name: t('plan.yearly.name'), price: '49.99€', per: t('plan.yearly.per'),
      badge: '-17%', trial: true, sub: t('plan.yearly.sub'), features: [],
    },
  ];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#F0E8EA', '#EAE0E4', '#FAFAFA']}
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
        <StepBar step={3} />
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headGroup, headAnim]}>
          <Text style={styles.eyebrow}>{t('plan.eyebrow')}</Text>
          <Text style={styles.title}>{t('plan.title')}</Text>
          <Text style={styles.subtitle}>{t('plan.body')}</Text>
        </Animated.View>

        {PLANS.map((plan) => {
          const sel = selected === plan.key;
          return (
            <Animated.View key={plan.key} style={[styles.cardWrap, plan.anim]}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => setSelected(plan.key)}>
                <View style={[styles.card, sel && styles.cardSelected]}>
                  {plan.popular && (
                    <View style={styles.popularTag}>
                      <Text style={styles.popularTagText}>{t('plan.popular')}</Text>
                    </View>
                  )}
                  <View style={styles.cardHeader}>
                    <Text style={[styles.planName, sel && styles.planNameSel]}>{plan.name}</Text>
                    <View style={[styles.badge, sel && styles.badgeSel]}>
                      <Text style={[styles.badgeText, sel && styles.badgeTextSel]}>{plan.badge}</Text>
                    </View>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={[styles.price, sel && styles.priceSel]}>{plan.price}</Text>
                    <Text style={styles.per}> {plan.per}</Text>
                  </View>
                  {plan.sub && <Text style={styles.planSub}>{plan.sub}</Text>}
                  {plan.trial && (
                    <View style={styles.trialRow}>
                      <Text style={styles.trialText}>✦ {t('plan.trial')}</Text>
                    </View>
                  )}
                  {plan.features.length > 0 && (
                    <View style={styles.featureList}>
                      {plan.features.map((f, fi) => (
                        <View key={fi} style={styles.featureRow}>
                          <Text style={[styles.featureDot, f.on ? styles.featureDotOn : styles.featureDotOff]}>{f.on ? '✓' : '–'}</Text>
                          <Text style={[styles.featureText, !f.on && styles.featureTextOff]}>{f.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={[styles.selectRing, sel && styles.selectRingOn]} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      <Animated.View style={[styles.footer, ctaAnim]}>
        <TouchableOpacity activeOpacity={0.88} style={styles.ctaBtn} onPress={handleContinue}>
          <Text style={styles.ctaBtnText}>
            {t(selected === 'free' ? 'plan.cta.free' : selected === 'monthly' ? 'plan.cta.monthly' : 'plan.cta.yearly')}
          </Text>
        </TouchableOpacity>
        <View style={styles.secureRow}>
          <Icon name="lock" size={11} color={Colors.beige[400]} />
          <Text style={styles.secureText}>{t('plan.secure')}</Text>
        </View>
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
  headGroup: { marginBottom: 28 },
  eyebrow: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 2,
    textTransform: 'uppercase', color: Colors.blush[400], marginBottom: 10,
  },
  title: {
    fontFamily: Fonts.sansBold, fontSize: 38,
    color: Colors.beige[800], lineHeight: 44, letterSpacing: -0.5, marginBottom: 8,
  },
  subtitle: { fontFamily: Fonts.sansLight, fontSize: 16, color: Colors.beige[400], lineHeight: 24 },
  cardWrap: { marginBottom: 10 },
  card: {
    padding: 20, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5, borderColor: 'transparent',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    position: 'relative', overflow: 'hidden',
  },
  cardSelected: { borderColor: Colors.blush[400], backgroundColor: 'rgba(253,241,242,0.95)', shadowOpacity: 0 },
  popularTag: {
    position: 'absolute', top: 0, right: 20, backgroundColor: Colors.blush[400],
    paddingHorizontal: 12, paddingVertical: 5,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
  },
  popularTagText: { fontFamily: Fonts.sansBold, color: '#fff', fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  planName: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.beige[600] },
  planNameSel: { color: Colors.beige[800] },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.beige[100] },
  badgeSel: { backgroundColor: Colors.blush[200] },
  badgeText: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 0.7, textTransform: 'uppercase', color: Colors.beige[600] },
  badgeTextSel: { color: Colors.blush[800] },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  price: { fontFamily: Fonts.sansBold, fontSize: 34, color: Colors.beige[400] },
  priceSel: { color: Colors.blush[800] },
  per: { fontFamily: Fonts.sansLight, fontSize: 14, color: Colors.beige[400] },
  planSub: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], marginBottom: 4 },
  trialRow: { marginTop: 8, marginBottom: 2 },
  trialText: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.sky[600] },
  featureList: { marginTop: 16, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureDot: { fontFamily: Fonts.sansBold, fontSize: 12, width: 14 },
  featureDotOn: { color: Colors.blush[400] },
  featureDotOff: { color: Colors.beige[300] },
  featureText: { fontFamily: Fonts.sansLight, fontSize: 13, color: Colors.beige[600] },
  featureTextOff: { color: Colors.beige[400] },
  selectRing: {
    position: 'absolute', top: 18, right: 18, width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.beige[200],
  },
  selectRingOn: { borderColor: Colors.blush[400], backgroundColor: Colors.blush[400] },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 44 },
  ctaBtn: {
    height: 58, borderRadius: 999, backgroundColor: Colors.beige[800],
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 16, color: '#fff', letterSpacing: 0.2 },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  secureText: { fontFamily: Fonts.sansLight, fontSize: 11.5, color: Colors.beige[400] },
});
