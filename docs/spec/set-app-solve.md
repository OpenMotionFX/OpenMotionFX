# Set app and solve (digest)

The laptop side: the set app (set brain at solo scale) and the solve pipeline. Status: **no code; language choice is a proposal (D-0011)**.

## Set app

- The laptop is set brain, solve machine and the place the ESP32s are flashed and debugged (solo § Laptop on the network)
- Plug the laptop into any switch port; keep Wi-Fi for the internet (solo § Laptop on the network)
- Phase 0: the laptop shows both P4s and their sync status (solo § Phase 0)
- Phase 1: slider control from the laptop (solo § Phase 1)
- It issues the take ID and can choose the phone's mode (solo § The phone app)
- Phase 5 adds the registry; Phase 6 adds light passes and HDRI (solo § Phase 5)
- Phase 7 is done when a Head plugs in and appears in the set app with no configuration (solo § Phase 7)

## What the full set brain is, for orientation only

- Live world model: where every unit and production object is, the four contamination regions, the spectrum and time plan, warnings, take control (stack § Software stack)
- The production-layer registry holds scan, material, tag code and live pose for every object that is not world (stack § Software stack)
- Set fabric: discovery, clock distribution, transport, previews (stack § Software stack)

## Solve

- Phase 2: the LED-to-rolling-shutter sync solver runs on the laptop (solo § Phase 2)
- Camera path per frame from slider encoder (PTP time) and phone gyro (phone clock mapped by the LED), before any image solve (solo § New possibilities)
- Phase 2 film test: place a CG object on a table in Blender using encoder plus gyro alone and check how well it sticks (solo § Phase 2)
- Phase 3: the full camera path from encoder and gyro, refined against the image (solo § Phase 3)
- Full pipeline: pose refinement, 4D reconstruction, light-layer demultiplexing, material fitting, removal, confidence maps, each as a plugin (stack § Software stack)

## Reuse, do not rebuild

- Use Gyroflow, OpenCV, structure-from-motion, splatting, segmentation, CorridorKey and OpenColorIO; build sync, the registry, fusion and the app (solo § Principles kept)
- Rent cloud GPUs for heavy ML instead of buying a graphics card (solo § Budget)

## What users of the data asked for

- An honest confidence map and a best effort with whatever was placed, instead of refusing to work (review § Solo, low to zero budget creator)
- A way to re-run any solve step with an artist's own fixes (review § VFX artist)
- Data ownership stays with the production; no telemetry leaves the set without permission (review § Big production)

## Tests this component needs

- L1: sync solver and path fusion on recorded fixtures; L2: simulated LED blinks and rolling-shutter rows (D-0006)
- L4: the Phase 2 film test with a pixel error number (solo § Phase 2)
