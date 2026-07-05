# 02 — Hardware Spec

All modules share one electronics platform and one set of mechanical/electrical standards; per-module sections only describe what differs. Prices are AliExpress/Amazon-class estimates (2026 USD).

## 1. Common platform (every Node)

| Subsystem | Choice | Why / alternatives rejected |
|---|---|---|
| MCU | **ESP32-S3** dev module (~$6) | Wi-Fi + ESP-NOW + BLE on chip; MCPWM/RMT step generation to ~160 kHz (far beyond need); TWAI (CAN) built in. RP2350's PIO has better step timing but no radio — the companion-chip cost erases the win at our tolerances. Lights use **ESP32-C6** (~$5, Wi-Fi 6). |
| Stepper driver | **TMC2209** (~$4/axis) | Silent (StealthChop — matters on set with phone mics), 256 microstep interpolation, UART config. TMC5160 only if a future module needs >2 A. |
| Encoder | **AS5600** 12-bit magnetic (~$2/axis) | 0.088° resolution, contactless, mounts on the *output* shaft (after any reduction) as a deviation watchdog. I2C; one per axis via mux or the S3's two buses. |
| Homing | Mechanical microswitch endstops (~$0.50) | Deterministic. Sensorless StallGuard homing explicitly rejected (tuning-sensitive, unreliable for fine positioning). |
| BLDC axes (pan/tilt/gimbal) | Gimbal motor (2804/GM4108-class, ~$10–15) + **SimpleFOC** driver board (~$8) + AS5600 as the FOC feedback sensor | Zero cogging, silent, smooth at very low speeds where steppers show ripple. Proven combo in the DIY gimbal community. ODrive/moteus rejected: overkill for <500 g payloads. |
| Power input | **12 V bus**, XT60 connector | Matches NEMA17 ratings; sourced from USB-PD trigger board at 12 V (~$5) on any PD power bank, or 3S LiPo, or drill-battery adapter. 24 V rejected: breaks clean PD compatibility for marginal speed gains we don't need. |
| Regulation | 12 V → 5 V buck (~$2) → 3.3 V LDO | Bulk capacitance ≥470 µF per motor node — PD trigger boards can brown out on stepper inrush (bench test in Phase 0). |
| Wired fallback | SN65HVD230 CAN transceiver (~$2) | 3.3 V native, daisy-chain. |
| UI on module | 1 button (function/home), 1 RGB status LED, power switch | State must be readable from across the room: idle / loaded / armed / playing / deviated / fault colors. |
| PCB | One shared **Node board** design: S3 + power + CAN + 2× TMC2209 sockets + 2× SimpleFOC-style BLDC driver footprints + endstop/I2C headers | One board serves every module type; modules differ only in which sockets are populated. JLCPCB-assembled ≈ $12–18/board in small qty; hand-solderable through-hole/castellated variant for pure DIY builders. |

## 2. Mechanical & electrical standards (the "modular" in OpenMotionFX)

- **Structure:** 2020 V-slot aluminum extrusion + 3D-printed brackets (PETG default; ASA outdoors).
- **Mount standard ("OM-Mount"):** every module's top and bottom interface is the same printed quick-release dovetail plate with a known CAD transform, carrying a 3/8"-16 center thread (tripod compatible) + anti-rotation pins. Any module stacks on any module or any tripod; the known transform is what makes kinematic-chain solving (doc 01 §7) possible.
- **Inter-module cabling:** GX16 aviation connectors (keyed, locking, cheap): GX16-4 = 12 V power pass-through + CAN pair. One cable standard for the whole ecosystem.
- **Fasteners:** M3/M5 only, heat-set inserts in printed parts.
- **Print rules:** no supports where avoidable, ≤220 mm bed, documented orientation/infill per part.

## 3. Module spec sheets

### 3.1 Pan/Tilt Head — *the flagship, built first*
- 2× gimbal BLDC + AS5600 (FOC) driving **3D-printed cycloidal reducers ~20:1** (backlash-free by design; open STL bases exist to adapt).
- Range: pan 360° continuous (slip ring optional later; cable-limited ±270° at v1), tilt ±90°.
- Payload: 500 g at 60 mm offset. Top/bottom OM-Mounts, phone clamp with cold shoes.
- Repeatability target: **≤0.02°** output (encoder-verified). Max speed ≥90°/s; smoothness at 0.1°/s matters more.
- **BOM ≈ $75–95.**

