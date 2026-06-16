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

### [2026-06-04] transparent Modal bottom sheet does not work reliably on Expo web
**What happened:** A `WorkoutTypeSheet` component using `transparent={true}` Modal rendered invisibly on web — the overlay div received the triggering click event immediately after mounting, closing the modal before the user could see it.
**Root cause:** On Expo web, a transparent Modal renders its overlay as a DOM div. A JS `.click()` eval (and sometimes real pointer events) can bubble through to the overlay's `onPress` handler right after the modal mounts, instantly closing it.
**Fix applied:** Switched from `transparent` Modal to `presentationStyle="pageSheet"` which renders as a proper full-screen sheet and does not have the overlay pass-through problem.
**Rule going forward:** Never use `transparent` Modal for bottom-sheet UI in this project. Use `presentationStyle="pageSheet"` instead. Verify modal interaction in the web preview before shipping.

### [2026-06-04] scrollIntoView on React Native Web elements navigates away
**What happened:** Calling `element.scrollIntoView()` on a React Native Web text element caused the whole app to navigate to a different screen.
**Root cause:** React Native Web renders nav tab buttons and screen content in the same DOM tree. `scrollIntoView` can match text inside inactive screen components or nav elements, triggering click handlers on those elements as a side effect.
**Fix applied:** Used manual `scrollTop` on the identified RN ScrollView div instead of `scrollIntoView`.
**Rule going forward:** Never use `scrollIntoView` in Expo web previews to navigate to app content. Always find the RN ScrollView container div (largest scrollHeight, overflowY scroll/auto) and set `scrollTop` directly.

### [2026-06-04] Boolean state defaulting to false created a pre-selected "No" with no neutral state
**What happened:** `period` and `spotting` state were initialised as `false`, which caused the "No" button to appear highlighted by default. Users had no way to indicate "I haven't answered yet", and the form looked already filled in on open.
**Root cause:** Using `boolean` instead of `boolean | null` for toggle state that has three meaningful states: yes, no, and unanswered.
**Fix applied:** Changed state type to `boolean | null` (null = unanswered). Buttons use `=== true` / `=== false` comparisons so null leaves both unselected. Reset after save uses `null`.
**Rule going forward:** Any yes/no toggle the user may not have answered yet must use `boolean | null` state. Never use `false` as a default when "not yet chosen" is meaningfully different from "explicitly chose No".

### [2026-06-04] `value || undefined` silently skips DB patch for falsy boolean values
**What happened:** `spotting: spotting || undefined` meant saving spotting=false passed `undefined` to the Convex mutation. The `ctx.db.patch` call received no `spotting` key, so an existing `true` in the DB was never overwritten — users couldn't change a logged "Yes" back to "No".
**Root cause:** The `|| undefined` shorthand converts any falsy value (including a deliberate `false`) to `undefined`, making it indistinguishable from "field not provided".
**Fix applied:** Changed to `spotting: spotting === true` so the field is always an explicit boolean in mutation args, ensuring patch always writes the intended value.
**Rule going forward:** Never use `value || undefined` for boolean fields that need to be patchable. Use `value === true` to coerce to an explicit boolean, or `value ?? undefined` only when `null`/`undefined` are the only cases that should be omitted.

### [2026-06-04] Used non-existent theme tokens Colors.ink and Fonts.body
**What happened:** `DatePicker.tsx` was written using `Colors.ink` and `Fonts.body`, neither of which exist in `constants/theme.ts`. TypeScript caught `Colors.ink`; `Fonts.body` silently fell back to the system font.
**Root cause:** Wrote component from memory without checking the actual theme exports.
**Fix applied:** Replaced with `Colors.dark` (the correct dark text token) and `Fonts.sans` (the correct body font).
**Rule going forward:** Before using any `Colors.*` or `Fonts.*` token in a new component, grep `constants/theme.ts` to confirm it exists. Never assume token names from convention.

