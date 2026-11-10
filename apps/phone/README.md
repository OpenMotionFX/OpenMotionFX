# Phone app

- **Purpose:** One Android app with two modes: hero (best image) and witness (best measurement). Both write the same take package.
- **Spec:** [docs/spec/phone-app.md](../../docs/spec/phone-app.md), reference app notes in [docs/spec/OPENCAMERA.md](../../docs/spec/OPENCAMERA.md)
- **Phase:** 2 (app verification and sync). Not started.
- **Interfaces:** writes take packages (`schemas/`); reads take ID and mode from the set app; films the sync LED driven by `firmware/core-lite`.
- **Verification:** none. No code. Every related claim (C-001 to C-032) is untested.

Rules for this folder load from `.claude/rules/phone-app.md`. Decision D-0012 must be accepted before code is added.
