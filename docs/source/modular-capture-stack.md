# Modular Capture Stack: Real Plan

Nov 10, 2026 · @Aahaan

## Design philosophy

The whole stack is one brain design, one connector, one clock and one data model, with interchangeable "business ends" bolted on. Everything that records or emits is built from the same four layers:

1. **Core.** The brain. Identical in every unit, mass-produced. Timing, compute, storage, network, power, self-identification.
2. **Head.** The business end. A sensor, an emitter or an interface that plugs into a Core through one universal connector. Heads are as specialised as they need to be, and nothing more.
3. **Body.** Mechanics and power: housings, mounts, batteries, weather shells. A small family of standard parts shared by everything.
4. **Spine.** The shared infrastructure that ties units into one instrument: clock distribution, network, power, ingest and storage.

The software mirrors the hardware. One firmware runs on every Core. Each Head ships as a self-describing package (driver, calibration model, solver plugin). Adding a new kind of Head never changes the Core or the central software, only adds a plugin.

**Three sizes of brain, one family.** Not every sensor deserves a full Core. A floor pressure tile or a wind gauge needs a timestamp and a wire, not a GPU. So the family has three tiers that share the same clock, protocol and identity system:

- **Core** for anything with real bandwidth or compute (cameras, depth, light coding, scanning).
- **Pod** for cheap, brainless sensors and emitters. A Pod has a sensor, an ID chip and a cable. It is fed time and power by a **Hub Head** on a Core, which timestamps and records it.
- **Tag** for things that must be wireless and tiny (props, actors, moving rigs). A Tag is the only extra brain design, kept deliberately minimal.

The rule of thumb: if something needs more than about 10 units on a typical set, it becomes a Core + Head or a Pod, never a bespoke device. One-off instruments (the survey lidar, the material scanner, the light stage) may be specialised, but they still sit on a Core so they share time, identity and data format.

&#91;embedded content: stack architecture · Spine, Cores, Heads, Pods, Tags\]

The same Core sits under every Head; only Pods hang off a Hub, and only Tags carry their own small brain.

## The Core

The Core is the one part you make in hundreds. It does everything that is the same across all devices, so Heads only carry what is unique.

| Block | What it does | Why it lives in the Core |
| --- | --- | --- |
| Clock | Disciplined oscillator, network time to sub-microsecond (White Rabbit class), hardware timestamp on every edge, sync in/out, genlock out | Time is the one fundamental every device needs, so it is never duplicated or done differently |
| Logic fabric | FPGA lanes that talk to Head sensors, timestamp per row and per sample, demodulate codes, drive emitters with exact phase | Sensor and emitter timing is deterministic and identical everywhere |
| Compute | Low-power processor plus a small GPU/NPU for compression, live previews, local solving | Heads stay dumb and cheap |
| Storage | Hot-swap media magazine, local recording of everything | No single point of failure; network carries previews, not lifelines |
| Network | Fibre and copper, data plus timing on one cable; a separate low-power radio for control only | One cable per unit on set |
| Power | Universal input (camera batteries, DC, power over network), hot-swap, power budget sent to the Head | Every unit runs off whatever is on set |
| Self-knowledge | IMU, temperature, an identity beacon in the tag band, a unique ID | Every Core locates itself and is automatically part of the production layer |
| Head port | One connector: power, high-speed lanes, trigger lines, ID memory | Any Head on any Core |

**Stacking.** Heavy Heads (the hero camera adapter, a lidar scanner) gang two to four Cores through a backplane rather than requiring a bigger brain. You still only build one Core design.

**Head descriptor.** Every Head carries memory holding its type, serial, factory calibration and the driver version it needs. Plug it in, and the Core loads the driver, applies the calibration, joins the clock and announces itself to the set. Nothing to configure.

**Physical rules for the Core.** Fanless or near-silent during takes, matte and scanned once so its appearance is known, no visible light emission, and the same mounting pattern on every face.

## Heads

Heads fall into four families. Inside the biggest family (imaging) the modularity goes one level deeper: one optical Head chassis takes swappable sensor tiles and standard lens mounts, so a witness camera, a depth camera and a polarisation camera are the same Head with a different tile.

### Imaging family: one Optic Head, many sensor tiles

| Configuration | Sensor tile + optics | Records | Used for |
| --- | --- | --- | --- |
| Witness | Global-shutter RGB, interchangeable lens | Synced views of the volume | 4D reconstruction, body and face capture, seeing behind rigs, pose refinement |
| Witness-NIR | Global-shutter RGB+NIR (dual tile) | Same, plus tag and beacon visibility | Production-layer mattes from other angles, tracking Cores and Tags |
| Depth | NIR time-of-flight tile plus NIR emitter | Per-pixel depth | Dynamic geometry from a near-co-axial position |
| Polar | Polarisation-filtered RGB tile | Diffuse/specular split, normals | Material and reflection separation |
| Event | Event-based tile | Microsecond motion edges | Fast motion, sync verification, flicker analysis |
| Environment | Fisheye HDR tile (2–3 per sphere) | Full surroundings each frame | Reflections, sky, what crew and gear look like from the set's point of view |
| Sky | Fisheye HDR tile plus spectral filter wheel | Sun, sky, weather | Uncodable light measurement outdoors |

