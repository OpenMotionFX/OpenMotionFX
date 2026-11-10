# OpenCamera reference app (digest)

The owner's existing Android cinema camera app, kept as reading material. It lives at <https://github.com/OpenMotionFX/OpenCamera> and is read-only from this project. A shallow clone sits in `reference/OpenCamera` (gitignored, commit `1792adf`). **Nothing has been adopted.**

## Licence

- MIT, "Copyright (c) 2026 CinemaCamera contributors"; a copy must keep that line and the permission notice (research 01)

## Modules in scope

| Module | Purpose | Size | Depends on |
| --- | --- | --- | --- |
| `core-domain` | Contracts and data models (research 01) | 7 Kotlin files, 364 lines | nothing |
| `core-camera` | Camera2 engine, C++ GLES debayer, HEVC encoder, audio, DNG writer (research 01) | 7 Kotlin files, 1,419 lines, about 2,000 lines of C++ | `core-domain` |
| `core-motion` | IMU capture to Gyroflow `.gcsv` (research 01) | 2 files, 196 lines | `core-domain` |
| `core-remote` | Ktor server, PIN pairing, REST API (research 01) | 4 files, 530 lines | `core-domain` |
| `app` | Compose UI, one ViewModel, presets (research 01) | 15 files, 2,966 lines | all modules |

- One further module in that repository is out of scope for this project and is not described here (D-0002)

## What looks reusable

- `core-camera` and `core-motion` ideas for hero and witness capture (research 01)
- `core-remote` only if a phone-side API is wanted (research 01)
- Record and IMU anchoring logic sits in `app` and must be lifted out before reuse (research 01)
- The plan sees its modular structure as mapping onto Heads and plugins (solo § Your camera app)

## What is untested

- No `src/test` or `src/androidTest` exists in any module; evidence is prose only (research 01)
- Every README feature is UNVERIFIED in [CLAIMS.md](../ai/CLAIMS.md): C-001 to C-011 (solo § Verification suite)
- The native pipeline is arm64 only and does not run on emulators (research 01)
- The constant-frame-rate fix relies on a Vivo-specific workaround (research 01)
- Nothing was built or run by the research pass; source was sized, not read (research 01)

## Build requirements

- Gradle 8.9+, JDK 17, SDK 35, NDK 27.2, CMake 3.22, AGP 8.7.3, Kotlin 2.0.21, minSdk 33 (research 01)

## How to adopt a module, when a decision record says so

- Copy the files into `apps/phone/`; do not add the repository as a submodule or dependency (D-0012)
- Keep the MIT copyright line and permission notice in a `THIRD_PARTY_NOTICES` file next to the copy (research 01)
- Bring the feature's claim row and its L1 tests in the same commit; the claim stays UNVERIFIED until an L4 test passes (D-0006)
