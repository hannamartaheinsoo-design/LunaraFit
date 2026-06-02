import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/authContext';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Plan } from '../../types';
import { useTranslation } from '../../lib/LangContext';

export default function PlanScreen() {
  const { refreshAuth } = useAuth();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Plan>('monthly');

  const handleContinue = async () => {
    const existing = await AsyncStorage.getItem('lf_profile');
    const profile = existing ? JSON.parse(existing) : {};
    await AsyncStorage.setItem('lf_profile', JSON.stringify({ ...profile, plan: selected }));
    await refreshAuth();
  };

  const PLANS = [
    {
      key: 'free' as Plan,
      name: t('plan.free.name'), price: '0€', per: t('plan.free.per'),
      badge: t('plan.free.badge'), badgeColor: Colors.green,
      features: [
        { text: t('plan.free.f1'), active: true }, { text: t('plan.free.f2'), active: true },
        { text: t('plan.free.f3'), active: false }, { text: t('plan.free.f4'), active: false },
      ],
    },
    {
      key: 'monthly' as Plan,
      name: t('plan.monthly.name'), price: '4.99€', per: t('plan.monthly.per'),
      badge: t('plan.monthly.badge'), badgeColor: Colors.blush, popular: true,
      features: [
        { text: t('plan.monthly.f1'), active: true }, { text: t('plan.monthly.f2'), active: true },
        { text: t('plan.monthly.f3'), active: true }, { text: t('plan.monthly.f4'), active: true },
      ],
    },
    {
      key: 'yearly' as Plan,
      name: t('plan.yearly.name'), price: '49.99€', per: t('plan.yearly.per'),
      badge: t('plan.yearly.badge'), badgeColor: Colors.green, sub: t('plan.yearly.sub'), features: [],
    },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{t('ob.back')}</Text>
      </TouchableOpacity>

      <Eyebrow>{t('plan.eyebrow')}</Eyebrow>
      <SerifTitle>{t('plan.title')}</SerifTitle>
      <BodyText>{t('plan.body')}</BodyText>

      <View style={styles.planList}>
        {PLANS.map((plan) => (
          <TouchableOpacity key={plan.key} activeOpacity={0.8} style={[styles.planCard, selected === plan.key && styles.planCardSel]} onPress={() => setSelected(plan.key)}>
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>{t('plan.popular')}</Text>
              </View>
            )}
            <View style={styles.planRow}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={[styles.badge, { backgroundColor: plan.badgeColor[50], borderColor: plan.badgeColor[200] }]}>
                <Text style={[styles.badgeText, { color: plan.badgeColor[800] }]}>{plan.badge}</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.per}>{plan.per}</Text>
            </View>
            {plan.sub && <Text style={styles.planSub}>{plan.sub}</Text>}
            {plan.features.map((f, i) => (
              <View key={i} style={styles.feature}>
                <View style={[styles.dot, !f.active && styles.dotDim]} />
                <Text style={[styles.featureText, !f.active && styles.featureTextDim]}>{f.text}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ))}
      </View>

      <Button variant="dark" size="lg" fullWidth onPress={handleContinue} style={styles.btn}>
        {t(selected === 'free' ? 'plan.cta.free' : selected === 'monthly' ? 'plan.cta.monthly' : 'plan.cta.yearly')}
      </Button>
      <View style={styles.secureNote}>
        <Icon name="lock" size={11} color={Colors.beige[400]} />
        <Text style={styles.secureNoteTxt}>{t('plan.secure')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: Spacing.xxl, paddingBottom: 60 },
  back: { marginBottom: 20 },
  backText: { color: Colors.beige[400], fontSize: 14 },
  planList: { gap: 10, marginBottom: 16 },
  planCard: {
    padding: 18,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.beige[100],
    backgroundColor: Colors.cream,
    position: 'relative',
  },
  planCardSel: { borderColor: Colors.blush[400], backgroundColor: Colors.blush[50] },
  popularBadge: {
    position: 'absolute', top: -1, right: 16,
    backgroundColor: Colors.blush[400],
    paddingHorizontal: 10, paddingVertical: 4,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
  },
  popularText: { fontFamily: Fonts.sansBold, color: '#fff', fontSize: 9, letterSpacing: 0.7, textTransform: 'uppercase' },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  planName: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.beige[800] },
  badge: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  badgeText: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  price: { fontFamily: Fonts.serifSemiBold, fontSize: 28, color: Colors.blush[800] },
  per: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400] },
  planSub: { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 4 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.green[400] },
  dotDim: { backgroundColor: Colors.beige[200] },
  featureText: { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[600] },
  featureTextDim: { color: Colors.beige[400] },
  btn: { marginTop: 22 },
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 10 },
  secureNoteTxt: { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400] },
});