### [2026-06-13] react-native-reanimated does not work on Expo web without Babel plugin; babel.config.js broke the build
**What happened:** Switched onboarding animations from `Animated` (built-in) to `react-native-reanimated` for spring physics. `useAnimatedStyle` threw "was used without a dependency array or Babel plugin". Created `babel.config.js` with `react-native-reanimated/plugin`, but `babel-preset-expo` is nested inside `expo/node_modules/` not at root — so the preset resolution failed, crashing the Metro bundler entirely (blank page, empty DOM).
**Root cause:** Two compounding issues: (1) Reanimated on web requires the Babel plugin to transform `useAnimatedStyle` calls; (2) In this project, `babel-preset-expo` is not a top-level dependency — it lives inside `expo/node_modules/babel-preset-expo`. Adding `babel.config.js` with the wrong preset name broke the build.
**Fix applied:** Deleted `babel.config.js` entirely. Rewrote all animations using React Native's built-in `Animated` API with `Animated.spring()` (for bounce) and `Animated.loop()` (for repeating blob/logo pulse). Built-in `Animated` works reliably on web with `useNativeDriver: false`.
**Rule going forward:** Do not use `react-native-reanimated` in onboarding or any screen that needs to work on Expo web preview without first confirming the Babel plugin is wired up. Built-in `Animated` with `Animated.spring()` + `Animated.loop()` covers 95% of animation needs and is always safe on web.

### [2026-06-15] Seeded workouts with only 1–3 exercises per session instead of full routines
**What happened:** Test workouts in `convex/seed.ts` each contained only a subset of the routine exercises (e.g. only Bench Press and Overhead Press for Upper Body instead of all 8 exercises). This made the Progress tab show thin data and gave false impressions of exercise coverage.
**Root cause:** Seed was written quickly with representative exercises rather than complete routines.
**Fix applied:** Rewrote all workout entries to include every exercise from the corresponding routine with realistic progressive weights and logged_sets.
**Rule going forward:** When seeding workouts for a routine, always include ALL exercises from that routine. Check the `routines` table entries to confirm the full exercise list before writing seed data.

### [2026-06-15] Calendar cells in cycle.tsx were display-only — no tap-to-select
**What happened:** The cycle tracking calendar rendered day cells as `<View>` with no `onPress`. Users could not tap a past date to pre-fill the log form, making it impossible to retroactively track cycle data without manually typing the date.
**Root cause:** Calendar was designed as a display/prediction overlay only; the form below defaulted to today with no link to the calendar.
**Fix applied:** Replaced day `<View>` with `<TouchableOpacity>`, added `handleDayPress(ds)` which sets the date state and scrolls the form into view via `scrollRef`. Added `calSelected` style (dark border ring) to show the active selection.
**Rule going forward:** Any calendar or date grid that sits above a log/entry form must have tap-to-select wired up. Always add `onPress` to calendar cells that correspond to loggable dates.

### [2026-06-15] Static StyleSheet.create used hardcoded Colors.* instead of theme tokens
**What happened:** All five tab screens used `const styles = StyleSheet.create({...})` at module level with hardcoded `Colors.cream`, `Colors.beige[50/100/400/600/800]`, `Colors.sky[50]`, `Colors.blush[50]` etc. Dark mode was broken — white card backgrounds, invisible dark text, near-invisible borders everywhere.
**Root cause:** `StyleSheet.create` is called once at module load; it can't reference `useTheme()` values. Light-mode colors were baked in permanently even though many elements had inline `{ color: T.text }` overrides for the visible text.
**Fix applied:** Converted all `const styles = StyleSheet.create({...})` to `function makeStyles(T: ThemeTokens)` returning the same object with `T.*` tokens. Each component (including sub-components like `ExercisePicker`, `SetLogger`, `IntensityDot`, `CatHeader`) now calls `const styles = makeStyles(T)` at render time.
**Rule going forward:** Never put color or background values into a top-level `StyleSheet.create`. Either (a) use `function makeStyles(T: ThemeTokens)` called inside each component, or (b) put the color inline. Static StyleSheet is fine only for layout/sizing properties that don't change with theme.

