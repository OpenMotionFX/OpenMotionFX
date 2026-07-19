# 03 — Software Architecture & Execution Routines

## 1. Boot Execution Sequence
```c
#include "esp_adc/adc_oneshot.h"
#include "dw3000_api.h"
#include "bno085_driver.h"

void app_main(void) {
    // Stage 1: Hardware-ID Hardware Profile Check
    adc_oneshot_unit_handle_t adc1_handle;
    init_adc_hardware_interface(&adc1_handle);
    int raw_adc_reading = read_hardware_id_pin(adc1_handle);
    float resolved_voltage = convert_raw_to_voltage(raw_adc_reading);
    
    // Stage 2: Profile Branch Allocation
    if (resolved_voltage < 0.2) {
        // Standalone Mode (Anchor/Tag)
        initialize_core_tracking_mesh_stack(ROLE_AUTO);
    } 
    else if (resolved_voltage >= 0.8 && resolved_voltage <= 1.2) {
        // Lighting Hat Integration Loaded
        initialize_core_tracking_mesh_stack(ROLE_TAG);
        initialize_sacn_artnet_listeners();
        initialize_constant_current_driver_gpio();
    } 
    else if (resolved_voltage >= 1.8 && resolved_voltage <= 2.2) {
        // Motion Hat Integration Loaded
        initialize_core_tracking_mesh_stack(ROLE_TAG);
        initialize_tmc2209_uart_bus();
        initialize_as5600_encoder_interrupts();
    }
    
    // Stage 3: High-Rate Tracking Threads Launch
    xTaskCreatePinnedToCore(execute_ds_twr_loop, "UWB_Loop", 4096, NULL, 10, NULL, 1);
    xTaskCreatePinnedToCore(execute_imu_readout_loop, "IMU_Loop", 4096, NULL, 9, NULL, 1);
}
```
## 2. Spatial Data Ingestion Math Specs
### A. Core MDS Processing Pipeline
The multi-dimensional scaling algorithm reconstructs spatial relative transformations by parsing a raw $N \times N$ symmetric distance-squared matrix $D$. The matrix transforms into an inner-product centering matrix $B$ using:

$$B = -\frac{1}{2} H D H$$

Where $H$ is the centering matrix scaling defined by:

$$H = I - \frac{1}{n}\mathbf{1}\mathbf{1}^T$$

By executing Singular Value Decomposition (SVD) directly on $B$, the system extracts the true spatial relative coordinate matrix:

$$B = V \Lambda V^T \implies X = V \Lambda^{1/2}$$

The highest three eigenvalue columns populate the absolute $X, Y, Z$ positions of the target anchors instantly.

### B. ESKF Execution Frame Loop
The error state tracking logic represents true position $x$ via a combination of nominal state $\hat{x}$ and error state $\delta x$:

$$x = \hat{x} + \delta x$$

1. Prediction Phase ($400\text{ Hz}$): Integrate the high-speed BNO085 accelerometer values directly into the nominal state component $\hat{x}$. Update the error covariance matrix $P$ tracking process noise inputs:

$$P \leftarrow F_x P F_x^T + F_i Q F_i^T$$
   
2. Correction Phase ($20\text{--}50\text{ Hz}$): Upon receipt of a valid DS-TWR UWB tracking ping, compute the spatial innovations residual:
   
$$y = z_{\text{uwb}} - h(\hat{x})$$
   
3. Calculate the Kalman Gain multiplier matrix ($K$), inject the correction back into the structural error vector $\delta x$, update the nominal parameters, and reset the error vector to zero:
   
$$K = P H^T (H P H^T + V)^{-1}$$

$$\delta x \leftarrow K y$$
   
$$\hat{x} \leftarrow \hat{x} + \delta x$$

$$P \leftarrow (I - K H) P$$

