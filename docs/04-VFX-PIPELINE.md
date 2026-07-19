# 04 — VFX Pipeline & Engine Integration

## 1. Spatial Digital Twin Execution Loop
OpenMotionFX maintains a bidirectional hardware-in-the-loop tracking ecosystem between the physical stage and the digital design asset.
```
┌────────────────────────┐                    ┌────────────────────────┐
│     PHYSICAL SET       │                    │     VIRTUAL ENGINE     │
│  Actor Tracking Tag    ├──(Real-Time OSC)──►│  Real Camera Viewport  │
│  Modular Light Node    │                    │  Virtual Probe Asset   │
│                        │                    │                        │
│ Analog RGBWW Output    │◄──(sACN/Art-Net)───┤  Virtual Lighting FX   │
└────────────────────────┘                    └────────────────────────┘
```

1. The physical hardware array calculates its real-world positions using the UWB tracking framework.
2. Positional transforms cross the network layer, instantiating synchronized virtual lighting components inside Blender or Unreal Engine Level Sequences.
3. The virtual camera perspective tracks changes in the primary hardware configuration.
4. Color rendering engines evaluate pixel intensity values intersecting the virtual probe array boundaries.
5. Extracted lighting metrics are packetized and streamed back out over production lighting networks via sACN par
