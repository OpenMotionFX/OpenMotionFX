# 01 — System Architecture

## 1. Topology

```
                    ┌─────────────────────────────┐
                    │  CONDUCTOR (laptop app)      │
                    │  keyframe editor, kinematics,│
                    │  move compiler, DCC bridge   │
                    └──────────┬──────────────────┘
                               │ Wi-Fi (setup, upload, telemetry)
          ┌────────────┬───────┴──────┬─────────────┬────────────┐
          ▼            ▼              ▼             ▼            ▼
     ┌─────────┐ ┌──────────┐  ┌──────────┐  ┌──────────┐ ┌──────────┐
     │ Pan/Tilt│ │  Slider  │  │  Dolly   │  │  Light A │ │ Sync Box │
     │  Node   │ │   Node   │  │   Node   │  │   Node   │ │   Node   │
     └─────────┘ └──────────┘  └──────────┘  └──────────┘ └──────────┘
          ▲            ▲              ▲             ▲            ▲
          └────────────┴──── ESP-NOW broadcast ─────┴────────────┘
                       (time sync beacons + GO trigger)
          ─ ─ ─ ─ ─ ─ ─ optional wired CAN bus fallback ─ ─ ─ ─ ─
```

- **Conductor** — desktop app on the laptop. Owns the timeline, keyframes, easing, kinematics of stacked modules, and all DCC (Blender/UE) import/export. The single source of truth for a *shot*.
- **Node** — any module: one ESP32-S3 + motors/LEDs + encoders. Owns nothing but its own axes and executes pre-compiled trajectories with hard-real-time local timing.
- **Sync Box** — a Node with no motors: opto-isolated trigger outputs (camera shutter/record triggers for cameras that accept them), a visible **sync flash LED** (for phone frame alignment, see §5), tally light, and optional LTC timecode audio output.

## 2. The two-plane network

**Control plane (Wi-Fi, TCP/WebSocket):** discovery, configuration, trajectory upload, jog commands, telemetry, firmware update. Latency-tolerant. The Conductor runs an mDNS browser; Nodes advertise `_openmoco._tcp`. Works on any existing Wi-Fi network or on a SoftAP hosted by the Sync Box when there's no infrastructure (shooting outdoors).

**Sync plane (ESP-NOW broadcast):** connectionless 802.11 action frames, no AP association needed, immune to DHCP/router weirdness.

- A designated **timekeeper Node** broadcasts sync beacons; all Nodes discipline a shared clock using the ESP32's 802.11 TSF, giving **microsecond-class agreement** across the fleet (bench target: <100 µs, which at 60 fps is 1/160,000 of a frame — vastly better than needed).
- The **GO message** contains only: shot ID, start timestamp (in shared-clock time, ~200 ms in the future), and playback rate. Broadcast, repeated ×5 for loss tolerance. Every Node arms and starts its local trajectory when its disciplined clock reaches T₀.
- **Nothing time-critical is ever streamed.** Wi-Fi jitter, retries, and congestion can delay telemetry but can never desynchronize a take.

**Wired fallback (CAN 2.0B):** ESP32's built-in TWAI + SN65HVD230 transceiver (~$2/node), daisy-chained over standard cables. Same protocol frames, physically deterministic. Recommended whenever a shoot is near heavy 2.4 GHz congestion or for the paranoid VFX pass. Nodes auto-prefer CAN when a bus is detected.

## 3. Execution model: compile → upload → arm → GO

1. **Compile.** The Conductor resolves the timeline (keyframes + easing + kinematic solve for stacked modules) into **per-axis trajectory segments** — piecewise curves (time, position, velocity) at the module's control rate. Heavy math lives on the laptop, Klipper-style; the MCU only interpolates and steps.
2. **Upload.** Each Node receives *only its own axes'* segments over the control plane, stores them in RAM/flash, and verifies with a CRC + segment count echo. The Conductor confirms every Node reports `LOADED` before arming is possible.
3. **Arm.** Nodes home (see §4), move to their trajectory start positions, and report `ARMED`. The Conductor UI shows a per-node checklist — no silent failures.
4. **GO.** Broadcast trigger (§2). During playback each Node samples its trajectory against the shared clock, so even if one Node's oscillator drifts, beacon discipline keeps long takes aligned end-to-end.
5. **Record.** Each Node logs actual encoder positions per control tick. After the take, the Conductor collects logs and stores them in the take's move file — the *as-performed* truth, not just the plan (see §6).

**Playback rate is a first-class parameter:** the same trajectory can run at 100% for video, at N× stretched for timelapse, or **stepped** for shoot-move-shoot (move → settle → trigger → wait), which is what makes stop motion, timelapse, and multi-pass VFX the same code path.

## 4. Repeatability contract

A "repeat" means: after re-homing, every axis reproduces the previous pass within tolerance for the entire duration.

