# SPEC-003 — Categorical-Outcome Branch (chi-square family)

**Status:** APPROVED (2026-07-30) — full Fisher's branch
**Phase:** 1
**Builds on:** [SPEC-001](SPEC-001-comparing-two-groups.md) (decision logic) and
[SPEC-002](SPEC-002-two-group-questionnaire-ui.md) (the questionnaire UI)
**Source of truth:** Field, *Discovering Statistics Using IBM SPSS Statistics*
(SAGE) — chi-square test of independence, Fisher's exact test, and McNemar's test.

## Goal

Replace the current "not covered yet" result with real recommendations when the
user is comparing two groups on a **categorical** outcome (e.g. "converted /
didn't convert"). This is the chi-square family.

## What changes

Right now, answering **No** to "is your outcome continuous?" jumps straight to a
"not covered yet" screen. After this slice, **No** continues the questionnaire
down a categorical branch.

## The categorical decision table

| sameEntities | small sample? | → Recommended test |
|---|---|---|
| different | no | **Chi-square test of independence** |
| different | yes | **Fisher's exact test** |
| same | — | **McNemar's test** |

Reasoning (all standard in Field):
- **Different groups** with categorical data → chi-square test of independence,
  which checks whether group membership is associated with the outcome.
- **Small samples** (few expected responses per category) make chi-square
  unreliable, so **Fisher's exact test** is used instead.
- **Same entities measured twice** (e.g. before/after on a yes/no outcome) →
  **McNemar's test**, the paired equivalent.

## New question (only on the categorical branch)

**`smallSample`** — asked only for *different groups + categorical*:
> "Is your dataset small — are any of your categories likely to contain only a
> handful of responses (roughly 5 or fewer)?" → *Yes / No*
- *What this means:* Chi-square needs a reasonable number of responses in each
  category to be reliable. If some categories are nearly empty, a test built for
  small samples (Fisher's exact) is safer.
- A greyed-out **"Not sure"** option is present (future: AI checks this from
  uploaded data), matching the pattern in SPEC-002.

`sameEntities` is reused from SPEC-001 — no new wording needed there.

## Assumptions / scope limits (kept honest)

- **Paired categorical is assumed binary** (a two-category outcome such as
  yes/no). McNemar's test is defined for the 2×2 case. If the paired outcome has
  more than two categories, that's out of scope for this slice — we note this in
  the result rather than silently giving the wrong test.
- Still **recommend only** — no maths is run.

## Output

Same `Recommendation` shape as SPEC-001, with new `testId`s:
`chi_square_independence`, `fishers_exact`, `mcnemar`. Each carries its rationale
and the Field citation. New plain-English "what this test does" entries are added
to the UI content map.

## Worked examples (become the new tests — Red-Green TDD)

1. `{outcomeContinuous: no, sameEntities: different, smallSample: no}`
   → `chi_square_independence`
2. `{outcomeContinuous: no, sameEntities: different, smallSample: yes}`
   → `fishers_exact`
3. `{outcomeContinuous: no, sameEntities: same}` → `mcnemar`
4. Existing continuous cases (SPEC-001) still pass unchanged.

Plus UI happy-path tests: No → Different → (small? No) shows "Chi-square test of
independence"; No → Same shows "McNemar's test".

## Definition of done

- The decision logic implements the table above; all worked examples pass.
- The questionnaire continues down the categorical branch and reaches a correct
  recommendation.
- Existing SPEC-001/002 tests still pass; build and lint clean.
- Nothing beyond this spec is added.

## Deliberately NOT in this slice

- Running any of these tests on real counts (deterministic stats engine, later).
- Paired categorical outcomes with more than two categories.
- Chi-square goodness-of-fit (one variable vs an expected distribution) — a
  different question shape; can be its own later slice.
