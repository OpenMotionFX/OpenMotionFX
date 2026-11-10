# Set app

- **Purpose:** The laptop program that shows every device and its sync status, issues take IDs, controls the slider and later holds the registry.
- **Spec:** [docs/spec/set-app-solve.md](../../docs/spec/set-app-solve.md)
- **Phase:** 0 for the first status view; grows through phases 1, 5 and 6. Not started.
- **Interfaces:** talks to `firmware/core-lite` over the wired network; sends take ID and mode to `apps/phone`; reads Head descriptors (`schemas/`).
- **Verification:** none. No code.

Rules for this folder load from `.claude/rules/laptop.md`. Decision D-0011 must be accepted before code is added.
