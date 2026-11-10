# Decision records

Append-only. Scope: every choice a later session must not silently undo. To change a decision, add a new record that supersedes the old one and set the old one's status to `superseded`; do not rewrite history. Use the `decision-record` skill. Status is one of `accepted`, `proposed`, `superseded`, `rejected`. A `proposed` record is not in force: it waits for the owner in [HUMAN_QUEUE.md](HUMAN_QUEUE.md).

## D-0001 Node.js is the one scripting language for hooks and tools

- **Status:** accepted (2026-11-10)
- **Context:** The owner's machine is Windows 11 with PowerShell 5.1. `node` 24 and `git` are on PATH. `python` on PATH is only the Microsoft Store stub; the real Python lives inside the ESP-IDF environment. CI runs on Linux.
- **Decision:** Hooks and repository tools are Node.js ES modules (`.mjs`) run as `node tools/<name>.mjs`. One development dependency is allowed, `yaml` 2.9.1 (version checked with `npm view` on 2026-11-10), because Node has no YAML parser. Run `npm ci` once after cloning.
- **Consequences:** The same scripts run on Windows and in CI. There is no bare `tools/check` command; the entry point is `node tools/check.mjs`. Product code is free to use other languages.
- **Spec:** none; this is tooling.

## D-0002 A deferred topic stays out of git

- **Status:** accepted (2026-11-10)
- **Context:** The owner put one topic in the plans on hold until it is proven to work. Nothing about it may reach git: files, commit messages, issues or CI output.
- **Decision:** Untouched originals live in `private/` (gitignored). `docs/source/` holds redacted copies where each deferred passage reads `[deferred, not yet specified]`. The scan terms live only in `.claude/local/deferred-terms.txt` (gitignored). `tools/check.mjs`, the pre-commit hook and the commit-msg hook scan for them locally. CI has no terms file, so it skips that scan with a warning. The generic idea of a pan-tilt Head stays in scope.
- **Consequences:** A clone on another machine cannot run the deferred scan until the owner copies the terms file. Tracked files refer to "the deferred topic" and never name it. Phase 3's first implementation is unspecified in this repository.
- **Spec:** (solo § Phase 3)

## D-0003 Plan documents are frozen; digests cite them by heading

- **Status:** accepted (2026-11-10)
- **Context:** Three plan documents were supplied: the modular stack plan, the solo build plan and the stakeholder review. The ideal capture spec and the scenario tests were expected or referenced but not supplied. Together the three files cost about 17,000 tokens to read.
- **Decision:** The files are stored byte-for-byte in `docs/source/` with a sha256 manifest. Sessions read one-page digests in `docs/spec/`. Every digest statement carries a citation: `(stack § Heading)`, `(solo § Heading)`, `(review § Heading)`, `(research NN)` or `(D-NNNN)`. The heading text may be shortened to a prefix. `tools/check.mjs` verifies each citation.
- **Consequences:** A digest cannot drift from its source without a failing check. Missing documents are recorded as gaps and are not reconstructed from memory.
- **Spec:** (solo § Principles kept)

## D-0004 Commits use the project account's GitHub no-reply address

- **Status:** accepted (2026-11-10)
- **Context:** The remote repository is public. The machine's global git email is the owner's personal address.
- **Decision:** This repository sets a local identity: name `OpenMotionFX`, email `300135824+OpenMotionFX@users.noreply.github.com`. Global git settings are not changed.
- **Consequences:** Commits link to the OpenMotionFX GitHub account and the personal address is not published by this repository. Reversible with `git config user.email`.
- **Spec:** none; this is repository hygiene.

## D-0005 One repository, one folder per component

- **Status:** accepted (2026-11-10)
- **Context:** The plan spans a phone app, firmware, a laptop app, a solve pipeline and schemas, all sharing the take package and clock scheme.
- **Decision:** Monorepo. Folders: `apps/phone`, `apps/set`, `firmware/core-lite`, `firmware/slider-head`, `libs/timing`, `schemas`, `solve`, `pipeline/colour-mattes`, `pipeline/removal`, `pipeline/light`, `tests/hardware`, `tests/results`, `tools`. Each component has a README of at most 20 lines.
- **Consequences:** Interface changes and their users change in one commit. Folder names can still change cheaply while they hold no code.
- **Spec:** (solo § Principles kept)

## D-0006 Five test levels; no code without its L0 to L3 tests

- **Status:** accepted (2026-11-10)
- **Context:** All code is written by an AI assistant and the owner cannot review it. Hardware tests need the owner's hands.
- **Decision:** Levels L0 static, L1 unit, L2 simulation, L3 contract, L4 hardware, as defined in [TESTING.md](TESTING.md). Hardware-independent logic lives in portable modules that run on the laptop. Firmware logic is plain C with no ESP-IDF headers, tested on a host with Unity. Android logic is tested on the JVM with JUnit. Python uses pytest and ruff; the type checker is chosen with the first Python commit. All three languages validate the same fixture files against the same JSON Schemas.
- **Consequences:** Most defects are caught without hardware. This machine has no C compiler on PATH, so host C tests need one (H-011) or run only in CI.
- **Spec:** (solo § Principles kept)

