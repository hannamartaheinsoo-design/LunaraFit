import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';
import { Profile, Workout, CycleDay } from '../types';
import { getPhaseKey, todayISO } from '../lib/cycle';

const DEFAULT_PROFILE: Partial<Profile> = {
  name: '',
  cycle_length: 28,
  period_length: 5,
  last_period_date: null,
  plan: 'free',
};

export function useAppState() {
  const [profile, setProfileState] = useState<Partial<Profile>>(DEFAULT_PROFILE);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [cycleDays, setCycleDays] = useState<CycleDay[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, ws, cd] = await Promise.all([
        storage.getProfile(),
        storage.getWorkouts(),
        storage.getCycleDays(),
      ]);
      if (p) setProfileState(p);
      setWorkouts(ws);
      setCycleDays(cd);
      setLoaded(true);
    })();
  }, []);

  const saveProfile = useCallback(async (updates: Partial<Profile>) => {
    const merged = { ...profile, ...updates };
    setProfileState(merged);
    await storage.setProfile(merged);
  }, [profile]);

  const addWorkout = useCallback(async (workout: Omit<Workout, 'id' | 'user_id' | 'created_at' | 'phase'>) => {
    const phase = getPhaseKey(
      workout.date,
      profile.last_period_date ?? null,
      profile.cycle_length ?? 28,
      profile.period_length ?? 5,
    );
    const full: Workout = {
      ...workout,
      id: Date.now().toString(),
      user_id: 'local',
      phase,
      created_at: new Date().toISOString(),
    };
    const updated = await storage.addWorkout(full);
    setWorkouts(updated);
    return full;
  }, [profile]);

  const deleteWorkout = useCallback(async (id: string) => {
    const updated = await storage.deleteWorkout(id);
    setWorkouts(updated);
  }, []);

  const upsertCycleDay = useCallback(async (entry: Omit<CycleDay, 'id' | 'user_id' | 'created_at'>) => {
    const full: CycleDay = {
      ...entry,
      id: entry.date,
      user_id: 'local',
      created_at: new Date().toISOString(),
    };
    const updated = await storage.upsertCycleDay(full);
    setCycleDays(updated);

    if (entry.period) {
      const currentLast = profile.last_period_date;
      if (!currentLast || entry.date < currentLast) {
        await saveProfile({ last_period_date: entry.date });
      }
    }
  }, [profile, saveProfile]);

  const clearAll = useCallback(async () => {
    await storage.clearAll();
    setProfileState(DEFAULT_PROFILE);
    setWorkouts([]);
    setCycleDays([]);
  }, []);

  return {
    profile,
    workouts,
    cycleDays,
    loaded,
    saveProfile,
    addWorkout,
    deleteWorkout,
    upsertCycleDay,
    clearAll,
  };
}
