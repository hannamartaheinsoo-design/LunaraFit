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
- **Always call `preview_resize(preset="mobile")` before any `preview_screenshot`** — the app is phone-only (375×812). The viewport does not persist across reloads; resize every time.
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

---

# Seeding & Test Data

**Seed script:** `convex/seed.ts` — internal mutations, run with `npx convex run seed:seedAll '{"userId":"<id>"}'`
- `seed:listAllUsers` — lists all user IDs and profiles (temporarily extend to include `authAccounts` if you need emails)
- `seed:seedAll` — full reseed: profile + cycle days + workouts + HYROX simulations
- `seed:setUserPlan` — change a user's plan: `'{"userId":"...","plan":"monthly"}'`
- Account emails are stored in `authAccounts` table (not in `profiles`). Query via internal mutation temporarily.
- **Full routines in seed:** every workout entry must include ALL exercises from the routine, not a subset. Partial workouts make progress tracking useless.

**Free plan limit:** 10 workouts per calendar month, enforced server-side in `convex/workouts.ts`. Throws `FREE_PLAN_LIMIT` error string. UI catches this and shows upgrade prompt.

---

# Home Screen — home.tsx

**No decorative background:** the home screen uses a plain `backgroundColor` only — no `LinearGradient`, no blob `View`s. Do not re-add decorative blobs or gradients.

**Activity chart removed — replaced by TodayCard:** The weekly area chart ("Nädala aktiivsus") was replaced with a **Today's Readiness** card (`TodayCard` component in `home.tsx`). It shows:
- Phase-appropriate workout type pill (colour-coded per `PHASE_COLORS`)
- 5-segment energy bar calibrated via `PHASE_ENERGY` (menstruation 0.25 → ovulation 1.0)
- 3 actionable tips from `home.today.tips.<phaseKey>` i18n array keys
- "Full analysis →" link to the insights tab
- Falls back to a "add cycle data" message when `phaseKey` is null

Do not re-add the area chart. Do not revert to workout-count-per-day.

---

# Progress Tab — workouts.tsx

**Catalog grouping:** exercise progress cards are grouped by routine name (matched by `e.name.toLowerCase()`), then a HYROX bucket (hardcoded station names), then catch-all "Other". Catalogs are collapsible via `expandedCatalogs: Set<string>` state.

**Stats card layout:** label above the number — label is the headline, number is supporting info. Do not revert to number-first layout.

**28-day heatmap:** normalises to Mon–Sun columns. Uses `(todayDow = (getDay()+6)%7)` to pad blank cells so week rows always start on Monday.

**Progression bars (sparkStripCol/sparkStripBar):** normalise bar height from `min` to `max` of the slice (not 0 to max) so small weight gains are visually obvious. Show weight labels above bars at first session, last session, and any session where weight changed.

---

# Dark Mode / Theming

**Theme hook:** `useTheme()` from `lib/useTheme.ts` returns `ThemeTokens` — a typed object with `bg`, `surface`, `surface2`, `border`, `border2`, `text`, `textSec`, `textMuted`, `blushBg`, `blushBorder`, `skyBg`, `skyBorder`, `dark`.

**Never use `StyleSheet.create` with color values.** Colors in static `StyleSheet.create` are baked in at module load and never update when the device switches light/dark. Layout-only properties (padding, flex, borderRadius) are fine in static StyleSheet.

**Pattern — always use `makeStyles`:**
```ts
import { useTheme, ThemeTokens } from '../../lib/useTheme';

function makeStyles(T: ThemeTokens) {
  return StyleSheet.create({
    card: { backgroundColor: T.surface, borderColor: T.border, ... },
    label: { color: T.textSec, ... },
  });
}

export default function MyScreen() {
  const T = useTheme();
  const styles = makeStyles(T);
  ...
}
```
Every sub-component that uses `styles` must also call `const styles = makeStyles(T)` — the styles object is not shared across components.

