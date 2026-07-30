# SPEC-004 — Deterministic Stats Engine + Data Upload

**Status:** APPROVED (2026-07-30)
**Phase:** 1 → 3 bridge (introduces data upload early)
**Builds on:** SPEC-001/002/003 (recommendation + questionnaire)
**Source of truth:** Field, *Discovering Statistics* (SAGE) for method choice;
`scipy.stats` for the computations, cross-checked against known values.

## Goal

Let a user, from the recommendation screen, **upload their data and actually run
the recommended test**, seeing the numbers plus a plain-English verdict. The maths
is done by **Python (scipy) running in the browser via Pyodide** — the same
Python you can validate with `pytest`.

## Decisions locked in (from our Q&A)
- **Python runs in-browser via Pyodide** (real scipy, compiled to WebAssembly).
- **CSV first** (Excel later).
- **Result = numbers + plain-English verdict.**
- **Run the test as asked**; data-driven assumption checks are a later slice.

## Important nuance — privacy vs offline (please note)
- **Data privacy holds immediately:** with Pyodide the computation happens on the
  user's machine, so **uploaded data never leaves the browser**. No server.
- **Full offline is deferred:** the Pyodide runtime + scipy are large (tens of MB).
  For this slice we load them from the official Pyodide CDN on first use. Making
  the engine work with *no internet* means bundling/caching those assets — a
  **Phase 2 (PWA) task**. So: private now, fully-offline later.
- This **revises two earlier v1 non-goals** ("won't run tests", "won't interpret
  results", and "no server" is still honoured). Logged as a conscious change.

## Scope of THIS slice (kept small)
Prove the whole pipeline end-to-end with **one test: the independent-samples
t-test**. All other tests reuse the exact same pipeline and are a fast follow
(SPEC-005). So after this slice, "Upload data" works for the independent t-test;
other recommendations show an "engine coming soon" note.

## Architecture

```
CSV file ─► (TS) parse + validate ─► user maps columns ─► (TS) extract arrays
        ─► (Pyodide) call Python stats fn ─► {statistic, p, effect size}
        ─► (TS) render numbers + plain-English verdict
```

### Python engine — the thing you validate
- Lives in **`stats_engine/`** as normal Python you can read and test:
  - `stats_engine/two_group.py` — pure functions, e.g.
    `independent_t_test(group_a: list[float], group_b: list[float]) -> dict`
    returning `{ "statistic", "df", "p_value", "effect_size_d", "mean_a",
    "mean_b", "n_a", "n_b" }`.
  - `stats_engine/tests/test_two_group.py` — **pytest golden tests** with
    known-correct values (from a Field worked example and/or scipy docs), so you
    can run `pytest` and confirm correctness independently of the app.
  - `stats_engine/requirements.txt` (scipy, pytest) and a short `README.md`
    explaining `pip install -r requirements.txt && pytest`.
- **No AI anywhere near this code** — deterministic, reviewed, tested (our
  architecture rule).

### TS ↔ Python bridge
- `src/engine/pyodideRunner.ts` — lazy-loads Pyodide + scipy once, loads the
  Python source, and exposes `runTest(testId, inputs)` returning the result JSON.
- `src/engine/csv.ts` — parse CSV, list columns, detect numeric vs categorical.
- `src/engine/testInputs.ts` — maps each `testId` to the columns it needs (this
  slice: independent t-test needs one **group column** with exactly 2 categories
  and one **numeric outcome column**).

### UI
- On the result screen, **below "Start over"**, add an **"Upload data"** button.
- Clicking it reveals a panel **below the recommended test** (test name stays in
  view) with three steps:
  1. **Choose a CSV file.**
  2. **Map columns:** pick the group column and the outcome column (dropdowns
     populated from the file's headers). Plain-language labels explain each.
  3. **Run test** → shows: test statistic, degrees of freedom, p-value, effect
     size, the two group means, and a **plain-English verdict**, e.g.
     *"Group A (mean 4.2) and Group B (mean 5.1) differ significantly — there's
     less than a 5% chance this gap is down to random variation (p = 0.012). The
     effect size is medium (d = 0.5)."* If p ≥ 0.05: *"no statistically
     significant difference."* Alpha defaults to 0.05 and is stated.

## Data validation (friendly, not tracebacks)
- File must parse as CSV with a header row.
- Group column must have **exactly two** distinct non-empty values.
- Outcome column must be **numeric**; non-numeric or blank cells are reported
  ("row 12 has a blank outcome") and excluded, with a note.
- Too few rows (e.g. < 2 per group) → clear error, no run.

## Dependencies to add (asking per our rules)
- **npm:** `pyodide` (runtime bridge), `papaparse` + `@types/papaparse`
  (robust CSV parsing).
- **Python:** `scipy`, `pytest` (in `stats_engine/requirements.txt`).

## Testing
- **Python correctness → pytest golden tests** (known values). This is your
  validation path.
- **TS pure logic → Vitest**: CSV parsing, numeric detection, column-mapping
  validation, and the verdict-phrasing function (given a result object → English).
- **Pyodide integration:** verified by actually running once (a Node-side Pyodide
  smoke check and/or a manual browser run with a sample CSV). We will not run
  heavyweight Pyodide inside every unit test.

## Definition of done
- `pytest` passes the independent-t-test golden cases.
- In the browser: upload a sample CSV, map columns, run, and see correct numbers
  + a sensible plain-English verdict (cross-checked against pytest output).
- Vitest suite (CSV/validation/verdict) passes; existing suite stays green;
  build + lint clean.
- Nothing beyond the independent-t-test pipeline is built.

## Deliberately NOT in this slice
- The other six tests (SPEC-005, same pipeline).
- Excel upload; assumption checks / "Not sure" auto-answering; effect-size for
  every test; full offline asset bundling (Phase 2).
