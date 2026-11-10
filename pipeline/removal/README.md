# Removal

- **Purpose:** Take stands and rigs out of a shot using witness views, the set reconstruction and the slider's clean passes. Every removal ships with its matte and an off switch.
- **Spec:** [docs/spec/removal.md](../../docs/spec/removal.md)
- **Phase:** 5. Not started.
- **Interfaces:** reads take packages and the registry from `apps/set`; needs the camera path from `solve` and mattes from `pipeline/colour-mattes`.
- **Verification:** none. No code.

Rules for this folder load from `.claude/rules/laptop.md`.
