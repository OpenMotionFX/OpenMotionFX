# Light (digest)

Phase 6 work: measuring and separating light. Status: **not started; nothing here is tested**.

## Build

- Light passes and HDRI integrated into the set app (solo § Phase 6)
- LED coding driven by a P4; a MOSFET board is enough at first (solo § Phase 6)
- Per-light layers from witness rolling-shutter bands (solo § Phase 6)
- Relighting of static elements; ML relighting for people, fed with measured light (solo § Phase 6)

## Film test

- One shot relit to a different look and compared with a real reshoot (solo § Phase 6)

## How coded light works

- Coders put small orthogonal codes on LED fixtures, logged with exact phase (stack § Fundamentals mapped to modules)
- High-rate witnesses demodulate per-light contributions; the solve transfers the ratios to the hero plate (stack § Fundamentals mapped to modules)
- Phone route: the rolling shutter leaves bands in a short-exposure witness frame that identify which LED made which light (solo § New possibilities)
- Uncodable light such as sun and fire is the residual (stack § Fundamentals mapped to modules)

## Rules

- Codes are scheduled against the hero camera's exposure and row timing, and must not beat against any shutter (stack § Rules so the stack)
- Any light a module puts into the scene is recorded with phase and power so it can be subtracted (stack § Rules so the stack)
- This is the first phase that needs timing better than microseconds between P4s and sub-millisecond phones (solo § Impossible or much harder)

## Concerns to design for

- "Invisible" flicker can become visible at 120 fps, on a rolling shutter or on another camera (review § Director and cinematographer)
- The shot lighting is locked as reference; every change made in post is logged and shown to the cinematographer (review § Stakeholder review)
- Older fixtures may have to be marked uncoded (review § Director and cinematographer)

## Budget

- LED panels and PCB spins fall in year two, £300 to £800, as approximate planning numbers (solo § Budget)

## Tests this component needs

- L1 and L2: code generation and demodulation on simulated rolling-shutter frames (D-0006)
- L4: flicker visibility on the hero phone at each frame rate; the relight-versus-reshoot film test (solo § Phase 6)