### 3.2 Slider
- 500 mm MGN12 rail (~$40, the single biggest cost — a 2040-V-wheel budget variant is a documented option at reduced spec) on 2040 extrusion, GT2 belt, NEMA17 + TMC2209.
- Second NEMA17 socket reserved: belt-driven **focus/zoom takeoff** or future vertical mode counterweight feed.
- Repeatability ≤0.05 mm; speed ≥150 mm/s; OM-Mount carriage + tripod feet + all-up length ≤ carry-on.
- **BOM ≈ $90–110.**

### 3.3 Dolly (floor track)
- **Positive drive is mandatory** — friction wheels can't repeat. GT2 belt laid in cheap PVC/aluminum track sections (belt as rack — printer-community pattern) with pinion drive, or printed rack segments; track sections join with printed splices, so length is arbitrary and packs flat. Curved track: printed curved rack segments (Phase 4; straight first).
- NEMA17 + 5:1 printed reduction; encoder wheel as ground truth; repeatability ≤0.5 mm over 3 m.
- Deck takes OM-Mount modules (head, slider crossways) — this stack is the "cinema rig."
- **BOM ≈ $80–110 + ~$15/m track.**

### 3.4 Turntable
- Direct printed cycloidal on NEMA17 (or BLDC variant), 360° continuous, ≤0.05° repeatability, 5 kg platter rating (products, props, small sets), OM-Mount underside.
- The cheapest module and the best community on-ramp. **BOM ≈ $40–55.**

### 3.5 Focus/Zoom Motor (for phones with lens rigs / real cameras later)
- NEMA14 + GT2 to a standard 0.8-mod focus gear ring; rod/clamp mount.
- Focus position is an axis like any other → focus *pulls are repeatable and land in the move file*, which is lens metadata the VFX pipeline needs anyway.
- **BOM ≈ $35–50.**

### 3.6 Lights
Two fixtures, one electronics stack (ESP32-C6, sACN/Art-Net native, plus full OMP sync so lighting cues are sample-locked to motion — see doc 04 §4):
- **Key light:** 50–100 W CRI 95+ COB (~$15–25), constant-current driver, **>20 kHz PWM or DC dimming only** (flicker-free at any shutter angle — hard requirement), CCT mix (2700 K + 5600 K COBs), passive-preferred cooling, Bowens-compatible printed speedring for cheap softboxes. **BOM ≈ $55–75.**
- **FX/accent light:** SK6812 RGBW pixel bar/panel for effects (lightning, TV flicker, police, fire) — *repeatable across passes*, which is a genuinely rare capability. **BOM ≈ $30–45.**
- Both log calibrated photometric data, not just DMX values (doc 04 §4).

### 3.7 Sync Box
- ESP32-S3, 4× opto-isolated trigger outputs (camera shutter/record, 2.5 mm/LANC-style pigtails), sync-flash LED, audio beep, tally, optional LTC line-out. Timekeeper by default; SoftAP host for infrastructure-free shoots.
- **BOM ≈ $25–35.**

### 3.8 Handheld gimbal — *deliberately deferred*
DJI Osmo Mobile owns handheld stabilization at $80–150 and repeatability is meaningless handheld. OpenMotionFX's pan/tilt head already *is* a stabilized remote head when stacked on moving modules. Revisit only if the community demands it; it's the hardest module with the least VFX value.

## 4. Suite cost summary

| Module | Est. BOM |
|---|---|
| Pan/Tilt Head | $75–95 |
| Slider (500 mm) | $90–110 |
| Dolly + 2 m track | $110–140 |
| Turntable | $40–55 |
| Focus motor | $35–50 |
| Key light | $55–75 |
| FX light | $30–45 |
| Sync Box | $25–35 |
| **Full suite** | **≈ $460–605** |
| **Starter (head + turntable + sync)** | **≈ $140–185** |

(Excludes 3D-printing filament ≈$20–40 total, batteries/power banks users typically own, and a tripod.)

## 5. Phase-0 bench validations (before any module is finalized)

1. ESP-NOW beacon sync accuracy across 6+ nodes near a busy AP (target <100 µs agreement; measure with GPIO toggles + logic analyzer).
2. USB-PD trigger brownout under stepper inrush (defines bulk capacitance + inrush-limit spec).
3. Printed cycloidal wear: 10,000-cycle backlash-growth test (defines reducer service life/material).
4. AS5600 mounting tolerance vs. accuracy (magnet centering jig design).
5. Slider MGN12 vs. V-wheel budget variant: actual repeatability of each, so the spec's claims are measured, not asserted.
