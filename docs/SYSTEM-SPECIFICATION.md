# OpenMotionFX System Architecture Specification

**Document class:** System & Interface Specification
**Applies to:** OpenMotionFX (OMFX) motion-control / lighting / capture node network — hardware, firmware, bus protocol, and host software

---

## 1. Scope

This document specifies the complete OpenMotionFX system: mechanical and electrical unit interconnect, bus protocol, power architecture, unit lifecycle and trust model, capability descriptor schema, firmware and host software architecture, timing synchronization, the `.omfx` capture container, and mechanical fabrication rules.

It covers two conformance targets:

- **Reference Architecture** — the target design for a production network (custom connectors, dedicated hot-swap silicon, hardware-signed trust).
- **Bring-Up Configuration** — a fully specified subset of the Reference Architecture, built from commodity parts (ESP32-S3 dev boards, breakout sensors, off-the-shelf connectors, FDM-printed mechanicals), that a single engineer can fabricate and validate on a bench. Every Reference Architecture requirement has a Bring-Up equivalent; where the two diverge, both are stated explicitly.

Out of scope: DCC plugin implementation details, cinematography workflow, and any cloud/render-farm integration.

## 2. Conformance Language

`MUST` / `MUST NOT` — hard requirement. `SHOULD` / `SHOULD NOT` — strong recommendation, deviation requires justification recorded in the build log. `MAY` — optional, does not affect interoperability.

## 3. Designator Scheme

Every hardware and protocol entity in this specification carries an `OMFX-` designator, assigned once here and used consistently throughout. Designators are part-number-style codes, not spoken abbreviations.

| Designator | Entity |
|---|---|
| `OMFX-CU` | Core Unit — the common MCU/bus/power board present in every field unit |
| `OMFX-FU` | Function Unit — the application-specific board that mates to a Core Unit (actuator driver, lighting driver, sensor bridge) |
| `OMFX-HUB` | Hub — central power source, bus branch driver, wireless access point, host uplink |
| `OMFX-EPU` | Expansion Power Unit — supplemental supply for scaling beyond one Hub's power budget |
| `OMFX-AN` | Actuation Node — Core Unit + motor Function Unit |
| `OMFX-IN` | Illumination Node — Core Unit + lighting Function Unit |
| `OMFX-BN` | Bridge Node — Core Unit + protocol-bridge or raw-sensor Function Unit |
| `OMFX-CN` | Capture Node — software-only descriptor, no dedicated Core Unit (handheld capture device) |
| `OMFX-T` | Trunk Interconnect — structural, user-mated connector between Nodes and between a Node and the Hub |
| `OMFX-M` | Module Interconnect — Core Unit ↔ Function Unit connector, factory/assembly-mated |
| `OMFX-CB` | Control Bus — the message protocol and identifier scheme running on the CAN 2.0B physical layer |
| `OMFX-SYNC` | Wired timing broadcast, carried on `OMFX-CB` |
| `OMFX-WTS` | Wireless TimeSync — UDP multicast timecode path for undocked Capture Nodes |
| `NCD` | Node Capability Descriptor — the facet-based JSON document every unit presents |

A **Node** is any assembled, field-deployable Core Unit + Function Unit pair, or a Capture Node's software equivalent. "Unit" is used when referring to a Core Unit or Function Unit individually; "Node" is used once the two are mated (or, for a Capture Node, once the descriptor is live).

## 4. System Model

```
L4  CREATIVE        Blender / Unreal / Conductor Desktop
L3  DATA             .omfx capture container
L2  MATH             Factor-graph state estimator · QP kinematics solver · photometric solver
L1  NODE ABSTRACTION Node Capability Descriptors (facet model)
L0  PHYSICAL         Core Units, Function Units, Trunk bus, Hub
```

Data flows upward, commands flow downward. No layer above L1 references a part number, MCU, or vendor — every decision above L1 is made against a facet list, never a device-type string.

## 5. Node Classes

| Class | Designator | Composition | Example |
|---|---|---|---|
| Actuation Node | `OMFX-AN` | Core Unit + motor Function Unit (driver, encoder, thermal sense) | Pan/tilt axis |
| Illumination Node | `OMFX-IN` | Core Unit + PWM/current-driver Function Unit + thermal sense | LED fixture |
| Bridge Node | `OMFX-BN` | Core Unit + protocol bridge or raw sensor Function Unit | Phone-to-bus bridge, standalone IMU |
| Capture Node | `OMFX-CN` | Software-only descriptor, no Core Unit hardware | Phone running the capture app |
| Hub | `OMFX-HUB` | Not a Node; owns Trunk power supply, `OMFX-CB` branch drivers, wireless AP, host uplink | — |

