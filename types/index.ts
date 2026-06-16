export type Lang = 'et' | 'en' | 'de' | 'es';

export type Plan = 'free' | 'monthly' | 'yearly';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';

export type Mood = 'bad' | 'neutral' | 'good' | 'great' | 'energized';

export interface Profile {
  id: string;
  name: string;
  birth_year: number | null;
  cycle_length: number;
  period_length: number;
  last_period_date: string | null;
  fitness_level: FitnessLevel | null;
  plan: Plan;
  lang: Lang;
  created_at: string;
}

export interface ExerciseSet {
  reps?: number;
  weight_kg?: number;
  duration_min?: number;
  distance_km?: number;
  rpe?: number;           // Rate of Perceived Exertion 1–10
}

export interface HyroxGoal {
  competition_name?: string;
  competition_date?: string;
  division?: 'Women' | 'Men' | 'Doubles' | 'Relay' | 'Pro';
  goal_minutes?: number;
  target_run_pace_min_per_km?: number;
  weakest_stations?: string[];
}

export interface Exercise {
  exercise_id?: string;          // links to EXERCISE_DB
  name: string;
  category?: string;
  sets: number;                  // kept for backwards compat
  reps: number;
  weight_kg: number;
  logged_sets?: ExerciseSet[];   // new per-set logging
  duration_min?: number;
  distance_km?: number;
}

export type ExerciseField = 'sets' | 'reps' | 'weight' | 'duration' | 'distance';

export interface ExerciseTemplate {
  id: string;
  name: string;
  category: string;
  popularity: number;           // 1–10 for search ranking
  fields: ExerciseField[];
  custom?: boolean;
}

export interface Workout {
  id: string;
  user_id: string;
  date: string;
  name: string;
  exercises: Exercise[];
  feel: string[];
  notes: string;
  phase: CyclePhase;
  created_at: string;
}

export interface CycleDay {
  id: string;
  user_id: string;
  date: string;
  period: boolean;
  mood: Mood | null;
  symptoms: string[];
  created_at: string;
}

export interface CycleInfo {
  day: number;
  daysLeft: number;
  phase: string;
  phaseKey: CyclePhase;
  description: string;
  cycleLength: number;
}
