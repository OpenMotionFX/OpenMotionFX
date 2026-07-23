# host/

Conductor Desktop — the Hub host process (spec §14): live NCD registry/topology graph, the three
L2 solvers (factor-graph state estimator, kinematic QP, inverse photometric lighting), `.omfx`
read/write, and the DCC bridge to Blender/Unreal.

## Stack

- **Tauri** (Rust backend + React/TypeScript frontend).
- Rust owns: CAN/serial parsing (`OMFX-CB` frames off the Hub's bridge interface), the kinematic
  math (`nalgebra`-class), `.omfx` container I/O.
- UI owns: live 3D topology/tracking viewport (Three.js/WebGL), trajectory curve editor, dashboard
  (see `docs/DESIGN-LANGUAGE.md` for the visual system — dark OKLCH theme, Archivo/Fragment Mono,
  no default light-mode Bootstrap look).

## Setup (not yet scaffolded)

```sh
npm create tauri-app@latest    # Rust + React/TypeScript template
cd host && npm install
npm run tauri dev
```

`src-tauri/` will hold the Rust core, `src/` the frontend, once Phase 5 of `ROADMAP.md` starts —
after the Bring-Up bus, lifecycle, and first Actuation Node are working end to end.
