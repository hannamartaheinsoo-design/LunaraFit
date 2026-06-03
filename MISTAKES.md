# Mistakes & Learnings Log

> **NEVER DELETE THIS FILE. NEVER TRUNCATE THIS FILE. ONLY APPEND.**
> This file is permanent project knowledge. Git history preserves it even if removed from the tree.
> Every Claude session that makes or discovers a mistake MUST append to this file before closing.

---

## How to Add an Entry

```
### [YYYY-MM-DD] Short title of mistake
**What happened:** Describe what went wrong.
**Root cause:** Why it happened.
**Fix applied:** What was done to resolve it.
**Rule going forward:** The specific rule to follow to avoid repeating this.
```

---

## Log

### [2026-06-02] Expo docs version mismatch
**What happened:** Code was written using outdated Expo APIs not present in the project's actual Expo SDK version (v56).
**Root cause:** Assumed knowledge of Expo APIs without consulting versioned docs.
**Fix applied:** Added instruction in AGENTS.md to always read https://docs.expo.dev/versions/v56.0.0/ before writing Expo code.
**Rule going forward:** Always fetch versioned Expo docs before writing any Expo/React Native code. Never rely on training-data knowledge of Expo — the API surface changes with every SDK release.

### [2026-06-02] Missing web dependencies for Expo web
**What happened:** Web build failed because required web-specific packages were absent.
**Root cause:** Expo web requires additional packages beyond the core Expo install; these were not added when web support was first needed.
**Fix applied:** Added missing web dependencies explicitly.
**Rule going forward:** When adding Expo web support, always check that `react-dom`, `@expo/webpack-config`, or Metro web config deps are present before running the web build.

### [2026-06-02] typedRoutes incompatibility with expo-router on web
**What happened:** Web build failed with a module resolution error tied to `typedRoutes` being enabled in `app.json`.
**Root cause:** `typedRoutes` (experimental) was enabled but caused the expo-router module to fail to resolve on web.
**Fix applied:** Disabled `typedRoutes` in the expo-router plugin config.
**Rule going forward:** Keep `typedRoutes` disabled unless explicitly testing typed routes on a branch where web builds are not required.

### [2026-06-02] Language selection on welcome screen was not persisted or applied globally
**What happened:** A language picker existed on the welcome screen but selected language was never saved or applied anywhere else. All screens remained hardcoded in Estonian even when English was selected.
**Root cause:** `selLang` only updated local component state. No context, storage write, or translation system was wired up to propagate the choice app-wide.
**Fix applied:** Built full translation system: `lib/i18n.ts` (all ET/EN strings), `lib/LangContext.tsx` (React context + `useTranslation` hook), wrapped root with `LangProvider`, updated every screen and lib files to be lang-aware.
**Rule going forward:** Any language/locale selection UI must immediately (a) persist to storage and (b) update a shared context every screen reads. Never hardcode display strings in screens — always use a translation function from the start.

### [2026-06-02] lib/cycleInsights.ts content left in Estonian after i18n rollout
**What happened:** After translating all UI strings, the science-based phase content in `lib/cycleInsights.ts` remained hardcoded in Estonian. The insights page showed mixed English/Estonian.
**Root cause:** Large content library files were missed during the initial translation pass — only `app/` screen files were updated.
**Fix applied:** Restructured `cycleInsights.ts` with separate ET/EN content objects and exported lang-aware functions: `getPhaseInsights(lang)`, `detectPatterns(..., lang)`, `getConfidenceLabels(lang)`, `getDisclaimer(lang)`.
**Rule going forward:** When adding i18n, audit ALL files with user-visible text — not just screen components. Always check `lib/` files too. Any file that exports display strings must be made lang-aware.

