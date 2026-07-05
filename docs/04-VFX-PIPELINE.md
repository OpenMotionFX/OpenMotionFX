# 04 — VFX Pipeline

Why this system exists: every take becomes data that reconstructs the shot in 3D, and every 3D design becomes a physical move. This doc defines the workflows and the calibration practices that make the data trustworthy.

## 1. The four core workflows

### W1 — Shoot → 3D (match-move without tracking)
1. Shoot the take; rig encoders log the true camera path (doc 01 §3.5).
2. Conductor solves forward kinematics over `performed/` logs → per-frame camera pose + lens metadata.
3. One-click export → Blender/UE scene with the *exact* camera. No optical tracking, no feature-poor-footage failures, no drift: encoder data is scene-independent — the same reason $68k rigs use encoders instead of SLAM.
4. Align footage via sync-flash frame (doc 01 §5); comp CG into the plate.

### W2 — 3D → Shoot (previz becomes the shot)
1. Animate the camera in Blender (or UE Sequencer).
2. Add-on sends the animation to the Conductor → kinematic solve onto the assembled rig → reachability report in-app.
3. Rig performs the designed move physically. The previz *is* the shot plan.

### W3 — Multi-pass compositing (the repeatability payoff)
Same move, N takes: actor pass / clean plate / foreground pass / lighting-variant pass. Because motion **and lighting cues** replay sample-locked (doc 01 §2), passes stack in post with sub-pixel agreement. This unlocks the classic moco vocabulary on a phone: twinning, crowd duplication, scale composites, impossible stitches, day-for-night dual passes, product "hero + plate" shots.

### W4 — Hybrid time (timelapse / stop motion / speed ramps)
The same compiled trajectory runs at any time base (doc 01 §3): real-time video, shoot-move-shoot timelapse, frame-stepped stop motion. A move designed once can be shot as video *and* as a timelapse and both land on the same 3D camera path — e.g., timelapse background + real-time foreground composites.

## 2. Interchange rules (hard-won, from research)

- **`.omfx` is truth; FBX/USD are views** (doc 01 §6). Animated focal length/focus distance travel natively only in `.omfx` and the plugins — FBX, Alembic, and USD all have documented failures here.
- **Quaternions everywhere internally.** Euler conversion happens only at the final export boundary, per target convention (Blender XYZ Z-up; UE left-handed Z-up cm; USD Y-up).
- **The conventions block is embedded in every exported file** (as metadata/custom properties), so a file found on disk years later is self-describing.
- **Lens metadata is mandatory, not optional:** focal length (mm), sensor dimensions (mm), focus distance (m), principal point. For phones this comes from the companion app's camera API (or a one-time per-phone calibration profile shipped in a community database — phone models are finite and identical units match closely).

## 3. Camera calibration (phones)

Per phone model (community-shareable profile), once:
1. **Intrinsics:** checkerboard/ChArUco solve → true focal length, principal point, distortion coefficients. Stored in the Conductor's camera profile library and written into every `camera.json`.
2. **Nodal offset:** the phone's lens is not at the OM-Mount origin; a documented jig procedure measures the lens entrance pupil offset so the kinematic solve outputs *lens* pose, not *clamp* pose. This is the difference between "close" and "sub-pixel" in comp.
3. **Rolling shutter note:** phone sensors have meaningful rolling shutter; store readout time in the profile so advanced users can correct in post. Keeping max angular velocity modest during VFX passes is the practical mitigation (compiler exposes a "VFX-safe speed" toggle).

## 4. Lighting recreation (the underserved half)

DMX values are not photometric truth — a "50%" dimmer level means nothing in a renderer. OpenMotionFX lights therefore carry a **photometric calibration block**, measured once per fixture build with cheap tools:

| Field | How measured | Used by |
|---|---|---|
| Luminous flux vs. dim level (curve) | Phone lux-meter app at fixed distance, or $20 lux meter — measured at 5 dim points | Blender light power (W), UE intensity (lm/cd) |
| CCT + tint vs. mix level | Phone camera gray-card WB readout, or community-shared profile per COB part number | Light color nodes |
| Chromaticity (xy) for RGBW pixels | From LED datasheet primaries + measured white point | FX light color mapping |
| Beam geometry | Fixture CAD: COB size, reflector/softbox dimensions, beam angle | Area/spot light size — soft shadows match |
| Pose | OM-Mount on a rig module (best: light *on a motion module* = animated light with encoder truth) or manual tape-measure entry in the rig builder | Light transform |

Result: importing a take into Blender/UE recreates not just the camera move but the **lighting state per frame** — position, brightness in real units, color, softness. Repeatable FX cues (lightning, TV flicker, fire) replay identically across passes *and* import as keyframed light animation, so the CG elements flicker in sync with the plate. No affordable product does this; it's a headline feature.

**On-set reference (cheap HDRI-kit emulation):** the documented workflow recommends a $15 chrome + gray ball pair and a phone color-chart capture at take start; `events.json` marks the reference frames. This bridges OpenMotionFX lights and *uncontrolled* ambient light in the same scene.

## 5. Sync & precision budget (what "cinema grade" means here, honestly)

| Requirement | Budget | Mechanism |
|---|---|---|
| Inter-module motion sync | <1 ms (invisible at any frame rate) | TSF shared clock, target <100 µs (doc 01 §2) |
| Lighting cue vs. motion | <5 ms | same clock, DMX-rate sampling |
| Pass-to-pass repeatability | sub-pixel at 1080p, typical phone FOV/distances | encoder-verified ≤0.1 mm / ≤0.05° (doc 01 §4) |
| Camera frame alignment | ±1 frame exact, identical across passes | sync flash + audio slate (doc 01 §5) |
| Absolute camera trigger | not achievable on phones (no genlock API) — designed around, not ignored | companion app soft-trigger; real cameras get hardware trigger via Sync Box |

The honest positioning: OpenMotionFX delivers *Bolt-class repeatability semantics* (encoder-verified repeat passes with data export) at phone scale and speed — it does not deliver Bolt-class dynamics (m/s whip moves), and phone shutters are aligned, not genlocked. For multi-pass VFX at indie scale, the research says that trade is exactly right.

## 6. Deliberately out of scope (v1)

- **LED-wall / live-comp virtual production** (Aximmetry-style): the LiveLink/telemetry hooks exist (doc 03 §4), but real-time comp is a different product. Revisit post-v1.
- **AI-assisted tracking cleanup:** encoder data makes it unnecessary for rig shots; handheld ARKit capture is a fallback mode, not a focus.
- **Cloud render/asset integration:** local-first principle.
