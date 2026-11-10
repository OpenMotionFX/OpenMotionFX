# OpenMotionFX

A modular capture stack for visual effects, built by one person with an AI assistant: a phone app (hero and witness modes), ESP32-P4 timing nodes on a PoE network, a motorised slider, a laptop set app and solve pipeline, and later colour, matte, removal and light tools. The plan is in `docs/source/`; one-page digests are in `docs/spec/`.

The owner cannot write or review code. You write, test and maintain all of it. The owner runs physical tests from exact steps. Every session starts with an empty context window, so the repository is the memory. Keep it correct.

## Session protocol

1. The SessionStart hook prints `docs/ai/STATE.md` and git status. If it did not, read `docs/ai/STATE.md` first.
2. Work on one task: the first item under "Next three actions" unless the owner names another.
3. Before reading anything else, open `docs/INDEX.md` and pick the one or two files the task needs.
4. Before ending: run the `end-session` skill. It updates STATE.md, adds a file in `docs/ai/LOG/`, and runs the check.

## Repo map

| Path | Holds |
| --- | --- |
| `docs/INDEX.md` | One line per topic, pointing at the file to open |
| `docs/spec/` | Digests, one page per component, every statement cited |
| `docs/source/` | Frozen plan documents and their sha256 manifest. Read-only |
| `docs/ai/` | STATE, DECISIONS, CLAIMS, HUMAN_QUEUE, BACKLOG, LESSONS, HARDWARE, TESTING, WORKFLOW, LOG/ |
| `docs/research/` | Short research notes with sources and a confidence line |
| `apps/phone`, `apps/set` | Android app; laptop set app |
| `firmware/core-lite`, `firmware/slider-head` | ESP32-P4 firmware |
| `libs/timing`, `schemas`, `solve`, `pipeline/*` | Portable timing maths; take-package and Head schemas; solve; later tools |
| `tests/hardware`, `tests/results` | Test cards for the owner; raw measured data |
| `tools/` | `check.mjs`, `doctor.mjs`, `arm.mjs`, `selftest.mjs` |
| `.claude/rules/` | Rules that load only for matching paths |
| `.claude/skills/` | Procedures: `decision-record`, `end-session`, `hardware-test-card`, `verify-claim`, `phase-exit` |
| `private/`, `reference/`, `.logs/`, `.claude/local/` | Local only, gitignored. Not for commits |

## Token rules

Scope: every session. Reason: the owner pays per token and context is finite.

- Read a digest before a source. Open `docs/source/` only for the section a digest cites.
- Use Grep before Read. Read line ranges, not whole files, except files under 100 lines.
- Do not re-read a file you just wrote or edited.
- Run independent tool calls in parallel.
- Use subagents only when the owner asks. Each one starts cold and costs a full session.
- Command output you need goes through the PowerShell tool on this machine; the Bash tool often returns nothing here. Create files with the Write tool, not shell redirection.

## Verification rules

Scope: all work. Reason: the owner cannot check code, only results.

- `node tools/check.mjs --fast` must pass before you end a turn (the Stop hook runs it). `node tools/check.mjs` must pass before a push (the pre-push hook runs it).
- No product code without its L0 to L3 tests in the same commit. Levels are in `docs/ai/TESTING.md`.
- Write the test from the spec citation before the code. Changing an existing test needs a line in DECISIONS.md or the session log.
- A capability is VERIFIED only in `docs/ai/CLAIMS.md`, with a test id and an evidence file. Everywhere else, write "untested" until then.
- Report outcomes as they are. If a check failed or a step was skipped, say so with the output.
- Quote a version or price only after checking it in this session; otherwise mark it "not checked".

## Scope rules

- Do the task in STATE.md. Put other ideas in `docs/ai/BACKLOG.md`, not in the diff. Reason: silent scope growth is the commonest way these sessions go wrong.
- A choice that later sessions must respect gets a record in `docs/ai/DECISIONS.md` (skill: `decision-record`). Choices that are hard to undo (interface freezes, licence, languages, purchases) are written as `proposed` and added to `docs/ai/HUMAN_QUEUE.md`.
- Write for a reader with no context: short, concrete, checkable sentences. Each rule states its scope and its reason.
- Use everyday words with the owner. Give each command as one copyable line, say what it does and what they should see, one action per step.

## The deferred topic

Scope: every tracked file, commit message, issue and pull request. One topic in the plans is on hold (D-0002). Passages about it read `[deferred, not yet specified]`. Do not name it, describe it or fill in the gap. The scan terms are in `.claude/local/deferred-terms.txt`, which is local only. If a scan reports a match, remove the text; do not weaken the scan. The generic idea of a pan-tilt Head is in scope.

## Guardrails (enforced by hooks, not by this file)

- Blocked for you: recursive deletes outside temp folders, `git reset --hard`, forced `git clean`, force pushes, pushes to any remote other than `OpenMotionFX/OpenMotionFX`, skipping git hooks, staging anything from `private/`, `.logs/`, `.claude/local/` or `reference/`.
- When armed, `docs/source/`, `.claude/settings.json`, `.claude/hooks/` and `.claude/local/` are read-only for you. Reason: you should not loosen your own limits by accident. If a task needs a change there, stop and ask the owner to run `node tools/arm.mjs off`, make the change, then run `node tools/arm.mjs on`.
- If a hook blocks you, read its reason and find another safe way. Do not work around it.
- The OpenCamera repository is read-only. Adopt its code only by a decision record (see `docs/spec/OPENCAMERA.md`).

## Git

- `main` always passes the check. Work on short branches named `phase-N/topic`; merge when green.
- Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `ci:`, `refactor:`), small and frequent. The commit-msg hook enforces the form.
- Tag each phase exit `phase-N-exit` after the `phase-exit` skill passes.
- After cloning: `npm ci`, then `git config core.hooksPath .githooks`.
- GitHub commands need the project account: prefix them in PowerShell with `$env:GH_TOKEN = (gh auth token --user OpenMotionFX);`. Do not switch the active `gh` account.

## Ask the owner before

Choosing a licence, making a repository public, installing software system-wide, spending money, deleting anything outside this folder, signing in. For everything else, proceed.

## Pointers

- What to do next: `docs/ai/STATE.md`. What the owner must do: `docs/ai/HUMAN_QUEUE.md`.
- How to work with the owner: `docs/ai/WORKFLOW.md`. What went wrong before: `docs/ai/LESSONS.md`.
- Toolchains: `node tools/doctor.mjs`. Hardware on the bench: `docs/ai/HARDWARE.md`.
