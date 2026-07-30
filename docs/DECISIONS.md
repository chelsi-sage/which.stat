# Decision Log

A running record of every meaningful decision — what we decided, why, and what
we considered instead. Newest entries at the top. Keep entries short.

**Format:** `### YYYY-MM-DD — <decision>` then Why / Alternatives considered.

---

### 2026-07-30 — SPEC-005 built: "Not sure" → upload → assumption check

- The greyed-out **"Not sure"** became **"Not sure — help me figure it out"** and
  is now **active on the distribution question for different groups**. It uploads
  data and runs **Shapiro-Wilk per group** to help answer the normality question.
- **Chelsi's tweaks:** uploaded data **persists across the whole tree** (lifted to
  wizard-level `dataset`, shared via a new `DatasetPicker` used by both the check
  screen and the result-screen run — no re-upload); the check **shows the numbers,
  explains them, recommends an answer, but the user makes the final call**.
- Scope kept small: normality/different-groups only. Q1, paired normality, and
  small-sample "Not sure" stay "coming soon" (same mechanism, later).
- Verified: 10 pytest (incl. normality golden cases) + 30 Vitest; Node Pyodide
  smoke confirmed the normality path (skewed group p≈1e-7 → not normal); build +
  lint clean.

---

### 2026-07-30 — SPEC-004 built: deterministic stats engine + data upload

- **Python stats engine in `stats_engine/`** (scipy), run in the browser via
  **Pyodide**. First test wired end-to-end: **independent-samples t-test**.
- **Chelsi's choices:** Pyodide (not a server), CSV first, numbers + plain-English
  verdict, run-as-asked (assumption checks deferred).
- **Privacy vs offline nuance:** computation is local so **uploaded data never
  leaves the browser** (privacy holds now); Pyodide/scipy assets load from CDN on
  first use, so *full* offline is deferred to the Phase 2 PWA work.
- **Result screen:** "Upload data" button below "Start over" reveals a
  file → column-mapping → run → result panel below the recommendation.
- **Revised two v1 non-goals** (now runs tests + interprets results) — see
  PRODUCT_VISION.md.
- **Validation path:** `stats_engine` has pytest golden tests with hand-computed
  expected values; TS pure logic has Vitest tests; the Pyodide pipeline was
  proven with a Node smoke run (t = −1.2247, p = 0.288, d = −1.0 — matching by
  hand). 26 Vitest + 6 pytest passing; build + lint clean.
- **New deps:** npm pyodide, papaparse (+types); Python scipy, pytest.

---

### 2026-07-30 — SPEC-003 built: categorical-outcome (chi-square) branch

- The "No, my outcome isn't continuous" answer now continues into a categorical
  branch instead of dead-ending at "not covered yet".
- **Full Fisher's branch** (Chelsi's choice): different groups → chi-square test
  of independence, or Fisher's exact test when the sample is small (new
  "small sample?" question); same entities → McNemar's test.
- **McNemar assumes a two-category outcome** — noted in its rationale/explanation
  rather than silently mis-recommending for 3+ category paired outcomes.
- Built spec-first with Red-Green TDD. Suite now 15 tests; build + lint clean.
- Still recommend-only — no maths run. Source: Field, *Discovering Statistics*.

---

### 2026-07-29 — SPEC-002 built: two-group questionnaire UI

- **Guided wizard** (one question per screen) wired to `recommendTwoGroupTest`;
  the UI never decides the test itself. Built spec-first with Red-Green TDD.
- **Chelsi's tweaks applied:** collapsible "what this test does & what it means"
  on the result; a greyed-out "Not sure" option on the two data-nature questions
  (will route to AI later); Open Sans, background `#D8BFD8`, text `#17191c`;
  radio-button options.
- **Open Sans self-hosted** via `@fontsource/open-sans` so it works offline
  (a CDN link would break the offline promise).
- Added dev deps @testing-library/react + jsdom (approved) for 4 happy-path UI
  tests. Full suite: 11 tests passing; build + lint clean; dev server boots.

---

