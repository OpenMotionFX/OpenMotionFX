# Light

- **Purpose:** Light passes and HDRI, coded LED light, per-light layers from witness frames, and relighting.
- **Spec:** [docs/spec/light.md](../../docs/spec/light.md)
- **Phase:** 6. Not started.
- **Interfaces:** LED coding runs on `firmware/core-lite`; reads witness frames from take packages; writes light layers into the take package.
- **Verification:** none. No code. Claim C-049 is untested.

Rules for this folder load from `.claude/rules/laptop.md`.
