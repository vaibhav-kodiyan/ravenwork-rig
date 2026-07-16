---
name: rig-grilling
description: Establish business intent and independently authored acceptance tests before technical scoping or implementation.
---

# Grilling: Gate 1

Use this for new features, ambiguous requests, expensive mistakes, and any work
whose definition of correct is not already frozen. This phase owns **what and
why**, never implementation.

## Process

1. Read existing product language, constraints, and behavior before asking
   questions the repository can answer.
2. State the user, problem, desired outcome, and explicit non-goals.
3. Pressure-test assumptions, failure modes, permissions, data boundaries,
   lifecycle, and observable edge cases.
4. Resolve ambiguity one decision at a time. Record a default only when it is
   reversible and low-risk.
5. Write acceptance criteria as externally observable examples.
6. Author the smallest runnable acceptance tests or exact test cases that fail
   before implementation and pass only when the intent is met.
7. Freeze those artifacts as Gate 1 and hand them to product design.

## Gate Contract

The implementation agent must not author or edit Gate 1. A wrong test can
change only by returning here, recording why the intent changed, and having the
intent owner revise it. The test verdict outranks an implementer's claim.

## Output

- Problem and outcome
- Users and business rules
- In scope / out of scope
- Acceptance examples and edge cases
- Acceptance-test files or exact executable cases
- Open decisions that block Gate 1

Source: mattpocock grilling doctrine, adapted for Rig's two-gate pipeline.