### [2026-06-15] JSX prop colors (icon color=, placeholderTextColor=) missed in theme refactor
**What happened:** After converting `StyleSheet.create` to `makeStyles`, many inline JSX prop values still used `Colors.beige[400]`, `Colors.beige[200]`, `Colors.beige[600]` etc. (icon colors, placeholder text colors). These were outside the styles object and were not caught by the refactor — they rendered as hardcoded light-mode colors in dark mode.
**Root cause:** The refactor focused on the styles block at the bottom of each file; prop values scattered throughout the JSX were missed.
**Fix applied:** Replaced all remaining `Colors.beige[*]` prop values with `T.textMuted`, `T.border`, `T.textSec`, `T.text` as appropriate.
**Rule going forward:** When doing a theme token refactor, grep for `Colors.beige` and `Colors.cream` across the *entire* file — not just the StyleSheet block. JSX prop values (`color={}`, `placeholderTextColor={}`, `backgroundColor:` in inline style objects) are equally likely to have hardcoded values.

### [2026-06-15] Invalid color indices (blush[500], coral[500], beige[700]) render as black
**What happened:** Several JSX expressions used color palette indices that don't exist in `constants/theme.ts` (e.g. `Colors.blush[500]`, `Colors.coral[500]`, `Colors.beige[700]`). These evaluate to `undefined`, which React Native silently treats as the default text/border color — black — making them invisible on dark backgrounds.
**Root cause:** Colors were written from memory or with intermediate shades assumed to exist without checking the palette definition.
**Fix applied:** Replaced all invalid indices with the nearest valid shade (`[400]` for the 500s, `[600]` for 700s etc.).
**Rule going forward:** Before using any `Colors.palette[N]`, check `constants/theme.ts` to confirm that index exists. The valid set for most palettes is `{ 50, 100, 200, 400, 600, 800 }`. Never assume intermediate steps.

### [2026-06-15] Home chart showed workout count instead of meaningful training volume
**What happened:** The "Nädala aktiivsus" area chart plotted workout count per day (0 or 1), producing a nearly flat line with no useful information since most users log at most one workout per day.
**Root cause:** Initial implementation chose the simplest metric (count) without considering whether it would produce a readable chart shape.
**Fix applied:** Changed chart data to sum total `sets` across all exercises in all workouts per day so bar height is proportional to training volume.
**Rule going forward:** Home screen charts must show a metric that varies meaningfully day-to-day. Total sets, volume (kg×reps), or duration are good candidates. Workout count is only useful as a number, not as a chart visual.

### [2026-06-15] Progression sparkline bars normalised to 0-max instead of min-max
**What happened:** Sparkline bars normalised bar height as `(weight / max) * barHeight`. When weights only varied by 10–20% (e.g. 55→67.5 kg), all bars appeared nearly the same height and the progression was invisible.
**Root cause:** 0-based normalisation compresses small relative gains into a tiny visual range.
**Fix applied:** Switched to min-max normalisation: `4 + ((weight - min) / (max - min)) * 14` so the lowest session always renders at minimum height and the highest at maximum, exaggerating the visible delta.
**Rule going forward:** Always use min-max normalisation for sparklines showing incremental progression. 0-max is only appropriate when 0 is a meaningful baseline (e.g. session count, not weight).

### [2026-06-15] Onboarding CTA wrapped in delayed Animated.View stayed unresponsive on web
**What happened:** The "Continue →" button on the name screen was wrapped in `Animated.View` with `useSpringIn(460)` — starting at `opacity: 0` and `translateY: 32`. On web, if the animation didn't complete (timing issues, fast navigation), the button remained invisible or off-screen and appeared broken.
**Root cause:** Footer CTAs should never be hidden by animation delays. Animating content above the fold is fine, but a button the user needs to progress must always be visible and tappable.
**Fix applied:** Replaced `Animated.View` footer wrapper with a plain `View`. Also added a loading spinner and inline error display instead of silently swallowing the mutation error.
**Rule going forward:** Never wrap primary CTA buttons in opacity/transform animations with a delay. Animate headings and content cards, not the action button. The button must be visible from the moment the screen mounts.

