import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthActions } from '@convex-dev/auth/react';
import { Colors, Fonts, Radius } from '../../constants/theme';
import { useTranslation } from '../../lib/LangContext';
import { useAuth } from '../../lib/authContext';
import { Icon } from '../../components/ui/Icon';
import Svg, { Path } from 'react-native-svg';

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </Svg>
  );
}

function AppleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#000"/>
    </Svg>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function pwValid(pw: string) {
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}

function StepBar({ step }: { step: number }) {
  return (
    <View style={bar.row}>
      {Array.from({ length: 7 }).map((_, i) => (
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

type Flow = 'signUp' | 'signIn';

export default function SignupScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuthActions();
  const { isReady, isAuthenticated, isOnboarded } = useAuth();

  const [flow, setFlow] = useState<Flow>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  // Only redirect if user actively signed in during this screen mount.
  // For OAuth (Google) the page reloads after redirect, so we persist the flag
  // in sessionStorage so it survives the reload.
  const didSignIn = React.useRef(
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('oauthSignIn') === '1'
  );

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('oauthSignIn');
  }, []);

  // Redirect only after a fresh sign-in on this screen, not when navigating back
  useEffect(() => {
    if (!isReady || !isAuthenticated || !didSignIn.current) return;
    if (isOnboarded) {
      router.replace('/(tabs)/home' as any);
    } else {
      router.replace('/(onboarding)/name' as any);
    }
  }, [isReady, isAuthenticated, isOnboarded]);

  const emailHasInput = email.length >= 3;
  const emailInvalid = emailHasInput && !EMAIL_RE.test(email.trim());
  const emailOk = emailHasInput && EMAIL_RE.test(email.trim());

  async function submit() {
    if (!email.trim() || !password) { setError(t('auth.err.fields')); return; }
    if (!EMAIL_RE.test(email.trim())) { setError(t('auth.err.email')); return; }
    if (flow === 'signUp' && !pwValid(password)) { setError(t('auth.err.password')); return; }
    setError('');
    setLoading('email');
    didSignIn.current = true;
    try {
      const fd = new FormData();
      fd.append('email', email.trim().toLowerCase());
      fd.append('password', password);
      fd.append('flow', flow);
      await signIn('password', fd);
    } catch (e: any) {
      // If sign-up failed because the account already exists (incomplete onboarding),
      // silently retry as sign-in so the user can resume where they left off.
      if (flow === 'signUp') {
        try {
          const fd2 = new FormData();
          fd2.append('email', email.trim().toLowerCase());
          fd2.append('password', password);
          fd2.append('flow', 'signIn');
          await signIn('password', fd2);
          // signIn succeeded — user is resuming an incomplete onboarding session
          return;
        } catch (_) {
          // signIn also failed — wrong password for an existing account
          setError(t('auth.err.emailTaken'));
        }
      } else {
        setError(e?.message ?? t('auth.err.generic'));
      }
      didSignIn.current = false;
    } finally {
      setLoading(null);
    }
  }

  async function signInWith(provider: 'google' | 'apple') {
    setLoading(provider);
    setError('');
    didSignIn.current = true;
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('oauthSignIn', '1');
    try {
      await signIn(provider);
      // useEffect above handles redirect once isAuthenticated settles
    } catch (e: any) {
      setError(e?.message ?? `${provider} ${t('auth.err.oauth')}`);
      setLoading(null);
      didSignIn.current = false;
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('oauthSignIn');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Nav */}
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
      </View>
      <StepBar step={0} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Heading */}
        <Text style={styles.eyebrow}>
          {flow === 'signUp' ? t('auth.eyebrow.signup') : t('auth.eyebrow.signin')}
        </Text>
        <Text style={styles.title}>
          {flow === 'signUp' ? t('auth.heading.signup') : t('auth.heading.signin')}
        </Text>
        <Text style={styles.subtitle}>
          {flow === 'signUp' ? t('auth.subtitle.signup') : t('auth.subtitle.signin')}
        </Text>

        {/* Social */}
        <View style={styles.socialRow}>
          <Pressable
            style={[styles.socialBtn, styles.socialBtnGoogle]}
            onPress={() => signInWith('google')}
            disabled={!!loading}
          >
            {loading === 'google'
              ? <ActivityIndicator size="small" color={Colors.beige[400]} />
              : <><View style={styles.socialIcon}><GoogleIcon /></View><Text style={styles.socialBtnTxt}>{t('auth.google')}</Text></>}
          </Pressable>
          <Pressable
            style={[styles.socialBtn, styles.socialBtnApple]}
            onPress={() => signInWith('apple')}
            disabled={!!loading}
          >
            {loading === 'apple'
              ? <ActivityIndicator size="small" color="#fff" />
              : <><View style={styles.socialIcon}><AppleIcon /></View><Text style={[styles.socialBtnTxt, { color: '#fff' }]}>{t('auth.apple')}</Text></>}
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.divLine} />
          <Text style={styles.divTxt}>{t('auth.divider')}</Text>
          <View style={styles.divLine} />
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('auth.email.lbl')}</Text>
          <View style={[styles.inputRow, emailInvalid && styles.inputRowErr, emailOk && styles.inputRowOk]}>
            <Icon name="person" size={16} color={emailInvalid ? Colors.error.text : emailOk ? '#16A34A' : Colors.beige[400]} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={v => { setEmail(v); setError(''); }}
              placeholder={t('auth.email.ph')}
              placeholderTextColor={Colors.beige[400]}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {emailHasInput && (
              <Text style={{ fontSize: 13, color: emailOk ? '#22C55E' : Colors.error.text }}>
                {emailOk ? '✓' : '✕'}
              </Text>
            )}
          </View>
        </View>

        {/* Password */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>{t('auth.password.lbl')}</Text>
          <View style={styles.inputRow}>
            <Icon name="lock" size={16} color={Colors.beige[600]} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={v => { setPassword(v); setError(''); }}
              placeholder={t('auth.password.ph')}
              placeholderTextColor={Colors.beige[400]}
              secureTextEntry={!showPw}
              autoComplete={flow === 'signUp' ? 'new-password' : 'current-password'}
            />
            <Pressable onPress={() => setShowPw(s => !s)} hitSlop={8}>
              <Icon name="eye" size={18} color={showPw ? Colors.blush[400] : Colors.beige[600]} strokeWidth={1.4} />
            </Pressable>
          </View>
          {flow === 'signUp' && (
            <Text style={styles.pwHint}>
              {t('auth.pw.req.length')} · {t('auth.pw.req.upper')} · {t('auth.pw.req.lower')} · {t('auth.pw.req.number')} · {t('auth.pw.req.symbol')}
            </Text>
          )}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTxt}>{error}</Text>
          </View>
        ) : null}

        {/* Toggle */}
        <Pressable
          style={styles.toggleBtn}
          onPress={() => { setFlow(f => f === 'signIn' ? 'signUp' : 'signIn'); setError(''); setPassword(''); }}
        >
          <Text style={styles.toggleTxt}>
            {flow === 'signIn' ? t('auth.toggle.tosignup') : t('auth.toggle.tologin')}
          </Text>
        </Pressable>
      </ScrollView>

      {/* CTA */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.ctaBtn, !!loading && styles.ctaBtnLoading]}
          onPress={submit}
          disabled={!!loading}
        >
          {loading === 'email'
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.ctaBtnTxt}>
                {flow === 'signUp' ? t('auth.submit.signup') : t('auth.submit.signin')}
              </Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sky[50] },
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: Colors.beige[600], lineHeight: 28, marginTop: -2 },

  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 },

  eyebrow: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 2,
    textTransform: 'uppercase', color: Colors.blush[400], marginBottom: 10,
  },
  title: {
    fontFamily: Fonts.sansBold, fontSize: 32,
    color: Colors.beige[800], lineHeight: 38, letterSpacing: -0.5, marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.sansLight, fontSize: 15,
    color: Colors.beige[600], lineHeight: 22, marginBottom: 28,
  },

  socialRow: { flexDirection: 'column', gap: 10, marginBottom: 20 },
  socialBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderRadius: Radius.md, borderWidth: 1.5,
    position: 'relative',
  },
  socialIcon: { position: 'absolute', left: 16 },
  socialBtnGoogle: { borderColor: '#DADCE0', backgroundColor: '#fff' },
  socialBtnApple: { borderColor: '#000', backgroundColor: '#000' },
  socialBtnTxt: { fontSize: 12, fontFamily: Fonts.sansMedium, color: Colors.beige[800], textAlign: 'center' },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.beige[100] },
  divTxt: { marginHorizontal: 12, fontSize: 12, fontFamily: Fonts.sansLight, color: Colors.beige[600] },

  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 10, fontFamily: Fonts.sansBold, letterSpacing: 0.8,
    textTransform: 'uppercase', color: Colors.beige[600], marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: Colors.beige[200], borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#fff',
  },
  inputRowErr: { borderColor: Colors.error.text },
  inputRowOk: { borderColor: '#22C55E' },
  input: { flex: 1, fontSize: 15, fontFamily: Fonts.sans, color: Colors.beige[800] },
  pwHint: {
    fontSize: 11, fontFamily: Fonts.sansLight,
    color: Colors.beige[400], marginTop: 5, lineHeight: 16,
  },

  errorBox: { backgroundColor: Colors.error.bg, borderRadius: Radius.sm, padding: 12, marginBottom: 12 },
  errorTxt: { fontSize: 13, fontFamily: Fonts.sans, color: Colors.error.text },

  toggleBtn: { marginTop: 8, alignSelf: 'center' },
  toggleTxt: { fontSize: 13, fontFamily: Fonts.sans, color: Colors.blush[400] },

  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 44 },
  ctaBtn: {
    height: 58, borderRadius: 999, backgroundColor: Colors.blush[400],
    alignItems: 'center', justifyContent: 'center',
  },
  ctaBtnLoading: { opacity: 0.7 },
  ctaBtnTxt: { fontFamily: Fonts.sansBold, fontSize: 16, color: '#fff', letterSpacing: 0.2 },
});
