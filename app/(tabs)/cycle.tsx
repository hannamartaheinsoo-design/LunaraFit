import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Chip } from '../../components/ui/Chip';
import { storage } from '../../lib/storage';
import { getCycleInfo, todayISO } from '../../lib/cycle';
import { Profile, CycleDay, Mood } from '../../types';

const SYMPTOM_CHIPS = ['Krambid', 'Puhitus', 'Peavalu', 'Väsimus', 'Hea energia', 'Iha', 'Ärrituvus', 'Madal energia'];
const MOODS: { key: Mood; label: string; emoji: string }[] = [
  { key: 'bad', label: 'Halb', emoji: '😞' },
  { key: 'neutral', label: 'Keskmine', emoji: '😐' },
  { key: 'good', label: 'Hea', emoji: '😊' },
  { key: 'great', label: 'Suurepärane', emoji: '😄' },
  { key: 'energized', label: 'Ergas', emoji: '⚡' },
];
const WEEKDAYS = ['E', 'T', 'K', 'N', 'R', 'L', 'P'];
const MONTHS = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];

export default function CycleScreen() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [date, setDate] = useState(todayISO());
  const [period, setPeriod] = useState(false);
  const [mood, setMood] = useState<Mood | null>(null);
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set());

  const now = new Date();
  const yr = now.getFullYear();
  const mo = now.getMonth();

  useEffect(() => {
    (async () => {
      const [p, cd] = await Promise.all([storage.getProfile(), storage.getCycleDays()]);
      if (p) setProfile(p);
      setCycleDays(cd);
    })();
  }, []);

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const handleSave = async () => {
    if (!date) { Alert.alert('', 'Palun vali kuupäev'); return; }
    const entry: CycleDay = {
      id: date,
      user_id: 'local',
      date,
      period,
      mood,
      symptoms: Array.from(symptoms),
      created_at: new Date().toISOString(),
    };
    const updated = await storage.upsertCycleDay(entry);
    setCycleDays(updated);

    if (period) {
      const currentLast = profile.last_period_date;
      if (!currentLast || date < currentLast) {
        const p = await storage.getProfile();
        const merged = { ...(p ?? {}), last_period_date: date };
        await storage.setProfile(merged);
        setProfile(merged);
      }
    }

    setPeriod(false);
    setMood(null);
    setSymptoms(new Set());
    Alert.alert('', 'Tsüklimärge salvestatud ✓');
  };

  // Calendar
  const cl = profile.cycle_length ?? 28;
  const pl = profile.period_length ?? 5;
  const blank = (new Date(yr, mo, 1).getDay() + 6) % 7;
  const dim = new Date(yr, mo + 1, 0).getDate();
  const loggedPeriodDates = new Set(cycleDays.filter((d) => d.period).map((d) => d.date));

  const predPeriod = new Set<number>();
  const fertDays = new Set<number>();
  const ovDays = new Set<number>();

  if (profile.last_period_date) {
    const last = new Date(profile.last_period_date);
    for (let i = 0; i <= 4; i++) {
      const cs = new Date(last.getTime() + i * cl * 86400000);
      for (let j = 0; j < pl; j++) {
        const pd = new Date(cs.getTime() + j * 86400000);
        if (pd.getFullYear() === yr && pd.getMonth() === mo) {
          const ds = pd.toISOString().slice(0, 10);
          if (!loggedPeriodDates.has(ds)) predPeriod.add(pd.getDate());
        }
      }
      const ov0 = Math.floor(cl / 2);
      for (let k = ov0 - 3; k <= ov0 + 1; k++) {
        const fd2 = new Date(cs.getTime() + k * 86400000);
        if (fd2.getFullYear() === yr && fd2.getMonth() === mo) {
          if (k === ov0) ovDays.add(fd2.getDate());
          else fertDays.add(fd2.getDate());
        }
      }
    }
  }

  const ci = getCycleInfo(profile.last_period_date ?? null, cl, pl);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.heading}>Tsükkel</Text>
          <Text style={styles.subheading}>
            {MONTHS[mo]} {yr}{ci ? ` · Päev ${ci.day} / ${ci.cycleLength}` : ''}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Calendar header */}
        <View style={styles.calHRow}>
          {WEEKDAYS.map((d) => <Text key={d} style={styles.calHDay}>{d}</Text>)}
        </View>
        {/* Calendar grid */}
        <View style={styles.calGrid}>
          {Array.from({ length: blank }, (_, i) => <View key={`b${i}`} style={styles.calCell} />)}
          {Array.from({ length: dim }, (_, i) => {
            const day = i + 1;
            const ds = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isLogged = loggedPeriodDates.has(ds);
            const isPred = predPeriod.has(day);
            const isOv = ovDays.has(day);
            const isFert = fertDays.has(day);
            const isToday = day === now.getDate();
            return (
              <View key={day} style={[
                styles.calCell,
                isLogged && styles.calPeriodLogged,
                !isLogged && isPred && styles.calPeriodPred,
                isOv && styles.calOv,
                isFert && !isOv && styles.calFert,
                isToday && styles.calToday,
              ]}>
                <Text style={[
                  styles.calDayTxt,
                  isLogged && { color: '#fff' },
                  isOv && { color: '#fff' },
                  isPred && !isLogged && { color: Colors.blush[400] },
                  isFert && !isOv && { color: Colors.green[800] },
                ]}>{day}</Text>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: Colors.blush[400], label: 'Menstruatsioon (märgitud)' },
            { color: Colors.blush[50], label: 'Ennustatud', border: Colors.blush[400] },
            { color: Colors.green[400], label: 'Ovulatsioon' },
            { color: Colors.green[200], label: 'Viljakas päev' },
          ].map((l, i) => (
            <View key={i} style={styles.legItem}>
              <View style={[styles.legDot, { backgroundColor: l.color, borderWidth: l.border ? 1 : 0, borderColor: l.border }]} />
              <Text style={styles.legTxt}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Log entry */}
        <Text style={styles.sectionLbl}>🌙 Tänane märge</Text>
        <Card>
          <Input label="Kuupäev" value={date} onChangeText={setDate} placeholder="aaaa-kk-pp" />

          <Text style={styles.fieldLabel}>Menstruatsioon täna?</Text>
          <View style={styles.periodBtns}>
            <Button variant={period ? 'blush' : 'outline'} size="sm" onPress={() => setPeriod(true)}>Jah</Button>
            <Button variant={!period ? 'dark' : 'outline'} size="sm" onPress={() => setPeriod(false)}>Ei</Button>
          </View>

          <Text style={styles.fieldLabel}>Tuju</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                activeOpacity={0.7}
                style={[styles.moodBtn, mood === m.key && styles.moodBtnOn]}
                onPress={() => setMood(m.key)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={styles.moodLbl}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Sümptomid</Text>
          <View style={styles.chips}>
            {SYMPTOM_CHIPS.map((chip) => (
              <Chip key={chip} label={chip} selected={symptoms.has(chip)} onPress={() => toggleSymptom(chip)} />
            ))}
          </View>

          <Button variant="blush" fullWidth onPress={handleSave} style={styles.saveBtn}>
            Salvesta tänane märge
          </Button>
        </Card>
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
  scroll: { flex: 1 },
  calHRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, marginBottom: 6, marginTop: 12 },
  calHDay: {
    flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.beige[400], paddingVertical: 4,
  },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.xl, gap: 6 },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    maxWidth: 38,
  },
  calDayTxt: { fontSize: 13, fontWeight: '600', color: Colors.beige[400] },
  calPeriodLogged: { backgroundColor: Colors.blush[400] },
  calPeriodPred: { backgroundColor: Colors.blush[50], borderWidth: 1.5, borderColor: Colors.blush[200] },
  calOv: { backgroundColor: Colors.green[400] },
  calFert: { backgroundColor: Colors.green[50], borderWidth: 1.5, borderColor: Colors.green[200] },
  calToday: { shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4, elevation: 4 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: Spacing.xl, marginTop: 12, marginBottom: 4 },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legDot: { width: 8, height: 8, borderRadius: 4 },
  legTxt: { fontSize: 10, color: Colors.beige[600] },
  sectionLbl: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase',
    color: Colors.beige[400], paddingHorizontal: Spacing.xl, marginBottom: 10, marginTop: 18,
  },
  fieldLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase',
    color: Colors.beige[600], marginBottom: 8, marginTop: 14,
  },
  periodBtns: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  moodRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  moodBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.beige[100],
    backgroundColor: Colors.beige[50], alignItems: 'center', justifyContent: 'center', paddingVertical: 8,
  },
  moodBtnOn: { borderColor: Colors.blush[400], backgroundColor: Colors.blush[50] },
  moodEmoji: { fontSize: 20 },
  moodLbl: { fontSize: 9, color: Colors.beige[400], marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  saveBtn: { marginTop: 8 },
});