### [2026-06-15] Post-auth navigation relied solely on NavigationController and silently broke with ob_preview bypass
**What happened:** After signing in on the new signup screen, nothing happened — the user stayed on the signup screen and the app appeared broken. The `signIn()` call succeeded but no navigation occurred.
**Root cause:** The signup screen delegated 100% of post-auth navigation to `NavigationController` in `_layout.tsx`. That controller has a dev bypass (`ob_preview` sessionStorage flag) that skips all redirects, which was active from testing. Even without the bypass, relying on a global controller for screen-level navigation is fragile — it can miss redirects if state transitions arrive in an unexpected order.
**Fix applied:** Added a `useEffect` directly in `SignupScreen` watching `isReady + isAuthenticated + isOnboarded`. When the user is authenticated: if onboarded → `router.replace('/(tabs)/home')`, else → `router.replace('/(onboarding)/name')`. This fires regardless of NavigationController.
**Rule going forward:** Any screen that triggers auth (sign-in, sign-up, OAuth) must have its own post-auth `useEffect` redirect. Do not rely solely on a global NavigationController for screen-level navigation after auth. The global controller handles cold-start routing; individual auth screens handle their own post-success redirect.

### [2026-06-15] Editing a file with unstaged local modifications destroyed the local changes
**What happened:** `home.tsx` had local (uncommitted) modifications implementing a CycleRing design. When the Edit tool was used to remove a small section (gradient + blobs), the resulting file matched HEAD (the phaseBanner design) — the CycleRing code was silently lost. The file was not recoverable from the working tree.
**Root cause:** The Edit tool applies an exact-string replacement to the file on disk. If the surrounding file content drifts between the Read and the Edit (or if the replacement collapses enough lines), the result can inadvertently match a different baseline version. Unstaged changes have no safety net.
**Fix applied:** Recovered the CycleRing version from `git stash@{0}` which happened to contain it. Rewrote the file from the stash snapshot.
**Rule going forward:** Before making any edit to a file that has unstaged local modifications, commit or stash those changes first. Always run `git diff HEAD -- <file>` before editing to understand what is at risk. Never assume an Edit is atomic with respect to local-only content.

### [2026-06-16] RichText inline bold causes spacing gaps in paragraph text on RN web
**What happened:** Using `<RichText>` for the overview paragraph in the Insights Body tab rendered bold spans with visible extra whitespace between them and the surrounding text, e.g. "**Progesterone rises**   and energy may shift." — a noticeable gap appeared after each bold span.
**Root cause:** React Native Web renders inline `<Text>` children inside a parent `<Text>` with an implicit space. When bold text is split into a nested `<Text>` component, the inline-block rendering in HTML adds spacing that doesn't match native RN.
**Fix applied:** Stripped `**` markers with `.replace(/\*\*/g, '')` and rendered the overview as a plain `<Text>` instead of `<RichText>`.
**Rule going forward:** Use `<RichText>` only for short sentences or bullet points where bold emphasis is needed on a keyword. Never use it for full multi-sentence paragraphs — strip the markers and render plain `<Text>` instead.

### [2026-06-16] `borderWidth: 1` + `borderLeftWidth: 3` override stacks visually as a double border on RN web
**What happened:** Training tip cards used `borderWidth: 1` in `StyleSheet.create` and then `borderLeftWidth: 3` in an inline style override. On RN web this rendered as a visible double line on the left edge — the 1px card border plus the 3px accent strip appeared stacked rather than replaced.
**Root cause:** RN web CSS merge may not cleanly override `borderWidth` shorthand with a single-side `borderLeftWidth`. Both rules end up applied simultaneously.
**Fix applied:** Removed `borderWidth` from the base StyleSheet entry and set all four border sides explicitly in the inline style object: `borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth` each with their own `*Color`.
**Rule going forward:** When using a coloured left accent strip (3px) on a card that also needs a thin border (1px) on other sides, always set all four borders explicitly. Never mix `borderWidth` shorthand with a single-side override.

### [2026-06-16] Preview screenshots taken at desktop viewport instead of phone size
**What happened:** All preview screenshots during UI review sessions rendered at a wide desktop viewport (~655px wide), making layout issues at phone width invisible and giving a false impression of how the app looks on device.
**Root cause:** `preview_start` defaults to desktop viewport. `preview_resize` was never called before `preview_screenshot`.
**Fix applied:** Added `viewport: { width: 375, height: 812 }` to `.claude/launch.json` and added a mandatory rule to AGENTS.md. Memory saved. `preview_resize(preset="mobile")` must be called before every screenshot.
**Rule going forward:** Always call `preview_resize(preset="mobile")` before any `preview_screenshot`. The viewport resets on reload — resize every time. This is a phone app; desktop screenshots are meaningless.

