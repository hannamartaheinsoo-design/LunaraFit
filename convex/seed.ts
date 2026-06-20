import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const listAllUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const profiles = await ctx.db.query("profiles").collect();
    return { users: users.map(u => u._id), profiles: profiles.map(p => ({ userId: p.userId, name: p.name, plan: p.plan })) };
  },
});

export const markExistingUsersOnboarded = internalMutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    let count = 0;
    for (const p of profiles) {
      if (p.name && !p.onboarding_complete) {
        await ctx.db.patch(p._id, { onboarding_complete: true });
        count++;
      }
    }
    return `Marked ${count} profiles as onboarding_complete`;
  },
});

export const deleteUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const profile = await ctx.db.query("profiles").withIndex("by_user", q => q.eq("userId", userId)).first();
    if (profile) await ctx.db.delete(profile._id);
    const accounts = await ctx.db.query("authAccounts").filter(q => q.eq(q.field("userId"), userId)).collect();
    for (const a of accounts) await ctx.db.delete(a._id);
    const sessions = await ctx.db.query("authSessions").filter(q => q.eq(q.field("userId"), userId)).collect();
    for (const s of sessions) await ctx.db.delete(s._id);
    const workouts = await ctx.db.query("workouts").withIndex("by_user_date", q => q.eq("userId", userId)).collect();
    for (const w of workouts) await ctx.db.delete(w._id);
    const cycleDays = await ctx.db.query("cycle_days").withIndex("by_user_date", q => q.eq("userId", userId)).collect();
    for (const c of cycleDays) await ctx.db.delete(c._id);
    await ctx.db.delete(userId);
    return "deleted";
  },
});

export const updateAccountEmail = internalMutation({
  args: { userId: v.id("users"), newEmail: v.string() },
  handler: async (ctx, { userId, newEmail }) => {
    const account = await ctx.db.query("authAccounts").filter(q => q.eq(q.field("userId"), userId)).first();
    if (!account) return "account not found";
    await ctx.db.patch(account._id, { providerAccountId: newEmail });
    return "updated";
  },
});

