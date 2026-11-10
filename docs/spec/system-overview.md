# System overview (digest)

What the whole project is, at solo scale. Citation forms are explained in [INDEX.md](../INDEX.md).

## The idea

- One brain design, one connector, one clock and one data model; specialised "business ends" bolt on (stack § Design philosophy)
- Four layers: Core (brain), Head (sensor, emitter or interface), Body (mechanics, power), Spine (clock, network, power, ingest) (stack § Design philosophy)
- Three brain sizes share clock, protocol and identity: Core, Pod (brainless, fed by a Hub Head), Tag (wireless, tiny) (stack § Design philosophy)
- A Head carries memory with its type, serial, calibration and driver version; plugged in, it needs no configuration (stack § The Core)
- A new Head adds a plugin; it does not change the Core or the central software (stack § Design philosophy)

## The solo-scale version this repository builds

- Two ESP32-P4 boards on a PoE switch are the miniature Spine with two Cores (solo § Solo build plan)
- The phone is the hero camera; one app runs in hero and witness modes (solo § The phone app)
- The slider is the first Head; the dial indicator is its ground truth (solo § Solo build plan)
- The laptop is set brain, solve machine and development bench (solo § Laptop on the network)
- A generic pan-tilt Head is planned; its first implementation is on hold (solo § Phase 3)
- Heavy ML runs on the laptop or rented GPUs, not on the P4 (solo § Impossible or much harder)

## Rules every module follows

- Visible band belongs to the hero image; near-infrared is split into fixed lanes; no ultraviolet (stack § Rules so the stack)
- Every emission is scheduled against the hero camera's exposure and is logged with phase and power (stack § Rules so the stack)
- A dead or missing unit lowers confidence in its region and does not stop the take; every unit records locally (stack § Rules so the stack)
- Open formats at the edges: OpenUSD, OpenEXR, ACES, OpenTimelineIO (stack § Software stack)

## Principles

- Freeze interfaces, not implementations: take package, clock scheme, Head descriptor, plugin contract (solo § Principles kept)
- Measure before you trust: every claim gets a test and a number (solo § Principles kept)
- Every phase ends in a shot the owner needs (solo § Principles kept)
- Write the glue nobody else has; reuse existing tools for the rest (solo § Principles kept)
- Third-party models stay optional plugins or get licensed (solo § Principles kept)
- The same Core software runs on a P4 now and on bigger boards later (solo § Principles kept)

## Phases

- 0 bench and time, 1 slider Head, 2 app verification and sync, 3 pan-tilt and full camera path, 4 colour, keys and mattes, 5 witnesses and removal, 6 light, 7 first PCB (solo § Phases in detail)
- Phases 1 and 2 overlap, and so do 6 and 7; everything else waits on the phase before it (solo § Roadmap)
- Durations assume 15 to 20 hours a week and are planning guesses (solo § Phases in detail)

## What stakeholders asked for that shapes early work

- A fully passive mode that still gives tracking and rig removal (review § Director and cinematographer)
- Phones as witnesses, a printed calibration target, the same file format as studios get (review § Solo, low to zero budget creator)
- Every removal ships with its matte, source views and an off switch (review § VFX artist)
- Nothing in the stack may send commands to stunt, rigging or motion-control systems (review § Large crew)

## Gaps

- The ideal capture spec and the scenario tests were not supplied, so no statement here rests on them (D-0003)
