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
- Start frontend: `PATH="/opt/homebrew/bin:$PATH" npx expo start --web --port 19006`
- The `preview_start` tool uses `.claude/launch.json` — port must match (currently 19006)
- Convex URL is in `.env.local` as `EXPO_PUBLIC_CONVEX_URL`
- Auth providers: email/password (works), Google + Apple (need `AUTH_GOOGLE_ID/SECRET`, `AUTH_APPLE_ID/SECRET` env vars)
- Backend files: `convex/schema.ts`, `convex/auth.ts`, `convex/profiles.ts`, `convex/workouts.ts`, `convex/cycleDays.ts`, `convex/userData.ts`
- `cycle_days` table has: `period` (bool), `spotting` (optional bool), `mood`, `symptoms[]`
- `profiles` table has: `birth_year`, `birth_month`, `birth_day` (all optional numbers) — used together for precise age validation (≥ 16 required)

**Data access — always use Convex, never `storage.*`:**
- Read: `useQuery(api.profiles.get)`, `useQuery(api.workouts.list)`, `useQuery(api.cycleDays.list)` — reactive, no `useEffect` needed
- Write: `useMutation(api.profiles.upsert)`, `useMutation(api.workouts.add)`, `useMutation(api.workouts.remove)`, `useMutation(api.cycleDays.upsert)`, `useMutation(api.cycleDays.fillPeriodGap)`, `useMutation(api.userData.clearAll)`
- Auth state: `useAuth()` from `lib/authContext` (wraps `useConvexAuth()` + `api.profiles.get`)

**Toggle state pattern:**
- Yes/no toggles that may be unanswered must use `boolean | null` (null = unanswered, not `false`)
- Button highlight: `variant={val === true ? 'active' : 'outline'}` — never `val ? 'active' : 'outline'`
- Boolean fields passed to Convex mutations must always be explicit booleans — use `val === true`, never `val || undefined` (which silently drops `false` and prevents patching)

**Platform guards:**
- `expo-secure-store` is native-only — always wrap with `Platform.OS !== 'web'`
- Pass `storage={undefined}` to `ConvexAuthProvider` on web (falls back to `localStorage`)
- `Alert.alert` is a **silent no-op on web** — never use it for confirmations without a web fallback. On web, render inline confirmation UI via React state instead.

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

---

# Fonts

The app uses **Inter** via `@expo-google-fonts/inter`. Fonts are loaded in `app/_layout.tsx` and named in `constants/theme.ts`.

Loaded weights: `Inter_300Light`, `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`

`Fonts` token → Inter mapping:
- `sans` / `serif` → `Inter_400Regular`
- `sansLight` / `serifItalic` → `Inter_300Light`
- `sansMedium` / `serifSemiBold` / `sansSemiBold` → `Inter_500Medium`
- `sansBold` / `serifSemiBoldItalic` → `Inter_600SemiBold`

**Rule:** The heaviest weight in use is 600 (SemiBold) — do not use 700 Bold. When adding new text styles, pick from the four loaded weights above.

---

# UI Components

**DatePicker** (`components/ui/DatePicker.tsx`)
- Reusable 3-field date input (year / month / day). Returns and accepts ISO `YYYY-MM-DD` strings.
- Field order is lang-aware: ET → year / Kuu (KK) / Päev (PP); EN → year / Day (DD) / Month (MM)
- Auto-advances focus after 4 digits (year) or 2 digits (month/day)
- Month is clamped to max 12 automatically
- Styled with underline only (no border box) — do not add borders, keep it minimal
- Usage: `<DatePicker value={dateString} onChange={setDateString} />`
