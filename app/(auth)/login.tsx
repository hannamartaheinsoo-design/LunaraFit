import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  Animated, Easing,
} from 'react-native';
import { useAuthActions } from '@convex-dev/auth/react';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { useTranslation } from '../../lib/LangContext';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

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

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function checkEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

interface PwChecks {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  symbol: boolean;
}

function getPasswordChecks(pw: string): PwChecks {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
}

function passwordValid(pw: string): boolean {
  const c = getPasswordChecks(pw);
  return c.length && c.upper && c.lower && c.number && c.symbol;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'choose' | 'email';
type Flow = 'signIn' | 'signUp';

// ─── Component ───────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const { signIn } = useAuthActions();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('choose');
  const [flow, setFlow] = useState<Flow>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  const pwChecks = getPasswordChecks(password);
  const showPwChecks = flow === 'signUp' && password.length > 0;

  // Slide animation for the email panel
  const slideAnim = useRef(new Animated.Value(0)).current;
  const openEmail = (f: Flow) => {
    setFlow(f);
    setError('');
    setEmail('');
    setPassword('');
    setStep('email');
    Animated.timing(slideAnim, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  };
  const closeEmail = () => {
    Animated.timing(slideAnim, { toValue: 0, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: false }).start(() => setStep('choose'));
  };

  // ── Email submit ────────────────────────────────────────────────────────────
  async function submitEmail() {
    if (!email.trim() || !password) {
      setError(t('auth.err.fields'));
      return;
    }
    if (!checkEmail(email)) {
      setError(t('auth.err.email'));
      return;
    }
    if (flow === 'signUp' && !passwordValid(password)) {
      setError(t('auth.err.password'));
      return;
    }
    setError('');
    setLoading('email');
    try {
      const fd = new FormData();
      fd.append('email', email.trim().toLowerCase());
      fd.append('password', password);
      fd.append('flow', flow);
      await signIn('password', fd);
    } catch (e: any) {
      setError(e?.message ?? t('auth.err.generic'));
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
      setError(e?.message ?? `${provider} ${t('auth.err.oauth')}`);
    } finally {
      setLoading(null);
    }
  }

  // ── Passkey ─────────────────────────────────────────────────────────────────
  async function signInWithPasskey() {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      setError(t('auth.passkey.unsupported'));
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
        setError(t('auth.passkey.needs.server'));
      }
    } catch (e: any) {
      if (e?.name !== 'NotAllowedError') {
        setError(e?.message ?? t('auth.passkey.failed'));
      }
    } finally {
      setLoading(null);
    }
  }

  // Show live feedback once the user has typed at least 3 chars (avoids flashing red on first keypress)
  const emailHasInput = email.length >= 3;
  const emailInvalid = emailHasInput && !checkEmail(email);
  const emailValid = emailHasInput && checkEmail(email);

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
          <Text style={styles.tagline}>{t('auth.tagline')}</Text>
        </View>

        {/* ── Card ── */}
        <View style={styles.card}>
          {step === 'choose' && (
            <>
              <Text style={styles.sectionLabel}>{t('auth.continue')}</Text>

              <SocialButton
                label={t('auth.google')}
                icon={<GoogleIcon size={20} />}
                onPress={() => signInWith('google')}
                loading={loading === 'google'}
                style={styles.btnGoogle}
                textStyle={styles.btnGoogleTxt}
              />
              <SocialButton
                label={t('auth.apple')}
                icon={<AppleIcon size={20} color="#fff" />}
                onPress={() => signInWith('apple')}
                loading={loading === 'apple'}
                style={styles.btnApple}
                textStyle={styles.btnAppleTxt}
              />
              <SocialButton
                label={t('auth.microsoft')}
                icon={<MicrosoftIcon size={20} />}
                onPress={() => setError(t('auth.microsoft.soon'))}
                loading={loading === 'microsoft'}
                style={styles.btnMicrosoft}
                textStyle={styles.btnMicrosoftTxt}
              />
              <SocialButton
                label={t('auth.passkey')}
                icon={<PasskeyIcon size={20} color={Colors.blush[600]} />}
                onPress={signInWithPasskey}
                loading={loading === 'passkey'}
                style={styles.btnPasskey}
                textStyle={styles.btnPasskeyTxt}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerTxt}>{t('auth.divider')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.emailRow}>
                <Pressable style={styles.emailBtn} onPress={() => openEmail('signUp')}>
                  <Text style={styles.emailBtnTxt}>{t('auth.create')}</Text>
                </Pressable>
                <Pressable style={[styles.emailBtn, styles.emailBtnSecondary]} onPress={() => openEmail('signIn')}>
                  <Text style={[styles.emailBtnTxt, styles.emailBtnSecondaryTxt]}>{t('auth.signin')}</Text>
                </Pressable>
              </View>
            </>
          )}

          {/* ── Email panel ── */}
          {step === 'email' && (
            <Animated.View style={{ opacity: slideAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
              <Pressable style={styles.backBtn} onPress={closeEmail}>
                <Icon name="arr-l" size={14} color={Colors.beige[400]} />
                <Text style={styles.backTxt}>{t('auth.back')}</Text>
              </Pressable>

              <Text style={styles.emailHeading}>
                {flow === 'signUp' ? t('auth.heading.signup') : t('auth.heading.signin')}
              </Text>

              {/* Email field */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t('auth.email.lbl')}</Text>
                <View style={[styles.inputRow, emailInvalid && styles.inputRowError, emailValid && styles.inputRowValid]}>
                  <Icon name="person" size={16} color={emailInvalid ? Colors.error.text : emailValid ? '#16A34A' : Colors.beige[400]} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={v => { setEmail(v); setError(''); }}
                    placeholder={t('auth.email.ph')}
                    placeholderTextColor={Colors.beige[200]}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                  {emailHasInput && (
                    <Text style={{ fontSize: 14, color: emailValid ? '#22C55E' : Colors.error.text }}>
                      {emailValid ? '✓' : '✕'}
                    </Text>
                  )}
                </View>
                {emailInvalid && (
                  <Text style={styles.inlineError}>{t('auth.err.email')}</Text>
                )}
              </View>

              {/* Password field */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>{t('auth.password.lbl')}</Text>
                <View style={styles.inputRow}>
                  <Icon name="lock" size={16} color={Colors.beige[400]} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={v => { setPassword(v); setError(''); }}
                    placeholder={t('auth.password.ph')}
                    placeholderTextColor={Colors.beige[200]}
                    secureTextEntry={!showPassword}
                    autoComplete={flow === 'signUp' ? 'new-password' : 'current-password'}
                  />
                  <Pressable onPress={() => setShowPassword(s => !s)} hitSlop={8}>
                    <Text style={styles.eyeBtn}>{showPassword ? '🙈' : '👁'}</Text>
                  </Pressable>
                </View>

                {/* Password requirements checklist (signUp only) */}
                {flow === 'signUp' && showPwChecks && (
                  <View style={styles.pwChecks}>
                    <PwRequirement met={pwChecks.length} label={t('auth.pw.req.length')} />
                    <PwRequirement met={pwChecks.upper}  label={t('auth.pw.req.upper')} />
                    <PwRequirement met={pwChecks.lower}  label={t('auth.pw.req.lower')} />
                    <PwRequirement met={pwChecks.number} label={t('auth.pw.req.number')} />
                    <PwRequirement met={pwChecks.symbol} label={t('auth.pw.req.symbol')} />
                  </View>
                )}
                {flow === 'signUp' && !showPwChecks && (
                  <Text style={styles.passHint}>
                    {t('auth.pw.req.length')} · {t('auth.pw.req.upper')} · {t('auth.pw.req.lower')} · {t('auth.pw.req.number')} · {t('auth.pw.req.symbol')}
                  </Text>
                )}
              </View>

              {error ? <View style={styles.errorBox}><Text style={styles.errorTxt}>{error}</Text></View> : null}

              <Pressable
                style={[styles.submitBtn, loading === 'email' && styles.submitBtnLoading]}
                onPress={submitEmail}
                disabled={!!loading}
              >
                {loading === 'email'
                  ? <ActivityIndicator color={Colors.cream} size="small" />
                  : <Text style={styles.submitBtnTxt}>{flow === 'signUp' ? t('auth.submit.signup') : t('auth.submit.signin')}</Text>}
              </Pressable>

              <Pressable onPress={() => { setFlow(f => f === 'signIn' ? 'signUp' : 'signIn'); setError(''); setPassword(''); }}>
                <Text style={styles.toggleTxt}>
                  {flow === 'signIn' ? t('auth.toggle.tosignup') : t('auth.toggle.tologin')}
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Error on choose step */}
          {step === 'choose' && error ? (
            <View style={[styles.errorBox, { marginTop: 12 }]}>
              <Text style={styles.errorTxt}>{error}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.privacy}>{t('auth.privacy')}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Password requirement row ─────────────────────────────────────────────────

function PwRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <View style={pwReqStyles.row}>
      <View style={[pwReqStyles.dot, met && pwReqStyles.dotMet]}>
        {met && <Text style={pwReqStyles.check}>✓</Text>}
      </View>
      <Text style={[pwReqStyles.label, met && pwReqStyles.labelMet]}>{label}</Text>
    </View>
  );
}

const pwReqStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  dot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.beige[200],
    alignItems: 'center', justifyContent: 'center',
  },
  dotMet: { borderColor: '#22C55E', backgroundColor: '#22C55E' },
  check: { fontSize: 9, color: '#fff', fontWeight: '700' },
  label: { fontSize: 12, fontFamily: Fonts.sansLight, color: Colors.beige[400] },
  labelMet: { color: '#16A34A' },
});

