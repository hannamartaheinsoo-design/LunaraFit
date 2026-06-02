import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const [workouts, cycleDays, profile] = await Promise.all([
      ctx.db.query("workouts").withIndex("by_user_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("cycle_days").withIndex("by_user_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("profiles").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
    ]);
    await Promise.all([
      ...workouts.map((w) => ctx.db.delete(w._id)),
      ...cycleDays.map((d) => ctx.db.delete(d._id)),
      ...(profile ? [ctx.db.delete(profile._id)] : []),
    ]);
  },
});
