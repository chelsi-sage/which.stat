# Architecture — How the Stats Actually Run

This document states the **non-negotiable** rules for how `which.stat` computes
statistics. They exist to guarantee **correct, reproducible, hallucination-free**
results.

## The core principle

> **AI helps you choose. Pre-approved code does the maths.**

AI is fast and flexible but non-deterministic — it can produce different or
wrong answers. Statistics must be exactly right and identical every time. So we
draw a hard line between the two.

## The rules

1. **Deterministic stats engine.** All statistical math lives in standard,
   plain, **pre-approved and tested** functions. Given the same input, they
   return the same output every time. This is the only place maths happens.

2. **Tool-calling boundary.** AI may only:
   - help figure out **which test** fits the user's question, and
   - **interpret uploaded data** (e.g. classify a column as categorical or
     continuous).

   It does this by **calling a pre-approved function** and handing off. AI is
   **never in the math path**.

3. **The AI never writes or executes code inside the app.** No runtime code
   generation, no `eval`, no AI-authored formulas. Every statistical function is
   written as normal reviewed code and ships **only after Chelsi approves it**.

## The flow

```
                 ┌─────────────────────────────┐
   User  ─────►  │  Selection layer            │
                 │  • Guided decision tree      │
                 │  • (later) AI data-typing +  │
                 │    test suggestion           │  ← AI allowed here (selection only)
                 └──────────────┬──────────────┘
                                │  calls a pre-approved function (tool call)
                                ▼
                 ┌─────────────────────────────┐
                 │  Deterministic stats engine  │  ← AI never here
                 │  • pre-approved, tested code  │
                 │  • same input → same output   │
                 └──────────────┬──────────────┘
                                ▼
                             Result
```

## Why this matters

- **No hallucinated numbers.** The maths can't be made up because AI never runs it.
- **Reproducible.** The same inputs always give the same answer.
- **Auditable.** Every stats function is reviewed, tested, and traceable to a
  citable source (see the statistical-correctness rule in
  [../CLAUDE.md](../CLAUDE.md)).
- **Safe.** No arbitrary code is generated or executed at runtime.
