import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
  TextInput, Modal, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
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
      <View style={styles.pickerSafe}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.cream }}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{t('w.picker.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.pickerClose}>
              <Icon name="close" size={20} color={Colors.beige[600]} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color={Colors.beige[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('w.picker.search')}
              placeholderTextColor={Colors.beige[300]}
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
                <Icon name="chevr" size={16} color={Colors.beige[300]} />
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

  const workouts     = useQuery(api.workouts.list) ?? [];
  const profile      = useQuery(api.profiles.get);
  const routines     = useQuery(api.routines.list) ?? [];
  const addWorkout   = useMutation(api.workouts.add);
  const removeWorkout = useMutation(api.workouts.remove);
  const addRoutine    = useMutation(api.routines.add);
  const updateRoutine = useMutation(api.routines.update);
  const removeRoutine = useMutation(api.routines.remove);

  const yesterdayISO = () => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  };

  const effectiveDate = dateMode === 'today' ? todayISO() : dateMode === 'yesterday' ? yesterdayISO() : date;

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

    const prs = detectNewPRs(workouts, workoutId as string);
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
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => { resetRoutineBuilder(); setShowRoutineBuilder(false); }} style={styles.backBtn}>
            <Icon name="arr-l" size={20} color={Colors.beige[600]} />
          </TouchableOpacity>
          <Text style={styles.heading}>{editingRoutineId ? t('w.routine.edit.title') : t('w.routine.builder.title')}</Text>
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
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => { resetBuilder(); setShowBuilder(false); }} style={styles.backBtn}>
            <Icon name="arr-l" size={20} color={Colors.beige[600]} />
          </TouchableOpacity>
          <Text style={styles.heading}>{t('w.builder.title')}</Text>
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
                <TextInput
                  style={[styles.fieldInput, { marginTop: 8 }]}
                  value={date}
                  onChangeText={setDate}
                  placeholder={lang === 'en' ? 'yyyy-mm-dd' : 'aaaa-kk-pp'}
                  placeholderTextColor={Colors.beige[200]}
                  autoFocus
                />
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
  const stats    = getWorkoutStats(workouts);
  const progress = getExerciseProgress(workouts);
  const weekly   = getWeeklyVolume(workouts, 6);
  const maxVol   = Math.max(...weekly.map(w => w.totalKg), 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.heading}>{t('w.heading')}</Text>
          <Text style={styles.subheading}>{t('w.sub')}</Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {(['log', 'routines', 'progress'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnOn]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnTxt, activeTab === tab && styles.tabBtnTxtOn]}>
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
                  <Icon name="folder" size={12} color={Colors.beige[400]} />
                  <Text style={styles.sectionLbl}>{t('w.routine.lbl')}</Text>
                </View>
                {routines.map(r => (
                  <TouchableOpacity
                    key={r._id}
                    style={styles.routineLogCard}
                    activeOpacity={0.8}
                    onPress={() => openBuilderFromRoutine(r)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.routineLogName}>{r.name}</Text>
                      <Text style={styles.routineLogEx} numberOfLines={1}>
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
              <Icon name="eye" size={12} color={Colors.beige[400]} />
              <Text style={styles.sectionLbl}>{t('w.log.lbl')}</Text>
            </View>

            {workouts.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTxt}>{t('w.empty')}</Text>
                <Text style={styles.emptyHint}>{t('w.empty.hint')}</Text>
              </View>
            ) : (
              workouts.slice(0, 30).map(w => (
                <View key={w._id} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.workoutName}>{w.name}</Text>
                      <Text style={styles.workoutMeta}>
                        {formatDate(w.date)} · {getPhaseLabel(w.phase, lang)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteWorkout(w._id)} style={styles.deleteBtn}>
                      <Icon name="trash" size={16} color={Colors.error.text} />
                    </TouchableOpacity>
                  </View>
                  {w.exercises.map((e, i) => (
                    <View key={i} style={styles.exLine}>
                      <Text style={styles.exName}>{e.name}</Text>
                      <Text style={styles.exStats}>
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
            <TouchableOpacity
              style={styles.newWorkoutBtn}
              activeOpacity={0.85}
              onPress={() => { resetRoutineBuilder(); setShowRoutineBuilder(true); }}
            >
              <Icon name="plus" size={18} color={Colors.cream} />
              <Text style={styles.newWorkoutTxt}>{t('w.routine.create')}</Text>
            </TouchableOpacity>

            {routines.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTxt}>{t('w.routine.empty')}</Text>
                <Text style={styles.emptyHint}>{t('w.routine.empty.hint')}</Text>
              </View>
            ) : (
              routines.map(r => (
                <View key={r._id} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.workoutName}>{r.name}</Text>
                      <Text style={styles.workoutMeta}>
                        {r.exercises.length} {lang === 'en' ? 'exercises' : 'harjutust'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => openRoutineForEdit(r)} style={[styles.deleteBtn, { marginRight: 4 }]}>
                      <Icon name="edit" size={16} color={Colors.beige[400]} />
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
                  <Icon name="wave" size={12} color={Colors.beige[400]} />
                  <Text style={styles.sectionLbl}>{t('w.progress.weekly')}</Text>
                </View>
                <View style={styles.chartCard}>
                  <View style={styles.chartBars}>
                    {weekly.map((w, i) => (
                      <View key={i} style={styles.chartCol}>
                        <Text style={styles.chartVolLbl}>
                          {w.totalKg > 0 ? (w.totalKg >= 1000 ? `${(w.totalKg/1000).toFixed(1)}t` : `${w.totalKg}`) : ''}
                        </Text>
                        <View style={styles.chartBarWrap}>
                          <View style={[
                            styles.chartBar,
                            { height: `${Math.max((w.totalKg / maxVol) * 100, w.totalKg > 0 ? 8 : 0)}%` as any,
                              backgroundColor: i === weekly.length - 1 ? Colors.blush[400] : Colors.beige[100] }
                          ]} />
                        </View>
                        <Text style={styles.chartWeekLbl}>{w.weekLabel}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.sectionLblRow}>
                  <Icon name="spark" size={12} color={Colors.beige[400]} />
                  <Text style={styles.sectionLbl}>{t('w.progress.exheader')}</Text>
                </View>

                {progress.filter(p => p.totalSessions >= 1).map(p => (
                  <View key={p.name} style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.progressNameRow}>
                          <Text style={styles.progressName}>{p.name}</Text>
                          {p.isNew && (
                            <View style={styles.prBadge}>
                              <Text style={styles.prBadgeTxt}>🏆 PR</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.progressMeta}>
                          {p.totalSessions} {t('w.progress.logged')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressMetrics}>
                      {p.bestWeight > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={styles.progressMetricVal}>{p.bestWeight} kg</Text>
                          <Text style={styles.progressMetricLbl}>{t('w.progress.bestkg')}</Text>
                          {p.weightGainPct !== null && p.weightGainPct > 0 && (
                            <Text style={styles.progressGain}>+{p.weightGainPct}%</Text>
                          )}
                        </View>
                      )}
                      {p.bestReps > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={styles.progressMetricVal}>{p.bestReps}</Text>
                          <Text style={styles.progressMetricLbl}>{t('w.progress.bestreps')}</Text>
                        </View>
                      )}
                      {p.bestDistance > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={styles.progressMetricVal}>{p.bestDistance} km</Text>
                          <Text style={styles.progressMetricLbl}>{t('w.progress.bestdist')}</Text>
                        </View>
                      )}
                      {p.bestDuration > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={styles.progressMetricVal}>{p.bestDuration} min</Text>
                          <Text style={styles.progressMetricLbl}>{t('w.progress.bestdur')}</Text>
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
  reorderArrow:    { fontFamily: Fonts.sansBold, fontSize: 11, color: Colors.beige[500] },

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
  tabBtnTxt:   { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.beige[500] },
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
  sparkLbl:     { fontFamily: Fonts.sansLight, fontSize: 9, color: Colors.beige[300], position: 'absolute', bottom: -14, right: 0 },

  empty:    { alignItems: 'center', paddingVertical: 40 },
  emptyTxt: { fontFamily: Fonts.sansLight, fontSize: 14, color: Colors.beige[400] },
  emptyHint:{ fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[300], marginTop: 6 },

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
  saveMsgTxt:    { fontFamily: Fonts.sans, fontSize: 13, color: Colors.blush[700], textAlign: 'center' },

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
});
