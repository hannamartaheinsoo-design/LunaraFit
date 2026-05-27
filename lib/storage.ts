import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, CycleDay, Profile } from '../types';

const KEYS = {
  profile: 'lf_profile',
  workouts: 'lf_workouts',
  cycleDays: 'lf_cycle_days',
};

async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function set(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const storage = {
  getProfile: () => get<Partial<Profile>>(KEYS.profile),
  setProfile: (p: Partial<Profile>) => set(KEYS.profile, p),

  getWorkouts: async (): Promise<Workout[]> => (await get<Workout[]>(KEYS.workouts)) ?? [],
  setWorkouts: (ws: Workout[]) => set(KEYS.workouts, ws),
  addWorkout: async (w: Workout): Promise<Workout[]> => {
    const existing = await storage.getWorkouts();
    const updated = [w, ...existing].sort((a, b) => b.date.localeCompare(a.date));
    await storage.setWorkouts(updated);
    return updated;
  },
  deleteWorkout: async (id: string): Promise<Workout[]> => {
    const existing = await storage.getWorkouts();
    const updated = existing.filter((w) => w.id !== id);
    await storage.setWorkouts(updated);
    return updated;
  },

  getCycleDays: async (): Promise<CycleDay[]> => (await get<CycleDay[]>(KEYS.cycleDays)) ?? [],
  setCycleDays: (ds: CycleDay[]) => set(KEYS.cycleDays, ds),
  upsertCycleDay: async (entry: CycleDay): Promise<CycleDay[]> => {
    const existing = await storage.getCycleDays();
    const idx = existing.findIndex((d) => d.date === entry.date);
    const updated = idx >= 0 ? existing.map((d, i) => (i === idx ? entry : d)) : [...existing, entry];
    await storage.setCycleDays(updated);
    return updated;
  },

  clearAll: () => AsyncStorage.multiRemove(Object.values(KEYS)),
};
