import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch all user data + auth records
    const [workouts, cycleDays, profile, sessions, accounts] = await Promise.all([
      ctx.db.query("workouts").withIndex("by_user_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("cycle_days").withIndex("by_user_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("profiles").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("authSessions").withIndex("userId", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("authAccounts").withIndex("userIdAndProvider", (q) => q.eq("userId", userId)).collect(),
    ]);

    // For each session, delete its refresh tokens
    const refreshTokens = (
      await Promise.all(
        sessions.map((s) =>
          ctx.db.query("authRefreshTokens").withIndex("sessionId", (q) => q.eq("sessionId", s._id)).collect()
        )
      )
    ).flat();

    // For each account, delete its verification codes
    const verificationCodes = (
      await Promise.all(
        accounts.map((a) =>
          ctx.db.query("authVerificationCodes").withIndex("accountId", (q) => q.eq("accountId", a._id)).collect()
        )
      )
    ).flat();

    await Promise.all([
      // App data
      ...workouts.map((w) => ctx.db.delete(w._id)),
      ...cycleDays.map((d) => ctx.db.delete(d._id)),
      ...(profile ? [ctx.db.delete(profile._id)] : []),
      // Auth records
      ...refreshTokens.map((r) => ctx.db.delete(r._id)),
      ...verificationCodes.map((v) => ctx.db.delete(v._id)),
      ...sessions.map((s) => ctx.db.delete(s._id)),
      ...accounts.map((a) => ctx.db.delete(a._id)),
      // The user record itself
      ctx.db.delete(userId),
    ]);
  },
});
