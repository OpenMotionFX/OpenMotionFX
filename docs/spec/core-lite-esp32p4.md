# Core-lite on ESP32-P4 (digest)

The small grade of the Core, running on boards the owner already has. Status: **no firmware exists; every capability below is untested**.

## Role

- The two ESP32-P4 ETH boards with PoE are Core-lite: PTP master and slave, slider controller, sync LED driver, later LED coder (solo § Your kit)
- This is the "two power grades of one Core" idea from the engineer's review (review § Manufacturer and engineer)
- The switch gives each P4 power, data and time over one cable (solo § New possibilities)
- One daemon, many boards: the same Core software runs on a P4 now and on bigger boards later (solo § Principles kept)
- The P4 does time, control and light capture; it does no heavy ML (solo § Impossible or much harder)

## Phase 0 deliverables

- Network up with fixed addresses or laptop DHCP (solo § Phase 0)
- The PTP component on both P4s, one as master (solo § Phase 0)
- A GPIO pulse on each P4 at every whole PTP second; the sync LED on one P4 (solo § Phase 0)
- Done when there is a number for P4-to-P4 agreement and the laptop shows both P4s and their sync status (solo § Phase 0)
- Head descriptor v0 and the plugin contract are specified in the same phase (solo § Phase 0)

## What the full Core does, for orientation only

- Clock, logic fabric, compute, storage, network, power, self-knowledge and one Head port (stack § The Core)
- Core firmware: Head drivers, timestamping, local recording, health, identity; one image for all Cores (stack § Software stack)

## Later on the same boards

- Motor control with every step and encoder reading stamped in PTP time (solo § Phase 1)
- LED coding driven by a P4; a MOSFET board is enough at first (solo § Phase 6)
- A P4 with a camera module as a hardware-timestamped witness, if the board exposes the connector (solo § New possibilities)
- A carrier board around the P4 with PoE, Head connector, motor driver, encoder input, LED channels, sync LED and IMU (solo § Phase 7)

## What research found (unmeasured)

- Community component `esp_ptp` 1.14.0, Apache-2.0, lists the Waveshare ESP32-P4-ETH as tested (research 02)
- ESP-IDF ships an official PTP example for the P4 that toggles a GPIO for scope comparison (research 02)
- ESP-IDF v6.1 and v5.5.6 were the newest releases on 2026-11-10; this machine has a 5.5 environment (research 02)
- The Waveshare P4-ETH page lists a 2-lane MIPI-CSI connector and a PoE header; it does not say how PoE variants differ (research 02)
- The exact board variant on the bench is unknown (D-0010)

## Proposed approach (not accepted)

- C on ESP-IDF, starting from the official PTP example; timing maths in plain C with no IDF headers so it runs on the laptop (D-0010)

## Tests this component needs

- L1 and L2 on the laptop for all logic that does not touch pins; L4 cards for PTP offset, pulse and LED timing (D-0006)
