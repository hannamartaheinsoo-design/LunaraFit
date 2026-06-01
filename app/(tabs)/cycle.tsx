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
import { storage } from '../../lib/storage';
import { getCycleInfo, todayISO } from '../../lib/cycle';
import { Profile, CycleDay, Mood } from '../../types';

type MoodKey = 'bad' | 'neutral' | 'good' | 'great' | 'energized';
type EnergyKey = 'kurnatud' | 'väsinud' | 'normaalne' | 'energiline' | 'täis energiat';
type ContraKey = 'ei kasuta' | 'õigeaegselt' | 'hilinemisega';

const MOODS: { key: MoodKey; label: string; icon: any }[] = [
  { key: 'bad',       label: 'Halb',         icon: 'smile-bad' },
  { key: 'neutral',   label: 'Keskmine',      icon: 'smile-neutral' },
  { key: 'good',      label: 'Hea',           icon: 'smile-good' },
  { key: 'great',     label: 'Suurepärane',   icon: 'smile-great' },
  { key: 'energized', label: 'Ergas',         icon: 'energized' },
];

const ENERGY_OPTS: { key: EnergyKey; label: string }[] = [
  { key: 'kurnatud',      label: 'Kurnatud' },
  { key: 'väsinud',       label: 'Väsinud' },
  { key: 'normaalne',     label: 'Normaalne' },
  { key: 'energiline',    label: 'Energiline' },
  { key: 'täis energiat', label: 'Täis energiat' },
];

const FEELINGS    = ['Meeleolumuutused','Kontrollikaotus','Hea','Õnnelik','Kurb','Tundlik','Vihane','Enesekindel','Põnevil','Ärritunud','Ärev','Ebakindel','Masendunud','Enesekritiseeriv'];
const MIND        = ['Unustlik','Ajuudu','Rahulik','Stressis','Fokuseeritud','Hajameelne','Motiveeritud','Motiveerimata','Produktiivne','Ebaproduktiivne'];
const PAIN        = ['Valuta','Krambid','Ovulatsioonivalu','Rindade hellus','Peavalu','Migreen','Migreen auraga','Alaseljavalu','Üldine lihasvalu'];
const CRAVINGS    = ['Magus','Soolane','Rasvane','Vürtsikas','Süsivesikud','Värske'];
const SLEEP_CHIPS = ['Raske uinuda','Värske ärkamine','Väsinud ärkamine','Rahutu uni','Eredad unenäod','Öised higistamised'];
const DIGESTION   = ['Korras','Puhitus','Gaasid','Iiveldus','Oksendamine','Kõhulahtisus','Kõhukinnisus'];

const CONTRA_OPTS: { key: ContraKey; label: string; icon: any }[] = [
  { key: 'ei kasuta',     label: 'Ei kasuta',            icon: 'shield' },
  { key: 'õigeaegselt',   label: 'Õigeaegselt võetud',   icon: 'check' },
  { key: 'hilinemisega',  label: 'Hilinemisega võetud',  icon: 'sync' },
];