### [2026-06-16] Wrong phase key "menstrual" stored in seed data instead of "menstruation"
**What happened:** `convex/seed.ts` stored `phase: "menstrual"` for several workouts. The i18n lookup key is `phase.lbl.menstruation`, so `phase.lbl.menstrual` resolved to `undefined` and the raw key string was rendered on screen.
**Root cause:** Typed the phase key from memory without checking the `CyclePhase` type (`'menstruation' | 'follicular' | 'ovulation' | 'luteal' | 'unknown'`).
**Fix applied:** Fixed seed data to use `"menstruation"`. Added `phase.lbl.menstrual` fallback key to i18n for any already-stored records.
**Rule going forward:** Phase keys must match the `CyclePhase` union exactly. Always check `types/index.ts` before writing phase strings in seed data or anywhere else.

### [2026-06-16] Duplicate + icon on "Add exercise" button
**What happened:** The "Add exercise" button showed two `+` signs — one from `<Icon name="plus">` in JSX and one from the i18n string `'+ Lisa harjutus'` / `'+ Add exercise'`.
**Root cause:** The i18n string was written with a leading `+` before the Icon component was added to the button.
**Fix applied:** Removed the leading `+` from both i18n strings.
**Rule going forward:** When a button uses `<Icon name="plus">` to render a plus, never include `+` in the label string. The icon IS the plus.

### [2026-06-16] `borderTopWidth: 1` on a `<Text>` component renders as a double line on RN web
**What happened:** The expanded detail section in Insights training cards used `tipDetail` style with `borderTopWidth: 1` applied to a `<Text>` (via `RichText`). On RN web this rendered as two visible lines instead of one divider.
**Root cause:** RN web renders `<Text>` as an inline `<span>`. A border on an inline element can stack or double-render unexpectedly.
**Fix applied:** Replaced the border on `<Text>` with a dedicated `<View style={styles.tipDivider}>` with `borderTopWidth: 1` above the `<RichText>`.
**Rule going forward:** Never put `borderTopWidth`/`borderBottomWidth` on a `<Text>` component for use as a visual divider. Always use a dedicated `<View>` with height 0 and the border applied to it.

### [2026-06-16] Fixed tab bar hides bottom content on all screens
**What happened:** After setting `position: 'fixed'` on the web tab bar, the last items on every scroll screen were hidden under the bar. Only the screen that already had a large `paddingBottom` (insights, with 100px) was partially safe; all others (home: 24px, workouts: 8px, cycle/profile: none) had content cut off.
**Root cause:** A fixed-position element is removed from document flow. Scroll containers don't know it exists and stop exactly at the viewport bottom, letting the bar overlap the final content.
**Fix applied:** Set `paddingBottom: 130` (≥ tab bar height of 130px) on `contentContainerStyle` for every `ScrollView` and `FlatList` across all five tab screens.
**Rule going forward:** Whenever the tab bar height changes, grep for every `contentContainerStyle` in `app/(tabs)/` and ensure `paddingBottom` matches or exceeds the bar's `height`. One screen left without it will look broken.

### [2026-06-16] Navigating to a non-existent expo-router route crashes the navigator on native
**What happened:** `home.tsx` had a quick-action chip that called `router.push('/(tabs)/progress')`. No `progress.tsx` file exists in `app/(tabs)/`. On native (Expo Go), navigating to an unregistered route throws an unhandled exception that can freeze the entire navigator — the user can no longer switch tabs or scroll.
**Root cause:** expo-router on web silently shows a 404 page, masking the error during development. The crash only surfaces on native.
**Fix applied:** Changed the broken route to `/(tabs)/workouts` which already contains the progress sub-tab ("Areng").
**Rule going forward:** Every `router.push('/(tabs)/X')` call must have a corresponding `app/(tabs)/X.tsx` file. Verify route existence before linking. Never infer that a route works from web-only testing.

