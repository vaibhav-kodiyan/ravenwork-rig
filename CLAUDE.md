# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Ponytail injects a "lazy senior dev" YAGNI ruleset into AI coding agents: before writing
code, stop at the first rung that holds (does this need to exist? already in the
codebase? stdlib? native platform feature? installed dependency? one line? only then the
minimum that works). It ships as a plugin/extension/rule-file for ~16 different agent
hosts (Claude Code, Codex, Copilot CLI, Gemini/Antigravity CLI, OpenCode, Devin CLI,
Hermes, OpenClaw, Pi, Cursor, Windsurf, Cline, Kiro, Swival, CodeWhale). This file also
applies to agents working on the ponytail repo itself — especially to them.

## Commands

```bash
npm test                              # node --test tests/*.test.js && npm test --prefix pi-extension
node --test tests/hooks.test.js       # run a single test file
node scripts/check-rule-copies.js     # verify AGENTS.md and per-host rule copies stay in sync
node scripts/check-versions.js        # verify all version-bearing manifests share one semver
node scripts/build-openclaw-skills.js # regenerate .openclaw/skills/ from skills/
node scripts/publish-openclaw-skills.js [--dry-run]  # publish to ClawHub (needs `clawhub login`)
node scripts/uninstall.js             # clean up state ponytail wrote outside plugin files
```

The correctness benchmark tests spawn Python (`python3` then `python`) for email/CSV
checks; CSV checks need `pandas` installed locally.

**After editing the compact rule text** (`AGENTS.md` or any per-host rule copy), run
`check-rule-copies.js` — it fails on drift, it does not auto-fix.
**After editing any `skills/*/SKILL.md`**, run `build-openclaw-skills.js` — the OpenClaw
package is generated, not hand-maintained, and `tests/openclaw-skills.test.js` fails if
the committed output is stale.

## Architecture: one ruleset, many host adapters

The canonical ruleset lives in `skills/ponytail/SKILL.md`: the 7-rung ladder, rules, and
a lite/full/ultra intensity table. That table isn't just prose — table rows and
`- lite:` / `- full:` / `- ultra:` example lines are parsed and filtered by
`filterSkillBodyForMode()` in `hooks/ponytail-instructions.js`, which strips out the
other two modes' rows before the ruleset is injected. Mode resolution (env var >
`~/.config/ponytail/config.json` > default `full`) lives in `hooks/ponytail-config.js`.

Two independent mechanisms fan this one source out to every host:

**Runtime adapters** call into the shared logic above and read `skills/ponytail/SKILL.md`
live:
- Claude Code / Codex / Copilot: `hooks/claude-codex-hooks.json` and
  `hooks/copilot-hooks.json` wire `SessionStart` / `SubagentStart` / `UserPromptSubmit`
  to `ponytail-activate.js` / `ponytail-subagent.js` / `ponytail-mode-tracker.js`.
  Referenced from `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`.
- OpenCode: `.opencode/plugins/ponytail.mjs` (ESM, `createRequire`s the same `hooks/*.js`
  files), injects via `experimental.chat.system.transform`.
- Pi: `pi-extension/index.js`, same shared hooks, injects via `before_agent_start`.
- Hermes: root `__init__.py` — a Python re-implementation of the same mode/config logic.
- MCP hosts: `ponytail-mcp/` (stdio server exposing a `ponytail` prompt and a
  `ponytail_instructions` tool) — for hosts whose only injection point is the prompt
  menu; it does not replace the always-on adapters above.
- Slash commands for skill-capable hosts live in `commands/*.toml` (Claude/Codex) and
  `.opencode/command/*.md` (OpenCode) — every registered command needs both.

**Static instruction-file adapters** are committed copies of one ruleset text for hosts
with no plugin/hook mechanism (Cursor, Windsurf, Cline, GitHub Copilot editor, Kiro,
Hermes rules, plus `AGENTS.md` itself, read by CodeWhale/Swival/VS Code Codex extension).
They're kept in sync two different ways — don't confuse them:
- `scripts/check-rule-copies.js` is a drift *detector* only (CI-enforced, fails on
  mismatch, does not fix): treats `AGENTS.md` as canonical and byte-compares it against
  `.cursor/rules/ponytail.mdc`, `.windsurf/rules/ponytail.md`, `.clinerules/ponytail.md`,
  `.agents/rules/ponytail.md`, `.github/copilot-instructions.md`,
  `.kiro/steering/ponytail.md`, plus ~8 pinned phrase invariants shared with the longer
  `skills/ponytail/SKILL.md`.
- `.openclaw/skills/` is actually *generated* by `scripts/build-openclaw-skills.js` from
  `skills/`, verified by `tests/openclaw-skills.test.js`.

The other five skills (`skills/ponytail-review`, `-audit`, `-debt`, `-gain`, `-help`) are
one-shot report skills with no lite/full/ultra split, each ending in a `## Boundaries`
section stating they change nothing.

Full file-to-agent mapping: `docs/agent-portability.md`.

## Tests

`tests/*.test.js` (run with plain `node --test`, no framework) each cover one concern:
`behavior.test.js` / `correctness.test.js` (ruleset-quality prompts, e.g. hardware
calibration, email validators), `commands.test.js` (every command ships both a Claude
`.toml` and an OpenCode `.md`), `hooks.test.js` / `hooks-windows.test.js` (PowerShell
`$env:` syntax, no cmd.exe `%VAR%`, no POSIX-only guards), `gemini-extension.test.js`,
`hermes-plugin.test.js`, `copilot-plugin.test.js`, `opencode-plugin.test.js` (mode
injection via `system.transform`), `openclaw-skills.test.js`, `uninstall.test.js`.
`pi-extension/test/` has its own suite, chained via `npm test --prefix pi-extension`.
