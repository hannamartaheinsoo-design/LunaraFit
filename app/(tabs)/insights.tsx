import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';
import { InsightCard } from '../../components/ui/Card';
import { storage } from '../../lib/storage';
import { PHASE_LABELS, formatDate } from '../../lib/cycle';
import { Workout, CycleDay } from '../../types';

function phaseDiff(workouts: Workout[]): { diff: number; fCount: number; lCount: number } | null {
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
  return { diff: ((fa - la) / la) * 100, fCount: f.length, lCount: l.length };
}

interface ExerciseStats {
  follicular: number[];
  luteal: number[];
}

export default function InsightsScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);

  useEffect(() => {
    (async () => {
      const [ws, cd] = await Promise.all([storage.getWorkouts(), storage.getCycleDays()]);
      setWorkouts(ws);
      setCycleDays(cd);
    })();
  }, []);

  if (!workouts.length && !cycleDays.length) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>Ülevaated</Text>
          <Text style={styles.subheading}>Mustrid sinu andmetes</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.empty}>Lisa treeninguid ja tsükliandmeid.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pd = phaseDiff(workouts);

  // Per-exercise phase comparison
  const exMap: Record<string, ExerciseStats> = {};
  workouts.forEach((w) => {
    w.exercises.forEach((e) => {
      if (!e.name || !e.weight_kg) return;
      if (!exMap[e.name]) exMap[e.name] = { follicular: [], luteal: [] };
      if (w.phase === 'follicular') exMap[e.name].follicular.push(e.weight_kg);
      else if (w.phase === 'luteal') exMap[e.name].luteal.push(e.weight_kg);
    });
  });

  // Mood stats
  const moodCount: Record<string, number> = {};
  cycleDays.forEach((d) => { if (d.mood) moodCount[d.mood] = (moodCount[d.mood] ?? 0) + 1; });
  const topMood = Object.keys(moodCount).sort((a, b) => moodCount[b] - moodCount[a])[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>Ülevaated</Text>
        <Text style={styles.subheading}>Mustrid sinu andmetes</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {pd && (
          <InsightCard variant={pd.diff >= 0 ? 'blush' : 'default'} style={styles.card}>
            <Text style={[styles.cardEye, pd.diff >= 0 && { color: Colors.blush[400] }]}>✨ Faasivõrdlus</Text>
            <Text style={styles.cardTitle}>
              Tulemused on {pd.diff >= 0 ? 'follikulaarfaasis' : 'luteaalfaasis'} {Math.abs(pd.diff).toFixed(1)}% kõrgemad
            </Text>
            <Text style={styles.cardBody}>Follikulaarfaasis {pd.fCount} treeningkorda, luteaalfaasis {pd.lCount}.</Text>
          </InsightCard>
        )}

        {Object.keys(exMap).some((name) => exMap[name].follicular.length && exMap[name].luteal.length) && (
          <View style={[styles.card, styles.exCompareCard]}>
            <Text style={styles.cardLbl}>✨ Harjutuste faasivõrdlus</Text>
            {Object.keys(exMap).map((name) => {
              const d = exMap[name];
              if (!d.follicular.length || !d.luteal.length) return null;
              const fa = d.follicular.reduce((a, b) => a + b, 0) / d.follicular.length;
              const la = d.luteal.reduce((a, b) => a + b, 0) / d.luteal.length;
              const diff = ((fa - la) / la) * 100;
              const mx = Math.max(fa, la);
              return (
                <View key={name} style={styles.progWrap}>
                  <View style={styles.progLbl}>
                    <Text style={styles.progName}>{name}</Text>
                    <Text style={[styles.progDiff, { color: diff >= 0 ? Colors.green[600] : Colors.blush[400] }]}>
                      {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% follik.
                    </Text>
                  </View>
                  <View style={styles.progBars}>
                    <View style={styles.progBarWrap}>
                      <Text style={styles.progBarLbl}>Follikulaar · {fa.toFixed(1)} kg</Text>
                      <View style={styles.progTrack}>
                        <View style={[styles.progFill, { width: `${(fa / mx) * 100}%`, backgroundColor: Colors.beige[400] }]} />
                      </View>
                    </View>
                    <View style={styles.progBarWrap}>
                      <Text style={[styles.progBarLbl, { color: Colors.blush[400] }]}>Luteaal · {la.toFixed(1)} kg</Text>
                      <View style={styles.progTrack}>
                        <View style={[styles.progFill, { width: `${(la / mx) * 100}%`, backgroundColor: Colors.blush[400] }]} />
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {workouts.length > 0 && (
          <>
            <Text style={styles.sectionLbl}>👁 Viimased treeningkorrad</Text>
            {workouts.slice(0, 3).map((w) => (
              <InsightCard key={w.id} style={styles.card}>
                <Text style={styles.cardEye}>🏋️ {PHASE_LABELS[w.phase]}</Text>
                <Text style={styles.cardTitle}>{w.name} · {formatDate(w.date)}</Text>
                <Text style={styles.cardBody}>
                  {w.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}${e.weight_kg ? ` (${e.weight_kg} kg)` : ''}`).join(' · ')}
                  {w.feel.length ? `\nTunne: ${w.feel.join(', ')}` : ''}
                </Text>
              </InsightCard>
            ))}
          </>
        )}

        {topMood && (
          <InsightCard variant="green" style={styles.card}>
            <Text style={[styles.cardEye, { color: Colors.green[600] }]}>🌙 Tujumuster</Text>
            <Text style={styles.cardTitle}>Sagedaim märgitud tuju: {topMood}</Text>
            <Text style={styles.cardBody}>Logitud {cycleDays.length} tsüklimärget.</Text>
          </InsightCard>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            👁 Need ülevaated põhinevad sinu enda salvestatud andmetes ega ole meditsiiniline nõuanne.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  topBar: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.beige[50],
  },
  heading: { fontSize: 26, fontWeight: '600', color: Colors.beige[800] },
  subheading: { fontSize: 12, color: Colors.beige[400], marginTop: 2, fontWeight: '300' },
  scroll: { flex: 1, paddingTop: 8 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { fontSize: 13, color: Colors.beige[400], fontWeight: '300' },
  card: { marginTop: 4 },
  cardEye: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
    color: Colors.beige[400], marginBottom: 4,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 4, color: Colors.beige[800] },
  cardBody: { fontSize: 12, color: Colors.beige[600], lineHeight: 19, fontWeight: '300' },
  cardLbl: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase',
    color: Colors.beige[400], marginBottom: 12,
  },
  exCompareCard: {
    marginHorizontal: Spacing.xl, marginBottom: 10,
    backgroundColor: Colors.cream, borderWidth: 1, borderColor: Colors.beige[100],
    borderRadius: 20, padding: 16,
  },
  progWrap: { marginBottom: 10 },
  progLbl: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progName: { fontSize: 11, color: Colors.beige[600] },
  progDiff: { fontSize: 11, fontWeight: '700' },
  progBars: { flexDirection: 'row', gap: 6 },
  progBarWrap: { flex: 1 },
  progBarLbl: { fontSize: 10, color: Colors.beige[400], marginBottom: 3 },
  progTrack: { height: 7, borderRadius: 4, backgroundColor: Colors.beige[100], overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 4 },
  sectionLbl: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase',
    color: Colors.beige[400], paddingHorizontal: Spacing.xl, marginBottom: 10, marginTop: 4,
  },
  disclaimer: {
    marginHorizontal: Spacing.xl, marginBottom: 16, marginTop: 8,
    padding: 12, backgroundColor: Colors.beige[50], borderWidth: 1, borderColor: Colors.beige[100], borderRadius: 12,
  },
  disclaimerText: { fontSize: 11, color: Colors.beige[400], lineHeight: 18, fontWeight: '300' },
});
