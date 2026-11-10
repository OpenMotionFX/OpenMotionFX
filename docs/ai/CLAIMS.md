# Capability claims

Every capability this project relies on. Scope: anything a document, README or plan says a device or program can do. A claim is `VERIFIED` only when a test produced a measured number and the raw data is stored in `tests/results/`. Until then, every document says "untested". Use the `verify-claim` skill to change a status. `tools/check.mjs` fails if a VERIFIED row lacks a test id or an existing evidence file.

Sources: "README" is the reference app's README; `solo`, `stack` are the frozen plans; `research NN` is a file in `docs/research/`.

## Reference app (OpenCamera README)

| ID | Claim | Source | Status | Test | Evidence |
| --- | --- | --- | --- | --- | --- |
| C-001 | RAW_SENSOR frames are debayered on the GPU with no vendor processing | README | UNVERIFIED | - | - |
| C-002 | Constant frame rate: every frame interval is equal, no dropped frames | README | UNVERIFIED | - | - |
| C-003 | Flat-log HEVC recording, and the curve matches the formula in the code | README | UNVERIFIED | - | - |
| C-004 | Open gate: 4096×3072 video covers the sensor's full field of view | README | UNVERIFIED | - | - |
| C-005 | ACES output (the solo plan says this is not true until an input transform is measured) | owner list; solo Impossible | UNVERIFIED | - | - |
| C-006 | RAW output as CinemaDNG sequences that are linear and untouched | reference commit note; research 01 | UNVERIFIED | - | - |
| C-007 | Gyroflow `.gcsv` IMU export lines up with the video frames | README | UNVERIFIED | - | - |
| C-008 | Programmed focus pulls hit their marks | README | UNVERIFIED | - | - |
| C-009 | Exposure ramps, zoom ramps and the keyframe timeline run as programmed | README | UNVERIFIED | - | - |
| C-010 | Laptop remote: browser controller with secure pairing and a full API | README | UNVERIFIED | - | - |
| C-011 | Monitoring tools (false colour, waveform, zebras, peaking) show correct values | README | UNVERIFIED | - | - |

## Phone (Vivo X200 Pro and witness phones)

| ID | Claim | Source | Status | Test | Evidence |
| --- | --- | --- | --- | --- | --- |
| C-020 | Frame timestamps are real: the phone-to-PTP mapping from the sync LED is stable over a take | solo Verification suite | UNVERIFIED | - | - |
| C-021 | The camera reports timestamp source REALTIME, so frames and gyro share a clock | research 03 | UNVERIFIED | - | - |
| C-022 | Rolling-shutter rows time an LED blink to within one row's readout; sub-millisecond phone sync | solo New possibilities | UNVERIFIED | - | - |
| C-023 | Per-frame focus distance and focal length are reported and match measured distances | solo Verification suite | UNVERIFIED | - | - |
| C-024 | Electronic stabilisation can be switched off and the image is not warped | solo Verification suite | UNVERIFIED | - | - |
| C-025 | Optical stabilisation obeys "off", and metadata shows whether it did | solo Impossible | UNVERIFIED | - | - |
| C-026 | RAW response is linear with a stable black level and no sharpening or noise reduction | solo Verification suite | UNVERIFIED | - | - |
| C-027 | Gyro and accelerometer run at a high rate on the same clock as frames | solo Phone hardware | UNVERIFIED | - | - |
| C-028 | Two cameras (wide and telephoto) can stream at the same time | solo New possibilities | UNVERIFIED | - | - |
| C-029 | RAW capture is available to third-party apps on the wide and telephoto cameras | research 03 | UNVERIFIED | - | - |
| C-030 | Wired Ethernet over a USB-C adapter works on the phone | solo Phone hardware | UNVERIFIED | - | - |
| C-031 | Audio timecode fed through a USB-C audio adapter lands sample-accurately | solo New possibilities | UNVERIFIED | - | - |
| C-032 | A chart-built colour transform matches the reference within a target error | solo Verification suite | UNVERIFIED | - | - |

## ESP32-P4 boards and network

| ID | Claim | Source | Status | Test | Evidence |
| --- | --- | --- | --- | --- | --- |
| C-040 | Hardware-timestamped PTP runs on these two boards' Ethernet | solo Laptop on the network; research 02 | UNVERIFIED | - | - |
| C-041 | The two P4s agree to microseconds through the unmanaged switch | solo Laptop on the network | UNVERIFIED | - | - |
| C-042 | Each P4 can raise a GPIO pulse at every whole PTP second | solo Phase 0 | UNVERIFIED | - | - |
| C-043 | The PoE switch powers both boards, one cable each | solo Your kit | UNVERIFIED | - | - |
| C-044 | The laptop joins PTP as a client with software timestamps | solo Laptop on the network | UNVERIFIED | - | - |
| C-045 | A P4 can blink the sync LED at known PTP times | solo Phase 0 | UNVERIFIED | - | - |
| C-046 | The boards expose a camera connector | solo New possibilities; research 02 | UNVERIFIED | - | - |
| C-047 | The P4's hardware video encoder is usable for a witness camera | solo New possibilities | UNVERIFIED | - | - |
| C-048 | A P4 can generate audio timecode from PTP time | solo New possibilities | UNVERIFIED | - | - |
| C-049 | A P4 can drive coded LED light through a MOSFET board | solo Phase 6 | UNVERIFIED | - | - |

## Slider

| ID | Claim | Source | Status | Test | Evidence |
| --- | --- | --- | --- | --- | --- |
| C-060 | The slider returns to the same point within a measured tolerance (example ±0.05 mm) | solo Phase 1 | UNVERIFIED | - | - |
| C-061 | Travel is roughly 200 mm (if the extrusion is 300 mm) | solo Your kit | UNVERIFIED | - | - |
| C-062 | The encoder resolves about 0.01 mm per count (if it is a 12-bit magnetic sensor on a 20-tooth pulley) | solo Your kit | UNVERIFIED | - | - |
| C-063 | Every step and encoder reading is stamped in PTP time | solo Phase 1 | UNVERIFIED | - | - |
| C-064 | A hand-driven move can be recorded and replayed | solo Phase 1 | UNVERIFIED | - | - |
| C-065 | A camera path from encoder plus gyro alone holds a CG object within a few pixels | solo Phase 2 | UNVERIFIED | - | - |

## Third-party

| ID | Claim | Source | Status | Test | Evidence |
| --- | --- | --- | --- | --- | --- |
| C-070 | CorridorKey 2.0 keys green and blue screens in one click, and its licence allows this use | solo CorridorKey | UNVERIFIED | - | - |
