# Testing strategy

Scope: all product code in this repository. Reason: the owner cannot read code, so tests and measurements are the only proof that it works (D-0006).

## Levels

| Level | What | Runs where | Needs the owner |
| --- | --- | --- | --- |
| L0 static | Format, lint, types | Laptop and CI | No |
| L1 unit | Hardware-independent logic: timing maths, parsers, schema code | Laptop and CI | No |
| L2 simulation | Fake clocks, two simulated nodes, recorded fixtures | Laptop and CI | No |
| L3 contract | Take package and Head descriptor against schemas; golden files | Laptop and CI | No |
| L4 hardware | Real boards, slider, phone | The bench | Yes |

## Rules

1. **No code without its L0 to L3 tests in the same commit.** Reason: a later session has no memory of what was left untested.
2. **Keep logic portable.** Timing maths, parsers and schema code live in modules with no hardware calls (`libs/timing`, plain-C firmware modules, plain Kotlin classes). Reason: only portable code can run at L1 and L2.
3. **One set of fixtures.** Example take packages and descriptors live in `schemas/fixtures/`. Every language validates the same files. Reason: three private copies drift apart.
4. **L4 tests are test cards** in `tests/hardware/`, written with the `hardware-test-card` skill: purpose, equipment, numbered steps with one action each, what to record, pass numbers.
5. **Results are data.** When the owner reports results, store the raw files in `tests/results/<test-id>/` and update [CLAIMS.md](CLAIMS.md) with the `verify-claim` skill.
6. **A claim is VERIFIED only with measured evidence.** Until then every document says "untested".
7. **`main` always passes `node tools/check.mjs`.** CI runs it from a clean clone.

## Frameworks (chosen when the first code of each kind lands)

- Firmware logic: plain C compiled for the host, Unity test framework.
- Android: JUnit on the JVM. Robolectric only if a test truly needs Android classes. No emulator jobs in CI.
- Python: pytest and ruff; one type checker picked with the first Python commit.
- Schemas: JSON Schema draft 2020-12, validated in every language against the shared fixtures.

## Usual AI coding failures and the countermeasure for each

| Failure | Countermeasure |
| --- | --- |
| Tests written to fit the code | Write the test from the spec citation first, see it fail, then write the code. The commit message names the citation. |
| Tests changed to make them pass | Changing or deleting an existing test needs a line in [DECISIONS.md](DECISIONS.md) or the session log saying why. |
| Mocks that hide the real interface | Mock only at a boundary defined by a schema or header. Each fake is checked against the same contract fixtures as the real thing (L3). |
| Claims without evidence | CLAIMS.md is the only place a capability becomes VERIFIED, and the check demands an evidence file. |
| Silent scope growth | One task per session, named in STATE.md. Extra ideas go to [BACKLOG.md](BACKLOG.md), not into the diff. |
| Drift from the spec | Digests cite source headings and the check verifies them. Code comments cite the digest section they implement. |
| "Works on my machine" | CI runs from a clean clone on Linux; the laptop is Windows. Both must pass. |
| A check that cannot fail | Every new check gets a broken-input case in `tools/selftest.mjs` in the same commit. |
| Hardware assumed, not measured | Unknowns stay "UNKNOWN" in [HARDWARE.md](HARDWARE.md) until the owner reads a label or runs a card. |

## Proving a check can fail

`node tools/selftest.mjs` copies the repository to a temp folder, breaks one thing per case and confirms the matching check fails. It runs inside the full `node tools/check.mjs`. Guard hook cases live in `.claude/hooks/selftest.mjs`.

## What the owner does for an L4 test

1. Open the test card named in the human queue.
2. Follow the numbered steps, one action each.
3. Paste the recorded numbers or files into a session. The session stores them and updates the claim.
