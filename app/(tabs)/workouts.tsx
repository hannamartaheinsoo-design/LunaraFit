import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Chip } from '../../components/ui/Chip';
import { Label } from '../../components/ui/Typography';
import { storage } from '../../lib/storage';
import { formatDate, todayISO } from '../../lib/cycle';
import { Workout, Exercise } from '../../types';
import { PHASE_LABELS } from '../../lib/cycle';

const FEEL_CHIPS = ['Väsinud', 'Energiline', 'Tugev', 'Raske', 'Kerge', 'Motiveeritud'];

function ExerciseRow({
  exercise,
  onChange,
  onRemove,
}: {
  exercise: Exercise;
  onChange: (e: Exercise) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.exRow}>
      <View style={styles.exNameRow}>
        <TextInput
          style={styles.exNameInput}
          placeholder="Harjutuse nimi"
          placeholderTextColor={Colors.beige[200]}
          value={exercise.name}
          onChangeText={(v) => onChange({ ...exercise, name: v })}
        />
        <TouchableOpacity onPress={onRemove} style={styles.exRemove}>
          <Text style={{ color: Colors.beige[400], fontSize: 16 }}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.exMetrics}>
        {[
          { label: 'Seeriad', field: 'sets' as const },
          { label: 'Kordused', field: 'reps' as const },
          { label: 'kg', field: 'weight_kg' as const },
        ].map(({ label, field }) => (
          <View key={field} style={styles.metricWrap}>
            <Text style={styles.metricLbl}>{label}</Text>
            <TextInput
              style={styles.metricInput}
              placeholder="0"
              placeholderTextColor={Colors.beige[200]}
              keyboardType="numeric"
              value={exercise[field] ? String(exercise[field]) : ''}
              onChangeText={(v) => onChange({ ...exercise, [field]: parseFloat(v) || 0 })}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function newExercise(): Exercise {
  return { name: '', sets: 0, reps: 0, weight_kg: 0 };
}

export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [date, setDate] = useState(todayISO());
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([newExercise()]);
  const [feel, setFeel] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    storage.getWorkouts().then(setWorkouts);
  }, []);

  const toggleFeel = (chip: string) => {
    setFeel((prev) => {
      const next = new Set(prev);
      next.has(chip) ? next.delete(chip) : next.add(chip);
      return next;
    });
  };

  const handleSave = async () => {
    if (!date || !name.trim()) {
      Alert.alert('', 'Palun täida kuupäev ja treeningkava nimi');
      return;
    }
    const validExs = exercises.filter((e) => e.name.trim());
    if (!validExs.length) {
      Alert.alert('', 'Lisa vähemalt üks harjutus');
      return;
    }
    const profile = await storage.getProfile();
    const { getPhaseKey } = await import('../../lib/cycle');
    const phase = getPhaseKey(
      date,
      profile?.last_period_date ?? null,
      profile?.cycle_length ?? 28,
      profile?.period_length ?? 5,
    );
    const workout: Workout = {
      id: Date.now().toString(),
      user_id: 'local',
      date,
      name: name.trim(),
      exercises: validExs,
      feel: Array.from(feel),
      notes: notes.trim(),
      phase,
      created_at: new Date().toISOString(),
    };
    const updated = await storage.addWorkout(workout);
    setWorkouts(updated);
    setName('');
    setNotes('');
    setExercises([newExercise()]);
    setFeel(new Set());
    Alert.alert('', 'Treeningkord salvestatud ✓');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Kustuta?', '', [
      { text: 'Tühista', style: 'cancel' },
      {
        text: 'Kustuta', style: 'destructive',
        onPress: async () => setWorkouts(await storage.deleteWorkout(id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.heading}>Treeningud</Text>
          <Text style={styles.subheading}>Lisa treeningkordi · jälgi arengut</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setExercises((prev) => [...prev, newExercise()])}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLbl}>+ Lisa treeningkord</Text>
        <Card>
          <Input label="Kuupäev" value={date} onChangeText={setDate} placeholder="aaaa-kk-pp" />
          <Input label="Treeningkava nimi" value={name} onChangeText={setName} placeholder="nt Ülakeha jõutreening" />

          <Label>Harjutused · seeriad · kordused · kaal (kg)</Label>
          {exercises.map((ex, i) => (
            <ExerciseRow
              key={i}
              exercise={ex}
              onChange={(updated) => setExercises((prev) => prev.map((e, j) => (j === i ? updated : e)))}
              onRemove={() => setExercises((prev) => prev.filter((_, j) => j !== i))}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onPress={() => setExercises((prev) => [...prev, newExercise()])}
            style={styles.addExBtn}
          >
            + Lisa harjutus
          </Button>

          <Label style={styles.mt}>Kuidas tundus?</Label>
          <View style={styles.chips}>
            {FEEL_CHIPS.map((chip) => (
              <Chip key={chip} label={chip} selected={feel.has(chip)} onPress={() => toggleFeel(chip)} />
            ))}
          </View>

          <Input label="Märkmed (vabatahtlik)" value={notes} onChangeText={setNotes} placeholder="Midagi tähelepanuväärset?" />

          <Button variant="dark" fullWidth onPress={handleSave} style={styles.saveBtn}>
            Salvesta treeningkord
          </Button>
        </Card>

        <Text style={styles.sectionLbl}>👁 Logitud treeningud</Text>
        {workouts.length === 0 ? (
          <Text style={styles.empty}>Treeninguid pole veel lisatud.</Text>
        ) : (
          workouts.slice(0, 20).map((w) => (
            <Card key={w.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workoutName}>{w.name}</Text>
                  <Text style={styles.workoutMeta}>{formatDate(w.date)} · {PHASE_LABELS[w.phase]}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(w.id)}>
                  <Text style={styles.deleteBtn}>🗑</Text>
                </TouchableOpacity>
              </View>
              {w.exercises.map((e, i) => (
                <View key={i} style={styles.exLine}>
                  <Text style={styles.exName}>{e.name}</Text>
                  <Text style={styles.exStats}>{e.sets}×{e.reps}{e.weight_kg ? ` · ${e.weight_kg} kg` : ''}</Text>
                </View>
              ))}
            </Card>
          ))
        )}
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
  heading: { fontSize: 26, fontWeight: '600', color: Colors.beige[800] },
  subheading: { fontSize: 12, color: Colors.beige[400], marginTop: 2, fontWeight: '300' },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.beige[800], alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: Colors.cream, fontSize: 20, lineHeight: 22 },
  scroll: { flex: 1 },
  sectionLbl: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase',
    color: Colors.beige[400], paddingHorizontal: Spacing.xl, marginBottom: 10, marginTop: 20,
  },
  exRow: {
    backgroundColor: Colors.beige[50], borderWidth: 1, borderColor: Colors.beige[100],
    borderRadius: 14, padding: 12, marginBottom: 8,
  },
  exNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  exNameInput: {
    flex: 1, fontSize: 13, padding: 6,
    borderWidth: 1.5, borderColor: Colors.beige[100], borderRadius: 9,
    backgroundColor: Colors.cream, color: Colors.beige[800],
  },
  exRemove: { padding: 4, marginLeft: 8 },
  exMetrics: { flexDirection: 'row', gap: 7 },
  metricWrap: { flex: 1 },
  metricLbl: { fontSize: 9, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase', color: Colors.beige[400], marginBottom: 4 },
  metricInput: {
    width: '100%', paddingVertical: 9, paddingHorizontal: 8,
    borderWidth: 1.5, borderColor: Colors.beige[100], borderRadius: 9,
    backgroundColor: Colors.cream, fontSize: 14, fontWeight: '600',
    color: Colors.beige[800], textAlign: 'center',
  },
  addExBtn: { marginTop: 8 },
  mt: { marginTop: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  saveBtn: { marginTop: 16 },
  workoutCard: { paddingVertical: 12 },
  workoutHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  workoutName: { fontSize: 14, fontWeight: '600', color: Colors.beige[800] },
  workoutMeta: { fontSize: 11, color: Colors.beige[400], marginTop: 2, fontWeight: '300' },
  deleteBtn: { fontSize: 16, padding: 4 },
  exLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  exName: { fontSize: 12, fontWeight: '600', color: Colors.beige[800] },
  exStats: { fontSize: 11, color: Colors.beige[600], fontWeight: '300' },
  empty: { textAlign: 'center', padding: 32, color: Colors.beige[400], fontSize: 13, fontWeight: '300' },
});
