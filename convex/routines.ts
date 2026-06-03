import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const routineExerciseV = v.object({
  exercise_id: v.string(),
  name: v.string(),
  category: v.optional(v.string()),
  fields: v.array(v.string()),
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db.query("routines").withIndex("by_user", (q) => q.eq("userId", userId)).collect();
  },
});

export const add = mutation({
  args: { name: v.string(), exercises: v.array(routineExerciseV) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return ctx.db.insert("routines", { userId, name: args.name, exercises: args.exercises });
  },
});

export const update = mutation({
  args: { id: v.id("routines"), name: v.string(), exercises: v.array(routineExerciseV) },
  handler: async (ctx, { id, name, exercises }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(id, { name, exercises });
  },
});

export const remove = mutation({
  args: { id: v.id("routines") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(id);
  },
});