One chassis, five or six tiles and three lens mounts covers most of what the ideal doc asked for. Tiles are the only thing that changes when sensors improve.

### Hero camera family

- **Camera Adapter Head.** Clips to any cinema camera. Lens encoders (all rings plus internal focus group where the lens allows), lens data protocols, sync and timecode into the camera, pose sensors (IMU plus an outside-in tracking target), and a tap of the camera's own output for metadata. Works with any existing camera from day one.
- **Co-axial Splitter Head.** A dichroic splitter in the matte-box position: visible light passes to the hero camera, near-infrared is reflected to an Optic Head with an NIR tile. Gives near-co-axial tag mattes and depth without touching the hero image's visible light.
- **Spectral Back (later).** Your own camera body: hero RGB plus NIR, polarisation and demodulation tiles behind one lens, band-split. This is the ideal "one axis, many sensors". It is a stack of Cores plus a special Head, not a new platform.

### Emitter family

| Head | Does | Notes |
| --- | --- | --- |
| Light Coder | Imprints an orthogonal code on any LED fixture's output | Inline between fixture and its power or data, or built into partner fixtures. Usually a Pod (see below), because sets have many lights |
| Light Engine | Your own spectrally tunable, codable fixture | For key lights and backings where you need full spectral control |
| Tag Emitter | Infrared tag illumination and coded beacons | Lights up tag coatings in the tag band only |
| Pattern Projector | Structured light and coded patterns on interleaved frames | Environment matting for glass and liquids, quick geometry, calibration |

### Measurement family

| Head | Records | Notes |
| --- | --- | --- |
| Light Probe | Spherical HDR plus a spectrometer | Bounce and mixed light at several points outside frame |
| Fixture Monitor | Per-frame spectrum and output of one fixture | Small Pod clipped to a light, so output is measured, not just commanded |
| Scanner | Survey lidar plus photogrammetry rig | One-off instrument, sits on a stacked Core |
| Material Scanner | Spatially varying reflectance, spectral | One-off; studio or truck based |
| Media | Laser sheet plus high-speed tile; anemometers as Pods | Smoke, haze, rain, wind |

### Interface family

- **Hub Head.** Fans out to 16–32 Pods over a single daisy-chainable cable carrying power and time.
- **Clock Head.** GNSS plus atomic-class reference. Turns any Core into the set's master clock.
- **Bridge Head.** Talks to third-party gear (motion control, LED wall processors, lighting desks, winch controllers, existing mocap) and timestamps their data into the same timeline.
- **Operator Head.** A screen and controls, for a Core that acts as a station in the DIT cart or at video village.

## Pods and Tags

Pods and Tags handle the long tail: devices you need dozens or hundreds of, where a full Core per unit would be wasteful.

**Pods** are brainless. Each has one sensor or emitter, an ID chip holding its calibration, and a standard cable. A Hub Head on a Core supplies power and time down the chain and timestamps every sample at the Core. Because the timing lives in the Core's logic fabric, a Pod is as well synchronised as any camera.

| Pod | Records or does | Typical count |
| --- | --- | --- |
| Light Coder Pod | Codes one fixture | One per controllable light |
| Fixture Monitor Pod | Measures one fixture's output each frame | One per key light |
| Encoder Pod | Rotary or linear position | Cranes, dollies, winches, motion control axes |
| IMU Pod | Orientation and acceleration | Rigs, flags, stands, set pieces that move |
| Floor Tile | Pressure map | Covers the action area |
| Wind Pod | Anemometer | Grid around the volume |
| Tag Lamp Pod | Infrared tag illumination | Spread around for even tag coverage |

**Tags** are the only other brain. They exist for things that cannot have a cable: props, actors, handheld gear, stunt rigs in motion. A Tag holds a small IMU, a coded infrared beacon, a radio for time and data, and a battery. It is disciplined to the set clock over radio and seen by Witness-NIR Heads, so its optical position and its own inertial data are fused. Tags come in two forms: a coin-sized stick-on and a version embedded in props during manufacture.

So the full bill of brains is: **Cores** (many), **Tags** (many, tiny) and nothing else. Pods and Heads carry no clock of their own.

## Rules so the stack never corrupts the data

Every module must pass the same "invisible observer" rules before it ships. These are what make the system "just work" without anyone policing it on set.

