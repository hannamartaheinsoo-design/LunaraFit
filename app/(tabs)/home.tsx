import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path, Defs, LinearGradient as SvgGradient, Stop,
  Circle, Line, Text as SvgText, G,
} from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Fonts } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';
import { Icon } from '../../components/ui/Icon';
import { getCycleInfo } from '../../lib/cycle';
import { useTranslation } from '../../lib/LangContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

type PhaseKey = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

const PHASE_COLORS: Record<PhaseKey, { ring: string; glow: string; label: string }> = {
  menstruation: { ring: '#D9898B', glow: '#EDBABB', label: Colors.blush[600] },
  follicular:   { ring: '#7A9AB0', glow: '#B0C4D4', label: Colors.sky[600] },
  ovulation:    { ring: '#EE9F80', glow: '#F9C4A0', label: Colors.coral[600] },
  luteal:       { ring: '#A06870', glow: '#E4B8BC', label: Colors.berry[600] },
};

const DEFAULT_PHASE = { ring: '#D9898B', glow: '#EDBABB', label: Colors.blush[600] };

function CycleRing({
  day, total, phase, daysLeft, size = 200,
}: {
  day: number; total: number; phase: string; daysLeft: number | null; size?: number;
}) {
  const { t } = useTranslation();
  const strokeW = 10;
  const r = (size - strokeW * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(day / total, 1);
  const strokeDash = circumference * progress;
  const strokeGap = circumference - strokeDash;
  const rotation = -90;

  const phaseKey = (Object.keys(PHASE_COLORS) as PhaseKey[]).find((k) =>
    phase?.toLowerCase().includes(k.replace('menstruation', 'mens').replace('follicular', 'follic'))
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
          stroke={Colors.beige[100]}
          strokeWidth={strokeW}
          fill="none"
        />
        <G rotation={rotation} origin={`${cx}, ${cy}`}>
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
        <Text style={[ringStyles.dayNum, { color: col.ring }]}>
          {day}
          <Text style={ringStyles.dayTotal}>/{total}</Text>
        </Text>
        <Text style={ringStyles.dayLabel}>{t('home.cycleday')}</Text>
        {daysLeft !== null && (
          <Text style={[ringStyles.daysLeft, { color: col.label }]}>
            {daysLeft} {t('home.daysleft')}
          </Text>
        )}
      </View>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  dayNum: { fontFamily: Fonts.sansBold, fontSize: 44, letterSpacing: -1.5, lineHeight: 50 },
  dayTotal: { fontFamily: Fonts.sansLight, fontSize: 22, color: Colors.beige[400], letterSpacing: -0.5 },
  dayLabel: { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 1 },
  daysLeft: { fontFamily: Fonts.sansSemiBold, fontSize: 12, marginTop: 4 },
});

function AreaChart({ data, width, height, color1, color2 }: {
  data: { value: number; label: string }[];
  width: number; height: number; color1: string; color2: string;
}) {
  const pad = { left: 8, right: 8, top: 14, bottom: 28 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;
  const n = data.length;
  const max = Math.max(...data.map((d) => d.value), 1);
  const px = (i: number) => pad.left + (i / (n - 1)) * W;
  const py = (v: number) => pad.top + H - (v / max) * H;
  const points = data.map((d, i) => ({ x: px(i), y: py(d.value) }));
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = (points[i - 1].x + points[i].x) / 2;
    linePath += ` C ${cp1x} ${points[i - 1].y}, ${cp1x} ${points[i].y}, ${points[i].x} ${points[i].y}`;
  }
  const areaPath = `${linePath} L ${points[n - 1].x} ${pad.top + H} L ${points[0].x} ${pad.top + H} Z`;
  const peakIdx = data.reduce((bi, d, i) => d.value > data[bi].value ? i : bi, 0);
  const hasPeak = data[peakIdx].value > 0;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color1} stopOpacity={0.5} />
          <Stop offset="100%" stopColor={color2} stopOpacity={0.02} />
        </SvgGradient>
        <SvgGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor={color1} stopOpacity={0.8} />
          <Stop offset="100%" stopColor={color2} stopOpacity={1} />
        </SvgGradient>
      </Defs>
      {[0.25, 0.5, 0.75].map((f, i) => (
        <Line key={i} x1={pad.left} y1={pad.top + H * (1 - f)} x2={pad.left + W} y2={pad.top + H * (1 - f)}
          stroke={Colors.beige[100]} strokeWidth={1} />
      ))}
      <Path d={areaPath} fill="url(#areaFill)" />
      <Path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => data[i].value > 0 ? (
        <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#fff" stroke={color1} strokeWidth={2} />
      ) : null)}
      {hasPeak && (
        <>
          <Line x1={points[peakIdx].x} y1={points[peakIdx].y + 6} x2={points[peakIdx].x} y2={pad.top + H}
            stroke={Colors.beige[200]} strokeWidth={1} strokeDasharray="3,3" />
          <Circle cx={points[peakIdx].x} cy={points[peakIdx].y} r={5} fill={color1} />
          <Circle cx={points[peakIdx].x} cy={points[peakIdx].y} r={8} fill={color1} fillOpacity={0.2} />
          <SvgText x={points[peakIdx].x} y={points[peakIdx].y - 12} textAnchor="middle"
            fontSize={10} fontFamily={Fonts.sansBold} fill={color1}>
            {data[peakIdx].value}
          </SvgText>
        </>
      )}
      {data.map((d, i) => (
        <SvgText key={i} x={px(i)} y={height - 4} textAnchor="middle"
          fontSize={9} fontFamily={Fonts.sansBold} fill={Colors.beige[400]} letterSpacing={0.4}>
          {d.label}
        </SvgText>
      ))}
    </Svg>
  );
}

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

