import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
  TextInput, Modal, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
import { DatePicker } from '../../components/ui/DatePicker';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { formatDate, todayISO, getPhaseKey, getPhaseLabel } from '../../lib/cycle';
import {
  CATEGORIES, getAllExercises,
  getRecentExerciseIds, recordRecentExercise,
  saveCustomExercise, getCategoryLabel,
} from '../../lib/exercises';
import { searchExercises } from '../../lib/exerciseSearch';
import { Workout, Exercise, ExerciseTemplate, ExerciseField, ExerciseSet } from '../../types';
import {
  getExerciseProgress, detectNewPRs, getWeeklyVolume,
  getWorkoutStats, ExerciseProgress, PersonalRecord, WeeklyVolume, WorkoutStats,
} from '../../lib/workoutAnalysis';
import { useTranslation } from '../../lib/LangContext';
import {
  getHyroxTemplate, formatSimTime, formatPace, calcHyroxTotalTime,
  getHyroxInsights, extractStationResults, TRAINING_PLANS,
  generatePersonalizedPlan, HYROX_DIVISIONS,
  HYROX_STATIONS, DIVISION_WEIGHTS, getStationWeight,
} from '../../lib/hyrox';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoggedExercise {
  template: ExerciseTemplate;
  sets: ExerciseSet[];
}

interface RoutineExercise {
  exercise_id: string;
  name: string;
  category?: string;
  fields: string[];
}

