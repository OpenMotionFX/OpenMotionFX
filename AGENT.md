# AI Agent Context & Implementation Directive

This file provides system context, architectural laws, and structural directives for AI coding models (e.g., Claude Code, Cursor, Antigravity) executing tasks inside this repository. Read this file completely before writing firmware, desktop orchestrator code, or engine plugins.

---

## 🦾 Core Architectural Principles

1. **Strict Hardware/Software Separation (SoM Design)**
   * All hardware nodes share the **same core tracking firmware binary**.
   * Hardware identity is determined dynamically at boot via a hardware-ID analog resistor pin. 
   * **Never** hardcode distinct binaries for separate roles; use dynamic feature flags based on the detected hardware profile.

2. **No Real-Time Motion Streaming**
   * Real-time network dependencies for physical motion execution are explicitly banned. 
   * Trajectories must be pre-compiled by the orchestrator, uploaded via the control plane (TCP/WebSocket), stored locally in Node RAM/Flash, and triggered simultaneously via an ESP-NOW broadcast beacon.

3. **Local-First, Zero-Cloud Directive**
   * No remote authentication layers, third-party cloud database syncing, or telemetry calls. 
   * Data storage must remain strictly local (`.omfx` file containers).

---

## 💻 Tech Stack & Coding Conventions

### 1. Firmware (`/firmware`)
* **Framework:** C++ on pure ESP-IDF (v5.x) targeting FreeRTOS. Avoid Arduino abstraction shims in all core synchronization, RF, or motor timing pathways.
* **Peripherals:** Utilize the ESP32-S3's hardware RMT or MCPWM peripherals for precise step generation and driver communication.
* **Task Allocation:**
  * **Core 0:** Low-priority tasks (Wi-Fi control plane, mDNS, JSON configuration parsing, slow telemetry).
  * **Core 1:** High-priority real-time loops (UWB transceivers via high-speed SPI, I2C IMU reads, clock discipline, ESKF computation, motor step generation).

### 2. Orchestrator (`/conductor`)
* **Stack:** Tauri (Rust backend core + React/TypeScript frontend).
* **Rust Role:** Handles serial, UDP/OSC loops, CAN bus parsing, and heavy kinematic matrix math (using `nalgebra`).
* **UI Role:** Standard 3D tracking map rendering (using `Three.js` / WebGL) and a curve graph editor for keyframe generation.

### 3. Move Format (`.omfx`)
* Structural data must conform exactly to Z-up, right-handed coordinates. Units are strictly meters and seconds. 
* All multi-axis rotations must be stored as **Quaternions** $[q_w, q_x, q_y, q_z]$ to permanently neutralize Euler rotation-order bugs.

---

## 🎯 Primary Generation Tasks For AI Agents
When tasked with writing code for this project, focus execution along these distinct modules:
1. **`firmware/src/core_sensing`**: Hardware-ID parsing, BNO085 I2C quaternion streams, and raw DWM3000 register control.
2. **`firmware/src/sync`**: ESP-NOW time synchronization tracking loops, TSF clock calculations, and broadcast trigger handlers.
3. **`conductor/src-tauri/src/kinematics`**: Piecewise quintic/cubic trajectory compilation engines and Multidimensional Scaling (MDS) auto-ranging matrix algorithms.
