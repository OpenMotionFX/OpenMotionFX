# OpenMotionFX 🎬

**Open-Source, Cinema-Grade Motion Control & Real-Time Lighting for Virtual Production**

OpenMotionFX bridges the gap between the physical film set and the virtual engine. It is a highly modular, System-on-Module (SoM) hardware and software ecosystem designed to unify camera motion and environmental lighting through spatial tracking. 

Whether you are shooting on a smartphone or a cinema camera, OpenMotionFX dynamically links your practical set to **Unreal Engine** and **Blender** using a self-calibrating ad-hoc Ultra-Wideband (UWB) tracking mesh[cite: 1, 2].

---

## 🚀 The Vision: True Hardware-in-the-Loop Virtual Production
Traditionally, matching real-world practical lighting to a digital scene in VFX is a tedious manual process. OpenMotionFX automates this through **Spatial Digital Twins**.

When you place an OpenMotionFX physical light next to your actor, the system calculates its exact 3D coordinates in the room and instantly spawns a virtual light probe at those exact coordinates in Unreal Engine or Blender[cite: 1]. As the virtual world flickers with fire, explosions, or neon signs, the engine streams that specific RGB data back to the physical light in real-time[cite: 1].

## 🧱 Hardware Architecture: The System-on-Module (SoM) Design
To make OpenMotionFX universally adaptable, the hardware is split into a **Core Tracking Brain** and highly specialized **Carrier Hats (Brawn)**[cite: 1].

### 1. The Core Tracking Module (The Brain)
A tiny, unified PCB containing all tracking, networking, and sensor fusion logic[cite: 1]. It functions completely standalone as an Anchor or a Subject Tracker, or it can be snapped into a Carrier Hat[cite: 1].
* **MCU:** ESP32-S3 (Wi-Fi/UDP streaming, OSC protocols, sACN)[cite: 1].
* **Positional Tracking:** Qorvo/Decawave DWM3000 series UWB utilizing Double-Sided Two-Way Ranging (DS-TWR) and Phase Difference of Arrival (PDoA) for sub-centimeter accuracy[cite: 1].
* **Orientation Tracking:** BNO085 9-Axis IMU (Hardware Sensor Fusion) for absolute 3D orientation (Pitch, Yaw, Roll)[cite: 1].
* **Power:** On-board TP4056 for 1S LiPo battery management[cite: 1].

### 2. The Carrier Hats (The Brawn)
The Core Module connects via high-density headers to specialized carrier boards[cite: 1]. The Core automatically detects which Hat it is attached to via a hardware-ID analog pin and flashes the correct operational profile instantly[cite: 1].
* **The Lighting Hat:** Constant-current RGBWW LED drivers, high-power MOSFETs, and DMX/sACN transceivers[cite: 1]. Runs the engine's pixel-mapped color data[cite: 1].
* **The Motion Hat:** Trinamic (TMC2209/TMC5160) stepper drivers, limit switch inputs, AS5600 magnetic encoder inputs for closed-loop motion control[cite: 1]. Translates keyframes and engine coordinates into physical camera movement[cite: 1].

---

## 📡 Software Architecture: The Orchestrator
The OpenMotionFX Laptop App acts as the master router[cite: 1]. It requires absolutely no manual measurements of your room[cite: 1].

1. **Anchor Self-Calibration:** Place 4+ Core Modules around your room[cite: 1]. The Orchestrator uses Multidimensional Scaling (MDS) to map the dimensions of the room automatically in seconds[cite: 1].
2. **Relative Global Origin:** The system snaps the 0,0,0 origin to the **Subject Node** (your actor)[cite: 1].
3. **Engine LiveLink:** The Orchestrator streams the real-time relative position and orientation of every physical light via **OSC** directly to Unreal Engine/Blender, forcing the digital probes to mimic the real world[cite: 1].
4. **Lighting Loop:** The Engine samples the pixel color data hitting those probes and streams it via **sACN/Art-Net** back to the physical lights[cite: 1].

---

## 🛠 Repository Map
