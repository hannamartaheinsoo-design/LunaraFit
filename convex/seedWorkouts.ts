import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";

const PHASES = ["menstrual", "follicular", "ovulatory", "luteal"] as const;

const CAT_BASE: Record<string, number> = {
  legs: 60, back: 50, chest: 40, shoulders: 25, arms: 20,
  core: 0, cardio: 0, fullbody: 40, hyrox: 0,
};

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const routines = await ctx.db
      .query("routines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (routines.length === 0)
      throw new Error("No routines found. Create at least one routine first.");

    const COUNT = 12;
    const today = new Date();

    for (let i = 0; i < COUNT; i++) {
      const daysAgo = Math.round((COUNT - 1 - i) * (84 / (COUNT - 1)));
      const d = new Date(today.getTime() - daysAgo * 86400000);
      const dateStr = d.toISOString().slice(0, 10);

      const routine = routines[i % routines.length];
      const progress = (i + 1) / COUNT; // 0.08 → 1.0

      const exercises = routine.exercises.map((re) => {
        const hasWeight   = re.fields.includes("weight");
        const hasReps     = re.fields.includes("reps");
        const hasDuration = re.fields.includes("duration");
        const hasDistance = re.fields.includes("distance");

        const base   = CAT_BASE[re.category ?? "fullbody"] ?? 40;
        const weight = hasWeight ? Math.round((base * (0.7 + progress * 0.4)) * 2) / 2 : 0;
        const reps   = hasReps ? Math.round(8 + progress * 4) : 0;

        const loggedSets = Array.from({ length: 3 }, (_, si) => ({
          reps:        hasReps     ? reps + (si === 2 ? -1 : 0)          : undefined,
          weight_kg:   hasWeight   ? weight - (si === 0 ? 5 : 0) + (si === 2 ? 2.5 : 0) : undefined,
          duration_min: hasDuration ? Math.round((15 + progress * 20) * 10) / 10 : undefined,
          distance_km:  hasDistance ? Math.round((3 + progress * 5) * 10) / 10   : undefined,
        }));

        const avgWeight = hasWeight
          ? loggedSets.reduce((s, x) => s + (x.weight_kg ?? 0), 0) / 3
          : 0;

        return {
          exercise_id:  re.exercise_id,
          name:         re.name,
          category:     re.category,
          sets:         3,
          reps,
          weight_kg:    Math.round(avgWeight * 10) / 10,
          logged_sets:  loggedSets,
          duration_min: hasDuration ? loggedSets[0].duration_min : undefined,
          distance_km:  hasDistance ? loggedSets[0].distance_km  : undefined,
        };
      });

      await ctx.db.insert("workouts", {
        userId,
        date:      dateStr,
        name:      routine.name,
        exercises,
        feel:      [],
        notes:     "",
        phase:     PHASES[i % PHASES.length],
      });
    }

    return COUNT;
  },
});