1. **Spectrum plan.** The visible band belongs to the hero image only. Near-infrared is split into fixed lanes: one for depth (around 850 nm), one for tags and beacons (around 940 nm). No ultraviolet, since costumes and makeup fluoresce. The plan is fixed in firmware, so no module can emit outside its lane.
2. **Time plan.** Every emission (light codes, projector patterns, beacons, LED-wall ghost frames) is scheduled by the set software against the hero camera's exposure and row timing. Codes are chosen so they never beat against any camera's shutter or a wall's refresh.
3. **Everything is logged.** Any light a module puts into the scene is recorded with its exact phase and power, so it can be subtracted exactly.
4. **Silent and cool.** No fans or moving parts audible during record; no heat plumes near any lens.
5. **Known appearance.** Every Core, Head, Pod, Tag and mount is scanned for shape and material once at the factory. Its scan ships in its ID memory, so the moment it appears on set, its digital twin exists.
6. **Self-registering.** Every unit broadcasts its identity and is located by the witness array and its own IMU. It automatically joins the production layer and is flagged if it enters the frustum, a reflection cone or a shadow volume.
7. **Hero first.** Any module that costs the hero image light (splitters, filters, codes) has a hard budget, and the set software refuses configurations that exceed it.
8. **Graceful failure.** A dead or missing unit lowers confidence in its region, never stops the take. Every unit records locally.

## Software stack

The software has six layers. Each Head type adds a plugin to the layers it touches; the layers themselves never change for new hardware.

| Layer | Runs on | Job |
| --- | --- | --- |
| Core firmware | Every Core | Head drivers, timestamping, local recording, health, identity. One image for all Cores |
| Set fabric | Network | Discovery, clock distribution, transport, previews. Plug a unit in anywhere and it appears |
| Set brain | Operator Cores, tablets | Live world model: where every unit and production object is, the four contamination regions (frustum, reflection cones, shadow volumes, bounce zone), the spectrum and time plan, warnings, take control |
| Calibration | Set brain + Cores | Applies factory calibrations; runs on-set calibration with one universal target |
| Ingest and vault | Ingest Cores, storage | Pulls local recordings, verifies against previews, builds the take package |
| Solve | Near-set and cloud compute | Plugin pipeline: pose refinement, 4D reconstruction, light-layer demultiplexing, material fitting, production-layer removal, confidence maps |

**One universal calibration target.** A rigid wand with known geometry, coded infrared and visible LEDs, spectral reference patches and a polarisation patch. Waving it through the volume calibrates every Optic Head's intrinsics and extrinsics, checks every tile's spectral response, aligns the tag band and verifies sync to the microsecond (the LEDs blink on a known schedule). One tool, one routine, for the whole system.

**The production-layer registry** is the heart of the set brain. Every object that is not world (units, rigs, wires, pads, stands, crew Tags) has an entry: scan, material, tag code, live pose. Cleanup in post simply reads this registry.

**Open formats at the edges.** Internally one stream format, timestamped per row and per sample, with calibration attached. On export: OpenUSD for the scene, multi-part and deep OpenEXR for images and light layers, ACES colour, OpenTimelineIO for editorial. Artists receive standard files, not a proprietary viewer.

**Plugin contract.** A Head plugin declares what it records, its calibration model, its noise model and how its data enters the solve. That is the whole interface for a new kind of sensor.

## Fundamentals mapped to modules

Every fundamental from the ideal doc is covered by combinations of the same parts. Few need anything unique.

| Fundamental | Modules | Realistic method | Gap to the ideal |
| --- | --- | --- | --- |
| Time | Core clock, Clock Head, Tag radio | One master, sub-microsecond on every cable, per-row timestamps from logic fabric | Tags over radio are looser; fused with optical sighting |
| Camera pose | Camera Adapter Head, Witness array, Tags on rig | IMU + encoders + outside-in sighting of the adapter's beacons, then refined in-image against the scanned set | Arcsecond accuracy only after the image solve, as the ideal doc predicts |
| Lens | Camera Adapter Head, factory lens twin library | Encoders on every ring; lens twin built per lens model on a bench rig, validated per serial with the calibration target | Internal focus groups only readable on lenses whose makers expose them |
| Sensor | Bench characterisation, stored per camera serial | Spectral response, noise vs ISO and temperature, row timing | None for your own Spectral Back; third-party cameras characterised once |
| Static geometry | Scanner (stacked Core), Witness array | Lidar plus photogrammetry before and after each setup, tied to the calibration target | Fine |
| Dynamic geometry | Depth Heads, Co-axial Splitter, Witness array | Near-co-axial depth plus multi-view 4D reconstruction | Hair, smoke, glass remain approximate |
| Materials | Material Scanner, Polar Heads, Light Engines | Pre-scan props and costumes; polarisation split live; interleaved lighting frames on the high-rate witness cameras | Actor reflectance during the take is partial until the Spectral Back |
| Light | Light Coder Pods, Fixture Monitor Pods, Light Probes, Sky Head | Coded fixtures, measured per frame; probes for bounce; sky camera for sun | Uncodable light (sun, fire) is the residual, as expected |
| Motion | Witness array, Tags, Floor Tiles, Encoder Pods | Markerless body and face from witnesses, Tags on props, pressure from floor | Fine finger and eye detail needs dedicated long-lens witnesses |
| Media | Media Head, Wind Pods, Witness array | Laser sheet where safe and practical, wind grid, stereo for water | Most limited area; used only on effects-heavy shots |
| Ownership and mattes | Co-axial Splitter, Tag Emitters, Witness-NIR, Pattern Projector | Tag band gives exact contaminant mattes; witnesses give coverage; projector gives environment mattes for glass | Never-seen surfaces still inferred |
| Pixel pipeline | Calibration layer | Spectral characterisation of cameras, lenses, LED walls through Bridge Head logs | Fine |

