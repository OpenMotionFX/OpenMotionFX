# Colour, keys and mattes (digest)

Phase 4 work. Status: **not started; nothing here is tested**.

## Colour

- "ACES" from the phone is not true until an input transform is measured for this camera; until then call it "log" (solo § Impossible or much harder)
- RAW plus the owner's camera characterisation (chart first, spectral later) gives a real ACES input transform (solo § Impossible or much harder)
- Build chart detection and per-camera transforms (wide, telephoto, any witness phones) exported to Resolve (solo § Phase 4)
- Build a first real input transform from RAW (solo § Phase 4)
- Verification row: chart under a known light; the transform built from the chart matches the reference within a target error (solo § Verification suite)
- A colour chart is on the shopping list, around £60 to £100 (solo § Your kit)

## Keys

- CorridorKey 2.0 keys green and blue screens in one click, so "automatic alpha hint" work drops out of the plan (solo § CorridorKey 2.0)
- This system's value moves to hints for hard shots and to mattes beyond green screen (solo § CorridorKey 2.0)
- Check the current CorridorKey licence before relying on it (solo § CorridorKey 2.0)
- Third-party models stay optional plugins or get licensed (solo § Principles kept)

## Mattes and layers

- Segmentation mattes and depth; EXR and Cryptomatte export; Blender and Resolve add-ons (solo § Phase 4)
- Full-scale route to exact mattes is the tag band and a co-axial splitter, which is not solo-phase work (stack § Fundamentals mapped to modules)

## Film test

- A green-screen shot keyed in one click and composited into a set extension, with wide and telephoto shots matched before grading (solo § Phase 4)

## What artists asked for

- Standard formats readable in existing compositing and 3D tools; no proprietary viewer (review § VFX artist)
- Per-pixel provenance: which sensor and which solve produced each pixel (review § VFX artist)

## What research found (unverified)

- OpenEXR multi-part files carry many layers; 3.4.18 was the latest version found (research 04)
- Cryptomatte, OpenColorIO, ACES and AMF specifications were not fetched by the research pass (research 04)

## Tests this component needs

- L1: colour maths against published reference values; L3: exported EXR layers checked against golden files (D-0006)
- L4: chart capture on the phone under a known light (solo § Verification suite)
