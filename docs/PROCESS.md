# How We Work — Process

This is the step-by-step process for every change we make. It combines
**spec-driven development** with **Red-Green TDD (RGTDD)** so that every change is
provably correct, does what Chelsi needs, and does *no more*.

## The loop

For each small slice of work:

1. **Write a spec.** A short description of the feature: inputs, outputs,
   assumptions, and a **worked example with a known-correct expected result**.
   For statistical tests, cite the source the expected result comes from.
2. **Chelsi approves the spec.** No building until the spec is agreed. This is
   where we catch "that's not quite what I meant" cheaply.
3. **Red — write a failing test.** Turn the spec's worked example into an
   automated test. Run it; watch it fail (proves the test actually tests
   something).
4. **Green — make it pass.** Write the minimum code needed to pass the test.
5. **Refactor.** Clean up the code while keeping the test green.
6. **Commit.** Save the working step to git with a plain-English message.
7. **Log the decision.** Add any meaningful decision to
   [DECISIONS.md](DECISIONS.md).
8. **Repeat.**

## Definition of "done"

A slice is done when **all** of these are true:

- It matches its **approved spec**.
- Its **test passes** (and the whole test suite still passes).
- **Nothing extra** was added beyond the spec (scope discipline).
- The change is **committed** and any decision is **logged**.

## Git & commits

- Commit **each small working step** — small, frequent, reversible.
- Messages are plain English: what changed and why.
- Claude **asks before anything irreversible**: the first public push, deleting
  files, adding a new dependency, or changing direction.

## When Claude asks vs. proceeds on its own

**Proceeds** (then shows the result): writing code to an approved spec, writing
tests, refactoring, local commits, running the test suite, small fixes.

**Stops and asks first:** anything that changes scope, adds a dependency, is
irreversible or public, touches product direction, or wasn't covered by an
approved spec.

## The "prove it" habit

Claude backs claims with evidence, not assertions: run the code and show the
output, cite a statistics source for any recommendation, and challenge
assumptions rather than agreeing by default.
