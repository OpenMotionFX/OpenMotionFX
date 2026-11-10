# Solo build plan

Nov 10, 2026

Your kit changes the plan in a good way. Your PoE switch and two ESP32-P4 boards are already a miniature Spine with two Cores: one cable each for power, data and hardware-timestamped time. Your phone is the hero camera, and your existing app becomes the main piece of software, in both hero and witness modes. The slider is the first Head, and your dial indicator is the ground truth that measures it. The Raspberry Pi and Jetson purchases move to later.

The new order: bench and time first (weeks), the slider second because you already own it, then the app's verification and sync. After that comes [deferred, not yet specified], then colour, keys and mattes, then removal with extra witnesses, and light last. Two things in the old plan can't happen on a phone: physical lens encoders and hardware camera sync. Both have good substitutes, explained below.

## Your notes, answered

### Laptop on the network as the test bench: yes

Plug the laptop into any switch port; it doesn't need PoE, so port 5 is ideal. The laptop becomes the set brain, the solve machine and the place you flash and debug the ESP32s over USB. Three practical points:

- **Addresses.** Your switch is unmanaged and has no DHCP server. Either give every device a fixed address, or run a small DHCP server on the laptop's wired port. Keep the laptop's Wi-Fi for the internet.
- **Who is the clock master.** Make one ESP32-P4 the PTP master. Its Ethernet controller has hardware timestamps, and an open-source PTP component for ESP-IDF runs full hardware-timestamped gPTP on the P4, tested on the Waveshare ESP32-P4-ETH ([esp\_ptp](https://components.espressif.com/components/scrambletools/esp_ptp/versions/1.10.0/readme)). The laptop joins as a client. Most laptop network ports timestamp in software only, which is fine for the set brain.
- **The switch.** A consumer unmanaged switch doesn't correct for its own delay, so expect timing in the microseconds rather than the nanoseconds between the two P4s. That is still a thousand times better than you need for phones.

### [deferred, not yet specified]

[deferred, not yet specified]

### Your camera app: a strong base, unverified

The repo already has most of the hero-camera Head: RAW\_SENSOR frames debayered on the GPU, true constant frame rate, flat-log HEVC up to 4096×3072, Gyroflow IMU export, programmed focus, exposure and zoom moves, and a laptop remote with an open API ([OpenCamera](https://github.com/OpenMotionFX/OpenCamera)). The modular structure (separate camera, motion, [deferred, not yet specified] and remote modules) maps cleanly onto Heads and plugins. The verification suite below is how you find out what it really does.

### CorridorKey 2.0: confirmed, plan updated

CorridorKey 2.0 is Corridor Digital's first official plugin. It keys green and blue screens in one click, predicts colour through semi-transparent objects, and uses temporal awareness to avoid flicker. It runs in Resolve, Nuke, After Effects, Premiere and Blender, with a standalone app ([summary](https://zeli.app/es/story/50251127)). A hint is now optional: none, a first-frame matte, or a hint video ([community app wiki](https://github.com/MarcelineVPQ/corridorkey-desktop/wiki/Your-First-Key)). So the "automatic alpha hint" work drops out of the plan. Your system's value moves to hints for hard shots and to mattes beyond green screen. Check the current licence on corridorkey.com before relying on it; one community wiki says organisations over US $20M revenue need paid seats.

## Impossible or much harder

| Idea | Verdict | Why | What to do instead |
| --- | --- | --- | --- |
| Physical lens encoders on the phone | Impossible | The lens is sealed inside the camera module; there are no rings to read | Use the phone's per-frame lens metadata as a "software encoder" (focus distance, focal length, and lens calibration where the phone exposes it), and verify it against targets at measured distances |
| Hardware sync (genlock or trigger) of the phone camera | Impossible on a standard Android phone | Android's camera interface offers no external trigger input | Timestamp every frame in the phone's clock, then map that clock to PTP time with a sync LED the ESP32 blinks (see New possibilities). Sub-millisecond is realistic; microseconds are not |
| Precise tracking with stabilisation on | Very hard | Electronic stabilisation crops and warps every frame; optical stabilisation moves the lens or sensor | Turn electronic stabilisation off for every VFX shot. Ask the phone to turn optical stabilisation off and check the per-frame metadata to see whether it obeyed. If it can't be disabled on the telephoto, treat that lens as lower-accuracy |
| "ACES" straight from the phone | Not true until you build it | ACES needs an input transform measured for this camera; no official one exists for your phone, and a flat-log HEVC file is not ACES | RAW plus your own camera characterisation (chart first, spectral later) gives a real ACES input transform. Until then, call it "log", not ACES |
| True native-resolution open gate | Probably not | 4096×3072 is about 12.6 MP, far below the sensors' native pixel counts, so the image is binned or scaled | It may still be full field of view, which is what matters for VFX. The verification suite checks it |
| Sub-microsecond time across your network | Not with this switch and laptop | Unmanaged switch, and software timestamps on most laptops | Unnecessary now. Microseconds between P4s and sub-millisecond for phones is enough for every phase until light coding |
| [deferred, not yet specified] | [deferred, not yet specified] | [deferred, not yet specified] | [deferred, not yet specified] |
| Heavy ML on the ESP32-P4 | Impossible | It's a microcontroller with no GPU and no room for large models | ML runs on the laptop or rented cloud GPUs; the P4 does time, control and light capture |

None of these blocks the big picture. They move precision from hardware into measurement and software, which the plan already assumed for the final 0.1 pixel.

## New possibilities

1. **The rolling shutter as a precise timer.** The ESP32 blinks a bright LED at known PTP times. A phone's rolling shutter reads the sensor row by row, so the row where the blink starts tells you the time to within one row's readout, a few microseconds to tens of microseconds. That maps the phone's clock onto PTP far better than frame-level sync, with no access to the phone's hardware. This one trick replaces most of what genlock would give you.
2. **Exact camera pose without vision, for slider and [deferred, not yet specified] shots.** Translation comes from the slider encoder (on PTP time), rotation from the phone's gyro (on the phone's clock, mapped by the LED). Together they give a full camera path per frame before any image solve. The image then only refines it.
3. **Your switch is a Spine in miniature.** Each P4 gets power, data and time over one cable. Every Head you build runs on a P4 at first, so the "one cable per unit" idea is proven on your desk.
4. **The P4 as a cheap witness Core.** The ESP32-P4 chip has a camera input and a hardware video encoder. If your board exposes the camera connector, a P4 with a cheap module becomes a hardware-timestamped witness at a fraction of a Pi's cost. Check the connector on your board first.
5. **Automatic HDRI with [deferred, not yet specified].** Your app drives [deferred, not yet specified] through a pan-tilt grid while shooting bracketed RAW, then stitches the light probe. One button per setup.
6. **A screen as a calibration target.** A second phone or laptop screen showing a calibration pattern is perfectly flat with a known pixel pitch. That's ideal for lens calibration of each phone camera at each focus setting.
7. **Audio timecode.** The ESP32 can generate timecode from PTP time as an audio signal. Fed into the phone through a USB-C audio adapter, it lands in the audio track sample-accurately. That is a second, independent sync check.
8. **Hero and witness from one phone.** If your phone allows two of its cameras to stream at once (wide and telephoto), one phone gives a hero view plus a built-in witness with a known baseline. Worth testing early; many phones restrict this.
9. **Coded light the phone can see.** The same rolling-shutter effect that measures time can identify which LED made which light, from the bands it leaves in a short-exposure witness frame. That is a cheap route to per-light layers, later.
10. **Old phones as witnesses and Tags.** Any second-hand Android phone running your app in witness mode is a synced witness with an IMU, for very little money.

## Your kit

| You own | Role now | Becomes |
| --- | --- | --- |
| 2× ESP32-P4 ETH with PoE | Core-lite: PTP master and slave, slider controller, sync LED driver, later LED coder | The small grade of the Core (the engineer's "two power grades" idea from the stakeholder review) |
| TP-Link TL-SG1005P | Spine: power and data to both P4s, laptop on port 5 | Spine |
| Laptop | Set brain, solve, development | Set brain, Ingest |
| Vivo X200 Pro and your app | Hero camera Head | Hero camera, plus witness mode on other phones |
| [deferred, not yet specified] | Pan and tilt (personal use only) | Replaced by a custom pan-tilt Head in the product |
| 2× 2020 V-slot, gantry, belt, pulleys, NEMA 17 and driver | 1-axis slider Head | Slider Head |
| Hall-effect encoder | Slider position on PTP time | Encoder Pod |
| Dial indicator (0.01 mm) | Ground truth for slider repeatability | Your calibration lab's first instrument |
| USB logic analyser | Measures how closely the two P4s agree in time, and checks step pulses, encoder signals and the sync LED | Test bench for timing in every later Head |

**Slider details to settle first.** Confirm the extrusion length (if it's 300 mm, expect roughly 200 mm of travel). Identify the motor by test: the encoder counts steps per revolution, which tells you the step angle. Check what kind of encoder you have. A magnetic angle sensor on the motor shaft with a 20-tooth GT2 pulley gives about 0.01 mm per count at 12 bits, which matches your dial indicator nicely. A simple pulse-type Hall sensor gives far fewer counts, and then the dial indicator becomes essential to calibrate it.

**Short shopping list (all cheap, prices approximate):**

- A bright LED, a resistor and a small transistor or MOSFET for the sync beacon. A few pounds.
- A colour chart (a ColorChecker-type card). Around £60–100.
- A USB-C Ethernet adapter for the phone, so it can join the wired network. Around £15–25.
- One or two second-hand Android phones that support RAW capture, for witnesses. About £50–100 each.
- Later, a camera module for a P4, if your board has the connector.

## The phone app

One codebase, two modes, chosen at launch or by the set brain. Both write the same take-package format.

|  | Hero mode | Witness mode |
| --- | --- | --- |
| Goal | Best image | Best measurement |
| Capture | RAW or log, full pipeline, programmed focus and zoom | Fixed exposure, short shutter, high frame rate, no stabilisation, locked focus |
| Extras | [deferred, not yet specified], moves timeline, monitoring tools | Streams previews to the set brain; can run on cheap old phones |
| Shared | Per-frame metadata log, IMU log, sync events, take ID from the set brain, remote API | Same |

### Phone hardware, used fully

- **Gyro and accelerometer** at the highest rate the phone allows, on the same clock as the camera frames: rotation per frame, rolling-shutter correction, stabilisation in post through Gyroflow.
- **Flashlight** as a sync flash other phones can see, and as a coded light source for tests.
- **Screen** as a sync beacon (a full-screen flash with a timestamp), a calibration pattern, or a slate showing take ID and time.
- **Microphones** for audio timecode and clap sync.
- **Several cameras at once**, if allowed, for a built-in witness.
- **Wired Ethernet over USB-C**, for steadier sync to the set and fast offload.
- **Bluetooth** for [deferred, not yet specified]; **Wi-Fi** for previews and control when cables aren't practical.
- **Magnetometer and barometer**, logged as-is. They are cheap extra clues for the solve.

### The "software encoders": log everything, per frame

Since you can't put encoders on the lens, the per-frame camera metadata is your encoder. Log for every frame: the sensor timestamp and its clock source, exposure time, frame duration, ISO, focus distance, focal length, aperture, crop region, stabilisation modes, any lens calibration and distortion the phone reports, colour gains and colour matrix, and the lens shading map. Whether these values are honest is exactly what the next part tests.

### Verification suite: does the app do what it says?

Build this before adding features. Each test produces a pass or fail plus a number, and runs again after every app update.

| Claim | Test | Pass looks like |
| --- | --- | --- |
| Constant frame rate | Record 10 minutes; analyse frame timestamps | Every frame interval within a small tolerance, no dropped frames |
| Timestamps are real | Film the ESP32 sync LED blinking at known PTP times | Phone-to-PTP mapping stable over the take, drift measured and logged |
| RAW is untouched | Shoot an exposure sweep of a grey card and a dark frame | Linear response, a stable black level, no sharpening or noise reduction visible |
| Log curve is what you think | Same sweep, recorded in log | The measured curve matches the formula in your code |
| Full field of view ("open gate") | Compare a video frame with a full-resolution RAW still of the same scene | Same field of view, or the exact crop is documented |
| Focus pulls hit their marks | Targets at measured distances; command focus to each | Sharpest frame at the commanded distance; the phone's focus calibration level noted |
| Focus metadata is honest | Compare the reported focus distance with the measured one | Error within a known band, per camera |
| Stabilisation really off | Shoot a static grid on a tripod, then tap the tripod | No image warping, and the metadata confirms the modes |
| Gyro aligns with frames | Fast pan, then a Gyroflow sync | Gyroflow finds a consistent, small offset |
| Colour | Chart under a known light | The camera transform built from the chart matches the reference within a target error |

**Be careful with the existing claims.** The README states features; nothing yet shows measured proof. Until a test passes, treat each feature as unverified.

## Roadmap

&#91;embedded content: revised solo roadmap · eight phases over about two years\]

Phases 1 and 2 overlap, and so do 6 and 7; everything else waits on the phase before it.

## Phases in detail

Durations assume roughly 15–20 hours a week and are planning guesses. Phases 1 and 2 can run side by side.

### Phase 0: Bench and time (weeks 0–4)

- **Specify:** take package v0, Head descriptor v0, clock scheme, plugin contract.
- **Build:** the network (fixed addresses or laptop DHCP); the PTP component on both P4s, one as master; a GPIO pulse on each P4 at every whole PTP second; the sync LED on one P4.
- **Measure:** the offset between the two P4s' pulses with the logic analyser, over an hour.
- **Done when:** you have a number for P4-to-P4 agreement, and the laptop shows both P4s and their sync status.

### Phase 1: Slider Head (months 1–3)

- **Build:** slider mechanics; motor control on a P4 with every step and encoder reading stamped in PTP time; moves defined as keyframes; record a hand-driven move and replay it; control from the laptop and from your app's remote API.
- **Measure:** repeatability with the dial indicator at several points along the travel, both directions, 20 passes each. Backlash, belt stretch and the encoder's real resolution all show up here.
- **Film test:** a twinning shot on the slider: you on the left in pass one, on the right in pass two, joined in Resolve or Blender.
- **Done when:** returns to the same point within a measured tolerance, for example ±0.05 mm, and you know why when it doesn't.

### Phase 2: App verification and sync (months 2–5)

- **Build:** the verification suite; per-frame metadata logging; the take-package writer; the LED-to-rolling-shutter sync solver on the laptop; witness mode.
- **Film test:** a slider shot where the camera path comes from encoder plus gyro alone. Place a CG object on a table in Blender and check how well it sticks before any image solve.
- **Done when:** every row of the verification table has a number, and the CG object sticks within a few pixels.

### Phase 3: [deferred, not yet specified] and full camera path (months 5–7)

- **Build:** [deferred, not yet specified]; combined slider and [deferred, not yet specified] moves on one timeline; the full camera path from encoder and gyro, refined against the image; automatic HDRI capture with [deferred, not yet specified].
- **Measure:** [deferred, not yet specified] repeatability using your own tracking.
- **Film test:** a repeatable telephoto move with a clean plate pass. [deferred, not yet specified]

### Phase 4: Colour, keys and mattes (months 7–10)

- **Build:** chart detection and per-camera transforms (wide, telephoto, any witness phones) exported to Resolve; a first real input transform from RAW; CorridorKey 2.0 in the pipeline, with your mattes as hints for hard shots; segmentation mattes and depth; EXR and Cryptomatte export; Blender and Resolve add-ons.
- **Film test:** a green-screen shot keyed in one click and composited into a set extension, with wide and telephoto shots matched before grading.

### Phase 5: Witnesses and removal (months 10–14)

- **Build:** witness phones (second-hand) and, if possible, a P4 witness camera; the registry in the set app; infrared tags (retroreflective tape plus an infrared light, seen by a witness with its infrared filter removed, if one of your witnesses allows that); fills from other views, the set reconstruction and the slider's clean passes.
- **Film test:** a shot with a stand and a rig removed automatically.

### Phase 6: Light (months 14–20)

- **Build:** light passes and HDRI integrated into the set app; LED coding driven by a P4 (a MOSFET board is enough at first); per-light layers from witness rolling-shutter bands; relighting of static elements; ML relighting for people, fed with measured light.
- **Film test:** one shot relit to a different look and compared with a real reshoot.

### Phase 7: First PCB (months 18–24)

- **Build:** a carrier board around the ESP32-P4: Ethernet with PoE, your Head connector, motor driver, encoder input, LED driver channels, the sync LED and an IMU. That is the small Core. Move the slider and LED Heads onto it.
- **Done when:** a Head plugs in and appears in the set app with no configuration. A larger Core (a Pi or Jetson module carrier) follows only when you need on-set compute.

## Principles kept

1. **Freeze interfaces, not implementations.** The take package, the clock scheme, the Head descriptor and the plugin contract are written first and never broken.
2. **Measure before you trust.** Every claim, whether from your app, [deferred, not yet specified] or a model, gets a test and a number.
3. **Your film is the spec.** Every phase ends in a shot you need.
4. **Write the glue nobody else has.** Use Gyroflow, OpenCV, structure-from-motion, splatting, segmentation, CorridorKey and OpenColorIO. Build sync, the registry, fusion and the app.
5. **Watch licences.** Fine for your films; for the product, third-party models stay optional plugins or get licensed. Personal-use code, like [deferred, not yet specified], stays out of the product.
6. **One daemon, many boards.** The same Core software runs on a P4 now and on bigger boards later.

## Budget

Small, because you already own the hard parts: roughly £300–600 over the first year (sync LED parts, colour chart, USB-C Ethernet adapter, one or two used phones, slider bits). Add £300–800 in year two for PCB spins and LED panels. All figures are approximate planning numbers. Rent cloud GPUs for heavy ML instead of buying a big graphics card.

## Not yet

- Raspberry Pi, Jetson, Global Shutter cameras: only when phones and P4s can't do a job.
- A custom pan-tilt Head: only if [deferred, not yet specified].
- Your own ML models: use existing ones; your captured, measured data is the long-term asset.
- A company or investors: after Phase 5 works on your own films.

## Sources

- [esp\_ptp: hardware-timestamped PTP on the ESP32-P4](https://components.espressif.com/components/scrambletools/esp_ptp/versions/1.10.0/readme)
- [OpenCamera, your app](https://github.com/OpenMotionFX/OpenCamera)
- [deferred, not yet specified]
- [deferred, not yet specified]
- [CorridorKey 2.0 summary](https://zeli.app/es/story/50251127)
- [CorridorKey Desktop wiki: hints and licence notes](https://github.com/MarcelineVPQ/corridorkey-desktop/wiki/Your-First-Key)
