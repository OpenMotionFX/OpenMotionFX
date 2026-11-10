# Documentation index

One line per topic. Open only the file the task needs.

## Start here

- Where the project stands and what is next: [ai/STATE.md](ai/STATE.md)
- What only the owner can do: [ai/HUMAN_QUEUE.md](ai/HUMAN_QUEUE.md)

## Specification digests (read these, not the sources)

- The whole system, phases, principles: [spec/system-overview.md](spec/system-overview.md)
- The folder a take is saved as: [spec/take-package.md](spec/take-package.md)
- PTP, pulses, mapping the phone clock: [spec/clock-timing.md](spec/clock-timing.md)
- ESP32-P4 firmware, Phase 0: [spec/core-lite-esp32p4.md](spec/core-lite-esp32p4.md)
- The slider, Phase 1: [spec/slider-head.md](spec/slider-head.md)
- The Android app, hero and witness modes, verification suite: [spec/phone-app.md](spec/phone-app.md)
- The laptop set app and solve pipeline: [spec/set-app-solve.md](spec/set-app-solve.md)
- Colour transforms, keying, mattes, Phase 4: [spec/colour-keys-mattes.md](spec/colour-keys-mattes.md)
- Removing rigs, witnesses, registry, Phase 5: [spec/removal.md](spec/removal.md)
- Coded light and relighting, Phase 6: [spec/light.md](spec/light.md)
- The existing camera app kept as reference: [spec/OPENCAMERA.md](spec/OPENCAMERA.md)

Citation forms inside digests: `(stack § Heading)`, `(solo § Heading)` and `(review § Heading)` point at a heading in a frozen source; `(research NN)` points at a research note; `(D-NNNN)` points at a decision record. The heading may be shortened to its first words.

## Frozen sources (open only for a cited section)

- Folder rules, gaps and file keys: [source/README.md](source/README.md)

## Project memory

- Decisions and proposals: [ai/DECISIONS.md](ai/DECISIONS.md)
- Every capability claim and whether it is measured: [ai/CLAIMS.md](ai/CLAIMS.md)
- Bench inventory and unknowns: [ai/HARDWARE.md](ai/HARDWARE.md)
- Test levels and rules: [ai/TESTING.md](ai/TESTING.md)
- How the owner and the assistant work together: [ai/WORKFLOW.md](ai/WORKFLOW.md)
- Ideas that are out of scope for now: [ai/BACKLOG.md](ai/BACKLOG.md)
- Mistakes worth not repeating: [ai/LESSONS.md](ai/LESSONS.md)
- Session logs, one file per session: `ai/LOG/`

## Research notes (2026-11-10)

- Reference app inventory: [research/01-opencamera.md](research/01-opencamera.md)
- ESP32-P4 PTP, pulses, host testing: [research/02-esp32-p4-timing.md](research/02-esp32-p4-timing.md)
- Android camera timestamps and metadata: [research/03-android-timing.md](research/03-android-timing.md)
- Take-package prior art: [research/04-take-package.md](research/04-take-package.md)
- Test and CI strategy: [research/05-test-ci-strategy.md](research/05-test-ci-strategy.md)

## Tools

- Verify everything: `node tools/check.mjs` (add `--fast` for the quick set)
- Which toolchains are installed: `node tools/doctor.mjs`
- Guardrail state: `node tools/arm.mjs status`
