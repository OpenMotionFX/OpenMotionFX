# Android camera timing and metadata

## Decision this feeds
What the per-frame log holds, and what the first phone tests measure.

## Findings
- REALTIME timestamp source: SENSOR_TIMESTAMP shares the clock of SystemClock.elapsedRealtimeNanos(), comparable with gyro events. UNKNOWN: monotonic nanoseconds, not comparable with gyro. https://developer.android.com/reference/android/hardware/camera2/CameraCharacteristics
- SENSOR_TIMESTAMP is documented as exposure start; exact wording not re-read. https://developer.android.com/reference/android/hardware/camera2/CaptureResult
- Rolling shutter skew: first-row exposure start to exposure start one row past the last. Exposure time: per-pixel exposure. Frame duration: readout start to next readout start. Same page.
- RAW capability: RAW buffers plus metadata. Logical multi-camera: backed by two or more physical cameras. Sync is APPROXIMATE (software) or CALIBRATED (hardware). https://developer.android.com/reference/android/hardware/camera2/CameraCharacteristics
- From API 30, an unsupported multi-camera open fails cleanly; before that, others may disconnect. https://developer.android.com/reference/android/hardware/camera2/CameraManager
- Focus distance may be UNCALIBRATED (no physical units). Pose reference can be UNDEFINED. https://developer.android.com/reference/android/hardware/camera2/CaptureResult
- Video stabilisation: OFF, ON, PREVIEW_STABILIZATION. Optical: OFF, ON. Each has an available-modes key; OIS data has its own ON/OFF mode. https://developer.android.com/reference/android/hardware/camera2/CameraCharacteristics
- gcsv header: first line "GYROFLOW IMU LOG" or "CAMERA IMU LOG"; version,1.3; id; orientation (example YxZ); tscale (to seconds), gscale (rad/s), ascale (g). Columns t,gx,gy,gz, optional ax,ay,az. Optional frame_readout_time. https://docs.gyroflow.xyz/app/technical-details/gcsv-format.md
- X200 Pro telephoto: 50MP, 15 mm equivalent (vendor). https://www.vivo.com/in/products/x200-pro
- Hearsay: another Vivo phone showed only 12MP via Camera2. https://community.latenode.com/t/how-to-access-full-resolution-photos-from-vivo-x60-pro-using-camera2-api/28635

## Recommendation
Log per frame: SENSOR_TIMESTAMP, exposure, frame duration, skew, focus distance, focal length, crop region, both stabilisation modes, OIS samples if present, physical camera id, and elapsedRealtimeNanos at callback. Write gcsv with nanosecond tscale.

First tests: timestamp source; gyro-to-LED offset; per-lens ids, RAW, hardware level; two-camera streaming; which keys appear per frame; whether stabilisation OFF is obeyed (compare result keys, crop and OIS samples).

## Not verified
Exact timestamp and skew wording, units, OIS fields, concurrent-camera API, key optionality, all X200 Pro limits.

## Confidence
Low to medium: API facts are official; nothing device-specific is confirmed.
