# Rig — Foundational Design (initial plan)

Initial plan doc. Consolidated 2026-07-15 from the office-hours design doc + decisions log.
The product identity is Rig; older source paths may still use "harness" as historical context.
This tracked file is the source of truth; scratch mirrors live at
`.context/harness-decisions.md` and
`~/.gstack/projects/vaibhav-kodiyan-ponytail-pr-review-harness/winmore-consolidate-agentic-tools-harness-design-20260715-224342.md`.
Branch: `consolidate-agentic-tools-harness`
Repo: vaibhav-kodiyan/ponytail-pr-review-harness
Status: DECISIONS LOCKED (13), 3 OPEN — next: Tier 1 bootstrap scope; manifest/materializer starts in Tier 2

---

## Product

- **What it is:** one installer that carries a curated, host-agnostic agentic
  toolbox into any repo. Clone → run installer → pick a level → agent shows up
  already configured.
- **Two layers:** Layer 1 = the loaded truck (bundle + install). Layer 2 = a skill
  that authors new capabilities from a sentence (see Decided #11 — it is NOT a
  separate codegen engine).
- **Core IP:** the curated best-of-breed shortlist + one coherent philosophy, not
  the packaging.

## Problem

A pile of agentic-engineering tooling has accumulated on one machine — ponytail (a
YAGNI ruleset fanned out to ~16 hosts), gstack (a ~30-skill workflow suite),
superpowers (TDD, systematic-debugging, subagent dispatch), mattpocock skills
(grilling, diagnosing-bugs, tdd, code-review), conductor (parallel workspaces), plus
MCP servers and settings/hooks. It only helps that one machine. The goal: consolidate
the *best parts* into a single harness that installs into any repo so a person (you, a
teammate, or a stranger who clones the repo) can hit the ground running — host-agnostic,
with a way to grow new capabilities on demand.

## What makes it cool

1. **The loaded truck (Layer 1).** One installer drops a curated, host-agnostic agent
   environment into any repo. Clone, run one thing, pick your level, and the agent
   shows up already knowing the rules, the skills, and the workflow.
2. **The harness that grows itself (Layer 2).** Describe a ritual in a sentence and the
   harness authors a new minimal, self-injecting, host-agnostic capability for it. Per
   Decided #11 this is a manifest-authoring skill riding the same spine, not a second
   system.

## Constraints

- **Host-agnostic (tier-dependent).** Must land correctly across Claude Code, Cursor,
  Codex, OpenCode, Windsurf, Cline, Kiro, etc. Reuses ponytail's fan-out machinery.
- **Secrets never committed.** Runtime tiers take keys via gitignored `.env`; installer
  generates `.env.example` with blank placeholders; keys stay local. Non-negotiable.
- **Reproducible.** Tier 1 pins the bootstrap/source ref; Tier 2+ manifests pin a
  version so an install is repeatable.
