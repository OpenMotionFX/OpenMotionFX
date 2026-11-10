# OpenCamera reference app

## Decision this feeds
Which parts of this Android camera app (commit 1792adf) can be reused for the hero and witness phone modes, and which claims are untested.

## Findings
- Licence: MIT, "Copyright (c) 2026 CinemaCamera contributors" (`LICENSE`). A copier must keep that copyright line and the permission notice.
- `core-domain`: contracts and data models. 7 Kotlin files, 364 lines. No module dependencies (`core-domain/build.gradle.kts`).
- `core-camera`: Camera2 engine, C++ GLES debayer, HEVC encoder, audio, DNG writer. 7 Kotlin files, 1,419 lines, plus about 2,000 lines of C++. Depends on `core-domain`.
- `core-motion`: IMU capture to Gyroflow `.gcsv`. 2 files, 196 lines. Depends on `core-domain`.
- `core-remote`: Ktor server, PIN pairing, REST API. 4 files, 530 lines. Depends on `core-domain`.
- `app`: Compose UI, one ViewModel, presets. 15 files, 2,966 lines. Depends on all modules.
- Coupling: modules talk through `core-domain` interfaces and Hilt (`docs/ARCHITECTURE.md`). `core-remote` calls back through a `RemoteController` that `MainViewModel` implements. Record and IMU anchoring logic sits in `app`, so it must be lifted out.
- The native pipeline is arm64 only and does not run on emulators (`README.md`).
- Build: Gradle 8.9+, JDK 17, SDK 35, NDK 27.2, CMake 3.22 (`README.md`). AGP 8.7.3, Kotlin 2.0.21 (`gradle/libs.versions.toml`). compileSdk 35, minSdk 33, targetSdk 35 (`app/build.gradle.kts`).
- README claims (GPU RAW debayer, constant frame rate, flat-log HEVC, `.gcsv` export, scopes, programmed moves, remote with pairing): no test found for any. No `src/test` or `src/androidTest` in any module. Evidence is prose only, such as "Verified on-device" (`docs/MASTER_PLAN.md`), with no logs or measurements.
- The constant frame rate fix relies on a Vivo-specific workaround (`docs/ARCHITECTURE.md`).

## Recommendation
Use it as reading material, not a base. Port `core-camera` and `core-motion` ideas for hero and witness; copy `core-remote` only if a phone API is wanted. Measure frame-interval jitter and IMU-to-frame offset before trusting either.

## Not verified
- Nothing was built or run; no wrapper is committed.
- Source was sized, not read.
- `.gcsv` timing accuracy.
- Behaviour on any phone other than the Vivo X200 Pro.
- `README.md` omits the DNG writer that exists in the C++ code.

## Confidence
Medium: licence, build files and sizes read directly; behaviour never run.
