import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Share, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../lib/authContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Colors, Fonts, Spacing } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Toggle';
import { formatDate, getPhaseLabel } from '../../lib/cycle';
import { useTranslation } from '../../lib/LangContext';
import { Lang } from '../../types';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { lang, setLang, t } = useTranslation();
  const profile    = useQuery(api.profiles.get);
  const workouts   = useQuery(api.workouts.list) ?? [];
  const upsertProf = useMutation(api.profiles.upsert);
  const clearAll   = useMutation(api.userData.clearAll);

  const [name, setName] = useState('');
  const [cycleLen, setCycleLen] = useState('28');
  const [periodLen, setPeriodLen] = useState('5');
  const [lastPeriod, setLastPeriod] = useState('');
  const [sync, setSync] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync form fields when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setCycleLen(String(profile.cycle_length ?? 28));
      setPeriodLen(String(profile.period_length ?? 5));
      setLastPeriod(profile.last_period_date ?? '');
    }
  }, [profile?._id]);

  const handleSave = async () => {
    await upsertProf({
      name: name.trim(),
      cycle_length: parseInt(cycleLen) || 28,
      period_length: parseInt(periodLen) || 5,
      last_period_date: lastPeriod || undefined,
    });
    Alert.alert('', t('prof.saved'));
  };

  const handleExport = async () => {
    const rows = [lang === 'en'
      ? 'Date,Workout,Exercise,Sets,Reps,kg,Phase'
      : 'Kuupäev,Treeningkava,Harjutus,Seeriad,Kordused,kg,Faas'];
    workouts.forEach((w) => {
      w.exercises.forEach((e) => {
        rows.push([w.date, `"${w.name}"`, `"${e.name}"`, e.sets, e.reps, e.weight_kg, w.phase].join(','));
      });
    });
    await Share.share({ message: rows.join('\n'), title: t('prof.export.title') });
  };

  const handleClearAll = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(t('prof.clear.title'), t('prof.clear.body'), [
        { text: t('prof.clear.cancel'), style: 'cancel' },
        { text: t('prof.clear.confirm'), style: 'destructive', onPress: doDeleteAll },
      ]);
    } else {
      setConfirmDelete(true);
    }
  };

  const doDeleteAll = async () => {
    setDeleting(true);
    try {
      await clearAll();
    } catch (_) {}
    await signOut();
    router.replace('/(auth)/login' as any);
  };

  const planName = {
    free: t('prof.plan.free.name'),
    monthly: t('prof.plan.monthly.name'),
    yearly: t('prof.plan.yearly.name'),
  }[profile?.plan ?? 'free'];

  const planSub = profile?.plan && profile.plan !== 'free'
    ? t('prof.plan.pro.sub')
    : t('prof.plan.free.sub');

  const library: Record<string, typeof workouts> = {};
  workouts.forEach((w) => { if (!library[w.name]) library[w.name] = []; library[w.name].push(w); });

  const LANGS: { code: Lang; flag: string; name: string }[] = [
    { code: 'et', flag: '🇪🇪', name: 'Eesti' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>{t('prof.heading')}</Text>
        <Text style={styles.subheading}>{t('prof.sub')}</Text>
      </View>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Plan card */}
        <View style={styles.sectionLblRow}><Icon name="star" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>{t('prof.plan.lbl')}</Text></View>
        <Card>
          <View style={styles.planRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>{planName}</Text>
              <Text style={styles.planSub}>{planSub}</Text>
            </View>
            {(!profile?.plan || profile?.plan === 'free') && (
              <Button variant="blush" size="sm" onPress={() => router.push('/(onboarding)/plan')}>
                {t('prof.plan.upgrade')}
              </Button>
            )}
          </View>
        </Card>

        {/* Language picker */}
        <View style={styles.sectionLblRow}><Icon name="eye" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>{t('prof.lang.lbl')}</Text></View>
        <Card>
          <View style={styles.langRow}>
            {LANGS.map((l) => (
              <Button
                key={l.code}
                variant={lang === l.code ? 'blush' : 'outline'}
                size="sm"
                style={styles.langBtn}
                onPress={() => setLang(l.code)}
              >
                {l.flag}  {l.name}
              </Button>
            ))}
          </View>
        </Card>

        {/* Personal data */}
        <View style={styles.sectionLblRow}><Icon name="person" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>{t('prof.data.lbl')}</Text></View>
        <Card>
          <Input label={t('prof.name.lbl')} value={name} onChangeText={setName} placeholder={t('prof.name.ph')} />
          <View style={styles.row}>
            <Input label={t('prof.cl.lbl')} value={cycleLen} onChangeText={setCycleLen} placeholder="28" keyboardType="number-pad" containerStyle={styles.half} />
            <Input label={t('prof.pl.lbl')} value={periodLen} onChangeText={setPeriodLen} placeholder="5" keyboardType="number-pad" containerStyle={styles.half} />
          </View>
          <Input label={t('prof.lp.lbl')} value={lastPeriod} onChangeText={setLastPeriod} placeholder={t('prof.lp.ph')} />
          <Button variant="dark" fullWidth onPress={handleSave} style={styles.saveBtn}>
            {t('prof.save')}
          </Button>
        </Card>

        {/* Privacy */}
        <View style={styles.sectionLblRow}><Icon name="lock" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>{t('prof.privacy.lbl')}</Text></View>
        <Card>
          {[
            { titleKey: 'prof.sync.title', subKey: 'prof.sync.sub', val: sync, set: setSync },
            { titleKey: 'prof.notif.title', subKey: 'prof.notif.sub', val: reminders, set: setReminders },
            { titleKey: 'prof.anon.title', subKey: 'prof.anon.sub', val: analytics, set: setAnalytics },
          ].map((item, i) => (
            <View key={i} style={[styles.toggleRow, i === 2 && { borderBottomWidth: 0 }]}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleTitle}>{t(item.titleKey as any)}</Text>
                <Text style={styles.toggleSub}>{t(item.subKey as any)}</Text>
              </View>
              <Toggle value={item.val} onChange={item.set} />
            </View>
          ))}
        </Card>

        {/* Library */}
        <View style={styles.sectionLblRow}><Icon name="folder" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>{t('prof.lib.lbl')}</Text></View>
        {Object.keys(library).length === 0 ? (
          <Text style={styles.empty}>{t('prof.lib.empty')}</Text>
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
                  {folderName}  ·  {sessions.length} {t('prof.lib.sessions')}  {isOpen ? '▲' : '▼'}
                </Button>
                {isOpen && sessions.map((w) => (
                  <View key={w._id} style={styles.sessEntry}>
                    <Text style={styles.sessDate}>{formatDate(w.date)} · {getPhaseLabel(w.phase, lang)}</Text>
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

        {/* Account */}
        <View style={[styles.sectionLblRow, { marginTop: 20 }]}><Icon name="person" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>{t('prof.signout')}</Text></View>
        <Card>
          <Button variant="outline" fullWidth onPress={async () => { await signOut(); router.replace('/(auth)/login' as any); }}>
            {t('prof.signout')}
          </Button>
        </Card>

        {/* Data */}
        <View style={[styles.sectionLblRow, { marginTop: 20 }]}><Icon name="download" size={12} color={Colors.beige[400]} /><Text style={styles.sectionLbl}>{t('prof.data.lbl2')}</Text></View>
        <Card>
          <Button variant="outline" fullWidth onPress={handleExport} style={{ marginBottom: 8 }}>
            {t('prof.export')}
          </Button>
          {confirmDelete ? (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmTitle}>{t('prof.clear.title')}</Text>
              <Text style={styles.confirmBody}>{t('prof.clear.body')}</Text>
              <View style={styles.confirmRow}>
                <Button variant="outline" style={styles.confirmBtn} onPress={() => setConfirmDelete(false)} disabled={deleting}>
                  {t('prof.clear.cancel')}
                </Button>
                <Button variant="danger" style={styles.confirmBtn} onPress={doDeleteAll} disabled={deleting}>
                  {deleting ? '...' : t('prof.clear.confirm')}
                </Button>
              </View>
            </View>
          ) : (
            <Button variant="danger" fullWidth onPress={handleClearAll}>
              {t('prof.clear')}
            </Button>
          )}
          <Text style={styles.dataNote}>{t('prof.local')}</Text>
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
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: { flex: 1 },
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
  confirmBox: { borderWidth: 1, borderColor: '#E0A0A0', borderRadius: 10, padding: 16, backgroundColor: Colors.error.bg, marginBottom: 4 },
  confirmTitle: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.error.text, marginBottom: 6 },
  confirmBody: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.error.text, marginBottom: 14 },
  confirmRow: { flexDirection: 'row', gap: 10 },
  confirmBtn: { flex: 1 },
});
