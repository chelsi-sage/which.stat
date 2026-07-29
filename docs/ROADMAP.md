# Roadmap

Phased milestones, built in small visible steps. Each phase produces something
Chelsi can **see working** before the next one starts.

## Phase 0 — Foundation ✅ (current)

The working agreement and planning docs. No app code.

- Ground rules, coding process, architecture rules, methodology captured.
- Seven docs in place; decision log seeded.

## Phase 1 — Static decision tree

A working decision tree that runs locally, no AI, works offline.

- Scaffold the React + TypeScript + Vite project.
- Model a small, well-tested set of statistical tests.
- Build the guided questionnaire with a **"what does this mean?"** explanation on
  every node.
- Hard automated tests on the recommendation logic; each test traces to a
  citable source.
- **You can see it working:** answer questions locally, get a recommendation.

## Phase 2 — Make it an installable PWA

- Add PWA capabilities (installable, works offline).
- Polish the experience for real use.
- **You can see it working:** install it and use it offline.

## Phase 3 — Data upload + AI data-typing

- Let users upload data; AI helps classify **what type** each column is.
- AI **selects/interprets only** — it calls the pre-approved deterministic stats
  engine (see [ARCHITECTURE.md](ARCHITECTURE.md)).
- Scope AI infrastructure, cost, and data-handling approach before building.
- **You can see it working:** upload a file, get help identifying data types that
  feed the decision tree.

## Later / maybe (not committed)

- Public hosted URL with auto-deploy (when worth sharing).
- Expanding the set of supported tests.
- Result interpretation help.

_Phases are revisited as we learn. Changes are logged in
[DECISIONS.md](DECISIONS.md)._
