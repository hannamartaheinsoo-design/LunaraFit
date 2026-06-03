import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Chip } from '../../components/ui/Chip';
import { Icon } from '../../components/ui/Icon';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getCycleInfo, todayISO } from '../../lib/cycle';
import { Profile, CycleDay, Mood } from '../../types';
import { useTranslation } from '../../lib/LangContext';

type MoodKey = 'bad' | 'neutral' | 'good' | 'great' | 'energized';
type EnergyKey = 'et0' | 'et1' | 'et2' | 'et3' | 'et4';
type ContraKey = 'none' | 'taken' | 'late';

const MOOD_ICONS: { key: MoodKey; icon: any }[] = [
  { key: 'bad',       icon: 'smile-bad' },
  { key: 'neutral',   icon: 'smile-neutral' },
  { key: 'good',      icon: 'smile-good' },
  { key: 'great',     icon: 'smile-great' },
  { key: 'energized', icon: 'energized' },
];

const ENERGY_KEYS: EnergyKey[] = ['et0','et1','et2','et3','et4'];
const CONTRA_ICONS = ['shield','check','sync'];
const CONTRA_KEYS: ContraKey[] = ['none','taken','late'];

const CAL_H_PADDING = 16;

function CatHeader({ icon, label, badge }: { icon: any; label: string; badge?: string }) {
  return (
    <View style={styles.catHdr}>
      <Icon name={icon} size={13} color={Colors.beige[400]} strokeWidth={1.5} />
      <Text style={styles.catHdrTxt}>{label}</Text>
      {badge && <View style={styles.proBadge}><Text style={styles.proBadgeTxt}>{badge}</Text></View>}
    </View>
  );
}

