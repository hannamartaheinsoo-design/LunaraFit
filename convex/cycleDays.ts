import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const moodV = v.optional(v.union(
  v.literal("bad"), v.literal("neutral"), v.literal("good"), v.literal("great"), v.literal("energized"),
));

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db.query("cycle_days").withIndex("by_user_date", (q) => q.eq("userId", userId)).order("desc").collect();
  },
});

export const upsert = mutation({
  args: { date: v.string(), period: v.boolean(), mood: moodV, symptoms: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.query("cycle_days")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("cycle_days", { userId, ...args });
    }
  },
});
