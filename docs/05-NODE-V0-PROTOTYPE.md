# 05 — Node V0 Prototype Validation Matrix

This prototype matrix explicitly isolates and tests the custom hardware additions introduced by the System-on-Module (SoM) tracking architecture[cite: 1].

| Test ID | Evaluation Target | Method Mechanics | Operational Pass Threshold |
|---|---|---|---|
| **T-SOM-01** | **Carrier Profile Identification** | Connect fixed resistor networks matching target profiles to the analog ID pin; cycle hardware power 50 times[cite: 1]. | System successfully registers 100% profile mapping verification with zero false identification triggers[cite: 1]. |
| **T-SOM-02** | **UWB Mesh Construction** | Place 4 prototype tracking modules in an unmeasured, non-standard layout[cite: 1]. | MDS execution cycle maps spatial arrangements within 5 seconds with zero manually typed entries[cite: 1]. |
| **T-SOM-03** | **Multipath CIR Filtering** | Drive radio transmissions across dense configurations of aluminum and steel infrastructure components[cite: 1]. | Microcontroller reliably filters secondary bounce reflections by extracting the leading edge of the CIR graph[cite: 1]. |
| **T-SOM-04** | **Clock-Drift Mitigation** | Launch high-frequency continuous ranging iterations between independent microcontrollers over a 1-hour soak window[cite: 1]. | DS-TWR execution bounds distance measurement jitter under sub-centimeter targets[cite: 1]. |
| **T-SOM-05** | **High-Rate Data Fusion** | Apply rapid acceleration impulses along a physical path; match fused tracking against independent laser metrics[cite: 1]. | The ESKF effectively smooths positional output streams to a continuous 400Hz frame output frequency[cite: 1]. |
| **T-SOM-06** | **Lighting Hat band mitigation** | Drive continuous illumination loops while evaluating output fields through high-shutter-speed camera viewfinders[cite: 1]. | Constant-current output waveforms ensure zero artifact lines or lighting frequency bands across video captures[cite: 1]. |