## D-0007 CI is one always-on check job; heavy jobs arrive with their code

- **Status:** accepted (2026-11-10)
- **Context:** A workflow skipped by a path filter leaves a required check pending. Public repositories get free standard runners.
- **Decision:** `.github/workflows/check.yml` runs `node tools/check.mjs` on Ubuntu from a clean checkout on every push and pull request. It uses `actions/checkout@v7` and `actions/setup-node@v7` (v7.0.1 and v7.1.0 were the latest releases on 2026-11-10, read from the GitHub API). Firmware, Android and Python workflows are added with the first code in each folder, each with path filters. Only `check` is ever a required status.
- **Consequences:** CI cannot run the deferred-topic scan (D-0002). Android emulator and hardware tests stay out of CI.
- **Spec:** none; this is tooling.

## D-0008 Clock scheme v0: named clocks, integer nanoseconds, sync events

- **Status:** proposed (2026-11-10)
- **Context:** The clock scheme is one of four interfaces to freeze first. Phones cannot be hardware-synced; their clock is mapped to PTP time by a blinking LED.
- **Decision:** Every stream names the clock it is stamped in (for example `ptp`, `phone:<device>`). Times are integer nanoseconds. No stream is rewritten onto another clock at capture time; a sync-events record holds the measured mapping between clocks. On the wire, the P4s run hardware-timestamped PTP and raise a pulse at each whole PTP second.
- **Consequences:** Raw data stays honest and a better mapping can be recomputed later. Clock names and units are hard to change once takes exist. Needs the owner's acceptance (H-002).
- **Spec:** (solo § Phase 0)

## D-0009 Take package v0: a folder with one versioned manifest and JSON Schema

- **Status:** proposed (2026-11-10)
- **Context:** The take package is the format every device writes and every tool reads. Research found no existing open container that covers it.
- **Decision:** A take is a folder with a manifest `take.json` (`schema_version` in semver; clocks, devices, streams with relative paths) validated by JSON Schema draft 2020-12. Readers accept the same major version and ignore unknown fields. IMU logs use Gyroflow `.gcsv`. Checksums use ASC MHL. Exports to OpenUSD, OpenEXR and OpenTimelineIO are separate from the capture layout.
- **Consequences:** Folder names, path rules and time units become hard to change once files exist. Needs the owner's acceptance (H-002).
- **Spec:** (solo § Phase 0)

## D-0010 Firmware is C on ESP-IDF, starting from the official PTP example

- **Status:** proposed (2026-11-10)
- **Context:** The P4's PTP support exists as an official ESP-IDF example and as the community component `esp_ptp` 1.14.0 (Apache-2.0). An ESP-IDF 5.5 environment is already installed on this machine. The exact board variant is unknown (H-004).
- **Decision:** Write firmware in C on ESP-IDF. Start from the official PTP example and add `esp_ptp` only if the example falls short. Try the installed 5.5 environment first; move to v6.1 only if the example needs it. Keep pin-free logic in plain C modules shared with host tests.
- **Consequences:** Firmware language is costly to change later. Needs the owner's acceptance (H-002).
- **Spec:** (solo § Phase 0)

## D-0011 Laptop code (set app, solve, pipeline) is Python

- **Status:** proposed (2026-11-10)
- **Context:** The plan names OpenCV, Gyroflow, structure-from-motion, segmentation and OpenColorIO as tools to reuse; most have Python bindings. Blender and Resolve scripting are Python.
- **Decision:** `apps/set`, `solve` and `pipeline/*` are Python 3.12 or newer, in a project virtual environment, with pytest and ruff.
- **Consequences:** A real Python interpreter must be set up for the project before Phase 0 code (the PATH one is a stub). Needs the owner's acceptance (H-002).
- **Spec:** (solo § Principles kept)

## D-0012 The phone app is a new app that copies proven parts of the reference app

- **Status:** proposed (2026-11-10)
- **Context:** The reference app (MIT) has the camera, IMU and remote pieces but no tests, and its record logic sits in the UI layer.
- **Decision:** Build `apps/phone` as a new Kotlin app. Copy a reference module only when a decision record names it, with its MIT notice kept and its L1 tests added in the same commit. The verification suite is built before features.
- **Consequences:** Slower start than forking, but every adopted part arrives tested. Needs the owner's acceptance (H-002).
- **Spec:** (solo § Verification suite)

## D-0013 Licence: Apache-2.0 for code, CC BY 4.0 for documents

- **Status:** proposed (2026-11-10)
- **Context:** The owner has not chosen a licence. The reference app is MIT and `esp_ptp` is Apache-2.0, both compatible with Apache-2.0. Reviewers want an open take-package format; the competitor review warns that an open Head specification helps cloners.
- **Decision:** Recommend Apache-2.0 for code (it adds a patent grant that MIT lacks) and CC BY 4.0 for specifications and documents. Hardware designs are decided later, before Phase 7.
- **Consequences:** Until the owner decides, the README says "licence pending" and the repository grants no rights. Only the owner can choose (H-001).
- **Spec:** (review § Competitors and cloners)
