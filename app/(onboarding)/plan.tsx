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

export default function PlanScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Plan>('monthly');
  const upsertProfile = useMutation(api.profiles.upsert);

  const a0 = useFade(0); const a1 = useFade(100); const a2 = useFade(200);
  const a3 = useFade(300); const a4 = useFade(400);

  const handleContinue = async () => {
    try { await upsertProfile({ plan: selected }); } catch (_) {}
    router.push('/(onboarding)/ready' as any);
  };

  const PLANS = [
    {
      key: 'free' as Plan, anim: a2,
      name: t('plan.free.name'), price: '0€', per: t('plan.free.per'), badge: t('plan.free.badge'),
      features: [
        { text: t('plan.free.f1'), on: true }, { text: t('plan.free.f2'), on: false },
        { text: t('plan.free.f3'), on: false }, { text: t('plan.free.f4'), on: false },
      ],
    },
    {
      key: 'monthly' as Plan, anim: a3,
      name: t('plan.monthly.name'), price: '4.99€', per: t('plan.monthly.per'),
      badge: 'PRO', popular: true, trial: true,
      features: [
        { text: t('plan.monthly.f1'), on: true }, { text: t('plan.monthly.f2'), on: true },
        { text: t('plan.monthly.f3'), on: true }, { text: t('plan.monthly.f4'), on: true },
      ],
    },
    {
      key: 'yearly' as Plan, anim: a4,
      name: t('plan.yearly.name'), price: '49.99€', per: t('plan.yearly.per'),
      badge: '-17%', trial: true, sub: t('plan.yearly.sub'), features: [],
    },
  ];

  return (
    <View style={styles.root}>
      <Animated.View style={a0}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>
        <StepBar step={6} total={7} />
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.orbWrap, a1]}>
          <LinearGradient colors={[Colors.berry[200], Colors.berry[600]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb}>
            <Icon name="star" size={40} color="#fff" strokeWidth={1.2} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={a1}>
          <Text style={styles.heading}>{t('plan.title')}</Text>
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
                      <Text style={styles.popularTagTxt}>{t('plan.popular')}</Text>
                    </View>
                  )}
                  <View style={[styles.cardHeader, plan.popular && styles.cardHeaderWithTag]}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.cardHeaderRight}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeTxt}>{plan.badge}</Text>
                      </View>
                      <View style={[styles.selectRing, sel && styles.selectRingOn]} />
                    </View>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={styles.per}> {plan.per}</Text>
                  </View>
                  {plan.sub && <Text style={styles.planSub}>{plan.sub}</Text>}
                  {plan.trial && <Text style={styles.trialTxt}>✦ {t('plan.trial')}</Text>}
                  {plan.features.length > 0 && (
                    <View style={styles.featureList}>
                      {plan.features.map((f, fi) => (
                        <View key={fi} style={styles.featureRow}>
                          <Text style={[styles.featureDot, f.on ? styles.dotOn : styles.dotOff]}>{f.on ? '✓' : '–'}</Text>
                          <Text style={[styles.featureTxt, !f.on && styles.featureTxtOff]}>{f.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.88} style={styles.ctaBtn} onPress={handleContinue}>
          <Text style={styles.ctaBtnText}>
            {t(selected === 'free' ? 'plan.cta.free' : selected === 'monthly' ? 'plan.cta.monthly' : 'plan.cta.yearly')}
          </Text>
        </TouchableOpacity>
        <View style={styles.secureRow}>
          <Icon name="lock" size={11} color={Colors.beige[400]} />
          <Text style={styles.secureTxt}>{t('plan.secure')}</Text>
        </View>
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
  orb: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: Colors.berry[400], shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  heading: { fontFamily: Fonts.sansBold, fontSize: 40, color: Colors.beige[800], lineHeight: 48, letterSpacing: -1, marginBottom: 10 },
  subtitle: { fontFamily: Fonts.sansLight, fontSize: 17, color: Colors.beige[400], lineHeight: 26, marginBottom: 28 },
  cardWrap: { marginBottom: 10 },
  card: { padding: 20, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, position: 'relative', overflow: 'hidden' },
  cardSelected: { borderColor: Colors.sky[400], backgroundColor: '#fff' },
  popularTag: { position: 'absolute', top: 0, left: 0, backgroundColor: Colors.blush[400], paddingHorizontal: 8, paddingVertical: 3, borderBottomRightRadius: 8 },
  popularTagTxt: { fontFamily: Fonts.sansBold, color: '#fff', fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHeaderWithTag: { marginTop: 16 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planName: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.beige[800] },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.sky[100] },
  badgeTxt: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 0.7, textTransform: 'uppercase', color: Colors.sky[600] },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  price: { fontFamily: Fonts.sansBold, fontSize: 34, color: Colors.beige[800] },
  per: { fontFamily: Fonts.sansLight, fontSize: 14, color: Colors.beige[400] },
  planSub: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], marginBottom: 4 },
  trialTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.sky[600], marginTop: 8, marginBottom: 2 },
  featureList: { marginTop: 16, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureDot: { fontFamily: Fonts.sansBold, fontSize: 12, width: 14 },
  dotOn: { color: Colors.blush[400] }, dotOff: { color: Colors.beige[200] },
  featureTxt: { fontFamily: Fonts.sansLight, fontSize: 13, color: Colors.beige[600] },
  featureTxtOff: { color: Colors.beige[400] },
  selectRing: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#000' },
  selectRingOn: { backgroundColor: Colors.sky[400] },
  footer: { paddingHorizontal: 24, paddingBottom: 44, paddingTop: 12 },
  ctaBtn: { height: 60, borderRadius: 999, backgroundColor: Colors.blush[400], alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 8 },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 17, color: '#fff', letterSpacing: 0.2 },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  secureTxt: { fontFamily: Fonts.sansLight, fontSize: 11.5, color: Colors.beige[400] },
});
