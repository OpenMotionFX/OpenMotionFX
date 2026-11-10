---
paths:
  - "tests/**"
---

# Test folder rules

Scope: files under `tests/`. Full strategy: `docs/ai/TESTING.md`.

- `tests/hardware/` holds L4 test cards only, one file per test, named `T-NNN-short-name.md`. Write them with the `hardware-test-card` skill. Reason: the owner follows them step by step.
- A card has: purpose, the claim ids it tests, equipment, numbered steps with one action each, what to record, pass numbers. Reason: the owner is not a programmer and cannot guess a missing step.
- A step that could damage hardware or needs mains power says so in the step itself. Reason: safety must not depend on reading another section.
- `tests/results/<test-id>/` holds the raw data the owner reports, unedited, plus a short `README.md` with the date, who ran it and the device builds. Reason: evidence must be re-checkable.
- Do not edit raw results. Put analysis in a separate file next to them. Reason: edited evidence is not evidence.
- Results never include faces, private messages or location data. Crop or ask the owner for a new capture. Reason: this repository is public.
- Large captures (video, RAW frames) are not committed. Store a checksum and a small extract; keep the full file in `private/`. Reason: `.gitignore` excludes media and the repository must stay small.
- After storing results, update `docs/ai/CLAIMS.md` with the `verify-claim` skill.
