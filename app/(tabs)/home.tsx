import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
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

  const insightTitle = pd != null && ci
    ? `${t('home.ins.based')} ${pd >= 0 ? t('home.ins.follik') : t('home.ins.luteal')} ${Math.abs(pd).toFixed(1)}${t('home.ins.higher')}`
    : workouts.length
    ? `${workouts.length} ${t('home.ins.count')}`
    : t('home.pattern.empty');

  const insightBody = pd != null
    ? `${t('home.ins.based')} ${workouts.length} ${t('home.ins.sessions')}`
    : t('home.pattern.sub');

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
            <View style={styles.statLblRow}><Icon name="wave" size={10} color={T.textMuted} /><Text style={[styles.statLbl, { color: T.textMuted }]}>{t('home.stat.phase')}</Text></View>
            <Text style={[styles.statVal, { color: T.text, fontSize: 18 }, pd != null ? { color: pd >= 0 ? Colors.green[T.dark ? 200 : 600] : Colors.blush[400] } : {}]}>
              {pd != null ? `${pd >= 0 ? '+' : ''}${pd.toFixed(1)}%` : '—'}
            </Text>
            <Text style={[styles.statSub, { color: T.textSec }]}>{t('home.stat.phase.sub')}</Text>
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

        {/* Pattern analysis card */}
        <PatternCard workouts={workouts} lang={lang} T={T} t={t} pd={pd} ci={ci} now={now} />

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
  barLbl: { fontFamily: Fonts.sansSemiBold, fontSize: 10, color: Colors.beige[400] },
  empty: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], textAlign: 'center', paddingVertical: 8 },
  insightPreview: { marginTop: 0 },
  insightEyeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  insightEye: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: Colors.green[600] },
  insightTitle: { fontFamily: Fonts.sansSemiBold, fontSize: 14, marginBottom: 4, color: Colors.beige[800] },
  insightBody: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[600], lineHeight: 19 },
});
