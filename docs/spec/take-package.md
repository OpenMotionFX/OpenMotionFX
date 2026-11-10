# Take package (digest)

The folder one recorded take is saved as. Status: **not specified yet**. Version 0 is a Phase 0 deliverable and D-0009 is a proposal awaiting the owner.

## What the plans require

- Take package v0 is specified in Phase 0, before features (solo § Phase 0)
- It is one of four interfaces written first and never broken (solo § Principles kept)
- Hero and witness modes of the phone app write the same take-package format (solo § The phone app)
- The take-package writer is built in Phase 2 (solo § Phase 2)
- Ingest pulls local recordings, verifies them and builds the take package (stack § Software stack)
- Internally one stream format, timestamped per row and per sample, with calibration attached (stack § Software stack)
- On export: OpenUSD for the scene, multi-part and deep OpenEXR for images and light layers, ACES colour, OpenTimelineIO for editorial (stack § Software stack)

## What it must hold at solo scale

- Per-frame metadata log, IMU log, sync events and a take ID from the set brain (solo § The phone app)
- Per frame: sensor timestamp and clock source, exposure, frame duration, ISO, focus distance, focal length, aperture, crop region, stabilisation modes, lens calibration, colour gains and matrix, shading map (solo § The "software encoders")
- Slider steps and encoder readings stamped in PTP time (solo § Phase 1)
- Later: mattes, depth, EXR and Cryptomatte layers (solo § Phase 4)

## What users of the data asked for

- An open take-package format, per-pixel provenance, every removal with its matte and an off switch (review § Stakeholder review)
- Light proxies by default and heavy data on request (review § VFX artist)
- A "small" export that fits on drives a crew already carries (review § Small crew)
- Formats openly documented and the solve reproducible (review § Big production)

## Proposed shape (not accepted)

- One manifest `take.json` with a semver `schema_version`, named clocks, devices and streams that point at files by relative path (D-0009)
- Time is integer nanoseconds on a named clock; a sync-events file maps one clock to another (D-0008)
- Validated with JSON Schema draft 2020-12; checksums through ASC MHL instead of a home-made list (research 04)
- IMU logs in Gyroflow `.gcsv` (research 04)
- No existing open container covers this scope; OpenTrackingIO covers live camera and lens metadata only (research 04)

## Hard to change once files exist

- Folder names, stream path rules, clock names and units, the time epoch, per-frame file formats (research 04)

## Tests this component needs

- L3 contract tests: example packages validated against the schema, golden files compared byte for byte (D-0006)
