# 03 — Software Spec

Three codebases: **Node firmware** (ESP32), the **Conductor** (desktop app), and **DCC plugins** (Blender add-on, Unreal plugin). All communicate through the OpenMoCo Protocol (OMP) and the `.omcf` move file (doc 01 §6/§8).

## 1. Node firmware

- **Language/framework:** C++ on ESP-IDF (FreeRTOS). Arduino-layer compatibility avoided in core paths for timing determinism.
- **Reuse, don't reinvent:**
  - Step generation & trapezoidal/S-curve execution patterns from **FluidNC / grblHAL** (ESP32-proven; we adopt their approach — hardware-timed step pulses, planner lookahead — not necessarily their G-code surface).
  - **SimpleFOC** for BLDC axes (position mode with AS5600 feedback).
  - **sACN/Art-Net** open libraries for light Nodes.
- **What's genuinely new (the real work):** the OMP sync layer — TSF-disciplined shared clock, beacon protocol, trajectory store-and-execute engine, deviation watchdog, dual-transport (ESP-NOW/CAN) session logic. Nothing on GitHub does "N wireless nodes execute pre-loaded trajectories sample-locked to a shared clock."
- **Architecture inside a Node:**
  - Core 0: radio, control-plane server, logging.
  - Core 1: real-time — clock discipline, trajectory sampler (≥240 Hz), step/FOC output via hardware peripherals (RMT/MCPWM), encoder watchdog.
  - Trajectory format: piecewise quintic/cubic segments per axis (compact, C²-smooth — no per-step streaming, no big point tables).
- **Safety:** hardware motor-enable latch on ABORT; beacon-loss dead-man (doc 01 §8); soft limits from config; thermal readback from TMC drivers.
- **OTA updates** from the Conductor, signed manifests, A/B partitions (a bricked module mid-shoot is unacceptable).
- **Node config** is one JSON document (axis geometry, limits, kinematic descriptor, calibration) — versioned, exported into every `.omcf` so takes are reproducible even after re-tuning.

## 2. Conductor (desktop app)

**Stack decision:** **Tauri (Rust core + web UI in TypeScript/React)**.
- Rust core: OMP networking, move compiler, kinematics — strongly typed, fast, and the same crate later reuses in CLI tools and CI validators.
- Web-tech UI: best available ecosystem for timeline/curve editors (canvas/WebGL); Tauri over Electron for footprint; over Qt/native for contributor accessibility — an open project lives or dies on how easy the UI is to hack on. 3D viewport via Three.js.
- Cross-platform Win/macOS/Linux from day one.

**Core features (MVP → mature):**
1. **Device manager:** discovery, pairing, status wall (per-node state colors mirroring module LEDs), config editor, OTA.
2. **Rig builder:** drag modules into a stack → kinematic chain assembles from module descriptors; 3D preview of reach envelope.
3. **Timeline & keyframe editor:** the heart of the app. Keyframes on axes *or* on world-space camera; graph editor with bezier ease curves; per-keyframe hold/linear/ease; loop & ping-pong; A/B move comparison.
4. **Playback modes:** real-time video, timelapse (stretch), **shoot-move-shoot** (move-settle-trigger loop), stop-motion (frame-step with onion-skin timing), live jog (game controller / MIDI surface support — repeatedly requested in communities; a recorded jog session converts to an editable move).
5. **Move compiler:** timeline → per-axis limit-checked trajectories (velocity/accel/jerk caps per module config); reachability and collision-margin warnings *before* upload.
6. **Shot library:** shots/takes as files on disk (no database, no cloud) — git-friendly project folders.
7. **Take review:** planned vs. performed curves overlaid; deviation report; one-click export to Blender/UE.
8. **Lighting desk:** fixtures on the same timeline; cue editing; live sACN/Art-Net input passthrough (an external console or UE can drive lights *through* the Conductor while it records the cues into the move file).
9. **Simulation mode:** full timeline playback against virtual nodes — the entire UX is developable and CI-testable with zero hardware, and users can pre-visualize shots on a laptop alone.

**Explicit non-goals:** no accounts, no cloud, no telemetry, no subscription surface. Local-first forever — this is a stated differentiator against Kessler kOS-style models.

## 3. Blender add-on

- **Import `.omcf`:** camera with baked per-frame transforms + animated focal length/focus distance (set directly on Blender camera data — sidestepping the documented FBX/Alembic/USD animated-intrinsics bugs), lights as area/spot objects with animated power/color from calibrated photometric data, rig geometry as empties (optionally proxy meshes).
- **Export to rig:** select a camera animation → add-on samples it, hands it to the Conductor (local WebSocket) → kinematic solve onto the connected rig → reachability report shown *in Blender*. Design the move in Blender; the hardware performs it.
- **Live link (later):** scrub Blender's timeline and the rig jogs to match (slow-speed follow) for on-set previz.
- Python, standard `bpy`; talks only to the Conductor, never to Nodes.

## 4. Unreal Engine plugin

- **Import:** `.omcf` → Level Sequence with CineCameraActor (focal length/focus mapped to CineCamera's filmback + focus settings) + Rect/Spot lights.
- **Native path first:** a direct `.omcf` importer avoids UE's known FBX camera focus-distance gap; FBX/USD remain the no-plugin fallback.
- **DMX interop:** UE's built-in DMX plugin speaks sACN/Art-Net → drives OpenMoCo lights *live* with zero custom code; the Conductor records those cues into takes.
- **Live link (later):** OMP telemetry → LiveLink source, physical rig drives the UE camera in real time (indie virtual-production previz).

## 5. Export matrix (what ships in every take folder)

| Output | Contents | Consumer |
|---|---|---|
| `.omcf` | everything (truth) | Conductor, plugins, validators |
| `.fbx` | camera transform + focal length keys | any DCC, editors, AE |
| `.usd` | camera + lights, Y-up converted | UE, Houdini, future-proof |
| `.py` | Blender setup script (Jetset/CamTrackAR pattern) | plugin-less Blender users |
| `.csv` | flat per-frame pose/lens table | Nuke, spreadsheets, custom tools |

## 6. Repos & tooling (when code starts)

- Monorepo initially: `firmware/`, `conductor/`, `plugins/blender/`, `plugins/unreal/`, `omcf/` (spec + validator + fixture files), `hardware/`.
- CI: firmware builds per module target; Rust/TS tests; **`.omcf` golden-file round-trip tests** (Blender headless + UE commandlet import/export must stay lossless — this is the pipeline's regression armor).
- Simulation-first development: virtual nodes in CI mean contributors need zero hardware to work on 90% of the stack.
