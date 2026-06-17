import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, {
  Path, Defs, LinearGradient as SvgGradient, Stop,
  Circle, G,
} from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { useTheme, ThemeTokens } from '../../lib/useTheme';
import { Icon } from '../../components/ui/Icon';
import { getCycleInfo } from '../../lib/cycle';
import { useTranslation } from '../../lib/LangContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

type PhaseKey = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

const PHASE_COLORS: Record<PhaseKey, { ring: string; glow: string; label: string }> = {
  menstruation: { ring: '#7A9AB0', glow: '#B0C4D4', label: Colors.sky[600] },
  follicular:   { ring: '#7A9AB0', glow: '#B0C4D4', label: Colors.sky[600] },
  ovulation:    { ring: '#7A9AB0', glow: '#B0C4D4', label: Colors.sky[600] },
  luteal:       { ring: '#7A9AB0', glow: '#B0C4D4', label: Colors.sky[600] },
};

const DEFAULT_PHASE = { ring: '#7A9AB0', glow: '#B0C4D4', label: Colors.sky[600] };

const PHASE_ENERGY: Record<PhaseKey, number> = {
  menstruation: 0.25,
  follicular: 0.65,
  ovulation: 1.0,
  luteal: 0.45,
};

// ─── CycleRing ────────────────────────────────────────────────────────────────