- **Clean target repos.** Tier 2 materialized host-adapter files can be gitignored.
- **No philosophy whiplash.** The bundled ruleset must be internally coherent (see #9).

## Premises (agreed)

1. ponytail already proves host-agnostic fan-out works — reuse it, don't rebuild it.
2. The audience includes strangers who clone the repo, so the harness must live *inside*
   the target repo, not only in `~/`.
3. Concatenating all installed frameworks produces a worse agent — curation is the core
   work, not packaging.
4. The YAGNI-vs-completeness conflict between ponytail and gstack is a scope question to
   resolve with one coherent principle (resolved by #9), not a bug to fix.

---

## Decided (13)

1. **Delivery model = C** — committed bootstrap in the target repo, pulling host
   adapters from a single source of truth (this repo as release/git ref). Tier 2 adds
   the committed manifest and materializer. Rejected: A (copy-in, drifts + bloats), B
   (symlink to `~/`, fails for strangers who clone).
2. **Install UX = à-la-carte spectrum**, not fixed bundles:
   `raw rules (.md) → recipes that build on invoke → fully-wired runtime with keys`.
   - Tier 1: markdown harnesses only (rules + skills + host adapters), no keys/runtime,
     no materializer implementation. It may preserve manifest-shaped naming/selection
     language in docs only so Tier 2 has a clean landing zone.
   - Middle band: recipes / lazy execution — ship the recipe, not the running
     workflow; nothing executes until invoked. Home for the Layer 2 generator.
   - Tier 2: wired agentic workflows, user keys via gitignored `.env`, plus the first
     real manifest format + materializer implementation.
   - Tier 3: harness generator (Layer 2).
3. **Manifest = a list of decisions, not files (Tier 2+).** It records the selection;
   the materializer reads it and lays down exactly those files per host.
4. **Spine = manifest + materializer, implemented in Tier 2.** Tier 1 stays a minimal
   bootstrap; Tier 2 builds the spine once; Tier 3 generator later emits into the same
   materializer.
5. **Curation = one best-of-breed per intent, scoped by phase** (do NOT concatenate):
   - Intent / feature doc → grilling (mattpocock)
   - Product / foundational design → gstack
   - Implementation → ponytail (least blast radius)
   - Execution / parallelism → superpowers (subagents, verification)
   - Debugging / TDD / code review → GRAFTED (superpowers + mattpocock + gstack)
6. **Grafted skills require a characterization pass** before shipping: read each
   contributing skill, extract distinctive checks + target bug classes into a diff table,
   then author a merged skill that dedups the shared ~80%. No unverified "X is better at
   Y" claims baked in.
7. **Secrets never committed** — any runtime tier takes keys via gitignored `.env`;
   installer generates `.env.example` with blank placeholders and states keys stay local.
8. **First shippable slice = Tier 1** (minimal bootstrap over ponytail's existing
   fan-out + adapters), dogfooded on ponytail's own rule/skill/adapter files. No
   manifest parser, materializer, idempotent sync/check, or schema-hardening work belongs
   in Tier 1.
9. **North-star philosophy = artifact-scoped completeness/minimalism.** Be COMPLETE
   about what you build (intent, scope, edge cases → grilling/gstack/superpowers boil the
   ocean), MINIMAL about how you touch the code (least blast radius, fewest new breakable
   surfaces → ponytail), EXHAUSTIVE before it ships (verification → superpowers). The
   switch is the artifact you are editing right now — spec vs diff — always knowable,
   unlike C1's "which phase" or C2's "how bad is a miss." Minimality is conditioned on
   completeness: the complete spec sets the target, ponytail picks the least-surface path
   *among implementations that fully satisfy it* (scope first, then least surface to reach
   it). Bonus: artifact-type is the same axis as the curation router (spec→grilling/gstack,
   diff→ponytail, verify→superpowers), so philosophy and spine are one function. Tagline:
   "Think expansively, build minimally, verify exhaustively." Retired candidate: C2
   ("match effort to cost of being wrong") — artifact-type is more concrete and doubles as
   the router axis.
10. **Profiles + anti-drift fall out of the spine, not a new subsystem.** A "profile of
    work" (an org's or project's repeatable rules/skills/hooks/rituals) IS a named
    manifest — the manifest was already "a list of decisions" (#3), so a profile is a
    named, composable manifest (org profile + project profile stack). "Keep all agents in
    sync / anti-drift" is a PROPERTY of delivery model C (#1): output is re-materialized
    from the pinned source, so it cannot drift by construction (model A copy-in was
    rejected precisely because it drifts). Only new artifact is a `sync`/`check` command
    that re-runs the materializer and diffs against committed output — a generalization of
    ponytail's `check-rule-copies.js`. À-la-carte select, profile of work, and anti-drift
    are the same object: the manifest. Product framing "ship a toolbox for creating
    state-of-the-art agents" = curated shortlist + manifest + materializer +
    author/sync/check commands, held coherent by the #9 north star (no separate
    "state-of-the-art" system to build).
11. **The agent IS the code generator — Layer 2 emits config, not code.** Two candidate
    codegen rituals were tested and both reduce to the spine: (a) ETL self-verify loop
    (spin up local artifacts, health-check, curl with params, assert data, iterate) = a
    project-local verify script the AGENT authors once as normal project code, wired by a
    manifest entry (verify recipe slot + "run verify after a change, iterate on failure"
    hook); (b) guardrail / "impossible to disobey" (agent must not call external deps;
    enforce a user instruction mechanically) = a PreToolUse deny hook + permission entry.
    In an agentic system there is no separate codegen engine to build: the general-purpose
    agent already generates code; Layer 2 ships SKILLS/rules/hooks (config) that steer it,
    and generates the *instruction*, not the code. So Layer 2 v1 stays a manifest-authoring
    skill. (ETL verify loop is also the natural first recipe / dogfood target after the
    Tier 1 slice.)
12. **Manifest entries have two classes: advisory vs enforcing.** Advisory = rules/skills
    injected into context (agent may comply). Enforcing = hooks + permission denies that
    block at the tool-call boundary (agent cannot disobey). Ritual B ("literally impossible
    to disobey") requires enforcing entries, which ponytail already has the mechanism for
    (hooks). Per #9, enforcing entries are high-cost-if-wrong (a bypassable guardrail is
    worse than none), so they must be VERIFIED, not just generated. Schema (#3, Open #2)
    must tag each entry advisory|enforcing.
13. **Pipeline gate: two frozen requirements before any implementation, authored
    separately from it (separation of powers).** Core failure mode this prevents: an agent
    that writes the code AND defines "correct" will grade its own homework pass (cost bias —
    wants approval, wants to be done, lowers the bar).
    - Gate 1 — business intent + acceptance tests: what "correct" means, as checkable tests
      derived from business intent. Owner: intent pass (grilling); it produces the tests,
      not just prose. Established before code is scoped.
    - Gate 2 — technical spec + implementation approach: the how. Owner: design/eng pass
      (gstack / plan-eng-review).
    - Both gate BEFORE ponytail implements. Separation rule: the implementing agent may NOT
      author or edit Gate 1's correctness definition/tests. Verification runs against the
      frozen, independently-authored oracle — the test's verdict beats the implementer's
      claim.
    - NOT immutability — change-control: a genuinely-wrong Gate 1 test can change, but only
      back through the intent pass (logged, by the intent owner), never edited by the
      implementer mid-flight to go green. Preserves anti-rubber-stamp while allowing
      legitimate learning.
    - Enforceable, not advisory (#12): a PreToolUse hook blocks the implementing agent from
      modifying acceptance-test files — ritual B applied to the pipeline itself.
    - Consistent with #9 (independent oracle = spec authored separately from the diff) and
      #5 (grilling=Gate 1, gstack=Gate 2, ponytail=implementation).

## Open (3)

1. **Graft method + order** — confirm diff-table characterization pass; sequence
   debug → tdd → review.
2. **Manifest schema** — formal format. Concrete bar from this session, the schema must:
   (a) carry components, versions, chosen philosophy (#9), per-host targets;
   (b) express rituals as rule+hook bundles;
   (c) be diffable so sync/check can report drift (#10);
   (d) be nameable + composable so an org profile and a project profile stack (#10);
   (e) tag each entry advisory|enforcing, enforcing entries carry a verify step (#12);
   (f) encode the two-gate pipeline + the "implementer can't edit Gate 1" enforcement (#13).
3. **Multi-host test strategy** — verify a materialized install works across >1 host
   without hand-checking 16 targets.

## Curation spine (the core IP)

Do not concatenate. One best-of-breed tool per intent, assigned to the phase each
framework is actually best at:

| Phase | Owner | Why it wins here |
|---|---|---|
| Intent / feature doc (Gate 1) | grilling (mattpocock) | stress-tests intent before code exists; authors acceptance tests |
| Product / foundational design (Gate 2) | gstack (office-hours, plan reviews) | scope + approach |
| Implementation | ponytail | least blast radius, minimal diff |
| Execution / parallelism | superpowers | subagents, verification-before-completion |
| Debugging | GRAFTED (superpowers + mattpocock + gstack) | each catches a different bug class |
| TDD | GRAFTED | same |
| Code review | GRAFTED | same |

The four single-owner rows ship as-is. The three grafted rows need the bounded
characterization pass (#6) before they can ship honestly.

## Success criteria

- Tier 1 end-to-end works in a fresh test repo across at least 2 hosts via the minimal
  bootstrap, with no materializer implementation.
- Tier 2 manifest fully describes an install; re-running the materializer is idempotent.
- Secrets never land in git; `.env.example` generated, `.env` gitignored.
- Bundled ruleset is internally coherent (passes the #9 north-star check).
- Each grafted skill traces every check back to a source framework (provenance).
- The two-gate pipeline (#13) is enforced: an implementing agent cannot edit Gate 1 tests.

## Distribution

The harness distributes itself: the source-of-truth repo publishes pinned releases (git
ref or GitHub Release). Tier 1 target repos commit only the small bootstrap and pull the
markdown harness/adapters at install time. Tier 2 target repos add the manifest; CI on
the source repo builds/validates the materializer and the host-adapter set (extend
ponytail's existing `check-rule-copies.js` / test suite to cover the manifest and
materialized output — this is also the anti-drift `check` command of #10).

## Dependencies

- ponytail's existing fan-out + adapters (source material for Tier 1).
- gstack / superpowers / mattpocock skill files (source material for curation + grafts).
- `.env` / `.env.example` convention already present in this repo.

## Next steps

1. Lock the Tier 1 bootstrap boundary: no manifest parser, no materializer, no sync/check
   command. Keep only enough manifest-shaped vocabulary in docs to avoid a Tier 2 retrofit.
2. Build the Tier 1 slice: installer skeleton over ponytail's existing fan-out/adapters,
   dogfooded on ponytail's own files. Deliverable: fresh repo, `clone → run installer →
   pick Tier 1 → agent shows up configured`, across ≥2 hosts.
3. Run the graft characterization pass, one category at a time (debug → tdd → review),
   producing a diff table before authoring each merged skill.
4. Tier 2 starts with `/plan-eng-review` to lock the manifest schema + materializer
   contract against the 6-point bar in Open #2, then implements the materializer.
5. First recipe after Tier 1: the ETL self-verify loop (#11).

## What I noticed about how you think

- You keep pulling the idea toward the more general, more reusable version (bundle →
  generator) instead of the quick win.
- You caught us designing the pipe and ignoring the content ("are we taking the best parts
  from all the frameworks?") — the actual hard part.
- You resolved YAGNI-vs-completeness not by picking a side but by scoping each framework to
  its zone of strength — which this session sharpened into the artifact-scoped north star
  (#9): the conflict was a category error (minimal = the diff, complete = the spec).
- You named the deepest failure mode unprompted (#13): an agent grading its own homework.
  You want separation of powers, not a mirror. "This is supposed to be where you push back,
  not just summarise."
