# Solve

- **Purpose:** Laptop programs that turn take packages into results: the LED-to-rolling-shutter sync solver, then the camera path from encoder plus gyro, later refinement against the image.
- **Spec:** [docs/spec/set-app-solve.md](../docs/spec/set-app-solve.md)
- **Phase:** 2 for the sync solver; 3 for the full camera path. Not started.
- **Interfaces:** reads take packages through `schemas/`; uses `libs/timing`; writes results back into the take package.
- **Verification:** none. No code. Claims C-020, C-022 and C-065 are untested.

Rules for this folder load from `.claude/rules/laptop.md`. Decision D-0011 must be accepted before code is added.
