import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { useTranslation } from '../../lib/LangContext';

const { width: W, height: H } = Dimensions.get('window');

// Oval is a circle wider than screen so gradient peeks at top & bottom.
// Diameter driven by screen width so it scales across device sizes.
const D  = W * 1.58;
const OX = -(D - W) / 2;          // negative: extends equally beyond both sides
const OY = (H - D) / 2;           // centres vertically on screen

function useFade(delay: number) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(22)).current;
  useEffect(() => {
    const id = setTimeout(() => {
      Animated.parallel([
        Animated.timing(op, { toValue: 1, duration: 680, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.timing(ty, { toValue: 0, duration: 680, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]).start();
    }, delay);
    return () => clearTimeout(id);
  }, []);
  return { opacity: op, transform: [{ translateY: ty }] };
}

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const a0 = useFade(100);
  const a1 = useFade(280);
  const a2 = useFade(460);

  return (
    <View style={styles.root}>
      {/* ── Ombre gradient background ── */}
      <LinearGradient
        colors={['#D4607C', '#EFA8BC', '#F8E4EB', '#FAFAFA', '#FAFAFA', '#E0C0F0', '#A870C0']}
        locations={[0, 0.14, 0.30, 0.44, 0.56, 0.82, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── White oval — content lives inside ── */}
      <View style={[styles.oval, { width: D, height: D, borderRadius: D / 2, left: OX, top: OY }]}>
        {/* Inner content is constrained to visible screen width */}
        <View style={styles.inner}>

          <Animated.View style={[styles.logoRow, a0]}>
            <Text style={styles.logoAccent}>Lunara</Text>
            <Text style={styles.logoBold}>Fit</Text>
          </Animated.View>

          <Animated.Text style={[styles.headline, a1]}>
            {t('welcome.tagline')}
          </Animated.Text>

          <Animated.View style={a2}>
            <TouchableOpacity
              style={styles.pill}
              activeOpacity={0.72}
              onPress={() => router.push('/(onboarding)/language' as any)}
            >
              <Text style={styles.pillTxt}>→  {t('welcome.cta').replace(' →', '')}</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },

  oval: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    // Subtle lift so the gradient at edges reads as light not flat
    shadowColor: '#B060A0',
    shadowOpacity: 0.08,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    // Flex: centre content horizontally & vertically inside the full circle
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Width is capped to screen so text never overflows left/right
  inner: {
    width: W - 56,
    alignItems: 'center',
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 44,
  },
  logoAccent: {
    fontFamily: Fonts.sansLight,
    fontSize: 18,
    color: Colors.blush[400],
    letterSpacing: 0.8,
  },
  logoBold: {
    fontFamily: Fonts.sansBold,
    fontSize: 18,
    color: Colors.beige[800],
    letterSpacing: 0.8,
  },

  headline: {
    fontFamily: Fonts.sansBold,
    fontSize: 38,
    color: Colors.beige[800],
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 52,
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
