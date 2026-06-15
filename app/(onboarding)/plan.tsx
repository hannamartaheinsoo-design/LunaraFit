import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';
import { OnboardingProgress } from '../../components/ui/OnboardingProgress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Plan } from '../../types';

const PLANS = [
  {
    key: 'free' as Plan,
    name: 'Tasuta',
    price: '0€',
    per: '/ alati',
    badge: 'Praegune',
    badgeColor: Colors.green,
    features: [
      { text: 'Kuni 10 treeningkorda kuus', active: true },
      { text: 'Tsükli kalender', active: true },
      { text: 'Faasipõhised ülevaated — Pro', active: false },
      { text: 'Andmeeksport — Pro', active: false },
    ],
  },
  {
    key: 'monthly' as Plan,
    name: 'Pro kuupakett',
    price: '4.99€',
    per: '/ kuus',
    badge: 'Pro',
    badgeColor: Colors.blush,
    popular: true,
    features: [
      { text: 'Piiramatud treeningkorrad', active: true },
      { text: 'Faasipõhised ülevaated', active: true },
      { text: 'Harjutuste faasivõrdlus', active: true },
      { text: 'Andmeeksport (CSV)', active: true },
    ],
  },
  {
    key: 'yearly' as Plan,
    name: 'Pro aastapakett',
    price: '49.99€',
    per: '/ aastas',
    badge: '-17%',
    badgeColor: Colors.green,
    sub: 'Kõik Pro funktsioonid · 4.17€/kuus',
    features: [],
  },
];

export default function PlanScreen() {
  const [selected, setSelected] = useState<Plan>('monthly');

  const handleContinue = async () => {
    const existing = await AsyncStorage.getItem('lf_profile');
    const profile = existing ? JSON.parse(existing) : {};
    await AsyncStorage.setItem('lf_profile', JSON.stringify({
      ...profile,
      plan: selected,
    }));
    router.replace('/(tabs)/home');
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Tagasi</Text>
      </TouchableOpacity>

      <OnboardingProgress step={5} total={5} />

      <Eyebrow>Vali pakett</Eyebrow>
      <SerifTitle>Alusta oma teekonda.</SerifTitle>
      <BodyText>Tühista igal ajal. Andmed jäävad alles.</BodyText>

      <View style={styles.planList}>
        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.key}
            activeOpacity={0.8}
            style={[styles.planCard, selected === plan.key && styles.planCardSel]}
            onPress={() => setSelected(plan.key)}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Populaarseim</Text>
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
        {selected === 'free' ? 'Jätka tasuta' : `Alusta Pro kasutamist (${selected === 'monthly' ? '4.99€/kuus' : '49.99€/aastas'})`}
      </Button>
      <Text style={styles.secureNote}>🔒 Makse on kaitstud · Tühista igal ajal</Text>
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
  popularText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  planName: { fontSize: 14, fontWeight: '700', color: Colors.beige[800] },
  badge: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  price: { fontSize: 28, fontWeight: '600', color: Colors.blush[800] },
  per: { fontSize: 12, color: Colors.beige[400], fontWeight: '300' },
  planSub: { fontSize: 11, color: Colors.beige[400], marginTop: 4 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.green[400] },
  dotDim: { backgroundColor: Colors.beige[200] },
  featureText: { fontSize: 11, color: Colors.beige[600] },
  featureTextDim: { color: Colors.beige[400] },
  btn: { marginTop: 22 },
  secureNote: { fontSize: 11, color: Colors.beige[400], textAlign: 'center', marginTop: 10 },
});