### [2026-06-16] Using an undefined icon name renders a visible fallback glyph
**What happened:** `home.tsx` used `<Icon name="chart" />` but the Icon component only defines: `home`, `barbell`, `moon`, `spark`, `person`. An undefined name rendered as the letter "O" on screen.
**Root cause:** Icon names were written from memory without checking the Icon component's valid cases.
**Fix applied:** Changed `"chart"` to `"barbell"` which is the closest match for workout progress.
**Rule going forward:** Before using any icon name, grep `components/ui/Icon.tsx` to confirm the name is in the `case` list. Never guess icon names.

### [2026-06-16] Circle gradient clip edge visible when gradient stops don't reach transparent before arc boundary
**What happened:** A LinearGradient inside a circular View (borderRadius = D/2) faded from transparent at position 0 to white at position 0.14. The circle's arc crossed the screen at ~11% from the top/bottom of the oval, so the gradient was already semi-opaque at the clip boundary — creating a visible hard arc line.
**Root cause:** Gradient stop positions were chosen without calculating where the circle's arc actually intersects the screen edges. The clip line is only invisible when the gradient is fully transparent at that intersection point.
**Fix applied:** Moved the outer halo gradient to a full-screen layer behind the solid white oval, aligning transparent→white stops to the calculated arc position (`ARC_TOP = (OY + D/2 - sqrt((D/2)² - (W/2)²)) / H`).
**Rule going forward:** When fading a circular clip shape into a background, always calculate the arc's screen intersection coordinates and ensure the gradient reaches fully transparent before that point. Use a full-screen overlay gradient behind a solid shape rather than trying to fade inside the clipped shape.

### [2026-06-16] `router.back()` silently fails on web when there is no navigation history
**What happened:** A back button on the name screen used `router.back()`. When the screen was the first in the stack (e.g. direct URL load or post-auth redirect), `back()` did nothing — pressing the button had no visible effect.
**Root cause:** `router.back()` requires browser history to exist. On web, if the user arrived via `router.replace()` or a direct URL, there is no history entry to go back to.
**Fix applied:** Replaced `router.back()` with `router.replace('/(onboarding)/signup')` to navigate explicitly regardless of history state.
**Rule going forward:** Never use `router.back()` in onboarding screens. Always use `router.replace('<explicit-previous-route>')` so navigation works whether or not history exists.

### [2026-06-16] Signup screen's own useEffect bounced users back to name when navigating back
**What happened:** The name screen's back button navigated to signup via `router.replace`. But signup mounted its own `useEffect` watching `isAuthenticated`, which immediately fired (user was still authenticated + not onboarded) and called `router.replace('/(onboarding)/name')` — sending the user straight back.
**Root cause:** The post-auth redirect useEffect in signup ran unconditionally on mount, treating any authenticated user as having just signed in.
**Fix applied:** Added a `didSignIn` ref (default `false`) to signup. The redirect useEffect only fires when `didSignIn.current === true`. The ref is set to `true` just before calling `signIn()`, and reset to `false` on sign-in error.
**Rule going forward:** Post-auth redirect useEffects in auth screens must be gated on a ref that tracks whether the user actively signed in during this screen mount. Never redirect based solely on `isAuthenticated` state — the screen may be revisited by navigating back while the user is already authenticated.

### [2026-06-16] Nested horizontal ScrollView inside vertical ScrollView blocks native scroll
**What happened:** A horizontal `ScrollView` (chip row) nested inside the vertical home screen `ScrollView` intercepted touch events on native. When a user tried to scroll down in the chip row area, the horizontal scroller consumed the gesture and the vertical scroll did not trigger.
**Root cause:** React Native's gesture system gives priority to the inner ScrollView when both horizontal and vertical gestures could apply. On web this is invisible since mouse scroll events propagate differently.
**Fix applied:** Replaced the horizontal `ScrollView` chip row with a plain `View` with `flexWrap: 'wrap'`. Only 4 chips are rendered so no scrolling is needed — they wrap to a second line on small screens.
**Rule going forward:** Never nest a horizontal ScrollView inside a vertical ScrollView for a small fixed set of items. Use `flexWrap: 'wrap'` instead. If infinite scrolling is genuinely required, use `nestedScrollEnabled` and test on native explicitly.
