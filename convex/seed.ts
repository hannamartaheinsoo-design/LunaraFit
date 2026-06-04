import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const listAll = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("workouts").collect();
    return all.map(w => ({ id: w._id, userId: w.userId, date: w.date }));
  },
});

export const clearAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("workouts").collect();
    for (const w of all) await ctx.db.delete(w._id);
    return `Deleted ${all.length}`;
  },
});

export const getFirstUserId = internalQuery({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    return user?._id ?? null;
  },
});

// ─── Full seed: workouts + cycle days + HYROX simulations + profile ───────────
export const seedAll = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {

    // ── 1. Update profile ──────────────────────────────────────────────────────
    const existing = await ctx.db
      .query("profiles").withIndex("by_user", q => q.eq("userId", userId)).first();
    const profileData = {
      userId,
      name: "Marta",
      last_period_date: "2026-05-22",
      cycle_length: 28,
      period_length: 5,
      fitness_level: "intermediate" as const,
      plan: "free" as const,
    };
    if (existing) {
      await ctx.db.patch(existing._id, profileData);
    } else {
      await ctx.db.insert("profiles", profileData);
    }

    // ── 2. Cycle days (last 2 cycles) ─────────────────────────────────────────
    const cycleDays = [
      // Cycle 1: period Apr 24–28
      { date: "2026-04-24", period: true,  mood: "bad"      as const, symptoms: ["cramps", "fatigue"] },
      { date: "2026-04-25", period: true,  mood: "bad"      as const, symptoms: ["cramps"] },
      { date: "2026-04-26", period: true,  mood: "neutral"  as const, symptoms: ["fatigue"] },
      { date: "2026-04-27", period: true,  mood: "neutral"  as const, symptoms: [] },
      { date: "2026-04-28", period: true,  mood: "good"     as const, symptoms: [] },
      // follicular
      { date: "2026-04-30", period: false, mood: "good"     as const, symptoms: [] },
      { date: "2026-05-03", period: false, mood: "great"    as const, symptoms: [] },
      { date: "2026-05-06", period: false, mood: "energized"as const, symptoms: [] },
      // ovulation window
      { date: "2026-05-09", period: false, mood: "energized"as const, symptoms: [] },
      { date: "2026-05-10", period: false, mood: "great"    as const, symptoms: [] },
      { date: "2026-05-11", period: false, mood: "energized"as const, symptoms: [] },
      // luteal
      { date: "2026-05-14", period: false, mood: "neutral"  as const, symptoms: ["bloating"] },
      { date: "2026-05-17", period: false, mood: "neutral"  as const, symptoms: ["mood_swings"] },
      { date: "2026-05-20", period: false, mood: "bad"      as const, symptoms: ["fatigue", "mood_swings"] },
      // Cycle 2: period May 22–26
      { date: "2026-05-22", period: true,  mood: "bad"      as const, symptoms: ["cramps", "fatigue"] },
      { date: "2026-05-23", period: true,  mood: "bad"      as const, symptoms: ["cramps", "headache"] },
      { date: "2026-05-24", period: true,  mood: "neutral"  as const, symptoms: ["fatigue"] },
      { date: "2026-05-25", period: true,  mood: "neutral"  as const, symptoms: [] },
      { date: "2026-05-26", period: true,  mood: "good"     as const, symptoms: [] },
      // follicular
      { date: "2026-05-28", period: false, mood: "good"     as const, symptoms: [] },
      { date: "2026-05-31", period: false, mood: "great"    as const, symptoms: [] },
      { date: "2026-06-02", period: false, mood: "energized"as const, symptoms: [] },
      { date: "2026-06-04", period: false, mood: "great"    as const, symptoms: [] },
    ];

    // Delete existing cycle days for this user first
    const existingCycle = await ctx.db
      .query("cycle_days").withIndex("by_user_date", q => q.eq("userId", userId)).collect();
    for (const d of existingCycle) await ctx.db.delete(d._id);

    for (const d of cycleDays) {
      await ctx.db.insert("cycle_days", { userId, ...d });
    }

    // ── 3. Regular workouts ────────────────────────────────────────────────────
    const workouts = [
      {
        date: "2026-05-06", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Energiline", "Tugev"], notes: "",
        exercises: [
          { exercise_id: "bench-press", name: "Bench Press", category: "chest", sets: 4, reps: 8, weight_kg: 55,
            logged_sets: [{ reps: 8, weight_kg: 55 }, { reps: 8, weight_kg: 57.5 }, { reps: 7, weight_kg: 60 }, { reps: 6, weight_kg: 60 }] },
          { exercise_id: "overhead-press", name: "Overhead Press", category: "shoulders", sets: 3, reps: 10, weight_kg: 30,
            logged_sets: [{ reps: 10, weight_kg: 30 }, { reps: 9, weight_kg: 32.5 }, { reps: 8, weight_kg: 32.5 }] },
          { exercise_id: "pull-up", name: "Pull-Up", category: "back", sets: 3, reps: 6, weight_kg: 0,
            logged_sets: [{ reps: 6 }, { reps: 5 }, { reps: 5 }] },
        ],
      },
      {
        date: "2026-05-10", name: "Ülaosa jõutreening", phase: "ovulation",
        feel: ["Tugev", "Motiveeritud"], notes: "Väga hea päev!",
        exercises: [
          { exercise_id: "bench-press", name: "Bench Press", category: "chest", sets: 4, reps: 8, weight_kg: 60,
            logged_sets: [{ reps: 8, weight_kg: 57.5 }, { reps: 8, weight_kg: 60 }, { reps: 8, weight_kg: 62.5 }, { reps: 7, weight_kg: 62.5 }] },
          { exercise_id: "overhead-press", name: "Overhead Press", category: "shoulders", sets: 3, reps: 10, weight_kg: 35,
            logged_sets: [{ reps: 10, weight_kg: 32.5 }, { reps: 9, weight_kg: 35 }, { reps: 8, weight_kg: 35 }] },
          { exercise_id: "pull-up", name: "Pull-Up", category: "back", sets: 3, reps: 7, weight_kg: 0,
            logged_sets: [{ reps: 7 }, { reps: 6 }, { reps: 6 }] },
        ],
      },
      {
        date: "2026-05-14", name: "Alakeha päev", phase: "luteal",
        feel: ["Väsinud", "Raske"], notes: "",
        exercises: [
          { exercise_id: "squat", name: "Squat", category: "legs", sets: 4, reps: 8, weight_kg: 65,
            logged_sets: [{ reps: 8, weight_kg: 60 }, { reps: 8, weight_kg: 65 }, { reps: 7, weight_kg: 65 }, { reps: 6, weight_kg: 65 }] },
          { exercise_id: "romanian-deadlift", name: "Romanian Deadlift", category: "legs", sets: 3, reps: 10, weight_kg: 50,
            logged_sets: [{ reps: 10, weight_kg: 50 }, { reps: 10, weight_kg: 52.5 }, { reps: 9, weight_kg: 52.5 }] },
          { exercise_id: "lateral-raise", name: "Lateral Raise", category: "shoulders", sets: 3, reps: 15, weight_kg: 8,
            logged_sets: [{ reps: 15, weight_kg: 8 }, { reps: 15, weight_kg: 8 }, { reps: 12, weight_kg: 8 }] },
        ],
      },
      {
        date: "2026-05-20", name: "Ülaosa jõutreening", phase: "luteal",
        feel: ["Energiline", "Tugev"], notes: "",
        exercises: [
          { exercise_id: "bench-press", name: "Bench Press", category: "chest", sets: 4, reps: 8, weight_kg: 62.5,
            logged_sets: [{ reps: 8, weight_kg: 60 }, { reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 7, weight_kg: 65 }] },
          { exercise_id: "overhead-press", name: "Overhead Press", category: "shoulders", sets: 3, reps: 10, weight_kg: 37.5,
            logged_sets: [{ reps: 10, weight_kg: 35 }, { reps: 9, weight_kg: 37.5 }, { reps: 8, weight_kg: 37.5 }] },
          { exercise_id: "pull-up", name: "Pull-Up", category: "back", sets: 3, reps: 8, weight_kg: 0,
            logged_sets: [{ reps: 8 }, { reps: 7 }, { reps: 7 }] },
        ],
      },
      {
        date: "2026-05-24", name: "Alakeha päev", phase: "menstrual",
        feel: ["Energiline", "Motiveeritud"], notes: "",
        exercises: [
          { exercise_id: "squat", name: "Squat", category: "legs", sets: 4, reps: 8, weight_kg: 70,
            logged_sets: [{ reps: 8, weight_kg: 65 }, { reps: 8, weight_kg: 70 }, { reps: 8, weight_kg: 72.5 }, { reps: 7, weight_kg: 72.5 }] },
          { exercise_id: "romanian-deadlift", name: "Romanian Deadlift", category: "legs", sets: 3, reps: 10, weight_kg: 55,
            logged_sets: [{ reps: 10, weight_kg: 52.5 }, { reps: 10, weight_kg: 55 }, { reps: 9, weight_kg: 57.5 }] },
        ],
      },
      {
        date: "2026-05-28", name: "HIIT treening", phase: "menstrual",
        feel: ["Kerge", "Väsinud"], notes: "",
        exercises: [
          { exercise_id: "high-knees", name: "High Knees", category: "cardio", sets: 3, reps: 30, weight_kg: 0,
            logged_sets: [{ reps: 30, duration_min: 0.5 }, { reps: 30, duration_min: 0.5 }, { reps: 30, duration_min: 0.5 }] },
          { exercise_id: "burpee", name: "Burpee", category: "fullbody", sets: 3, reps: 15, weight_kg: 0,
            logged_sets: [{ reps: 15 }, { reps: 13 }, { reps: 12 }] },
        ],
      },
      {
        date: "2026-06-02", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Tugev", "Motiveeritud"], notes: "Uus rekord bench press!",
        exercises: [
          { exercise_id: "bench-press", name: "Bench Press", category: "chest", sets: 4, reps: 8, weight_kg: 67.5,
            logged_sets: [{ reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 8, weight_kg: 67.5 }, { reps: 7, weight_kg: 67.5 }] },
          { exercise_id: "overhead-press", name: "Overhead Press", category: "shoulders", sets: 3, reps: 10, weight_kg: 40,
            logged_sets: [{ reps: 10, weight_kg: 37.5 }, { reps: 9, weight_kg: 40 }, { reps: 8, weight_kg: 40 }] },
          { exercise_id: "pull-up", name: "Pull-Up", category: "back", sets: 3, reps: 9, weight_kg: 0,
            logged_sets: [{ reps: 9 }, { reps: 8 }, { reps: 7 }] },
        ],
      },
    ];

    // ── 4. HYROX simulations (2 runs so insights activate) ────────────────────
    const hyroxSims = [
      {
        date: "2026-05-08", name: "HYROX Simulation", phase: "follicular",
        feel: ["Väsinud", "Tugev"], notes: "Esimene täissimulatsiooon",
        exercises: [
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 6.2,  distance_km: 1 }] },
          { exercise_id: "hyrox-skierg",        name: "SkiErg",             category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 5.8,  distance_km: 1 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 6.5,  distance_km: 1 }] },
          { exercise_id: "hyrox-sled-push",     name: "Sled Push",          category: "hyrox", sets: 1, reps: 1, weight_kg: 102, logged_sets: [{ duration_min: 4.2, distance_km: 0.05, weight_kg: 102 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 6.8,  distance_km: 1 }] },
          { exercise_id: "hyrox-sled-pull",     name: "Sled Pull",          category: "hyrox", sets: 1, reps: 1, weight_kg: 68,  logged_sets: [{ duration_min: 4.5, distance_km: 0.05, weight_kg: 68 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 7.0,  distance_km: 1 }] },
          { exercise_id: "hyrox-burpee-broad",  name: "Burpee Broad Jump",  category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 9.5,  distance_km: 0.08 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 7.2,  distance_km: 1 }] },
          { exercise_id: "hyrox-row",           name: "Rowing",             category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 5.1,  distance_km: 1 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 7.0,  distance_km: 1 }] },
          { exercise_id: "hyrox-farmers-carry", name: "Farmer's Carry",     category: "hyrox", sets: 1, reps: 1, weight_kg: 16, logged_sets: [{ duration_min: 3.8, distance_km: 0.2,  weight_kg: 16 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 7.5,  distance_km: 1 }] },
          { exercise_id: "hyrox-sandbag-lunge", name: "Sandbag Lunge",      category: "hyrox", sets: 1, reps: 1, weight_kg: 10, logged_sets: [{ duration_min: 8.0, distance_km: 0.1,  weight_kg: 10 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 7.8,  distance_km: 1 }] },
          { exercise_id: "hyrox-wall-ball",     name: "Wall Ball",          category: "hyrox", sets: 1, reps: 100, weight_kg: 4, logged_sets: [{ duration_min: 10.5, reps: 100, weight_kg: 4 }] },
        ],
      },
      {
        date: "2026-05-29", name: "HYROX Simulation", phase: "menstrual",
        feel: ["Tugev", "Energiline"], notes: "Palju parem! Wall Ball oli lihtsam.",
        exercises: [
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 5.9,  distance_km: 1 }] },
          { exercise_id: "hyrox-skierg",        name: "SkiErg",             category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 5.4,  distance_km: 1 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 6.1,  distance_km: 1 }] },
          { exercise_id: "hyrox-sled-push",     name: "Sled Push",          category: "hyrox", sets: 1, reps: 1, weight_kg: 102, logged_sets: [{ duration_min: 3.8, distance_km: 0.05, weight_kg: 102 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 6.3,  distance_km: 1 }] },
          { exercise_id: "hyrox-sled-pull",     name: "Sled Pull",          category: "hyrox", sets: 1, reps: 1, weight_kg: 68,  logged_sets: [{ duration_min: 4.1, distance_km: 0.05, weight_kg: 68 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 6.5,  distance_km: 1 }] },
          { exercise_id: "hyrox-burpee-broad",  name: "Burpee Broad Jump",  category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 8.8,  distance_km: 0.08 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 6.7,  distance_km: 1 }] },
          { exercise_id: "hyrox-row",           name: "Rowing",             category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 4.8,  distance_km: 1 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 6.6,  distance_km: 1 }] },
          { exercise_id: "hyrox-farmers-carry", name: "Farmer's Carry",     category: "hyrox", sets: 1, reps: 1, weight_kg: 16, logged_sets: [{ duration_min: 3.4, distance_km: 0.2,  weight_kg: 16 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 7.0,  distance_km: 1 }] },
          { exercise_id: "hyrox-sandbag-lunge", name: "Sandbag Lunge",      category: "hyrox", sets: 1, reps: 1, weight_kg: 10, logged_sets: [{ duration_min: 7.2, distance_km: 0.1,  weight_kg: 10 }] },
          { exercise_id: "hyrox-run",           name: "Run (1 km)",         category: "hyrox", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 7.2,  distance_km: 1 }] },
          { exercise_id: "hyrox-wall-ball",     name: "Wall Ball",          category: "hyrox", sets: 1, reps: 100, weight_kg: 4, logged_sets: [{ duration_min: 9.2, reps: 100, weight_kg: 4 }] },
        ],
      },
    ];

    // Delete existing workouts and re-seed
    const existingWorkouts = await ctx.db
      .query("workouts").filter(q => q.eq(q.field("userId"), userId)).collect();
    for (const w of existingWorkouts) await ctx.db.delete(w._id);

    for (const w of [...workouts, ...hyroxSims]) {
      await ctx.db.insert("workouts", { userId, ...w });
    }

    return `Seeded: profile, ${cycleDays.length} cycle days, ${workouts.length} workouts, ${hyroxSims.length} HYROX sims`;
  },
});

export const seedWorkouts = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const workouts = [
      {
        date: "2026-05-06", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Energiline", "Tugev"], notes: "",
        exercises: [
          { exercise_id: "bench-press", name: "Bench Press", category: "chest", sets: 4, reps: 8, weight_kg: 55,
            logged_sets: [{ reps: 8, weight_kg: 55 }, { reps: 8, weight_kg: 57.5 }, { reps: 7, weight_kg: 60 }, { reps: 6, weight_kg: 60 }] },
          { exercise_id: "overhead-press", name: "Overhead Press", category: "shoulders", sets: 3, reps: 10, weight_kg: 30,
            logged_sets: [{ reps: 10, weight_kg: 30 }, { reps: 9, weight_kg: 32.5 }, { reps: 8, weight_kg: 32.5 }] },
        ],
      },
    ];
    for (const w of workouts) {
      await ctx.db.insert("workouts", { userId, ...w });
    }
    return `Seeded ${workouts.length} workouts`;
  },
});
