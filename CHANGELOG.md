# CHANGELOG.md

All notable changes to **Spargn Ayiti** are documented in this file.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning loosely follows [Semantic Versioning](https://semver.org/).

---

## [0.1.0] — 2026-06-24 — Sprint 0 Stabilization

Sprint 0 is a pure stabilization pass. No UI changes, no new features, no
architectural shifts. Seven defects from the Phase 1 architecture review are
closed. The build now boots correctly on Railway and AI calls (L2/L3) no
longer return HTTP 500 from Gemini.

### Fixed

- **B1 (Blocker) — Invalid Gemini model identifier.**
  `server.ts` was calling `model: "gemini-3.5-flash"`, an identifier that
  never existed in Google's API. Every Level 2 (shared key) and Level 3
  (custom user key) AI call returned HTTP 500, breaking all chatbot
  intelligence for fresh installs. Switched to `gemini-2.0-flash`, the
  current Google AI Studio smart text model.

- **B2 (Blocker) — Railway port hardcoding.**
  `server.ts` bound to `const PORT = 3000;` unconditionally. Railway injects
  `PORT` as an environment variable; the app would fail to bind on deploy.
  Now reads `process.env.PORT` with a `3000` fallback for local dev.
  `0.0.0.0` host binding preserved.

- **B3 (High) — Currency ignored when summing contributions.**
  Six sites in `src/components/PyasChatbot.tsx` summed `c.amount` across
  contributions without converting non-HTG amounts. A user with a USD goal
  and an EUR goal would see a numerically meaningless total. All six sites
  now call `calculateTotalSaved(list, goal.currency, rates)` from
  `src/lib/currency.ts`. Where a grand total in HTG was required (economize
  intent, transaction history), the per-goal total is converted to HTG
  before summing.

- **B4 (High) — Pyas local score diverged from Dashboard.**
  The chatbot computed its own score using a different formula
  (`pointsGoals + pointsContribs + pointsEmergency + pointsSol`, weighted
  20/30/30/20) than `FinancialEngine.calculateFinancialHealthScore`. Users
  saw two conflicting numbers when asking Pyas vs. looking at the Dashboard
  widget. Pyas now reads `financialHealthScore` from `useAppContext()`,
  guaranteeing a single source of truth.

- **B7 (Low) — PIN badge logic inverted at construction.**
  `src/pages/Dashboard.tsx` constructed the badge with
  `unlocked: !isPinLockEnabled` and then patched it on line 312 with
  `badges[4].unlocked = !!isPinLockEnabled;`. The post-construction patch
  is gone; the badge now has the correct value at construction time.
  End-user behavior unchanged.

- **B8 (Low) — `availableFunds` initial state inconsistency.**
  `AppContext.tsx` seeded `availableFunds` to `10500` (a demo value) while
  `clearAllData()` reset it to `0`. A first-run user saw `10500 HTG` of
  phantom funds; a user who cleared their data saw `0`. Aligned on `0` for
  both. Returning users are unaffected — the `localStorage` load effect
  overwrites the seed on mount.

- **B9 (Low) — Stale comment about non-existent model.**
  The comment in `server.ts` referencing `gemini-3.5-flash` was factually
  wrong. Updated to correctly reference `gemini-2.0-flash` and explain why
  the previous identifier was invalid.

### Changed

- **Pyas chatbot — score breakdown section removed.**
  Because the chatbot no longer computes a local score, the per-component
  breakdown sections ("Scoring Breakdown" / "Barème de calcul" /
  "Kijan nou rasanble pwen yo") have been removed from chatbot replies.
  Showing a fabricated breakdown would re-introduce the divergence B4 fixed.

- **Pyas chatbot — "increase deposit frequency" advice trigger narrowed.**
  The advice bullet previously fired when `pointsContribs < 12`, which
  corresponded to `contribCount ≤ 1`. It now fires only when
  `contribCount === 0`. A user with exactly one contribution no longer sees
  this advice bullet (they may still see other advice). Maintainers may
  restore the original threshold by changing the check to
  `contribCount < 2` if strict preservation is desired.

### Added

- **`src/config/server.ts` (proposed, drop-in).**
  Centralized server-side configuration. Wraps `process.env.PORT`,
  `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TEMPERATURE` in typed
  accessors. Closes the "hardcoded Gemini model in business logic"
  hard-constraint violation. Integration steps in `SPRINT0_PATCH.md`.

- **`src/config/client.ts` (proposed, drop-in).**
  Centralized client-side configuration. Reads `import.meta.env` via Vite's
  `ImportMetaEnv` declaration merging — no `as any` casts. Establishes the
  canonical pattern for future `VITE_`-prefixed env vars. Integration steps
  in `SPRINT0_PATCH.md`.

### Security

No security changes in Sprint 0. The Phase 1 security findings
(plaintext PIN, no rate limit, no input validation, PII forwarded to
Gemini) remain open and are scheduled for Sprint 5.

### Known Issues (carried forward)

- **B5 / B6 (Critical) — Backup/restore data loss.**
  `exportDataJSON()` omits envelopes, profiles, incomeTransactions,
  visionItems, subscriptions, Sòl, and emergency fund. `importData()`
  silently drops the same slices. **Users lose all v1.3+ data on
  backup/restore.** Scheduled for Sprint 1.
- **Currency conversion duplicated.**
  `currency.ts::convert` and `FinancialEngine.convertToHTG/From` implement
  the same math. Sprint 0's B3 fix also re-implements the HTG conversion
  inline at two sites in `PyasChatbot.tsx`. Scheduled for Sprint 4
  consolidation.
- **Sòl + Kòb Sekou state architecture.**
  These two state slices live in `localStorage` directly (managed by
  Dashboard's own effects) instead of flowing through `AppContext`.
  PyasChatbot reads them via raw `localStorage.getItem()`, causing stale
  reads. Scheduled for Sprint 2.

### Verification

- TypeScript compilation: **BLOCKED** — codebase not accessible on review
  agent's filesystem.
- Production build: **BLOCKED** — same reason.
- Railway compatibility: **VERIFIED** via static diff review.

---

## [0.0.x] — Pre-0.1.0

Initial development sprints that produced the v1.5 feature set:
Goals, Envelopes (v1.3), Vision / Carnet d'Avenir (v1.4), Subscriptions
(v1.5), Sòl, Kòb Sekou, Pyas chatbot (3-tier cost model), PIN lock,
multi-currency support (HTG base), FR/HT/EN trilingual UI.

No changelog kept for these sprints. See `analyse.txt` §1.2 for the
folder structure and §1.6 for the domain module map.
