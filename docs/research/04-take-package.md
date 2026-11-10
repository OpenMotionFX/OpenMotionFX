# Take package prior art

## Decision this feeds
Layout of take package v0 and its JSON Schema manifest.

## Findings
- ASC MHL: `ascmhl` folder; tool commands create, flatten, diff, info; hashes xxh128, xxh3, xxh64, md5, sha1, c4. https://github.com/ascmitc/mhl
- Gyroflow .gcsv: text header (version 1.3, id, orientation), `tscale` (t to seconds), `gscale` (rad/s), columns t,gx,gy,gz; named like the video. https://docs.gyroflow.xyz/app/technical-details/gcsv-format
- OpenTrackingIO (SMPTE RIS): camera/lens metadata sent live; per-frame values, camelCase JSON. Not a take container: no gyro, encoder, calibration or file layout. https://github.com/SMPTE/ris-osvp-metadata-camdkit
- OpenTimelineIO: cut order and links to outside media only. https://github.com/AcademySoftwareFoundation/OpenTimelineIO
- OpenEXR: multi-part, multi-channel files; latest 3.4.18 (7 Nov 2026). https://openexr.com/en/latest/
- JSON Schema current draft: 2020-12. https://json-schema.org/specification
- Validators with 2020-12: Python `jsonschema`; Node `ajv`, `@hyperjump/json-schema`; Java/Kotlin `networknt json-schema-validator` (2.x Java 8+, 3.x Java 17+). https://github.com/python-jsonschema/jsonschema https://github.com/networknt/json-schema-validator https://json-schema.org/tools
- No open take/shot container covering this scope was found.

## Recommendation
1. Layout: `take.json`, `checksums/`, `video/<cam>/`, `raw/<cam>/`, `meta/<cam>/frames.jsonl`, `imu/<device>.gcsv`, `encoders/<axis>.csv`, `sync/events.jsonl`, `calibration/`, `layers/` (mattes, depth, lights, EXR), `export/` (OTIO, USD later), `ascmhl/`.
2. Manifest `take.json`: `$schema`, `schema_version` (semver), `take_id`, `created`, `clocks[]` (name, epoch, unit, nominal rate), `devices[]`, `streams[]` (id, kind, device, relative `path`, `clock`, `start`, `count`, `units`), `calibration[]`, `layers[]`, `notes`. Streams reference files by relative POSIX path and device id. Time is integer nanoseconds per named clock; `sync/events.jsonl` maps clocks. Schema `$id` is a versioned URL. Readers accept the same major version and ignore unknown fields; a major bump breaks.
3. JSON Schema 2020-12, as listed above.
4. Checksums: generate and verify with ASC MHL (own list not needed); the manifest stores no hashes.
5. Safe to change later: extra fields, new stream kinds, export formats, layer naming. Hard once files exist: folder names, stream path rules, clock names and units, the time epoch, per-frame file formats, MHL as the hash source.

## Not verified
- OpenUSD/usdz, Cryptomatte, OpenColorIO/ACES/AMF: not fetched.
- ASC MHL spec version and exact .mhl file names; EXR deep-image page; OTIO version; latest versions of jsonschema, ajv, networknt (current 2.x/3.x unconfirmed).
- OpenTrackingIO version and timing fields.

## Confidence
Medium: core formats and validators confirmed, but several surveyed specs were not checked.
