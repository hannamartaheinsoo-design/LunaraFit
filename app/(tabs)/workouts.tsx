import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
  TextInput, Modal, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { Button } from '../../components/ui/Button';
import { storage } from '../../lib/storage';
import { formatDate, todayISO, getPhaseKey } from '../../lib/cycle';
import { PHASE_LABELS } from '../../lib/cycle';
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

const FEEL_CHIPS = ['Väsinud', 'Energiline', 'Tugev', 'Raske', 'Kerge', 'Motiveeritud'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoggedExercise {
  template: ExerciseTemplate;
  sets: ExerciseSet[];
}

// ─── Exercise Picker Modal ────────────────────────────────────────────────────
function ExercisePicker({
  visible,
  onSelect,
  onClose,
}: {
  visible: boolean;
  onSelect: (ex: ExerciseTemplate) => void;
  onClose: () => void;
}) {
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
          {/* Header */}
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Vali harjutus</Text>
            <TouchableOpacity onPress={onClose} style={styles.pickerClose}>
              <Icon name="close" size={20} color={Colors.beige[600]} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Icon name="search" size={16} color={Colors.beige[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Otsi harjutust..."
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

          {/* Category filter — fixed height, no overlap */}
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

        {/* Results list — flex:1 so it doesn't overflow */}
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          ListEmptyComponent={
            query ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsTxt}>Harjutust „{query}" ei leitud.</Text>
                <Text style={[styles.noResultsTxt, { fontSize: 11, marginTop: 4 }]}>
                  Kasuta alumist välja, et see kohe lisada.
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
                        <Text style={styles.customBadgeTxt}>KOHANDATUD</Text>
                      </View>
                    )}
                    {isRecent && !item.custom && (
                      <View style={styles.recentBadge}>
                        <Text style={styles.recentBadgeTxt}>HILJUTINE</Text>
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

        {/* Always-visible custom name bar at bottom */}
        <View style={[styles.pickerFooter, { paddingBottom: insets.bottom + 8 }]}>
          <Text style={styles.customNameLbl}>
            Ei leia? Kirjuta oma harjutuse nimi:
          </Text>
          <View style={styles.createRow}>
            <TextInput
              style={styles.createInput}
              placeholder={query || 'nt Kätekõverdus, Jooks...'}
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
              <Text style={styles.createBtnTxt}>Lisa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Set Logger ───────────────────────────────────────────────────────────────
function SetLogger({
  exercise,
  sets,
  onChange,
  onRemove,
}: {
  exercise: ExerciseTemplate;
  sets: ExerciseSet[];
  onChange: (sets: ExerciseSet[]) => void;
  onRemove: () => void;
}) {
  const addSet = () => onChange([...sets, {}]);
  const removeSet = (i: number) => onChange(sets.filter((_, idx) => idx !== i));
  const updateSet = (i: number, key: keyof ExerciseSet, val: string) => {
    const n = parseFloat(val) || undefined;
    onChange(sets.map((s, idx) => idx === i ? { ...s, [key]: n } : s));
  };

  const showWeight   = exercise.fields.includes('weight');
  const showReps     = exercise.fields.includes('reps');
  const showDuration = exercise.fields.includes('duration');
  const showDistance = exercise.fields.includes('distance');
  const isSets       = exercise.fields.includes('sets');
  const cat          = CATEGORIES.find(c => c.id === exercise.category);

  return (
    <View style={styles.setLogCard}>
      {/* Exercise header */}
      <View style={styles.setLogHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.setLogName}>{exercise.name}</Text>
          <Text style={styles.setLogCat}>{cat?.label ?? exercise.category}</Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeExBtn}>
          <Icon name="trash" size={16} color={Colors.error.text} />
        </TouchableOpacity>
      </View>

      {/* Column headers */}
      {sets.length > 0 && (
        <View style={styles.setColHeaders}>
          {isSets && <Text style={styles.setColHdr}>Seeria</Text>}
          {showReps     && <Text style={styles.setColHdr}>Kord.</Text>}
          {showWeight   && <Text style={styles.setColHdr}>kg</Text>}
          {showDuration && <Text style={styles.setColHdr}>min</Text>}
          {showDistance && <Text style={styles.setColHdr}>km</Text>}
          <View style={{ width: 24 }} />
        </View>
      )}

      {/* Set rows */}
      {sets.map((s, i) => (
        <View key={i} style={styles.setRow}>
          {isSets && (
            <View style={styles.setNumWrap}>
              <Text style={styles.setNum}>{i + 1}</Text>
            </View>
          )}
          {showReps && (
            <TextInput
              style={styles.setInput}
              placeholder="—"
              placeholderTextColor={Colors.beige[200]}
              keyboardType="numeric"
              value={s.reps != null ? String(s.reps) : ''}
              onChangeText={v => updateSet(i, 'reps', v)}
            />
          )}
          {showWeight && (
            <TextInput
              style={styles.setInput}
              placeholder="—"
              placeholderTextColor={Colors.beige[200]}
              keyboardType="decimal-pad"
              value={s.weight_kg != null ? String(s.weight_kg) : ''}
              onChangeText={v => updateSet(i, 'weight_kg', v)}
            />
          )}
          {showDuration && (
            <TextInput
              style={styles.setInput}
              placeholder="—"
              placeholderTextColor={Colors.beige[200]}
              keyboardType="decimal-pad"
              value={s.duration_min != null ? String(s.duration_min) : ''}
              onChangeText={v => updateSet(i, 'duration_min', v)}
            />
          )}
          {showDistance && (
            <TextInput
              style={styles.setInput}
              placeholder="—"
              placeholderTextColor={Colors.beige[200]}
              keyboardType="decimal-pad"
              value={s.distance_km != null ? String(s.distance_km) : ''}
              onChangeText={v => updateSet(i, 'distance_km', v)}
            />
          )}
          <TouchableOpacity onPress={() => removeSet(i)} style={styles.removeSetBtn}>
            <Icon name="close" size={12} color={Colors.beige[400]} />
          </TouchableOpacity>
        </View>
      ))}

      {/* Add set */}
      <TouchableOpacity style={styles.addSetBtn} onPress={addSet}>
        <Icon name="plus" size={12} color={Colors.beige[600]} />
        <Text style={styles.addSetTxt}>
          {sets.length === 0 ? 'Lisa seeria' : 'Lisa seeria'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Builder state
  const [date, setDate] = useState(todayISO());
  const [workoutName, setWorkoutName] = useState('');
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [feel, setFeel] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'log' | 'progress'>('log');

  useEffect(() => {
    storage.getWorkouts().then(setWorkouts);
  }, []);

  const resetBuilder = () => {
    setDate(todayISO());
    setWorkoutName('');
    setLoggedExercises([]);
    setFeel(new Set());
    setNotes('');
  };

  const handleAddExercise = (template: ExerciseTemplate) => {
    setLoggedExercises(prev => [...prev, { template, sets: [{}] }]);
  };

  const handleSave = async () => {
    if (!date) { Alert.alert('', 'Palun vali kuupäev'); return; }
    if (loggedExercises.length === 0) { Alert.alert('', 'Lisa vähemalt üks harjutus'); return; }

    const name = workoutName.trim() || loggedExercises[0].template.name;

    const profile = await storage.getProfile();
    const phase = getPhaseKey(
      date,
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

    const workout: Workout = {
      id: Date.now().toString(),
      user_id: 'local',
      date,
      name,
      exercises,
      feel: Array.from(feel),
      notes: notes.trim(),
      phase,
      created_at: new Date().toISOString(),
    };

    const updated = await storage.addWorkout(workout);
    setWorkouts(updated);
    resetBuilder();
    setShowBuilder(false);

    // PR detection
    const prs = detectNewPRs(updated, workout.id);
    if (prs.length > 0) {
      const prLines = prs.map(pr =>
        `🏆 ${pr.exerciseName}: ${pr.value}${pr.unit} (+${pr.improvement}${pr.type === 'weight' || pr.type === 'distance' ? '%' : ''})`
      ).join('\n');
      Alert.alert('Uus isiklik rekord!', prLines);
    } else {
      Alert.alert('', 'Treeningkord salvestatud ✓');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Kustuta?', '', [
      { text: 'Tühista', style: 'cancel' },
      { text: 'Kustuta', style: 'destructive', onPress: async () => setWorkouts(await storage.deleteWorkout(id)) },
    ]);
  };

  // ── Workout Builder ────────────────────────────────────────────────────────
  if (showBuilder) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => { resetBuilder(); setShowBuilder(false); }} style={styles.backBtn}>
            <Icon name="arr-l" size={20} color={Colors.beige[600]} />
          </TouchableOpacity>
          <Text style={styles.heading}>Uus treening</Text>
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave}>
            <Text style={styles.saveHeaderTxt}>Salvesta</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Date */}
            <View style={styles.builderSection}>
              <Text style={styles.fieldLbl}>Kuupäev</Text>
              <TextInput
                style={styles.fieldInput}
                value={date}
                onChangeText={setDate}
                placeholder="aaaa-kk-pp"
                placeholderTextColor={Colors.beige[200]}
              />
            </View>

            {/* Workout name */}
            <View style={styles.builderSection}>
              <Text style={styles.fieldLbl}>Treeningu nimi (vabatahtlik)</Text>
              <TextInput
                style={styles.fieldInput}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder={loggedExercises[0]?.template.name ?? 'nt Ülaosa jõutreening'}
                placeholderTextColor={Colors.beige[200]}
              />
            </View>

            {/* Exercises */}
            <View style={styles.sectionLblRow}>
              <Icon name="barbell" size={12} color={Colors.beige[400]} />
              <Text style={styles.sectionLbl}>Harjutused</Text>
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
              onPress={() => setShowPicker(true)}
            >
              <Icon name="plus" size={16} color={Colors.beige[800]} />
              <Text style={styles.addExerciseTxt}>Lisa harjutus</Text>
            </TouchableOpacity>

            {/* How did it feel */}
            <View style={[styles.sectionLblRow, { marginTop: 8 }]}>
              <Icon name="smile-good" size={12} color={Colors.beige[400]} />
              <Text style={styles.sectionLbl}>Kuidas tundus?</Text>
            </View>
            <View style={styles.chips}>
              {FEEL_CHIPS.map(chip => (
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
              <Text style={styles.fieldLbl}>Märkmed (vabatahtlik)</Text>
              <TextInput
                style={[styles.fieldInput, { height: 72, textAlignVertical: 'top', paddingTop: 12 }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Midagi tähelepanuväärset?"
                placeholderTextColor={Colors.beige[200]}
                multiline
              />
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        <ExercisePicker
          visible={showPicker}
          onSelect={handleAddExercise}
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
          <Text style={styles.heading}>Treeningud</Text>
          <Text style={styles.subheading}>Lisa Treeningkordi · Jälgi Arengut</Text>
        </View>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'log' && styles.tabBtnOn]}
          onPress={() => setActiveTab('log')} activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnTxt, activeTab === 'log' && styles.tabBtnTxtOn]}>Logi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'progress' && styles.tabBtnOn]}
          onPress={() => setActiveTab('progress')} activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnTxt, activeTab === 'progress' && styles.tabBtnTxtOn]}>Areng</Text>
          {progress.some(p => p.isNew) && <View style={styles.prDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'progress' ? (
          <>
            {workouts.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTxt}>Arengut pole veel näidata.</Text>
                <Text style={styles.emptyHint}>Lisa oma esimesed treeningkorrad!</Text>
              </View>
            ) : (
              <>
                {/* Stats overview */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statVal}>{stats.totalWorkouts}</Text>
                    <Text style={styles.statLbl}>Treeningut kokku</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statVal}>{stats.currentStreak}</Text>
                    <Text style={styles.statLbl}>Praegune järjekord</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statVal}>{stats.uniqueExercises}</Text>
                    <Text style={styles.statLbl}>Eri harjutust</Text>
                  </View>
                </View>

                {/* Monthly comparison */}
                {(stats.totalThisMonth > 0 || stats.totalLastMonth > 0) && (
                  <View style={styles.monthCard}>
                    <View style={styles.monthRow}>
                      <View>
                        <Text style={styles.monthVal}>{stats.totalThisMonth}</Text>
                        <Text style={styles.monthLbl}>See kuu</Text>
                      </View>
                      <View style={styles.monthArrow}>
                        <Text style={[styles.monthTrend, { color: stats.monthTrend >= 0 ? Colors.green[600] : Colors.blush[400] }]}>
                          {stats.monthTrend >= 0 ? '↑' : '↓'} {Math.abs(stats.monthTrend)}%
                        </Text>
                        <Text style={styles.monthSub}>vs eelmine kuu</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.monthVal}>{stats.totalLastMonth}</Text>
                        <Text style={styles.monthLbl}>Eelmine kuu</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Weekly volume chart */}
                <View style={styles.sectionLblRow}>
                  <Icon name="wave" size={12} color={Colors.beige[400]} />
                  <Text style={styles.sectionLbl}>Nädala maht (kg)</Text>
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
                              backgroundColor: i === weekly.length - 1 ? Colors.blush[400] : Colors.beige[200] }
                          ]} />
                        </View>
                        <Text style={styles.chartWeekLbl}>{w.weekLabel}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Exercise progress */}
                <View style={styles.sectionLblRow}>
                  <Icon name="spark" size={12} color={Colors.beige[400]} />
                  <Text style={styles.sectionLbl}>Harjutuste areng</Text>
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
                          {p.totalSessions} {p.totalSessions === 1 ? 'kord' : 'korda'} logitud
                        </Text>
                      </View>
                    </View>

                    {/* Metrics */}
                    <View style={styles.progressMetrics}>
                      {p.bestWeight > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={styles.progressMetricVal}>{p.bestWeight} kg</Text>
                          <Text style={styles.progressMetricLbl}>Parim raskus</Text>
                          {p.weightGainPct !== null && p.weightGainPct > 0 && (
                            <Text style={styles.progressGain}>+{p.weightGainPct}%</Text>
                          )}
                        </View>
                      )}
                      {p.bestReps > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={styles.progressMetricVal}>{p.bestReps}</Text>
                          <Text style={styles.progressMetricLbl}>Parim kordus</Text>
                        </View>
                      )}
                      {p.bestDistance > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={styles.progressMetricVal}>{p.bestDistance} km</Text>
                          <Text style={styles.progressMetricLbl}>Parim distants</Text>
                        </View>
                      )}
                      {p.bestDuration > 0 && (
                        <View style={styles.progressMetric}>
                          <Text style={styles.progressMetricVal}>{p.bestDuration} min</Text>
                          <Text style={styles.progressMetricLbl}>Pikim kestus</Text>
                        </View>
                      )}
                    </View>

                    {/* Mini sparkline */}
                    {p.sessions.length >= 2 && p.bestWeight > 0 && (
                      <View style={styles.sparkline}>
                        {p.sessions.slice(-8).map((s, i, arr) => {
                          const max = Math.max(...arr.map(x => x.weight));
                          const h = max > 0 ? Math.max((s.weight / max) * 32, 4) : 4;
                          const isLast = i === arr.length - 1;
                          return (
                            <View key={i} style={styles.sparkBarWrap}>
                              <View style={[
                                styles.sparkBar,
                                { height: h, backgroundColor: isLast ? Colors.blush[400] : Colors.beige[200] }
                              ]} />
                            </View>
                          );
                        })}
                        <Text style={styles.sparkLbl}>viimased {Math.min(p.sessions.length, 8)} seanssi</Text>
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}
            <View style={{ height: 24 }} />
          </>
        ) : null}

        {activeTab === 'log' && (
          <>
        {/* CTA */}
        <TouchableOpacity
          style={styles.newWorkoutBtn}
          activeOpacity={0.85}
          onPress={() => setShowBuilder(true)}
        >
          <Icon name="plus" size={18} color={Colors.cream} />
          <Text style={styles.newWorkoutTxt}>Lisa treeningkord</Text>
        </TouchableOpacity>

        {/* History */}
        <View style={styles.sectionLblRow}>
          <Icon name="eye" size={12} color={Colors.beige[400]} />
          <Text style={styles.sectionLbl}>Logitud treeningud</Text>
        </View>

        {workouts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTxt}>Treeninguid pole veel lisatud.</Text>
            <Text style={styles.emptyHint}>Alusta oma esimese treeninguga 💪</Text>
          </View>
        ) : (
          workouts.slice(0, 30).map(w => (
            <View key={w.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutName}>{w.name}</Text>
                  <Text style={styles.workoutMeta}>
                    {formatDate(w.date)} · {PHASE_LABELS[w.phase]}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(w.id)} style={styles.deleteBtn}>
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
                        if (s.reps)        parts.push(`${s.reps}×`);
                        if (s.weight_kg)   parts.push(`${s.weight_kg}kg`);
                        if (s.duration_min)parts.push(`${s.duration_min}min`);
                        if (s.distance_km) parts.push(`${s.distance_km}km`);
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.cream },
  topBar:  {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.beige[50],
  },
  heading:    { fontFamily: Fonts.serifSemiBold, fontSize: 26, color: Colors.beige[800] },
  subheading: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[400], marginTop: 2 },
  scroll: { flex: 1 },

  // New workout CTA
  newWorkoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    margin: Spacing.xl, padding: 16, borderRadius: Radius.lg,
    backgroundColor: Colors.beige[800],
  },
  newWorkoutTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.cream },

  // Section label
  sectionLblRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.xl, marginBottom: 10, marginTop: 4,
  },
  sectionLbl: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.2,
    textTransform: 'uppercase', color: Colors.beige[400],
  },

  // Past workout cards
  workoutCard: {
    marginHorizontal: Spacing.xl, marginBottom: 10,
    backgroundColor: Colors.cream, borderRadius: Radius.lg,
    padding: 14, borderWidth: 1, borderColor: Colors.beige[100],
  },
  workoutHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  workoutName:   { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.beige[800] },
  workoutMeta:   { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 2 },
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
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.beige[100],
  },
  tabBtnOn:    { backgroundColor: Colors.beige[800], borderColor: Colors.beige[800] },
  tabBtnTxt:   { fontFamily: Fonts.sansSemiBold, fontSize: 12, color: Colors.beige[500] },
  tabBtnTxtOn: { color: Colors.cream },
  prDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.blush[400] },

  // Progress stats
  statsGrid: {
    flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.xl, marginTop: 14, marginBottom: 8,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.beige[50], borderRadius: Radius.md,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.beige[100],
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
  prBadge:         { backgroundColor: Colors.blush[50], borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: Colors.blush[200] },
  prBadgeTxt:      { fontFamily: Fonts.sansBold, fontSize: 9, color: Colors.blush[700] },
  progressMetrics: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  progressMetric:  { alignItems: 'center' },
  progressMetricVal: { fontFamily: Fonts.serifSemiBold, fontSize: 20, color: Colors.beige[800] },
  progressMetricLbl: { fontFamily: Fonts.sansLight, fontSize: 9, color: Colors.beige[400], marginTop: 1 },
  progressGain:    { fontFamily: Fonts.sansSemiBold, fontSize: 10, color: Colors.green[600], marginTop: 2 },

  sparkline:      { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 4, height: 40 },
  sparkBarWrap:   { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 32 },
  sparkBar:       { width: '80%', borderRadius: 3 },
  sparkLbl:       { fontFamily: Fonts.sansLight, fontSize: 9, color: Colors.beige[300], position: 'absolute', bottom: -14, right: 0 },

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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: Spacing.xl, marginBottom: 8, padding: 14,
    borderRadius: Radius.md, borderWidth: 1.5,
    borderColor: Colors.beige[200], borderStyle: 'dashed',
  },
  addExerciseTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 13, color: Colors.beige[800] },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: Spacing.xl, marginBottom: 14 },
  chip:     { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.beige[100], backgroundColor: Colors.cream },
  chipOn:   { backgroundColor: Colors.blush[50], borderColor: Colors.blush[400] },
  chipTxt:  { fontFamily: Fonts.sans, fontSize: 12, color: Colors.beige[600] },
  chipTxtOn:{ fontFamily: Fonts.sansSemiBold, color: Colors.blush[800] },

  // ── Set Logger ──────────────────────────────────────────────────────────
  setLogCard: {
    marginHorizontal: Spacing.xl, marginBottom: 10,
    backgroundColor: Colors.beige[50], borderRadius: Radius.lg,
    padding: 14, borderWidth: 1, borderColor: Colors.beige[100],
  },
  setLogHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  setLogName:    { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.beige[800] },
  setLogCat:     { fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginTop: 1 },
  removeExBtn:   { padding: 4 },
  setColHeaders: { flexDirection: 'row', marginBottom: 4, gap: 6 },
  setColHdr:     { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.beige[400], flex: 1, textAlign: 'center' },
  setRow:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  setNumWrap:    { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.beige[200], alignItems: 'center', justifyContent: 'center' },
  setNum:        { fontFamily: Fonts.sansBold, fontSize: 11, color: Colors.beige[600] },
  setInput:      {
    flex: 1, borderWidth: 1.5, borderColor: Colors.beige[100], borderRadius: 9,
    backgroundColor: Colors.cream, fontFamily: Fonts.sansSemiBold,
    fontSize: 14, color: Colors.beige[800], paddingVertical: 8, textAlign: 'center',
  },
  removeSetBtn:  { padding: 4 },
  addSetBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 6 },
  addSetTxt:     { fontFamily: Fonts.sans, fontSize: 12, color: Colors.beige[600] },

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
  // Fixed-height category row — no overlap
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

  // Always-visible custom name footer
  pickerFooter: {
    paddingHorizontal: Spacing.xl, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.beige[100],
    backgroundColor: Colors.cream,
  },
  customNameLbl: {
    fontFamily: Fonts.sansLight, fontSize: 11, color: Colors.beige[400], marginBottom: 8,
  },
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