## 6. Mechanical & Electrical Interconnect

Two physically distinct, non-interchangeable connectors. A structural stacking joint (Node-to-Node) and a driver-board joint (Core Unit-to-Function Unit, inside one housing) carry different signal classes and MUST NOT share a connector — bridging raw driver-level signals across a structural joint is a shock/EMI hazard, not a cosmetic issue.

### 6.1 `OMFX-T` — Trunk Interconnect (structural, user-mated)

Reference: 6-contact magnetic pogo connector, keyed, with a mechanical index tab. Rated ≥1,000 mate cycles.
Bring-Up: commodity 6-pin magnetic pogo connector (2.5 mm pitch class), printed alignment shroud.

| Pin | Signal | Notes |
|---|---|---|
| 1 | `TRUNK_24V+` | Trunk power |
| 2 | `TRUNK_RTN` | Trunk return |
| 3 | `CAN_H` | Differential pair, twisted |
| 4 | `CAN_L` | Differential pair, twisted |
| 5 | `SHIELD` | Cable shield, electrically separate from `TRUNK_RTN`, terminated to chassis both ends |
| 6 | `ID_SENSE` | Resistor-coded power-class line, read by the upstream unit's ADC before ramp (§9.2) |

### 6.2 `OMFX-M` — Module Interconnect (Core Unit ↔ Function Unit, factory/assembly-mated)

Reference: keyed magnetic connector at reduced pitch, distinct from `OMFX-T`, ≥100 mate cycles.
Bring-Up: JST-GH 12-position, 1.25 mm pitch, latching.

| Pin | Signal | Purpose |
|---|---|---|
| 1–2 | `VCC_3V3`, `GND` | Logic power for Function Unit sensors |
| 3–4 | `VCC_MOT`, `GND` | Switched motor/LED rail, current-limited by the Core Unit |
| 5 | `I2C_SDA` | Shared bus: encoder, IMU, EEPROM/descriptor store |
| 6 | `I2C_SCL` | — |
| 7 | `UART_CFG` | Single-wire driver configuration (e.g. TMC2209 PDN_UART) |
| 8 | `STEP` | Step pulse to motor driver |
| 9 | `DIR` | Direction to motor driver |
| 10 | `PWM_AUX` | LED dimming / auxiliary actuation |
| 11 | `ANALOG_FB` | General analog feedback (current sense / thermistor / load cell — declared in the NCD) |
| 12 | `FAULT_N` | Open-drain, active-low, wired into the unit's local fault tree (§9.4). Hardware path, not firmware-polled. |

Keying MUST make it physically impossible to mate a Function Unit into a Trunk Interconnect port.

## 7. Control Bus — `OMFX-CB`

Classic CAN 2.0B, 1 Mbps, 29-bit extended identifier, physical layer per §7.4. This matches the silicon actually available at this scale (ESP32-S3 TWAI controller and SN65HVD230 transceiver are both classic-CAN parts; neither reliably supports CAN-FD data-phase rates). A single bit-rate bus removes the stub-length sensitivity that a dual-phase CAN-FD bus would introduce on a cable run whose length and node count change every time the rig is re-racked.

### 7.1 Identifier allocation

```
[3-bit priority][8-bit message class][8-bit source address][10-bit reserved]

priority 0 — E-STOP / hardware fault              (reserved, enforced in firmware)
priority 1 — motion control (trajectory update, encoder feedback)
priority 2 — power/hot-swap handshake
priority 3 — OMFX-SYNC timing broadcast (§12)
priority 4 — telemetry / dashboard state
priority 5 — NCD exchange
priority 6-7 — bulk / diagnostic / firmware update
```

A Function Unit attempting to emit a priority-0 frame for a non-fault reason MUST be rejected by its own Core Unit firmware — priority 0 is reserved exclusively for E-STOP so that CAN's dominant-bit arbitration gives it a guaranteed, physics-level win against everything else on the bus.

**Latency budget.** At 1 Mbps an 8-byte frame occupies ≈130 µs including bit-stuffing margin. `OMFX-CB` arbitration is non-preemptive, so worst-case bus-level E-STOP latency is one frame-in-flight (≈130 µs) plus the E-STOP frame's own transmission (≈130 µs) plus stack/ISR overhead — budget **≤300 µs** cross-node. This is a bound, not an assertion; it MUST be measured against real traffic load during bring-up (§19).

