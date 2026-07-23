# Roadmap

Phased path to a working Bring-Up Configuration (spec §1), verified against the Bring-Up Bill of
Materials (§18) and Verification & Test Plan (§19). Reference-Architecture work (custom
connectors, hot-swap silicon, Tier 1 trust hardware) is intentionally deferred — see §0 of
`AGENTS.md` for why.

Check off items only once measured on real hardware, not assumed from the spec — several spec
values (bus latency, sync spread) are explicitly bounds to be confirmed, not guarantees (§7.1,
§19 T-02/T-06).

## Phase 0 — Bench setup

- [ ] Acquire Bring-Up BOM parts not already on hand (§18.2): TMC2209 UART driver module, NEMA17
      motor, 24V bench supply, soft-start MOSFET or hot-swap IC, 6-pin magnetic pogo connector,
      JST-GH 12-pin connector + crimp kit, 120 Ω termination resistors, M3 heat-set inserts.
- [ ] Confirm on-hand parts match spec role (§18.1): 3× ESP32-S3 DevKit N8P16, AS5600 + magnet,
      MPU6050, SN65HVD230, 8-channel logic analyzer, 3D printer.
- [ ] Wire one ESP32-S3 + SN65HVD230 as a minimal `OMFX-CU`; confirm TWAI (CAN) peripheral
      initializes against the GPIO map in spec §20 (verify against the actual board's silkscreen
      first — N8P16 variants reserve GPIO35-37, and GPIO0/45/46 are strapping pins).

## Phase 1 — Control Bus (`OMFX-CB`)

- [ ] Bring up two Core Units on one CAN segment with fixed 120 Ω termination at both ends (§7.3).
- [ ] Implement dynamic source-address claim from ESP32 factory MAC, with 48-bit tie-break on
      collision (§7.2).
- [ ] Implement the identifier layout and priority-band enforcement (§7.1) — a Function Unit MUST
      NOT be able to emit a non-fault priority-0 frame.
- [ ] **T-02** — saturate the bus with priority-4 traffic, fire a priority-0 frame, confirm
      arbitration win and measure cross-node latency against the ≤300 µs budget.
- [ ] **T-06** — broadcast `OMFX-SYNC` at 100 Hz (§12) from one unit acting as Hub, measure latch
      spread across two Core Units; record the actual figure.

## Phase 2 — Node lifecycle & power

- [ ] Build the `ID_SENSE` resistor-divider power-class detection circuit (§9.2, four classes).
- [ ] **T-01** — verify ADC classification is correct across 3 mate cycles.
- [ ] Implement soft-start (RC-limited MOSFET gate ramp, §9.3) and **T-05** — confirm monotonic
      rise with no inrush/arc transient on a scope.
- [ ] Implement the Hub-side budget precheck (sum coarse classes, refuse ramp if exceeded, §8) and
      **T-07** — hot-plug an over-budget Node, confirm the Hub refuses the ramp and the dashboard
      names the correct demoted Node.
- [ ] Wire `FAULT_N` into the local hardware fault tree (§9.4) and **T-04** — confirm drive current
      cuts within 10 µs, independent of bus traffic.

## Phase 3 — NCD & descriptor exchange

- [ ] Write the NCD JSON Schema (`schemas/ncd.schema.json`) matching §11, and a validator in
      `tools/`.
- [ ] Implement `descriptor_task` (§13): serve the NCD over `OMFX-CB` on `DESCRIPTOR_EXCHANGE`.
- [ ] Implement the full lifecycle state machine (§9): `UNMATED → MATE_DETECT → BUDGET_PRECHECK →
      SOFT_START → BUS_JOIN → DESCRIPTOR_EXCHANGE → AUTH → ACTIVE → MONITOR`.
- [ ] Implement Tier 0 (unsigned, capped ceiling, flagged "unverified") trust handling (§10) —
      Tier 1 secure-element auth is Reference Architecture, not required here.

## Phase 4 — First Actuation Node

- [ ] Assemble one `OMFX-AN`: Core Unit + TMC2209 + NEMA17 + AS5600 encoder + MPU6050, wired per
      the `OMFX-M` pinout (§6.2).
- [ ] **T-03** — confirm AS5600 (0x36) and MPU6050 (0x68) both ACK on the shared I2C bus with no
      stalls at combined poll rate.
- [ ] Implement `control_task` (1 kHz, §13): evaluate an uploaded trajectory polynomial
      `P(t) = Σ a_i t^i` against the hardware timer, with zero dependency on host liveness once a
      trajectory is uploaded.
- [ ] Implement `sensor_task`: publish encoder + IMU state for host consumption.

## Phase 5 — Host (Conductor Desktop)

- [ ] Scaffold `host/` as a Tauri app: Rust core owns CAN/serial parsing, React/TS owns UI.
- [ ] Implement the live NCD registry / topology graph (§14).
- [ ] Implement the kinematic QP solver (§14.2) — solved host-side, offline, once per trajectory
      segment; upload only the resulting polynomial coefficients.
- [ ] Implement the factor-graph state estimator (§14.1) with a runtime-joinable sensor set.
- [ ] Closed-loop demo: host commands a trajectory segment to the Phase-4 Actuation Node, encoder
      feedback flows back through the estimator.

## Phase 6 — Capture path

- [ ] Implement `.omfx` container read/write (§15): media referenced not embedded, telemetry +
      calibration + environment + topology snapshot using the NCD schema directly.
- [ ] Bridge Node (`bridge.usb_cdc`, §16.1): docked capture device pose/IMU/focus-tap re-emitted
      onto `OMFX-CB` with `OMFX-SYNC` timestamping.
- [ ] `OMFX-WTS` (§12, §16.2): undocked Capture Node joins Hub AP, discovered via mDNS,
      timecode-synced over UDP multicast with jitter-scaled covariance.

## Phase 7 — Lighting

- [ ] First Illumination Node (`OMFX-IN`): Core Unit + PWM/current-driver Function Unit + thermal
      sense.
- [ ] Implement the inverse photometric solver (§14.3), re-solved as Illumination Nodes join/leave
      the graph.

## Later / Reference Architecture (not blocking Bring-Up)

- Custom `OMFX-T`/`OMFX-M` connectors, per-port switched auto-termination, dedicated hot-swap
  silicon.
- Tier 1 trust: ATECC608A-class secure element + signed NCDs.
- Production Hub on an embedded Linux SBC (e.g. Raspberry Pi CM4) with Wi-Fi 6E AP (§18.2).
- IMU/encoder upgrade path: BNO085 or ICM-42688-P; AS5047/AS5048A over SPI (§18.3).