**Color palette — valid indices only:**
Palette maps: `{ 50, 100, 200, 400, 600, 800 }` — indices 300, 500, 700 do NOT exist and evaluate to `undefined` (renders as black). Always confirm index exists in `constants/theme.ts`.

**JSX prop colors must also use T.* tokens** — grep the whole file, not just the StyleSheet block, for `Colors.beige[*]` and `Colors.cream` when auditing theme compliance. Common props to check: `color={}` on `<Icon>`, `placeholderTextColor={}` on `<TextInput>`, inline `{ color: ... }` style objects.

**Icons on colored backgrounds** (blush, coral, green buttons) should use `"#fff"` not `T.bg` — `T.bg` is near-black in dark mode.

---

# Onboarding Flow — routing & auth

**Onboarding screens:** `app/(onboarding)/` — welcome → signup → name → fitness → plan

**Auth is step 2 of onboarding** (not a pre-gate). Unauthenticated users land on `welcome`, pick language, then proceed to `signup` to create/sign-in. The `/(auth)/login` route still exists but is no longer the primary entry point.

**NavigationController routing (in `_layout.tsx`):**
- unauthenticated → `/(onboarding)/welcome`
- authenticated + not onboarded (no `profile.name`) → `/(onboarding)/name`
- authenticated + onboarded → `/(tabs)/home`

**Post-auth redirect rule:** Any screen that calls `signIn()` must have its own `useEffect` watching `isReady + isAuthenticated + isOnboarded` to redirect after auth settles. Do NOT rely solely on `NavigationController` — it has a dev bypass (`ob_preview` sessionStorage) and can miss transitions.

**CTA button rule:** Never wrap primary action buttons in `Animated.View` with an opacity/delay animation. Animate content cards and headings only. The CTA must be visible from the moment the screen mounts.

---

# Cycle Screen — cycle.tsx

**Calendar tap-to-log:** every calendar day cell is a `TouchableOpacity`. Tapping calls `handleDayPress(ds)` which sets the `date` state and scrolls the `ScrollView` (ref: `scrollRef`) down to y=520 so the log form comes into view. The calendar itself is display-only — all logging happens in the form below.

**Selected day highlight:** `isSelected = ds === date` adds `styles.calSelected` (dark border ring) to the circle. Does not override logged/predicted/ovulation styles.

---

# Insights Screen — insights.tsx

**Tab structure:** Insights uses 4 equal-width pill tabs (Body | Training | Wellbeing | Patterns) rendered as a non-scrollable `flexDirection: 'row'` with `flex: 1` on each pill. Do NOT use a horizontal ScrollView for these tabs — all 4 must be visible at once on a 375px viewport.

**Body tab — data model:**
- `PhaseInsight` now has `hormoneChips: string[]` (compact chip labels), `energySummary: string` (one-liner), and `energyArc: [number, number]` (energy level 0–1 at phase start and end).
- Hormone section renders chips in a wrapping flex row instead of bullet sentences.
- Energy section renders 6 bottom-aligned bars using `position: 'absolute', bottom: 0` inside each `position: 'relative'` wrapper — this is the only approach that works in RN web for variable-height bottom-aligned bars.

**Patterns tab — data model:**
- `DetectedPattern` now has `metric: string` (large callout number, e.g. "+2%") and `subtext: string` (one context line). Pattern cards show metric left, title + subtext + confidence badge right.
- The long `body` string is kept in the data but not rendered in the UI (retained for future use).

**Web tab bar — `_layout.tsx`:**
- The tab bar uses `position: 'fixed', bottom: 0, left: 0, right: 0` on web only (via `Platform.OS === 'web'` spread).
- Current web height: `130px`, paddingBottom: `60px`.
- All `ScrollView` / `FlatList` `contentContainerStyle` across all tab screens must have `paddingBottom: 130` to prevent content hiding under the fixed bar. If tab bar height changes, update all five screens.