const SCREEN_W = Dimensions.get('window').width;

function WeekDots({ workouts, weekdays }: { workouts: any[]; weekdays: string[] }) {
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
    <View style={wdStyles.row}>
      {days.map((d, i) => (
        <View key={i} style={wdStyles.col}>
          <Text style={wdStyles.label}>{d.label}</Text>
          <View style={[
            wdStyles.dot,
            d.done && wdStyles.dotDone,
            d.isToday && !d.done && wdStyles.dotToday,
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

const wdStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 28, marginBottom: 20 },
  col: { alignItems: 'center', gap: 6 },
  label: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 0.8, color: Colors.beige[400], textTransform: 'uppercase' },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.beige[50], borderWidth: 1.5, borderColor: Colors.beige[100],
    alignItems: 'center', justifyContent: 'center',
  },
  dotDone: { backgroundColor: Colors.blush[400], borderColor: Colors.blush[400] },
  dotToday: { borderColor: Colors.blush[300], borderWidth: 2 },
});

export default function HomeScreen() {
  const T = useTheme();
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

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    const ds = d.toISOString().slice(0, 10);
    const sets = workouts
      .filter((w) => w.date === ds)
      .reduce((sum: number, w: any) => sum + w.exercises.reduce((s: number, e: any) => s + (e.sets || 0), 0), 0);
    return { value: sets, label: WEEKDAYS[(d.getDay() + 6) % 7] };
  });
  const totalSets7d = chartData.reduce((s, d) => s + d.value, 0);

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
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>

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
          <CycleRing day={cycleDay} total={cycleLen} phase={phaseName} daysLeft={daysLeft} size={190} />
          <View style={styles.phaseLabel}>
            <Text style={styles.phaseEyebrow}>{t('home.phase.eye').toUpperCase()}</Text>
            <Text style={[styles.phaseName, { color: col.ring }]}>{phaseName || '—'}</Text>
            {ci && <Text style={styles.phaseDesc}>{ci.description}</Text>}
          </View>
        </View>

        {/* Week dots */}
        <WeekDots workouts={workouts} weekdays={WEEKDAYS} />

        {/* Stat tiles */}
        <View style={styles.statRow}>
          <View style={[styles.statTile, { backgroundColor: T.surface2 }]}>
            <Icon name="barbell" size={14} color={Colors.beige[400]} strokeWidth={1.5} />
            <Text style={[styles.statVal, { color: T.text }]}>{recentCount}</Text>
            <Text style={[styles.statLbl, { color: T.textMuted }]}>{t('home.stat.workouts')}</Text>
            <Text style={[styles.statSub, { color: T.textSec }]}>{t('home.stat.workouts.sub')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.statTile, { backgroundColor: Colors.blush[50] }]}
            onPress={() => router.push('/(tabs)/cycle')} activeOpacity={0.8}
          >
            <Icon name="moon" size={14} color={Colors.blush[400]} strokeWidth={1.5} />
            <Text style={[styles.statVal, { color: Colors.blush[600] }]}>{daysUntilPeriod ?? '—'}</Text>
            <Text style={[styles.statLbl, { color: Colors.blush[400] }]}>{t('home.stat.period')}</Text>
            <Text style={[styles.statSub, { color: Colors.blush[400] }]}>
              {daysUntilPeriod != null ? t('home.stat.period.sub') : t('home.stat.period.none')}
            </Text>
          </TouchableOpacity>
          <View style={[styles.statTile, { backgroundColor: T.surface2 }]}>
            <Icon name="spark" size={14} color={streak > 0 ? Colors.coral[400] : Colors.beige[400]} strokeWidth={1.5} />
            <Text style={[styles.statVal, { color: streak > 0 ? Colors.coral[600] : T.text }]}>{streak > 0 ? streak : '—'}</Text>
            <Text style={[styles.statLbl, { color: T.textMuted }]}>{t('home.stat.streak')}</Text>
            <Text style={[styles.statSub, { color: T.textSec }]}>{t('home.stat.streak.sub')}</Text>
          </View>
        </View>

        {/* Quick actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <TouchableOpacity style={[styles.chip, styles.chipPrimary]} onPress={() => router.push('/(tabs)/workouts')} activeOpacity={0.85}>
            <Icon name="barbell" size={12} color="#fff" strokeWidth={1.5} />
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
          <TouchableOpacity style={[styles.chip, { backgroundColor: Colors.coral[50] }]} onPress={() => router.push('/(tabs)/progress')} activeOpacity={0.85}>
            <Icon name="chart" size={12} color={Colors.coral[600]} strokeWidth={1.5} />
            <Text style={[styles.chipTxt, { color: Colors.coral[600] }]}>{t('home.quick.progress') ?? 'Progress'}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Activity chart card */}
        <View style={[styles.card, { backgroundColor: T.surface2 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardLabel, { color: T.textMuted }]}>{t('home.chart.lbl')}</Text>
              <Text style={[styles.cardCount, { color: T.text }]}>{totalSets7d}</Text>
            </View>
            <Text style={[styles.cardSub2, { color: T.textSec }]}>{t('home.chart.sub')}</Text>
          </View>
          {workouts.length > 0 ? (
            <AreaChart data={chartData} width={SCREEN_W - 48 - 40} height={130}
              color1={Colors.blush[400]} color2={Colors.berry[400]} />
          ) : (
            <View style={styles.emptyChart}>
              <Text style={[styles.emptyTxt, { color: T.textMuted }]}>{t('home.chart.empty')}</Text>
            </View>
          )}
        </View>

        {/* Phase insight */}
        {pd !== null && (
          <View style={[styles.card, { backgroundColor: T.surface2 }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: Colors.blush[400] }]}>{t('ins.patterns')}</Text>
            </View>
            <Text style={[styles.insightBig, { color: pd >= 0 ? Colors.sky[600] : Colors.blush[400] }]}>
              {pd >= 0 ? '+' : ''}{pd.toFixed(1)}%
            </Text>
            <Text style={[styles.insightDesc, { color: T.textSec }]}>
              {lang === 'en' ? 'avg weight in follicular vs luteal phase' : 'follikulaar vs luteaalfaas, keskmine raskus'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/insights')} style={styles.insightLink}>
              <Text style={[styles.insightLinkTxt, { color: Colors.blush[400] }]}>
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

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 12,
  },
  logo: { fontFamily: Fonts.sansBold, fontSize: 18, letterSpacing: -0.3, color: Colors.beige[600] },
  logoAccent: { color: Colors.blush[400] },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.blush[100], borderWidth: 1.5, borderColor: Colors.blush[200],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.sansBold, fontSize: 15, color: Colors.blush[600] },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  greeting: { paddingHorizontal: 24, paddingBottom: 12, paddingTop: 2 },
  dateLabel: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.6,
    textTransform: 'uppercase', color: Colors.beige[400], marginBottom: 5,
  },
  greetLine: { fontFamily: Fonts.sansBold, fontSize: 28, color: Colors.beige[800], lineHeight: 34, letterSpacing: -0.4 },
  greetName: { color: Colors.blush[400] },

  heroSection: { alignItems: 'center', paddingTop: 4, paddingBottom: 6 },
  phaseLabel: { alignItems: 'center', marginTop: 14, marginBottom: 8 },
  phaseEyebrow: {
    fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1.8,
    textTransform: 'uppercase', color: Colors.beige[400], marginBottom: 4,
  },
  phaseName: { fontFamily: Fonts.sansBold, fontSize: 20, letterSpacing: -0.4, lineHeight: 24, marginBottom: 5 },
  phaseDesc: { fontFamily: Fonts.sansLight, fontSize: 12.5, color: Colors.beige[400], lineHeight: 18, textAlign: 'center', paddingHorizontal: 40 },

  statRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, marginBottom: 16 },
  statTile: { flex: 1, borderRadius: 20, padding: 14 },
  statVal: { fontFamily: Fonts.sansBold, fontSize: 26, lineHeight: 30, letterSpacing: -0.5, marginTop: 8, marginBottom: 2 },
  statLbl: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1.1, textTransform: 'uppercase' },
  statSub: { fontFamily: Fonts.sansLight, fontSize: 10, marginTop: 1 },

  chipRow: { paddingHorizontal: 24, gap: 8, marginBottom: 16, flexDirection: 'row' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999,
  },
  chipPrimary: { backgroundColor: Colors.beige[800] },
  chipTxtLight: { fontFamily: Fonts.sansBold, fontSize: 12, color: '#fff', letterSpacing: 0.1 },
  chipTxt: { fontFamily: Fonts.sansBold, fontSize: 12, letterSpacing: 0.1 },

  card: { marginHorizontal: 24, borderRadius: 24, padding: 20, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardLabel: { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 2 },
  cardCount: { fontFamily: Fonts.sansBold, fontSize: 30, letterSpacing: -0.5, lineHeight: 34 },
  cardSub2: { fontFamily: Fonts.sansLight, fontSize: 12, paddingTop: 6 },

  emptyChart: { height: 100, alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { fontFamily: Fonts.sansLight, fontSize: 13 },

  insightBig: { fontFamily: Fonts.sansBold, fontSize: 38, letterSpacing: -0.5, lineHeight: 42, marginBottom: 5 },
  insightDesc: { fontFamily: Fonts.sansLight, fontSize: 13, lineHeight: 20 },
  insightLink: { marginTop: 10 },
  insightLinkTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 13 },
});
