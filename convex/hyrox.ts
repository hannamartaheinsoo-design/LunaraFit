import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const rows = await ctx.db
      .query("hyrox_goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows[0] ?? null;
  },
});

export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const rows = await ctx.db
      .query("hyrox_goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const row of rows) await ctx.db.delete(row._id);
  },
});

export const upsert = mutation({
  args: {
    competition_name:           v.optional(v.string()),
    competition_date:           v.optional(v.string()),
    division:                   v.optional(v.string()),
    goal_minutes:               v.optional(v.number()),
    target_run_pace_min_per_km: v.optional(v.number()),
    weakest_stations:           v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const rows = await ctx.db
      .query("hyrox_goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (rows[0]) {
      await ctx.db.patch(rows[0]._id, args);
    } else {
      await ctx.db.insert("hyrox_goals", { userId, ...args });
    }
  },
});
