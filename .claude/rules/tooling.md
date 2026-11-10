---
paths:
  - "tools/**"
  - ".claude/**"
  - ".githooks/**"
  - ".github/**"
---

# Tooling and guardrail rules

Scope: `tools/`, `.claude/`, `.githooks/` and `.github/`.

- Tools and hooks are Node.js ES modules with no dependencies except `yaml`. Reason: D-0001; they must run on Windows and in Linux CI.
- A new check in `tools/lib/checks.mjs` gets a broken-input case in `tools/selftest.mjs` in the same commit. Reason: a check that cannot fail proves nothing.
- A new or changed rule in `.claude/hooks/guard.mjs` gets a deny case and an allow case in `.claude/hooks/selftest.mjs`. Reason: lesson L-002.
- `tools/check.mjs` prints at most 30 lines and writes the full report to `.logs/`. Reason: check output lands in the context window.
- Do not write hook settings from memory. Read the current pages at `https://code.claude.com/docs/en/hooks` and `/settings` first. Reason: the schema changes between versions.
- When the guardrails are armed, `.claude/settings.json`, `.claude/hooks/` and `.claude/local/` cannot be edited. Stop and ask the owner to run `node tools/arm.mjs off`. Arm again as the last act: `node tools/arm.mjs on`.
- Do not weaken a scan, a limit or a guard rule to make a failure go away. Fix the cause, or record a decision that the owner accepts. Reason: the guardrails exist for the sessions that would loosen them.
- The deferred-topic terms stay in `.claude/local/deferred-terms.txt` only. Do not copy a term into a tracked file, a test or a message. Reason: D-0002.
- CI workflows pin actions to a major version that was checked in the session, and use Linux runners. Reason: D-0007.
- Issue and pull-request text follows the same deferred-topic and "untested" rules as documents. Reason: GitHub text is public.