### [2026-06-02] git add with bare paths containing parentheses fails in zsh
**What happened:** `git add app/(onboarding)/cycle.tsx` failed with "no matches found" because zsh treats parentheses as glob special characters.
**Root cause:** zsh glob expansion interprets `(` and `)` in unquoted paths.
**Fix applied:** Used `git add -A` to stage all changes at once.
**Rule going forward:** When file paths contain parentheses (common with Expo's `(tabs)` and `(onboarding)` route groups), use `git add -A` or wrap paths in single quotes.

### [2026-06-02] expo-secure-store not available on web
**What happened:** `SecureStore.getItemAsync` threw "not a function" on the web platform, crashing the app at startup.
**Root cause:** `expo-secure-store` is a native-only module with no web implementation.
**Fix applied:** Gate the `secureStorage` adapter behind `Platform.OS !== 'web'`, passing `undefined` to `ConvexAuthProvider` on web (falls back to `localStorage`).
**Rule going forward:** Always wrap `expo-secure-store` calls in a `Platform.OS !== 'web'` guard. Never use SecureStore without a web fallback.

### [2026-06-02] Passkey provider incompatible with Convex edge runtime
**What happened:** Adding `@auth/core/providers/passkey` to `convexAuth({ providers })` caused a bundle error — `@simplewebauthn/server` uses Node.js APIs unavailable in Convex's edge sandbox.
**Root cause:** The Passkey provider requires a Node.js-specific library that cannot run in edge functions.
**Fix applied:** Removed Passkey from server providers; implemented client-side `navigator.credentials.get()` WebAuthn fallback for the UI.
**Rule going forward:** Before adding any `@auth/core` provider to Convex, verify its server-side deps are edge-safe. Test with `npx convex dev --once` immediately after adding.

### [2026-06-02] Microsoft Azure AD provider crashes Convex bundle
**What happened:** Both `microsoft-entra-id` and `azure-ad` providers from `@auth/core` threw `Cannot read properties of undefined (reading 'profilePhotoSize')` at Convex bundle time.
**Root cause:** A bug in the provider's init code in the installed version of `@auth/core` — assumes a config object is always passed.
**Fix applied:** Removed the provider from `convex/auth.ts`; UI button remains with a "coming soon" message.
**Rule going forward:** Always test each `@auth/core` provider with `npx convex dev --once` in isolation before committing. On failure, fall back to a graceful UI placeholder rather than blocking the whole auth setup.

### [2026-06-02] Stash + pull caused merge conflicts across all screen files
**What happened:** Convex data-layer changes were stashed, upstream i18n changes were pulled, and `git stash pop` produced conflicts in all 9 screen files.
**Root cause:** Two large parallel cross-cutting changes (data layer vs. i18n strings) edited the same lines in every file. Never stash across a pull when both branches have touched the same files.
**Fix applied:** Manually resolved every conflict keeping Convex queries + i18n strings, dropping all `storage.*`/`AsyncStorage` calls.
**Rule going forward:** Commit and push a large cross-cutting change immediately — never leave it stashed. If a conflict is inevitable, resolve it in a dedicated merge commit and communicate with collaborators first.

### [2026-06-02] git status snapshot at conversation start is stale
**What happened:** The gitStatus context injected at session start showed many modified files, but the actual working tree was clean — caused unnecessary conflict-resolution attempts.
**Root cause:** The gitStatus snapshot is captured once at session start and does not reflect subsequent commits or stash pops made before the conversation began.
**Fix applied:** Ran `git status` directly before acting on the snapshot.
**Rule going forward:** Always run `git status` live before deciding how to handle "conflicts" reported in the session-start snapshot. Never trust the snapshot as current state.

### [2026-06-02] Alert.alert does not work on Expo web
**What happened:** The "Delete all data" button appeared to do nothing on web — pressing it had no visible effect.
**Root cause:** `Alert.alert` from React Native uses a native dialog on iOS/Android but is a no-op (silently ignored) on the web platform. The confirmation never appeared, so the delete flow never ran.
**Fix applied:** Added `Platform.OS !== 'web'` guard: on native it still uses `Alert.alert`; on web it sets a `confirmDelete` state flag that renders an inline confirmation UI (title + body + Cancel/Delete buttons) directly in the component.
**Rule going forward:** Never use `Alert.alert` for user-facing confirmations without a web fallback. On web, always render confirmation UI as React state. Check every `Alert.alert` call in the codebase when adding web support.

### [2026-06-03] useNativeDriver: true crashes silently on Expo web, leaving animated panels blank
**What happened:** The email sign-up/sign-in panel animated in with `Animated.timing(..., { useNativeDriver: true })`. On web the native animation module is missing, so the animation never ran — `slideAnim` stayed at `0`, the `Animated.View` had `opacity: 0`, and the card appeared completely blank with no error in the console.
**Root cause:** `useNativeDriver: true` is only valid on native (iOS/Android). On web it silently falls back but the opacity interpolation starts at 0 and never completes, making content invisible.
**Fix applied:** Changed both `Animated.timing` calls to `useNativeDriver: false`.
**Rule going forward:** Always use `useNativeDriver: false` for any `Animated` values that drive `opacity` or `transform` on screens that must work on web. Only use `useNativeDriver: true` in native-only components.

### [2026-06-03] Validation state gated behind blur event — felt broken to users
**What happened:** Email format feedback (red border, ✕ icon, inline error) only appeared after the user blurred the field, not while typing. Users reported the validation "wasn't working".
**Root cause:** An `emailTouched` state flag required a blur event before showing any feedback — fine UX theory, but confusing when the prototype was being tested and no blur occurred.
**Fix applied:** Removed `emailTouched`. Feedback now shows live after 3+ characters are typed (avoids flashing red on the very first keypress). Border turns green with ✓ on valid input, red with ✕ and inline error on invalid.
**Rule going forward:** For prototype/app validation, prefer live feedback triggered by input length threshold (e.g. 3+ chars) over blur-gated feedback. Blur-gating hides errors during testing and feels unresponsive.

### [2026-06-03] "Delete all data" did not delete the auth account — email remained taken
**What happened:** After a user deleted all their data, attempting to register again with the same email showed "account already exists". The account was not fully removed.
**Root cause:** `clearAll` in `convex/userData.ts` only deleted app data (workouts, cycle days, profile). It never touched the Convex Auth tables: `authAccounts`, `authSessions`, `authRefreshTokens`, `authVerificationCodes`, or the `users` row.
**Fix applied:** Extended `clearAll` to also delete all auth records for the user (sessions → refresh tokens, accounts → verification codes, then sessions, accounts, and the `users` row itself) in the same mutation.
**Rule going forward:** Any "delete account" or "delete all data" flow must also delete all rows in the Convex Auth tables (`authAccounts`, `authSessions`, `authRefreshTokens`, `authVerificationCodes`) and the `users` row. App data deletion alone is never sufficient for full account removal.

### [2026-06-03] Logging period day 1 immediately shifted all cycle predictions
**What happened:** When a user logged their first period day, `last_period_date` on the profile was updated immediately, causing ovulation and fertile-window predictions to shift for the whole calendar before the period was even over.
**Root cause:** `handleSave` in `cycle.tsx` called `upsertProf({ last_period_date: date })` whenever `period === true`, regardless of whether the period phase was complete.
**Fix applied:** Moved the `last_period_date` update to the `period === false` branch. When the user logs their first no-period day after a streak, the code finds the streak start and only then updates the profile — so predictions recalculate once the period is confirmed finished.
**Rule going forward:** Never update `last_period_date` on a period=true log. Only update it when the period ends (first period=false day after a consecutive streak of period=true days). The calendar's logged dots and the profile's prediction anchor are separate concerns.

### [2026-06-03] Legend keys referenced wrong i18n keys (c.period.logged vs c.legend.logged)
**What happened:** The cycle calendar legend used `t('c.period.logged')` and `t('c.ovulation')` etc., but the actual i18n keys are under `c.legend.*`. This caused missing/undefined legend labels.
**Root cause:** Copy-paste drift between where the keys were defined and where they were used.
**Fix applied:** Updated the legend array in `cycle.tsx` to use the correct `c.legend.logged`, `c.legend.pred`, `c.legend.spotting`, `c.legend.ovulation`, `c.legend.fertile` keys.
**Rule going forward:** When adding or changing i18n keys, search for all call sites with `grep` before shipping. Never guess a key name — verify it matches what is defined in `lib/i18n.ts`.

### [2026-06-03] Theme color aliases made two markers visually identical
**What happened:** The contraceptive calendar dot was given `Colors.sky[400]` as its color, which is the same hex value (`#7A9AB0`) as `Colors.green[400]` used for ovulation — making the two markers indistinguishable.
**Root cause:** The theme defines `green` and `sky` with identical values (green was repurposed as sky blue). Relying on the semantic name without checking the actual hex led to a silent collision.
**Fix applied:** Replaced the contraceptive color with a periwinkle (`#8FA8D8`) that is clearly in the blue family but visually distinct, and added a dark gray border to further differentiate the pill shape.
**Rule going forward:** Before assigning a theme color to a new UI element, grep the existing usages of that color and check whether any current element already uses it. If two markers share a visual channel (color family), differentiate them by a second channel (shape, border, saturation).