// ─── Exercise Picker Modal ────────────────────────────────────────────────────
function ExercisePicker({
  visible, onSelect, onClose,
}: {
  visible: boolean;
  onSelect: (ex: ExerciseTemplate) => void;
  onClose: () => void;
}) {
  const T = useTheme();
  const { t } = useTranslation();
  const [query,        setQuery]        = useState('');
  const [category,     setCategory]     = useState('all');
  const [allExercises, setAllExercises] = useState<ExerciseTemplate[]>([]);
  const [recentIds,    setRecentIds]    = useState<string[]>([]);
  const [results,      setResults]      = useState<ExerciseTemplate[]>([]);
  const [customName,   setCustomName]   = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    setQuery(''); setCategory('all'); setCustomName('');
    (async () => {
      const [all, recent] = await Promise.all([getAllExercises(), getRecentExerciseIds()]);
      setAllExercises(all);
      setRecentIds(recent);
      setResults(searchExercises('', all, recent, 'all'));
    })();
  }, [visible]);

  useEffect(() => {
    setResults(searchExercises(query, allExercises, recentIds, category));
  }, [query, category, allExercises, recentIds]);

  const handleSelect = async (ex: ExerciseTemplate) => {
    await recordRecentExercise(ex.id);
    onSelect(ex);
    onClose();
  };

  const handleAddCustom = async () => {
    const name = (customName.trim() || query.trim());
    if (!name) return;
    const id = `custom-${Date.now()}`;
    const ex: ExerciseTemplate = {
      id, name, category: 'fullbody', popularity: 5,
      fields: ['sets', 'reps', 'weight'], custom: true,
    };
    await saveCustomExercise(ex);
    handleSelect(ex);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.pickerSafe, { backgroundColor: T.bg }]}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: T.bg }}>
          <View style={[styles.pickerHeader, { borderBottomColor: T.border }]}>
            <Text style={[styles.pickerTitle, { color: T.text }]}>{t('w.picker.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.pickerClose}>
              <Icon name="close" size={20} color={T.textSec} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color={Colors.beige[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('w.picker.search')}
              placeholderTextColor={Colors.beige[200]}
              value={query}
              onChangeText={setQuery}
              autoFocus={false}
              autoCorrect={false}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="close" size={14} color={Colors.beige[400]} />
              </TouchableOpacity>
            ) : null}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.catScroll}
            contentContainerStyle={styles.catScrollContent}
            bounces={false}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, category === cat.id && styles.catChipOn]}
                onPress={() => setCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catChipTxt, category === cat.id && styles.catChipTxtOn]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>

        <FlatList
          data={results}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          ListEmptyComponent={
            query ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsTxt}>„{query}" {t('w.picker.noresult')}</Text>
                <Text style={[styles.noResultsTxt, { fontSize: 11, marginTop: 4 }]}>
                  {t('w.picker.noresult.hint')}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isRecent = recentIds.includes(item.id);
            const catLabel = getCategoryLabel(item.category);
            return (
              <TouchableOpacity
                style={styles.exerciseRow}
                activeOpacity={0.7}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.exerciseInfo}>
                  <View style={styles.exerciseNameRow}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    {item.custom && (
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeTxt}>{t('w.picker.badge.custom')}</Text>
                      </View>
                    )}
                    {isRecent && !item.custom && (
                      <View style={styles.recentBadge}>
                        <Text style={styles.recentBadgeTxt}>{t('w.picker.badge.recent')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.exerciseCat}>{catLabel}</Text>
                </View>
                <Icon name="chevr" size={16} color={Colors.beige[200]} />
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        <View style={[styles.pickerFooter, { paddingBottom: insets.bottom + 8 }]}>
          <Text style={styles.customNameLbl}>{t('w.picker.custom.lbl')}</Text>
          <View style={styles.createRow}>
            <TextInput
              style={styles.createInput}
              placeholder={query || t('w.picker.custom.ph')}
              placeholderTextColor={Colors.beige[200]}
              value={customName}
              onChangeText={setCustomName}
              returnKeyType="done"
              onSubmitEditing={handleAddCustom}
            />
            <TouchableOpacity
              style={[styles.createBtn, { opacity: (customName.trim() || query.trim()) ? 1 : 0.4 }]}
              onPress={handleAddCustom}
              disabled={!(customName.trim() || query.trim())}
            >
              <Text style={styles.createBtnTxt}>{t('w.picker.custom.add')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Set Logger ───────────────────────────────────────────────────────────────
type RawSets = Record<string, string>;

function SetLogger({
  exercise, sets, onChange, onRemove,
}: {
  exercise: ExerciseTemplate;
  sets: ExerciseSet[];
  onChange: (sets: ExerciseSet[]) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [raw, setRaw] = useState<RawSets>({});

  const showWeight   = exercise.fields.includes('weight');
  const showReps     = exercise.fields.includes('reps');
  const showDuration = exercise.fields.includes('duration');
  const showDistance = exercise.fields.includes('distance');
  const isSets       = exercise.fields.includes('sets');
  const cat          = CATEGORIES.find(c => c.id === exercise.category);
  const durationInSec = showReps && showDuration;

  const addSet = () => onChange([...sets, {}]);
  const removeSet = (i: number) => {
    const next: RawSets = {};
    Object.entries(raw).forEach(([k, v]) => {
      const [idx] = k.split('_');
      if (Number(idx) !== i) next[k] = v;
    });
    setRaw(next);
    onChange(sets.filter((_, idx) => idx !== i));
  };

  const handleChange = (setIdx: number, field: keyof ExerciseSet, text: string) => {
    const key = `${setIdx}_${field}`;
    setRaw(r => ({ ...r, [key]: text }));
    const parsed = text === '' ? undefined : isNaN(parseFloat(text)) ? undefined : parseFloat(text);
    const stored = (field === 'duration_min' && durationInSec && parsed != null) ? parsed / 60 : parsed;
    onChange(sets.map((s, idx) => idx === setIdx ? { ...s, [field]: stored } : s));
  };

  const getRaw = (setIdx: number, field: keyof ExerciseSet): string => {
    const key = `${setIdx}_${field}`;
    if (key in raw) return raw[key];
    const v = sets[setIdx]?.[field];
    if (v == null) return '';
    const display = (field === 'duration_min' && durationInSec) ? v * 60 : v;
    return String(display);
  };

  return (
    <View style={styles.setLogCard}>
      <View style={styles.setLogAccent} />
      <View style={styles.setLogHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.setLogName}>{exercise.name}</Text>
          <Text style={styles.setLogCat}>{cat?.label ?? exercise.category}</Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeExBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="trash" size={16} color={Colors.error.text} />
        </TouchableOpacity>
      </View>

      {sets.length > 0 && (
        <View style={styles.setColHeaders}>
          {isSets && <View style={{ width: 36 }} />}
          {showReps     && <Text style={styles.setColHdr}>{t('w.ex.reps.col')}</Text>}
          {showWeight   && <Text style={styles.setColHdr}>kg</Text>}
          {showDuration && <Text style={styles.setColHdr}>{durationInSec ? 'sek' : 'min'}</Text>}
          {showDistance && <Text style={styles.setColHdr}>km</Text>}
          <View style={{ width: 28 }} />
        </View>
      )}

      {sets.map((_, i) => (
        <View key={i} style={styles.setRow}>
          {isSets && (
            <View style={styles.setNumWrap}>
              <Text style={styles.setNum}>{i + 1}</Text>
            </View>
          )}
          {showReps && (
            <TextInput
              style={styles.setInput}
              placeholder="0"
              placeholderTextColor={Colors.beige[200]}
              keyboardType="numeric"
              value={getRaw(i, 'reps')}
              onChangeText={v => handleChange(i, 'reps', v)}
            />
          )}
          {showWeight && (
            <TextInput
              style={styles.setInput}
              placeholder="0"
              placeholderTextColor={Colors.beige[200]}
              keyboardType="decimal-pad"
              value={getRaw(i, 'weight_kg')}
              onChangeText={v => handleChange(i, 'weight_kg', v)}
            />
          )}
          {showDuration && (
            <TextInput
              style={styles.setInput}
              placeholder="0"
              placeholderTextColor={Colors.beige[200]}
              keyboardType="decimal-pad"
              value={getRaw(i, 'duration_min')}
              onChangeText={v => handleChange(i, 'duration_min', v)}
            />
          )}
          {showDistance && (
            <TextInput
              style={styles.setInput}
              placeholder="0"
              placeholderTextColor={Colors.beige[200]}
              keyboardType="decimal-pad"
              value={getRaw(i, 'distance_km')}
              onChangeText={v => handleChange(i, 'distance_km', v)}
            />
          )}
          <TouchableOpacity onPress={() => removeSet(i)} style={styles.removeSetBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="close" size={12} color={Colors.beige[400]} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addSetBtn} onPress={addSet} activeOpacity={0.7}>
        <Icon name="plus" size={13} color={Colors.beige[800]} />
        <Text style={styles.addSetTxt}>{t('w.ex.addset')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WorkoutsScreen() {
  const T = useTheme();
  const { lang, t } = useTranslation();
  const [showBuilder, setShowBuilder]             = useState(false);
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false);
  const [showPicker, setShowPicker]               = useState(false);
  // 'workout' picker adds to workout builder; 'routine' picker adds to routine builder
  const [pickerTarget, setPickerTarget]           = useState<'workout' | 'routine'>('workout');

  // Workout builder state
  const [date, setDate]                           = useState(todayISO());
  const [dateMode, setDateMode]                   = useState<'today' | 'yesterday' | 'custom'>('today');
  const [workoutName, setWorkoutName]             = useState('');
  const [loggedExercises, setLoggedExercises]     = useState<LoggedExercise[]>([]);
  const [feel, setFeel]                           = useState<Set<string>>(new Set());
  const [notes, setNotes]                         = useState('');
  const [saveMsg, setSaveMsg]                     = useState<string | null>(null);

  // Routine builder state
  const [routineName, setRoutineName]             = useState('');
  const [routineExercises, setRoutineExercises]   = useState<RoutineExercise[]>([]);
  const [routineSaveMsg, setRoutineSaveMsg]       = useState<string | null>(null);
  const [editingRoutineId, setEditingRoutineId]   = useState<Id<'routines'> | null>(null);

  const [activeTab, setActiveTab] = useState<'log' | 'routines' | 'progress'>('log');

  // HYROX modal + goal form
  const [showHyroxModal, setShowHyroxModal] = useState(false);
  const [showHyroxGoalForm, setShowHyroxGoalForm] = useState(false);
  const [hxName,  setHxName]  = useState('');
  const [hxDate,  setHxDate]  = useState('');
  const [hxDiv,   setHxDiv]   = useState('Women');
  const [hxHours, setHxHours] = useState('1');
  const [hxMins,  setHxMins]  = useState('30');
  const [hxPace,  setHxPace]  = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const workouts     = useQuery(api.workouts.list) ?? [];
  const profile      = useQuery(api.profiles.get);
  const routines     = useQuery(api.routines.list) ?? [];
  const hyroxGoal    = useQuery(api.hyrox.get);
  const addWorkout   = useMutation(api.workouts.add);
  const removeWorkout = useMutation(api.workouts.remove);
  const addRoutine    = useMutation(api.routines.add);
  const updateRoutine = useMutation(api.routines.update);
  const removeRoutine = useMutation(api.routines.remove);
  const upsertHyroxGoal = useMutation(api.hyrox.upsert);
  const removeHyroxGoal = useMutation(api.hyrox.remove);

  const yesterdayISO = () => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  };

  const effectiveDate = dateMode === 'today' ? todayISO() : dateMode === 'yesterday' ? yesterdayISO() : date;

  // ── HYROX memos — declared here (before conditional early returns) so hook count is always stable
  // (actual workouts/hyroxGoal data comes from the useQuery calls above; we just reference them here)
  const hyroxWorkoutsAll = workouts.filter((w: any) =>
    w.name.startsWith('HYROX') || w.exercises.some((e: any) => e.category === 'hyrox')
  );
  const hyroxTimesAll = hyroxWorkoutsAll
    .map((w: any) => ({ date: w.date, total: calcHyroxTotalTime(w.exercises) }))
    .filter((x: any) => x.total > 0)
    .sort((a: any, b: any) => b.date.localeCompare(a.date));
  const lastSimTimeAll = hyroxTimesAll[0]?.total ?? 0;
  const hyroxInsights = React.useMemo(
    () => getHyroxInsights(hyroxWorkoutsAll.map((w: any) => ({
      name: w.name, date: w.date, phase: w.phase, exercises: w.exercises,
    })), lang as any),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hyroxWorkoutsAll.length, lang]
  );
  const personalizedPlan = React.useMemo(
    () => generatePersonalizedPlan(
      hyroxGoal?.competition_date, hyroxGoal?.goal_minutes,
      lastSimTimeAll || undefined, hyroxGoal?.weakest_stations, lang as any,
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hyroxGoal?.goal_minutes, hyroxGoal?.competition_date, lastSimTimeAll, lang]
  );

  const resetBuilder = () => {
    setDate(todayISO()); setDateMode('today');
    setWorkoutName(''); setLoggedExercises([]);
    setFeel(new Set()); setNotes(''); setSaveMsg(null);
  };

  const resetRoutineBuilder = () => {
    setRoutineName(''); setRoutineExercises([]); setRoutineSaveMsg(null); setEditingRoutineId(null);
  };

  const openRoutineForEdit = (r: { _id: Id<'routines'>; name: string; exercises: RoutineExercise[] }) => {
    setRoutineName(r.name);
    setRoutineExercises(r.exercises);
    setRoutineSaveMsg(null);
    setEditingRoutineId(r._id);
    setShowRoutineBuilder(true);
  };

  // Open workout builder, optionally pre-loaded from a routine
  const openBuilderFromRoutine = (routine: { name: string; exercises: RoutineExercise[] }) => {
    resetBuilder();
    setWorkoutName(routine.name);
    setLoggedExercises(routine.exercises.map(re => ({
      template: {
        id: re.exercise_id,
        name: re.name,
        category: (re.category ?? 'fullbody') as any,
        fields: re.fields as ExerciseField[],
        popularity: 0,
      },
      sets: [{}],
    })));
    setShowBuilder(true);
  };

  const handlePickerSelect = (ex: ExerciseTemplate) => {
    if (pickerTarget === 'routine') {
      setRoutineExercises(prev => [...prev, {
        exercise_id: ex.id,
        name: ex.name,
        category: ex.category,
        fields: ex.fields,
      }]);
    } else {
      setLoggedExercises(prev => [...prev, { template: ex, sets: [{}] }]);
    }
  };

  const handleSave = async () => {
    if (!effectiveDate) { setSaveMsg(t('w.err.date')); return; }
    if (loggedExercises.length === 0) { setSaveMsg(t('w.err.noex')); return; }

    const name = workoutName.trim() || loggedExercises[0].template.name;
    const phase = getPhaseKey(
      effectiveDate,
      profile?.last_period_date ?? null,
      profile?.cycle_length ?? 28,
      profile?.period_length ?? 5,
    );

    const exercises: Exercise[] = loggedExercises.map(le => {
      const validSets = le.sets.filter(s =>
        s.reps != null || s.weight_kg != null || s.duration_min != null || s.distance_km != null
      );
      const totalSets = validSets.length || le.sets.length;
      const avgReps   = validSets.reduce((a, s) => a + (s.reps ?? 0), 0) / Math.max(validSets.length, 1);
      const avgWeight = validSets.reduce((a, s) => a + (s.weight_kg ?? 0), 0) / Math.max(validSets.length, 1);
      return {
        exercise_id: le.template.id,
        name: le.template.name,
        category: le.template.category,
        sets: totalSets,
        reps: Math.round(avgReps),
        weight_kg: Math.round(avgWeight * 10) / 10,
        logged_sets: validSets,
        duration_min: validSets[0]?.duration_min,
        distance_km: validSets[0]?.distance_km,
      };
    });

    const workoutId = await addWorkout({
      date: effectiveDate, name, exercises,
      feel: Array.from(feel), notes: notes.trim(), phase,
    });
    resetBuilder();
    setShowBuilder(false);

    const prs = detectNewPRs(workouts as any, workoutId as string);
    if (prs.length > 0 && Platform.OS !== 'web') {
      const prLines = prs.map(pr =>
        `🏆 ${pr.exerciseName}: ${pr.value}${pr.unit} (+${pr.improvement}${pr.type === 'weight' || pr.type === 'distance' ? '%' : ''})`
      ).join('\n');
      Alert.alert(t('w.pr.title'), prLines);
    }
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) { setRoutineSaveMsg(t('w.routine.err.name')); return; }
    if (routineExercises.length === 0) { setRoutineSaveMsg(t('w.routine.err.noex')); return; }
    if (editingRoutineId) {
      await updateRoutine({ id: editingRoutineId, name: routineName.trim(), exercises: routineExercises });
    } else {
      await addRoutine({ name: routineName.trim(), exercises: routineExercises });
    }
    resetRoutineBuilder();
    setShowRoutineBuilder(false);
    setActiveTab('routines');
  };

  const handleDeleteWorkout = (id: Id<'workouts'>) => {
    if (Platform.OS !== 'web') {
      Alert.alert(t('w.delete.confirm'), '', [
        { text: t('w.delete.cancel'), style: 'cancel' },
        { text: t('w.delete.ok'), style: 'destructive', onPress: () => removeWorkout({ id }) },
      ]);
    } else {
      if (window.confirm(t('w.delete.confirm'))) removeWorkout({ id });
    }
  };

  const handleDeleteRoutine = (id: Id<'routines'>) => {
    if (Platform.OS !== 'web') {
      Alert.alert(t('w.routine.delete'), '', [
        { text: t('w.delete.cancel'), style: 'cancel' },
        { text: t('w.delete.ok'), style: 'destructive', onPress: () => removeRoutine({ id }) },
      ]);
    } else {
      if (window.confirm(t('w.routine.delete'))) removeRoutine({ id });
    }
  };

  // ── Routine Builder ────────────────────────────────────────────────────────
  if (showRoutineBuilder) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
        <View style={[styles.topBar, { borderBottomColor: T.border }]}>
          <TouchableOpacity onPress={() => { resetRoutineBuilder(); setShowRoutineBuilder(false); }} style={styles.backBtn}>
            <Icon name="arr-l" size={20} color={T.textSec} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: T.text }]}>{editingRoutineId ? t('w.routine.edit.title') : t('w.routine.builder.title')}</Text>
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSaveRoutine}>
            <Text style={styles.saveHeaderTxt}>{t('w.routine.save')}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Routine name */}
            <View style={styles.builderSection}>
              <Text style={styles.fieldLbl}>{t('w.routine.name.lbl')}</Text>
              <TextInput
                style={styles.fieldInput}
                value={routineName}
                onChangeText={v => { setRoutineName(v); setRoutineSaveMsg(null); }}
                placeholder={t('w.routine.name.ph')}
                placeholderTextColor={Colors.beige[200]}
                autoFocus
              />
            </View>

            {routineSaveMsg && (
              <View style={styles.saveMsgBox}>
                <Text style={styles.saveMsgTxt}>{routineSaveMsg}</Text>
              </View>
            )}

            {/* Exercise list */}
            <View style={styles.sectionLblRow}>
              <Icon name="barbell" size={12} color={Colors.beige[400]} />
              <Text style={styles.sectionLbl}>{t('w.routine.ex.lbl')}</Text>
            </View>

            {routineExercises.map((re, i) => (
              <View key={`${re.exercise_id}-${i}`} style={styles.routineExCard}>
                <View style={styles.routineExAccent} />
                <View style={styles.routineExRow}>
                  {/* Up / down reorder buttons */}
                  <View style={styles.reorderCol}>
                    <TouchableOpacity
                      style={[styles.reorderBtn, i === 0 && styles.reorderBtnDisabled]}
                      disabled={i === 0}
                      onPress={() => setRoutineExercises(prev => {
                        const next = [...prev];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        return next;
                      })}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.reorderArrow}>▲</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reorderBtn, i === routineExercises.length - 1 && styles.reorderBtnDisabled]}
                      disabled={i === routineExercises.length - 1}
                      onPress={() => setRoutineExercises(prev => {
                        const next = [...prev];
                        [next[i], next[i + 1]] = [next[i + 1], next[i]];
                        return next;
                      })}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.reorderArrow}>▼</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.routineExName}>{re.name}</Text>
                    <Text style={styles.routineExCat}>{re.category ?? ''}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setRoutineExercises(prev => prev.filter((_, j) => j !== i))}
                    style={styles.removeExBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="trash" size={16} color={Colors.error.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addExerciseBtn}
              activeOpacity={0.8}
              onPress={() => { setPickerTarget('routine'); setRoutineSaveMsg(null); setShowPicker(true); }}
            >
              <Icon name="plus" size={16} color={Colors.beige[800]} />
              <Text style={styles.addExerciseTxt}>{t('w.ex.add')}</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        <ExercisePicker
          visible={showPicker}
          onSelect={handlePickerSelect}
          onClose={() => setShowPicker(false)}
        />
      </SafeAreaView>
    );
  }

  // ── Workout Builder ────────────────────────────────────────────────────────
  if (showBuilder) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
        <View style={[styles.topBar, { borderBottomColor: T.border }]}>
          <TouchableOpacity onPress={() => { resetBuilder(); setShowBuilder(false); }} style={styles.backBtn}>
            <Icon name="arr-l" size={20} color={T.textSec} />
          </TouchableOpacity>
          <Text style={[styles.heading, { color: T.text }]}>{t('w.builder.title')}</Text>
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave}>
            <Text style={styles.saveHeaderTxt}>{t('w.builder.save')}</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Date quick select */}
            <View style={styles.builderSection}>
              <Text style={styles.fieldLbl}>{t('w.date.lbl')}</Text>
              <View style={styles.dateRow}>
                {(['today', 'yesterday', 'custom'] as const).map(mode => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.dateChip, dateMode === mode && styles.dateChipOn]}
                    onPress={() => { setDateMode(mode); if (mode !== 'custom') setSaveMsg(null); }}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.dateChipTxt, dateMode === mode && styles.dateChipTxtOn]}>
                      {mode === 'today' ? t('w.date.today') : mode === 'yesterday' ? t('w.date.yesterday') : t('w.date.custom')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {dateMode === 'custom' && (
                <View style={{ marginTop: 8 }}>
                  <DatePicker value={date} onChange={setDate} />
                </View>
              )}
            </View>

            {/* Workout name (pre-filled if from routine) */}
            <View style={styles.builderSection}>
              <Text style={styles.fieldLbl}>{t('w.builder.name.lbl')}</Text>
              <TextInput
                style={styles.fieldInput}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder={t('w.builder.name.ph')}
                placeholderTextColor={Colors.beige[200]}
              />
            </View>

            {saveMsg && (
              <View style={styles.saveMsgBox}>
                <Text style={styles.saveMsgTxt}>{saveMsg}</Text>
              </View>
            )}

            {/* Exercises */}
            <View style={styles.sectionLblRow}>
              <Icon name="barbell" size={12} color={Colors.beige[400]} />
              <Text style={styles.sectionLbl}>{t('w.ex.lbl')}</Text>
            </View>

            {loggedExercises.map((le, i) => (
              <SetLogger
                key={`${le.template.id}-${i}`}
                exercise={le.template}
                sets={le.sets}
                onChange={sets => setLoggedExercises(prev => prev.map((e, j) => j === i ? { ...e, sets } : e))}
                onRemove={() => setLoggedExercises(prev => prev.filter((_, j) => j !== i))}
              />
            ))}

            <TouchableOpacity
              style={styles.addExerciseBtn}
              activeOpacity={0.8}
              onPress={() => { setPickerTarget('workout'); setSaveMsg(null); setShowPicker(true); }}
            >
              <Icon name="plus" size={16} color={Colors.beige[800]} />
              <Text style={styles.addExerciseTxt}>{t('w.ex.add')}</Text>
            </TouchableOpacity>

            {/* Feel */}
            <View style={[styles.sectionLblRow, { marginTop: 8 }]}>
              <Icon name="smile-good" size={12} color={Colors.beige[400]} />
              <Text style={styles.sectionLbl}>{t('w.feel.lbl')}</Text>
            </View>
            <View style={styles.chips}>
              {([t('w.feel.tired'), t('w.feel.energetic'), t('w.feel.strong'), t('w.feel.hard'), t('w.feel.easy'), t('w.feel.motivated')]).map(chip => (
                <TouchableOpacity
                  key={chip}
                  activeOpacity={0.7}
                  style={[styles.chip, feel.has(chip) && styles.chipOn]}
                  onPress={() => setFeel(prev => { const n = new Set(prev); n.has(chip) ? n.delete(chip) : n.add(chip); return n; })}
                >
                  <Text style={[styles.chipTxt, feel.has(chip) && styles.chipTxtOn]}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <View style={styles.builderSection}>
              <Text style={styles.fieldLbl}>{t('w.notes.lbl')}</Text>
              <TextInput
                style={[styles.fieldInput, { height: 72, textAlignVertical: 'top', paddingTop: 12 }]}
                value={notes}
                onChangeText={setNotes}
                placeholder={t('w.notes.ph')}
                placeholderTextColor={Colors.beige[200]}
                multiline
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        <ExercisePicker
          visible={showPicker}
          onSelect={handlePickerSelect}
          onClose={() => setShowPicker(false)}
        />
      </SafeAreaView>
    );
  }

  // ── Main list view ─────────────────────────────────────────────────────────
  const stats    = getWorkoutStats(workouts as any);
  const progress = getExerciseProgress(workouts as any);
  const weekly   = getWeeklyVolume(workouts as any, 6);

  // HYROX computed (using the already-filtered list from top of component)
  const hyroxWorkouts = hyroxWorkoutsAll;
  const hyroxTimes = hyroxTimesAll;
  const bestSimTime = hyroxTimes.length ? Math.min(...hyroxTimes.map((x: any) => x.total)) : 0;
  const lastSimTime = lastSimTimeAll;
  const goalTotalMinutes = hyroxGoal?.goal_minutes ?? 0;
  const gapMinutes = lastSimTime && goalTotalMinutes ? lastSimTime - goalTotalMinutes : 0;

  const openHyroxGoalForm = () => {
    if (hyroxGoal) {
      const total = hyroxGoal.goal_minutes ?? 0;
      setHxName(hyroxGoal.competition_name ?? '');
      setHxDate(hyroxGoal.competition_date ?? '');
      setHxDiv(hyroxGoal.division ?? 'Women');
      setHxHours(String(Math.floor(total / 60)));
      setHxMins(String(total % 60));
      setHxPace(String(hyroxGoal.target_run_pace_min_per_km ?? ''));
    }
    setShowHyroxGoalForm(true);
  };

  const saveHyroxGoal = async () => {
    const h = parseInt(hxHours) || 0;
    const m = parseInt(hxMins) || 0;
    await upsertHyroxGoal({
      competition_name: hxName || undefined,
      competition_date: hxDate || undefined,
      division: hxDiv || undefined,
      goal_minutes: h * 60 + m || undefined,
      target_run_pace_min_per_km: parseFloat(hxPace) || undefined,
    });
    setShowHyroxGoalForm(false);
  };
  const maxVol   = Math.max(...weekly.map(w => w.totalKg), 1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: T.border }]}>
        <View>
          <Text style={[styles.heading, { color: T.text }]}>{t('w.heading')}</Text>
          <Text style={[styles.subheading, { color: T.textMuted }]}>{t('w.sub')}</Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {(['log', 'routines', 'progress'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn,
              { borderColor: T.border },
              activeTab === tab && (T.dark
                ? { backgroundColor: T.surface2, borderColor: T.border2 }
                : { backgroundColor: Colors.blush[400], borderColor: Colors.blush[400] }
              ),
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabBtnTxt,
              { color: T.textMuted },
              activeTab === tab && { color: T.dark ? T.text : '#fff', fontFamily: Fonts.sansBold },
            ]}>
              {t(`w.tab.${tab}` as any)}
            </Text>
            {tab === 'progress' && progress.some(p => p.isNew) && <View style={styles.prDot} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── LOG TAB ── */}
        {activeTab === 'log' && (
          <>
            {/* Log exercises CTA */}
            <TouchableOpacity
              style={styles.newWorkoutBtn}
              activeOpacity={0.85}
              onPress={() => { resetBuilder(); setShowBuilder(true); }}
            >
              <Icon name="plus" size={18} color={Colors.cream} />
              <Text style={styles.newWorkoutTxt}>{t('w.add.btn')}</Text>
            </TouchableOpacity>

            {/* Routines quick-log section */}
            {routines.length > 0 && (
              <>
                <View style={styles.sectionLblRow}>
                  <Icon name="folder" size={12} color={T.textMuted} />
                  <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('w.routine.lbl')}</Text>
                </View>
                {routines.map(r => (
                  <TouchableOpacity
                    key={r._id}
                    style={[styles.routineLogCard, T.dark && { backgroundColor: T.surface, borderColor: T.border }]}
                    activeOpacity={0.8}
                    onPress={() => openBuilderFromRoutine(r)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.routineLogName, { color: T.text }]}>{r.name}</Text>
                      <Text style={[styles.routineLogEx, { color: T.textMuted }]} numberOfLines={1}>
                        {r.exercises.map(e => e.name).join(' · ')}
                      </Text>
                    </View>
                    <View style={styles.routineLogBtn}>
                      <Text style={styles.routineLogBtnTxt}>{t('w.routine.log')}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* History */}
            <View style={styles.sectionLblRow}>
              <Icon name="eye" size={12} color={T.textMuted} />
              <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('w.log.lbl')}</Text>
            </View>

            {workouts.length === 0 ? (
              <View style={[styles.empty, T.dark && { backgroundColor: T.surface2 }]}>
                <Text style={[styles.emptyTxt, { color: T.textMuted }]}>{t('w.empty')}</Text>
                <Text style={[styles.emptyHint, { color: T.textMuted }]}>{t('w.empty.hint')}</Text>
              </View>
            ) : (
              workouts.slice(0, 30).map(w => (
                <View key={w._id} style={[styles.workoutCard, T.dark && { backgroundColor: T.surface, borderColor: T.border }]}>
                  <View style={styles.workoutHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.workoutName, { color: T.text }]}>{w.name}</Text>
                      <Text style={[styles.workoutMeta, { color: T.textMuted }]}>
                        {formatDate(w.date)} · {getPhaseLabel(w.phase as any, lang)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteWorkout(w._id)} style={styles.deleteBtn}>
                      <Icon name="trash" size={16} color={Colors.error.text} />
                    </TouchableOpacity>
                  </View>
                  {w.exercises.map((e, i) => (
                    <View key={i} style={[styles.exLine, T.dark && { borderBottomColor: T.border }]}>
                      <Text style={[styles.exName, { color: T.textSec }]}>{e.name}</Text>
                      <Text style={[styles.exStats, { color: T.textMuted }]}>
                        {e.logged_sets?.length ? (
                          e.logged_sets.map(s => {
                            const parts = [];
                            if (s.reps)         parts.push(`${s.reps}×`);
                            if (s.weight_kg)    parts.push(`${s.weight_kg}kg`);
                            if (s.duration_min) parts.push(`${s.duration_min}min`);
                            if (s.distance_km)  parts.push(`${s.distance_km}km`);
                            return parts.join(' ');
                          }).filter(Boolean).join(' / ')
                        ) : (
                          `${e.sets}×${e.reps}${e.weight_kg ? ` · ${e.weight_kg}kg` : ''}`
                        )}
                      </Text>
                    </View>
                  ))}
                  {w.feel.length > 0 && (
                    <Text style={styles.workoutFeel}>{w.feel.join(' · ')}</Text>
                  )}
                </View>
              ))
            )}
            <View style={{ height: 24 }} />
          </>
        )}

        {/* ── ROUTINES TAB ── */}
        {activeTab === 'routines' && (
          <>
            {/* ── Training Programmes ── */}
            <View style={styles.sectionLblRow}>
              <Icon name="spark" size={12} color={T.textMuted} />
              <Text style={[styles.sectionLbl, { color: T.textSec }]}>{lang === 'en' ? 'Training Programmes' : 'Treeningprogrammid'}</Text>
            </View>
            <TouchableOpacity style={styles.hyroxProgramCard} activeOpacity={0.88} onPress={() => setShowHyroxModal(true)}>
              <View style={styles.hyroxProgramIcon}><Icon name="wave" size={22} color={Colors.cream} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hyroxProgramTitle}>HYROX</Text>
                <Text style={styles.hyroxProgramDesc}>
                  {lang === 'en'
                    ? '8 km run + 8 stations · set goal, get a plan, simulate & analyse'
                    : '8 km jooks + 8 jaama · sea eesmärk, saa plaan, simuleeri ja analüüsi'}
                </Text>
                {hyroxGoal?.goal_minutes ? (
                  <Text style={styles.hyroxProgramStatus}>
                    {hyroxGoal.competition_name ? `${hyroxGoal.competition_name}  ·  ` : ''}
                    {lang === 'en' ? 'Goal: ' : 'Eesmärk: '}{formatSimTime(hyroxGoal.goal_minutes)}
                    {lastSimTime > 0 ? `  ·  ${lang === 'en' ? 'Best sim: ' : 'Parim: '}${formatSimTime(bestSimTime)}` : ''}
                  </Text>
                ) : (
                  <Text style={styles.hyroxProgramStatus}>{lang === 'en' ? 'Tap to set up →' : 'Vajuta seadistamiseks →'}</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* ── My Routines ── */}
            <View style={[styles.sectionLblRow, { marginTop: 6 }]}>
              <Icon name="barbell" size={12} color={T.textMuted} />
              <Text style={[styles.sectionLbl, { color: T.textSec }]}>{lang === 'en' ? 'My Routines' : 'Minu kavad'}</Text>
            </View>
            <TouchableOpacity
              style={styles.newWorkoutBtn}
              activeOpacity={0.85}
              onPress={() => { resetRoutineBuilder(); setShowRoutineBuilder(true); }}
            >
              <Icon name="plus" size={18} color={Colors.cream} />
              <Text style={styles.newWorkoutTxt}>{t('w.routine.create')}</Text>
            </TouchableOpacity>

            {routines.length === 0 ? (
              <View style={[styles.empty, T.dark && { backgroundColor: T.surface2 }]}>
                <Text style={[styles.emptyTxt, { color: T.textMuted }]}>{t('w.routine.empty')}</Text>
                <Text style={[styles.emptyHint, { color: T.textMuted }]}>{t('w.routine.empty.hint')}</Text>
              </View>
            ) : (
              routines.map(r => (
                <View key={r._id} style={[styles.workoutCard, T.dark && { backgroundColor: T.surface, borderColor: T.border }]}>
                  <View style={styles.workoutHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.workoutName, { color: T.text }]}>{r.name}</Text>
                      <Text style={[styles.workoutMeta, { color: T.textMuted }]}>
                        {r.exercises.length} {lang === 'en' ? 'exercises' : 'harjutust'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => openRoutineForEdit(r)} style={[styles.deleteBtn, { marginRight: 4 }]}>
                      <Icon name="edit" size={16} color={T.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteRoutine(r._id)} style={styles.deleteBtn}>
                      <Icon name="trash" size={16} color={Colors.error.text} />
                    </TouchableOpacity>
                  </View>
                  {r.exercises.map((e, i) => (
                    <View key={i} style={styles.exLine}>
                      <Text style={styles.exName}>{e.name}</Text>
                      <Text style={styles.exStats}>{e.category ?? ''}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.logRoutineInlineBtn}
                    activeOpacity={0.8}
                    onPress={() => openBuilderFromRoutine(r)}
                  >
                    <Icon name="plus" size={13} color={Colors.blush[600]} />
                    <Text style={styles.logRoutineInlineTxt}>{t('w.routine.log')}</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
            <View style={{ height: 24 }} />
          </>
        )}

        {/* ── PROGRESS TAB ── */}
        {activeTab === 'progress' && (
          <>
            {workouts.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTxt}>{t('w.progress.empty')}</Text>
                <Text style={styles.emptyHint}>{t('w.progress.hint')}</Text>
              </View>
            ) : (
              <>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statVal}>{stats.totalWorkouts}</Text>
                    <Text style={styles.statLbl}>{t('w.progress.total')}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statVal}>{stats.currentStreak}</Text>
                    <Text style={styles.statLbl}>{t('w.progress.streak')}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statVal}>{stats.uniqueExercises}</Text>
                    <Text style={styles.statLbl}>{t('w.progress.unique')}</Text>
                  </View>
                </View>

                {(stats.totalThisMonth > 0 || stats.totalLastMonth > 0) && (
                  <View style={styles.monthCard}>
                    <View style={styles.monthRow}>
                      <View>
                        <Text style={styles.monthVal}>{stats.totalThisMonth}</Text>
                        <Text style={styles.monthLbl}>{t('w.progress.thismonth')}</Text>
                      </View>
                      <View style={styles.monthArrow}>
                        <Text style={[styles.monthTrend, { color: stats.monthTrend >= 0 ? Colors.coral[400] : Colors.blush[400] }]}>
                          {stats.monthTrend >= 0 ? '↑' : '↓'} {Math.abs(stats.monthTrend)}%
                        </Text>
                        <Text style={styles.monthSub}>{t('w.progress.vsmonth')}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.monthVal}>{stats.totalLastMonth}</Text>
                        <Text style={styles.monthLbl}>{t('w.progress.lastmonth')}</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.sectionLblRow}>
                  <Icon name="wave" size={12} color={T.textMuted} />
                  <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('w.progress.weekly')}</Text>
                </View>
                <View style={[styles.chartCard, T.dark && { backgroundColor: T.surface, borderColor: T.border }]}>
                  <View style={styles.chartBars}>
                    {weekly.map((w, i) => (
                      <View key={i} style={styles.chartCol}>
                        <Text style={[styles.chartVolLbl, { color: T.textMuted }]}>
                          {w.totalKg > 0 ? (w.totalKg >= 1000 ? `${(w.totalKg/1000).toFixed(1)}t` : `${w.totalKg}`) : ''}
                        </Text>
                        <View style={styles.chartBarWrap}>
                          <View style={[
                            styles.chartBar,
                            { height: `${Math.max((w.totalKg / maxVol) * 100, w.totalKg > 0 ? 8 : 0)}%` as any,
                              backgroundColor: i === weekly.length - 1 ? Colors.blush[400] : T.border }
                          ]} />
                        </View>
                        <Text style={[styles.chartWeekLbl, { color: T.textMuted }]}>{w.weekLabel}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.sectionLblRow}>
                  <Icon name="spark" size={12} color={T.textMuted} />
                  <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('w.progress.exheader')}</Text>
                </View>

                {progress.filter(p => p.totalSessions >= 1).map(p => (
                  <View key={p.name} style={[styles.progressCard, T.dark && { backgroundColor: T.surface, borderColor: T.border }]}>
                    <View style={styles.progressHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.progressNameRow}>
                          <Text style={[styles.progressName, { color: T.text }]}>{p.name}</Text>
                          {p.isNew && (
                            <View style={styles.prBadge}>
                              <Text style={styles.prBadgeTxt}>🏆 PR</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.progressMeta, { color: T.textMuted }]}>
                          {p.totalSessions} {t('w.progress.logged')}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.progressMetrics, T.dark && { borderTopColor: T.border }]}>
                      {p.bestWeight > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={[styles.progressMetricVal, { color: T.text }]}>{p.bestWeight} kg</Text>
                          <Text style={[styles.progressMetricLbl, { color: T.textMuted }]}>{t('w.progress.bestkg')}</Text>
                          {p.weightGainPct !== null && p.weightGainPct > 0 && (
                            <Text style={styles.progressGain}>+{p.weightGainPct}%</Text>
                          )}
                        </View>
                      )}
                      {p.bestReps > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={[styles.progressMetricVal, { color: T.text }]}>{p.bestReps}</Text>
                          <Text style={[styles.progressMetricLbl, { color: T.textMuted }]}>{t('w.progress.bestreps')}</Text>
                        </View>
                      )}
                      {p.bestDistance > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={[styles.progressMetricVal, { color: T.text }]}>{p.bestDistance} km</Text>
                          <Text style={[styles.progressMetricLbl, { color: T.textMuted }]}>{t('w.progress.bestdist')}</Text>
                        </View>
                      )}
                      {p.bestDuration > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={[styles.progressMetricVal, { color: T.text }]}>{p.bestDuration} min</Text>
                          <Text style={[styles.progressMetricLbl, { color: T.textMuted }]}>{t('w.progress.bestdur')}</Text>
                        </View>
                      )}
                    </View>
                    {p.sessions.length >= 2 && p.bestWeight > 0 && (
                      <View style={styles.sparkline}>
                        {p.sessions.slice(-8).map((s, i, arr) => {
                          const max = Math.max(...arr.map(x => x.weight));
                          const h = max > 0 ? Math.max((s.weight / max) * 32, 4) : 4;
                          const isLast = i === arr.length - 1;
                          return (
                            <View key={i} style={styles.sparkBarWrap}>
                              <View style={[styles.sparkBar, { height: h, backgroundColor: isLast ? Colors.coral[400] : Colors.sky[100] }]} />
                            </View>
                          );
                        })}
                        <Text style={styles.sparkLbl}>{t('w.progress.lastsessions')} {Math.min(p.sessions.length, 8)} {t('w.progress.sessions')}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}
            <View style={{ height: 24 }} />
          </>
        )}
      </ScrollView>

      {/* ── HYROX Programme Modal ───────────────────────────────────────── */}
      <Modal visible={showHyroxModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowHyroxModal(false)}>
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: T.bg }}>
          <View style={[styles.topBar, { paddingVertical: Spacing.md, borderBottomColor: T.border }]}>
            <View>
              <Text style={styles.heading}>HYROX</Text>
              <Text style={styles.subheading}>{lang === 'en' ? 'Competition Preparation' : 'Võistluseks ettevalmistus'}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowHyroxModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close" size={20} color={Colors.beige[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Goal card */}
            <View style={styles.hyroxGoalCard}>
              <View style={styles.hyroxGoalCardHeader}>
                <Text style={styles.hyroxGoalCardTitle}>{lang === 'en' ? 'Competition Goal' : 'Võistluseesmärk'}</Text>
                <TouchableOpacity onPress={openHyroxGoalForm} style={styles.hyroxGoalEditBtn}>
                  <Text style={styles.hyroxGoalEditTxt}>{hyroxGoal ? (lang === 'en' ? 'Edit' : 'Muuda') : (lang === 'en' ? 'Set goal' : 'Seadista')}</Text>
                </TouchableOpacity>
              </View>
              {hyroxGoal && hyroxGoal.goal_minutes ? (
                <View>
                  {hyroxGoal.competition_name && <Text style={styles.hyroxGoalCompName}>{hyroxGoal.competition_name}</Text>}
                  <View style={styles.hyroxGoalRow}>
                    {hyroxGoal.competition_date && (
                      <View style={styles.hyroxGoalItem}>
                        <Text style={styles.hyroxGoalItemLbl}>{lang === 'en' ? 'Date' : 'Kuupäev'}</Text>
                        <Text style={styles.hyroxGoalItemVal}>{hyroxGoal.competition_date}</Text>
                      </View>
                    )}
                    {hyroxGoal.division && (
                      <View style={styles.hyroxGoalItem}>
                        <Text style={styles.hyroxGoalItemLbl}>{lang === 'en' ? 'Division' : 'Kategooria'}</Text>
                        <Text style={styles.hyroxGoalItemVal}>{hyroxGoal.division}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.hyroxTimeRow}>
                    <View style={styles.hyroxTimeBlock}>
                      <Text style={styles.hyroxTimeLbl}>{lang === 'en' ? 'Target time' : 'Eesmärkaeg'}</Text>
                      <Text style={styles.hyroxTimeVal}>{formatSimTime(hyroxGoal.goal_minutes)}</Text>
                    </View>
                    {lastSimTime > 0 && <>
                      <View style={styles.hyroxTimeSep}><Text style={styles.hyroxTimeSepTxt}>→</Text></View>
                      <View style={styles.hyroxTimeBlock}>
                        <Text style={styles.hyroxTimeLbl}>{lang === 'en' ? 'Current sim' : 'Praegune sim'}</Text>
                        <Text style={[styles.hyroxTimeVal, { color: gapMinutes > 0 ? Colors.coral[600] : Colors.sky[600] }]}>{formatSimTime(lastSimTime)}</Text>
                      </View>
                    </>}
                  </View>
                  {gapMinutes > 0 && (
                    <View style={styles.hyroxGapRow}>
                      <Text style={styles.hyroxGapTxt}>
                        {lang === 'en' ? 'Need to improve: ' : 'Vaja parandada: '}
                        <Text style={{ color: Colors.coral[600], fontFamily: Fonts.sansBold }}>{Math.round(gapMinutes)} min</Text>
                      </Text>
                    </View>
                  )}
                  {gapMinutes < 0 && (
                    <View style={[styles.hyroxGapRow, { backgroundColor: Colors.sky[50] }]}>
                      <Text style={[styles.hyroxGapTxt, { color: Colors.sky[600] }]}>
                        🎯 {lang === 'en' ? `${Math.round(Math.abs(gapMinutes))} min under goal!` : `Eesmärgist ${Math.round(Math.abs(gapMinutes))} min kiirem!`}
                      </Text>
                    </View>
                  )}
                  {hyroxGoal.target_run_pace_min_per_km && (
                    <Text style={styles.hyroxPaceTxt}>{lang === 'en' ? 'Run pace: ' : 'Jooksutempo: '}{formatPace(hyroxGoal.target_run_pace_min_per_km)}</Text>
                  )}
                </View>
              ) : (
                <View style={styles.hyroxGoalEmpty}>
                  <Text style={styles.hyroxChallengeTitle}>{lang === 'en' ? 'Set your competition goal' : 'Seadista võistluseesmärk'}</Text>
                  <Text style={styles.hyroxChallengeDesc}>{lang === 'en' ? 'Add your race date, division and target time — we\'ll build a personalised training plan.' : 'Lisa võistluse kuupäev, kategooria ja eesmärkaeg — koostame sulle isikliku treeningplaani.'}</Text>
                  <TouchableOpacity style={styles.hyroxChallengeBtn} onPress={openHyroxGoalForm} activeOpacity={0.85}>
                    <Text style={styles.hyroxChallengeBtnTxt}>{lang === 'en' ? 'Set goal →' : 'Seadista eesmärk →'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Personalised plan */}
            {personalizedPlan && (
              <View style={styles.personalPlanCard}>
                <View style={styles.personalPlanHeader}>
                  <View>
                    <Text style={styles.personalPlanCountdown}>{lang === 'en' ? personalizedPlan.countdownLabel.en : personalizedPlan.countdownLabel.et}</Text>
                    <Text style={styles.personalPlanName}>{lang === 'en' ? personalizedPlan.planStartLabel.en : personalizedPlan.planStartLabel.et}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedPlan(personalizedPlan.plan)} style={styles.personalPlanViewBtn}>
                    <Text style={styles.personalPlanViewTxt}>{lang === 'en' ? 'Full plan' : 'Täisplaan'}</Text>
                  </TouchableOpacity>
                </View>
                {personalizedPlan.focusAreas.length > 0 && (
                  <View style={styles.personalPlanFocus}>
                    <Text style={styles.personalPlanFocusLbl}>⚡ {lang === 'en' ? 'Focus this block:' : 'Fookus sel plokil:'}</Text>
                    <Text style={styles.personalPlanFocusVal}>{personalizedPlan.focusAreas.join('  ·  ')}</Text>
                  </View>
                )}
                <Text style={styles.personalPlanWeekTitle}>
                  {lang === 'en' ? `Week ${personalizedPlan.currentWeekIndex + 1}: ${personalizedPlan.thisWeek.theme.en}` : `Nädal ${personalizedPlan.currentWeekIndex + 1}: ${personalizedPlan.thisWeek.theme.et}`}
                </Text>
                {personalizedPlan.thisWeek.sessions.map((sess: any, si: number) => {
                  const ic: Record<string,string> = { recovery: Colors.sky[200], base: Colors.beige[200], moderate: Colors.coral[200], hard: Colors.coral[400], race: Colors.blush[400] };
                  return (
                    <View key={si} style={styles.personalPlanSession}>
                      <View style={[styles.personalPlanDot, { backgroundColor: ic[sess.intensity] ?? Colors.beige[200] }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.personalPlanSessionDay}>{sess.day} — <Text style={{ fontFamily: Fonts.sansBold }}>{sess.type}</Text></Text>
                        <Text style={styles.personalPlanSessionDesc}>{lang === 'en' ? sess.description.en : sess.description.et}</Text>
                      </View>
                      <Text style={styles.personalPlanSessionDur}>{sess.duration_min} min</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Start simulation */}
            <View style={styles.hyroxSimSection}>
              <View style={styles.hyroxSimHeader}>
                <Text style={styles.hyroxSimTitle}>{lang === 'en' ? 'HYROX Simulation' : 'HYROX Simulatsioon'}</Text>
                {bestSimTime > 0 && (
                  <Text style={styles.hyroxSimBest}>
                    {lang === 'en' ? 'Best: ' : 'Parim: '}{formatSimTime(bestSimTime)}
                    {lastSimTime !== bestSimTime ? `  ·  ${lang === 'en' ? 'Last: ' : 'Viimane: '}${formatSimTime(lastSimTime)}` : ''}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.hyroxSimBtn}
                activeOpacity={0.85}
                onPress={() => {
                  setShowHyroxModal(false);
                  setTimeout(() => {
                    setWorkoutName('HYROX Simulation');
                    setLoggedExercises(getHyroxTemplate(hyroxGoal?.division ?? 'Women') as any);
                    setShowBuilder(true);
                  }, 300);
                }}
              >
                <Text style={styles.hyroxSimBtnTxt}>{lang === 'en' ? 'Start simulation →' : 'Alusta simulatsiooni →'}</Text>
              </TouchableOpacity>
            </View>

            {/* Simulation history */}
            {hyroxWorkouts.length > 0 && (
              <>
                <View style={styles.sectionLblRow}>
                  <Icon name="eye" size={12} color={Colors.beige[400]} />
                  <Text style={styles.sectionLbl}>{lang === 'en' ? 'Simulation history' : 'Simulatsioonide ajalugu'}</Text>
                </View>
                {hyroxWorkouts.slice(0, 3).map((w: any) => {
                  const total = calcHyroxTotalTime(w.exercises);
                  const stations = extractStationResults(w.exercises);
                  return (
                    <View key={w._id} style={styles.hyroxSimCard}>
                      <View style={styles.hyroxSimCardHeader}>
                        <Text style={styles.hyroxSimCardDate}>{formatDate(w.date)}</Text>
                        {total > 0 && <View style={styles.hyroxSimCardTimeBadge}><Text style={styles.hyroxSimCardTime}>{formatSimTime(total)}</Text></View>}
                      </View>
                      {stations.length > 0 && (
                        <View style={styles.hyroxStationsGrid}>
                          {stations.map((s: any) => (
                            <View key={s.id} style={styles.hyroxStationChip}>
                              <Text style={styles.hyroxStationName} numberOfLines={1}>{s.name}</Text>
                              {s.duration_min > 0 && <Text style={styles.hyroxStationTime}>{s.duration_min.toFixed(1)} min</Text>}
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}

            {/* Insights */}
            {hyroxInsights.length > 0 && (
              <>
                <View style={styles.sectionLblRow}>
                  <Icon name="spark" size={12} color={Colors.beige[400]} />
                  <Text style={styles.sectionLbl}>{lang === 'en' ? 'Smart insights' : 'Nutikad tähelepanekud'}</Text>
                </View>
                <View style={styles.insightsCard}>
                  {hyroxInsights.map((insight: string, i: number) => (
                    <View key={i} style={[styles.insightRow, i > 0 && styles.insightRowBorder]}>
                      <Text style={styles.insightDot}>·</Text>
                      <Text style={styles.insightTxt}>{insight}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Training plans */}
            <View style={styles.sectionLblRow}>
              <Icon name="barbell" size={12} color={Colors.beige[400]} />
              <Text style={styles.sectionLbl}>{lang === 'en' ? 'Training Plans' : 'Treeningplaanid'}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 8, gap: 12 }}>
              {TRAINING_PLANS.map((plan: any) => (
                <View key={plan.id} style={styles.planCard}>
                  <Text style={styles.planCardWeeks}>{plan.weeks}</Text>
                  <Text style={styles.planCardWeeksLbl}>{lang === 'en' ? 'weeks' : 'nädalat'}</Text>
                  <Text style={styles.planCardName}>{lang === 'en' ? plan.name.en : plan.name.et}</Text>
                  <Text style={styles.planCardFocus} numberOfLines={2}>{lang === 'en' ? plan.focus.en : plan.focus.et}</Text>
                  <Text style={styles.planCardSessions}>{plan.sessionsPerWeek} {lang === 'en' ? 'sessions/week' : 'seanss/nädal'}</Text>
                  <TouchableOpacity style={styles.planCardBtn} onPress={() => setSelectedPlan(plan)} activeOpacity={0.8}>
                    <Text style={styles.planCardBtnTxt}>{lang === 'en' ? 'View plan' : 'Vaata plaani'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── HYROX Goal Form Modal ── */}
      <Modal visible={showHyroxGoalForm} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowHyroxGoalForm(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: T.bg }}>
            <View style={[styles.pickerHeader, { borderBottomColor: T.border }]}>
              <Text style={styles.pickerTitle}>{lang === 'en' ? 'Set HYROX Goal' : 'Seadista HYROX eesmärk'}</Text>
              <TouchableOpacity onPress={() => setShowHyroxGoalForm(false)} style={styles.pickerClose}>
                <Icon name="close" size={20} color={Colors.beige[600]} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: Spacing.xl }} keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLbl}>{lang === 'en' ? 'Competition name' : 'Võistluse nimi'}</Text>
              <TextInput style={[styles.fieldInput, { marginBottom: 14 }]} placeholder={lang === 'en' ? 'e.g. HYROX London 2025' : 'nt HYROX Tallinn 2025'} placeholderTextColor={Colors.beige[200]} value={hxName} onChangeText={setHxName} />

              <Text style={styles.fieldLbl}>{lang === 'en' ? 'Competition date (yyyy-mm-dd)' : 'Kuupäev (aaaa-kk-pp)'}</Text>
              <TextInput style={[styles.fieldInput, { marginBottom: 14 }]} placeholder="2025-10-15" placeholderTextColor={Colors.beige[200]} value={hxDate} onChangeText={setHxDate} />

              <Text style={styles.fieldLbl}>{lang === 'en' ? 'Division' : 'Kategooria'}</Text>
              <View style={[styles.chips, { marginBottom: 14, paddingHorizontal: 0 }]}>
                {HYROX_DIVISIONS.map((d: string) => (
                  <TouchableOpacity key={d} style={[styles.chip, hxDiv === d && styles.chipOn]} onPress={() => setHxDiv(d)} activeOpacity={0.7}>
                    <Text style={[styles.chipTxt, hxDiv === d && styles.chipTxtOn]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLbl}>{lang === 'en' ? 'Target finish time' : 'Eesmärkaeg'}</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputSubLbl}>{lang === 'en' ? 'Hours' : 'Tunnid'}</Text>
                  <TextInput style={styles.fieldInput} placeholder="1" placeholderTextColor={Colors.beige[200]} keyboardType="numeric" value={hxHours} onChangeText={setHxHours} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputSubLbl}>{lang === 'en' ? 'Minutes' : 'Minutid'}</Text>
                  <TextInput style={styles.fieldInput} placeholder="30" placeholderTextColor={Colors.beige[200]} keyboardType="numeric" value={hxMins} onChangeText={setHxMins} />
                </View>
              </View>

              <Text style={styles.fieldLbl}>{lang === 'en' ? 'Target run pace (min/km)' : 'Jooksutempo eesmärk (min/km)'}</Text>
              <TextInput style={[styles.fieldInput, { marginBottom: 24 }]} placeholder="6.0" placeholderTextColor={Colors.beige[200]} keyboardType="decimal-pad" value={hxPace} onChangeText={setHxPace} />

              <TouchableOpacity style={styles.newWorkoutBtn} onPress={saveHyroxGoal} activeOpacity={0.85}>
                <Text style={styles.newWorkoutTxt}>{lang === 'en' ? 'Save goal' : 'Salvesta eesmärk'}</Text>
              </TouchableOpacity>
              {hyroxGoal && (
                <TouchableOpacity style={[styles.hyroxRemoveBtn, { marginTop: 16 }]} onPress={() => { removeHyroxGoal(); setShowHyroxGoalForm(false); setShowHyroxModal(false); }}>
                  <Text style={styles.hyroxRemoveTxt}>{lang === 'en' ? 'Remove HYROX section' : 'Eemalda HYROX jaotis'}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.cream },
  topBar:  {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.beige[100],
  },
  heading:    { fontFamily: Fonts.sansBold, fontSize: 26, color: Colors.beige[800], letterSpacing: -0.5 },
  subheading: { fontFamily: Fonts.sansSemiBold, fontSize: 10, color: Colors.beige[400], marginTop: 3, textTransform: 'uppercase', letterSpacing: 1.5 },
  scroll: { flex: 1 },

  newWorkoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    margin: Spacing.xl, padding: 18, borderRadius: Radius.lg,
    backgroundColor: Colors.blush[400],
  },
  newWorkoutTxt: { fontFamily: Fonts.sansBold, fontSize: 14, color: '#fff', letterSpacing: 0.3 },

  sectionLblRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.xl, marginBottom: 10, marginTop: 4,
  },
  sectionLbl: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.2,
    textTransform: 'uppercase', color: Colors.beige[400],
  },

  // Routine quick-log cards (on Log tab)
  routineLogCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.xl, marginBottom: 8,
    backgroundColor: Colors.blush[50], borderRadius: Radius.lg,
    padding: 14, borderWidth: 1, borderColor: Colors.blush[100],
  },
  routineLogName:   { fontFamily: Fonts.sansBold, fontSize: 14, color: Colors.beige[800] },
  routineLogEx:     { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 2 },
  routineLogBtn:    { backgroundColor: Colors.blush[400], borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  routineLogBtnTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 11, color: Colors.cream },

  // "Log routine" inline button (on Routines tab inside cards)
  logRoutineInlineBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: Colors.beige[50],
  },
  logRoutineInlineTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.blush[600] },

  // Routine exercise card (in routine builder)
  routineExCard: {
    marginHorizontal: Spacing.xl, marginBottom: 10,
    backgroundColor: Colors.beige[50], borderRadius: Radius.lg,
    paddingTop: 0, paddingBottom: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: Colors.beige[100],
    overflow: 'hidden',
  },
  routineExAccent: { height: 4, backgroundColor: Colors.berry[200], marginHorizontal: -14, marginBottom: 14 },
  routineExRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routineExName:   { fontFamily: Fonts.sansBold, fontSize: 14, color: Colors.beige[800] },
  routineExCat:    { fontFamily: Fonts.sansBold, fontSize: 9, color: Colors.beige[400], marginTop: 2, textTransform: 'uppercase', letterSpacing: 1.2 },
  reorderCol:      { gap: 2 },
  reorderBtn:      { padding: 3 },
  reorderBtnDisabled: { opacity: 0.2 },
  reorderArrow:    { fontFamily: Fonts.sansBold, fontSize: 11, color: Colors.beige[400] },

  // Past workout cards
  workoutCard: {
    marginHorizontal: Spacing.xl, marginBottom: 10,
    backgroundColor: Colors.cream, borderRadius: Radius.lg,
    padding: 14, borderWidth: 1, borderColor: Colors.beige[100],
  },
  workoutHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  workoutName:   { fontFamily: Fonts.sansBold, fontSize: 15, color: Colors.beige[800] },
  workoutMeta:   { fontFamily: Fonts.sansLight, fontSize: 10, color: Colors.beige[400], marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  deleteBtn:     { padding: 4 },
  exLine:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  exName:        { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.beige[800] },
  exStats:       { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[600], flex: 1, textAlign: 'right' },
  workoutFeel:   { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 8 },

  // Tab switcher
  tabRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.beige[50],
  },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.beige[100],
  },
  tabBtnOn:    { backgroundColor: Colors.beige[800], borderColor: Colors.beige[800] },
  tabBtnTxt:   { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.beige[400] },
  tabBtnTxtOn: { color: Colors.cream },
  prDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.berry[400] },

  // Progress stats
  statsGrid: {
    flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.xl, marginTop: 14, marginBottom: 8,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.sky[50], borderRadius: Radius.md,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.sky[100],
  },
  statVal: { fontFamily: Fonts.serifSemiBold, fontSize: 26, color: Colors.beige[800], lineHeight: 28 },
  statLbl: { fontFamily: Fonts.sansLight, fontSize: 9, color: Colors.beige[400], marginTop: 3, textAlign: 'center' },

  monthCard: {
    marginHorizontal: Spacing.xl, marginBottom: 8,
    backgroundColor: Colors.beige[50], borderRadius: Radius.md,
    padding: 14, borderWidth: 1, borderColor: Colors.beige[100],
  },
  monthRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthVal:   { fontFamily: Fonts.serifSemiBold, fontSize: 28, color: Colors.beige[800] },
  monthLbl:   { fontFamily: Fonts.sansLight, fontSize: 10, color: Colors.beige[400], marginTop: 2 },
  monthArrow: { alignItems: 'center' },
  monthTrend: { fontFamily: Fonts.sansSemiBold, fontSize: 18 },
  monthSub:   { fontFamily: Fonts.sansLight, fontSize: 9, color: Colors.beige[400] },

  chartCard: {
    marginHorizontal: Spacing.xl, marginBottom: 8,
    backgroundColor: Colors.beige[50], borderRadius: Radius.md,
    padding: 14, borderWidth: 1, borderColor: Colors.beige[100],
  },
  chartBars:    { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 4 },
  chartCol:     { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBarWrap: { width: '100%', height: 56, justifyContent: 'flex-end' },
  chartBar:     { width: '100%', borderRadius: 4 },
  chartVolLbl:  { fontFamily: Fonts.sansLight, fontSize: 8, color: Colors.beige[400], marginBottom: 2 },
  chartWeekLbl: { fontFamily: Fonts.sansSemiBold, fontSize: 8, color: Colors.beige[400], marginTop: 4 },

  progressCard: {
    marginHorizontal: Spacing.xl, marginBottom: 8,
    backgroundColor: Colors.cream, borderRadius: Radius.lg,
    padding: 14, borderWidth: 1, borderColor: Colors.beige[100],
  },
  progressHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  progressNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  progressName:    { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.beige[800] },
  progressMeta:    { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 2 },
  prBadge:         { backgroundColor: Colors.berry[50], borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: Colors.berry[100] },
  prBadgeTxt:      { fontFamily: Fonts.sansBold, fontSize: 9, color: Colors.berry[600] },
  progressMetrics: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  progressMetric:  { alignItems: 'center' },
  progressMetricVal: { fontFamily: Fonts.serifSemiBold, fontSize: 20, color: Colors.beige[800] },
  progressMetricLbl: { fontFamily: Fonts.sansLight, fontSize: 9, color: Colors.beige[400], marginTop: 1 },
  progressGain:    { fontFamily: Fonts.sansSemiBold, fontSize: 10, color: Colors.coral[400], marginTop: 2 },

  sparkline:    { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 4, height: 40 },
  sparkBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 32 },
  sparkBar:     { width: '80%', borderRadius: 3 },
  sparkLbl:     { fontFamily: Fonts.sansLight, fontSize: 9, color: Colors.beige[200], position: 'absolute', bottom: -14, right: 0 },

  empty:    { alignItems: 'center', paddingVertical: 40 },
  emptyTxt: { fontFamily: Fonts.sansLight, fontSize: 14, color: Colors.beige[400] },
  emptyHint:{ fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[200], marginTop: 6 },

  // ── Builder ──────────────────────────────────────────────────────────────
  backBtn: { padding: 4, marginRight: 8 },
  saveHeaderBtn: {
    backgroundColor: Colors.green[400], borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  saveHeaderTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: '#fff' },

  dateRow:       { flexDirection: 'row', gap: 8 },
  dateChip:      { flex: 1, paddingVertical: 11, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.beige[100], backgroundColor: Colors.cream, alignItems: 'center' },
  dateChipOn:    { backgroundColor: Colors.beige[800], borderColor: Colors.beige[800] },
  dateChipTxt:   { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.beige[600] },
  dateChipTxtOn: { color: Colors.cream },
  saveMsgBox:    { marginHorizontal: Spacing.xl, marginBottom: 10, padding: 10, borderRadius: Radius.md, backgroundColor: Colors.blush[50], borderWidth: 1, borderColor: Colors.blush[200] },
  saveMsgTxt:    { fontFamily: Fonts.sans, fontSize: 13, color: Colors.blush[600], textAlign: 'center' },

  builderSection: { paddingHorizontal: Spacing.xl, marginBottom: 14 },
  fieldLbl: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1,
    textTransform: 'uppercase', color: Colors.beige[600], marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1.5, borderColor: Colors.beige[100], borderRadius: Radius.md,
    backgroundColor: Colors.cream, fontFamily: Fonts.sans,
    fontSize: 14, color: Colors.beige[800], paddingVertical: 11, paddingHorizontal: 14,
  },

  addExerciseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: Spacing.xl, marginBottom: 8, padding: 16,
    borderRadius: Radius.md, borderWidth: 2,
    borderColor: Colors.beige[100], borderStyle: 'dashed',
    backgroundColor: Colors.beige[50],
  },
  addExerciseTxt: { fontFamily: Fonts.sansBold, fontSize: 13, color: Colors.beige[600], letterSpacing: 0.3 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: Spacing.xl, marginBottom: 14 },
  chip:     { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.beige[200], backgroundColor: Colors.cream },
  chipOn:   { backgroundColor: Colors.berry[50], borderColor: Colors.berry[400] },
  chipTxt:  { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.beige[600] },
  chipTxtOn:{ fontFamily: Fonts.sansSemiBold, color: Colors.berry[600] },

  // ── Set Logger ──────────────────────────────────────────────────────────
  setLogCard: {
    marginHorizontal: Spacing.xl, marginBottom: 12,
    backgroundColor: Colors.beige[50], borderRadius: Radius.lg,
    paddingTop: 0, paddingBottom: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: Colors.beige[100],
    overflow: 'hidden',
  },
  setLogAccent:  { height: 4, backgroundColor: Colors.blush[400], marginHorizontal: -14, marginBottom: 14 },
  setLogHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  setLogName:    { fontFamily: Fonts.sansBold, fontSize: 15, color: Colors.beige[800], letterSpacing: 0.2 },
  setLogCat:     { fontFamily: Fonts.sansBold, fontSize: 9, color: Colors.beige[400], marginTop: 2, textTransform: 'uppercase', letterSpacing: 1.2 },
  removeExBtn:   { padding: 4 },
  setColHeaders: { flexDirection: 'row', marginBottom: 6, gap: 6, alignItems: 'center' },
  setColHdr:     { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: Colors.beige[400], flex: 1, textAlign: 'center' },
  setRow:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  setNumWrap:    { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.blush[400], alignItems: 'center', justifyContent: 'center' },
  setNum:        { fontFamily: Fonts.sansBold, fontSize: 13, color: Colors.cream },
  setInput:      {
    flex: 1, borderWidth: 1.5, borderColor: Colors.beige[100], borderRadius: 10,
    backgroundColor: Colors.cream, fontFamily: Fonts.sansBold,
    fontSize: 18, color: Colors.beige[800], paddingVertical: 10, textAlign: 'center',
  },
  removeSetBtn:  { padding: 4 },
  addSetBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 8, paddingLeft: 2 },
  addSetTxt:     { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.beige[400], letterSpacing: 0.4 },

  // ── Picker Modal ────────────────────────────────────────────────────────
  pickerSafe:    { flex: 1, backgroundColor: Colors.cream },
  pickerHeader:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.beige[50],
  },
  pickerTitle:   { fontFamily: Fonts.serifSemiBold, fontSize: 20, color: Colors.beige[800] },
  pickerClose:   { padding: 6 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: Spacing.xl, marginTop: 10, marginBottom: 6,
    paddingHorizontal: 14, paddingVertical: 11,
    backgroundColor: Colors.beige[50], borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.beige[100],
  },
  searchInput: {
    flex: 1, fontFamily: Fonts.sans, fontSize: 14,
    color: Colors.beige[800], padding: 0,
  },
  catScroll:        { height: 50, flexGrow: 0 },
  catScrollContent: { paddingHorizontal: Spacing.xl, gap: 8, alignItems: 'center', paddingVertical: 6 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6, height: 34,
    borderRadius: 20, borderWidth: 1.5, borderColor: Colors.beige[100],
    backgroundColor: Colors.cream, justifyContent: 'center',
  },
  catChipOn:    { backgroundColor: Colors.beige[800], borderColor: Colors.beige[800] },
  catChipTxt:   { fontFamily: Fonts.sans, fontSize: 12, color: Colors.beige[600] },
  catChipTxtOn: { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.cream },

  exerciseRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: 13, backgroundColor: Colors.cream,
  },
  exerciseInfo:    { flex: 1 },
  exerciseNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  exerciseName:    { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.beige[800] },
  exerciseCat:     { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 2 },
  customBadge:     { backgroundColor: Colors.blush[50], borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  customBadgeTxt:  { fontFamily: Fonts.sansBold, fontSize: 8, color: Colors.blush[600], letterSpacing: 0.5 },
  recentBadge:     { backgroundColor: Colors.green[50], borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  recentBadgeTxt:  { fontFamily: Fonts.sansBold, fontSize: 8, color: Colors.green[600], letterSpacing: 0.5 },
  separator:       { height: 1, backgroundColor: Colors.beige[50], marginHorizontal: Spacing.xl },

  noResults:    { paddingHorizontal: Spacing.xl, paddingVertical: 24, alignItems: 'center' },
  noResultsTxt: { fontFamily: Fonts.sansLight, fontSize: 13, color: Colors.beige[400], textAlign: 'center' },

  pickerFooter: {
    paddingHorizontal: Spacing.xl, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.beige[100],
    backgroundColor: Colors.cream,
  },
  customNameLbl: { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginBottom: 8 },
  createRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  createInput: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.beige[100], borderRadius: Radius.md,
    fontFamily: Fonts.sans, fontSize: 14, color: Colors.beige[800],
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.beige[50],
  },
  createBtn: {
    backgroundColor: Colors.beige[800], borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  createBtnTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.cream },

  // ── HYROX programme card ─────────────────────────────────────────────────
  hyroxProgramCard: {
    marginHorizontal: Spacing.xl, marginBottom: 16,
    backgroundColor: Colors.coral[50], borderRadius: Radius.lg,
    padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: Colors.coral[100],
  },
  hyroxProgramIcon:   { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.coral[400], alignItems: 'center', justifyContent: 'center' },
  hyroxProgramTitle:  { fontFamily: Fonts.sansBold, fontSize: 18, color: Colors.beige[800], letterSpacing: -0.3, marginBottom: 3 },
  hyroxProgramDesc:   { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[500], lineHeight: 17 },
  hyroxProgramStatus: { fontFamily: Fonts.sansSemiBold, fontSize: 11, color: Colors.coral[600], marginTop: 5 },

  // ── HYROX goal card ──────────────────────────────────────────────────────
  hyroxGoalCard: {
    marginHorizontal: Spacing.xl, marginTop: 16, marginBottom: 12,
    backgroundColor: Colors.cream, borderRadius: Radius.lg,
    padding: 16, borderWidth: 1.5, borderColor: Colors.coral[200],
  },
  hyroxGoalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  hyroxGoalCardTitle:  { fontFamily: Fonts.sansBold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: Colors.coral[600] },
  hyroxGoalEditBtn:    { backgroundColor: Colors.coral[50], borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: Colors.coral[200] },
  hyroxGoalEditTxt:    { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.coral[600] },
  hyroxGoalCompName:   { fontFamily: Fonts.serifSemiBold, fontSize: 20, color: Colors.beige[800], marginBottom: 10 },
  hyroxGoalRow:        { flexDirection: 'row', gap: 16, marginBottom: 12 },
  hyroxGoalItem:       {},
  hyroxGoalItemLbl:    { fontFamily: Fonts.sansLight, fontSize: 10, color: Colors.beige[400], marginBottom: 2 },
  hyroxGoalItemVal:    { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.beige[800] },
  hyroxTimeRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  hyroxTimeBlock:      { flex: 1 },
  hyroxTimeLbl:        { fontFamily: Fonts.sansLight, fontSize: 10, color: Colors.beige[400], marginBottom: 2 },
  hyroxTimeVal:        { fontFamily: Fonts.serifSemiBold, fontSize: 28, color: Colors.beige[800] },
  hyroxTimeSep:        { paddingHorizontal: 8 },
  hyroxTimeSepTxt:     { fontFamily: Fonts.sansSemiBold, fontSize: 20, color: Colors.beige[200] },
  hyroxGapRow:         { backgroundColor: Colors.coral[50], borderRadius: 8, padding: 10, marginBottom: 8 },
  hyroxGapTxt:         { fontFamily: Fonts.sans, fontSize: 13, color: Colors.beige[800] },
  hyroxPaceTxt:        { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], marginTop: 4 },
  hyroxGoalEmpty:      { paddingVertical: 6 },
  hyroxChallengeTitle: { fontFamily: Fonts.serifSemiBold, fontSize: 18, color: Colors.beige[800], marginBottom: 8, lineHeight: 24 },
  hyroxChallengeDesc:  { fontFamily: Fonts.sansLight, fontSize: 13, color: Colors.beige[600], lineHeight: 19, marginBottom: 16 },
  hyroxChallengeBtn:   { backgroundColor: Colors.coral[400], borderRadius: Radius.md, paddingVertical: 13, paddingHorizontal: 18, alignSelf: 'flex-start' },
  hyroxChallengeBtnTxt:{ fontFamily: Fonts.sansBold, fontSize: 13, color: Colors.cream, letterSpacing: 0.2 },

  // ── Personalised plan ────────────────────────────────────────────────────
  personalPlanCard: {
    marginHorizontal: Spacing.xl, marginBottom: 12,
    backgroundColor: Colors.cream, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.sky[200], overflow: 'hidden',
  },
  personalPlanHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.sky[100] },
  personalPlanCountdown: { fontFamily: Fonts.sansBold, fontSize: 13, color: Colors.sky[600] },
  personalPlanName:      { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 3 },
  personalPlanViewBtn:   { backgroundColor: Colors.sky[50], borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: Colors.sky[200] },
  personalPlanViewTxt:   { fontFamily: Fonts.sansSemiBold, fontSize: 11, color: Colors.sky[600] },
  personalPlanFocus:     { backgroundColor: Colors.coral[50], paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.coral[100] },
  personalPlanFocusLbl:  { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 0.5, color: Colors.coral[600], marginBottom: 3 },
  personalPlanFocusVal:  { fontFamily: Fonts.sans, fontSize: 12, color: Colors.beige[800] },
  personalPlanWeekTitle: { fontFamily: Fonts.sansBold, fontSize: 12, color: Colors.beige[600], paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  personalPlanSession:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: 1, borderTopColor: Colors.beige[50] },
  personalPlanDot:       { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  personalPlanSessionDay:  { fontFamily: Fonts.sans, fontSize: 12, color: Colors.beige[600] },
  personalPlanSessionDesc: { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 2, lineHeight: 15 },
  personalPlanSessionDur:  { fontFamily: Fonts.sansLight, fontSize: 10, color: Colors.beige[400], minWidth: 36, textAlign: 'right', marginTop: 2 },

  // ── HYROX simulation ─────────────────────────────────────────────────────
  hyroxSimSection: {
    marginHorizontal: Spacing.xl, marginBottom: 16,
    backgroundColor: Colors.beige[800], borderRadius: Radius.lg, padding: 18,
  },
  hyroxSimHeader:  { marginBottom: 14 },
  hyroxSimTitle:   { fontFamily: Fonts.sansBold, fontSize: 18, color: Colors.cream, letterSpacing: -0.3 },
  hyroxSimBest:    { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[200], marginTop: 4 },
  hyroxSimBtn:     { backgroundColor: Colors.coral[400], borderRadius: Radius.md, padding: 14, alignItems: 'center' },
  hyroxSimBtnTxt:  { fontFamily: Fonts.sansBold, fontSize: 15, color: Colors.cream, letterSpacing: 0.3 },
  hyroxSimCard:    {
    marginHorizontal: Spacing.xl, marginBottom: 10,
    backgroundColor: Colors.cream, borderRadius: Radius.lg,
    padding: 14, borderWidth: 1, borderColor: Colors.beige[100],
  },
  hyroxSimCardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  hyroxSimCardDate:      { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.beige[600] },
  hyroxSimCardTimeBadge: { backgroundColor: Colors.coral[50], borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.coral[200] },
  hyroxSimCardTime:      { fontFamily: Fonts.sansBold, fontSize: 15, color: Colors.coral[600] },
  hyroxStationsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  hyroxStationChip:      { backgroundColor: Colors.beige[50], borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: Colors.beige[100], minWidth: 80 },
  hyroxStationName:      { fontFamily: Fonts.sansSemiBold, fontSize: 10, color: Colors.beige[600] },
  hyroxStationTime:      { fontFamily: Fonts.sansLight, fontSize: 10, color: Colors.coral[600], marginTop: 2 },

  // ── Insights ─────────────────────────────────────────────────────────────
  insightsCard:     { marginHorizontal: Spacing.xl, marginBottom: 12, backgroundColor: Colors.sky[50], borderRadius: Radius.lg, padding: 14, borderWidth: 1, borderColor: Colors.sky[100] },
  insightRow:       { flexDirection: 'row', gap: 10, paddingVertical: 6 },
  insightRowBorder: { borderTopWidth: 1, borderTopColor: Colors.sky[100] },
  insightDot:       { fontFamily: Fonts.sansBold, fontSize: 16, color: Colors.sky[400] },
  insightTxt:       { flex: 1, fontFamily: Fonts.sans, fontSize: 13, color: Colors.beige[600], lineHeight: 19 },

  // ── Training plan cards ──────────────────────────────────────────────────
  planCard: {
    width: 160, backgroundColor: Colors.cream,
    borderRadius: Radius.lg, padding: 16,
    borderWidth: 1, borderColor: Colors.beige[100],
  },
  planCardWeeks:    { fontFamily: Fonts.serifSemiBold, fontSize: 40, color: Colors.beige[800], lineHeight: 42 },
  planCardWeeksLbl: { fontFamily: Fonts.sansLight, fontSize: 10, color: Colors.beige[400], marginBottom: 6 },
  planCardName:     { fontFamily: Fonts.sansBold, fontSize: 13, color: Colors.beige[800], marginBottom: 4 },
  planCardFocus:    { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginBottom: 6, lineHeight: 15 },
  planCardSessions: { fontFamily: Fonts.sansLight, fontSize: 10, color: Colors.beige[400], marginBottom: 12 },
  planCardBtn:      { backgroundColor: Colors.beige[800], borderRadius: Radius.md, paddingVertical: 8, alignItems: 'center' },
  planCardBtnTxt:   { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.cream },

  // ── HYROX remove ────────────────────────────────────────────────────────
  hyroxRemoveBtn: { alignSelf: 'center', padding: 10 },
  hyroxRemoveTxt: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], textDecorationLine: 'underline' },

  // ── inputSubLbl ──────────────────────────────────────────────────────────
  inputSubLbl: { fontFamily: Fonts.sansLight, fontSize: 10, color: Colors.beige[400], marginBottom: 4 },
});
