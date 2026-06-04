import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Fonts, Spacing } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';
import { Card, InsightCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { getCycleInfo, getPhaseLabel } from '../../lib/cycle';
import { useTranslation } from '../../lib/LangContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

type PhaseKey = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

const PHASE_COLORS: Record<PhaseKey, string> = {
  menstruation: Colors.blush[300],
  follicular:   Colors.green[400] ?? '#7EB98A',
  ovulation:    Colors.coral[400],
  luteal:       '#9B8EC4',
};

const PHASE_BG: Record<PhaseKey, string> = {
  menstruation: Colors.blush[50],
  follicular:   Colors.green[50] ?? '#F0F7F1',
  ovulation:    Colors.coral[50] ?? '#FEF1EE',
  luteal:       '#F3F0FA',
};

function avgVolume(workouts: any[], phase: PhaseKey): number {
  const ws = workouts.filter((w) => w.phase === phase);
  if (!ws.length) return 0;
  let total = 0, count = 0;
  ws.forEach((w: any) => w.exercises.forEach((e: any) => {
    if (e.weight_kg > 0) { total += e.weight_kg * (e.reps || 1) * (e.sets || 1); count++; }
  }));
  return count ? total / count : 0;
}

function phaseDiff(workouts: any[]): number | null {
  const f = workouts.filter((w) => w.phase === 'follicular');
  const l = workouts.filter((w) => w.phase === 'luteal');
  if (!f.length || !l.length) return null;
  const avg = (ws: any[]) => {
    let total = 0, count = 0;
    ws.forEach((w) => w.exercises.forEach((e: any) => { if (e.weight_kg > 0) { total += e.weight_kg; count++; } }));
    return count ? total / count : 0;
  };
  const fa = avg(f), la = avg(l);
  if (!la) return null;
  return ((fa - la) / la) * 100;
}

const PHASES: PhaseKey[] = ['menstruation', 'follicular', 'ovulation', 'luteal'];

function PatternCard({ workouts, lang, T, t, pd, ci, now }: any) {
  const phaseVolumes = PHASES.map(p => ({ phase: p, vol: avgVolume(workouts, p) }));
  const maxVol = Math.max(...phaseVolumes.map(p => p.vol), 1);
  const phaseCounts = PHASES.map(p => workouts.filter((w: any) => w.phase === p).length);
  const hasData = workouts.length >= 2;

  // 28-day dot grid
  const dots = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(now.getTime() - (27 - i) * 86400000);
    const ds = d.toISOString().slice(0, 10);
    const w = workouts.find((w: any) => w.date === ds);
    return { ds, phase: w?.phase as PhaseKey | undefined, hasWorkout: !!w };
  });

  // Best phase
  const bestPhase = phaseVolumes.reduce((best, cur) => cur.vol > best.vol ? cur : best, phaseVolumes[0]);

  const phaseLabel = (p: PhaseKey) => getPhaseLabel(p, lang);

  return (
    <InsightCard variant="default" style={styles.insightPreview}>
      <View style={styles.insightEyeRow}>
        <Icon name="spark" size={10} color={Colors.green[T.dark ? 200 : 600]} />
        <Text style={[styles.insightEye, { color: Colors.green[T.dark ? 200 : 600] }]}>{t('home.pattern.eye')}</Text>
      </View>

      {!hasData ? (
        <>
          <Text style={[styles.insightTitle, { color: T.text }]}>{t('home.pattern.empty')}</Text>
          <Text style={[styles.insightBody, { color: T.textSec }]}>{t('home.pattern.sub')}</Text>
        </>
      ) : (
        <>
          {/* Key finding */}
          {pd != null && (
            <View style={styles.findingRow}>
              <Text style={[styles.findingBig, { color: pd >= 0 ? Colors.green[600] : Colors.blush[500] }]}>
                {pd >= 0 ? '+' : ''}{pd.toFixed(1)}%
              </Text>
              <Text style={[styles.findingTxt, { color: T.textSec }]}>
                {lang === 'en'
                  ? `${pd >= 0 ? 'more' : 'less'} avg weight in ${pd >= 0 ? 'follicular' : 'luteal'} vs ${pd >= 0 ? 'luteal' : 'follicular'} phase`
                  : `${pd >= 0 ? 'kõrgem' : 'madalam'} keskmine raskus ${pd >= 0 ? 'follikulaarfaasis' : 'luteaalfaasis'}`}
              </Text>
            </View>
          )}

          {/* Phase horizontal comparison */}
          <Text style={[styles.sectionMini, { color: T.textMuted }]}>
            {lang === 'en' ? 'AVG VOLUME BY PHASE' : 'MAHT FAASI JÄRGI'}
          </Text>
          <View style={styles.phaseRows}>
            {phaseVolumes.map(({ phase, vol }, i) => {
              const pct = maxVol > 0 ? (vol / maxVol) * 100 : 0;
              return (
                <View key={phase} style={styles.phaseRow}>
                  <Text style={[styles.phaseRowLbl, { color: vol > 0 ? PHASE_COLORS[phase] : T.textMuted }]} numberOfLines={1}>
                    {phaseLabel(phase).slice(0, 4).toUpperCase()}
                  </Text>
                  <View style={[styles.phaseRowTrack, { backgroundColor: T.border }]}>
                    {vol > 0 && (
                      <View style={[styles.phaseRowFill, { width: `${pct}%` as any, backgroundColor: PHASE_COLORS[phase] }]} />
                    )}
                  </View>
                  <Text style={[styles.phaseRowCount, { color: vol > 0 ? T.textSec : T.textMuted }]}>
                    {phaseCounts[i]}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Best phase callout */}
          {bestPhase.vol > 0 && (
            <View style={[styles.bestPhaseRow, { backgroundColor: PHASE_BG[bestPhase.phase] }]}>
              <View style={[styles.bestPhaseDot, { backgroundColor: PHASE_COLORS[bestPhase.phase] }]} />
              <Text style={[styles.bestPhaseTxt, { color: T.textSec }]}>
                {lang === 'en'
                  ? `Strongest phase: `
                  : `Tugevaim faas: `}
                <Text style={{ color: PHASE_COLORS[bestPhase.phase], fontFamily: Fonts.sansBold }}>
                  {phaseLabel(bestPhase.phase)}
                </Text>
              </Text>
            </View>
          )}

          {/* 28-day dot grid */}
          <Text style={[styles.sectionMini, { color: T.textMuted, marginTop: 14 }]}>
            {lang === 'en' ? 'LAST 28 DAYS' : 'VIIMASED 28 PÄEVA'}
          </Text>
          <View style={styles.dotGrid}>
            {dots.map(({ ds, phase, hasWorkout }) => (
              <View
                key={ds}
                style={[
                  styles.dot,
                  hasWorkout
                    ? { backgroundColor: phase ? PHASE_COLORS[phase] : Colors.blush[400] }
                    : { backgroundColor: T.border, opacity: 0.5 }
                ]}
              />
            ))}
          </View>
          <View style={styles.dotLegend}>
            {PHASES.map(p => (
              <View key={p} style={styles.dotLegendItem}>
                <View style={[styles.dotLegendDot, { backgroundColor: PHASE_COLORS[p] }]} />
                <Text style={[styles.dotLegendTxt, { color: T.textMuted }]}>{phaseLabel(p).slice(0, 5)}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity onPress={() => router.push('/(tabs)/insights')} style={styles.insightLink}>
        <Text style={[styles.insightLinkTxt, { color: Colors.green[T.dark ? 200 : 600] }]}>
          {lang === 'en' ? 'Full analysis →' : 'Täielik analüüs →'}
        </Text>
      </TouchableOpacity>
    </InsightCard>
  );
}

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

  const daysUntilPeriod = ci ? ci.cycleLength - ci.day + 1 : null;

  // consecutive days with a workout ending today (or from most recent workout day)
  const workoutDates = new Set(workouts.map((w: any) => w.date));
  let streak = 0;
  for (let i = 0; ; i++) {
    const ds = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
    if (workoutDates.has(ds)) { streak++; } else if (i === 0) { break; } else { break; }
  }

  const pd = phaseDiff(workouts);

  const DAYS = tArr('home.days');
  const MONTHS = tArr('home.months');
  const WEEKDAYS = tArr('home.weekdays');

  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    const ds = d.toISOString().slice(0, 10);
    const has = workouts.some((w) => w.date === ds);
    const dayIdx = (d.getDay() + 6) % 7;
    return { label: WEEKDAYS[dayIdx], has };
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: T.border }]}>
        <Text style={[styles.logo, { color: T.textMuted }]}><Text style={styles.logoAccent}>Lunara</Text>Fit</Text>
        <TouchableOpacity style={[styles.avatar, { backgroundColor: T.blushBg, borderColor: T.blushBorder }]} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={[styles.avatarText, { color: Colors.blush[T.dark ? 200 : 800] }]}>{profile?.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.dateLbl, { color: T.textMuted }]}>{DAYS[now.getDay()]}, {now.getDate()}. {MONTHS[now.getMonth()]}</Text>
          <Text style={[styles.greetingName, { color: T.text }]}>{t('home.greet')} <Text style={styles.nameAccent}>{profile?.name || t('home.noname')}.</Text></Text>
          <Text style={[styles.greetingSub, { color: T.textMuted }]}>
            {ci ? `${t('home.cycleday')} ${ci.day} · ${ci.daysLeft} ${t('home.daysleft')}` : t('home.addcycle')}
          </Text>
        </View>

        {/* Phase banner */}
        <View style={[styles.phaseBanner, { backgroundColor: T.blushBg, borderColor: T.blushBorder }]}>
          <View style={[styles.phaseIconWrap, { backgroundColor: T.blushBorder, borderColor: T.blushBorder }]}>
            <Icon name="moon" size={24} color={Colors.blush[600]} strokeWidth={1.4} />
          </View>
          <View style={styles.phaseInfo}>
            <Text style={styles.phaseEye}>{t('home.phase.eye')}</Text>
            <Text style={[styles.phaseName, { color: Colors.blush[T.dark ? 200 : 800] }]}>{ci?.phase ?? '—'}</Text>
            <Text style={styles.phaseDesc}>{ci?.description ?? t('home.phase.nodesc')}</Text>
          </View>
          {ci && (
            <View style={styles.phaseMeta}>
              <Text style={[styles.phaseDaysN, { color: Colors.blush[T.dark ? 200 : 800] }]}>{ci.daysLeft}</Text>
              <Text style={styles.phaseDaysL}>{t('home.daysleft')}</Text>
            </View>
          )}
        </View>

        {/* Stat tiles */}
        <View style={styles.statRow}>
          <View style={[styles.statTile, { backgroundColor: T.surface2, borderColor: T.border }]}>
            <View style={styles.statLblRow}><Icon name="barbell" size={10} color={T.textMuted} /><Text style={[styles.statLbl, { color: T.textMuted }]}>{t('home.stat.workouts')}</Text></View>
            <Text style={[styles.statVal, { color: T.text }]}>{recentCount}</Text>
            <Text style={[styles.statSub, { color: T.textSec }]}>{t('home.stat.workouts.sub')}</Text>
          </View>
          <TouchableOpacity style={[styles.statTile, { backgroundColor: T.blushBg, borderColor: T.blushBorder }]} onPress={() => router.push('/(tabs)/cycle')}>
            <View style={styles.statLblRow}><Icon name="moon" size={10} color={Colors.blush[400]} /><Text style={[styles.statLbl, { color: Colors.blush[400] }]}>{t('home.stat.period')}</Text></View>
            <Text style={[styles.statVal, { color: Colors.blush[T.dark ? 200 : 700] }]}>{daysUntilPeriod != null ? daysUntilPeriod : '—'}</Text>
            <Text style={[styles.statSub, { color: Colors.blush[400] }]}>{daysUntilPeriod != null ? t('home.stat.period.sub') : t('home.stat.period.none')}</Text>
          </TouchableOpacity>
          <View style={[styles.statTile, { backgroundColor: T.surface2, borderColor: T.border }]}>
            <View style={styles.statLblRow}><Icon name="spark" size={10} color={T.textMuted} /><Text style={[styles.statLbl, { color: T.textMuted }]}>{t('home.stat.streak')}</Text></View>
            <Text style={[styles.statVal, { color: streak > 0 ? Colors.green[T.dark ? 200 : 600] : T.text }]}>{streak > 0 ? streak : '—'}</Text>
            <Text style={[styles.statSub, { color: T.textSec }]}>{t('home.stat.streak.sub')}</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <Button variant="dark" size="sm" onPress={() => router.push('/(tabs)/workouts')}>{t('home.quick.workout')}</Button>
          <Button variant="berry" size="sm" onPress={() => router.push('/(tabs)/cycle')}>{t('home.quick.cycle')}</Button>
          <Button variant="green" size="sm" onPress={() => router.push('/(tabs)/insights')}>{t('home.quick.insights')}</Button>
        </View>

        {/* Weekly chart */}
        <Card style={styles.chartCard}>
          <View style={styles.cardLblRow}><Icon name="wave" size={12} color={T.textMuted} /><Text style={[styles.cardLbl, { color: T.textMuted }]}>{t('home.chart.lbl')}</Text></View>
          {workouts.length ? (
            <View style={styles.chartWrap}>
              {weekBars.map((bar, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={[styles.barFill, { height: bar.has ? '82%' : '10%', backgroundColor: bar.has ? Colors.blush[400] : T.border }]} />
                  <Text style={[styles.barLbl, { color: T.textMuted }]}>{bar.label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.empty, { color: T.textMuted }]}>{t('home.chart.empty')}</Text>
          )}
        </Card>


        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.beige[50],
  },
  logo: { fontFamily: Fonts.serifItalic, fontSize: 19, color: Colors.beige[400] },
  logoAccent: { fontFamily: Fonts.serif, color: Colors.blush[400] },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.blush[50], borderWidth: 2, borderColor: Colors.blush[200],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.serifSemiBold, fontSize: 16, color: Colors.blush[800] },
  scroll: { flex: 1 },
  greeting: { paddingHorizontal: Spacing.xl, paddingTop: 6, paddingBottom: 16 },
  dateLbl: { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: Colors.beige[400], marginBottom: 4 },
  greetingName: { fontFamily: Fonts.serifSemiBold, fontSize: 30, color: Colors.beige[800], lineHeight: 33 },
  nameAccent: { fontFamily: Fonts.serifSemiBoldItalic, color: Colors.blush[400] },
  greetingSub: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], marginTop: 3 },
  phaseBanner: {
    marginHorizontal: Spacing.xl, marginBottom: 14,
    backgroundColor: Colors.blush[50], borderWidth: 1.5, borderColor: Colors.blush[100],
    borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  phaseIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.blush[100], borderWidth: 1.5, borderColor: Colors.blush[200],
    alignItems: 'center', justifyContent: 'center',
  },
  phaseInfo: { flex: 1 },
  phaseEye: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: Colors.blush[600] },
  phaseName: { fontFamily: Fonts.serifSemiBold, fontSize: 20, color: Colors.blush[800], marginVertical: 2 },
  phaseDesc: { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.blush[600], lineHeight: 16 },
  phaseMeta: { alignItems: 'center' },
  phaseDaysN: { fontFamily: Fonts.serifSemiBold, fontSize: 32, color: Colors.blush[800], lineHeight: 34 },
  phaseDaysL: { fontFamily: Fonts.sansMedium, fontSize: 9, color: Colors.blush[400] },
  statRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.xl, marginBottom: 14 },
  statTile: { flex: 1, backgroundColor: Colors.beige[50], borderRadius: 18, padding: 12, borderWidth: 1, borderColor: Colors.beige[100] },
  statLblRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  statLbl: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: Colors.beige[400] },
  statVal: { fontFamily: Fonts.serifSemiBold, fontSize: 26, color: Colors.beige[800], lineHeight: 28, marginBottom: 3 },
  statSub: { fontFamily: Fonts.sansLight, fontSize: 10, color: Colors.beige[600] },
  quickRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.xl, marginBottom: 14, flexWrap: 'wrap' },
  chartCard: {},
  cardLblRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  cardLbl: { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.1, textTransform: 'uppercase', color: Colors.beige[400] },
  chartWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 96 },
  barCol: { flex: 1, alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 5 },
  barLbl: { fontFamily: Fonts.sansSemiBold, fontSize: 10, color: Colors.beige[400], textAlign: 'center' },
  empty: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], textAlign: 'center', paddingVertical: 8 },
  insightPreview: { marginTop: 0 },
  insightEyeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  insightEye: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: Colors.green[600] },
  insightTitle: { fontFamily: Fonts.sansSemiBold, fontSize: 14, marginBottom: 4, color: Colors.beige[800] },
  insightBody: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[600], lineHeight: 19 },

  // Pattern card
  findingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  findingBig: { fontFamily: Fonts.serifSemiBold, fontSize: 36, lineHeight: 38 },
  findingTxt: { flex: 1, fontFamily: Fonts.sansLight, fontSize: 12, lineHeight: 17 },

  sectionMini: {
    fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1.2,
    textTransform: 'uppercase', color: Colors.beige[400], marginBottom: 8,
  },

  phaseRows: { gap: 7, marginBottom: 10 },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phaseRowLbl: { fontFamily: Fonts.sansBold, fontSize: 8, letterSpacing: 0.6, width: 30, textAlign: 'right' },
  phaseRowTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  phaseRowFill: { height: '100%', borderRadius: 4 },
  phaseRowCount: { fontFamily: Fonts.sansBold, fontSize: 9, width: 14, textAlign: 'right' },

  bestPhaseRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 2,
  },
  bestPhaseDot: { width: 8, height: 8, borderRadius: 4 },
  bestPhaseTxt: { fontFamily: Fonts.sansLight, fontSize: 12 },

  dotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  dotLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dotLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dotLegendDot: { width: 7, height: 7, borderRadius: 3.5 },
  dotLegendTxt: { fontFamily: Fonts.sansLight, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },

  insightLink: { marginTop: 12, alignSelf: 'flex-end' },
  insightLinkTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.green[600] },
});