`FAULT_N` (§6.2, pin 12) is independent of the bus and cuts local drive current in **<10 µs**; `OMFX-CB` priority-0 handles cross-node propagation, `FAULT_N` handles the local stop, and the two are deliberately redundant.

### 7.2 Addressing

The 8-bit source address is claimed dynamically at bus-join using each Core Unit's ESP32 factory MAC (lower 8 bits, with collision retry using the full 48-bit MAC as tie-breaker) — no DIP switches, no manual configuration.

### 7.3 Termination

Fixed 120 Ω termination at both physical ends of each Hub branch, installed at build time. Per-port switched auto-termination (bus-switch IC per Hub port) is a Reference Architecture enhancement and MAY be added in a later hardware revision; it is not required for Bring-Up.

### 7.4 Physical layer

Twisted differential pair for `CAN_H`/`CAN_L`, foil+braid shield, common-mode choke at every Core Unit `OMFX-CB` ingress point, single-point star ground between power return and signal shield (not a shared plane). Practical bus length at 1 Mbps: keep total trunk run under ~25 m per branch, stub length under ~0.3 m where possible.

## 8. Power Architecture

- Trunk voltage: **24V DC**, matched to commodity stepper driver modules (TMC2209-class parts are rated to ~28-29V).
- Each Core Unit regulates its own 3.3V logic rail from the trunk via an onboard buck converter; `VCC_MOT` (`OMFX-M` pin 3) is a switched, current-limited pass-through of the trunk rail.
- The Hub sums the declared current ceiling of every connected port continuously, not only at connect time, and refuses a soft-start ramp before attempting it if the running total would exceed supply capacity.
- Shedding priority, highest protected first: motor mid-trajectory > armed-but-idle motor > lighting > standalone sensor. The demoted Node is surfaced on the dashboard — a shed is never silent.

## 9. Node Lifecycle

```
UNMATED
   │ magnetic mate detected
   ▼
MATE_DETECT   — ADC read of ID_SENSE resistor divider → coarse power class (§9.2)
   ▼
BUDGET_PRECHECK — Hub sums coarse classes of active ports; reject ramp if exceeded
   ▼
SOFT_START    — controlled MOSFET turn-on, monotonic ramp, 10-50 ms, no inrush spike
   ▼
BUS_JOIN      — Core Unit boots, OMFX-CB init, dynamic address claim (§7.2)
   ▼
DESCRIPTOR_EXCHANGE — Node transmits its NCD (§11) over OMFX-CB
   ▼
AUTH          — trust tier check (§10)
   ▼
ACTIVE        — full power latched, Node participates in control/telemetry traffic
   ▼
MONITOR       — measured current cross-checked against declared max_current_ma;
                 mismatch → fault, independent of the coarse-class hardware trip
   ▼ (fault / priority shed / unplug)
UNMATED
```

### 9.1 Rationale for pre-power classification

A full NCD cannot be read before the trunk rail is live without a dedicated low-voltage sideband channel, which `OMFX-T` does not carry. Instead, `ID_SENSE` encodes a coarse power class via a fixed resistor value, read by the upstream unit's ADC — the same classification pattern used by PoE and USB-C CC resistor coding. This makes a budget pre-check possible before any current flows; the precise, per-unit `max_current_ma` from the full NCD is cross-checked afterward during MONITOR.

### 9.2 Power classes

| Class | Resistor (to `TRUNK_RTN`) | Ceiling |
|---|---|---|
| A | 1.0 kΩ | 500 mA |
| B | 4.7 kΩ | 1.5 A |
| C | 10 kΩ | 3.0 A |
| D | 22 kΩ | 6.0 A |

### 9.3 Soft-start

Controlled P-MOSFET gate ramp (RC-limited or dedicated hot-swap controller in the Reference Architecture) — monotonic rise, no pogo-contact arcing.

### 9.4 Local fault path

`FAULT_N` lines are wired open-drain onto a per-Node fault rail that directly gates the local motor/LED driver enable line in hardware — this trip does not wait on firmware polling or bus traffic.

## 10. Trust Model

| Tier | Requirement | Behavior |
|---|---|---|
| Tier 0 — Open | Any NCD, unsigned | Capped conservative current ceiling, flagged "unverified" on dashboard, MONITOR-phase current cross-check still enforced |
| Tier 1 — Certified | NCD signed against a factory-provisioned secure element (ATECC608A-class) and a project root key | Full declared current ceiling honored |

