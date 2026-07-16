# Tier 1 (MVP) — Design

Exported 2026-07-16 from the grill session. Companion decisions log:
`../foundational-design/grill-decisions.md` (entries G1–G10). Source of truth for the
overall product: `../foundational-design/rig-foundational-design.md`.

Tier 1 is the **first shippable slice**: a curated, host-agnostic agent toolbox that
installs into any repo as **markdown only** — no runtime, no keys, no manifest engine.
"Clone → run bootstrap → pick Tier 1 → the agent shows up already configured and routing."

---

## 1. Scope — what Tier 1 IS

- A **dumb bootstrap** that lays down a curated set of **markdown** rules + skills + a
  shared router into a target repo.
- **Payload** = the curated best-of-breed content (see §3), fanned out to each host via
  ponytail's existing adapter machinery.
- **Universal routing** via one `routing.md` + a one-line pointer from each host's native
  entrypoint (§4).
- Works across **≥2 hosts, deliberately one router-capable + one router-less**:
  **Claude Code + Cursor** (§6) — so both the native-skill path and the routing fallback
  are exercised for real.

## 2. Scope — what Tier 1 explicitly is NOT (deferred)

| Deferred thing | Tier | Why not now |
|---|---|---|
| **Manifest + materializer** | **Tier 2** | Confirmed: materializer is entirely a Tier 2 category of change (G3, G3a). Design it on paper now; build it when a second tier forces it. No parser, schema contract, sync/check command, or file materializer in Tier 1. Build-minimal (#9). |
| Keys / `.env` / runtime workflows | Tier 2 | No harness runtime in Tier 1 — it only steers the host agent. |
| Harness generator (Layer 2) | Tier 3 | Manifest-authoring skill on the same spine (#11). |

Tier 1 carries **zero secrets** and starts **no processes**. Everything is text the host
LLM reads.

## 3. Payload — the curation (core IP)

Primary blend the harness is chasing: **superpowers × gstack** — superpowers'
extensibility/reach/thoroughness + gstack's business-mentality/boil-the-ocean — with
ponytail + mattpocock as accents (G1). Doctrine is extracted as **markdown**, not the
source runtimes (gstack's stateful `~/.gstack` machinery is dropped; only its doctrine
ships) (G4).

**Ship now (non-overlapping, single-owner skills — all of them, not a token subset):**

| Phase | Owner | Ships as |
|---|---|---|
| Intent / feature doc (Gate 1) | grilling (mattpocock) | skill + acceptance-test authoring |
| Product / foundational design (Gate 2) | gstack doctrine | skill (doctrine only) |
| Implementation | ponytail | always-on YAGNI rule + skill |
| Execution / parallelism | superpowers | skill (subagents, verification) |

Plus the always-on **ponytail YAGNI rule** and the shared **`routing.md`**.

**Ship after the characterization pass (now COMPLETE — see §7):** the three grafted
phases — **TDD, debugging, code review**. They could not ship un-merged (that would be the
concatenation the product exists to avoid, premises #3/#5). Their merges are specified in §7.

## 4. Routing — universal, capability-tiered

- **One `routing.md`** (skill index: each skill + when to use it). Each host's native
  entrypoint (`AGENTS.md`, `.cursor/rules`, `CLAUDE.md`, …) gets a **one-line pointer** to
  it. The agent self-routes by reading the table. Portable to anything that reads text;
  one router file, N one-line pointers (G5).
- **Advisory vs enforcing** (G6/G6a):
  - **Advisory** entries (the whole skill suite) → `routing.md` everywhere. The agent reads
    and chooses to comply.
  - **Enforcing** entries (a tiny set — hard guardrails + the #13 pipeline gate) → **real
    PreToolUse hooks** on hook-capable hosts (Claude/Codex/Copilot/OpenCode/Pi); **strong
    "gaslight" prose** fallback on hook-less hosts. Markdown never enforces at the tool
    boundary — stated limitation, not silent: #13's hard guarantee is real only where hooks
    exist, best-effort elsewhere.
  - Tier 1 is **almost entirely advisory**; enforcing entries mostly arrive with the graft
    hooks (gstack debug freeze hook) and the Tier-2/pipeline work.

## 5. Bootstrap shape — dumb but tidy

- No manifest engine. The bootstrap lays down a **fixed, hardcoded** set of files (G3a: **B**).
- But the layout is **predictable and enumerable** — a clean dir structure + a flat list of
  what it placed — so Tier 2's future materializer can describe it without reshaping. The
  fixed list the bootstrap already needs IS the proto-manifest. No speculative machinery,
  no retrofit cliff.

## 6. Hosts

- **Claude Code** (router-capable, primary) + **Cursor** (router-less).
- Chosen deliberately to force both paths: native skill routing (Claude) and the
  `routing.md` fallback (Cursor). Surviving Cursor proves host-agnosticism rather than
  assuming it.

## 7. The three grafts (characterization pass #6 — COMPLETE)

Method: read each source, dedup the shared ~80%, **union** the distinctive parts, and on
each **true conflict** make one call. Full detail in `grill-decisions.md` G7–G9.

### TDD (superpowers × mattpocock — gstack has no TDD skill)
- **Union:** superpowers enforcement (Iron Law, delete-first-code, watch-it-fail-right,
  anti-rationalization tables) + mattpocock structure (seams confirmed with user before any
  test, tautological-test anti-pattern, CONTEXT.md/ADR vocabulary, tracer-bullet slices).
- **Conflict — refactor placement → IN the loop (superpowers).** Clean code reaches review;
  review stays behavior-focused, not a cleanup pass.

### Debugging (superpowers × mattpocock × gstack)
- **Union:** mattpocock's 6-phase skeleton + 10-way feedback-loop cookbook (crown jewel),
  minimise-the-repro, tagged `[DEBUG-xxx]` logs, perf branch, correct-seam test;
  superpowers' boundary instrumentation, pattern-diff, "3 fixes → question architecture";
  gstack's **freeze/scope-boundary PreToolUse hook** (enforcing — first concrete G6a case).
- **D1 — hypotheses → 3–5 ranked (mattpocock)**, recreate the exact bug, cross off most→least
  likely, **and harden the other plausible sources too** (defense-in-depth) (user addition).
- **D2 — first move → repro-loop-first (mattpocock)**; superpowers' investigation folds into
  loop-building + instrument phases.

### Code review (superpowers ×2 × mattpocock × gstack)
- **Union:** superpowers fresh-context reviewer subagent (independence = enforces #13) +
  `receiving-code-review` discipline (no performative agreement, verify, YAGNI-check, push
  back); mattpocock two-axis rubric (Spec + Standards); gstack structural checklist (SQL
  safety, LLM trust boundary, race conditions, shell injection, enum completeness…) +
  **Suppressions list** (anti-pedant guard).
- **CR1 — report-only.** Reviewer never mutates code; if the user opts to fix, scoping+apply
  **re-enters the existing two-gate scoping/code-change pipeline** (preserves #13). gstack's
  Fix-First heuristic = the mechanical-vs-judgment classifier for that separate apply pass.
- **CR2 — cleanup by artifact scope.** TDD loop cleans its **own local test artifacts**;
  review hunts **systemic/cross-repo duplicates + stray temp files**. Duplicated-code stays
  in review but scoped to *systemic*.
- **Merged structure:** fresh-context reviewer → parallel axis-subagents (Spec/Scope ·
  Correctness & structural-safety · systemic/architectural smells · test gaps), severity
  within each, Suppressions applied globally, report-only.

## 8. Identity / naming refactor (G10) — part of Tier 1

**The harness is called Rig** (G10a). Ship it as **its own thing**, not a ponytail fork with
minimal changes. Alongside the Tier-1 build, **refactor file/dir names** and restructure
toward Rig's own architecture (curation spine, `routing.md`, grafted skills).

- **Constraint:** ponytail stays a **named internal component** of Rig (the implementation-phase
  ruleset owner, #5). The rename is at the **Rig / top level** — it does not erase
  ponytail-the-ingredient. "Rig" is parent-level (it holds and coordinates many tools) and
  distinct from "ponytail," so the two never blur.
- Rename targets: repo/top-level branding, the bootstrap/installer, the harness-level docs and
  dir structure → **Rig**. Untouched: `skills/ponytail/` and the always-on YAGNI rule.

## 9. Success criteria (Tier 1)

- Fresh repo → run bootstrap → pick Tier 1 → **a Claude agent and a Cursor agent both show
  up configured and routing correctly**.
- Payload is the full non-overlapping suite + the three merged grafts + `routing.md`.
- **Scripted multi-host test:** run the bootstrap into a fresh temp repo, assert expected
  files landed per host (generalizes `check-rule-copies.js`). One command, no hand-checking.
- Zero secrets in git; no runtime started.
- Repo reads as its own harness (G10), not a thin ponytail fork.
- Each grafted skill traces every check back to a source framework (provenance, §7).

## 10. Open items carried into build

- **G1a** — recommended curation proof point: the first graft you ship doubles as the
  "curation beats concatenation" proof (does the merged skill catch what each source misses?).
- Confirm Claude+Cursor host pair.
