# Backlog

Ideas that are out of scope for the current task. Scope: anything a session thinks of but was not asked to do. Reason: ideas kept here do not leak into the diff. An item moves to STATE.md only when the owner or a phase plan calls for it. Add new items at the bottom with the date.

- 2026-11-10: Protect `main` on GitHub so the `check` job must pass before a merge. Needs the owner's nod because it changes repository settings.
- 2026-11-10: Add a markdown formatter and a spell check to L0 once the documents settle.
- 2026-11-10: Validate JSON files against JSON Schemas inside `tools/check.mjs` when the first schema lands (add `ajv` or reuse the Python validator; decide then).
- 2026-11-10: Path-filtered CI workflows for firmware, Android and Python, added with the first code in each folder (D-0007).
- 2026-11-10: Check external links in documents on a schedule, not on every push, because outside sites fail at random.
- 2026-11-10: Fetch the specifications the research pass did not read: OpenUSD, Cryptomatte, OpenColorIO and ACES, ASC MHL file naming (research note 04, "Not verified").
- 2026-11-10: Confirm Android details the research pass could not: exact SENSOR_TIMESTAMP wording, skew units, OIS sample fields, the concurrent-camera API (research note 03).
- 2026-11-10: Find out how the official ESP-IDF PTP example makes its pulse and what jitter to expect (research note 02).
- 2026-11-10: A printed calibration target and a screen-as-target routine for lens calibration (solo plan, New possibilities).
- 2026-11-10: A second copy of `.claude/local/deferred-terms.txt` kept by the owner somewhere safe, so a new machine can run the deferred scan.
- 2026-11-10: Test whether the P4 hardware video encoder and a camera module make a usable witness (claims C-046, C-047).
