import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
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

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    birth_year: v.optional(v.number()),
    cycle_length: v.number(),
    period_length: v.number(),
    last_period_date: v.optional(v.string()),
    fitness_level: v.optional(v.union(
      v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")
    )),
    plan: v.union(v.literal("free"), v.literal("monthly"), v.literal("yearly")),
  }).index("by_user", ["userId"]),

  workouts: defineTable({
    userId: v.id("users"),
    date: v.string(),
    name: v.string(),
    exercises: v.array(exerciseV),
    feel: v.array(v.string()),
    notes: v.string(),
    phase: v.string(),
  }).index("by_user_date", ["userId", "date"]),

  routines: defineTable({
    userId: v.id("users"),
    name: v.string(),
    exercises: v.array(v.object({
      exercise_id: v.string(),
      name: v.string(),
      category: v.optional(v.string()),
      fields: v.array(v.string()),
    })),
  }).index("by_user", ["userId"]),

  cycle_days: defineTable({
    userId: v.id("users"),
    date: v.string(),
    period: v.boolean(),
    mood: v.optional(v.union(
      v.literal("bad"), v.literal("neutral"), v.literal("good"),
      v.literal("great"), v.literal("energized"),
    )),
    symptoms: v.array(v.string()),
  }).index("by_user_date", ["userId", "date"]),
});
