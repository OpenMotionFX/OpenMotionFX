# 05 — Node V0 Prototype Plan

**Objective:** a bench prototype of the common Node platform (doc 02 §1) that converts every "should work" in the specs into a measured number, and leaves behind the seed of the real firmware. Node V0 is *not* a camera module — it is the platform proof: power, motion, sensing, homing, wireless sync, trajectory execution, safety, and wired fallback, each with its own test firmware and pass/fail criterion.

Node V0 completing its test matrix **is** Phase 0 of the roadmap.

---

## 1. Scope

**In scope:** 2–3 breadboard/protoboard Nodes on ESP32-S3 dev boards; one motorized mini-slider test jig; the `nodev0` test firmware suite; a measurement report.
**Out of scope:** custom PCB (rev A comes in Phase 1 using these measurements), BLDC/SimpleFOC axes (pan/tilt work, Phase 1), enclosures, the Conductor UI (a Python CLI stands in), any module CAD beyond the test jig.

## 2. Exact hardware specification

### 2.1 Node electronics (per node; build 2, ideally 3 for sync testing)

| # | Part | Exact spec | Qty/node | Est. |
|---|---|---|---|---|
| 1 | MCU board | **ESP32-S3-DevKitC-1-N8R2** (8 MB flash / 2 MB PSRAM; N16R8 fine too) | 1 | $7 |
| 2 | Stepper driver | **BigTreeTech TMC2209 V1.3** stepdriver module (UART mode, MS pins for address) | 1 | $4 |
| 3 | Stepper motor | **NEMA17, 1.8°, ≥0.4 N·m, ≤1.5 A/phase** (e.g. 17HS4401 / 42-40 class) | 1 | $9 |
| 4 | Encoder | **AS5600 breakout** + **6×2.5 mm diametrically magnetized magnet** (must be diametric, not axial) | 1 | $2.50 |
| 5 | Endstop | Mechanical microswitch endstop module (lever type, NC wiring) | 1 | $0.60 |
| 6 | CAN transceiver | **SN65HVD230** breakout (3.3 V) | 1 | $1.50 |
| 7 | Power source | **USB-PD trigger board (ZY12PDN-class) jumpered to 12 V** + any 45–65 W PD charger or power bank | 1 | $4 |
| 8 | Buck converter | 12 V→5 V, ≥2 A (MP1584 or LM2596 module) feeding DevKit 5V pin | 1 | $1.50 |
| 9 | Bulk capacitance | 1000 µF 25 V low-ESR electrolytic across the 12 V motor rail (T1 determines the final spec; start big) + 100 nF ceramics | 1 | $0.80 |
| 10 | Wiring | Breadboard/protoboard, DuPont + JST-XH pigtails, XT60 pair (adopt the ecosystem connector now) | — | $6 |

**Per-node electronics ≈ $37.** Two nodes ≈ $74; three ≈ $111.

### 2.2 Mini-slider test jig (one, shared)

The repeatability truth-source. Deliberately the crudest thing that can carry a dial indicator target.

| Part | Spec | Est. |
|---|---|---|
| Extrusion | 2020 V-slot, 300 mm | $4 |
| Motion | GT2 20T pulley (5 mm bore), GT2 6 mm belt 1 m, F623ZZ idler pair, 4× V-slot mini wheels + printed carriage & motor mount (STLs to be drawn — any printed slider gantry pattern works) | $10 |
| Endstop mount + AS5600 mount | Printed; encoder magnet glued into a printed cap on the motor's rear shaft **for T3/T4**, then moved to a printed cap on the **idler shaft for T10** (output-side ground truth, per doc 02 §1) | — |

**Jig ≈ $15–20 + filament.**

### 2.3 Test instruments (owned or one-time)

| Instrument | Purpose | Est. |
|---|---|---|
| **Dial indicator, 0.01 mm, + magnetic base** | The repeatability referee (T5, T10) | $20 |
| **8-ch 24 MHz logic-analyzer clone** (fx2lafw/PulseView) | Sync skew + step-pulse verification (T3, T6, T7) | $12 |
| Multimeter | Power chain (T1) | owned |
| Phone slow-mo camera | Sync-flash frame checks (T11) | owned |

