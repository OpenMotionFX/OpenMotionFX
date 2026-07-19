# 03 — Software Specifications

## 1. Core Module Initialization & Boot Architecture

```c
// Pseudo-code execution sequence inside main firmware application
void app_main(void) {
    // Initialize primary system peripherals
    init_adc_peripheral();
    
    // Read the hardware identification pin configuration
    float hat_voltage = read_voltage_average(HAT_ID_ADC_CHANNEL, 32);
    
    if (hat_voltage < 0.2V) {
        // Standalone Mode Configuration
        initialize_standalone_anchor_profile();
    } 
    else if (hat_voltage >= 0.8V && hat_voltage <= 1.2V) {
        // Lighting Hat Profile Configuration
        load_dmx_libraries();
        boot_sacn_listener_tasks();
        register_orchestrator_node(NODE_TYPE_LIGHT);
    } 
    else if (hat_voltage >= 1.8V && hat_voltage <= 2.2V) {
        // Motion Hat Profile Configuration
        load_trinamic_stepper_libraries();
        boot_osc_listener_tasks();
        register_orchestrator_node(NODE_TYPE_MOTION);
    }
    
    // Launch primary real-time spatial tracking loops
    start_uwb_ranging_mesh_tasks();
}
```

## 2. Mesh Calibration & Spatial Math Routing
Ad-Hoc Network Inter-Ranging: When the calibration beacon sequence triggers, anchors continuously pass structural distance signals via UWB.

Multidimensional Scaling (MDS) Pass: The collected scalar distances form a dense matrix. The local runtime script runs an MDS minimization layout to build out relative 3D coordinate matrices.

Global Zero Positioning: The local spatial origin coordinate mapping formula forces the layout matrix down to zero relative to the active location profile of the Subject Node:

$$X_{\text{local}} = X_{\text{mesh}} - X_{\text{subject}}$$
$$Y_{\text{local}} = Y_{\text{mesh}} - Y_{\text{subject}}$$
$$Z_{\text{local}} = Z_{\text{mesh}} - Z_{\text{subject}}$$

Data Live-Streaming: Positional packets pass directly over high-speed UDP connections via Open Sound Control (OSC) strings to the Virtual Reality engine interfaces.
