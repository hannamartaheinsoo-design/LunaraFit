import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ctx.db.query("profiles").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
  },
});

export const upsert = mutation({
  args: {
    name: v.optional(v.string()),
    birth_year: v.optional(v.number()),
    birth_month: v.optional(v.number()),
    birth_day: v.optional(v.number()),
    cycle_length: v.optional(v.number()),
    period_length: v.optional(v.number()),
    last_period_date: v.optional(v.string()),
    fitness_level: v.optional(v.union(
      v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")
    )),
    plan: v.optional(v.union(v.literal("free"), v.literal("monthly"), v.literal("yearly"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.query("profiles").withIndex("by_user", (q) => q.eq("userId", userId)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("profiles", {
        userId,
        cycle_length: args.cycle_length ?? 28,
        period_length: args.period_length ?? 5,
        plan: args.plan ?? "free",
        ...args,
      });
    }
  },
});
