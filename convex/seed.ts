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

export const seedWorkouts = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {

    const workouts = [
      {
        date: "2026-05-06", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Energiline", "Tugev"],
        notes: "",
        exercises: [
          { exercise_id: "bench-press", name: "Bench Press", category: "chest", sets: 4, reps: 8, weight_kg: 55,
            logged_sets: [{ reps: 8, weight_kg: 55 }, { reps: 8, weight_kg: 57.5 }, { reps: 7, weight_kg: 60 }, { reps: 6, weight_kg: 60 }] },
          { exercise_id: "overhead-press", name: "Overhead Press", category: "shoulders", sets: 3, reps: 10, weight_kg: 30,
            logged_sets: [{ reps: 10, weight_kg: 30 }, { reps: 9, weight_kg: 32.5 }, { reps: 8, weight_kg: 32.5 }] },
        ],
      },
      {
        date: "2026-05-10", name: "Ülaosa jõutreening", phase: "ovulation",
        feel: ["Tugev", "Motiveeritud"],
        notes: "Väga hea päev!",
        exercises: [
          { exercise_id: "bench-press", name: "Bench Press", category: "chest", sets: 4, reps: 8, weight_kg: 60,
            logged_sets: [{ reps: 8, weight_kg: 57.5 }, { reps: 8, weight_kg: 60 }, { reps: 8, weight_kg: 62.5 }, { reps: 7, weight_kg: 62.5 }] },
          { exercise_id: "overhead-press", name: "Overhead Press", category: "shoulders", sets: 3, reps: 10, weight_kg: 35,
            logged_sets: [{ reps: 10, weight_kg: 32.5 }, { reps: 9, weight_kg: 35 }, { reps: 8, weight_kg: 35 }] },
        ],
      },
      {
        date: "2026-05-14", name: "Alakeha päev", phase: "luteal",
        feel: ["Väsinud", "Raske"],
        notes: "",
        exercises: [
          { exercise_id: "squat", name: "Squat", category: "legs", sets: 4, reps: 8, weight_kg: 65,
            logged_sets: [{ reps: 8, weight_kg: 60 }, { reps: 8, weight_kg: 65 }, { reps: 7, weight_kg: 65 }, { reps: 6, weight_kg: 65 }] },
          { exercise_id: "romanian-deadlift", name: "Romanian Deadlift", category: "legs", sets: 3, reps: 10, weight_kg: 50,
            logged_sets: [{ reps: 10, weight_kg: 50 }, { reps: 10, weight_kg: 52.5 }, { reps: 9, weight_kg: 52.5 }] },
        ],
      },
      {
        date: "2026-05-20", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Energiline", "Tugev"],
        notes: "",
        exercises: [
          { exercise_id: "bench-press", name: "Bench Press", category: "chest", sets: 4, reps: 8, weight_kg: 62.5,
            logged_sets: [{ reps: 8, weight_kg: 60 }, { reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 7, weight_kg: 65 }] },
          { exercise_id: "overhead-press", name: "Overhead Press", category: "shoulders", sets: 3, reps: 10, weight_kg: 37.5,
            logged_sets: [{ reps: 10, weight_kg: 35 }, { reps: 9, weight_kg: 37.5 }, { reps: 8, weight_kg: 37.5 }] },
        ],
      },
      {
        date: "2026-05-24", name: "Alakeha päev", phase: "ovulation",
        feel: ["Energiline", "Motiveeritud"],
        notes: "",
        exercises: [
          { exercise_id: "squat", name: "Squat", category: "legs", sets: 4, reps: 8, weight_kg: 70,
            logged_sets: [{ reps: 8, weight_kg: 65 }, { reps: 8, weight_kg: 70 }, { reps: 8, weight_kg: 72.5 }, { reps: 7, weight_kg: 72.5 }] },
          { exercise_id: "romanian-deadlift", name: "Romanian Deadlift", category: "legs", sets: 3, reps: 10, weight_kg: 55,
            logged_sets: [{ reps: 10, weight_kg: 52.5 }, { reps: 10, weight_kg: 55 }, { reps: 9, weight_kg: 57.5 }] },
        ],
      },
      {
        date: "2026-05-28", name: "HIIT treening", phase: "luteal",
        feel: ["Kerge", "Väsinud"],
        notes: "",
        exercises: [
          { exercise_id: "high-knees", name: "High Knees", category: "hiit", sets: 3, reps: 30, weight_kg: 0,
            logged_sets: [{ reps: 30, duration_min: 0.5 }, { reps: 30, duration_min: 0.5 }, { reps: 30, duration_min: 0.5 }] },
          { exercise_id: "burpee", name: "Burpee", category: "fullbody", sets: 3, reps: 15, weight_kg: 0,
            logged_sets: [{ reps: 15 }, { reps: 13 }, { reps: 12 }] },
        ],
      },
      {
        date: "2026-06-02", name: "Ülaosa jõutreening", phase: "follicular",
        feel: ["Tugev", "Motiveeritud"],
        notes: "Uus rekord bench press!",
        exercises: [
          { exercise_id: "bench-press", name: "Bench Press", category: "chest", sets: 4, reps: 8, weight_kg: 67.5,
            logged_sets: [{ reps: 8, weight_kg: 62.5 }, { reps: 8, weight_kg: 65 }, { reps: 8, weight_kg: 67.5 }, { reps: 7, weight_kg: 67.5 }] },
          { exercise_id: "overhead-press", name: "Overhead Press", category: "shoulders", sets: 3, reps: 10, weight_kg: 40,
            logged_sets: [{ reps: 10, weight_kg: 37.5 }, { reps: 9, weight_kg: 40 }, { reps: 8, weight_kg: 40 }] },
        ],
      },
    ];

    for (const w of workouts) {
      await ctx.db.insert("workouts", { userId, ...w });
    }
    return `Seeded ${workouts.length} workouts`;
  },
});