export default function CycleScreen() {
  const { lang, t, tArr } = useTranslation();
  const profile    = useQuery(api.profiles.get);
  const cycleDays  = useQuery(api.cycleDays.list) ?? [];
  const upsertDay    = useMutation(api.cycleDays.upsert);
  const upsertProf   = useMutation(api.profiles.upsert);
  const fillGap      = useMutation(api.cycleDays.fillPeriodGap);
  const [date,       setDate]       = useState(todayISO());
  const [period,     setPeriod]     = useState(false);
  const [spotting,   setSpotting]   = useState(false);
  const [mood,       setMood]       = useState<MoodKey | null>(null);
  const [energy,     setEnergy]     = useState<EnergyKey | null>(null);
  const [contra,     setContra]     = useState<ContraKey | null>(null);
  const [feelings,   setFeelings]   = useState<Set<string>>(new Set());
  const [mind,       setMind]       = useState<Set<string>>(new Set());
  const [pain,       setPain]       = useState<Set<string>>(new Set());
  const [cravings,   setCravings]   = useState<Set<string>>(new Set());
  const [sleepChips, setSleepChips] = useState<Set<string>>(new Set());
  const [sleepHours, setSleepHours] = useState('');
  const [digestion,  setDigestion]  = useState<Set<string>>(new Set());

  const now = new Date();
  const [displayYear,  setDisplayYear]  = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth());

  const goToPrevMonth = () => {
    if (displayMonth === 0) { setDisplayMonth(11); setDisplayYear((y) => y - 1); }
    else setDisplayMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (displayMonth === 11) { setDisplayMonth(0); setDisplayYear((y) => y + 1); }
    else setDisplayMonth((m) => m + 1);
  };

  // Convex queries are reactive — no manual reload needed

  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void, val: string) => {
    setFn((prev) => { const n = new Set(prev); n.has(val) ? n.delete(val) : n.add(val); return n; });
  };

  const handleSave = async () => {
    if (!date) { Alert.alert('', t('c.err.date')); return; }
    const allSymptoms = [
      ...(energy ? [energy] : []),
      ...Array.from(feelings),
      ...Array.from(mind),
      ...Array.from(pain),
      ...Array.from(cravings),
      ...Array.from(sleepChips),
      ...Array.from(digestion),
    ];
    await upsertDay({
      date, period,
      spotting: spotting || undefined,
      mood: (mood as Mood) ?? undefined,
      symptoms: allSymptoms,
    });

    // Auto-fill gap days between this period day and the nearest other period day.
    // Only runs for actual period days (not spotting-only).
    if (period) {
      const otherPeriodDates = cycleDays
        .filter((d) => d.period && d.date !== date)
        .map((d) => d.date)
        .sort();

      const dateMs = new Date(date).getTime();
      const GAP_LIMIT = 6; // only fill gaps of up to 6 days

      for (const other of otherPeriodDates) {
        const otherMs = new Date(other).getTime();
        const diffDays = Math.abs((dateMs - otherMs) / 86400000);
        if (diffDays > 1 && diffDays <= GAP_LIMIT) {
          const start = date < other ? date : other;
          const end   = date < other ? other : date;
          const gapDates: string[] = [];
          let cur = new Date(new Date(start).getTime() + 86400000);
          const endD = new Date(end);
          while (cur < endD) {
            gapDates.push(cur.toISOString().slice(0, 10));
            cur = new Date(cur.getTime() + 86400000);
          }
          if (gapDates.length > 0) await fillGap({ dates: gapDates });
        }
      }
    }

    // Only recalculate cycle predictions when the period phase ends.
    // Logging period=true just marks the day; predictions don't shift until
    // the user logs their first no-period day after a streak.
    if (!period) {
      // Find all period days strictly before this date, sorted newest-first
      const prevPeriodDays = cycleDays
        .filter((d) => d.period && d.date < date)
        .sort((a, b) => b.date.localeCompare(a.date));

      if (prevPeriodDays.length > 0) {
        // Walk the sorted list to find where the consecutive streak starts
        let streakStart = prevPeriodDays[0].date;
        for (let i = 1; i < prevPeriodDays.length; i++) {
          const newer = new Date(prevPeriodDays[i - 1].date).getTime();
          const older = new Date(prevPeriodDays[i].date).getTime();
          if ((newer - older) / 86400000 <= 1) {
            streakStart = prevPeriodDays[i].date;
          } else {
            break;
          }
        }
        const currentLast = profile?.last_period_date;
        if (!currentLast || streakStart >= currentLast) {
          await upsertProf({ last_period_date: streakStart });
        }
      }
    }

    setPeriod(false); setSpotting(false); setMood(null); setEnergy(null); setContra(null);
    setFeelings(new Set()); setMind(new Set()); setPain(new Set());
    setCravings(new Set()); setSleepChips(new Set()); setDigestion(new Set());
    setSleepHours('');
    Alert.alert('', t('c.saved'));
  };

  // Calendar calculations for displayed month
  const cl = profile?.cycle_length ?? 28;
  const pl = profile?.period_length ?? 5;
  const dim   = new Date(displayYear, displayMonth + 1, 0).getDate();
  const blank = (new Date(displayYear, displayMonth, 1).getDay() + 6) % 7;
  const loggedPeriodDates  = new Set(cycleDays.filter((d) => d.period).map((d) => d.date));
  const loggedSpottingDates = new Set(cycleDays.filter((d) => d.spotting && !d.period).map((d) => d.date));
  const predPeriod = new Set<number>();
  const fertDays   = new Set<number>();
  const ovDays     = new Set<number>();

  if (profile?.last_period_date) {
    const last = new Date(profile?.last_period_date);
    for (let i = 0; i <= 6; i++) {
      const cs = new Date(last.getTime() + i * cl * 86400000);
      for (let j = 0; j < pl; j++) {
        const pd = new Date(cs.getTime() + j * 86400000);
        if (pd.getFullYear() === displayYear && pd.getMonth() === displayMonth) {
          const ds = pd.toISOString().slice(0, 10);
          if (!loggedPeriodDates.has(ds)) predPeriod.add(pd.getDate());
        }
      }
      const ov0 = Math.floor(cl / 2);
      for (let k = ov0 - 3; k <= ov0 + 1; k++) {
        const fd2 = new Date(cs.getTime() + k * 86400000);
        if (fd2.getFullYear() === displayYear && fd2.getMonth() === displayMonth) {
          if (k === ov0) ovDays.add(fd2.getDate());
          else fertDays.add(fd2.getDate());
        }
      }
    }
  }

  const ci = getCycleInfo(profile?.last_period_date ?? null, cl, pl);
  const WEEKDAYS = tArr('c.cal.weekdays');
  const MONTHS = tArr('c.cal.months');
  const MOODS = MOOD_ICONS.map((m, i) => ({ ...m, label: t(`c.mood.${m.key}` as any) }));
  const ENERGY_OPTS = ENERGY_KEYS.map((k, i) => ({ key: k, label: tArr('c.energy')[i] ?? k }));
  const FEELINGS = tArr('c.feelings');
  const MIND = tArr('c.mind');
  const PAIN = tArr('c.pain');
  const CRAVINGS = tArr('c.cravings');
  const SLEEP_CHIPS = tArr('c.sleep.chips');
  const DIGESTION = tArr('c.digestion');
  const CONTRA_OPTS = CONTRA_KEYS.map((k, i) => ({ key: k, label: t(`c.contra.${k}` as any), icon: CONTRA_ICONS[i] }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.heading}>{t('c.heading')}</Text>
          {ci && <Text style={styles.subheading}>{t('c.day')} {ci.day} / {ci.cycleLength}</Text>}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Month navigation */}
        <View style={styles.calNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.calNavBtn} activeOpacity={0.7}>
            <Text style={styles.calNavArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.calNavTitle}>
            {(MONTHS[displayMonth] ?? '').charAt(0).toUpperCase() + (MONTHS[displayMonth] ?? '').slice(1)} {displayYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.calNavBtn} activeOpacity={0.7}>
            <Text style={styles.calNavArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Weekday header — once at top */}
        <View style={styles.calHRow}>
          {WEEKDAYS.map((d) => (
            <View key={d} style={styles.calCol}>
              <Text style={styles.calHDay}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calGrid}>
          {Array.from({ length: blank }, (_, i) => (
            <View key={`b${i}`} style={styles.calCol} />
          ))}
          {Array.from({ length: dim }, (_, i) => {
            const day = i + 1;
            const ds = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isLogged   = loggedPeriodDates.has(ds);
            const isSpotting = loggedSpottingDates.has(ds);
            const isPred     = predPeriod.has(day);
            const isOv       = ovDays.has(day);
            const isFert     = fertDays.has(day);
            const isToday    = day === now.getDate() && displayMonth === now.getMonth() && displayYear === now.getFullYear();
            return (
              <View key={day} style={styles.calCol}>
                <View style={[
                  styles.calCircle,
                  isLogged    && styles.calPeriodLogged,
                  isSpotting  && !isLogged && styles.calSpotting,
                  !isLogged && !isSpotting && isPred && styles.calPeriodPred,
                  isOv && !isLogged && !isSpotting && styles.calOv,
                  isFert && !isOv && !isLogged && !isSpotting && styles.calFert,
                  isToday && styles.calToday,
                ]}>
                  <Text style={[
                    styles.calDayTxt,
                    isLogged   && { color: '#fff' },
                    isSpotting && !isLogged && { color: Colors.blush[800] },
                    isOv       && !isLogged && !isSpotting && { color: '#fff' },
                    isPred     && !isLogged && !isSpotting && { color: Colors.blush[600] },
                    isFert     && !isOv && !isLogged && !isSpotting && { color: Colors.green[800] },
                  ]}>{day}</Text>
                </View>
                {isSpotting && !isLogged && <View style={styles.spottingDot} />}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: Colors.blush[600], label: t('c.legend.logged') },
            { color: Colors.blush[50],  label: t('c.legend.pred'), border: Colors.blush[200] },
            { color: Colors.blush[200], label: t('c.legend.spotting'), border: Colors.blush[300] },
            { color: Colors.green[400], label: t('c.legend.ovulation') },
            { color: Colors.green[200], label: t('c.legend.fertile') },
          ].map((l, i) => (
            <View key={i} style={styles.legItem}>
              <View style={[styles.legDot, { backgroundColor: l.color, borderWidth: l.border ? 1 : 0, borderColor: l.border }]} />
              <Text style={styles.legTxt}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Log entry */}
        <View style={styles.sectionLblRow}>
          <Icon name="drop" size={12} color={Colors.beige[400]} />
          <Text style={styles.sectionLbl}>{t('c.cal.today')}</Text>
        </View>

        <Card>
          <Input label={t('c.date.lbl')} value={date} onChangeText={setDate} placeholder={lang === 'en' ? 'yyyy-mm-dd' : 'aaaa-kk-pp'} />

          <Text style={styles.fieldLabel}>{t('c.period.lbl')}</Text>
          <View style={styles.rowGap8}>
            <Button variant={period ? 'blush' : 'outline'} size="sm" onPress={() => { setPeriod(true); setSpotting(false); }}>{t('c.period.yes')}</Button>
            <Button variant={!period ? 'dark' : 'outline'} size="sm" onPress={() => setPeriod(false)}>{t('c.period.no')}</Button>
          </View>

          <Text style={styles.fieldLabel}>{t('c.spotting.lbl')}</Text>
          <View style={styles.rowGap8}>
            <Button variant={spotting ? 'blush' : 'outline'} size="sm" onPress={() => { setSpotting(true); setPeriod(false); }}>{t('c.spotting.yes')}</Button>
            <Button variant={!spotting ? 'dark' : 'outline'} size="sm" onPress={() => setSpotting(false)}>{t('c.spotting.no')}</Button>
          </View>

          {/* Mood */}
          <CatHeader icon="smile-good" label={t('c.mood.lbl')} />
          <View style={styles.chipGrid}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.key} activeOpacity={0.7}
                style={[styles.chip, mood === m.key && styles.chipOn]}
                onPress={() => setMood(mood === m.key ? null : m.key)}
              >
                <Icon name={m.icon} size={14} color={mood === m.key ? Colors.blush[600] : Colors.beige[400]} strokeWidth={1.5} />
                <Text style={[styles.chipLbl, mood === m.key && styles.chipLblOn]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Energy */}
          <CatHeader icon="energized" label={t('c.energy.lbl')} />
          <View style={styles.chipGrid}>
            {ENERGY_OPTS.map((e) => (
              <Chip key={e.key} label={e.label} selected={energy === e.key} onPress={() => setEnergy(energy === e.key ? null : e.key)} />
            ))}
          </View>

          {/* Feelings */}
          <CatHeader icon="heart" label={t('c.feelings.lbl')} />
          <View style={styles.chipGrid}>
            {FEELINGS.map((f, i) => (
              <Chip key={`${f}-${i}`} label={f} selected={feelings.has(f)} onPress={() => toggle(feelings, setFeelings, f)} />
            ))}
          </View>

          {/* Mind */}
          <CatHeader icon="brain" label={t('c.mind.lbl')} />
          <View style={styles.chipGrid}>
            {MIND.map((f, i) => (
              <Chip key={`${f}-${i}`} label={f} selected={mind.has(f)} onPress={() => toggle(mind, setMind, f)} />
            ))}
          </View>

          {/* Pain */}
          <CatHeader icon="pain" label={t('c.pain.lbl')} />
          <View style={styles.chipGrid}>
            {PAIN.map((f, i) => (
              <Chip key={`${f}-${i}`} label={f} selected={pain.has(f)} onPress={() => toggle(pain, setPain, f)} />
            ))}
          </View>

          {/* Cravings */}
          <CatHeader icon="craving" label={t('c.cravings.lbl')} />
          <View style={styles.chipGrid}>
            {CRAVINGS.map((f, i) => (
              <Chip key={`${f}-${i}`} label={f} selected={cravings.has(f)} onPress={() => toggle(cravings, setCravings, f)} />
            ))}
          </View>

          {/* Sleep — Pro only */}
          <CatHeader icon="sleep" label={t('c.sleep.lbl')} badge="PRO" />
          <View style={styles.sleepSection}>
            <View style={profile?.plan === 'free' || !profile?.plan ? styles.lockedContent : undefined}>
              <View style={styles.chipGrid}>
                {SLEEP_CHIPS.map((f, i) => (
                  <Chip key={`${f}-${i}`} label={f} selected={sleepChips.has(f)} onPress={() => toggle(sleepChips, setSleepChips, f)} />
                ))}
              </View>
              <View style={styles.sleepHrsRow}>
                <Text style={styles.sleepHrsLbl}>{t('c.sleep.hrs')}</Text>
                <TextInput
                  style={styles.sleepHrsInput}
                  placeholder={t('c.sleep.hrs.ph')}
                  placeholderTextColor={Colors.beige[200]}
                  keyboardType="decimal-pad"
                  value={sleepHours}
                  onChangeText={setSleepHours}
                  editable={!!(profile?.plan && profile?.plan !== 'free')}
                />
              </View>
            </View>
            {(profile?.plan === 'free' || !profile?.plan) && (
              <View style={styles.lockOverlay}>
                <Icon name="lock" size={22} color={Colors.beige[400]} />
                <Text style={styles.lockTxt}>{t('c.sleep.lock')}</Text>
              </View>
            )}
          </View>

          {/* Digestion */}
          <CatHeader icon="digestion" label={t('c.digestion.lbl')} />
          <View style={styles.chipGrid}>
            {DIGESTION.map((f, i) => (
              <Chip key={`${f}-${i}`} label={f} selected={digestion.has(f)} onPress={() => toggle(digestion, setDigestion, f)} />
            ))}
          </View>

          {/* Contraception */}
          <CatHeader icon="pill" label={t('c.contra.lbl')} />
          <View style={styles.contraRow}>
            {CONTRA_OPTS.map((c) => (
              <TouchableOpacity
                key={c.key} activeOpacity={0.7}
                style={[styles.contraBtn, contra === c.key && styles.contraBtnOn]}
                onPress={() => setContra(contra === c.key ? null : c.key)}
              >
                <Icon name={c.icon} size={22} color={contra === c.key ? Colors.blush[500] : Colors.beige[400]} strokeWidth={1.5} />
                <Text style={[styles.contraLbl, contra === c.key && { color: Colors.blush[800] }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button variant="blush" fullWidth onPress={handleSave} style={styles.saveBtn}>
            {t('c.save')}
          </Button>
        </Card>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.cream },
  topBar:  {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.beige[50],
  },
  heading:    { fontFamily: Fonts.serifSemiBold, fontSize: 26, color: Colors.beige[800] },
  subheading: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], marginTop: 2 },
  scroll: { flex: 1 },

  // Month navigation
  calNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: 10,
  },
  calNavBtn:   { padding: 8 },
  calNavArrow: { fontFamily: Fonts.serif, fontSize: 28, color: Colors.beige[600], lineHeight: 30 },
  calNavTitle: { fontFamily: Fonts.serifSemiBold, fontSize: 18, color: Colors.beige[800] },

  // Calendar header (E T K N R L P — once at top)
  calHRow: {
    flexDirection: 'row', paddingHorizontal: CAL_H_PADDING, marginBottom: 2,
  },
  calHDay: {
    width: `${100 / 7}%` as any, textAlign: 'center',
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1,
    textTransform: 'uppercase', color: Colors.beige[400], paddingVertical: 6,
  },

  // Calendar grid
  calGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: CAL_H_PADDING,
  },
  calCol: {
    width: `${100 / 7}%` as any, alignItems: 'center', paddingVertical: 3,
  },
  calCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  calDayTxt:        { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.beige[400] },
  calPeriodLogged:  { backgroundColor: Colors.blush[600] },
  calPeriodPred:    { backgroundColor: Colors.blush[50], borderWidth: 1.5, borderColor: Colors.blush[200] },
  calSpotting:      { backgroundColor: Colors.blush[50], borderWidth: 1.5, borderColor: Colors.blush[300], borderStyle: 'dashed' },
  spottingDot:      { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.blush[400], marginTop: 1 },
  calOv:            { backgroundColor: Colors.green[400] },
  calFert:          { backgroundColor: Colors.green[50], borderWidth: 1.5, borderColor: Colors.green[200] },
  calToday:         { shadowColor: Colors.blush[400], shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4, elevation: 4 },

  // Legend
  legend:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: Spacing.xl, marginTop: 12, marginBottom: 4 },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legDot:  { width: 8, height: 8, borderRadius: 4 },
  legTxt:  { fontFamily: Fonts.sans, fontSize: 10, color: Colors.beige[600] },

  // Section label
  sectionLblRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.xl, marginBottom: 10, marginTop: 18,
  },
  sectionLbl: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.2,
    textTransform: 'uppercase', color: Colors.beige[400],
  },

  // Category header
  catHdr: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, marginTop: 16 },
  catHdrTxt: {
    fontFamily: Fonts.sansSemiBold, fontSize: 11,
    color: Colors.beige[600], textTransform: 'uppercase', letterSpacing: 0.7,
  },
  proBadge:    { backgroundColor: Colors.blush[400], borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  proBadgeTxt: { fontFamily: Fonts.sansBold, fontSize: 9, color: '#fff', letterSpacing: 0.4, textTransform: 'uppercase' },

  fieldLabel: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1,
    textTransform: 'uppercase', color: Colors.beige[600], marginBottom: 8, marginTop: 14,
  },
  rowGap8: { flexDirection: 'row', gap: 8, marginBottom: 14 },

  // Chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 6 },
  chip:     {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 7, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1.5, borderColor: Colors.beige[100],
    backgroundColor: Colors.cream,
  },
  chipOn:    { backgroundColor: Colors.blush[50], borderColor: Colors.blush[400] },
  chipLbl:   { fontFamily: Fonts.sans, fontSize: 12, color: Colors.beige[600] },
  chipLblOn: { fontFamily: Fonts.sansSemiBold, color: Colors.blush[800] },

  // Sleep
  sleepSection:  { position: 'relative', marginBottom: 6 },
  lockedContent: { opacity: 0.22 },
  sleepHrsRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  sleepHrsLbl:   { fontFamily: Fonts.sansSemiBold, fontSize: 11, color: Colors.beige[600] },
  sleepHrsInput: {
    maxWidth: 100, paddingVertical: 9, paddingHorizontal: 12,
    borderWidth: 1.5, borderColor: Colors.beige[100], borderRadius: 9,
    backgroundColor: Colors.cream, fontFamily: Fonts.sans, fontSize: 14,
    color: Colors.beige[800],
  },
  lockOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  lockTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.beige[600] },

  // Contraception
  contraRow:   { flexDirection: 'row', gap: 6, marginBottom: 14 },
  contraBtn:   {
    flex: 1, minHeight: 76, borderRadius: 12, borderWidth: 1.5,
    borderColor: Colors.beige[200], backgroundColor: Colors.cream,
    alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 6,
  },
  contraBtnOn: { backgroundColor: Colors.blush[50], borderColor: Colors.blush[400] },
  contraLbl:   {
    fontFamily: Fonts.sansSemiBold, fontSize: 10,
    color: Colors.beige[500], lineHeight: 14, textAlign: 'center',
  },

  saveBtn: { marginTop: 16 },
});
