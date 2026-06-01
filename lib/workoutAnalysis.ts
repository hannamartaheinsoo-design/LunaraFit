import { Workout, Exercise, ExerciseSet } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ExerciseProgress {
  name: string;
  exercise_id?: string;
  category?: string;
  sessions: ProgressSession[];   // chronological
  bestWeight: number;
  firstWeight: number;
  bestReps: number;
  bestDistance: number;
  bestDuration: number;
  weightGainPct: number | null;
  totalSessions: number;
  lastDate: string;
  isNew: boolean;                // PR set in latest session
}

export interface ProgressSession {
  date: string;
  weight: number;     // max weight in that session
  reps: number;       // max reps
  volume: number;     // sets × reps × weight
  distance: number;
  duration: number;
  phase: string;
}

export interface PersonalRecord {
  exerciseName: string;
  type: 'weight' | 'reps' | 'distance' | 'duration';
  value: number;
  unit: string;
  prevBest: number;
  improvement: number;  // pct or absolute
}

export interface WeeklyVolume {
  weekLabel: string;   // "N-1", "N-2" etc
  startDate: string;
  totalKg: number;
  workoutCount: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getMaxWeight(ex: Exercise): number {
  if (ex.logged_sets?.length) {
    return Math.max(...ex.logged_sets.map(s => s.weight_kg ?? 0));
  }
  return ex.weight_kg ?? 0;
}

function getMaxReps(ex: Exercise): number {
  if (ex.logged_sets?.length) {
    return Math.max(...ex.logged_sets.map(s => s.reps ?? 0));
  }
  return ex.reps ?? 0;
}

function getTotalVolume(ex: Exercise): number {
  if (ex.logged_sets?.length) {
    return ex.logged_sets.reduce((sum, s) =>
      sum + (s.reps ?? 0) * (s.weight_kg ?? 0), 0);
  }
  return (ex.sets ?? 1) * (ex.reps ?? 0) * (ex.weight_kg ?? 0);
}

function getMaxDistance(ex: Exercise): number {
  if (ex.logged_sets?.length) {
    return Math.max(...ex.logged_sets.map(s => s.distance_km ?? 0));
  }
  return ex.distance_km ?? 0;
}

function getMaxDuration(ex: Exercise): number {
  if (ex.logged_sets?.length) {
    return ex.logged_sets.reduce((sum, s) => sum + (s.duration_min ?? 0), 0);
  }
  return ex.duration_min ?? 0;
}

// ─── Exercise Progress ─────────────────────────────────────────────────────────

export function getExerciseProgress(workouts: Workout[]): ExerciseProgress[] {
  // Group by exercise name (case-insensitive)
  const map: Record<string, { workout: Workout; ex: Exercise }[]> = {};

  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach(w => {
    w.exercises.forEach(ex => {
      const key = ex.name.toLowerCase().trim();
      if (!map[key]) map[key] = [];
      map[key].push({ workout: w, ex });
    });
  });

  const results: ExerciseProgress[] = [];

  Object.entries(map).forEach(([, entries]) => {
    if (entries.length < 1) return;

    const sessions: ProgressSession[] = entries.map(({ workout, ex }) => ({
      date: workout.date,
      weight: getMaxWeight(ex),
      reps: getMaxReps(ex),
      volume: getTotalVolume(ex),
      distance: getMaxDistance(ex),
      duration: getMaxDuration(ex),
      phase: workout.phase,
    }));

    const first = sessions[0];
    const best  = sessions.reduce((b, s) => {
      if (s.weight > b.weight) return s;
      if (s.weight === b.weight && s.reps > b.reps) return s;
      return b;
    }, sessions[0]);

    const bestW    = Math.max(...sessions.map(s => s.weight));
    const bestR    = Math.max(...sessions.map(s => s.reps));
    const bestD    = Math.max(...sessions.map(s => s.distance));
    const bestDur  = Math.max(...sessions.map(s => s.duration));
    const firstW   = first.weight;

    const weightGain = firstW > 0 && bestW > firstW
      ? Math.round(((bestW - firstW) / firstW) * 100)
      : null;

    const lastSession = sessions[sessions.length - 1];
    const prevSessions = sessions.slice(0, -1);
    const prevBestW = prevSessions.length
      ? Math.max(...prevSessions.map(s => s.weight))
      : 0;
    const isNew = lastSession.weight > prevBestW && prevBestW > 0;

    results.push({
      name: entries[0].ex.name,
      exercise_id: entries[0].ex.exercise_id,
      category: entries[0].ex.category,
      sessions,
      bestWeight: bestW,
      firstWeight: firstW,
      bestReps: bestR,
      bestDistance: bestD,
      bestDuration: bestDur,
      weightGainPct: weightGain,
      totalSessions: sessions.length,
      lastDate: sessions[sessions.length - 1].date,
      isNew,
    });
  });

  // Sort: most sessions first, then by last date
  return results.sort((a, b) => {
    if (b.totalSessions !== a.totalSessions) return b.totalSessions - a.totalSessions;
    return b.lastDate.localeCompare(a.lastDate);
  });
}

// ─── PR Detection (call after saving a workout) ─────────────────────────────

export function detectNewPRs(
  allWorkouts: Workout[],  // includes the new one
  newWorkoutId: string,
): PersonalRecord[] {
  const newWorkout = allWorkouts.find(w => w.id === newWorkoutId);
  if (!newWorkout) return [];

  const prevWorkouts = allWorkouts.filter(w => w.id !== newWorkoutId);
  const prs: PersonalRecord[] = [];

  newWorkout.exercises.forEach(ex => {
    const name = ex.name.toLowerCase().trim();
    const prevAll = prevWorkouts.flatMap(w =>
      w.exercises.filter(e => e.name.toLowerCase().trim() === name)
    );
    if (!prevAll.length) return; // first time logging — not a PR yet

    const newW   = getMaxWeight(ex);
    const newR   = getMaxReps(ex);
    const newD   = getMaxDistance(ex);
    const newDur = getMaxDuration(ex);

    const prevBestW   = Math.max(...prevAll.map(getMaxWeight));
    const prevBestR   = Math.max(...prevAll.map(getMaxReps));
    const prevBestD   = Math.max(...prevAll.map(getMaxDistance));
    const prevBestDur = Math.max(...prevAll.map(getMaxDuration));

    if (newW > prevBestW && prevBestW > 0) {
      prs.push({
        exerciseName: ex.name,
        type: 'weight',
        value: newW,
        unit: 'kg',
        prevBest: prevBestW,
        improvement: Math.round(((newW - prevBestW) / prevBestW) * 100),
      });
    } else if (newR > prevBestR && prevBestR > 0 && newW >= prevBestW) {
      prs.push({
        exerciseName: ex.name,
        type: 'reps',
        value: newR,
        unit: 'kordust',
        prevBest: prevBestR,
        improvement: newR - prevBestR,
      });
    }

    if (newD > prevBestD && prevBestD > 0) {
      prs.push({
        exerciseName: ex.name,
        type: 'distance',
        value: newD,
        unit: 'km',
        prevBest: prevBestD,
        improvement: Math.round(((newD - prevBestD) / prevBestD) * 100),
      });
    }
    if (newDur > prevBestDur && prevBestDur > 0) {
      prs.push({
        exerciseName: ex.name,
        type: 'duration',
        value: newDur,
        unit: 'min',
        prevBest: prevBestDur,
        improvement: Math.round(((newDur - prevBestDur) / prevBestDur) * 100),
      });
    }
  });

  return prs;
}

// ─── Weekly Volume ─────────────────────────────────────────────────────────────

export function getWeeklyVolume(workouts: Workout[], weeks = 6): WeeklyVolume[] {
  const now = new Date();
  const result: WeeklyVolume[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const end   = new Date(now.getTime() - i * 7 * 86400000);
    const start = new Date(end.getTime() - 7 * 86400000);
    const startStr = start.toISOString().slice(0, 10);
    const endStr   = end.toISOString().slice(0, 10);

    const weekWorkouts = workouts.filter(w => w.date >= startStr && w.date < endStr);
    const totalKg = weekWorkouts.reduce((sum, w) =>
      sum + w.exercises.reduce((s, ex) => s + getTotalVolume(ex), 0), 0);

    const weekLabel = i === 0 ? 'See nädal'
      : i === 1 ? 'Eelmine'
      : `-${i}n`;

    result.push({
      weekLabel,
      startDate: startStr,
      totalKg: Math.round(totalKg),
      workoutCount: weekWorkouts.length,
    });
  }

  return result;
}

// ─── Overall stats ─────────────────────────────────────────────────────────────

export interface WorkoutStats {
  totalWorkouts: number;
  totalThisMonth: number;
  totalLastMonth: number;
  monthTrend: number;          // pct change
  longestStreak: number;
  currentStreak: number;
  totalVolume: number;         // all time kg
  uniqueExercises: number;
}

export function getWorkoutStats(workouts: Workout[]): WorkoutStats {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);

