# Product Vision — which.stat

## The problem

Product managers and researchers regularly collect data but get stuck at a
deceptively hard question: **"Which statistical test should I use?"** Getting it
wrong produces conclusions that look rigorous but aren't. Existing references
(textbooks, flowcharts, forum answers) assume statistical vocabulary the user may
not have, so the barrier is as much about *language* as about *maths*.

## Target users

- **Product managers** running experiments (A/B tests, surveys, funnel analyses)
  who need a defensible test, not a statistics degree.
- **Researchers** who want a quick, trustworthy sanity check on their test choice.

Neither group should need to speak "statistician" to get an answer.

## What we're building

A Progressive Web App built on two pillars:

### Pillar 1 — Guided decision tree
A step-by-step set of questions about the user's data and question (e.g. how many
groups, what type of outcome, paired or not) that narrows down to a recommended
test. **Every node has a "what does this mean?" explanation** written for a
non-data person, with an example. The user is never blocked by a term they don't
know.

### Pillar 2 — Data upload + AI data-typing (later)
The user can upload their data and AI helps them figure out **what type of data**
each column is (e.g. categorical, continuous, ordinal). This answers the hardest
decision-tree questions for them. Crucially, AI only *classifies and selects* —
the statistics themselves are always run by pre-approved deterministic code
(see [ARCHITECTURE.md](ARCHITECTURE.md)).

### Offline / online split
The **guided decision tree works fully offline** — that's the PWA's core promise.
The **AI features (data upload + data-typing) work online only**, since they need
to reach a model. Offline, the app clearly flags AI features as unavailable while
the decision tree keeps working.

## Non-goals (v1)

To keep scope honest, v1 will **not**:

- Run every statistical test in existence — we start with a small, well-tested set.
- Replace a statistician for complex or high-stakes analyses.
- Provide a public hosted URL initially (runs locally first).

**Revised 2026-07-30 (SPEC-004):** two earlier non-goals were consciously
dropped. v1 now *does* **run the recommended test** on uploaded data and give a
**plain-English interpretation** of the result — done by deterministic Python
(scipy) in the browser via Pyodide. Uploaded data is **not** stored on a server
(computation is local, so it never leaves the browser).

## Success criteria

- A non-statistician can reach a **correct, defensible** test recommendation
  without knowing statistics jargon up front.
- Every recommendation **traces to a citable source** and is covered by a
  passing automated test.
- Users report they **understand why** the recommended test fits.
