# firmware/

`OMFX-CU` (Core Unit) firmware — the one binary every field unit runs, with hardware identity
resolved at runtime from the `ID_SENSE` power class (spec §9.2) and the NCD facet list (§11), not
compiled per unit. See spec §13 and `AGENTS.md` §2 for the fixed task set (`bus_task`,
`control_task`, `sensor_task`, `fault_task`, `descriptor_task`).

## Target

- MCU: ESP32-S3 (spec §18.1 — DevKit N8P16 for Bring-Up)
- Framework: ESP-IDF v5.x on FreeRTOS. Avoid Arduino shims in bus timing, motor timing, or
  ISR-adjacent code.
- CAN transceiver: SN65HVD230 via the TWAI peripheral (classic CAN 2.0B, 1 Mbps, spec §7).

## Setup (not yet scaffolded)

```sh
# Install ESP-IDF v5.x: https://docs.espressif.com/projects/esp-idf/en/stable/esp32s3/get-started/
idf.py set-target esp32s3
idf.py build
idf.py -p <PORT> flash monitor
```

`core_unit/` will hold the ESP-IDF project (`CMakeLists.txt`, `sdkconfig`, `main/`) once Phase 0
of `ROADMAP.md` starts. GPIO assignments: spec §20 (confirm against your specific board's
silkscreen before wiring — N8P16 variants reserve GPIO35-37 for octal PSRAM, and GPIO0/45/46 are
strapping pins).
