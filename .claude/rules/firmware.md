---
paths:
  - "firmware/**"
  - "libs/timing/**"
---

# Firmware rules

Scope: files under `firmware/` and `libs/timing/`. Digests: `docs/spec/core-lite-esp32p4.md`, `docs/spec/clock-timing.md`, `docs/spec/slider-head.md`.

- Check `docs/ai/DECISIONS.md` first: D-0008 (clock scheme) and D-0010 (C on ESP-IDF) must be `accepted` before firmware code is written. Reason: both are hard to undo.
- Keep logic that does not touch pins or ESP-IDF in plain C files with no ESP-IDF headers. Reason: only such files compile on the laptop for L1 and L2 tests.
- Every plain-C module ships with host tests (Unity) in the same commit. Reason: `docs/ai/TESTING.md`, rule 1.
- Times are integer nanoseconds on a named clock. Do not use floating-point seconds for timestamps. Reason: rounding breaks microsecond comparisons.
- Do not choose a GPIO pin until `docs/ai/HARDWARE.md` names the exact board variant. Reason: variants differ and a wrong pin can damage a board.
- Do not flash a board or change wiring yourself. Write a test card with the `hardware-test-card` skill and add it to the human queue. Reason: only the owner can touch hardware.
- A timing number goes into a document only with its test id and raw capture in `tests/results/`. Reason: unmeasured timing figures are the plan's biggest risk.
- Quote an ESP-IDF or component version only after checking it in the session (`idf.py --version`, the component registry page). Reason: research notes may be stale.
- This firmware never sends commands to third-party stunt, rigging or motion-control systems; it may only read them. Reason: stakeholder safety rule in `docs/spec/system-overview.md`.