### 2026-07-29 — Phase 1 kickoff: first branch, source, toolchain

- **First decision branch:** comparing two groups (t-test family) — most common
  for PM A/B testing, small scope, easy to cite.
- **Source of truth:** Field, *Discovering Statistics Using IBM SPSS Statistics*
  (SAGE). Every recommendation traces to it.
- **Toolchain:** scaffolded React 19 + TypeScript 6 + Vite 8 + Vitest 4 (+ oxlint).
- **SPEC-001 approved & built** ([specs/SPEC-001-comparing-two-groups.md](specs/SPEC-001-comparing-two-groups.md)):
  a pure `recommendTwoGroupTest` function that recommends independent/paired
  t-test or Mann–Whitney/Wilcoxon, and honestly returns "not covered yet" for
  non-continuous outcomes. Built spec-first with Red-Green TDD; 5 worked examples
  pass. This slice only *recommends* a test — it does not run the maths.

---

### 2026-07-29 — Offline/online split

The **guided decision tree works fully offline**; the **AI features (data upload
+ data-typing) work online only**.

- *Why:* the decision tree is the core value and needs no network, so it honours
  the PWA's offline promise. AI data-typing must reach a model, so it can't work
  offline. Offline, the app flags AI features as unavailable but the tree still
  works.
- *Alternatives:* require connectivity for everything (breaks offline promise);
  try to run AI on-device (out of scope / too heavy for now).

---

### 2026-07-29 — Foundation decisions (project kickoff)

The following were all decided in the kickoff conversation.

**Chelsi's role: guide, don't code.**
- *Why:* Chelsi is a PM; she makes product/design decisions and reviews in plain
  English, Claude writes and explains all code.
- *Alternatives:* learn-as-we-go; hands-on partner. Chosen: guide-only for now.

**Platform: Progressive Web App.**
- *Why:* installable, works offline, accessible via a link — best fit for PMs and
  researchers.
- *Alternatives:* plain web app, desktop, mobile, CLI.

**Core approach: decision-tree first, with plain-language help at every node.**
- *Why:* transparent, trustworthy, needs no AI to work, and works offline. Each
  node explains itself in non-data-person terms.
- *Alternatives:* lead with plain-English/AI input; build both at once. Deferred
  AI input to later.

**Data upload + AI data-typing: planned for Phase 3.**
- *Why:* lets users who don't know their data type get help classifying it, which
  answers the hardest decision-tree questions.
- *Note:* AI only classifies/selects — see the architecture decision below.

**Tech stack: React + TypeScript + Vite.**
- *Why:* industry standard, long-lived, strong PWA support; TypeScript catches
  errors early (supports the "prove it" rule).
- *Alternatives:* plain HTML/CSS/JS (too unwieldy as features grow); Next.js
  (heavier than needed for Phase 1).

**Hosting: GitHub + run locally for now.**
- *Why:* all code versioned on GitHub; no need for a public URL yet.
- *Alternatives:* auto-deploy to a live URL (deferred until worth sharing).

**Testing: test the statistical logic hard, lighter on UI.**
- *Why:* correctness of recommendations is the whole point; UI can be more fluid.
- *Alternatives:* full coverage everywhere (slower); move fast/test later (risky
  for a stats tool).

**Git cadence: commit each small working step.**
- *Why:* easy to undo, pairs with "small visible steps." Ask before irreversible
  moves (e.g. first public push).
- *Alternatives:* milestone commits; commit only on request.

**Ground rules:** explain in plain English; ask before big moves; small visible
steps; keep this decision log; **be antagonistic — prove claims with evidence,
don't just assert them.**

**Architecture: deterministic stats engine; AI limited to selection via tool
calling; AI never writes or runs app code.**
- *Why:* eliminates hallucinated results, keeps statistics reproducible and
  auditable. See [ARCHITECTURE.md](ARCHITECTURE.md).

**Methodology: spec-driven development + Red-Green TDD; build no more than the
spec.**
- *Why:* every change is provably correct, does what Chelsi needs, and no more.
  See [PROCESS.md](PROCESS.md).
