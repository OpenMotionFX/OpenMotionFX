# OpenMoCo

**Open-source, cinema-grade, modular motion control for smartphone filmmaking and VFX.**

> Status: **Planning / pre-build.** This repo currently contains the project vision, specifications, and roadmap. No hardware or code exists yet. Nothing here is published or announced.

---

## The pitch

Repeatable camera motion — the ability to run the exact same move twice — is the foundation of multi-pass VFX: clean plates, crowd duplication, scale tricks, impossible transitions, product shots, seamless set extensions. Today it is priced like this:

| Tier | Example | Price | Repeatable? |
|---|---|---|---|
| Consumer | Cheap slider, DJI Osmo Mobile | $50–200 | No |
| Prosumer | Edelkrone, Kessler | $1,000–3,500+ | Partially, app-gated |
| Professional | Mark Roberts Bolt | $68,000–275,000 | Yes |

**There is nothing in between, and nothing at all built smartphone-first.** OpenMoCo targets a full multi-axis, VFX-repeatable, wirelessly synchronized motion + lighting suite for **under ~$400 in parts**, built from 3D-printer-ecosystem components anyone can order.

## Why open source, and why now

Market research (2026) shows the commercial field failing in exactly the ways openness fixes:

- **Buggy, abandoned apps** are the #1 complaint against Edelkrone and Kessler gear.
- **Subscriptions** gate features on hardware people already own (Kessler kOS).
- **Companies die and strand owners** — Rhino Camera Gear shut down in January 2025; its hardware has no support path.
- **The open-source moco space is a graveyard**: Dynamic Perception's OpenMoCo/nanoMoCo is semi-abandoned; everything since is single-author, single-purpose repos with no shared protocol.

OpenMoCo is **local-first** (no cloud, no accounts, works forever), **protocol-first** (any hardware speaking the protocol joins the ecosystem), and **VFX-first** (every design decision serves repeatability and 3D-software round-tripping).

## What the system is

A **laptop app (the Conductor)** wirelessly commands a fleet of **modules (Nodes)**:

- **Pan/Tilt Head** — brushless, silent, zero-backlash printed cycloidal gears
- **Slider** — 500 mm linear rail, belt-driven
- **Dolly** — floor track, positively driven (no wheel slip)
- **Turntable** — for product/prop passes
- **Focus/Zoom motor** — clamps to phone rigs with lens attachments
- **Key/Fill/FX Lights** — high-CRI COB + addressable pixels, sACN/Art-Net-compatible
- **Sync Box** — trigger outputs, tally, sync flash for frame alignment

Every module: same MCU platform (ESP32-S3), same connectors, same wireless protocol, same mechanical mounting standard. Modules stack — head on slider on dolly — and the Conductor treats the stack as one kinematic chain.

**The core trick for cinema-grade sync over cheap radio:** moves are compiled by the laptop and *pre-loaded* into every module; a single broadcast **GO** beacon (microsecond-accurate ESP-NOW time sync) starts all of them, and each module executes its trajectory deterministically on local hardware timing. The network never carries real-time motion, so Wi-Fi jitter can't ruin a take. A $2-per-node wired CAN bus is the belt-and-suspenders fallback.

**The VFX pipeline:** every take produces a *move file* — per-frame camera position, rotation, lens metadata, and lighting state — that exports to **Blender and Unreal Engine** (FBX + USD + native JSON). The reverse also works: design a move in Blender, and the rig performs it physically.

## Design principles

1. **Repeatability over speed.** A phone weighs <300 g; we spend the torque surplus on precision.
2. **The network is untrusted.** All timing-critical execution is local to each module.
3. **Boring parts, clever geometry.** NEMA17s, GT2 belts, MGN12 rails, AS5600 encoders, 2020 extrusion — the 3D-printer supply chain. Novelty lives in printed parts and firmware, not exotic components.
4. **Every take is data.** If it happened on set, it lands in the move file.
5. **No module is mandatory.** A lone pan/tilt head is a complete product. Everything else is additive.
6. **Documentation is a deliverable.** Bad docs are a top complaint against commercial gear; ours are part of the spec.

## Repository map (planned)

```
README.md                     ← you are here
ROADMAP.md                    ← phased plan, milestones, open questions
docs/
  01-SYSTEM-ARCHITECTURE.md   ← topology, wireless sync, move file format
  02-HARDWARE-SPEC.md         ← platform + per-module spec sheets + BOMs
  03-SOFTWARE-SPEC.md         ← firmware, desktop app, Blender/UE plugins
  04-VFX-PIPELINE.md          ← round-tripping, lighting recreation, sync practice
firmware/                     ← (future) per-module ESP32 firmware
conductor/                    ← (future) desktop controller app
plugins/                      ← (future) Blender add-on, UE plugin
hardware/                     ← (future) CAD, STLs, PCB, wiring
```

## Naming note

"OpenMoCo" was the name of Dynamic Perception's (now dormant) project from the early 2010s. Before any public release, either confirm the name is free to reuse (their trademark almost certainly lapsed, but check) or pick a fresh name. Candidates worth considering later: *Repeat*, *TakeTwo*, *MoCoKit*, *Encore*.

## License intent (decide before first publish)

- Firmware & software: **GPLv3** (keeps derivatives open — the ecosystem's protection against a closed fork)
- Hardware (CAD/PCB): **CERN-OHL-S**
- Docs: **CC-BY-SA 4.0**
- The wire protocol spec itself: **CC0** — anyone, including commercial vendors, should be free to implement it. Ecosystem > code.
