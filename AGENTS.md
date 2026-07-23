# AGENTS.md — Agent Instructions for OpenMotionFX

This file is the canonical, tool-agnostic instruction set for any coding agent working in this
repository — Claude Code, Cursor, GitHub Copilot, Codex, Gemini, or a human following the same
rules. Tool-specific entry points (`CLAUDE.md`, `.github/copilot-instructions.md`, etc.) are thin
pointers back to this file. **Do not fork guidance across those files** — edit it here once.

Read this file completely before writing firmware, host software, schemas, or mechanical/CAD
assets. It is a summary of binding rules; the normative source is
[`docs/SYSTEM-SPECIFICATION.md`](docs/SYSTEM-SPECIFICATION.md). Where this file and the spec
disagree, the spec wins — treat a mismatch as a bug in this file and fix it.

---

## 0. Conformance targets — know which one you're building

The spec defines two targets. Almost everything built right now is **Bring-Up**:

- **Bring-Up Configuration** — commodity parts (ESP32-S3 dev boards, breakout sensors, off-the-shelf
  connectors, FDM-printed mechanicals), buildable and testable by one engineer on a bench. This is
  the current target for all early work.
- **Reference Architecture** — the production target (custom connectors, dedicated hot-swap
  silicon, hardware-signed trust). Don't build Reference-only pieces (Tier 1 secure element auth,
  switched auto-termination, custom pogo connectors) unless a task explicitly says so.

Every requirement below cites its spec section — check the section before assuming a detail.

## 1. Core architectural laws

1. **L1 is the abstraction boundary (spec §4).** Nothing above L1 (host solvers, DCC bridge,
   `.omfx` container, UI) may reference a part number, MCU, or vendor string. Everything is
   addressed through the Node Capability Descriptor's facet list (spec §11). If you catch yourself
   writing `if board == "esp32s3"` above L1, stop — that belongs in L0/firmware only.
2. **One firmware binary per role, driven by runtime detection, not build-time branching for
   hardware identity.** Hardware identity comes from the `ID_SENSE` power-class resistor (§9.2) at
   power-up and the NCD facet list (§11) after bus join — not compile-time `#ifdef` per physical
   unit.
3. **No real-time control-plane dependency for motion.** The host solves the kinematic QP
   *offline*, once per trajectory segment, and uploads polynomial coefficients (§14.2). The Core
   Unit only evaluates `P(t) = Σ a_i t^i` at 1 kHz against its own hardware timer (§13). Motion that
   is already uploaded MUST keep running through a host or Wi-Fi hiccup. Never design a motion path
   that blocks on a live host connection.
4. **Two independent E-STOP paths, deliberately redundant (§7.1, §9.4).** `FAULT_N` cuts local
   drive current in hardware in <10 µs, independent of firmware polling or bus traffic.
   `OMFX-CB` priority-0 frames win bus arbitration by physics (CAN dominant-bit), budgeted at
   ≤300 µs cross-node. Never make cross-node E-STOP depend solely on the bus, and never make local
   fault cutoff depend solely on firmware.
5. **Local-first, zero-cloud.** No remote auth layers, no third-party cloud sync, no telemetry
   phone-home. Capture data stays in local `.omfx` containers (§15).
6. **Unrecognized NCD facets are ignored, not rejected (§11).** Firmware and host code that
   predates a new Function Unit's facet must still get that unit's *known* facets working. Never
   write a facet parser that hard-fails on an unknown `facet` string.
7. **Trunk and Module signal domains never share a connector (§6).** `OMFX-T` (structural,
   user-mated, Node-to-Node) and `OMFX-M` (Core↔Function Unit, factory-mated) carry different
   signal classes. Bridging Function-Unit-level raw driver signals across a structural joint is a
   shock/EMI hazard — treat any design that does this as a hard defect, not a style issue.

## 2. Tech stack & directory map

| Path | Role | Stack |
|---|---|---|
| `firmware/core_unit/` | `OMFX-CU` firmware — bus, control loop, sensors, fault, descriptor tasks (§13) | C/C++, **ESP-IDF v5.5.4** (current v5.x LTS — don't move to v6.x without a deliberate decision, see `firmware/README.md`) on FreeRTOS, ESP32-S3. Avoid Arduino shims in bus timing, motor timing, or ISR-adjacent code paths. |
| `host/` | Conductor Desktop / Hub host process — NCD registry, L2 solvers, `.omfx` I/O, DCC bridge (§14) | Tauri (Rust core + React/TypeScript UI). Rust owns bus/serial parsing and kinematic math (`nalgebra`-class); UI owns 3D viewport + curve editor. |
| `schemas/` | NCD JSON Schema (§11) and any other wire-format schemas | JSON Schema, versioned alongside `ncd_version`. |
| `hardware/` | PCB (Core Unit, Function Units, Hub), mechanical/FDM housings (§17) | KiCad for PCB; STEP/STL for mechanical. |
| `tools/` | Bus sniffers, NCD validators, bring-up bench scripts | Whatever's fastest to write correctly — Python is the default. |
| `docs/` | Normative specs | Markdown. |

### Firmware task set (§13) — do not add tasks outside this table without updating the spec first

| Task | Priority | Responsibility |
|---|---|---|
| `bus_task` | High | `OMFX-CB` RX/TX, priority-band enforcement, `OMFX-SYNC` latch |
| `control_task` | High, 1 kHz timer | Evaluate uploaded trajectory polynomial, drive STEP/DIR or PWM |
| `sensor_task` | Medium | Poll I2C (encoder, IMU), publish shared state |
| `fault_task` | Interrupt-driven | Service `FAULT_N` and hardware overcurrent trips, independent of `control_task` |
| `descriptor_task` | Low | NCD exchange, lifecycle state machine (§9) |

### Data conventions

- Coordinates: Z-up, right-handed, meters, seconds.
- Rotations: quaternions `[q_w, q_x, q_y, q_z]` everywhere — never Euler angles in stored or
  wire-format data.
- Wire format for capability data: NCD JSON (§11), facet-namespaced `domain.subtype.variant`.

## 3. Working conventions for agents

- **Before implementing a hardware-facing feature**, locate its spec section and cite it in the
  PR/commit description (e.g. "implements §9 lifecycle SOFT_START"). If a task has no matching
  section, flag that explicitly instead of inventing behavior.
- **Prefer the Bring-Up part in §18** over inventing a substitute component unless asked to design
  for Reference Architecture.
- **Numbers that are measured, not assumed** (bus latency, sync spread, thermal margins) must be
  recorded from real hardware, not hand-waved — see the verification plan (§19) and don't mark a
  test passed without a real measurement.
- **Don't add cloud, telemetry, or account-system code.** If a task seems to imply one, ask — it
  likely means a local dashboard or local file export instead.
- **Design system for any UI work** (host dashboard, marketing site) lives in
  [`docs/DESIGN-LANGUAGE.md`](docs/DESIGN-LANGUAGE.md) — dark, high-contrast, OKLCH tokens,
  Archivo/Fragment Mono typography. Don't default to a generic Tailwind/Bootstrap look for
  anything user-facing.

## 4. Keeping this file in sync

If you change something this file asserts (a pin map, a task list, a stack choice), update this
file and the relevant `docs/` file in the same change. Tool-specific pointer files
(`CLAUDE.md`, `.github/copilot-instructions.md`) should never need edits for a spec change — they
only point here.
