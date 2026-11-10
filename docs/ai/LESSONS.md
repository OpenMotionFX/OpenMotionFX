# Lessons

Curated. Scope: mistakes or surprises that would otherwise be repeated. Each entry states its scope, its reason and its date. Add an entry only when it would change what a future session does; remove an entry when its reason no longer holds.

## L-001 Use the PowerShell tool for command output on this laptop

- **Scope:** every shell command whose output matters, on the owner's Windows laptop.
- **Reason:** the Bash tool often returns no output here, and shell redirection into files produces empty files or adds a byte-order mark. Create files with the Write tool.
- **Date:** 2026-11-10 (carried over from earlier work on this machine).

## L-002 Every new guard rule gets a deny case and an allow case

- **Scope:** changes to `.claude/hooks/guard.mjs`.
- **Reason:** on the first run of the hook self-tests, `git config --unset core.hooksPath` was allowed although changing that setting was meant to be blocked. The case list caught it; a rule without cases would have shipped broken.
- **Date:** 2026-11-10.

## L-003 Four GitHub accounts are signed in; only one can write here

- **Scope:** every `gh` or `git push` command for this repository.
- **Reason:** the active `gh` account on this laptop cannot push to `OpenMotionFX/OpenMotionFX`. Set the token for one command with `$env:GH_TOKEN = (gh auth token --user OpenMotionFX);` and leave the active account alone, because other projects on this machine rely on it.
- **Date:** 2026-11-10.

## L-004 Research notes are leads, not facts

- **Scope:** anything taken from `docs/research/`.
- **Reason:** each note lists what it could not confirm, and one pass fetched fewer sources than it was asked to. Check a version, price or API detail yourself before building on it, and keep the claim UNVERIFIED until measured.
- **Date:** 2026-11-10.

## L-005 The pasted file names do not match their contents

- **Scope:** anyone looking for the plan documents.
- **Reason:** the file pasted as `Ideals.md` is the modular stack plan, not the ideal capture spec. Identify plan documents by their first heading. The mapping is in `docs/source/README.md`.
- **Date:** 2026-11-10.
