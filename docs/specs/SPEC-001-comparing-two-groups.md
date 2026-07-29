# SPEC-001 — Comparing Two Groups (decision logic)

**Status:** APPROVED (2026-07-29)
**Phase:** 1
**Source of truth:** Field, A. *Discovering Statistics Using IBM SPSS Statistics*
(SAGE) — framework for choosing tests that compare two means, and the
corresponding non-parametric alternatives.

## Goal

Given a user who wants to **compare two groups**, deterministically recommend the
correct statistical test. This spec covers **only the decision logic** (a pure
function). The questionnaire UI is a later slice.

## Scope

- **In scope:** comparing two groups on a **continuous** outcome (e.g. time,
  score, revenue).
- **Out of scope (this slice):** categorical outcomes (e.g. converted / didn't) —
  that's a chi-square branch we'll add later. If the user says their outcome
  isn't continuous, we return an honest "not covered yet" result rather than
  guessing.

## The questions (decision inputs)

1. **`outcomeContinuous`** — "Is your outcome measured on a continuous scale
   (like time, a score, or revenue), rather than categories?"
   - *What this means:* A continuous measure can take many in-between values
     (e.g. 4.7 seconds). A category is a label (e.g. "clicked / didn't click").
2. **`sameEntities`** — "Are the two sets of results from the **same** people or
   items measured twice, or from **different** people or items?"
   - *What this means:* "Same" = you measured one group before and after, or under
     two conditions (paired). "Different" = two separate groups (independent).
3. **`assumptionsMet`** — "Is your data roughly normally distributed (a symmetric,
   bell-ish shape with no extreme outliers)?"
   - *What this means:* Some tests assume a bell-shaped spread. If your data is
     skewed or has big outliers, a different ("non-parametric") test is safer.

Each answer is a simple choice; `assumptionsMet` and `sameEntities` are yes/no
style. Every question carries the plain-language "what this means" text above.

## The decision table

| outcomeContinuous | sameEntities | assumptionsMet | → Recommended test |
|---|---|---|---|
| no | — | — | **Not covered yet** (categorical outcome → future chi-square branch) |
| yes | different | yes | **Independent-samples t-test** |
| yes | different | no | **Mann–Whitney U test** (non-parametric) |
| yes | same | yes | **Paired-samples t-test** |
| yes | same | no | **Wilcoxon signed-rank test** (non-parametric) |

*These four mappings are the standard framework in Field for comparing two means
and their non-parametric equivalents.*

## Output

The function returns a **recommendation object**:

- `testId` — a stable code (e.g. `independent_t_test`)
- `testName` — human name (e.g. "Independent-samples t-test")
- `rationale` — one plain-English sentence on why this test fits the answers
- `citation` — the source (Field, *Discovering Statistics*)
- `covered` — `true`, or `false` for the "not covered yet" case

## Worked examples (become the first tests — Red-Green TDD)

1. `{outcomeContinuous: yes, sameEntities: different, assumptionsMet: yes}`
   → `independent_t_test`
2. `{outcomeContinuous: yes, sameEntities: different, assumptionsMet: no}`
   → `mann_whitney_u`
3. `{outcomeContinuous: yes, sameEntities: same, assumptionsMet: yes}`
   → `paired_t_test`
4. `{outcomeContinuous: yes, sameEntities: same, assumptionsMet: no}`
   → `wilcoxon_signed_rank`
5. `{outcomeContinuous: no, ...}`
   → `covered: false` (not covered yet)

## Definition of done

- A pure function implements the table above.
- All five worked examples pass as automated tests.
- No extra tests or branches beyond this spec.
- Each recommendation carries its rationale and citation.

## Deliberately NOT in this slice

- **Running** any of these tests on real numbers (that's the deterministic stats
  engine, a separate later spec). This slice only *recommends which test*.
- The questionnaire UI.
- The categorical-outcome (chi-square) branch.
