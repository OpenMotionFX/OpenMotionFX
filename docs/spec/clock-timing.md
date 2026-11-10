# Clock and timing (digest)

One timeline for every device. Status: **nothing measured yet**. The clock scheme is a Phase 0 deliverable; D-0008 is a proposal awaiting the owner.

## Target

- Time is the one fundamental every device needs, so it is done once and the same everywhere (stack § The Core)
- The clock scheme is one of four interfaces written first and never broken (solo § Principles kept)
- Full-scale target is sub-microsecond; that is not reachable with this switch and laptop and is not needed until light coding (solo § Impossible or much harder)
- Enough for now: microseconds between the two P4s, sub-millisecond for phones (solo § Impossible or much harder)

## Wired side

- One ESP32-P4 is the PTP master; its Ethernet controller has hardware timestamps (solo § Laptop on the network)
- The laptop joins as a client with software timestamps, which is fine for the set brain (solo § Laptop on the network)
- The unmanaged switch does not correct for its own delay, so expect microseconds, not nanoseconds (solo § Laptop on the network)
- The switch has no DHCP server: fixed addresses, or a small DHCP server on the laptop's wired port (solo § Laptop on the network)
- Each P4 raises a GPIO pulse at every whole PTP second; the logic analyser measures the offset over an hour (solo § Phase 0)

## Phone side

- Android offers no external trigger input, so phone frames cannot be hardware-synced (solo § Impossible or much harder)
- Each frame is timestamped in the phone's clock; that clock is mapped to PTP time with a sync LED the P4 blinks (solo § Impossible or much harder)
- Rolling shutter as timer: the row where the blink starts gives the time to within one row's readout (solo § New possibilities)
- Audio timecode from the P4 into the phone's audio track is a second, independent check (solo § New possibilities)
- Phone flashlight and screen can act as sync beacons for other phones (solo § Phone hardware, used fully)

## What research found (unmeasured)

- Hardware-timestamped PTP on the P4 is supported by an official ESP-IDF example and a community component (research 02)
- How the example makes its pulse, and its jitter, are not published; measure it (research 02)
- If a phone reports timestamp source REALTIME, frame times share a clock with gyro events; if UNKNOWN they do not (research 03)
- Rolling-shutter skew is reported per frame as first-row to last-row exposure start (research 03)
- No published offset numbers were found for PTP through this unmanaged switch (research 02)

## Proposed scheme (not accepted)

- Every stream names its clock; times are integer nanoseconds; clock-to-clock mapping lives in sync events (D-0008)

## Tests this component needs

- L1: timing maths in a portable module with fake clocks; L2: two simulated nodes (D-0006)
- L4: P4-to-P4 pulse offset over an hour; LED-to-rolling-shutter mapping drift over a take (solo § Verification suite)
