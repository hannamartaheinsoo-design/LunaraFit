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
