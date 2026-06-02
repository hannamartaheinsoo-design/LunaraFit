# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

---

# Mistakes & Learnings — MANDATORY RULES

**At the START of every session:** Read `MISTAKES.md` in the repo root. Apply every rule listed there. Do not repeat any logged mistake.

**At the END of every session (or whenever a mistake is discovered):** Append a new entry to `MISTAKES.md` following the format in that file. Do this even if the mistake was small.

**NEVER delete, truncate, or rewrite `MISTAKES.md`.** Only append. It is a permanent append-only log. Git history makes deletion recoverable, but deletion is forbidden regardless.

**If `MISTAKES.md` does not exist** (e.g. fresh clone before it was created): recreate it with just the header and the entry for the current mistake — do not leave mistakes unlogged.

---

# Backend: Convex + Convex Auth

This project uses **Convex** as the backend and **`@convex-dev/auth`** for authentication. There is NO Supabase, NO AsyncStorage for user data.

- Start backend: `PATH="/opt/homebrew/bin:$PATH" npx convex dev` (node is at `/opt/homebrew/bin/node`)
- Start frontend: `PATH="/opt/homebrew/bin:$PATH" npx expo start --web --port 8081`
- Convex URL is in `.env.local` as `EXPO_PUBLIC_CONVEX_URL`
- Auth providers: email/password (works), Google + Apple (need `AUTH_GOOGLE_ID/SECRET`, `AUTH_APPLE_ID/SECRET` env vars)
- Backend files: `convex/schema.ts`, `convex/auth.ts`, `convex/profiles.ts`, `convex/workouts.ts`, `convex/cycleDays.ts`, `convex/userData.ts`

**Data access — always use Convex, never `storage.*`:**
- Read: `useQuery(api.profiles.get)`, `useQuery(api.workouts.list)`, `useQuery(api.cycleDays.list)` — reactive, no `useEffect` needed
- Write: `useMutation(api.profiles.upsert)`, `useMutation(api.workouts.add)`, `useMutation(api.workouts.remove)`, `useMutation(api.cycleDays.upsert)`, `useMutation(api.userData.clearAll)`
- Auth state: `useAuth()` from `lib/authContext` (wraps `useConvexAuth()` + `api.profiles.get`)

**Platform guards:**
- `expo-secure-store` is native-only — always wrap with `Platform.OS !== 'web'`
- Pass `storage={undefined}` to `ConvexAuthProvider` on web (falls back to `localStorage`)

**Provider nesting order in `_layout.tsx`:**
```
ConvexAuthProvider > AuthProvider > LangProvider > Stack
```

---

# i18n / Translations

All user-visible strings must go through `useTranslation()` from `lib/LangContext`. Never hardcode display strings in screen components.

- All strings are in `lib/i18n.ts` with `et` (Estonian) and `en` (English) keys
- Hook: `const { t, tArr, lang, setLang } = useTranslation()`
- Content libraries with display text (e.g. `lib/cycleInsights.ts`) must export lang-aware functions: `getXxx(lang)`
- `lib/cycle.ts` exposes `getPhaseLabel(phase, lang)` — use this instead of `PHASE_LABELS[phase]`
