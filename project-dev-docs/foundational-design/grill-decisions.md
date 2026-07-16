# Grill Session — Harness Foundational Design (decisions log)

Started 2026-07-16. Live log of decisions/revisions coming OUT of grilling the MVP
foundational design doc (`.context/attachments/*/harness-foundational-design.md`).
Captures **deltas** against the source doc's 13 locked / 3 open items.

Each entry: the question put, the resolution, and what changed vs. the doc.

---

## Resolved this session

### G1 — The primary blend is superpowers × gstack (not an equal 5-way merge)
**Q:** What does "best of each family" concretely mean — which frameworks are load-bearing?
**Resolution:** The value the user is chasing is **superpowers' extensibility/reach/thoroughness
combined with gstack's business-mentality/boil-the-ocean approach** — "best of both worlds."
mattpocock (grilling) and ponytail are supporting cast, not the headline blend.
**Delta vs doc:** Sharpens the curation-spine table (source lines 184–192) from a flat
"one best-of-breed per phase" into a primary axis (superpowers × gstack) with ponytail/mattpocock
as accents.

### G2 — #9 north star is genuine, not a truce; minimalism IS load-bearing
**Q:** Is ponytail's minimalism a real pillar you'll defend, or an accent hiding a maximalist taste?
**Resolution:** Real pillar — scoped to building/scoping, not planning. User's model:
"the best engineer builds idiot-proof systems with the least code, sometimes removes code to make
things more robust — that spirit when coding and scoping. But planning needs to be thorough."
Sincere endorsement of #9's spec-vs-diff axis (thorough spec, minimal diff), not a compromise.
**Delta vs doc:** None — confirms #9.

### G3 — MVP = Tier 1 only; materializer is Tier 2
**Q:** Does the MVP build the manifest+materializer spine, or ship Tier 1 as a bootstrap over
ponytail's existing fan-out and defer the manifest until a second tier demands it?
**Resolution:** **Ship Tier 1 as the MVP.** Tiers 2 and 3 are to be **scoped/planned** now
(thorough planning) but not built. The materializer implementation is strapped entirely
to Tier 2. Tier 1 may keep manifest-shaped vocabulary in docs/naming to avoid a painful
retrofit, but it does not build a manifest parser, schema contract, idempotent
sync/check, or file materializer.
**Delta vs doc:** Overrides Decided #8's implication that Tier 1 includes "manifest format + materializer."
Splits it: Tier 1 MVP = minimal bootstrap over existing fan-out/adapters; manifest/materializer =
Tier 2 implementation. Retires Open #2 as an MVP blocker and moves it to Tier 2 planning.
**G3a RESOLVED:** Tier 1 can anticipate manifest shape only as lightweight vocabulary/docs.
No materializer code lands before Tier 2.

### G4 — MVP scope is emergent within Tier 1
**Q:** (implied) What is the MVP boundary?
**Resolution:** MVP = build out Tier 1 of the harness the doc describes; "we'll see where that goes itself."
Deliberately emergent, not a fixed feature list. Still needs a concrete first vertical slice.

### G4 — Payload ports as extracted markdown; gstack = doctrine, not runtime
**Q:** gstack's value is entangled with a stateful Claude-Code runtime — how does it go host-agnostic?
**Resolution:** Extract the **content/context** (doctrine, rituals, planning stance) as markdown; every
target host is ultimately an LLM eating text, so extracted content ships everywhere. Drop gstack's
stateful machinery (`~/.gstack` sessions/analytics/browser) — the harness doesn't need it.
**Facts found:** ponytail = 16-host adapters present; superpowers = already multi-host (`.opencode`,
`.cursor-plugin`, `tests/codex`); gstack = Claude-Code-native stateful suite in `~/.claude/skills/gstack`
+ `~/.gstack`. So the payload is markdown doctrine, not gstack-the-program.
**Delta vs doc:** Concretizes premise #3 ("curation, not packaging") into "carry doctrine, not runtimes."

### G5 — Universal routing via a shared `routing.md` + one-line host pointers
**Q:** How does contextual skill-selection work on router-less hosts (no native skill selector)?
**Resolution:** Ship ONE `routing.md` (skill index: each skill + when to use it). Each host's native
entrypoint (`AGENTS.md`, `.cursor/rules`, `CLAUDE.md`, …) gets a **one-line pointer** to it. The agent
self-routes by reading the table. Portable to anything that reads text; DRY; materializer-friendly.
**Delta vs doc:** New mechanism. Generalizes ponytail's runtime-adapter/static-adapter split into a
content-level router that works even on hosts with no skill mechanism.

