# OpenMotionFX

**Open-source motion-control / lighting / capture node network for virtual production.**

OpenMotionFX is a modular hardware and software system: interchangeable Nodes (motion axes,
lighting fixtures, sensor bridges, capture devices) mate onto a shared power+data Trunk bus and
present themselves to host software through a self-describing capability schema — no fixed
device-type catalog, no hardcoded wiring.

Full normative spec: [`docs/SYSTEM-SPECIFICATION.md`](docs/SYSTEM-SPECIFICATION.md).
Visual/brand design system: [`docs/DESIGN-LANGUAGE.md`](docs/DESIGN-LANGUAGE.md).
Working here as a human or an AI agent: [`AGENTS.md`](AGENTS.md).

---

## What it is

- **Core Unit (`OMFX-CU`)** — one common MCU/bus/power board, present in every field unit.
- **Function Unit (`OMFX-FU`)** — the application-specific board that mates to a Core Unit: motor
  driver, LED driver, sensor bridge.
- **Hub (`OMFX-HUB`)** — central power source, bus branch driver, wireless AP, host uplink.
- **Trunk (`OMFX-T`)** — the user-mated, structural, magnetic connector chaining Nodes and Hub
  together: 24V power + CAN bus + power-class sense, on one 6-pin interconnect.
- **Control Bus (`OMFX-CB`)** — classic CAN 2.0B at 1 Mbps. Priority-based arbitration gives
  hardware E-STOP a guaranteed win against all other bus traffic.
- **Node Capability Descriptor (NCD)** — every Node, hardware or software, describes itself as a
  list of composable facets (`actuator.rotary.stepper`, `sensor.imu.6axis`, …) rather than a fixed
  type. Host software and firmware never reference a part number above the abstraction line — see
  spec §4, §11.
- **Conductor Desktop** — the host process: live NCD/topology registry, three math solvers (state
  estimation, kinematic QP, inverse photometric lighting), `.omfx` capture container I/O, DCC
  bridge to Blender/Unreal.

Two conformance targets, defined in the spec: a **Bring-Up Configuration** buildable from
commodity parts by one engineer on a bench, and a **Reference Architecture** production target.
Everything currently being built targets Bring-Up first.

## Repository layout

```
docs/            Normative system spec + design language
AGENTS.md        Canonical agent/contributor instructions (tool-agnostic)
firmware/        OMFX-CU firmware (ESP32-S3 / ESP-IDF / FreeRTOS)
host/            Conductor Desktop host app (Tauri: Rust + React/TypeScript)
hardware/        PCB (KiCad) and mechanical (FDM housing) design files
schemas/         NCD JSON Schema and other wire-format schemas
tools/           Bus sniffers, NCD validators, bench scripts
```

## Status

Pre-hardware. Currently building the Bring-Up Configuration end to end per
[`ROADMAP.md`](ROADMAP.md) — CAN bus bring-up, one Actuation Node, one Hub, closed-loop motion
against a host-solved trajectory.

## License

Software (`firmware/`, `host/`, `tools/`, `schemas/`) is MIT-licensed — see [`LICENSE`](LICENSE).
Hardware designs (`hardware/`) are CERN-OHL-W-2.0 — see [`hardware/LICENSE`](hardware/LICENSE).