Tier 0 exists so the network stays open to third-party and hobbyist Function Units by default; nothing is bricked for lacking a certificate. Tier 1 hardware is a Reference Architecture item and is not required to bring up the system end to end.

## 11. Node Capability Descriptor (NCD)

One schema for every Node class, hardware or software, built from composable facets rather than a fixed type enum. An unrecognized facet MUST be ignored, not rejected, so firmware predating a future Function Unit's facet still gets that unit's known facets working.

```json
{
  "ncd_version": "1.0",
  "unit_uid": "esp32-mac-based-uid",
  "product_name": "Actuation Node — Pan Axis",
  "capabilities": [
    {
      "facet": "actuator.rotary.stepper",
      "params": { "driver": "TMC2209", "interface": "uart+step_dir", "gear_ratio": 5.18 }
    },
    {
      "facet": "sensor.encoder.magnetic",
      "params": { "part": "AS5600", "interface": "i2c", "resolution_bits": 12 }
    },
    {
      "facet": "sensor.imu.6axis",
      "params": { "part": "MPU6050", "interface": "i2c", "address": "0x68" }
    },
    {
      "facet": "sensor.thermal",
      "params": { "location": "driver_case", "warn_c": 65, "shutdown_c": 80 }
    }
  ],
  "power": {
    "max_current_ma": 1200,
    "startup_inrush_ma": 1800,
    "power_class": "C"
  },
  "connection": { "mode": "wired_bib | docked_wired | undocked_wireless" },
  "auth": { "tier": 0 }
}
```

Facet names are namespaced `domain.subtype.variant`. Reference facet families: `actuator.rotary.*`, `actuator.pwm.*`, `sensor.encoder.*`, `sensor.imu.*`, `sensor.thermal`, `sensor.camera.*`, `sensor.lidar.*`, `bridge.usb_cdc`, `bridge.trigger`.

## 12. Timing & Synchronization

No unit in this system carries dedicated IEEE-1588 timestamping hardware, so synchronization is done at the protocol level rather than assumed from silicon:

- The Hub broadcasts a priority-3 `OMFX-SYNC` frame on every branch at a fixed interval (default 100 Hz).
- Each Core Unit latches its local hardware timer on `OMFX-SYNC` frame reception at the `OMFX-CB` peripheral, giving few-microsecond-class alignment across wired Nodes without requiring a PTP grandmaster.
- Wireless (undocked Capture Node) units cannot get sub-millisecond alignment over a contention-based Wi-Fi MAC regardless of clock quality. They use `OMFX-WTS`: the Hub multicasts the same running timecode over UDP, the Capture Node timestamps locally against it, and the factor graph (§14) treats it as a higher-covariance, latency-compensated sensor rather than a pretend-synchronous Node. Covariance scales with measured round-trip jitter, using the same mechanism that scales visual-odometry covariance with motion blur.
- Docked Capture Nodes (via the Bridge Node, §16) receive `OMFX-SYNC` like any other wired Node and do not need `OMFX-WTS`.

## 13. Core Unit Firmware Architecture

Target: ESP32-S3, FreeRTOS. Fixed task set:

| Task | Priority | Responsibility |
|---|---|---|
| `bus_task` | High | `OMFX-CB` RX/TX, priority-band enforcement, `OMFX-SYNC` latch |
| `control_task` | High, timer-driven (1 kHz) | Evaluates the uploaded trajectory polynomial, drives STEP/DIR or PWM output |
| `sensor_task` | Medium | Polls I2C bus (encoder, IMU), publishes to shared state |
| `fault_task` | Interrupt-driven | Services `FAULT_N` and hardware overcurrent trips, independent of `control_task` |
| `descriptor_task` | Low | Serves NCD exchange, lifecycle state machine (§9) |

The control loop MUST remain deterministic through a host/Wi-Fi hiccup: the host solves the kinematic QP once, offline, and uploads polynomial coefficients; the MCU only evaluates `P(t) = Σ a_i t^i` at 1 kHz against its own hardware timer, with no dependency on host liveness for already-uploaded motion.

## 14. Host Software Architecture

**Conductor Desktop / Hub host process** owns:

- NCD registry and live topology graph (which facets are active, on which Node, right now)
- The three L2 solvers (below)
- `.omfx` read/write
- DCC bridge (viewport mirroring, live telemetry stream)

