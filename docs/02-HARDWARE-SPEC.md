# 02 — Hardware Specifications

## 1. Master Bill of Materials (BOM)

### Core Tracking Module
* **MCU:** ESP32-S3-WROOM-1 series (minimum 8MB Flash, 2MB PSRAM).
* **UWB Transceiver:** Decawave/Qorvo DWM3000 module.
* **IMU:** BNO085 breakout sensor package.
* **Power Management:** TP4056 Linear LiPo Charger IC + AP2112K-3.3 Low-Dropout Regulator.
* **Interconnect:** DF40 series high-density board-to-board mezzanine connectors.

### Lighting Hat Accessories
* **LED Driver Infrastructure:** AL8861 or PT4115 constant-current buck LED drivers (banned standard high-frequency PWM switching to prevent camera shutter banding).
* **Power Delivery:** XT60 surface mount PCB footprints + heavy copper trace sizing to safely sustain continuous 12V-24V input.
* **Emitters:** 5-in-1 RGBCCT analog cinema-grade high-CRI LED strip segments.

### Motion Hat Accessories
* **Drivers:** Trinamic TMC2209 or TMC5160 step/dir packages utilizing UART/SPI communication profiles.
* **Feedback:** AS5600 12-bit magnetic rotary encoder packs deployed directly onto structural shafts.

## 2. Core Module Pin Map Allocation

| Interface | Signal Line | ESP32-S3 GPIO | Execution Target |
|---|---|---|---|
| **Carrier Sensing** | HAT_ID_ADC | GPIO 1 | Reads analog voltage divider to parse profile. |
| **UWB (SPI)** | UWB_MOSI | GPIO 11 | Master Out Slave In communication to DWM3000. |
| | UWB_MISO | GPIO 12 | Master In Slave Out communication from DWM3000. |
| | UWB_SCLK | GPIO 13 | Serial Clock. |
| | UWB_CS | GPIO 10 | Chip Select. |
| **IMU / Encoders** | I2C_SDA | GPIO 8 | Shared I2C Data bus for BNO085 / AS5600 arrays. |
| | I2C_SCL | GPIO 9 | Shared I2C Clock bus. |
| **Motion Controls**| STEP_AXIS_0 | GPIO 4 | RMT hardware peripheral pulse output. |
| | DIR_AXIS_0 | GPIO 5 | Direction tracking logic pin. |
| | MOTOR_EN | GPIO 6 | Active-Low hardware shutdown loop. |
