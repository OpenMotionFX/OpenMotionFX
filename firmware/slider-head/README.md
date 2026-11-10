# Slider Head firmware

- **Purpose:** Motor control and encoder reading for the one-axis slider, with every step and reading stamped in network time.
- **Spec:** [docs/spec/slider-head.md](../../docs/spec/slider-head.md)
- **Phase:** 1 (slider Head). Not started.
- **Interfaces:** runs on `firmware/core-lite`; announces itself with a Head descriptor (`schemas/`); takes keyframe moves from `apps/set` and the phone app's remote API.
- **Verification:** none. No code. Claims C-060 to C-065 are untested.

Rules for this folder load from `.claude/rules/firmware.md`. The motor, driver and encoder are unidentified (H-005, H-006, H-008).