### 14.1 State estimation — factor graph

$$X^* = \arg\min_{X} \sum_{k \in S(t)} \|z_k - h_k(X)\|^2_{\Sigma_k(t)}$$

Sensors join/leave the active set $S(t)$ at runtime; each is weighted by its live covariance $\Sigma_k(t)$, which is where `OMFX-WTS` jitter and VIO motion-blur both feed in as the same mechanism applied to different sensors.

### 14.2 Kinematic execution — quadratic program

$$\min_{\dot q} \tfrac{1}{2}\dot q^T W \dot q + c^T \dot q \quad \text{s.t.} \quad J(q)\dot q = v_{target},\ q_{min}\le q\le q_{max},\ |\dot q|\le \dot q_{max}$$

Solved host-side, offline, once per trajectory segment; only the resulting polynomial is uploaded to the Core Unit (§13).

### 14.3 Lighting — inverse photometric optimization

$$\min_{u \ge 0} \tfrac{1}{2}\|A(X_{lights})u - b_{target}\|^2 + \lambda\|u\|^2$$

Re-solved as Illumination Nodes are added or removed from the graph.

## 15. `.omfx` Capture Container

```
scene_shot_01.omfx
├── media/          video.mov, audio.wav        (referenced, never routed over OMFX-CB)
├── telemetry/      pose.bin (6-DoF), imu_raw.bin
├── calibration/    lens_profile.json, color_manifest.json
└── environment/    lighting_data.json
```

The Trunk bus carries control and telemetry only — poses, IMU samples, timecode, focus taps. Video is transported separately (local storage, Wi-Fi transfer to Hub uplink) and cross-referenced into the container by timestamp; a 1 Mbps bus has no business carrying a video stream. The container also stores the topology snapshot: which Nodes were present and which facets were active at capture time, using the NCD schema of §11 directly, so reopening a file later shows exactly what was live rather than a device-type string that may no longer exist in the catalog.

## 16. Capture Node

### 16.1 Docked

Capture device → USB-C → Bridge Node (`bridge.usb_cdc` facet). The Bridge Node re-emits the device's pose/IMU/focus-tap stream onto `OMFX-CB` with the same `OMFX-SYNC`-latched timestamping every wired Node gets. The device's own video stream stays on local storage; only telemetry crosses the bridge. The Bridge Node mounts via `OMFX-T` like any structural unit.

### 16.2 Undocked

The Capture Node joins the Hub's own Wi-Fi AP (not venue Wi-Fi), discovered via mDNS, synchronized via `OMFX-WTS` (§12).

### 16.3 Conformance baseline

| Facet | Requirement |
|---|---|
| `sensor.camera.manual_exposure` | Direct sensor-level shutter/ISO/gain access |
| `sensor.camera.log_raw` | Log/RAW-adjacent capture, tagged with `color_manifest.json` |
| `sensor.imu.raw` + `sensor.pose.fused_secondary` | Raw IMU at native rate; platform world-tracking pose only as a secondary fused reference, never sole source |
| `sensor.lidar.depth_passthrough` | Raw depth stream where present |
| Focus-tap broadcast | Resolved focal distance emitted immediately, docked or undocked |
| Capability re-broadcast | On any connection-state change |
| Physical button mapping | Hardware capture button maps to the rig's "Mark Keyframe" action |

## 17. Mechanical Design Rules (FDM)

