# Schemas

- **Purpose:** The frozen interfaces as JSON Schemas: take package, Head descriptor, and later the plugin contract. Example files for contract tests live in `schemas/fixtures/`.
- **Spec:** [docs/spec/take-package.md](../docs/spec/take-package.md), [docs/spec/clock-timing.md](../docs/spec/clock-timing.md)
- **Phase:** 0, "Specify". Not started.
- **Interfaces:** read by every component. This folder is the single source; no component keeps its own copy.
- **Verification:** none. No schema exists yet.

Rules for this folder load from `.claude/rules/schemas.md`. Decisions D-0008 and D-0009 must be accepted before a schema is written.
