# Slider Head (digest)

The first Head: a one-axis motorised slider. Status: **parts owned, nothing built or measured**.

## Parts

- 2× 2020 V-slot, gantry, belt, pulleys, NEMA 17 and driver make the 1-axis slider Head (solo § Your kit)
- A Hall-effect encoder gives slider position on PTP time; it later becomes an Encoder Pod (solo § Your kit)
- A dial indicator (0.01 mm) is the ground truth for repeatability (solo § Your kit)
- The USB logic analyser checks step pulses and encoder signals (solo § Your kit)

## Settle first

- Confirm the extrusion length; if it is 300 mm, expect roughly 200 mm of travel (solo § Your kit)
- Identify the motor by test: the encoder counts steps per revolution, which gives the step angle (solo § Your kit)
- Find out which kind of encoder it is: a magnetic angle sensor with a 20-tooth GT2 pulley gives about 0.01 mm per count at 12 bits; a pulse-type Hall sensor gives far fewer counts (solo § Your kit)

## Build (Phase 1)

- Motor control on a P4 with every step and encoder reading stamped in PTP time (solo § Phase 1)
- Moves defined as keyframes; record a hand-driven move and replay it (solo § Phase 1)
- Control from the laptop and from the phone app's remote API (solo § Phase 1)

## Measure

- Repeatability with the dial indicator at several points along the travel, both directions, 20 passes each (solo § Phase 1)
- Backlash, belt stretch and the encoder's real resolution show up in that test (solo § Phase 1)
- Done when it returns to the same point within a measured tolerance, for example ±0.05 mm, and the cause is known when it does not (solo § Phase 1)

## Film test

- A twinning shot: the owner on the left in pass one and on the right in pass two, joined in Resolve or Blender (solo § Phase 1)

## Why it matters downstream

- Translation from the slider encoder plus rotation from the phone gyro gives a camera path per frame before any image solve (solo § New possibilities)
- Phase 2's film test places a CG object using that path alone (solo § Phase 2)
- The slider's clean passes are one source of fills for removal (solo § Phase 5)

## Interfaces

- It announces itself through a Head descriptor: type, serial, calibration, driver version (stack § The Core)
- Its plugin declares what it records, its calibration model, its noise model and how its data enters the solve (stack § Software stack)

## Tests this component needs

- L1: keyframe interpolation, step planning and encoder decoding as portable code; L2: simulated motor and encoder (D-0006)
- L4: dial-indicator repeatability card; step-pulse timing on the logic analyser (solo § Phase 1)