**Total program cost: ≈ $130–170** for 2–3 nodes, jig, and instruments.

### 2.4 Pin map (ESP32-S3-DevKitC-1) — fixed for all V0 firmware

| Signal | GPIO | Notes |
|---|---|---|
| STEP | 4 | RMT TX channel |
| DIR | 5 | |
| EN (TMC2209) | 6 | Active-low; pull-up so motor is disabled at reset — this is the safety latch |
| TMC UART TX | 17 | Single-wire PDN_UART via 1 kΩ from TX, RX teed directly |
| TMC UART RX | 18 | |
| ENDSTOP | 7 | Input, internal pull-up, switch wired **NC to GND** (fail-safe: broken wire = "triggered") |
| I2C SDA / SCL | 8 / 9 | AS5600 (add 4.7 kΩ pull-ups if breakout lacks them) |
| SYNC_OUT | 10 | Logic-analyzer probe point for all timing tests |
| TWAI TX / RX | 47 / 21 | To SN65HVD230 D/R |
| VBUS_SENSE | 1 (ADC1_CH0) | 12 V rail via 100 kΩ/10 kΩ divider (→ ~1.09 V at 12 V) |
| BUTTON | 2 | To GND, internal pull-up |
| STATUS LED | 48 | Onboard WS2812 |
| SYNC_FLASH | 11 | 5 mm white LED + 220 Ω (T11 camera alignment) |

Avoided: 0/3/45/46 (straps), 19/20 (USB), 26–37 (flash/PSRAM region), 43/44 (UART0 console).

## 3. Test firmware suite (`firmware/nodev0/`)

One ESP-IDF (v5.x, C++) project; each test is a component selected by `idf.py menuconfig` or a serial menu at boot. Shared modules developed once and reused: `board.h` (pin map above), `tmc_uart`, `as5600`, `stepgen` (RMT), `sync_clock` (ESP-NOW+TSF), `traj` (segment store/execute), `console` (serial command REPL + CSV telemetry out — all tests log CSV over USB for analysis in Python).

Companion host tooling in `tools/`: small Python scripts (pyserial + matplotlib) per test to capture CSV, compute the statistic, and print **PASS/FAIL against the criteria below**. These scripts are the embryo of the Conductor's device layer.

| ID | Test | Method | Pass criterion (from docs 01/02) |
|---|---|---|---|
| **T0** | Bring-up | Flash; chip info, PSRAM check, WS2812 cycle, button echo | Boots clean, all peripherals enumerate |
| **T1** | Power integrity | Log VBUS_SENSE at 1 kHz while commanding worst-case stepper accel bursts (a) from PD trigger, (b) from 3S LiPo; repeat with 470/1000/2200 µF bulk | No dip <11.0 V; zero brownout resets; **output = the bulk-capacitance + inrush spec for the rev A PCB** |
| **T2** | TMC2209 link | UART: read IFCNT/DRV_STATUS, write microsteps=16, StealthChop on, IRUN/IHOLD; read back | Register echo matches; IFCNT increments; motor audibly silent at idle |
| **T3** | Step generation & lost steps | `stepgen` trapezoid moves; logic analyzer verifies pulse timing at 20 kHz; 100 randomized moves, compare commanded vs AS5600 (motor shaft) each cycle | Pulse jitter <5 µs; cumulative encoder-vs-commanded error ≤1 full step after 100 moves |
| **T4** | Encoder integrity | Static noise capture (10 k samples), then slow full revolution vs step count for linearity | Idle noise ≤±1 LSB (±0.088°); linearity within AS5600 datasheet after magnet-height jig adjustment; **output = magnet mounting-tolerance note** |
| **T5** | Homing repeatability | On jig: 25× (home → move 100 mm → dial-indicator reading) | Spread (max−min) ≤0.02 mm at carriage |
| **T6** | Clock sync | 3 nodes; timekeeper broadcasts ESP-NOW beacons (2 Hz); all toggle SYNC_OUT at each shared-clock 100 ms epoch; logic analyzer measures inter-node skew, 10 min, then repeat next to a busy Wi-Fi AP + streaming video | Skew <100 µs sustained in both RF conditions (stretch: <20 µs); **the doc 01 §2 architecture is validated or revised here** |
| **T7** | Store-and-execute | Python CLI uploads identical piecewise-cubic sine trajectories over Wi-Fi TCP to 2 nodes; broadcast GO; SYNC_OUT toggles at each sine zero-crossing; measure phase agreement over 5 min | Inter-node phase error <1 ms end-to-end; CRC-verified upload; GO→motion latency deterministic ±1 ms |
| **T8** | Deviation watchdog | Run T7 trajectory, physically pinch the belt mid-move | Node flags `DEVIATED` within 50 ms, disables motor via EN latch, reports max error; never silently completes |
| **T9** | CAN fallback | TWAI @ 500 kbps between 2 nodes; mirror beacon/GO/ABORT frames; 10 k-frame soak; ABORT latency test | 0 lost frames; ABORT→motor-disable <5 ms over CAN |
| **T10** | Repeatability integration | Full jig move (0→250 mm→0, eased profile) ×10 with re-home between passes; dial indicator at endpoint and a mid-travel checkpoint; then a 30-min continuous loop for thermal drift | Endpoint spread ≤0.05 mm; mid-point spread ≤0.1 mm; no drift trend over 30 min |
| **T11** | OpenCamera sync *(integration stretch)* | Node fires SYNC_FLASH at T₀ while OpenCamera records (triggered via its remote API if the in-progress OMFX update permits, else manually); 5 takes; locate flash frame in footage | Flash lands within ±1 frame of the same offset across all 5 takes — validates the doc 01 §5 alignment workflow with the real camera app |

