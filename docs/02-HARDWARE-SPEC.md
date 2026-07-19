# 02 — Hardware Specifications

## 1. Master Bill of Materials (BOM)

### Core Tracking Module
* **MCU:** ESP32-S3-WROOM-1 series (minimum 8MB Flash, 2MB PSRAM)[cite: 1, 5].
* **UWB Transceiver:** Decawave/Qorvo DWM3000 module[cite: 1].
* **IMU:** BNO085 breakout sensor package[cite: 1].
* **Power Management:** TP4056 Linear LiPo Charger IC + AP2112K-3.3 Low-Dropout Regulator[cite: 1].
* **Interconnect:** DF40 series high-density board-to-board mezzanine connectors[cite: 1].

### Lighting Hat Accessories
* **LED Driver Infrastructure:** AL8861 or PT4115 constant-current buck LED drivers (banned standard high-frequency PWM switching to prevent camera shutter banding)[cite: 1].
* **Power Delivery:** XT60 surface mount PCB footprints + heavy copper trace sizing to safely sustain continuous 12V-24V input[cite: 1].
* **Emitters:** 5-in-1 RGBCCT analog cinema-grade high-CRI LED strip segments[cite: 1].

### Motion Hat Accessories
* **Drivers:** Trinamic TMC2209 or TMC5160 step/dir packages utilizing UART/SPI communication profiles[cite: 1, 5].
* **Feedback:** AS5600 12-bit magnetic rotary encoder packs deployed directly onto structural shafts[cite: 1, 5].

## 2. Core Module Pin Map Allocation

| Interface | Signal Line | ESP32-S3 GPIO | Execution Target |
|---|---|---|---|
| **Carrier Sensing** | HAT_ID_ADC | GPIO 1 | Reads analog voltage divider to parse profile[cite: 1, 5]. |
| **UWB (SPI)** | UWB_MOSI | GPIO 11 | Master Out Slave In communication to DWM3000[cite: 1]. |
| | UWB_MISO | GPIO 12 | Master In Slave Out communication from DWM3000[cite: 1]. |
| | UWB_SCLK | GPIO 13 | Serial Clock[cite: 1]. |
| | UWB_CS | GPIO 10 | Chip Select[cite: 1]. |
| **IMU / Encoders** | I2C_SDA | GPIO 8 | Shared I2C Data bus for BNO085 / AS5600 arrays[cite: 1, 5]. |
| | I2C_SCL | GPIO 9 | Shared I2C Clock bus[cite: 1, 5]. |
| **Motion Controls**| STEP_AXIS_0 | GPIO 4 | RMT hardware peripheral pulse output[cite: 5]. |
| | DIR_AXIS_0 | GPIO 5 | Direction tracking logic pin[cite: 5]. |
| | MOTOR_EN | GPIO 6 | Active-Low hardware shutdown loop[cite: 5]. |