- Material: PETG for any housing adjacent to an LED driver or motor case (thermal margin over PLA); PLA acceptable for unheated structural brackets.
- Print orientation: connector-facing surfaces printed flat-down against the bed for dimensional accuracy of the magnet/pogo pocket.
- Tolerance: design mating features with 0.2–0.3 mm clearance for FDM shrink; verify on first article before batch-printing a rig's worth of housings.
- Magnet pockets: press-fit for alignment magnets, sized per the actual magnet batch (measure, don't assume catalog dimension).
- Fasteners: M3 heat-set brass inserts at every Node-to-carriage mounting point, not printed threads.
- Every housing MUST expose the `OMFX-T`/`OMFX-M` keying feature physically, not just electrically — a Function Unit should be mechanically impossible to seat in the wrong orientation.

## 18. Bring-Up Bill of Materials

### 18.1 On hand — mapped to spec role

| Part | Role |
|---|---|
| ESP32-S3 DevKit N8P16 ×3 | 1× `OMFX-AN` Core Unit MCU, 1× second `OMFX-AN`/`OMFX-BN` Core Unit MCU, 1× `OMFX-HUB` controller for bring-up (production Hub target: embedded Linux SBC, §18.2) |
| AS5600 + magnet | `sensor.encoder.magnetic`, Actuation Node feedback (I2C) |
| MPU6050 | `sensor.imu.6axis`, Bring-Up grade (§18.3 notes production alternative) |
| SN65HVD230 | `OMFX-CB` transceiver, matches classic-CAN physical layer (§7) |
| 8-channel logic analyzer | Bus/protocol bring-up validation (§19) |
| 3D printer | Housings, connector shrouds, cable strain relief (§17) |

### 18.2 Recommended purchases

| Part | Reason |
|---|---|
| TMC2209 stepper driver module (UART variant) | Matches `OMFX-M` `UART_CFG`/`STEP`/`DIR` pinout, silent operation, up to 28-29V |
| NEMA17 stepper motor | Pan/tilt axis actuator |
| 24V DC bench supply or SMPS brick | Trunk power |
| P-MOSFET + gate resistor (soft-start) or dedicated hot-swap IC (e.g. LTC4234-class) | §9.3 soft-start |
| 6-pin magnetic pogo connector set | `OMFX-T`, Bring-Up |
| JST-GH 12-pin connector + crimp kit | `OMFX-M`, Bring-Up |
| 120 Ω through-hole resistors | Fixed bus termination (§7.3) |
| M3 brass heat-set inserts | Mechanical (§17) |
| Raspberry Pi CM4 (or similar SBC) | Reference-Architecture `OMFX-HUB` target: Wi-Fi 6E AP + heavier host duties beyond bring-up scope |

### 18.3 Sensor upgrade path

MPU6050 is a Bring-Up-grade IMU (no onboard sensor fusion, notable gyro bias drift). Reference Architecture target: BNO085 (onboard fusion) or ICM-42688-P (low-noise, high-ODR) on the same I2C bus, drop-in against the `sensor.imu.6axis`/`9axis` facet without touching L1 or above.

AS5600 (12-bit, I2C, ~1 kHz max practical read rate over shared bus) is adequate for Bring-Up closed-loop demonstration. Reference Architecture target: AS5047/AS5048A (SPI, higher update rate, dedicated bus) for production-quality trajectory tracking.

## 19. Verification & Test Plan

| ID | Test | Equipment | Pass criteria |
|---|---|---|---|
| T-01 | `MATE_DETECT` resistor classification | Logic analyzer on `ID_SENSE` + multimeter | ADC reading maps to correct class (§9.2) across 3 mate cycles |
| T-02 | `OMFX-CB` arbitration under load | Logic analyzer on `CAN_H`/`CAN_L`, CAN protocol decode | Priority-0 frame wins arbitration against saturated priority-4 traffic; measured latency within §7.1 budget |
| T-03 | I2C shared-bus integrity | Logic analyzer on `SDA`/`SCL` | AS5600 (0x36) and MPU6050 (0x68) both ACK, no bus stalls at combined poll rate |
| T-04 | Local fault path | Multimeter/scope on `FAULT_N` and driver enable | Motor drive current cut within 10 µs of `FAULT_N` assertion, independent of bus traffic |
| T-05 | Soft-start ramp | Scope on `TRUNK_24V+` at the port | Monotonic rise, no negative-going transient (arc/inrush signature) |
| T-06 | `OMFX-SYNC` frame timing | Logic analyzer, two Core Units | Cross-node timestamp latch spread within target (record actual figure — do not assume) |
| T-07 | Power budget shed | Two Nodes, one over-budget hot-plug | Hub refuses ramp on the offending port, dashboard reports the correct demoted Node |

## 20. Appendix — Indicative ESP32-S3 DevKit GPIO Map

Confirm against the specific board's silkscreen before wiring; N8P16 variants using octal PSRAM reserve GPIO35-37 internally, and GPIO0/45/46 are strapping pins requiring care.

| Signal | Suggested GPIO |
|---|---|
| `CAN_TX` / `CAN_RX` (to SN65HVD230) | 17 / 18 |
| `I2C_SDA` / `I2C_SCL` | 8 / 9 |
| `UART_CFG` (TMC2209) | 43 |
| `STEP` / `DIR` | 4 / 5 |
| `FAULT_N` (input, interrupt) | 6 |
| `ID_SENSE` (ADC) | 1 |
| `PWM_AUX` | 2 |