  const thisMonth = workouts.filter(w => w.date >= thisMonthStart).length;
  const lastMonth = workouts.filter(w => w.date >= lastMonthStart && w.date < thisMonthStart).length;
  const monthTrend = lastMonth > 0
    ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
    : thisMonth > 0 ? 100 : 0;

  // Streak calculation
  const dateSet = new Set(workouts.map(w => w.date));
  let current = 0;
  let d = new Date(now);
  let fd = (date: Date) => date.toISOString().slice(0, 10);
  if (!dateSet.has(fd(d))) d = new Date(d.getTime() - 86400000);
  while (dateSet.has(fd(d))) { current++; d = new Date(d.getTime() - 86400000); }

  // Longest streak
  const allDates = [...dateSet].sort();
  let longest = 0, cur = 0;
  allDates.forEach((date, i) => {
    if (i === 0) { cur = 1; return; }
    const prev = new Date(allDates[i - 1]);
    const curr = new Date(date);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    cur = diff === 1 ? cur + 1 : 1;
    if (cur > longest) longest = cur;
  });
  if (current > longest) longest = current;

  const totalVolume = Math.round(
    workouts.reduce((sum, w) =>
      sum + w.exercises.reduce((s, ex) => s + getTotalVolume(ex), 0), 0)
  );

  const uniqueExercises = new Set(
    workouts.flatMap(w => w.exercises.map(e => e.name.toLowerCase().trim()))
  ).size;

  return {
    totalWorkouts: workouts.length,
    totalThisMonth: thisMonth,
    totalLastMonth: lastMonth,
    monthTrend,
    longestStreak: longest,
    currentStreak: current,
    totalVolume,
    uniqueExercises,
  };
}
