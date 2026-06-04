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
