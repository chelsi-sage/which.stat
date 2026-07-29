# SPEC-002 — Two-Group Questionnaire UI

**Status:** APPROVED with tweaks (2026-07-29)
**Phase:** 1
**Builds on:** [SPEC-001](SPEC-001-comparing-two-groups.md) (the decision logic)

## Goal

Turn the approved decision logic into something a non-statistician can actually
use: a guided, one-question-at-a-time questionnaire that ends in a clear
recommendation — with a **"what does this mean?"** explanation on every question.

## Scope

- **In scope:** the UI for the *comparing two groups* branch only, wired to
  `recommendTwoGroupTest`.
- **Out of scope:** running the maths, data upload, other branches, styling
  polish beyond clean and readable.

## The flow (one question per screen)

A simple guided wizard. One question at a time keeps non-experts from feeling
overwhelmed.

1. **Start screen** — a one-line intro and a "Start" button.
2. **Q1 — Outcome type:** "Is your outcome measured on a continuous scale (like
   time, a score, or revenue), rather than categories?" → *Yes / No*
   - If **No** → skip straight to the result ("not covered yet").
3. **Q2 — Same or different:** "Are the two sets of results from the **same**
   people/items measured twice, or from **different** people/items?"
   → *Same / Different*
4. **Q3 — Distribution:** "Is your data roughly normally distributed (a symmetric,
   bell-ish shape with no extreme outliers)?" → *Yes / No*
5. **Result screen** — shows the recommended test name, the plain-English
   rationale, and the citation. For the non-continuous case, shows the honest
   "not covered yet" message.
   - Plus a **collapsible "What this test does & what it means"** section: a
     plain-English explanation of what the recommended test actually does and how
     to read its outcome, written for a non-statistician. Collapsed by default.

### On every question
- An expandable **"What does this mean?"** control revealing the plain-language
  explanation from SPEC-001 (collapsed by default so it's there when needed,
  out of the way when not).
- Answer options are shown as **radio buttons**.
- A **"Not sure"** option is present on the data-nature questions (Q1 outcome
  type and Q3 distribution) but **greyed out / disabled** for now. Later it will
  route the user to the AI interface to help them decide; until then it is
  visibly not selectable. (Not shown on Q2, which is about study design — the
  user knows how they collected their data.)
- A **Back** button to change a previous answer.
- The result screen has a **Start over** button.

## Behaviour rules
- Selecting an answer advances to the next step (or the result).
- The recommendation shown always comes from `recommendTwoGroupTest` — the UI
  never decides the test itself (keeps the single source of truth).
- No answer is pre-selected; the user must choose.

## Look & feel
- **Font:** Open Sans, **self-hosted / bundled** with the app (not loaded from a
  web font CDN) so it still works offline — a PWA requirement.
- **Background colour:** `#D8BFD8` (thistle).
- **Text colour:** `#17191c` (near-black). This is high-contrast on the thistle
  background, so it stays accessible.
- Clean, readable, mobile-friendly (works in a narrow window — matters for a PWA).
- Answer options are **radio buttons**; plain semantic HTML so it's
  keyboard-accessible.
- No design-system or component library added for this slice.

## Testing (lighter touch, per our process)
Statistical *logic* is already hard-tested in SPEC-001. For the UI we add a small
number of **happy-path component tests**:
1. Answering Different → Yes shows "Independent-samples t-test".
2. Answering "No" on Q1 shows the "not covered yet" result.
3. The "What does this mean?" control reveals its explanation when opened.

This needs two dev dependencies: **@testing-library/react** and **jsdom** (the
standard way to test React components) — approved. A fourth test confirms a
disabled **"Not sure"** option cannot be selected.

## Content note
The per-test **"what this test does & what it means"** explanations are
plain-English content authored to trace to Field (*Discovering Statistics*). To
avoid changing the approved SPEC-001 logic, this content lives in a small UI
content map keyed by `testId` — it does not alter the deterministic function.

## Font note
Open Sans is bundled locally via the **@fontsource/open-sans** package (the
standard self-hosted-font approach for Vite) so the app keeps working offline.

## Definition of done
- The wizard runs in the browser and reaches a correct recommendation.
- The three happy-path component tests pass; the full suite stays green.
- Every question has a working "what does this mean?" explanation.
- Nothing beyond this spec is added.