### G6 — Advisory vs enforcing: routing.md is advisory; hook-less hosts use strong language
**Q:** For an enforcing ritual (#12/#13) on a host with no hooks, does it downgrade / warn / refuse?
**Resolution:** **Keep the routing structure; escalate to extremely strong, non-negotiable language**
on tool-less/hook-less hosts. No install refusal. **Stated limitation (not silent):** strong language is
still advisory — it raises compliance, it does not *block* the action at the tool boundary. Therefore
#13's hard guarantee ("implementer physically cannot edit the Gate-1 oracle") is **real only on
hook-capable hosts (Claude/Codex/Copilot/OpenCode/Pi); best-effort (strong prose) everywhere else.**
**Delta vs doc:** Refines #12/#13 — enforcement is host-capability-tiered; markdown never enforces.
**G6a RESOLVED — X:** On hook-capable hosts, enforcing entries use **real PreToolUse hooks** (genuine
tool-boundary enforcement); on hook-less hosts they fall back to **strong "gaslight" prose** in the custom
prompt. Enforcing entries are a tiny set (~#13 gate + hard guardrails), so maintaining two forms is cheap.
Advisory entries (the ~30-skill suite) stay prose-only via routing.md.

### G7 — TDD graft = superpowers × mattpocock (gstack has NO tdd skill)
**Q:** Characterize the tdd graft; resolve conflicts; union set.
**Correction to doc:** TDD is a **two-way** graft (superpowers + mattpocock). gstack has no TDD
skill (`test/` is only fixtures) — doc table line 191 "GRAFTED (superpowers+mattpocock+gstack)" is wrong for tdd.
**Shared core (dedup, keep once):** red before green; failing test first; minimal code to pass;
one behavior/test; test behavior via public interface not internals; real code over mocks.
**Union in from superpowers (enforcement muscle):** Iron Law absolutism; delete code written
before the test; watch-it-fail-for-the-RIGHT-reason (verify RED); anti-rationalization / red-flag tables;
verification checklist.
**Union in from mattpocock (structural discipline):** **seams** (pre-agree + confirm test boundaries
with user before writing any test — aligns with #13 oracle-up-front); **tautological-test** anti-pattern
(assertion recomputes expected value the way the code does); read CONTEXT.md/ADRs for domain vocabulary;
tracer-bullet vertical slices.
**CONFLICT resolved — refactor placement:** **Refactor stays IN the loop (superpowers), NOT deferred.**
User's rationale: don't let dirty test-adjacent code reach prod; keep the review stage focused on
behavior, not cleanup. (Overrides my rec of mattpocock's refactor-out-of-loop.) Division of labor:
TDD loop cleans as it goes → review judges behavior/correctness.
**Delta vs doc:** Fills in the tdd graft; corrects the 3-source claim to 2 sources.

### G8 — Debugging graft = superpowers × mattpocock × gstack (true 3-way)
**Q:** Characterize the debugging graft; resolve conflicts; union set.
**Shared core (dedup):** root cause before fix; reproduce; one change at a time; regression test before fix;
verify against the user's *actual* symptom.
**Union from superpowers:** multi-component boundary instrumentation (log in/out per layer to locate the
breaking component); Pattern Analysis (working-vs-broken diff); **"3 fixes failed → question the
architecture"** escalation; anti-rationalization tables; defense-in-depth.
**Union from mattpocock (crown jewel):** Phase 1 = build a **tight red-capable feedback loop** (10-way
cookbook: failing test/curl/CLI+snapshot/headless/replay/harness/fuzz/bisection/differential/HITL);
tighten the loop; minimise the repro; tagged `[DEBUG-xxx]` logs; perf branch (measure first); correct-seam
regression test or flag missing seam as the finding; post-mortem.
**Union from gstack:** **PreToolUse freeze/scope-boundary hook** (blocks edits outside declared debug scope)
= the graft's ENFORCING entry per #12/G6a (real hook on hook-capable hosts, gaslight prose elsewhere);
gbrain recall of prior investigations (advisory, portable only where a store exists — degrade gracefully).
**CONFLICT D1 resolved — hypotheses:** **3–5 ranked falsifiable hypotheses (mattpocock)**, shown to user,
recreate the exact received bug, then cross off most-likely → least-likely. **ADDITION (user):** also
**harden the other plausible sources** so they're airtight, not just the one true cause (= defense-in-depth).
**CONFLICT D2 resolved — first move:** **mattpocock loop-first skeleton**; superpowers' investigation
techniques fold into loop-building + instrument phases. Repro-first; every later phase consumes the loop.
**Skeleton:** mattpocock's 6 phases as spine + superpowers techniques per-phase + gstack freeze hook.

### G9 — Code-review graft = superpowers (×2) × mattpocock × gstack
**Q:** Characterize the code-review graft; resolve conflicts; union set.
**Union from superpowers:** fresh-context reviewer **subagent** (never sees implementer's session →
independence = enforces #13 separation-of-powers); severity tiers; `receiving-code-review` discipline
(no performative agreement / "delete the word Thanks", verify before implementing, YAGNI-check via grep,
push back with technical reasoning, clarify all items before implementing any).
**Union from mattpocock:** two-axis rubric — **Spec axis** (missing reqs / scope creep / wrong impl) +
**Standards axis** (Fowler smells); parallel axis-subagents kept separate.
**Union from gstack:** two-pass **structural checklist** — CRITICAL (SQL safety, race conditions, LLM
output trust boundary, shell injection, enum completeness) + INFORMATIONAL (type coercion at boundaries,
time-window safety, async/sync, CI/CD); specialist parallel subagents; and a **Suppressions list**
(anti-pedant guard — don't flag harmless redundancy, don't demand explanatory comments, etc.).
**Dedup:** mattpocock Spec ≈ gstack scope-drift → one Spec/Scope axis; superpowers YAGNI ≈ mattpocock
speculative-generality ≈ gstack dead-code → one YAGNI check; all severity schemes → one.
**CONFLICT CR1 resolved — report-only:** reviewer **reports** (preserves #13 independence); if the user
opts to fix, the scoping+apply **re-enters the existing two-gate scoping/code-change pipeline** (reviewer
never mutates code, never edits the oracle). gstack's Fix-First *heuristic* survives as the mechanical-vs-
judgment classifier for that separate apply pass.
**CONFLICT CR2 resolved — cleanup by artifact scope (refines G7):** TDD loop cleans its **own local test
artifacts** (generates many, clean immediately); review hunts **systemic/cross-repo duplicates + stray
temp files**. Duplicated-code stays in review but scoped to *systemic*; local cleanup is TDD's job.
**Merged structure:** fresh-context reviewer → parallel axis-subagents (Spec/Scope · Correctness &
structural-safety · systemic/architectural smells · test gaps), severity within each, Suppressions global,
report-only, then `receiving-code-review` to act.
**Delta vs doc:** Fully specifies the code-review graft; ties reviewer independence to #13.

### G3a / materializer placement — RESOLVED: materializer is entirely Tier 2
**Resolution:** The manifest + materializer are **completely a Tier 2 category of change** (confirms G3).
Tier 1 ships a dumb bootstrap; no manifest engine at all. G3a (does Tier 1 anticipate the manifest shape?)
→ recommended **B (dumb-but-tidy)**: predictable, enumerable file layout so Tier 2's materializer can later
describe it without reshaping — no speculative machinery now, no retrofit cliff later.
**Test strategy (Open #3):** scripted — run the bootstrap into a fresh temp repo, assert the expected files
landed per host (Claude + Cursor). Generalizes ponytail's `check-rule-copies.js`. One command, no hand-checking.

### G10 — Tier 1 must include an IDENTITY / naming refactor (not a thin ponytail fork)
**Q:** (user directive) Ship it as "my own," not a ponytail fork with minimal changes.
**Resolution:** Alongside the Tier-1 build, **refactor file/dir names** so the repo reads as its own harness,
not ponytail-plus-a-layer. Restructure toward the harness's own architecture (curation spine, routing.md,
grafted skills). **Constraint:** ponytail remains a *named internal component* (the implementation-phase
ruleset owner, #5) — the rename is at the **harness/top level**, it does NOT erase ponytail-the-ingredient.
**Ties to:** G1 ("best of each family, shipped as my own").
**G10a RESOLVED — name = "Rig".** Parent-level (holds/coordinates many tools), distinct from
"ponytail" so top-level and component never blur. Rename targets: repo/top-level branding, the
bootstrap/installer, harness-level docs + dir structure → Rig. Untouched: `skills/ponytail/` + the
always-on YAGNI rule (ponytail stays a named internal component of Rig).

### G11 — Tier 2 splits into Basic (bounded delta) and Advanced (agents + loops + memory)
**Q:** Is Tier 2 "just config + creds" (A) or "Rig runs its own agentic loops" (B)?
**Resolution:** **Both, as sub-levels** (maps onto the à-la-carte spectrum #2):
- **Tier 2 Basic (A):** Tier 1 config **+ credentialed external-tool / MCP wiring**. `.env` holds
  *third-party tool creds* (DB, Slack, ETL data source). Rig still doesn't run an LLM. Small, buildable.
- **Tier 2 Advanced (B):** Rig **spins up new agents + agentic loops**, and **grows/understands with the
  repo** = persistent, **repo-scoped memory/learning** (the stateful capability dropped from Tier 1 in G4;
  Rig's own version of gstack gbrain/learnings). State ⇒ Tier 2+, needs keys + gitignore.
**Delta vs doc:** Concretizes the "middle band / recipes" + Tier 2 rows of #2 into Basic/Advanced;
adds repo-scoped memory as the defining Tier 2 Advanced capability.
**⚠ OPEN (G11a):** does Tier 2 Advanced run agents on the **HOST's brain** (Rig authors loop config +
memory, host executes — #11 survives) or on **Rig's OWN brain** (independent LLM runtime + own key —
#11 revised)? Load-bearing for whether Rig stays config or becomes a runtime. See question to user.

## Recommended but NOT yet confirmed

### G1a — Curation-thesis proof point (RECOMMENDED)
Hand-graft ONE overlapping phase (code review: superpowers + mattpocock + gstack) and show it
catches bugs each source misses, BEFORE trusting the "curation beats concatenation" thesis.
Cheap, de-risks the core claim. **REVISIT before locking MVP scope.**

## Still open

- **T2/T3 scope** — being grilled next (user asked to scope them).
- Source doc Open #1 (graft method/order), #3 (multi-host test strategy).
