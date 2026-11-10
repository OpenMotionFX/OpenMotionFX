---
paths:
  - "apps/set/**"
  - "solve/**"
  - "pipeline/**"
---

# Laptop code rules

Scope: files under `apps/set/`, `solve/` and `pipeline/`. Digests: `docs/spec/set-app-solve.md`, `docs/spec/colour-keys-mattes.md`, `docs/spec/removal.md`, `docs/spec/light.md`.

- Check `docs/ai/DECISIONS.md` first: D-0011 (Python) must be `accepted` before code is written here.
- The `python` on PATH is a Microsoft Store stub. Use a project virtual environment and record its creation command in the component README. Reason: a stub interpreter fails without a clear error.
- Reuse existing tools (Gyroflow, OpenCV, OpenColorIO, structure-from-motion, segmentation) through their documented interfaces. Build only sync, registry, fusion and glue. Reason: plan principle "write the glue nobody else has".
- A third-party model or plugin is optional and loaded behind an interface. Record its licence in the component README before first use. Reason: plan principle "watch licences".
- Solvers read take packages through the schema in `schemas/`. They do not read a device's private files. Reason: the take package is a frozen interface.
- Every solver ships with a recorded fixture and an L1 or L2 test that reproduces a known answer. Reason: `docs/ai/TESTING.md`, rule 1.
- A removal, key or relight output always ships with its matte and can be switched off. Reason: `docs/spec/removal.md`, "Rules for any removal".
- Report a confidence value where the data was thin. Do not fill gaps silently. Reason: stakeholders asked for honest confidence maps.
- Heavy ML runs on the laptop GPU or a rented one. Ask the owner before any paid service. Reason: spending needs approval.
