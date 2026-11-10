# Timing library

- **Purpose:** Portable timing maths with no hardware calls: clock mapping, pulse scheduling, LED-blink-to-row timing. It exists so this logic can be tested on the laptop.
- **Spec:** [docs/spec/clock-timing.md](../../docs/spec/clock-timing.md)
- **Phase:** 0 (bench and time). Not started.
- **Interfaces:** used by `firmware/core-lite`, `firmware/slider-head` and `solve`; follows the clock scheme (D-0008, proposed).
- **Verification:** none. No code.

Rules for this folder load from `.claude/rules/firmware.md`. Every function here ships with L1 tests and, where two clocks meet, an L2 simulation.
