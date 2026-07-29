# CLAUDE.md — Operating Agreement for `which.stat`

This file is loaded automatically at the start of every session. It is the
agreement for **how we work together**. Follow it every time.

Chelsi is a **product manager**. She guides and makes the decisions; Claude
writes and explains the code. Chelsi does not need to write code, but every
decision must be explained clearly enough that she can review it.

---

## Working agreement (ground rules)

1. **Explain in plain English.** Every decision is explained without unexplained
   jargon. Chelsi should never have to guess what a piece of code does.
2. **Ask before big moves.** Confirm before anything large, irreversible, or
   scope-expanding — a new dependency, a public push, deleting things, changing
   direction. When in doubt, ask.
3. **Small, visible steps.** Build in small increments and show something working
   often. No big-bang reveals.
4. **Keep a decision log.** Record every meaningful decision in
   [docs/DECISIONS.md](docs/DECISIONS.md) — date, what, why, alternatives.
5. **Prove it — be antagonistic.** Do not just recommend or assert. Back claims
   with evidence: run the code and show the output, cite a statistics source for
   any test recommendation, and actively challenge Chelsi's assumptions rather
   than agreeing by default. Disagreement backed by proof is the job.

---

## Coding process

- **Stack:** React + TypeScript + Vite (installable PWA).
- **Version control:** all code goes to **GitHub**; the app **runs locally** for
  now. No public hosting yet — ask before the first public push.
- **Commit cadence:** commit **each small working step** with a plain-English
  message describing what changed and why.
- **Testing:** test the **statistical logic hard** (automated tests prove every
  recommendation is correct and stays correct). Lighter touch on UI.

---

## Non-negotiable architecture rules

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detail. The hard limits:

- **Deterministic stats engine.** All statistical math runs in standard,
  pre-approved, tested functions that give the same result every time. **AI is
  never in the math path.**
- **AI only selects/interprets.** AI may help choose *which* test fits, or
  interpret *what type* of uploaded data it is, then **hand off to a pre-approved
  function (tool calling)**. AI never computes the statistical answer itself.
- **The AI never writes or runs code inside the app.** No runtime code
  generation, no `eval`. Every stats function ships only after **Chelsi approves
  it**. This eliminates hallucinated results and keeps everything reproducible.

---

## Development methodology

See [docs/PROCESS.md](docs/PROCESS.md) for the full loop.

- **Spec-driven development.** Before building a feature, write a short spec
  (inputs, outputs, assumptions, a worked example with a known-correct expected
  result). **Chelsi approves the spec first.**
- **Red-Green TDD (RGTDD).** Write a failing test from the spec (**red**) → write
  the minimum code to pass it (**green**) → clean up (**refactor**). Nothing is
  "done" until its test passes.
- **No more than needed.** Build exactly what the approved spec calls for. Scope
  discipline is a first-class rule.

---

## Statistical-correctness rule

Every test the app recommends must trace to a **citable authority** (textbook or
paper), not to Claude's own say-so. Cite the source in the spec and in the
recommendation.

---

## Where things live

- [README.md](README.md) — project front door
- [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) — what we're building and why
- [docs/PROCESS.md](docs/PROCESS.md) — how we work, step by step
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the stats actually run
- [docs/DECISIONS.md](docs/DECISIONS.md) — the running decision log
- [docs/ROADMAP.md](docs/ROADMAP.md) — phased milestones
