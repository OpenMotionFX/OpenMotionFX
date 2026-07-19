# 05 — Node V0 Prototype Validation Matrix

This prototype matrix explicitly isolates and tests the custom hardware additions introduced by the System-on-Module (SoM) tracking architecture.

| Test ID | Evaluation Target | Method Mechanics | Operational Pass Threshold |
|---|---|---|---|
| **T-SOM-01** | **Carrier Profile Identification** | Connect fixed resistor networks matching target profiles to the analog ID pin; cycle hardware power 50 times. | System successfully registers 100% profile mapping verification with zero false identification triggers. |
| **T-SOM-02** | **UWB Mesh Construction** | Place 4 prototype tracking modules in an unmeasured, non-standard layout. | MDS execution cycle maps spatial arrangements within 5 seconds with zero manually typed entries. |
| **T-SOM-03** | **Multipath CIR Filtering** | Drive radio transmissions across dense configurations of aluminum and steel infrastructure components. | Microcontroller reliably filters secondary bounce reflections by extracting the leading edge of the CIR graph. |
| **T-SOM-04** | **Clock-Drift Mitigation** | Launch high-frequency continuous ranging iterations between independent microcontrollers over a 1-hour soak window. | DS-TWR execution bounds distance measurement jitter under sub-centimeter targets. |
| **T-SOM-05** | **High-Rate Data Fusion** | Apply rapid acceleration impulses along a physical path; match fused tracking against independent laser metrics. | The ESKF effectively smooths positional output streams to a continuous 400Hz frame output frequency. |
| **T-SOM-06** | **Lighting Hat band mitigation** | Drive continuous illumination loops while evaluating output fields through high-shutter-speed camera viewfinders. | Constant-current output waveforms ensure zero artifact lines or lighting frequency bands across video captures. |
