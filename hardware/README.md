# hardware/

PCB and mechanical design files: Core Unit, Function Units, Hub, and FDM housings.

Licensed separately from the software in this repo — see [`LICENSE`](LICENSE)
(CERN-OHL-W-2.0), not the root MIT license.

## Conventions (spec §17)

- PCB: KiCad.
- Mechanical: STEP source, STL for slicing.
- Material: PETG for any housing adjacent to an LED driver or motor case (thermal margin over
  PLA); PLA acceptable for unheated structural brackets.
- Print orientation: connector-facing surfaces flat-down against the bed for magnet/pogo pocket
  accuracy.
- Tolerance: 0.2–0.3 mm clearance on mating features for FDM shrink — verify on a first article
  before batch-printing a rig's worth of housings.
- Fasteners: M3 heat-set brass inserts at every Node-to-carriage mounting point, not printed
  threads.
- Every housing must expose the `OMFX-T`/`OMFX-M` keying feature physically — a Function Unit
  must be mechanically impossible to seat in the wrong orientation.

Nothing scaffolded yet — hardware work starts once the Bring-Up bench (breadboard/dev-board level,
`ROADMAP.md` Phase 0–4) is validated.
