# State

Updated: 2026-11-10 (setup session). Keep this file at 60 lines or fewer.

## Phase

Setup is complete. Phase 0 (bench and time) has not started. No product code exists.

## In flight

Nothing. The setup session ended with a clean working tree.

## Next three actions

1. Record the owner's answers to H-001 and H-002 (licence and five proposed decisions) in `docs/ai/DECISIONS.md` and `docs/ai/HUMAN_QUEUE.md`.
2. Record the owner's hardware answers (H-004 to H-010) in `docs/ai/HARDWARE.md`.
3. First work session, Phase 0 "Specify": write take package v0 and Head descriptor v0 as JSON Schemas in `schemas/` with fixtures and L3 tests, from `docs/spec/take-package.md`. This needs D-0008 and D-0009 accepted first.

## Blockers

- D-0008 to D-0012 are `proposed`. Phase 0 firmware work waits on D-0008 and D-0010.
- The exact ESP32-P4 board variant is unknown (H-004), so no pin can be chosen.
- No C compiler on the laptop (H-011): firmware logic tests cannot run locally yet.
- The ideal capture spec and scenario tests were not supplied (H-003).

## Facts a new session needs

- Check: `node tools/check.mjs --fast` (quick) or `node tools/check.mjs` (full). After a fresh clone run `npm ci` first.
- GitHub: remote `origin` is `https://github.com/OpenMotionFX/OpenMotionFX` (public). Use the token of the `OpenMotionFX` account per command; see CLAUDE.md, section Git.
- Milestones "Phase 0" to "Phase 7" and one issue per deliverable group exist on GitHub.
- Guardrails are armed. To change hooks, settings or frozen sources, the owner runs `node tools/arm.mjs off` first.
- Every claim in `docs/ai/CLAIMS.md` is UNVERIFIED.
