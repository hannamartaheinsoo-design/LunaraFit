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
  created_at: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight_kg: number;
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