export const listAccountsByEmail = internalQuery({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();
    return accounts.map(a => ({ userId: a.userId, provider: a.provider, providerAccountId: a.providerAccountId }));
  },
});

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

    // ── 3. Regular workouts — full routines every session ─────────────────────
    // Upper body routine: Rowing Machine · Bench Press · Dumbbell Shoulder Press
    //   · Pull-Up · Seated Cable Row · Cable high pull · Dumbbell Curl · Triceps Pushdown
    // Glutes & quads:     Treadmill Walking · Squat · Bulgarian Split Squat · Hip Thrust
    //   · Leg Extension · Hip Abduction Machine · Stair Climber
    // Hamstrings & lower: Treadmill Walking · Romanian Deadlift · Nordic Hamstring Curl
    //   · Single-leg RDL · Back Extension · Stair Climber

    const workouts = [
      // ── May 6 — Upper body (follicular, high energy) ──────────────────────────
      {
        date: "2026-05-06", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Energiline", "Tugev"], notes: "",
        exercises: [
          { exercise_id: "rowing-machine",   name: "Rowing Machine",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 2.1 }] },
          { exercise_id: "bench-press",      name: "Bench Press",              category: "chest",     sets: 4, reps: 8,  weight_kg: 55,
            logged_sets: [{ reps: 8, weight_kg: 50 }, { reps: 8, weight_kg: 52.5 }, { reps: 7, weight_kg: 55 }, { reps: 6, weight_kg: 55 }] },
          { exercise_id: "db-shoulder-press",name: "Dumbbell Shoulder Press",  category: "shoulders", sets: 3, reps: 10, weight_kg: 14,
            logged_sets: [{ reps: 10, weight_kg: 12 }, { reps: 9, weight_kg: 14 }, { reps: 8, weight_kg: 14 }] },
          { exercise_id: "pull-up",          name: "Pull-Up",                  category: "back",      sets: 3, reps: 6,  weight_kg: 0,
            logged_sets: [{ reps: 6 }, { reps: 5 }, { reps: 5 }] },
          { exercise_id: "seated-cable-row", name: "Seated Cable Row",         category: "back",      sets: 3, reps: 10, weight_kg: 40,
            logged_sets: [{ reps: 10, weight_kg: 37.5 }, { reps: 10, weight_kg: 40 }, { reps: 9, weight_kg: 40 }] },
          { exercise_id: "face-pull",        name: "Cable High Pull",          category: "back",      sets: 3, reps: 15, weight_kg: 18,
            logged_sets: [{ reps: 15, weight_kg: 16 }, { reps: 15, weight_kg: 18 }, { reps: 12, weight_kg: 18 }] },
          { exercise_id: "db-curl",          name: "Dumbbell Curl",            category: "biceps",    sets: 3, reps: 12, weight_kg: 10,
            logged_sets: [{ reps: 12, weight_kg: 10 }, { reps: 11, weight_kg: 10 }, { reps: 10, weight_kg: 10 }] },
          { exercise_id: "triceps-pushdown", name: "Triceps Pushdown",         category: "triceps",   sets: 3, reps: 12, weight_kg: 22,
            logged_sets: [{ reps: 12, weight_kg: 20 }, { reps: 12, weight_kg: 22 }, { reps: 10, weight_kg: 22 }] },
        ],
      },
      // ── May 10 — Upper body (ovulation, peak strength) ───────────────────────
      {
        date: "2026-05-10", name: "Ülaosa jõutreening", phase: "ovulation",
        feel: ["Tugev", "Motiveeritud"], notes: "Väga hea päev!",
        exercises: [
          { exercise_id: "rowing-machine",   name: "Rowing Machine",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 2.2 }] },
          { exercise_id: "bench-press",      name: "Bench Press",              category: "chest",     sets: 4, reps: 8,  weight_kg: 60,
            logged_sets: [{ reps: 8, weight_kg: 55 }, { reps: 8, weight_kg: 57.5 }, { reps: 8, weight_kg: 60 }, { reps: 7, weight_kg: 60 }] },
          { exercise_id: "db-shoulder-press",name: "Dumbbell Shoulder Press",  category: "shoulders", sets: 3, reps: 10, weight_kg: 16,
            logged_sets: [{ reps: 10, weight_kg: 14 }, { reps: 10, weight_kg: 16 }, { reps: 9, weight_kg: 16 }] },
          { exercise_id: "pull-up",          name: "Pull-Up",                  category: "back",      sets: 3, reps: 7,  weight_kg: 0,
            logged_sets: [{ reps: 7 }, { reps: 6 }, { reps: 6 }] },
          { exercise_id: "seated-cable-row", name: "Seated Cable Row",         category: "back",      sets: 3, reps: 10, weight_kg: 42.5,
            logged_sets: [{ reps: 10, weight_kg: 40 }, { reps: 10, weight_kg: 42.5 }, { reps: 9, weight_kg: 42.5 }] },
          { exercise_id: "face-pull",        name: "Cable High Pull",          category: "back",      sets: 3, reps: 15, weight_kg: 20,
            logged_sets: [{ reps: 15, weight_kg: 18 }, { reps: 15, weight_kg: 20 }, { reps: 13, weight_kg: 20 }] },
          { exercise_id: "db-curl",          name: "Dumbbell Curl",            category: "biceps",    sets: 3, reps: 12, weight_kg: 10,
            logged_sets: [{ reps: 12, weight_kg: 10 }, { reps: 12, weight_kg: 10 }, { reps: 11, weight_kg: 10 }] },
          { exercise_id: "triceps-pushdown", name: "Triceps Pushdown",         category: "triceps",   sets: 3, reps: 12, weight_kg: 24,
            logged_sets: [{ reps: 12, weight_kg: 22 }, { reps: 12, weight_kg: 24 }, { reps: 10, weight_kg: 24 }] },
        ],
      },
      // ── May 14 — Glutes & quads (luteal, slightly tired) ─────────────────────
      {
        date: "2026-05-14", name: "Glutes & quads", phase: "luteal",
        feel: ["Väsinud", "Raske"], notes: "",
        exercises: [
          { exercise_id: "treadmill",           name: "Treadmill Walking",     category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 0.9 }] },
          { exercise_id: "squat",               name: "Squat",                 category: "legs",      sets: 4, reps: 8,  weight_kg: 60,
            logged_sets: [{ reps: 8, weight_kg: 55 }, { reps: 8, weight_kg: 60 }, { reps: 7, weight_kg: 60 }, { reps: 6, weight_kg: 60 }] },
          { exercise_id: "bulgarian-split-squat",name:"Bulgarian Split Squat", category: "legs",      sets: 3, reps: 10, weight_kg: 20,
            logged_sets: [{ reps: 10, weight_kg: 18 }, { reps: 9, weight_kg: 20 }, { reps: 8, weight_kg: 20 }] },
          { exercise_id: "hip-thrust",          name: "Hip Thrust",            category: "glutes",    sets: 4, reps: 12, weight_kg: 60,
            logged_sets: [{ reps: 12, weight_kg: 55 }, { reps: 12, weight_kg: 60 }, { reps: 11, weight_kg: 60 }, { reps: 10, weight_kg: 60 }] },
          { exercise_id: "leg-extension",       name: "Leg Extension",         category: "legs",      sets: 3, reps: 15, weight_kg: 35,
            logged_sets: [{ reps: 15, weight_kg: 32.5 }, { reps: 14, weight_kg: 35 }, { reps: 12, weight_kg: 35 }] },
          { exercise_id: "hip-abduction",       name: "Hip Abduction Machine", category: "glutes",    sets: 3, reps: 15, weight_kg: 45,
            logged_sets: [{ reps: 15, weight_kg: 42.5 }, { reps: 15, weight_kg: 45 }, { reps: 13, weight_kg: 45 }] },
          { exercise_id: "stair-climber",       name: "Stair Climber",         category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10 }] },
        ],
      },
      // ── May 20 — Upper body (luteal, solid session) ───────────────────────────
      {
        date: "2026-05-20", name: "Ülaosa jõutreening", phase: "luteal",
        feel: ["Energiline", "Tugev"], notes: "",
        exercises: [
          { exercise_id: "rowing-machine",   name: "Rowing Machine",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 2.2 }] },
          { exercise_id: "bench-press",      name: "Bench Press",              category: "chest",     sets: 4, reps: 8,  weight_kg: 62.5,
            logged_sets: [{ reps: 8, weight_kg: 57.5 }, { reps: 8, weight_kg: 60 }, { reps: 8, weight_kg: 62.5 }, { reps: 7, weight_kg: 62.5 }] },
          { exercise_id: "db-shoulder-press",name: "Dumbbell Shoulder Press",  category: "shoulders", sets: 3, reps: 10, weight_kg: 16,
            logged_sets: [{ reps: 10, weight_kg: 14 }, { reps: 10, weight_kg: 16 }, { reps: 9, weight_kg: 16 }] },
          { exercise_id: "pull-up",          name: "Pull-Up",                  category: "back",      sets: 3, reps: 8,  weight_kg: 0,
            logged_sets: [{ reps: 8 }, { reps: 7 }, { reps: 7 }] },
          { exercise_id: "seated-cable-row", name: "Seated Cable Row",         category: "back",      sets: 3, reps: 10, weight_kg: 45,
            logged_sets: [{ reps: 10, weight_kg: 42.5 }, { reps: 10, weight_kg: 45 }, { reps: 9, weight_kg: 45 }] },
          { exercise_id: "face-pull",        name: "Cable High Pull",          category: "back",      sets: 3, reps: 15, weight_kg: 20,
            logged_sets: [{ reps: 15, weight_kg: 20 }, { reps: 14, weight_kg: 20 }, { reps: 13, weight_kg: 20 }] },
          { exercise_id: "db-curl",          name: "Dumbbell Curl",            category: "biceps",    sets: 3, reps: 12, weight_kg: 11,
            logged_sets: [{ reps: 12, weight_kg: 10 }, { reps: 12, weight_kg: 11 }, { reps: 10, weight_kg: 11 }] },
          { exercise_id: "triceps-pushdown", name: "Triceps Pushdown",         category: "triceps",   sets: 3, reps: 12, weight_kg: 25,
            logged_sets: [{ reps: 12, weight_kg: 24 }, { reps: 11, weight_kg: 25 }, { reps: 10, weight_kg: 25 }] },
        ],
      },
      // ── May 24 — Glutes & quads (menstrual) ──────────────────────────────────
      {
        date: "2026-05-24", name: "Glutes & quads", phase: "menstruation",
        feel: ["Energiline", "Motiveeritud"], notes: "",
        exercises: [
          { exercise_id: "treadmill",           name: "Treadmill Walking",     category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 0.9 }] },
          { exercise_id: "squat",               name: "Squat",                 category: "legs",      sets: 4, reps: 8,  weight_kg: 65,
            logged_sets: [{ reps: 8, weight_kg: 60 }, { reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 7, weight_kg: 65 }] },
          { exercise_id: "bulgarian-split-squat",name:"Bulgarian Split Squat", category: "legs",      sets: 3, reps: 10, weight_kg: 22,
            logged_sets: [{ reps: 10, weight_kg: 20 }, { reps: 10, weight_kg: 22 }, { reps: 9, weight_kg: 22 }] },
          { exercise_id: "hip-thrust",          name: "Hip Thrust",            category: "glutes",    sets: 4, reps: 12, weight_kg: 65,
            logged_sets: [{ reps: 12, weight_kg: 60 }, { reps: 12, weight_kg: 62.5 }, { reps: 12, weight_kg: 65 }, { reps: 10, weight_kg: 65 }] },
          { exercise_id: "leg-extension",       name: "Leg Extension",         category: "legs",      sets: 3, reps: 15, weight_kg: 37.5,
            logged_sets: [{ reps: 15, weight_kg: 35 }, { reps: 14, weight_kg: 37.5 }, { reps: 13, weight_kg: 37.5 }] },
          { exercise_id: "hip-abduction",       name: "Hip Abduction Machine", category: "glutes",    sets: 3, reps: 15, weight_kg: 47.5,
            logged_sets: [{ reps: 15, weight_kg: 45 }, { reps: 15, weight_kg: 47.5 }, { reps: 14, weight_kg: 47.5 }] },
          { exercise_id: "stair-climber",       name: "Stair Climber",         category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10 }] },
        ],
      },
      // ── May 28 — Hamstrings & lower back (menstrual) ──────────────────────────
      {
        date: "2026-05-28", name: "Hamstrings & lower back", phase: "menstruation",
        feel: ["Kerge", "Väsinud"], notes: "",
        exercises: [
          { exercise_id: "treadmill",         name: "Treadmill Walking",       category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 0.8 }] },
          { exercise_id: "romanian-deadlift", name: "Romanian Deadlift",       category: "legs",      sets: 4, reps: 10, weight_kg: 52.5,
            logged_sets: [{ reps: 10, weight_kg: 47.5 }, { reps: 10, weight_kg: 50 }, { reps: 9, weight_kg: 52.5 }, { reps: 8, weight_kg: 52.5 }] },
          { exercise_id: "nordic-curl",       name: "Nordic Hamstring Curl",   category: "legs",      sets: 3, reps: 8,  weight_kg: 0,
            logged_sets: [{ reps: 8 }, { reps: 7 }, { reps: 6 }] },
          { exercise_id: "single-leg-deadlift",name:"Single-Leg Deadlift",     category: "functional",sets: 3, reps: 10, weight_kg: 20,
            logged_sets: [{ reps: 10, weight_kg: 18 }, { reps: 10, weight_kg: 20 }, { reps: 9, weight_kg: 20 }] },
          { exercise_id: "back-extension",    name: "Back Extension",          category: "back",      sets: 3, reps: 15, weight_kg: 10,
            logged_sets: [{ reps: 15, weight_kg: 10 }, { reps: 14, weight_kg: 10 }, { reps: 13, weight_kg: 10 }] },
          { exercise_id: "stair-climber",     name: "Stair Climber",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10 }] },
        ],
      },
      // ── Jun 2 — Upper body (follicular, new BP PR!) ───────────────────────────
      {
        date: "2026-06-02", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Tugev", "Motiveeritud"], notes: "Uus rekord bench press!",
        exercises: [
          { exercise_id: "rowing-machine",   name: "Rowing Machine",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 2.3 }] },
          { exercise_id: "bench-press",      name: "Bench Press",              category: "chest",     sets: 4, reps: 8,  weight_kg: 65,
            logged_sets: [{ reps: 8, weight_kg: 60 }, { reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 7, weight_kg: 65 }] },
          { exercise_id: "db-shoulder-press",name: "Dumbbell Shoulder Press",  category: "shoulders", sets: 3, reps: 10, weight_kg: 17,
            logged_sets: [{ reps: 10, weight_kg: 16 }, { reps: 10, weight_kg: 17 }, { reps: 9, weight_kg: 17 }] },
          { exercise_id: "pull-up",          name: "Pull-Up",                  category: "back",      sets: 3, reps: 9,  weight_kg: 0,
            logged_sets: [{ reps: 9 }, { reps: 8 }, { reps: 7 }] },
          { exercise_id: "seated-cable-row", name: "Seated Cable Row",         category: "back",      sets: 3, reps: 10, weight_kg: 47.5,
            logged_sets: [{ reps: 10, weight_kg: 45 }, { reps: 10, weight_kg: 47.5 }, { reps: 9, weight_kg: 47.5 }] },
          { exercise_id: "face-pull",        name: "Cable High Pull",          category: "back",      sets: 3, reps: 15, weight_kg: 22,
            logged_sets: [{ reps: 15, weight_kg: 20 }, { reps: 15, weight_kg: 22 }, { reps: 12, weight_kg: 22 }] },
          { exercise_id: "db-curl",          name: "Dumbbell Curl",            category: "biceps",    sets: 3, reps: 12, weight_kg: 12,
            logged_sets: [{ reps: 12, weight_kg: 11 }, { reps: 12, weight_kg: 12 }, { reps: 10, weight_kg: 12 }] },
          { exercise_id: "triceps-pushdown", name: "Triceps Pushdown",         category: "triceps",   sets: 3, reps: 12, weight_kg: 26,
            logged_sets: [{ reps: 12, weight_kg: 25 }, { reps: 11, weight_kg: 26 }, { reps: 10, weight_kg: 26 }] },
        ],
      },
      // ── Jun 4 — Upper body (follicular) ──────────────────────────────────────
      {
        date: "2026-06-04", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Tugev", "Motiveeritud"], notes: "",
        exercises: [
          { exercise_id: "rowing-machine",   name: "Rowing Machine",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 2.3 }] },
          { exercise_id: "bench-press",      name: "Bench Press",              category: "chest",     sets: 4, reps: 8,  weight_kg: 65,
            logged_sets: [{ reps: 8, weight_kg: 60 }, { reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 7, weight_kg: 65 }] },
          { exercise_id: "db-shoulder-press",name: "Dumbbell Shoulder Press",  category: "shoulders", sets: 3, reps: 10, weight_kg: 17,
            logged_sets: [{ reps: 10, weight_kg: 16 }, { reps: 10, weight_kg: 17 }, { reps: 9, weight_kg: 17 }] },
          { exercise_id: "pull-up",          name: "Pull-Up",                  category: "back",      sets: 3, reps: 9,  weight_kg: 0,
            logged_sets: [{ reps: 9 }, { reps: 8 }, { reps: 8 }] },
          { exercise_id: "seated-cable-row", name: "Seated Cable Row",         category: "back",      sets: 3, reps: 10, weight_kg: 47.5,
            logged_sets: [{ reps: 10, weight_kg: 45 }, { reps: 10, weight_kg: 47.5 }, { reps: 9, weight_kg: 47.5 }] },
          { exercise_id: "face-pull",        name: "Cable High Pull",          category: "back",      sets: 3, reps: 15, weight_kg: 22,
            logged_sets: [{ reps: 15, weight_kg: 20 }, { reps: 15, weight_kg: 22 }, { reps: 13, weight_kg: 22 }] },
          { exercise_id: "db-curl",          name: "Dumbbell Curl",            category: "biceps",    sets: 3, reps: 12, weight_kg: 12,
            logged_sets: [{ reps: 12, weight_kg: 11 }, { reps: 12, weight_kg: 12 }, { reps: 11, weight_kg: 12 }] },
          { exercise_id: "triceps-pushdown", name: "Triceps Pushdown",         category: "triceps",   sets: 3, reps: 12, weight_kg: 26,
            logged_sets: [{ reps: 12, weight_kg: 25 }, { reps: 11, weight_kg: 26 }, { reps: 10, weight_kg: 26 }] },
        ],
      },
      // ── Jun 3 — Glutes & quads (follicular) ──────────────────────────────────
      {
        date: "2026-06-03", name: "Glutes & quads", phase: "follicular",
        feel: ["Energiline", "Tugev"], notes: "",
        exercises: [
          { exercise_id: "treadmill",           name: "Treadmill Walking",     category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 1.0 }] },
          { exercise_id: "squat",               name: "Squat",                 category: "legs",      sets: 4, reps: 8,  weight_kg: 67.5,
            logged_sets: [{ reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 8, weight_kg: 67.5 }, { reps: 7, weight_kg: 67.5 }] },
          { exercise_id: "bulgarian-split-squat",name:"Bulgarian Split Squat", category: "legs",      sets: 3, reps: 10, weight_kg: 24,
            logged_sets: [{ reps: 10, weight_kg: 22 }, { reps: 10, weight_kg: 24 }, { reps: 9, weight_kg: 24 }] },
          { exercise_id: "hip-thrust",          name: "Hip Thrust",            category: "glutes",    sets: 4, reps: 12, weight_kg: 70,
            logged_sets: [{ reps: 12, weight_kg: 65 }, { reps: 12, weight_kg: 67.5 }, { reps: 12, weight_kg: 70 }, { reps: 10, weight_kg: 70 }] },
          { exercise_id: "leg-extension",       name: "Leg Extension",         category: "legs",      sets: 3, reps: 15, weight_kg: 40,
            logged_sets: [{ reps: 15, weight_kg: 37.5 }, { reps: 15, weight_kg: 40 }, { reps: 13, weight_kg: 40 }] },
          { exercise_id: "hip-abduction",       name: "Hip Abduction Machine", category: "glutes",    sets: 3, reps: 15, weight_kg: 50,
            logged_sets: [{ reps: 15, weight_kg: 47.5 }, { reps: 15, weight_kg: 50 }, { reps: 14, weight_kg: 50 }] },
          { exercise_id: "stair-climber",       name: "Stair Climber",         category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 12 }] },
        ],
      },
      // ── Jun 6 — Glutes & quads (follicular) ──────────────────────────────────
      {
        date: "2026-06-06", name: "Glutes & quads", phase: "follicular",
        feel: ["Energiline", "Tugev"], notes: "",
        exercises: [
          { exercise_id: "treadmill",           name: "Treadmill Walking",     category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 1.0 }] },
          { exercise_id: "squat",               name: "Squat",                 category: "legs",      sets: 4, reps: 8,  weight_kg: 67.5,
            logged_sets: [{ reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 8, weight_kg: 67.5 }, { reps: 7, weight_kg: 67.5 }] },
          { exercise_id: "bulgarian-split-squat",name:"Bulgarian Split Squat", category: "legs",      sets: 3, reps: 10, weight_kg: 24,
            logged_sets: [{ reps: 10, weight_kg: 22 }, { reps: 10, weight_kg: 24 }, { reps: 9, weight_kg: 24 }] },
          { exercise_id: "hip-thrust",          name: "Hip Thrust",            category: "glutes",    sets: 4, reps: 12, weight_kg: 70,
            logged_sets: [{ reps: 12, weight_kg: 65 }, { reps: 12, weight_kg: 67.5 }, { reps: 12, weight_kg: 70 }, { reps: 10, weight_kg: 70 }] },
          { exercise_id: "leg-extension",       name: "Leg Extension",         category: "legs",      sets: 3, reps: 15, weight_kg: 40,
            logged_sets: [{ reps: 15, weight_kg: 37.5 }, { reps: 15, weight_kg: 40 }, { reps: 13, weight_kg: 40 }] },
          { exercise_id: "hip-abduction",       name: "Hip Abduction Machine", category: "glutes",    sets: 3, reps: 15, weight_kg: 50,
            logged_sets: [{ reps: 15, weight_kg: 47.5 }, { reps: 15, weight_kg: 50 }, { reps: 14, weight_kg: 50 }] },
          { exercise_id: "stair-climber",       name: "Stair Climber",         category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 12 }] },
        ],
      },
      // ── Jun 5 — Hamstrings & lower back (follicular) ──────────────────────────
      {
        date: "2026-06-05", name: "Hamstrings & lower back", phase: "follicular",
        feel: ["Tugev", "Motiveeritud"], notes: "",
        exercises: [
          { exercise_id: "treadmill",         name: "Treadmill Walking",       category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 1.0 }] },
          { exercise_id: "romanian-deadlift", name: "Romanian Deadlift",       category: "legs",      sets: 4, reps: 10, weight_kg: 57.5,
            logged_sets: [{ reps: 10, weight_kg: 52.5 }, { reps: 10, weight_kg: 55 }, { reps: 9, weight_kg: 57.5 }, { reps: 8, weight_kg: 57.5 }] },
          { exercise_id: "nordic-curl",       name: "Nordic Hamstring Curl",   category: "legs",      sets: 3, reps: 8,  weight_kg: 0,
            logged_sets: [{ reps: 8 }, { reps: 7 }, { reps: 7 }] },
          { exercise_id: "single-leg-deadlift",name:"Single-Leg Deadlift",     category: "functional",sets: 3, reps: 10, weight_kg: 22,
            logged_sets: [{ reps: 10, weight_kg: 20 }, { reps: 10, weight_kg: 22 }, { reps: 9, weight_kg: 22 }] },
          { exercise_id: "back-extension",    name: "Back Extension",          category: "back",      sets: 3, reps: 15, weight_kg: 12.5,
            logged_sets: [{ reps: 15, weight_kg: 12.5 }, { reps: 14, weight_kg: 12.5 }, { reps: 13, weight_kg: 12.5 }] },
          { exercise_id: "stair-climber",     name: "Stair Climber",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 12 }] },
        ],
      },
      // ── Jun 7 — Upper body (follicular) ───────────────────────────────────────
      {
        date: "2026-06-07", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Tugev", "Energiline"], notes: "",
        exercises: [
          { exercise_id: "rowing-machine",   name: "Rowing Machine",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 2.4 }] },
          { exercise_id: "bench-press",      name: "Bench Press",              category: "chest",     sets: 4, reps: 8,  weight_kg: 67.5,
            logged_sets: [{ reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 8, weight_kg: 67.5 }, { reps: 7, weight_kg: 67.5 }] },
          { exercise_id: "db-shoulder-press",name: "Dumbbell Shoulder Press",  category: "shoulders", sets: 3, reps: 10, weight_kg: 18,
            logged_sets: [{ reps: 10, weight_kg: 16 }, { reps: 10, weight_kg: 18 }, { reps: 9, weight_kg: 18 }] },
          { exercise_id: "pull-up",          name: "Pull-Up",                  category: "back",      sets: 3, reps: 10, weight_kg: 0,
            logged_sets: [{ reps: 10 }, { reps: 9 }, { reps: 8 }] },
          { exercise_id: "seated-cable-row", name: "Seated Cable Row",         category: "back",      sets: 3, reps: 10, weight_kg: 50,
            logged_sets: [{ reps: 10, weight_kg: 47.5 }, { reps: 10, weight_kg: 50 }, { reps: 9, weight_kg: 50 }] },
          { exercise_id: "face-pull",        name: "Cable High Pull",          category: "back",      sets: 3, reps: 15, weight_kg: 22,
            logged_sets: [{ reps: 15, weight_kg: 22 }, { reps: 14, weight_kg: 22 }, { reps: 13, weight_kg: 22 }] },
          { exercise_id: "db-curl",          name: "Dumbbell Curl",            category: "biceps",    sets: 3, reps: 12, weight_kg: 12,
            logged_sets: [{ reps: 12, weight_kg: 12 }, { reps: 11, weight_kg: 12 }, { reps: 10, weight_kg: 12 }] },
          { exercise_id: "triceps-pushdown", name: "Triceps Pushdown",         category: "triceps",   sets: 3, reps: 12, weight_kg: 27,
            logged_sets: [{ reps: 12, weight_kg: 26 }, { reps: 11, weight_kg: 27 }, { reps: 10, weight_kg: 27 }] },
        ],
      },
      // ── Jun 8 — Hamstrings & lower back (follicular) ─────────────────────────
      {
        date: "2026-06-08", name: "Hamstrings & lower back", phase: "follicular",
        feel: ["Tugev", "Energiline"], notes: "",
        exercises: [
          { exercise_id: "treadmill",         name: "Treadmill Walking",       category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 1.0 }] },
          { exercise_id: "romanian-deadlift", name: "Romanian Deadlift",       category: "legs",      sets: 4, reps: 10, weight_kg: 57.5,
            logged_sets: [{ reps: 10, weight_kg: 52.5 }, { reps: 10, weight_kg: 55 }, { reps: 10, weight_kg: 57.5 }, { reps: 9, weight_kg: 57.5 }] },
          { exercise_id: "nordic-curl",       name: "Nordic Hamstring Curl",   category: "legs",      sets: 3, reps: 8,  weight_kg: 0,
            logged_sets: [{ reps: 8 }, { reps: 8 }, { reps: 7 }] },
          { exercise_id: "single-leg-deadlift",name:"Single-Leg Deadlift",     category: "functional",sets: 3, reps: 10, weight_kg: 22,
            logged_sets: [{ reps: 10, weight_kg: 22 }, { reps: 10, weight_kg: 22 }, { reps: 9, weight_kg: 22 }] },
          { exercise_id: "back-extension",    name: "Back Extension",          category: "back",      sets: 3, reps: 15, weight_kg: 12.5,
            logged_sets: [{ reps: 15, weight_kg: 12.5 }, { reps: 15, weight_kg: 12.5 }, { reps: 14, weight_kg: 12.5 }] },
          { exercise_id: "stair-climber",     name: "Stair Climber",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 12 }] },
        ],
      },
      // ── Jun 9 — Glutes & quads (follicular) ──────────────────────────────────
      {
        date: "2026-06-09", name: "Glutes & quads", phase: "follicular",
        feel: ["Energiline", "Tugev"], notes: "Hip thrust PR!",
        exercises: [
          { exercise_id: "treadmill",           name: "Treadmill Walking",     category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 1.0 }] },
          { exercise_id: "squat",               name: "Squat",                 category: "legs",      sets: 4, reps: 8,  weight_kg: 70,
            logged_sets: [{ reps: 8, weight_kg: 65 }, { reps: 8, weight_kg: 67.5 }, { reps: 8, weight_kg: 70 }, { reps: 7, weight_kg: 70 }] },
          { exercise_id: "bulgarian-split-squat",name:"Bulgarian Split Squat", category: "legs",      sets: 3, reps: 10, weight_kg: 25,
            logged_sets: [{ reps: 10, weight_kg: 24 }, { reps: 10, weight_kg: 25 }, { reps: 9, weight_kg: 25 }] },
          { exercise_id: "hip-thrust",          name: "Hip Thrust",            category: "glutes",    sets: 4, reps: 12, weight_kg: 75,
            logged_sets: [{ reps: 12, weight_kg: 70 }, { reps: 12, weight_kg: 72.5 }, { reps: 12, weight_kg: 75 }, { reps: 11, weight_kg: 75 }] },
          { exercise_id: "leg-extension",       name: "Leg Extension",         category: "legs",      sets: 3, reps: 15, weight_kg: 42.5,
            logged_sets: [{ reps: 15, weight_kg: 40 }, { reps: 15, weight_kg: 42.5 }, { reps: 13, weight_kg: 42.5 }] },
          { exercise_id: "hip-abduction",       name: "Hip Abduction Machine", category: "glutes",    sets: 3, reps: 15, weight_kg: 52.5,
            logged_sets: [{ reps: 15, weight_kg: 50 }, { reps: 15, weight_kg: 52.5 }, { reps: 14, weight_kg: 52.5 }] },
          { exercise_id: "stair-climber",       name: "Stair Climber",         category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 12 }] },
        ],
      },
      // ── Jun 10 — Upper body (follicular) ─────────────────────────────────────
      {
        date: "2026-06-10", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Tugev", "Energiline"], notes: "",
        exercises: [
          { exercise_id: "rowing-machine",   name: "Rowing Machine",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 2.4 }] },
          { exercise_id: "bench-press",      name: "Bench Press",              category: "chest",     sets: 4, reps: 8,  weight_kg: 67.5,
            logged_sets: [{ reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 8, weight_kg: 67.5 }, { reps: 7, weight_kg: 67.5 }] },
          { exercise_id: "db-shoulder-press",name: "Dumbbell Shoulder Press",  category: "shoulders", sets: 3, reps: 10, weight_kg: 18,
            logged_sets: [{ reps: 10, weight_kg: 17 }, { reps: 10, weight_kg: 18 }, { reps: 9, weight_kg: 18 }] },
          { exercise_id: "pull-up",          name: "Pull-Up",                  category: "back",      sets: 3, reps: 10, weight_kg: 0,
            logged_sets: [{ reps: 10 }, { reps: 9 }, { reps: 8 }] },
          { exercise_id: "seated-cable-row", name: "Seated Cable Row",         category: "back",      sets: 3, reps: 10, weight_kg: 50,
            logged_sets: [{ reps: 10, weight_kg: 47.5 }, { reps: 10, weight_kg: 50 }, { reps: 9, weight_kg: 50 }] },
          { exercise_id: "face-pull",        name: "Cable High Pull",          category: "back",      sets: 3, reps: 15, weight_kg: 24,
            logged_sets: [{ reps: 15, weight_kg: 22 }, { reps: 15, weight_kg: 24 }, { reps: 13, weight_kg: 24 }] },
          { exercise_id: "db-curl",          name: "Dumbbell Curl",            category: "biceps",    sets: 3, reps: 12, weight_kg: 12,
            logged_sets: [{ reps: 12, weight_kg: 12 }, { reps: 12, weight_kg: 12 }, { reps: 10, weight_kg: 12 }] },
          { exercise_id: "triceps-pushdown", name: "Triceps Pushdown",         category: "triceps",   sets: 3, reps: 12, weight_kg: 28,
            logged_sets: [{ reps: 12, weight_kg: 26 }, { reps: 12, weight_kg: 28 }, { reps: 10, weight_kg: 28 }] },
        ],
      },
      // ── Jun 11 — Hamstrings & lower back (follicular) ─────────────────────────
      {
        date: "2026-06-11", name: "Hamstrings & lower back", phase: "follicular",
        feel: ["Tugev", "Motiveeritud"], notes: "RDL feeling strong",
        exercises: [
          { exercise_id: "treadmill",         name: "Treadmill Walking",       category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 10, distance_km: 1.0 }] },
          { exercise_id: "romanian-deadlift", name: "Romanian Deadlift",       category: "legs",      sets: 4, reps: 10, weight_kg: 60,
            logged_sets: [{ reps: 10, weight_kg: 55 }, { reps: 10, weight_kg: 57.5 }, { reps: 10, weight_kg: 60 }, { reps: 9, weight_kg: 60 }] },
          { exercise_id: "nordic-curl",       name: "Nordic Hamstring Curl",   category: "legs",      sets: 3, reps: 9,  weight_kg: 0,
            logged_sets: [{ reps: 9 }, { reps: 8 }, { reps: 7 }] },
          { exercise_id: "single-leg-deadlift",name:"Single-Leg Deadlift",     category: "functional",sets: 3, reps: 10, weight_kg: 24,
            logged_sets: [{ reps: 10, weight_kg: 22 }, { reps: 10, weight_kg: 24 }, { reps: 9, weight_kg: 24 }] },
          { exercise_id: "back-extension",    name: "Back Extension",          category: "back",      sets: 3, reps: 15, weight_kg: 15,
            logged_sets: [{ reps: 15, weight_kg: 12.5 }, { reps: 15, weight_kg: 15 }, { reps: 13, weight_kg: 15 }] },
          { exercise_id: "stair-climber",     name: "Stair Climber",           category: "cardio",    sets: 1, reps: 1,  weight_kg: 0,
            logged_sets: [{ duration_min: 15 }] },
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
        date: "2026-05-29", name: "HYROX Simulation", phase: "menstruation",
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

