import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Fonts, Spacing } from '../../constants/theme';
import { Card, InsightCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { getCycleInfo, PHASE_LABELS, formatDate, todayISO } from '../../lib/cycle';
import { storage } from '../../lib/storage';
import { Profile, Workout } from '../../types';

const DAYS = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
const MONTHS = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
const WEEKDAYS = ['E', 'T', 'K', 'N', 'R', 'L', 'P'];

function phaseDiff(workouts: Workout[]): number | null {
  const f = workouts.filter((w) => w.phase === 'follicular');
  const l = workouts.filter((w) => w.phase === 'luteal');
  if (!f.length || !l.length) return null;
  const avg = (ws: Workout[]) => {
    let t = 0, c = 0;
    ws.forEach((w) => w.exercises.forEach((e) => { if (e.weight_kg > 0) { t += e.weight_kg; c++; } }));
    return c ? t / c : 0;
  };
  const fa = avg(f), la = avg(l);
  if (!la) return null;
  return ((fa - la) / la) * 100;
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const now = new Date();

  useEffect(() => {
    (async () => {
      const [p, ws] = await Promise.all([storage.getProfile(), storage.getWorkouts()]);
      if (p) setProfile(p);
      setWorkouts(ws);
    })();
  }, []);

  const ci = getCycleInfo(
    profile.last_period_date ?? null,
    profile.cycle_length ?? 28,
    profile.period_length ?? 5,
  );

  const d7 = new Date(now.getTime() - 7 * 86400000);
  const recentCount = workouts.filter((w) => new Date(w.date) >= d7).length;

  let bestKg = 0, bestName = '', bestDate = '';
  workouts.forEach((w) => w.exercises.forEach((e) => {
    if (e.weight_kg > bestKg) { bestKg = e.weight_kg; bestName = e.name; bestDate = w.date; }
  }));

  const pd = phaseDiff(workouts);

  // Weekly bar chart
  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    const ds = d.toISOString().slice(0, 10);
    const has = workouts.some((w) => w.date === ds);
    const dayIdx = (d.getDay() + 6) % 7;
    return { label: WEEKDAYS[dayIdx], has };
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.logo}><Text style={styles.logoAccent}>Lunara</Text>Fit</Text>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.avatarText}>{profile.name?.[0]?.toUpperCase() ?? '?'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.dateLbl}>{DAYS[now.getDay()]}, {now.getDate()}. {MONTHS[now.getMonth()]}</Text>
          <Text style={styles.greetingName}>Tere, <Text style={styles.nameAccent}>{profile.name || 'sina'}.</Text></Text>
          <Text style={styles.greetingSub}>
            {ci ? `Tsükli päev ${ci.day} · ${ci.daysLeft} päeva jäänud` : 'Lisa tsükliandmed profiilis.'}
          </Text>
        </View>

        {/* Phase banner */}
        <View style={styles.phaseBanner}>
          <View style={styles.phaseIconWrap}>
            <Icon name="moon" size={24} color={Colors.blush[600]} strokeWidth={1.4} />
          </View>
          <View style={styles.phaseInfo}>
            <Text style={styles.phaseEye}>Praegune faas</Text>
            <Text style={styles.phaseName}>{ci?.phase ?? '—'}</Text>
            <Text style={styles.phaseDesc}>{ci?.description ?? 'Lisa tsükliandmed, et näha oma faasi.'}</Text>
          </View>
          {ci && (
            <View style={styles.phaseMeta}>
              <Text style={styles.phaseDaysN}>{ci.daysLeft}</Text>
              <Text style={styles.phaseDaysL}>päeva jäänud</Text>
            </View>
          )}
        </View>

        {/* Stat tiles */}
        <View style={styles.statRow}>
          <View style={styles.statTile}>
            <View style={styles.statLblRow}><Icon name="barbell" size={10} color={Colors.beige[400]} /><Text style={styles.statLbl}>Treeningkordi</Text></View>
            <Text style={styles.statVal}>{recentCount}</Text>
            <Text style={styles.statSub}>viimase 7 päeva</Text>
          </View>
          <View style={styles.statTile}>
            <View style={styles.statLblRow}><Icon name="spark" size={10} color={Colors.beige[400]} /><Text style={styles.statLbl}>{bestName ? (bestName.length > 10 ? bestName.slice(0, 10) + '…' : bestName) : 'Parim tulemus'}</Text></View>
            <Text style={styles.statVal}>{bestKg ? `${bestKg}kg` : '—'}</Text>
            <Text style={styles.statSub}>{bestDate ? formatDate(bestDate) : 'logitud andmetest'}</Text>
          </View>
          <View style={styles.statTile}>
            <View style={styles.statLblRow}><Icon name="wave" size={10} color={Colors.beige[400]} /><Text style={styles.statLbl}>Faasivõrdlus</Text></View>
            <Text style={[styles.statVal, { fontSize: 18 }, pd != null ? { color: pd >= 0 ? Colors.green[600] : Colors.blush[400] } : {}]}>
              {pd != null ? `${pd >= 0 ? '+' : ''}${pd.toFixed(1)}%` : '—'}
            </Text>
            <Text style={styles.statSub}>follik. vs luteaal</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <Button variant="dark" size="sm" onPress={() => router.push('/(tabs)/workouts')}>Lisa treening</Button>
          <Button variant="blush" size="sm" onPress={() => router.push('/(tabs)/cycle')}>Lisa märge</Button>
          <Button variant="green" size="sm" onPress={() => router.push('/(tabs)/insights')}>Ülevaated</Button>
        </View>

        {/* Weekly chart */}
        <Card style={styles.chartCard}>
          <View style={styles.cardLblRow}><Icon name="wave" size={12} color={Colors.beige[400]} /><Text style={styles.cardLbl}>Nädala aktiivsus</Text></View>
          {workouts.length ? (
            <View style={styles.chartWrap}>
              {weekBars.map((bar, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={[styles.barFill, { height: bar.has ? '82%' : '10%', backgroundColor: bar.has ? Colors.blush[400] : Colors.beige[100] }]} />
                  <Text style={styles.barLbl}>{bar.label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.empty}>Lisa treeninguid, et näha graafikut.</Text>
          )}
        </Card>

        {/* Insight preview */}
        <InsightCard variant="default" style={styles.insightPreview}>
          <View style={styles.insightEyeRow}><Icon name="spark" size={10} color={Colors.green[600]} /><Text style={styles.insightEye}>Muster</Text></View>
          <Text style={styles.insightTitle}>
            {pd != null && ci
              ? `Tulemused on ${pd >= 0 ? 'follikulaarfaasis' : 'luteaalfaasis'} ${Math.abs(pd).toFixed(1)}% kõrgemad`
              : workouts.length
              ? `${workouts.length} treeningkorda logitud`
              : 'Lisa andmeid, et mustrid ilmneksid.'}
          </Text>
          <Text style={styles.insightBody}>
            {pd != null
              ? `Põhineb ${workouts.length} treeningkorral.`
              : 'Vähemalt 2 treeningut eri faasides annab esimese võrdluse.'}
          </Text>
        </InsightCard>

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
    backgroundColor: Colors.blush[50],
    borderWidth: 1.5, borderColor: Colors.blush[100],
    borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
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
