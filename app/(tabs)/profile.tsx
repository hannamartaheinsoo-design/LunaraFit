import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../lib/authContext';
import { Colors, Fonts, Spacing } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Toggle';
import { storage } from '../../lib/storage';
import { formatDate, PHASE_LABELS } from '../../lib/cycle';
import { Profile, Workout } from '../../types';

const PLAN_NAMES = { free: 'Tasuta pakett', monthly: 'Pro — kuupakett', yearly: 'Pro — aastapakett' };
const PLAN_SUBS = {
  free: 'Uuenda Pro-le täielike ülevaadete jaoks',
  monthly: 'Kõik Pro funktsioonid aktiivsed',
  yearly: 'Kõik Pro funktsioonid aktiivsed',
};

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [name, setName] = useState('');
  const [cycleLen, setCycleLen] = useState('28');
  const [periodLen, setPeriodLen] = useState('5');
  const [lastPeriod, setLastPeriod] = useState('');
  const [sync, setSync] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [p, ws] = await Promise.all([storage.getProfile(), storage.getWorkouts()]);
      if (p) {
        setProfile(p);
        setName(p.name ?? '');
        setCycleLen(String(p.cycle_length ?? 28));
        setPeriodLen(String(p.period_length ?? 5));
        setLastPeriod(p.last_period_date ?? '');
      }
      setWorkouts(ws);
    })();
  }, []);

  const handleSave = async () => {
    const updated: Partial<Profile> = {
      ...profile,
      name: name.trim(),
      cycle_length: parseInt(cycleLen) || 28,
      period_length: parseInt(periodLen) || 5,
      last_period_date: lastPeriod || null,
    };
    await storage.setProfile(updated);
    setProfile(updated);
    Alert.alert('', 'Profiil salvestatud ✓');
  };

  const handleExport = async () => {
    const rows = ['Kuupäev,Treeningkava,Harjutus,Seeriad,Kordused,kg,Faas'];
    workouts.forEach((w) => {
      w.exercises.forEach((e) => {
        rows.push([w.date, `"${w.name}"`, `"${e.name}"`, e.sets, e.reps, e.weight_kg, w.phase].join(','));
      });
    });
    await Share.share({ message: rows.join('\n'), title: 'LunaraFit andmed' });
  };

  const handleClearAll = () => {
    Alert.alert('Kustuta kõik andmed?', 'Seda ei saa tagasi võtta.', [
      { text: 'Tühista', style: 'cancel' },
      {
        text: 'Kustuta', style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  // Library: group workouts by name
  const library: Record<string, Workout[]> = {};
  workouts.forEach((w) => { if (!library[w.name]) library[w.name] = []; library[w.name].push(w); });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>Profiil</Text>
        <Text style={styles.subheading}>Seaded · Privaatsus · Andmed</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Plan card */}
        <View style={styles.sectionLblRow}><Icon name="star" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>Sinu pakett</Text></View>
        <Card>
          <View style={styles.planRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>{PLAN_NAMES[profile.plan ?? 'free']}</Text>
              <Text style={styles.planSub}>{PLAN_SUBS[profile.plan ?? 'free']}</Text>
            </View>
            {(!profile.plan || profile.plan === 'free') && (
              <Button variant="blush" size="sm" onPress={() => router.push('/(onboarding)/plan')}>
                Uuenda
              </Button>
            )}
          </View>
        </Card>

        {/* Personal data */}
        <View style={styles.sectionLblRow}><Icon name="person" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>Isiklikud andmed</Text></View>
        <Card>
          <Input label="Nimi" value={name} onChangeText={setName} placeholder="Sinu nimi" />
          <View style={styles.row}>
            <Input label="Tsükli pikkus" value={cycleLen} onChangeText={setCycleLen} placeholder="28" keyboardType="number-pad" containerStyle={styles.half} />
            <Input label="Perioodi pikkus" value={periodLen} onChangeText={setPeriodLen} placeholder="5" keyboardType="number-pad" containerStyle={styles.half} />
          </View>
          <Input label="Viimase menstruatsiooni esimene päev" value={lastPeriod} onChangeText={setLastPeriod} placeholder="aaaa-kk-pp" />
          <Button variant="dark" fullWidth onPress={handleSave} style={styles.saveBtn}>
            Salvesta muudatused
          </Button>
        </Card>

        {/* Privacy */}
        <View style={styles.sectionLblRow}><Icon name="lock" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>Privaatsus</Text></View>
        <Card>
          {[
            { title: 'Sünkrooni kõigis seadmetes', sub: 'Hoia andmed ajakohasena', val: sync, set: setSync },
            { title: 'Õrnad meeldetuletused', sub: 'Õrn meeldetuletus märgete lisamiseks', val: reminders, set: setReminders },
            { title: 'Anonüümne andmeanalüüs', sub: 'Aita rakendust parendada', val: analytics, set: setAnalytics },
          ].map((item, i) => (
            <View key={i} style={[styles.toggleRow, i === 2 && { borderBottomWidth: 0 }]}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>{item.title}</Text>
                <Text style={styles.toggleSub}>{item.sub}</Text>
              </View>
              <Toggle value={item.val} onChange={item.set} />
            </View>
          ))}
        </Card>

        {/* Library */}
        <View style={styles.sectionLblRow}><Icon name="folder" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>Treeningute logiraamat</Text></View>
        {Object.keys(library).length === 0 ? (
          <Text style={styles.empty}>Treeninguid pole veel lisatud.</Text>
        ) : (
          Object.keys(library).map((folderName) => {
            const sessions = library[folderName];
            const isOpen = openFolder === folderName;
            return (
              <View key={folderName} style={styles.folder}>
                <Button
                  variant="ghost"
                  fullWidth
                  onPress={() => setOpenFolder(isOpen ? null : folderName)}
                  style={styles.folderHead}
                >
                  {folderName}  ·  {sessions.length} korda  {isOpen ? '▲' : '▼'}
                </Button>
                {isOpen && sessions.map((w) => (
                  <View key={w.id} style={styles.sessEntry}>
                    <Text style={styles.sessDate}>{formatDate(w.date)} · {PHASE_LABELS[w.phase]}</Text>
                    {w.exercises.map((e, i) => (
                      <View key={i} style={styles.exLine}>
                        <Text style={styles.exName}>{e.name}</Text>
                        <Text style={styles.exStats}>{e.sets}×{e.reps}{e.weight_kg ? ` · ${e.weight_kg} kg` : ''}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );
          })
        )}

        {/* Data */}
        <View style={[styles.sectionLblRow, { marginTop: 20 }]}><Icon name="download" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>Andmed</Text></View>
        <Card>
          <Button variant="outline" fullWidth onPress={handleExport} style={{ marginBottom: 8 }}>
            Ekspordi kõik andmed (CSV)
          </Button>
          <Button variant="danger" fullWidth onPress={handleClearAll}>
            Kustuta kõik andmed
          </Button>
          <Text style={styles.dataNote}>Sinu andmed on salvestatud ainult selles seadmes.</Text>
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
  heading: { fontFamily: Fonts.serifSemiBold, fontSize: 26, color: Colors.beige[800] },
  subheading: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], marginTop: 2 },
  scroll: { flex: 1, paddingTop: 12 },
  sectionLblRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.xl, marginBottom: 10, marginTop: 20,
  },
  sectionLbl: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.2,
    textTransform: 'uppercase', color: Colors.beige[400],
  },
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planName: { fontFamily: Fonts.sansSemiBold, fontSize: 15, color: Colors.beige[800] },
  planSub: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], marginTop: 3 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  saveBtn: { marginTop: 16 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.beige[50],
  },
  toggleInfo: { flex: 1, gap: 2 },
  toggleTitle: { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.beige[800] },
  toggleSub: { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[600] },
  folder: { marginHorizontal: Spacing.xl, marginBottom: 10 },
  folderHead: { borderRadius: 20 },
  sessEntry: {
    padding: 12, borderTopWidth: 1, borderTopColor: Colors.beige[50],
    backgroundColor: Colors.beige[50],
  },
  sessDate: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase',
    color: Colors.beige[400], marginBottom: 6,
  },
  exLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  exName: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.beige[800] },
  exStats: { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[600] },
  empty: { fontFamily: Fonts.sansLight, textAlign: 'center', padding: 20, color: Colors.beige[400], fontSize: 13 },
  dataNote: { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 14, lineHeight: 18 },
});