| Guarantee | How |
|---|---|
| Absolute zero | Mechanical endstop homing every session (repeatable to ~1 step). **Never** sensorless/StallGuard homing — tuning-sensitive and documented as unreliable for fine positioning. |
| No lost steps | Steppers sized with ≥5× torque margin at phone payloads; conservative acceleration caps in the compiler. Open-loop steppers do not drift if they never stall. |
| Verification | AS5600 magnetic encoder per axis as a **watchdog**, not a control loop: firmware compares commanded vs. encoder position each tick and flags the take as `DEVIATED` beyond threshold — a bad pass is *detected*, never silently delivered. |
| No backlash | Belt drives (near-zero backlash) for linear axes; printed cycloidal reducers for pan/tilt; positive engagement (belt/rack on track) for the dolly — friction wheel drive is banned by spec. |
| Numeric targets | Linear axes: ≤0.1 mm repeatability. Rotary axes: ≤0.05°. (At 1080p with a phone wide lens, both are sub-pixel at typical subject distances.) |

## 5. Camera sync (the smartphone reality)

Phones cannot genlock — no public API exposes shutter-level hardware sync. The spec therefore treats the phone as a **free-running camera aligned in post**, with three mechanisms in increasing order of rigor:

1. **Sync flash.** The Sync Box fires a 1-frame LED flash at T₀ (and optionally at T-end), visible in frame edge. Post alignment is then exact to ±1 frame, and identical across passes. Cheap, foolproof, works with any camera app.
2. **Audio slate.** A beep from the Sync Box at T₀ for audio-waveform alignment; complements the flash.
3. **Companion capture app (later phase).** Uses the phone's camera API to start capture on network trigger, record per-frame timestamps + ARKit/ARCore pose + lens metadata (focal length, focus distance, ISO, shutter). Even then, the *rig encoders remain ground truth* — encoder data is scene-independent and drift-free, which is precisely why $68k rigs use encoders instead of optical tracking.

Real cameras with trigger/LANC/timecode inputs get first-class support via the Sync Box's opto-isolated outputs — this future-proofs the system beyond phones for free.

## 6. The Move File (`.omcf`) — canonical interchange format

Research verdict: **no existing format survives the full round trip.** FBX drops focus distance; Alembic and USD both have documented bugs collapsing animated focal length; rotation-order and up-axis mismatches are endemic. So OpenMoCo defines its own canonical format and *additionally* exports FBX/USD (the Lightcraft Jetset pattern — own format as truth, standard formats as views).

**Container:** a zip with JSON manifest + binary column data (or pure JSON for small files). Human-diffable where possible.

**Conventions (fixed, non-negotiable, printed in every file):**
- Right-handed, **Z-up**, +Y forward, meters, seconds (Blender-native; exporters convert to UE's left-handed Z-up cm and USD's Y-up).
- Rotations as **quaternions** (no Euler-order ambiguity — this single choice kills the most common interchange bug class).
- All samples timestamped on one shared clock; fixed sample rate per stream (motion streams at control rate, e.g. 240 Hz; light streams at 44 Hz DMX-style is fine).

**Content:**
```
manifest.json      shot metadata, module inventory, kinematic chain,
                   conventions block, software versions, take status
                   (CLEAN / DEVIATED + max error)
planned/           compiled trajectories per axis (the intent)
performed/         encoder logs per axis (the truth)  ← per take
camera.json        rig-solved camera pose per frame + lens metadata:
                   focal length (mm), sensor size (mm), focus distance (m),
                   principal point, ISO/shutter if known
lights/            per-fixture: pose, per-frame intensity + color,
                   photometric calibration (see 04-VFX-PIPELINE §4),
                   beam/softbox geometry
events.json        T₀, sync flash times, shoot-move-shoot trigger times,
                   DMX cues, user markers
```

The format spec will be released **CC0** with a validator tool, so anything — including non-OpenMoCo hardware — can produce or consume it.

## 7. Kinematic chains (modularity made real)

Mounting a pan/tilt head on a slider on a dolly forms a chain. Each module's spec sheet includes its **kinematic descriptor**: joint type, axis direction, and the fixed transform from its base mount to its output mount (known from CAD of the standardized mounts). The Conductor composes descriptors into a chain automatically when the user drags modules together in the UI, enabling:

- **World-space camera paths:** user keyframes *the camera* in 3D; the Conductor solves the redundant axes (with user-weightable preferences, e.g. "prefer dolly travel over pan").
- **Blender → rig:** import a camera animation, solve it onto whatever chain is assembled, and report reachability violations *before* anyone presses GO.
- **Rig → Blender/UE:** forward kinematics over `performed/` logs yields the true camera path even if the move deviated.

Chain descriptors are data, not code — a community member's new module is a JSON file plus the standard mounts, and it composes with everything.

## 8. Protocol summary (OpenMoCo Protocol, "OMP")

| Layer | Transport | Content |
|---|---|---|
| Discovery | mDNS / ESP-NOW probe | node id, type, fw version, axes, capabilities |
| Control | TCP/WebSocket (CBOR or protobuf frames) | config, jog, upload, telemetry, OTA |
| Sync | ESP-NOW broadcast (+ CAN mirror) | time beacons, ARM/GO/ABORT, heartbeat |
| Lighting interop | sACN (E1.31) + Art-Net listener on light Nodes | industry-standard DMX universes, so UE's DMX plugin and any lighting desk can drive OpenMoCo lights directly |

ABORT is broadcast on both planes, is latched by hardware (motor enable line), and every Node also dead-man's-switches on beacon loss > 2 s during playback.
