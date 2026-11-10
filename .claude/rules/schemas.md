---
paths:
  - "schemas/**"
---

# Schema rules

Scope: files under `schemas/`. Digests: `docs/spec/take-package.md`, `docs/spec/clock-timing.md`.

- Check `docs/ai/DECISIONS.md` first: D-0008 and D-0009 must be `accepted` before a schema is written.
- Schemas use JSON Schema draft 2020-12. Reason: D-0009; validators exist for Python, Node and Kotlin.
- Every schema has a versioned `$id` and the data carries `schema_version` in semver. Reason: readers must be able to refuse a file they cannot understand.
- Compatibility rule: a reader accepts the same major version and ignores unknown fields. A change that breaks an old reader is a major bump and needs a decision record marked `proposed` plus a human-queue item. Reason: the plan says these interfaces are frozen first and never broken.
- Every schema ships with at least one valid and one invalid example in `schemas/fixtures/`, and an L3 test that checks both. Reason: a schema with no failing example is untested.
- Fixtures are the single source for all languages. Do not copy them into another folder. Reason: copies drift.
- Field names and units are stated in the schema's `description`. Times are integer nanoseconds with the clock named. Reason: D-0008.
- A golden file changes only together with a line in the session log saying why. Reason: `docs/ai/TESTING.md`, "tests changed to make them pass".
