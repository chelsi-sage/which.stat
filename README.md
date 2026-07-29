# which.stat

**Helping product managers and researchers pick the right statistical test for
their problem.**

Choosing a statistical test is a common stumbling block for people who aren't
statisticians. `which.stat` guides you to the right test through plain-language
questions — and explains every step so you actually understand the choice.

## Who it's for

Product managers and researchers who need to analyse data but aren't sure which
statistical test fits their question.

## How it will work

1. **Guided decision tree.** Answer simple questions about your data and your
   question. Each step has a **"what does this mean?"** explanation in
   non-statistician language, so you're never stuck on jargon.
2. **Data upload (later).** Upload your data and AI helps you work out **what
   type of data** you have — which feeds back into the decision tree.
3. **Trustworthy results.** The actual statistics are run by **pre-approved,
   tested code** — never by AI making up an answer. Every recommendation traces
   to a citable statistics source.

## Status

**Foundation stage.** This repo currently contains the working agreement and
planning docs only — no app code yet. See [docs/ROADMAP.md](docs/ROADMAP.md) for
what comes next.

## Tech

- **Stack:** React + TypeScript + Vite (installable Progressive Web App)
- **Testing:** automated tests on the statistical logic
- **Where it runs:** code lives on GitHub; the app runs locally for now

## How to run

_Coming in Phase 1, once the app is scaffolded._

## Docs

- [Product vision](docs/PRODUCT_VISION.md) — what we're building and why
- [How we work](docs/PROCESS.md) — spec-driven development + Red-Green TDD
- [Architecture](docs/ARCHITECTURE.md) — the deterministic stats engine
- [Decision log](docs/DECISIONS.md) — every key decision, with reasons
- [Roadmap](docs/ROADMAP.md) — phased milestones
- [Operating agreement](CLAUDE.md) — ground rules for how we work together
