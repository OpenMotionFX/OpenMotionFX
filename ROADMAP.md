# ROADMAP

Phased so that **every phase ends with something a filmmaker can actually shoot with.** No phase depends on community adoption to be useful to you personally.

---

## Phase 0 — Foundations & bench truth *(~4–6 weekends)*

**Goal:** de-risk every assumption before designing around it. No modules, no app UI.

> Phase 0 is now fully specified as the **Node V0 prototype** — exact BOM, pin map, test firmware suite (T0–T11), and pass criteria live in **docs/05-NODE-V0-PROTOTYPE.md**. The checklist below is superseded by that doc's test matrix.

- [ ] Write the **OMP protocol spec v0** and **`.omfx` format spec v0** (drafts from docs 01/03).
- [ ] Bench rig: 3–6 bare ESP32-S3 boards.
  - [ ] ESP-NOW TSF sync accuracy across nodes, clean RF vs. congested (target <100 µs; logic analyzer on GPIO toggles).
  - [ ] Store-and-execute prototype: two nodes run pre-loaded sine trajectories from a broadcast GO; measure phase agreement.
  - [ ] CAN fallback smoke test (SN65HVD230 pair).
  - [ ] USB-PD trigger brownout under NEMA17 inrush → capacitance/inrush spec.
- [ ] Print + cycle-test one cycloidal reducer (10k cycles, measure backlash growth).
- [ ] AS5600 watchdog proof: detect a deliberately induced stall/slip.
- [ ] **OpenCamera sync-flash validation** (doc 05 T11): Node fires the sync flash while [OpenCamera](https://github.com/openlumenorg/OpenCamera) records; verify ±1-frame alignment across takes.
- **Exit criteria:** measured numbers replacing every "should work" in the specs. Any failure here changes the architecture cheaply, on the bench.

## Phase 1 — Flagship MVP: Pan/Tilt Head + Conductor core *(~2–3 months of weekends)*

**Goal:** one module, end-to-end, excellent. A filmmaker can keyframe a repeatable pan/tilt move and export it to Blender.

- [ ] Node board rev A (shared PCB, doc 02 §1) — hand-solderable variant first.
- [ ] Pan/tilt head: CAD, print, SimpleFOC bring-up, cycloidal integration, endstop homing, encoder watchdog.
- [ ] Node firmware v0: control plane, trajectory engine, sync plane, deviation logging.
- [ ] Conductor v0 (Tauri): device discovery, jog, keyframe timeline + graph editor, compile/upload/ARM/GO, take review (planned vs. performed), **simulation mode with virtual nodes**.
- [ ] `.omfx` writer + **Blender import add-on v0** (camera + baked animation).
- [ ] Sync flash via a bare LED on a GPIO (Sync Box proper comes later).
- [ ] **Validation shoot:** phone on head running **OpenCamera** (locked exposure/frame duration = clean pass matching), 3-pass twinning composite. Publish-quality repeatability proof for later launch material.
- **Exit criteria:** two consecutive passes composite sub-pixel at 1080p; Blender camera matches the plate.

## Phase 2 — Multi-axis: Slider + Turntable + kinematic chains *(~2 months)*

- [ ] Slider + turntable modules (stepper path of the Node board).
- [ ] OM-Mount standard finalized (this is the last chance to change it cheaply — after this, it's an ecosystem contract).
- [ ] Kinematic chain descriptors + Conductor rig builder + world-space camera keyframing with redundancy weights.
- [ ] Multi-node sync in anger: head-on-slider 2-pass composite.
- [ ] Shoot-move-shoot + stop-motion playback modes.
- [ ] Blender add-on: **export-to-rig** (W2 workflow) with reachability report.
- **Exit criteria:** a move designed in Blender executes on head+slider and round-trips back within tolerance.

## Phase 3 — Light: lighting modules + UE + Sync Box *(~2 months)*

- [ ] Key light + FX pixel light (ESP32-C6 stack, sACN/Art-Net + OMP sync).
- [ ] Photometric calibration workflow (doc 04 §4) + fixture profiles.
- [ ] Lighting timeline in Conductor; cue capture from external sACN sources.
- [ ] Sync Box module (triggers, flash, slate beep, tally, SoftAP host).
- [ ] **Unreal plugin v0:** `.omfx` → Level Sequence (CineCamera + lights); DMX interop demo (UE drives OpenMotionFX lights live).
- [ ] Showcase shoot: repeatable lightning FX across a 2-pass composite, lighting recreated in UE.
- **Exit criteria:** a take imports into UE with camera *and* animated lights matching the plate.

## Phase 4 — Reach: Dolly + focus motor + deep OpenCamera integration *(~2–3 months)*

> The companion capture app does not need to be built — **[OpenCamera](https://github.com/openlumenorg/OpenCamera)** (same org) already exists: Android RAW cinema app with Camera2/NDK pipeline, log recording, keyframe automation (focus/exposure/zoom ramps), high-rate IMU capture (`core-motion`), and a browser-based laptop remote (`core-remote`). An OpenMotionFX-friendly update is already in progress there. Phase 4's app work is *integration*, not creation.

- [ ] Dolly + flat-pack track (straight); curved segments if straight validates.
- [ ] Focus/zoom motor module; focus as a first-class axis in `.omfx`.
- [ ] **OpenCamera ↔ OMP integration:** network-triggered record from the Conductor/Sync Box; per-frame timestamps + lens metadata (focal length, focus distance, ISO, shutter from Camera2) written into `camera.json`; IMU stream stored as auxiliary track.
- [ ] **Timeline unification decision:** OpenCamera keeps its in-camera ramps (focus/exposure/zoom); motion lives in the Conductor — both fire off the same OMP T₀ so a focus ramp keyed in OpenCamera lands sample-locked with the rig move. (Revisit merging editors only if this two-timeline UX proves confusing.)
- [ ] Phone intrinsics profile library + nodal-offset jig procedure (OpenCamera's reference devices seed the profile database).
- [ ] USD export path hardened (golden-file round-trip tests in CI).
- **Exit criteria:** dolly+slider+head chain executes a Blender-designed 3-axis move; OpenCamera metadata lands in `camera.json` automatically.

## Phase 5 — Ecosystem: public launch *(when, and only when, Phases 1–3 are solid)*

- [ ] Naming/trademark check (README note) — decide final name.
- [ ] Licenses applied (GPLv3 / CERN-OHL-S / CC-BY-SA / CC0 protocol+format).
- [ ] Documentation site: build guides with print settings, sourcing links per region, calibration walkthroughs, troubleshooting. **Docs quality is a launch gate, not a follow-up** — it's the #1 gap in both commercial and DIY prior art.
- [ ] Contribution guide + module-descriptor spec so third parties can add modules without touching core.
- [ ] Launch assets: the Phase 1/3 showcase composites are the announcement — *show* repeatability, don't claim it.
- [ ] Community infra: GitHub org, Discourse/Discord, printables uploads.
- Stretch: kit/PCB group-buys, Dragonframe DFMoco compatibility shim (adopts the existing stop-motion community), gamepad/MIDI jog surfaces, LiveLink virtual production mode.

---

## Standing risks & open questions

| Risk | Mitigation / decision point |
|---|---|
| ESP-NOW sync underperforms near congested RF | Phase 0 measurement; CAN fallback is already specced — worst case, "wireless setup, wired for the take." |
| Printed cycloidal wear degrades repeatability | Phase 0 cycle test; fallback is cheap metal planetary + anti-backlash spring pattern. |
| MGN12 rail cost creep (largest single BOM item) | Dual-spec slider (rail vs. V-wheel) with measured, published difference. |
| Blender/USD animated-intrinsics bugs get fixed upstream | Great if so — `.omfx`-native path means we don't depend on it. Re-check each Blender LTS. |
| Phone camera APIs shift (lens metadata access) | Sync-flash workflow works with *any* camera app forever; and owning the capture stack via OpenCamera (Camera2/NDK, same org) means metadata access is under project control, not a third party's. |
| Scope creep toward virtual production | Explicit non-goal fence in doc 04 §6; LiveLink hooks exist but real-time comp is post-v1. |
| Solo-maintainer burnout (the pattern that killed every prior DIY moco project) | Every phase ships a usable tool for *you*; simulation-first dev lowers contributor barriers; protocol/format specs are CC0 so the ecosystem can outlive any repo. |

## Decisions locked by this plan (change only with a written reason)

1. Pre-loaded trajectories + broadcast GO; never streamed motion.
2. Endstop homing; sensorless homing banned for repeatability paths.
3. Positive drive everywhere; friction drive banned.
4. `.omfx` (quaternions, Z-up RH, meters) is canonical; FBX/USD are exports.
5. ESP32-S3 nodes + laptop-compiles/MCU-executes split.
6. Local-first: no cloud, no accounts, no subscriptions, ever.
7. Pan/tilt head is the first module; handheld gimbal is deferred indefinitely.
