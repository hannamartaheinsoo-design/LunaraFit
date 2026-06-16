import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { useTranslation } from '../../lib/LangContext';

const { width: W, height: H } = Dimensions.get('window');
const D  = W * 1.58;
const OX = -(D - W) / 2;
const OY = (H - D) / 2;

const LANGS = [
  { code: 'et' as const, flag: '🇪🇪', name: 'Eesti' },
  { code: 'en' as const, flag: '🇬🇧', name: 'English' },
  { code: 'de' as const, flag: '🇩🇪', name: 'Deutsch' },
  { code: 'es' as const, flag: '🇪🇸', name: 'Español' },
];

function useFade(delay: number) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(22)).current;
  useEffect(() => {
    const id = setTimeout(() => {
      Animated.parallel([
        Animated.timing(op, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.timing(ty, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]).start();
    }, delay);
    return () => clearTimeout(id);
  }, []);
  return { opacity: op, transform: [{ translateY: ty }] };
}

export default function LanguageScreen() {
  const { lang, setLang, t } = useTranslation();
  const a0 = useFade(60);
  const a1 = useFade(180);
  const a2 = useFade(340);

  return (
    <View style={styles.root}>
      {/* Same ombre gradient */}
      <LinearGradient
        colors={['#D4607C', '#EFA8BC', '#F8E4EB', '#FAFAFA', '#FAFAFA', '#E0C0F0', '#A870C0']}
        locations={[0, 0.14, 0.30, 0.44, 0.56, 0.82, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Back button floats above gradient */}
      <TouchableOpacity onPress={() => router.back()} style={styles.back} hitSlop={12}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      {/* Same white oval — content inside */}
      <View style={[styles.oval, { width: D, height: D, borderRadius: D / 2, left: OX, top: OY }]}>
        <View style={styles.inner}>

          <Animated.Text style={[styles.heading, a0]}>
            {t('welcome.langLabel')}
          </Animated.Text>

          <Animated.View style={[styles.list, a1]}>
            {LANGS.map((l) => {
              const active = lang === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  activeOpacity={0.72}
                  style={[styles.row, active && styles.rowActive]}
                  onPress={() => setLang(l.code)}
                >
                  <Text style={styles.flag}>{l.flag}</Text>
                  <Text style={[styles.name, active && styles.nameActive]}>{l.name}</Text>
                  <View style={[styles.dot, active && styles.dotActive]} />
                </TouchableOpacity>
              );
            })}
          </Animated.View>

          <Animated.View style={a2}>
            <TouchableOpacity
              style={styles.pill}
              activeOpacity={0.72}
              onPress={() => router.push('/(onboarding)/overview' as any)}
            >
              <Text style={styles.pillTxt}>→  {t('overview.cta').replace(' →', '')}</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },

  back: {
    position: 'absolute',
    top: 56, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  backIcon: { fontSize: 22, color: Colors.beige[600], lineHeight: 26, marginTop: -1 },

  oval: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    shadowColor: '#B060A0',
    shadowOpacity: 0.08,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    alignItems: 'center',
    justifyContent: 'center',
  },

  inner: {
    width: W - 56,
    alignItems: 'center',
  },

  heading: {
    fontFamily: Fonts.sansBold,
    fontSize: 32,
    color: Colors.beige[800],
    letterSpacing: -0.8,
    marginBottom: 36,
    textAlign: 'center',
  },

  list: { width: '100%', gap: 10, marginBottom: 44 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.0)',
    borderWidth: 1.5,
    borderColor: 'rgba(200,170,190,0.28)',
  },
  rowActive: {
    backgroundColor: 'rgba(212,96,124,0.07)',
    borderColor: 'rgba(212,96,124,0.32)',
  },

  flag: { fontSize: 24 },

  name: {
    flex: 1,
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.beige[500] ?? Colors.beige[400],
    letterSpacing: 0.1,
  },
  nameActive: {
    fontFamily: Fonts.sansSemiBold,
    color: '#C04870',
  },

  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(200,170,190,0.4)',
  },
  dotActive: {
    backgroundColor: '#D4607C',
    borderColor: '#D4607C',
  },

  pill: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(212,96,124,0.09)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,96,124,0.22)',
  },
  pillTxt: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 1.8,
    color: Colors.blush[600],
    textTransform: 'uppercase',
  },
});