## 4. Step-by-step build order

Each stage gates the next; a failure means fix-or-redesign *before* proceeding — that's the point of V0.

1. **Procure** (§2 tables) and print jig parts while parts ship.
2. **Bench bring-up:** wire one node per §2.4 → T0, T2. *(evening)*
3. **Power chain:** add PD trigger + buck + bulk caps → T1 on bare bench (motor on desk, no jig). *(evening)*
4. **Motion:** RMT `stepgen` + motor → T3 with rear-shaft encoder. *(1–2 weekends — first real firmware work)*
5. **Assemble jig**, mount motor/endstop/dial indicator → T4 (magnet jig), T5. *(weekend)*
6. **Second (and third) node build** — now ~1 hr each. → **T6.** *(weekend — the architecture-critical result)*
7. **Trajectory engine + Python CLI** → T7, then T8. *(2 weekends — the largest software item; this code survives into production firmware)*
8. **CAN:** wire transceivers, port the sync frames → T9. *(evening)*
9. **Integration:** move encoder to idler shaft → T10; then T11 with OpenCamera. *(weekend)*
10. **Write the report** (§5) and update docs 01/02 where measurements disagree with the specs.

Realistic calendar: **5–7 weekends**, matching the roadmap's Phase 0 estimate.

## 5. Deliverables & exit gate

1. **Measurement report** (`docs/reports/node-v0-results.md`): every T-number's measured value beside its criterion, PASS/FAIL, and the resulting spec decisions (bulk capacitance, accel caps, sync budget, magnet tolerance).
2. **`firmware/nodev0/`** — test suite + the reusable `sync_clock`, `traj`, `stepgen`, `tmc_uart`, `as5600` components (production firmware seeds).
3. **`tools/`** — Python capture/analysis CLIs (Conductor device-layer embryo).
4. **Go/no-go:** all of T1, T3, T5, T6, T7, T10 PASS → proceed to Phase 1 (rev A PCB + pan/tilt head). Any FAIL → written revision to docs 01/02 first (e.g., T6 fail → CAN-primary architecture; T5 fail → optical endstop variant).

## 6. Known risks specific to V0

- **Breadboard motor wiring**: stepper coil currents on DuPont jumpers cause flaky contact and misleading T3 results — solder JST pigtails for motor and power paths from the start.
- **AS5600 magnet placement** dominates encoder accuracy; build the printed centering jig *before* judging T4 failures as chip problems.
- **Logic-analyzer clone bandwidth** (24 MHz) is ample for µs-class skew but not for ns claims — report T6 results as "<X µs bounded by instrument," which is sufficient against a 100 µs budget.
- **PD charger variance**: run T1 with at least two different PD sources; the spec must hold on the worst one.
