# OpenMotionFX Roadmap

Phased development roadmap transitioning from breadboard verification to final modular hardware deployment[cite: 1, 3].

---

## Phase A & B: Core Tracking System Prototyping
**Goal:** Verify UWB mesh networking, IMU sensor fusion, and spatial coordinate math on breadboards[cite: 1].
- [ ] Wire ESP32-S3 to DWM3000 UWB transceiver breakout via SPI[cite: 1].
- [ ] Wire BNO085 IMU breakout via I2C for hardware-based quaternion extraction[cite: 1].
- [ ] Implement Double-Sided Two-Way Ranging (DS-TWR) firmware layer[cite: 1].
- [ ] Write the basic Multidimensional Scaling (MDS) auto-ranging algorithm over Wi-Fi[cite: 1].

## Phase C & D: Core Tracking Module PCBs
**Goal:** Shrink the validated brain down into a production-ready System-on-Module (SoM) footprint[cite: 1].
- [ ] Route the universal Core Tracking Module PCB utilizing high-density interconnect headers[cite: 1].
- [ ] Match RF trace impedance for the DWM3000 module layout[cite: 1].
- [ ] Integrate TP4056 1S LiPo charging circuitry and low-dropout (LDO) regulators capable of handling ESP32 Wi-Fi bursts[cite: 1].
- [ ] Validate standalone runtime behavior as a mobile tracking anchor or subject tag[cite: 1].

## Phase E & F: Lighting Hat Development
**Goal:** Construct the hardware and software layers to execute high-rate engine pixel mapping[cite: 1].
- [ ] Build a breadboard interface using logic-level N-Channel MOSFETs (IRLZ44N) to dim 12V/24V high-CRI analog RGBWW strips[cite: 1].
- [ ] Design the production Lighting Hat PCB with constant-current LED drivers to guarantee flicker-free camera performance[cite: 1].
- [ ] Establish the sACN/Art-Net listener loop on the ESP32-S3 to ingest streaming engine color data[cite: 1].

## Phase G: Motion Hat & Camera Slider Integration
**Goal:** Execute precise, repeatable physical movement tied to the spatial coordinator[cite: 1].
- [ ] Design the Motion Hat PCB featuring Trinamic stepper drivers (TMC2209/TMC5160) and breakouts for endstops and AS5600 encoders[cite: 1].
- [ ] Mount mechanical components to 2020 V-slot aluminum extrusions using standard gantry plates[cite: 1].
- [ ] Unify motion control routines with the spatial coordinate framework, allowing automated translation of keyframes into physical movement[cite: 1].
