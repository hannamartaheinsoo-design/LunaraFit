import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const exerciseSetV = v.object({
  reps: v.optional(v.number()),
  weight_kg: v.optional(v.number()),
  duration_min: v.optional(v.number()),
  distance_km: v.optional(v.number()),
});

const exerciseV = v.object({
  exercise_id: v.optional(v.string()),
  name: v.string(),
  category: v.optional(v.string()),
  sets: v.number(),
  reps: v.number(),
  weight_kg: v.number(),
  logged_sets: v.optional(v.array(exerciseSetV)),
  duration_min: v.optional(v.number()),
  distance_km: v.optional(v.number()),
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db.query("workouts").withIndex("by_user_date", (q) => q.eq("userId", userId)).order("desc").collect();
  },
});

export const add = mutation({
  args: {
    date: v.string(),
    name: v.string(),
    exercises: v.array(exerciseV),
    feel: v.array(v.string()),
    notes: v.string(),
    phase: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return ctx.db.insert("workouts", { userId, ...args });
  },
});

export const remove = mutation({
  args: { id: v.id("workouts") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const w = await ctx.db.get(id);
    if (w?.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(id);
  },
});