export const setUserPlan = internalMutation({
  args: { userId: v.id("users"), plan: v.union(v.literal("free"), v.literal("monthly"), v.literal("yearly")) },
  handler: async (ctx, { userId, plan }) => {
    const existing = await ctx.db.query("profiles").withIndex("by_user", q => q.eq("userId", userId)).first();
    if (existing) await ctx.db.patch(existing._id, { plan });
    return `Set plan to ${plan}`;
  },
});

export const seedJuneWorkouts = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const juneWorkouts = [
      { date: "2026-06-03", name: "Alakeha päev", phase: "follicular", feel: ["Energiline"], notes: "",
        exercises: [{ exercise_id: "squat", name: "Squat", category: "legs", sets: 4, reps: 8, weight_kg: 70, logged_sets: [{ reps: 8, weight_kg: 70 }, { reps: 8, weight_kg: 72.5 }, { reps: 7, weight_kg: 72.5 }, { reps: 6, weight_kg: 75 }] }] },
      { date: "2026-06-04", name: "Kardio", phase: "follicular", feel: ["Kerge"], notes: "",
        exercises: [{ exercise_id: "running", name: "Running", category: "cardio", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 30, distance_km: 5 }] }] },
      { date: "2026-06-05", name: "Ülaosa jõutreening", phase: "follicular", feel: ["Tugev"], notes: "",
        exercises: [{ exercise_id: "bench-press", name: "Bench Press", category: "chest", sets: 4, reps: 8, weight_kg: 65, logged_sets: [{ reps: 8, weight_kg: 65 }, { reps: 8, weight_kg: 67.5 }, { reps: 7, weight_kg: 67.5 }, { reps: 6, weight_kg: 70 }] }] },
      { date: "2026-06-06", name: "Jooga", phase: "follicular", feel: ["Rahulik"], notes: "",
        exercises: [{ exercise_id: "yoga", name: "Yoga", category: "flexibility", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 45 }] }] },
      { date: "2026-06-07", name: "Täiskeha treening", phase: "follicular", feel: ["Motiveeritud", "Tugev"], notes: "",
        exercises: [
          { exercise_id: "deadlift", name: "Deadlift", category: "back", sets: 3, reps: 5, weight_kg: 80, logged_sets: [{ reps: 5, weight_kg: 80 }, { reps: 5, weight_kg: 82.5 }, { reps: 4, weight_kg: 85 }] },
          { exercise_id: "pull-up", name: "Pull-Up", category: "back", sets: 3, reps: 8, weight_kg: 0, logged_sets: [{ reps: 8 }, { reps: 7 }, { reps: 6 }] },
        ] },
      { date: "2026-06-08", name: "Jalad & tuharad", phase: "follicular", feel: ["Energiline"], notes: "",
        exercises: [{ exercise_id: "romanian-deadlift", name: "Romanian Deadlift", category: "legs", sets: 4, reps: 10, weight_kg: 55, logged_sets: [{ reps: 10, weight_kg: 55 }, { reps: 10, weight_kg: 57.5 }, { reps: 9, weight_kg: 57.5 }, { reps: 8, weight_kg: 60 }] }] },
      { date: "2026-06-09", name: "HIIT", phase: "follicular", feel: ["Väsinud", "Rahul"], notes: "",
        exercises: [{ exercise_id: "burpee", name: "Burpee", category: "fullbody", sets: 4, reps: 15, weight_kg: 0, logged_sets: [{ reps: 15 }, { reps: 14 }, { reps: 13 }, { reps: 12 }] }] },
      { date: "2026-06-10", name: "Ülaosa päev", phase: "follicular", feel: ["Tugev"], notes: "",
        exercises: [{ exercise_id: "overhead-press", name: "Overhead Press", category: "shoulders", sets: 3, reps: 10, weight_kg: 42.5, logged_sets: [{ reps: 10, weight_kg: 40 }, { reps: 9, weight_kg: 42.5 }, { reps: 8, weight_kg: 42.5 }] }] },
      { date: "2026-06-11", name: "Mobiilsustöö", phase: "follicular", feel: ["Rahulik"], notes: "",
        exercises: [{ exercise_id: "stretching", name: "Stretching", category: "flexibility", sets: 1, reps: 1, weight_kg: 0, logged_sets: [{ duration_min: 30 }] }] },
    ];
    for (const w of juneWorkouts) {
      await ctx.db.insert("workouts", { userId, ...w });
    }
    return `Seeded ${juneWorkouts.length} June workouts`;
  },
});