// ─── Social Button ────────────────────────────────────────────────────────────

function SocialButton({ label, icon, onPress, loading, style, textStyle }: {
  label: string; icon: React.ReactNode; onPress: () => void;
  loading: boolean; style: object; textStyle: object;
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

  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 48, fontFamily: Fonts.serifSemiBoldItalic, color: Colors.beige[600], lineHeight: 52 },
  logoAccent: { color: Colors.blush[400], fontFamily: Fonts.serifSemiBold },
  tagline: { fontSize: 14, fontFamily: Fonts.sansLight, color: Colors.beige[400], marginTop: 4, letterSpacing: 0.3 },

  card: {
    backgroundColor: '#fff', borderRadius: Radius.xl, padding: 24,
    borderWidth: 1, borderColor: Colors.beige[100],
    shadowColor: '#C8A882', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10, shadowRadius: 24, elevation: 4,
  },
  sectionLabel: {
    fontSize: 11, fontFamily: Fonts.sans, fontWeight: '600',
    letterSpacing: 1, textTransform: 'uppercase', color: Colors.beige[400],
    textAlign: 'center', marginBottom: 16,
  },

  socialBtn: { borderRadius: Radius.md, marginBottom: 10, borderWidth: 1.5 },
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

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.beige[100] },
  dividerTxt: { marginHorizontal: 12, fontSize: 12, fontFamily: Fonts.sansLight, color: Colors.beige[400] },

  emailRow: { flexDirection: 'row', gap: 10 },
  emailBtn: { flex: 1, backgroundColor: Colors.blush[400], borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  emailBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.beige[200] },
  emailBtnTxt: { fontSize: 14, fontFamily: Fonts.sans, fontWeight: '600', color: Colors.cream },
  emailBtnSecondaryTxt: { color: Colors.beige[600] },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backTxt: { fontSize: 13, fontFamily: Fonts.sans, color: Colors.beige[400] },
  emailHeading: { fontSize: 24, fontFamily: Fonts.serifSemiBold, color: Colors.beige[800], marginBottom: 20 },

  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 10, fontFamily: Fonts.sans, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.beige[600], marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: Colors.beige[200], borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.cream },
  inputRowError: { borderColor: Colors.error.text },
  inputRowValid: { borderColor: '#22C55E' },
  input: { flex: 1, fontSize: 15, fontFamily: Fonts.sans, color: Colors.dark },
  eyeBtn: { fontSize: 16, paddingHorizontal: 2 },
  inlineError: { fontSize: 11, fontFamily: Fonts.sansLight, color: Colors.error.text, marginTop: 4 },
  passHint: { fontSize: 11, fontFamily: Fonts.sansLight, color: Colors.beige[300], marginTop: 5, lineHeight: 15 },
  pwChecks: { marginTop: 8, paddingLeft: 2 },

  submitBtn: { backgroundColor: Colors.blush[400], borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  submitBtnLoading: { opacity: 0.7 },
  submitBtnTxt: { color: Colors.cream, fontSize: 16, fontFamily: Fonts.sans, fontWeight: '600' },
  toggleTxt: { textAlign: 'center', color: Colors.blush[400], fontFamily: Fonts.sans, fontSize: 13 },

  errorBox: { backgroundColor: Colors.error.bg, borderRadius: Radius.sm, padding: 12, marginBottom: 12 },
  errorTxt: { fontSize: 13, fontFamily: Fonts.sans, color: Colors.error.text },

  privacy: { textAlign: 'center', marginTop: 24, fontSize: 11, fontFamily: Fonts.sansLight, color: Colors.beige[400] },
});
