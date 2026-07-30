# SPEC-005 — "Not sure" → Upload → Assumption Check

**Status:** APPROVED with tweaks (2026-07-30)
**Phase:** 1 / 3
**Builds on:** SPEC-002 (questionnaire), SPEC-004 (Pyodide engine + CSV upload)
**Source of truth:** Field, *Discovering Statistics* (SAGE); normality via
`scipy.stats.shapiro` (Shapiro–Wilk test).

## Goal

Turn the greyed-out **"Not sure"** buttons into real help. When a user doesn't
know the answer to a data-driven question, they can **upload their data and the
app computes the answer to that one question** (deterministically, in Python),
shows the evidence in plain English, sets the answer, and continues the flow.

## The mechanism (general pattern)

The button is labelled **"Not sure — help me figure it out"**. Clicking it →
1. an **upload-to-check** screen for *that specific question*;
2. user chooses a CSV and maps the column(s) the check needs;
3. Python computes the answer to **only that question** (not everything else);
4. the app **shows the numbers, explains what they mean, and makes a
   recommendation** ("Shapiro–Wilk p = 0.31 for each group — bigger than 0.05, so
   the data looks roughly normal; we'd suggest 'yes'");
5. **the user makes the final decision** — they pick the answer (the recommended
   one is highlighted, but they can choose otherwise) → the answer is set and the
   questionnaire continues.

We check **only the assumption the user was unsure about** — nothing more.

### Uploaded data persists across the tree
The **first** "help me figure it out" prompts an upload. Once uploaded, the data
(and its column mapping) is **held for the whole decision-tree session** — any
later check reuses it, **no re-upload**. A "use a different file" option lets the
user swap it if needed. "Start over" clears it.

## Scope of THIS slice (kept small)

Implement the mechanism and wire it for the **flagship check: normality**, on the
distribution question (Q3), for the **independent-groups** case (the one our
engine already handles). Specifically:

- The **"Not sure" on Q3** becomes active **only when** the outcome is continuous
  and the groups are *different* (independent). It uploads a CSV, maps a **group
  column** + a **numeric outcome column** (reusing SPEC-004's
  `prepareIndependentTTest` split), and runs a new Python `normality_check`.
- The check runs **Shapiro–Wilk per group** and **shows both groups' W and p**,
  explains them, and **recommends** an answer (both p ≥ 0.05 → suggest "roughly
  normal"; either p < 0.05 → suggest "not normal"). Alpha = 0.05, stated, with a
  short caveat that Shapiro–Wilk gets very sensitive with large samples.
- **The user picks the final answer** (recommended option highlighted). Their
  choice sets `assumptionsMet` and the flow proceeds to the result exactly as if
  they'd answered Q3 themselves.

### Other "Not sure" buttons — unchanged for now
Q1 (outcome type), Q3 when *paired*, and the small-sample question keep their
greyed-out "Not sure" with a brief "coming soon" — they'll reuse this same
mechanism in a later slice.

## Python engine additions
- `stats_engine/two_group.py`: `normality_check(group_a, group_b) -> dict`
  returning per-group `{ "w", "p" }` and an overall `"normal": bool` (both groups
  p ≥ 0.05). Raises `ValueError` if a group has fewer than 3 values (Shapiro's
  minimum).
- Golden pytest tests: a clearly-normal-ish dataset → `normal: true`; a clearly
  skewed dataset → `normal: false`; the < 3 values error.

## TS / UI additions
- `src/engine/pyodideRunner.ts`: `runNormalityCheck(groupA, groupB)`.
- `src/engine/verdict.ts` (or a new `checkGuidance.ts`): plain-English phrasing of
  the normality result → the guidance sentence and the resulting yes/no answer.
- A new `AssumptionCheckScreen` component (reuses the CSV file input + column
  mapping from the upload panel) shown when "Not sure" is clicked on Q3.
- `TwoGroupWizard`: a new step (e.g. `checkNormality`) with Back to Q3;
  accepting the result sets `assumptionsMet` and advances to `result`.

## Testing
- **pytest**: `normality_check` golden cases (normal / skewed / too-few).
- **Vitest**: the guidance-phrasing function (result → sentence + yes/no); the
  `AssumptionCheckScreen` wiring with the Pyodide runner **mocked** (upload → map
  → check → shows guidance → accept sets the answer).
- Existing suites stay green; build + lint clean.

## Definition of done
- On Q3 with different groups, "Not sure" uploads data, runs Shapiro–Wilk, shows
  plain-English guidance, and setting the answer continues to a correct
  recommendation.
- pytest + Vitest green; build + lint clean.
- Nothing beyond the normality/independent check is built.

## Deliberately NOT in this slice
- Outcome-type and small-sample "Not sure" checks (same mechanism, later).
- Normality for the paired case (needs difference scores).
- Auto-running checks without the user asking (we only check on "Not sure").
