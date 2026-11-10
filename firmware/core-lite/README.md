# Core-lite firmware

- **Purpose:** Firmware for the ESP32-P4 boards: network time (PTP), a pulse at each whole second, the sync LED, and later Head drivers.
- **Spec:** [docs/spec/core-lite-esp32p4.md](../../docs/spec/core-lite-esp32p4.md), [docs/spec/clock-timing.md](../../docs/spec/clock-timing.md)
- **Phase:** 0 (bench and time). Not started.
- **Interfaces:** clock scheme (D-0008, proposed); Head descriptor (`schemas/`); status to `apps/set`; portable maths from `libs/timing`.
- **Verification:** none. No code. Claims C-040 to C-049 are untested.

Rules for this folder load from `.claude/rules/firmware.md`. Decisions D-0008 and D-0010 must be accepted, and the board variant known (H-004), before code is added.