function CycleRing({
  day, total, phase, daysLeft, size = 200, T,
}: {
  day: number; total: number; phase: string; daysLeft: number | null; size?: number; T: ThemeTokens;
}) {
  const { t } = useTranslation();
  const styles = makeRingStyles(T);
  const strokeW = 10;
  const r = (size - strokeW * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(day / total, 1);
  const strokeDash = circumference * progress;
  const strokeGap = circumference - strokeDash;

  const phaseKey = (Object.keys(PHASE_COLORS) as PhaseKey[]).find((k) =>
    phase?.toLowerCase().includes(k.slice(0, 4))
  );
  const col = phaseKey ? PHASE_COLORS[phaseKey] : DEFAULT_PHASE;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[StyleSheet.absoluteFill, {
        borderRadius: size / 2,
        backgroundColor: col.glow,
        opacity: 0.18,
        margin: 20,
      }]} />

      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={col.glow} />
            <Stop offset="100%" stopColor={col.ring} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={T.border}
          strokeWidth={strokeW}
          fill="none"
        />
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          <Circle
            cx={cx} cy={cy} r={r}
            stroke="url(#ringGrad)"
            strokeWidth={strokeW}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${strokeDash} ${strokeGap}`}
          />
        </G>
      </Svg>

      <View style={{ alignItems: 'center' }}>
        <Text style={[styles.dayNum, { color: col.ring }]}>
          {day}
          <Text style={styles.dayTotal}>/{total}</Text>
        </Text>
        <Text style={styles.dayLabel}>{t('home.cycleday')}</Text>
        {daysLeft !== null && (
          <Text style={[styles.daysLeft, { color: col.label }]}>
            {daysLeft} {t('home.daysleft')}
          </Text>
        )}
      </View>
    </View>
  );
}

function makeRingStyles(T: ThemeTokens) {
  return StyleSheet.create({
    dayNum: { fontFamily: Fonts.sansBold, fontSize: 44, letterSpacing: -1.5, lineHeight: 50 },
    dayTotal: { fontFamily: Fonts.sansLight, fontSize: 22, color: T.textMuted, letterSpacing: -0.5 },
    dayLabel: { fontFamily: Fonts.sansLight, fontSize: 11, color: T.textMuted, marginTop: 1 },
    daysLeft: { fontFamily: Fonts.sansSemiBold, fontSize: 12, marginTop: 4 },
  });
}

// ─── EnergyBar ────────────────────────────────────────────────────────────────

function EnergyBar({ level, color, T }: { level: number; color: string; T: ThemeTokens }) {
  const filled = Math.round(level * 5);
  return (
    <View style={{ flexDirection: 'row', gap: 5, marginTop: 4 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1, height: 5, borderRadius: 3,
            backgroundColor: i < filled ? color : T.border,
          }}
        />
      ))}
    </View>
  );
}

// ─── TodayCard ────────────────────────────────────────────────────────────────

function TodayCard({ phaseKey, T }: { phaseKey: PhaseKey | null; T: ThemeTokens }) {
  const { t, tArr, lang } = useTranslation();
  const styles = makeTcStyles(T);
  const col = phaseKey ? PHASE_COLORS[phaseKey] : DEFAULT_PHASE;
  const energyLevel = phaseKey ? PHASE_ENERGY[phaseKey] : 0;

  const trainKey = phaseKey ? `home.today.train.${phaseKey}` as any : null;
  const tipsKey  = phaseKey ? `home.today.tips.${phaseKey}` as any  : null;
  const trainLabel = trainKey ? t(trainKey) : null;
  const tips: string[] = tipsKey ? tArr(tipsKey) : [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t('home.today.lbl' as any)}</Text>
        {phaseKey && (
          <View style={[styles.pill, { backgroundColor: col.glow + '33', borderColor: col.glow }]}>
            <Text style={[styles.pillTxt, { color: col.ring }]}>{trainLabel}</Text>
          </View>
        )}
      </View>

      {!phaseKey ? (
        <Text style={styles.empty}>{t('home.today.nophase' as any)}</Text>
      ) : (
        <>
          <View style={styles.energyRow}>
            <Text style={styles.energyLbl}>
              {lang === 'en' ? 'Energy' : 'Energia'}
            </Text>
            <EnergyBar level={energyLevel} color={col.ring} T={T} />
          </View>
          <View style={styles.tipList}>
            {tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: col.ring }]} />
                <Text style={styles.tipTxt}>{tip}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/insights')} style={styles.cta}>
            <Text style={[styles.ctaTxt, { color: col.ring }]}>{t('home.today.cta' as any)}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function makeTcStyles(T: ThemeTokens) {
  return StyleSheet.create({
    card: { marginHorizontal: 24, borderRadius: 24, padding: 20, marginBottom: 12, backgroundColor: T.surface2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    eyebrow: { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: T.textMuted },
    pill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
    pillTxt: { fontFamily: Fonts.sansBold, fontSize: 11, letterSpacing: 0.2 },
    empty: { fontFamily: Fonts.sansLight, fontSize: 13, paddingVertical: 12, color: T.textMuted },
    energyRow: { marginBottom: 14 },
    energyLbl: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 6, color: T.textSec },
    tipList: { gap: 9 },
    tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    tipDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
    tipTxt: { fontFamily: Fonts.sansMedium, fontSize: 13, lineHeight: 18, flex: 1, color: T.textSec },
    cta: { marginTop: 14 },
    ctaTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 13 },
  });
}

// ─── WeekDots ─────────────────────────────────────────────────────────────────

function WeekDots({ workouts, weekdays, T }: { workouts: any[]; weekdays: string[]; T: ThemeTokens }) {
  const styles = makeWdStyles(T);
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    const ds = d.toISOString().slice(0, 10);
    const label = weekdays[(d.getDay() + 6) % 7];
    const done = workouts.some((w) => w.date === ds);
    const isToday = i === 6;
    return { label, done, isToday };
  });

  return (
    <View style={styles.row}>
      {days.map((d, i) => (
        <View key={i} style={styles.col}>
          <Text style={styles.label}>{d.label}</Text>
          <View style={[
            styles.dot,
            d.done && styles.dotDone,
            d.isToday && !d.done && styles.dotToday,
          ]}>
            {d.done && (
              <Svg width={10} height={10} viewBox="0 0 10 10">
                <Path d="M2 5.5 L4 7.5 L8 3" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function makeWdStyles(T: ThemeTokens) {
  return StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 28, marginBottom: 20 },
    col: { alignItems: 'center', gap: 6 },
    label: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 0.8, color: T.textMuted, textTransform: 'uppercase' },
    dot: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: T.surface2, borderWidth: 1.5, borderColor: T.border,
      alignItems: 'center', justifyContent: 'center',
    },
    dotDone: { backgroundColor: Colors.blush[400], borderColor: Colors.blush[400] },
    dotToday: { borderColor: Colors.blush[400], borderWidth: 2 },
  });
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

function phaseDiff(workouts: any[]): number | null {
  const avg = (ws: any[]) => {
    let total = 0, count = 0;
    ws.forEach((w) => w.exercises.forEach((e: any) => { if (e.weight_kg > 0) { total += e.weight_kg; count++; } }));
    return count ? total / count : 0;
  };
  const f = workouts.filter((w) => w.phase === 'follicular');
  const l = workouts.filter((w) => w.phase === 'luteal');
  if (!f.length || !l.length) return null;
  const fa = avg(f), la = avg(l);
  return la ? ((fa - la) / la) * 100 : null;
}

function makeStyles(T: ThemeTokens) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: T.bg },

    topBar: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 24, paddingVertical: 12,
    },
    logo: { fontFamily: Fonts.sansBold, fontSize: 18, letterSpacing: -0.3, color: T.textSec },
    logoAccent: { color: Colors.blush[400] },
    avatar: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: Colors.blush[100], borderWidth: 1.5, borderColor: Colors.blush[200],
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { fontFamily: Fonts.sansBold, fontSize: 15, color: Colors.blush[600] },

    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 130 },

    greeting: { paddingHorizontal: 24, paddingBottom: 12, paddingTop: 2 },
    dateLabel: {
      fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.6,
      textTransform: 'uppercase', color: T.textMuted, marginBottom: 5,
    },
    greetLine: { fontFamily: Fonts.sansBold, fontSize: 28, color: T.text, lineHeight: 34, letterSpacing: -0.4 },
    greetName: { color: Colors.blush[400] },

    heroSection: { alignItems: 'center', paddingTop: 4, paddingBottom: 6 },
    phaseLabel: { alignItems: 'center', marginTop: 14, marginBottom: 8 },
    phaseEyebrow: {
      fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1.8,
      textTransform: 'uppercase', color: T.textMuted, marginBottom: 4,
    },
    phaseName: { fontFamily: Fonts.sansBold, fontSize: 20, letterSpacing: -0.4, lineHeight: 24, marginBottom: 5 },
    phaseDesc: { fontFamily: Fonts.sansLight, fontSize: 12.5, color: T.textMuted, lineHeight: 18, textAlign: 'center', paddingHorizontal: 40 },

    statRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, marginBottom: 16 },
    statTile: { flex: 1, borderRadius: 20, padding: 14, backgroundColor: T.surface2 },
    statTilePink: { flex: 1, borderRadius: 20, padding: 14, backgroundColor: Colors.blush[50] },
    statVal: { fontFamily: Fonts.sansBold, fontSize: 26, lineHeight: 30, letterSpacing: -0.5, marginTop: 8, marginBottom: 2, color: T.text },
    statLbl: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1.1, textTransform: 'uppercase', color: T.textMuted },
    statSub: { fontFamily: Fonts.sansLight, fontSize: 10, marginTop: 1, color: T.textSec },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 8, marginBottom: 16 },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999,
    },
    chipPrimary: { backgroundColor: T.text },
    chipTxtLight: { fontFamily: Fonts.sansBold, fontSize: 12, color: T.bg, letterSpacing: 0.1 },
    chipTxt: { fontFamily: Fonts.sansBold, fontSize: 12, letterSpacing: 0.1 },

    card: { marginHorizontal: 24, borderRadius: 24, padding: 20, marginBottom: 12, backgroundColor: T.surface2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    cardLabel: { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 2, color: Colors.blush[400] },

    insightBig: { fontFamily: Fonts.sansBold, fontSize: 38, letterSpacing: -0.5, lineHeight: 42, marginBottom: 5 },
    insightDesc: { fontFamily: Fonts.sansLight, fontSize: 13, lineHeight: 20, color: T.textSec },
    insightLink: { marginTop: 10 },
    insightLinkTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.blush[400] },
  });
}

export default function HomeScreen() {
  const T = useTheme();
  const styles = makeStyles(T);
  const { lang, t, tArr } = useTranslation();
  const profile = useQuery(api.profiles.get);
  const workouts = useQuery(api.workouts.list) ?? [];
  const now = new Date();

  const ci = getCycleInfo(
    profile?.last_period_date ?? null,
    profile?.cycle_length ?? 28,
    profile?.period_length ?? 5,
  );

  const d7 = new Date(now.getTime() - 7 * 86400000);
  const recentCount = workouts.filter((w) => new Date(w.date) >= d7).length;

  const workoutDates = new Set(workouts.map((w: any) => w.date));
  let streak = 0;
  for (let i = 0; ; i++) {
    const ds = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
    if (workoutDates.has(ds)) streak++; else break;
  }

  const pd = phaseDiff(workouts);
  const DAYS     = tArr('home.days');
  const MONTHS   = tArr('home.months');
  const WEEKDAYS = tArr('home.weekdays');

  const cycleDay = ci?.day ?? 1;
  const cycleLen = ci?.cycleLength ?? 28;
  const daysLeft = ci ? ci.daysLeft : null;
  const phaseName = ci?.phase ?? '';

  const phaseKey = (Object.keys(PHASE_COLORS) as PhaseKey[]).find((k) =>
    phaseName.toLowerCase().includes(k.slice(0, 4))
  );
  const col = phaseKey ? PHASE_COLORS[phaseKey] : DEFAULT_PHASE;

  const daysUntilPeriod = ci ? cycleLen - cycleDay + 1 : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}><Text style={styles.logoAccent}>Lunara</Text>Fit</Text>
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
          <Text style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.dateLabel}>
            {DAYS[now.getDay()]}, {now.getDate()}. {MONTHS[now.getMonth()]}
          </Text>
          <Text style={styles.greetLine}>
            {t('home.greet')}{' '}
            <Text style={styles.greetName}>{profile?.name || t('home.noname')}.</Text>
          </Text>
        </View>

        {/* Hero — cycle ring + phase name */}
        <View style={styles.heroSection}>
          <CycleRing day={cycleDay} total={cycleLen} phase={phaseName} daysLeft={daysLeft} size={190} T={T} />
          <View style={styles.phaseLabel}>
            <Text style={styles.phaseEyebrow}>{t('home.phase.eye').toUpperCase()}</Text>
            <Text style={[styles.phaseName, { color: col.ring }]}>{phaseName || '—'}</Text>
            {ci && <Text style={styles.phaseDesc}>{ci.description}</Text>}
          </View>
        </View>

        {/* Week dots */}
        <WeekDots workouts={workouts} weekdays={WEEKDAYS} T={T} />

        {/* Stat tiles */}
        <View style={styles.statRow}>
          <View style={styles.statTile}>
            <Icon name="barbell" size={14} color={T.textMuted} strokeWidth={1.5} />
            <Text style={styles.statVal}>{recentCount}</Text>
            <Text style={styles.statLbl}>{t('home.stat.workouts')}</Text>
            <Text style={styles.statSub}>{t('home.stat.workouts.sub')}</Text>
          </View>
          <TouchableOpacity
            style={styles.statTilePink}
            onPress={() => router.push('/(tabs)/cycle')} activeOpacity={0.8}
          >
            <Icon name="moon" size={14} color={Colors.blush[400]} strokeWidth={1.5} />
            <Text style={[styles.statLbl, { color: Colors.blush[400] }]}>{t('home.stat.period')}</Text>
            <Text style={[styles.statVal, { color: Colors.blush[600] }]}>{daysUntilPeriod ?? '—'}</Text>
            <Text style={[styles.statSub, { color: Colors.blush[400] }]}>
              {daysUntilPeriod != null ? t('home.stat.period.sub') : t('home.stat.period.none')}
            </Text>
          </TouchableOpacity>
          <View style={styles.statTile}>
            <Icon name="spark" size={14} color={streak > 0 ? Colors.coral[400] : T.textMuted} strokeWidth={1.5} />
            <Text style={[styles.statVal, { color: streak > 0 ? Colors.coral[600] : T.text }]}>{streak > 0 ? streak : '—'}</Text>
            <Text style={styles.statLbl}>{t('home.stat.streak')}</Text>
            <Text style={styles.statSub}>{t('home.stat.streak.sub')}</Text>
          </View>
        </View>

        {/* Quick-action chips — plain flex row, no nested ScrollView (avoids blocking vertical scroll on native) */}
        <View style={styles.chipRow}>
          <TouchableOpacity style={[styles.chip, styles.chipPrimary]} onPress={() => router.push('/(tabs)/workouts')} activeOpacity={0.85}>
            <Icon name="barbell" size={12} color={T.bg} strokeWidth={1.5} />
            <Text style={styles.chipTxtLight}>{t('home.quick.workout')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: Colors.blush[100] }]} onPress={() => router.push('/(tabs)/cycle')} activeOpacity={0.85}>
            <Icon name="moon" size={12} color={Colors.blush[600]} strokeWidth={1.5} />
            <Text style={[styles.chipTxt, { color: Colors.blush[800] }]}>{t('home.quick.cycle')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: Colors.sky[50] }]} onPress={() => router.push('/(tabs)/insights')} activeOpacity={0.85}>
            <Icon name="spark" size={12} color={Colors.sky[600]} strokeWidth={1.5} />
            <Text style={[styles.chipTxt, { color: Colors.sky[600] }]}>{t('home.quick.insights')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chip, { backgroundColor: Colors.coral[50] }]} onPress={() => router.push('/(tabs)/workouts')} activeOpacity={0.85}>
            <Icon name="barbell" size={12} color={Colors.coral[600]} strokeWidth={1.5} />
            <Text style={[styles.chipTxt, { color: Colors.coral[600] }]}>{lang === 'en' ? 'Progress' : 'Areng'}</Text>
          </TouchableOpacity>
        </View>

        {/* Today's readiness card */}
        <TodayCard phaseKey={phaseKey ?? null} T={T} />

        {/* Phase insight */}
        {pd !== null && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>{t('ins.patterns')}</Text>
            </View>
            <Text style={[styles.insightBig, { color: Colors.sky[600] }]}>
              {pd >= 0 ? '+' : ''}{pd.toFixed(1)}%
            </Text>
            <Text style={styles.insightDesc}>
              {lang === 'en' ? 'avg weight in follicular vs luteal phase' : 'follikulaar vs luteaalfaas, keskmine raskus'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/insights')} style={styles.insightLink}>
              <Text style={styles.insightLinkTxt}>
                {lang === 'en' ? 'Full analysis →' : 'Täielik analüüs →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