const WEEKDAYS = ['E', 'T', 'K', 'N', 'R', 'L', 'P'];
const MONTHS   = ['jaanuar','veebruar','märts','aprill','mai','juuni','juuli','august','september','oktoober','november','detsember'];
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
  const [profile,    setProfile]    = useState<Partial<Profile>>({});
  const [cycleDays,  setCycleDays]  = useState<CycleDay[]>([]);
  const [date,       setDate]       = useState(todayISO());
  const [period,     setPeriod]     = useState(false);
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

  // Reload every time the tab is focused — picks up profile changes from Settings
  useFocusEffect(useCallback(() => {
    (async () => {
      const [p, cd] = await Promise.all([storage.getProfile(), storage.getCycleDays()]);
      if (p) setProfile(p);
      setCycleDays(cd);
    })();
  }, []));

  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void, val: string) => {
    setFn((prev) => { const n = new Set(prev); n.has(val) ? n.delete(val) : n.add(val); return n; });
  };

  const handleSave = async () => {
    if (!date) { Alert.alert('', 'Palun vali kuupäev'); return; }
    const allSymptoms = [
      ...(energy ? [energy] : []),
      ...Array.from(feelings),
      ...Array.from(mind),
      ...Array.from(pain),
      ...Array.from(cravings),
      ...Array.from(sleepChips),
      ...Array.from(digestion),
    ];
    const entry: CycleDay = {
      id: date, user_id: 'local', date, period,
      mood: mood as Mood | null,
      symptoms: allSymptoms,
      created_at: new Date().toISOString(),
    };
    const updated = await storage.upsertCycleDay(entry);
    setCycleDays(updated);

    // If period logged, always update last_period_date so calendar
    // auto-calculates ovulation and fertile window immediately
    if (period) {
      const p = await storage.getProfile();
      const currentLast = p?.last_period_date;
      // Update if this is the first period log, or a more recent start date
      if (!currentLast || date >= currentLast) {
        const merged = { ...(p ?? {}), last_period_date: date };
        await storage.setProfile(merged);
        setProfile(merged);
      }
    }
    setPeriod(false); setMood(null); setEnergy(null); setContra(null);
    setFeelings(new Set()); setMind(new Set()); setPain(new Set());
    setCravings(new Set()); setSleepChips(new Set()); setDigestion(new Set());
    setSleepHours('');
    Alert.alert('', 'Tsüklimärge salvestatud ✓');
  };

  // Calendar calculations for displayed month
  const cl = profile.cycle_length ?? 28;
  const pl = profile.period_length ?? 5;
  const dim   = new Date(displayYear, displayMonth + 1, 0).getDate();
  const blank = (new Date(displayYear, displayMonth, 1).getDay() + 6) % 7;
  const loggedPeriodDates = new Set(cycleDays.filter((d) => d.period).map((d) => d.date));
  const predPeriod = new Set<number>();
  const fertDays   = new Set<number>();
  const ovDays     = new Set<number>();

  if (profile.last_period_date) {
    const last = new Date(profile.last_period_date);
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

  const ci = getCycleInfo(profile.last_period_date ?? null, cl, pl);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.heading}>Tsükkel</Text>
          {ci && <Text style={styles.subheading}>Päev {ci.day} / {ci.cycleLength}</Text>}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Month navigation */}
        <View style={styles.calNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.calNavBtn} activeOpacity={0.7}>
            <Text style={styles.calNavArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.calNavTitle}>
            {MONTHS[displayMonth].charAt(0).toUpperCase() + MONTHS[displayMonth].slice(1)} {displayYear}
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
            const isLogged = loggedPeriodDates.has(ds);
            const isPred   = predPeriod.has(day);
            const isOv     = ovDays.has(day);
            const isFert   = fertDays.has(day);
            const isToday  = day === now.getDate() && displayMonth === now.getMonth() && displayYear === now.getFullYear();
            return (
              <View key={day} style={styles.calCol}>
                <View style={[
                  styles.calCircle,
                  isLogged && styles.calPeriodLogged,
                  !isLogged && isPred && styles.calPeriodPred,
                  isOv && styles.calOv,
                  isFert && !isOv && styles.calFert,
                  isToday && styles.calToday,
                ]}>
                  <Text style={[
                    styles.calDayTxt,
                    isLogged && { color: '#fff' },
                    isOv     && { color: '#fff' },
                    isPred && !isLogged && { color: Colors.blush[600] },
                    isFert && !isOv    && { color: Colors.green[800] },
                  ]}>{day}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: Colors.blush[600], label: 'Menstruatsioon (märgitud)' },
            { color: Colors.blush[50],  label: 'Ennustatud', border: Colors.blush[200] },
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
        <View style={styles.sectionLblRow}>
          <Icon name="drop" size={12} color={Colors.beige[400]} />
          <Text style={styles.sectionLbl}>Tänane märge</Text>
        </View>

        <Card>
          <Input label="Kuupäev" value={date} onChangeText={setDate} placeholder="aaaa-kk-pp" />

          <Text style={styles.fieldLabel}>Menstruatsioon täna?</Text>
          <View style={styles.rowGap8}>
            <Button variant={period ? 'blush' : 'outline'} size="sm" onPress={() => setPeriod(true)}>Jah</Button>
            <Button variant={!period ? 'dark' : 'outline'} size="sm" onPress={() => setPeriod(false)}>Ei</Button>
          </View>

          {/* Mood */}
          <CatHeader icon="smile-good" label="Tuju" />
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
          <CatHeader icon="energized" label="Energia" />
          <View style={styles.chipGrid}>
            {ENERGY_OPTS.map((e) => (
              <Chip key={e.key} label={e.label} selected={energy === e.key} onPress={() => setEnergy(energy === e.key ? null : e.key)} />
            ))}
          </View>

          {/* Feelings */}
          <CatHeader icon="heart" label="Tunded" />
          <View style={styles.chipGrid}>
            {FEELINGS.map((f) => (
              <Chip key={f} label={f} selected={feelings.has(f)} onPress={() => toggle(feelings, setFeelings, f)} />
            ))}
          </View>

          {/* Mind */}
          <CatHeader icon="brain" label="Meeleseisund" />
          <View style={styles.chipGrid}>
            {MIND.map((f) => (
              <Chip key={f} label={f} selected={mind.has(f)} onPress={() => toggle(mind, setMind, f)} />
            ))}
          </View>

          {/* Pain */}
          <CatHeader icon="pain" label="Valu" />
          <View style={styles.chipGrid}>
            {PAIN.map((f) => (
              <Chip key={f} label={f} selected={pain.has(f)} onPress={() => toggle(pain, setPain, f)} />
            ))}
          </View>

          {/* Cravings */}
          <CatHeader icon="craving" label="Isu" />
          <View style={styles.chipGrid}>
            {CRAVINGS.map((f) => (
              <Chip key={f} label={f} selected={cravings.has(f)} onPress={() => toggle(cravings, setCravings, f)} />
            ))}
          </View>

          {/* Sleep — Pro only */}
          <CatHeader icon="sleep" label="Unekvaliteet" badge="PRO" />
          <View style={styles.sleepSection}>
            <View style={profile.plan === 'free' || !profile.plan ? styles.lockedContent : undefined}>
              <View style={styles.chipGrid}>
                {SLEEP_CHIPS.map((f) => (
                  <Chip key={f} label={f} selected={sleepChips.has(f)} onPress={() => toggle(sleepChips, setSleepChips, f)} />
                ))}
              </View>
              <View style={styles.sleepHrsRow}>
                <Text style={styles.sleepHrsLbl}>Unetunnid:</Text>
                <TextInput
                  style={styles.sleepHrsInput}
                  placeholder="nt 7.5"
                  placeholderTextColor={Colors.beige[200]}
                  keyboardType="decimal-pad"
                  value={sleepHours}
                  onChangeText={setSleepHours}
                  editable={!!(profile.plan && profile.plan !== 'free')}
                />
              </View>
            </View>
            {(profile.plan === 'free' || !profile.plan) && (
              <View style={styles.lockOverlay}>
                <Icon name="lock" size={22} color={Colors.beige[400]} />
                <Text style={styles.lockTxt}>Saadaval Pro paketiga</Text>
              </View>
            )}
          </View>

          {/* Digestion */}
          <CatHeader icon="digestion" label="Seedimine" />
          <View style={styles.chipGrid}>
            {DIGESTION.map((f) => (
              <Chip key={f} label={f} selected={digestion.has(f)} onPress={() => toggle(digestion, setDigestion, f)} />
            ))}
          </View>

          {/* Contraception */}
          <CatHeader icon="pill" label="Rasestumisvastased" />
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
            Salvesta tänane märge
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
  calPeriodLogged:  { backgroundColor: Colors.blush[600] },   // deep red — clearly logged
  calPeriodPred:    { backgroundColor: Colors.blush[50], borderWidth: 1.5, borderColor: Colors.blush[200] },  // light pink — predicted
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
