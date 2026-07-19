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
        initialize_standalone_anchor_profile();[cite: 1]
    } 
    else if (hat_voltage >= 0.8V && hat_voltage <= 1.2V) {
        // Lighting Hat Profile Configuration
        load_dmx_libraries();[cite: 1]
        boot_sacn_listener_tasks();[cite: 1]
        register_orchestrator_node(NODE_TYPE_LIGHT);[cite: 1]
    } 
    else if (hat_voltage >= 1.8V && hat_voltage <= 2.2V) {
        // Motion Hat Profile Configuration
        load_trinamic_stepper_libraries();[cite: 1]
        boot_osc_listener_tasks();[cite: 1]
        register_orchestrator_node(NODE_TYPE_MOTION);[cite: 1]
    }
    
    // Launch primary real-time spatial tracking loops
    start_uwb_ranging_mesh_tasks();
}
