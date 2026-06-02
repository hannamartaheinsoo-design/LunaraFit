import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  Animated, Easing,
} from 'react-native';
import { useAuthActions } from '@convex-dev/auth/react';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

// ─── Brand SVGs ──────────────────────────────────────────────────────────────

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </Svg>
  );
}

function AppleIcon({ size = 20, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill={color}/>
    </Svg>
  );
}

function MicrosoftIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="1" y="1" width="10.5" height="10.5" fill="#F25022"/>
      <Rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00"/>
      <Rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF"/>
      <Rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/>
    </Svg>
  );
}

function PasskeyIcon({ size = 20, color = '#000' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8" cy="8" r="4.5" stroke={color} strokeWidth="1.8"/>
      <Path d="M14 20h8M18 16v8M3 20.5c0-2.5 2-4.5 5-4.5h2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'choose' | 'email';
type Flow = 'signIn' | 'signUp';

// ─── Component ───────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<Step>('choose');
  const [flow, setFlow] = useState<Flow>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<string | null>(null); // tracks which button

  // Slide animation for the email panel
  const slideAnim = useRef(new Animated.Value(0)).current;
  const openEmail = (f: Flow) => {
    setFlow(f);
    setError('');
    setStep('email');
    Animated.timing(slideAnim, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };
  const closeEmail = () => {
    Animated.timing(slideAnim, { toValue: 0, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => setStep('choose'));
  };

  // ── Email submit ────────────────────────────────────────────────────────────
  async function submitEmail() {
    if (!email.trim() || !password) { setError('Täida mõlemad väljad.'); return; }
    setError('');
    setLoading('email');
    try {
      const fd = new FormData();
      fd.append('email', email.trim());
      fd.append('password', password);
      fd.append('flow', flow);
      await signIn('password', fd);
    } catch (e: any) {
      setError(e?.message ?? 'Midagi läks valesti. Proovi uuesti.');
    } finally {
      setLoading(null);
    }
  }

  // ── OAuth ───────────────────────────────────────────────────────────────────
  async function signInWith(provider: 'google' | 'apple') {
    setLoading(provider);
    try {
      await signIn(provider);
    } catch (e: any) {
      setError(e?.message ?? `${provider} sisselogimine ebaõnnestus.`);
    } finally {
      setLoading(null);
    }
  }

  // ── Passkey ─────────────────────────────────────────────────────────────────
  async function signInWithPasskey() {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      setError('Sinu brauser ei toeta passkey-d.');
      return;
    }
    setLoading('passkey');
    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rpId: window.location.hostname,
          userVerification: 'preferred',
          timeout: 60000,
        },
      } as CredentialRequestOptions);
      if (credential) {
        // Passkey obtained — in production this would verify on the server
        setError('Passkey sisselogimine vajab serveripoolset seadistust.');
      }
    } catch (e: any) {
      if (e?.name !== 'NotAllowedError') {
        setError(e?.message ?? 'Passkey sisselogimine ebaõnnestus.');
      }
    } finally {
      setLoading(null);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Logo ── */}
        <View style={styles.logoWrap}>
          <Text style={styles.logo}><Text style={styles.logoAccent}>Lunara</Text>Fit</Text>
          <Text style={styles.tagline}>Treening kohtub tsükliga.</Text>
        </View>

        {/* ── Social + Passkey buttons ── */}
        <View style={styles.card}>
          {step === 'choose' && (
            <>
              <Text style={styles.sectionLabel}>Jätka rakendusega</Text>

              {/* Google */}
              <SocialButton
                label="Jätka Google'iga"
                icon={<GoogleIcon size={20} />}
                onPress={() => signInWith('google')}
                loading={loading === 'google'}
                style={styles.btnGoogle}
                textStyle={styles.btnGoogleTxt}
              />

              {/* Apple */}
              <SocialButton
                label="Jätka Apple'iga"
                icon={<AppleIcon size={20} color="#fff" />}
                onPress={() => signInWith('apple')}
                loading={loading === 'apple'}
                style={styles.btnApple}
                textStyle={styles.btnAppleTxt}
              />

              {/* Microsoft */}
              <SocialButton
                label="Jätka Microsoftiga"
                icon={<MicrosoftIcon size={20} />}
                onPress={() => setError('Microsoft sisselogimine on peagi saadaval.')}
                loading={loading === 'microsoft'}
                style={styles.btnMicrosoft}
                textStyle={styles.btnMicrosoftTxt}
              />

              {/* Passkey */}
              <SocialButton
                label="Kasuta passkey-d"
                icon={<PasskeyIcon size={20} color={Colors.blush[600]} />}
                onPress={signInWithPasskey}
                loading={loading === 'passkey'}
                style={styles.btnPasskey}
                textStyle={styles.btnPasskeyTxt}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerTxt}>või e-postiga</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email options */}
              <View style={styles.emailRow}>
                <Pressable style={styles.emailBtn} onPress={() => openEmail('signUp')}>
                  <Text style={styles.emailBtnTxt}>Loo konto</Text>
                </Pressable>
                <Pressable style={[styles.emailBtn, styles.emailBtnSecondary]} onPress={() => openEmail('signIn')}>
                  <Text style={[styles.emailBtnTxt, styles.emailBtnSecondaryTxt]}>Logi sisse</Text>
                </Pressable>
              </View>
            </>
          )}

          {/* ── Email panel (slides in) ── */}
          {step === 'email' && (
            <Animated.View style={{ opacity: slideAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
              <Pressable style={styles.backBtn} onPress={closeEmail}>
                <Icon name="arr-l" size={14} color={Colors.beige[400]} />
                <Text style={styles.backTxt}>Tagasi</Text>
              </Pressable>

              <Text style={styles.emailHeading}>
                {flow === 'signUp' ? 'Loo uus konto' : 'Tere tagasi'}
              </Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>E-posti aadress</Text>
                <View style={styles.inputRow}>
                  <Icon name="person" size={16} color={Colors.beige[400]} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="sina@näide.ee"
                    placeholderTextColor={Colors.beige[200]}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Parool</Text>
                <View style={styles.inputRow}>
                  <Icon name="lock" size={16} color={Colors.beige[400]} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.beige[200]}
                    secureTextEntry
                    autoComplete={flow === 'signUp' ? 'new-password' : 'current-password'}
                  />
                </View>
                {flow === 'signUp' && (
                  <Text style={styles.passHint}>Vähemalt 8 tähemärki. Parool salvestatakse passkey-na.</Text>
                )}
              </View>

              {error ? <View style={styles.errorBox}><Text style={styles.errorTxt}>{error}</Text></View> : null}

              <Pressable style={[styles.submitBtn, loading === 'email' && styles.submitBtnLoading]} onPress={submitEmail} disabled={!!loading}>
                {loading === 'email'
                  ? <ActivityIndicator color={Colors.cream} size="small" />
                  : <Text style={styles.submitBtnTxt}>{flow === 'signUp' ? 'Loo konto →' : 'Logi sisse →'}</Text>}
              </Pressable>

              <Pressable onPress={() => { setFlow(f => f === 'signIn' ? 'signUp' : 'signIn'); setError(''); }}>
                <Text style={styles.toggleTxt}>
                  {flow === 'signIn' ? 'Pole kontot? Loo uus →' : 'On juba konto? Logi sisse →'}
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Error (choose step) */}
          {step === 'choose' && error ? (
            <View style={[styles.errorBox, { marginTop: 12 }]}>
              <Text style={styles.errorTxt}>{error}</Text>
            </View>
          ) : null}
        </View>

        {/* Privacy */}
        <Text style={styles.privacy}>
          🔒 Andmed krüpteeritud · Serveris turvaliselt talletatud
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Social Button ────────────────────────────────────────────────────────────

function SocialButton({ label, icon, onPress, loading, style, textStyle }: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  loading: boolean;
  style: object;
  textStyle: object;
}) {
  return (
    <Pressable style={[styles.socialBtn, style]} onPress={onPress} disabled={loading}>
      <View style={styles.socialBtnInner}>
        <View style={styles.socialBtnIcon}>{loading ? <ActivityIndicator size="small" color={Colors.beige[400]} /> : icon}</View>
        <Text style={[styles.socialBtnTxt, textStyle]}>{label}</Text>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xxl, paddingBottom: 48 },

  // Logo
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 48, fontFamily: Fonts.serifSemiBoldItalic, color: Colors.beige[600], lineHeight: 52 },
  logoAccent: { color: Colors.blush[400], fontFamily: Fonts.serifSemiBold },
  tagline: { fontSize: 14, fontFamily: Fonts.sansLight, color: Colors.beige[400], marginTop: 4, letterSpacing: 0.3 },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.beige[100],
    shadowColor: '#C8A882',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 4,
  },
  sectionLabel: {
    fontSize: 11, fontFamily: Fonts.sans, fontWeight: '600',
    letterSpacing: 1, textTransform: 'uppercase', color: Colors.beige[400],
    textAlign: 'center', marginBottom: 16,
  },

  // Social buttons
  socialBtn: {
    borderRadius: Radius.md, marginBottom: 10,
    borderWidth: 1.5,
  },
  socialBtnInner: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16 },
  socialBtnIcon: { width: 24, alignItems: 'center' },
  socialBtnTxt: { flex: 1, textAlign: 'center', fontSize: 15, fontFamily: Fonts.sans, fontWeight: '500', marginRight: 24 },

  btnGoogle: { borderColor: '#DADCE0', backgroundColor: '#fff' },
  btnGoogleTxt: { color: '#3C4043' },

  btnApple: { borderColor: '#000', backgroundColor: '#000' },
  btnAppleTxt: { color: '#fff' },

  btnMicrosoft: { borderColor: Colors.beige[200], backgroundColor: '#fff' },
  btnMicrosoftTxt: { color: Colors.beige[800] },

  btnPasskey: { borderColor: Colors.blush[200], backgroundColor: Colors.blush[50] },
  btnPasskeyTxt: { color: Colors.blush[700] },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.beige[100] },
  dividerTxt: { marginHorizontal: 12, fontSize: 12, fontFamily: Fonts.sansLight, color: Colors.beige[400] },

  // Email CTA
  emailRow: { flexDirection: 'row', gap: 10 },
  emailBtn: { flex: 1, backgroundColor: Colors.blush[400], borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  emailBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.beige[200] },
  emailBtnTxt: { fontSize: 14, fontFamily: Fonts.sans, fontWeight: '600', color: Colors.cream },
  emailBtnSecondaryTxt: { color: Colors.beige[600] },

  // Email panel
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backTxt: { fontSize: 13, fontFamily: Fonts.sans, color: Colors.beige[400] },
  emailHeading: { fontSize: 24, fontFamily: Fonts.serifSemiBold, color: Colors.beige[800], marginBottom: 20 },

  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 10, fontFamily: Fonts.sans, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.beige[600], marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: Colors.beige[200], borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.cream },
  input: { flex: 1, fontSize: 15, fontFamily: Fonts.sans, color: Colors.dark },
  passHint: { fontSize: 11, fontFamily: Fonts.sansLight, color: Colors.beige[400], marginTop: 5 },

  submitBtn: { backgroundColor: Colors.blush[400], borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  submitBtnLoading: { opacity: 0.7 },
  submitBtnTxt: { color: Colors.cream, fontSize: 16, fontFamily: Fonts.sans, fontWeight: '600' },
  toggleTxt: { textAlign: 'center', color: Colors.blush[400], fontFamily: Fonts.sans, fontSize: 13 },

  // Error
  errorBox: { backgroundColor: Colors.error.bg, borderRadius: Radius.sm, padding: 12, marginBottom: 12 },
  errorTxt: { fontSize: 13, fontFamily: Fonts.sans, color: Colors.error.text },

  // Footer
  privacy: { textAlign: 'center', marginTop: 24, fontSize: 11, fontFamily: Fonts.sansLight, color: Colors.beige[400] },
});
