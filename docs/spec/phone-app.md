# Phone app: hero and witness (digest)

One Android codebase, two modes. Status: **no code in this repository; the reference app's features are untested**. See [OPENCAMERA.md](OPENCAMERA.md) for the reference app.

## Modes

- One codebase, two modes, chosen at launch or by the set brain; both write the same take package (solo § The phone app)
- Hero: best image. RAW or log, full pipeline, programmed focus and zoom, moves timeline, monitoring tools (solo § The phone app)
- Witness: best measurement. Fixed exposure, short shutter, high frame rate, no stabilisation, locked focus, previews to the set brain (solo § The phone app)
- Shared: per-frame metadata log, IMU log, sync events, take ID from the set brain, remote API (solo § The phone app)
- Hero phone is a Vivo X200 Pro; witnesses can be cheap second-hand Android phones (solo § Your kit)

## Limits of a phone

- No lens encoders: per-frame lens metadata is the "software encoder", verified against targets at measured distances (solo § Impossible or much harder)
- No hardware sync: frames are timestamped in the phone clock and mapped to PTP with the sync LED (solo § Impossible or much harder)
- Electronic stabilisation off for every VFX shot; ask for optical stabilisation off and check metadata to see whether the phone obeyed (solo § Impossible or much harder)
- Output is "log", not ACES, until a measured input transform exists (solo § Impossible or much harder)
- 4096×3072 is binned or scaled, not native resolution; it may still be full field of view (solo § Impossible or much harder)

## Log every frame

- Sensor timestamp and clock source, exposure time, frame duration, ISO, focus distance, focal length, aperture, crop region, stabilisation modes, lens calibration and distortion, colour gains and matrix, shading map (solo § The "software encoders")
- Gyro and accelerometer at the highest rate, on the same clock as frames (solo § Phone hardware, used fully)
- Magnetometer and barometer, logged as-is (solo § Phone hardware, used fully)

## Verification suite comes before features

- Build the suite before adding features; each test gives pass or fail plus a number and reruns after every update (solo § Verification suite)
- Ten rows: constant frame rate, real timestamps, untouched RAW, log curve, field of view, focus pulls, focus metadata, stabilisation off, gyro alignment, colour (solo § Verification suite)
- Until a test passes, each feature is unverified (solo § Verification suite)
- Phase 2 is done when every row has a number and the CG object sticks within a few pixels (solo § Phase 2)

## What research found (unmeasured)

- Focus distance can be UNCALIBRATED with no physical units; lens pose reference can be UNDEFINED (research 03)
- Stabilisation has per-mode keys and an OIS data mode; compare result keys, crop and OIS samples to check "off" (research 03)
- Nothing specific to the Vivo X200 Pro is confirmed for third-party apps (research 03)
- The reference app has no automated tests; its constant-frame-rate fix relies on a Vivo-specific workaround (research 01)

## Tests this component needs

- L1 on the JVM for parsers, metadata records and take-package writing; L3 against the take-package schema (D-0006)
- L4 on the phone for every row of the verification suite (solo § Verification suite)
