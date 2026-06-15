import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { useTranslation } from '../../lib/LangContext';

const CARDS = [
  { icon: 'moon'    as const, keyTitle: 'overview.card1.title', keyBody: 'overview.card1.body', color: Colors.blush },
  { icon: 'barbell' as const, keyTitle: 'overview.card2.title', keyBody: 'overview.card2.body', color: Colors.sky   },
  { icon: 'spark'   as const, keyTitle: 'overview.card3.title', keyBody: 'overview.card3.body', color: Colors.berry },
] as const;

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

export default function OverviewScreen() {
  const { t } = useTranslation();

  const navAnim  = useSpringIn(0);
  const headAnim = useSpringIn(100);
  const card0    = useSpringIn(240);
  const card1    = useSpringIn(340);
  const card2    = useSpringIn(440);
  const ctaAnim  = useSpringIn(520);
  const cardAnims = [card0, card1, card2];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FAF0EC', '#F5E8E4', '#FAFAFA']}
        locations={[0, 0.4, 1]}
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
        <StepBar step={0} />
      </Animated.View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.headGroup, headAnim]}>
          <Text style={styles.eyebrow}>{t('overview.eyebrow')}</Text>
          <Text style={styles.title}>{t('overview.title')}</Text>
          <Text style={styles.subtitle}>{t('overview.subtitle')}</Text>
        </Animated.View>

        {CARDS.map((card, i) => (
          <Animated.View key={i} style={[styles.card, cardAnims[i]]}>
            <View style={[styles.iconWrap, { backgroundColor: card.color[50] }]}>
              <Icon name={card.icon} size={22} color={card.color[600]} strokeWidth={1.3} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{t(card.keyTitle)}</Text>
              <Text style={styles.cardText}>{t(card.keyBody)}</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <Animated.View style={[styles.footer, ctaAnim]}>
        <TouchableOpacity activeOpacity={0.88} style={styles.ctaBtn} onPress={() => router.push('/(onboarding)/name')}>
          <Text style={styles.ctaBtnText}>{t('overview.cta')}</Text>
        </TouchableOpacity>
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
    fontFamily: Fonts.sansBold, fontSize: 40,
    color: Colors.beige[800], lineHeight: 46, letterSpacing: -0.8, marginBottom: 10,
  },
  subtitle: { fontFamily: Fonts.sansLight, fontSize: 16, color: Colors.beige[400], lineHeight: 25 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    padding: 20, borderRadius: 22, marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: Fonts.sansBold, fontSize: 15, color: Colors.beige[800], marginBottom: 5 },
  cardText: { fontFamily: Fonts.sansLight, fontSize: 13, color: Colors.beige[500], lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 44 },
  ctaBtn: {
    height: 58, borderRadius: 999, backgroundColor: Colors.beige[800],
    alignItems: 'center', justifyContent: 'center',
  },
  ctaBtnText: { fontFamily: Fonts.sansBold, fontSize: 16, color: '#fff', letterSpacing: 0.2 },
});