**How coded light works in practice.** Three steps, each using existing parts. First, Light Coder Pods put small orthogonal codes on LED fixtures, logged with exact phase. Second, the Witness array runs at high rate and demodulates per-light contributions in its views. Third, the solve transfers those per-light ratios to the hero plate using geometry and materials. When the Spectral Back exists, its demodulation tile does this directly behind the hero lens.

## Example kit: one stage, two hero cameras

An illustrative mid-size stage kit needs 44 identical Cores and about 30 Tags; everything else is Heads and Pods. Counts are placeholders to show the shape, not a spec.

| Role | Cores | Head | Pods or Tags fed |
| --- | --- | --- | --- |
| Master clock | 1 | Clock Head |  |
| Hero camera adapters | 2 | Camera Adapter Head |  |
| Co-axial NIR | 2 | Co-axial Splitter + Optic Head (NIR tile) |  |
| Witness array | 16 | Optic Head (12 Witness, 4 Witness-NIR) |  |
| Depth | 2 | Optic Head (ToF tile) |  |
| Polarisation | 2 | Optic Head (Polar tile) |  |
| Environment | 3 | Optic Head (Environment tile) |  |
| Light probes | 3 | Light Probe Head |  |
| Hubs | 4 | Hub Head | 40 Light Coder, 10 Fixture Monitor, 12 Encoder, 24 Floor Tile, 8 Wind, 8 Tag Lamp Pods |
| Pattern projector | 1 | Pattern Projector Head |  |
| Third-party bridges | 2 | Bridge Head (LED wall, lighting desk) |  |
| Scanner | 2 (stacked) | Scanner Head |  |
| Operator stations | 2 | Operator Head |  |
| Ingest | 2 | Storage interface |  |
| **Total** | **44** |  | **102 Pods, \~30 Tags on props, rigs and crew** |

**What the factory actually builds:** one Core design, one Optic Head chassis with five or six sensor tiles, about ten other Head types, about eight Pod types and one Tag. Scaling to a bigger stage means more of the same Cores and Optic Heads, not new products. A Core freed from one job (a probe after the lighting setup is measured) is re-headed for another in seconds.

## Phasing

Build order follows value per module: the Core and time first, because every later Head inherits them for free.

1. **Foundation.** Core, Clock Head, Camera Adapter Head, Optic Head with Witness tile, Hub Head with Encoder and IMU Pods, set brain with the production-layer registry, calibration wand. Delivers: perfect time, camera and lens data, witness coverage, a live map of every production object. Works with any existing camera.
2. **Light and mattes.** Light Coder and Fixture Monitor Pods, Light Probe Head, Tags, Tag Lamp Pods, Co-axial Splitter, Witness-NIR and Depth tiles. Delivers: per-light layers via the witness array, exact contaminant mattes, near-co-axial depth.
3. **Materials and cleanup.** Polar tile, Pattern Projector, Material Scanner, Light Engine, full solve pipeline for scene-space removal. Delivers: relightable materials, glass and liquid mattes, production layer removed in scene space.
4. **Native capture.** Spectral Back camera body, Environment and Sky tiles, Media Head, Floor Tiles. Delivers: the ideal doc's one-axis multi-sensor capture and total coverage.

## Open questions

- [ ] One Core size, or a smaller sibling for low-power Heads such as probes? The plan assumes one Core plus stacking.
- [ ] Which head connector standard: build your own, or adopt an existing high-speed camera-module interface?
- [ ] Partner fixtures with codes built in, or always inline Light Coder Pods?
- [ ] How much solving happens on set versus overnight, which sets compute in Ingest Cores?
- [ ] Tag safety and comfort for actors, and radio rules in each shooting country.
- [ ] Laser use for media capture under set safety rules.

Three real shots run through the stack, step by step: Scenario tests

Twelve stakeholders review the plan: Stakeholder review

How to start alone, self-funded: Solo build plan
