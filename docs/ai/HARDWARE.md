# Hardware inventory

What is on the bench, taken from the kit section of the solo plan (solo § Your kit). Scope: physical items this project uses. "UNKNOWN" means nobody has read the label yet; the H-number is the task in [HUMAN_QUEUE.md](HUMAN_QUEUE.md) that settles it. No value here is measured unless it says so.

## Owned

| Item | Role now | Known | Unknown |
| --- | --- | --- | --- |
| 2× ESP32-P4 ETH boards with PoE | Core-lite: PTP master and slave, slider controller, sync LED driver | Believed to be Waveshare ESP32-P4-ETH family | Exact variant, PHY chip, free pins, camera connector present: H-004 |
| TP-Link TL-SG1005P switch | Spine: power and data to both P4s, laptop on port 5 | Unmanaged, 5 ports, no DHCP server | Hardware version and PoE power budget: H-009 |
| Laptop (Windows 11, RTX 4070 Laptop GPU) | Set brain, solve, development | Software timestamps only on its network port (assumed) | Whether its Ethernet port supports PTP at all |
| Vivo X200 Pro | Hero camera | Runs the reference app | Android build, timestamp source, RAW per lens: H-010 and Phase 2 tests |
| 2× 2020 V-slot, gantry, belt, pulleys | Slider mechanics | - | Extrusion length, pulley teeth, belt type: H-008 |
| NEMA 17 stepper and driver | Slider motor | - | Motor model, step angle, driver chip: H-005 |
| Hall-effect encoder | Slider position on PTP time | - | Type (magnetic angle sensor or pulse), resolution: H-006 |
| Dial indicator, 0.01 mm | Ground truth for slider repeatability | Resolution 0.01 mm | Travel range |
| USB logic analyser | Compares the two P4s; checks step pulses, encoder and sync LED | - | Model, channels, sample rate: H-007 |
| A pan-tilt device | Pan and tilt, personal use only | On hold (D-0002) | Everything; not specified in this repository |

## To buy (from the plan; prices are the plan's approximate figures, not checked)

| Item | For | Plan's price | Needed by |
| --- | --- | --- | --- |
| Bright LED, resistor, small transistor or MOSFET | Sync beacon | "a few pounds" | Phase 0 |
| Colour chart (ColorChecker type) | Camera colour transform | £60 to £100 | Phase 4 (useful in Phase 2) |
| USB-C Ethernet adapter | Phone on the wired network | £15 to £25 | Phase 2 |
| 1 or 2 second-hand Android phones with RAW | Witnesses | £50 to £100 each | Phase 5 (useful in Phase 2) |
| Camera module for a P4 | P4 witness, only if the board has the connector | not given | Later |

Before any purchase: price the cheap end concretely (used market, parts already owned) and put the choice in the human queue. Reason: this is a self-funded project and the owner decides every spend.

## Not yet (do not buy)

- Raspberry Pi, Jetson, global-shutter cameras: only when phones and P4s cannot do a job (solo § Not yet).
- A custom pan-tilt Head: waits on the deferred topic (solo § Not yet).

## Software already on the laptop

Run `node tools/doctor.mjs` for the current list. On 2026-11-10 it found ESP-IDF (a 5.5 environment), a JDK, the Android SDK, adb, ffmpeg and Blender, and no C compiler.
