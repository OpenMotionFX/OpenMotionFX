# OpenMotionFX

An open, modular capture stack for visual effects, built at solo scale first: a phone as the hero camera, a second mode of the same app for witness phones, two ESP32-P4 boards keeping network time, a motorised slider, and a laptop that controls the set and solves the data. Later phases add colour and matte tools, rig removal and light measurement.

The long-term idea is one brain design (the Core), one connector, one clock and one data model, with specialised Heads that plug in. The plan documents are in [docs/source/](docs/source/README.md).

## Status

**Planning and scaffolding only. There is no product code yet, and nothing has been tested.**

- Phase 0 (bench and network time) has not started.
- Every capability the plan relies on is listed in [docs/ai/CLAIMS.md](docs/ai/CLAIMS.md). All are unverified.
- Several design choices are proposals waiting for the owner; see [docs/ai/DECISIONS.md](docs/ai/DECISIONS.md).
- One topic in the plans is on hold and appears as `[deferred, not yet specified]`.

## Following progress

- [docs/ai/STATE.md](docs/ai/STATE.md): where things stand and the next three actions.
- [docs/INDEX.md](docs/INDEX.md): a map of every document.
- GitHub milestones are the eight phases of the plan; issues are the deliverable groups in each phase.
- A capability counts as working only when [docs/ai/CLAIMS.md](docs/ai/CLAIMS.md) says VERIFIED and points at measured data.

## How this repository is built

All code is written and maintained by an AI assistant (Claude Code) working for one owner who runs the physical tests. The repository is set up so that each session can start with no memory: state, decisions, claims and lessons are files, and a single command checks them.

```text
npm ci
git config core.hooksPath .githooks
node tools/check.mjs
```

The last line should end with `CHECK PASSED`.

## Licence

Licence pending. Until the owner chooses one, no rights are granted to use, copy or distribute this work.
