# OpenMotionFX Design Language Specification

## 1\. System Overview \& Aesthetic Philosophy

### Design Persona

**"Camera-Department Industrial Tech"** — OpenMotionFX presents itself not as a consumer gadget or a standard web startup, but as precision cinematography equipment. It draws visual and functional metaphors from real set environments: dark stage floors, gaffer tape, lens markings, viewfinder overlays, and timecode readouts.

### Core Philosophy

* **Utility-First High-Contrast Dark Theme:** Optimized for low-light set environments (charcoal, deep black, high-contrast text).
* **Single Dominant Accent System:** Color is used functionally, not decoratively. A single high-visibility "Gaffer-Tape Orange" accent signifies interactive elements, core branding, and active states.
* **Domain-Specific Capability Accents:** Peripheral feature domains (*Track*, *Move*, *Light*) receive distinct muted color signatures, but are strictly confined to data visualizations and metadata tags to prevent visual noise.
* **Precision Technical Typography:** High contrast between wide, bold uppercase display headings and strict monospaced technical telemetry data.

\---

## 2\. Color Palette \& Token Architecture

The design system uses modern `oklch()` color definitions to ensure uniform perceptual brightness and smooth gradients across modern display media.

### Base Surface \& Neutral Hierarchy

|Token Name|OKLCH Definition|Hex Equivalent|Visual Role|
|-|-|-|-|
|`--bg`|`oklch(23.5% 0.008 40)`|`#262322`|Primary background (Warm Charcoal)|
|`--bg-deep`|`oklch(19% 0.007 40)`|`#1c1a19`|Recessed structural blocks, table rows|
|`--bg-black`|`oklch(13% 0.005 40)`|`#0e0d0d`|Key structural wells, headers, terminal boxes|
|`--ink`|`oklch(97% 0.004 40)`|`#faf9f8`|Primary display headlines, high contrast|
|`--body`|`oklch(88% 0.008 40)`|`#e2dfdd`|Regular body paragraph text|
|`--muted`|`oklch(73% 0.012 40)`|`#b8b3af`|Secondary labels, metadata, captions|
|`--line`|`oklch(35% 0.010 40)`|`#474341`|Structural borders, gridlines|
|`--line-soft`|`oklch(29% 0.009 40)`|`#373433`|Subdued inner dividers, subtle boundaries|

### Accent \& Status Palette

|Token Name|OKLCH Definition|Hex Equivalent|Visual Role|
|-|-|-|-|
|`--accent`|`oklch(68% 0.20 41)`|`#f75c03`|Primary brand accent ("Gaffer Tape Orange")|
|`--accent-hi`|`oklch(74% 0.19 45)`|`#ff7328`|Interactive hover lift state|
|`--tape-ink`|`oklch(16% 0.02 40)`|`#141211`|High-contrast dark text overlay on orange tape|
|`--ok`|`oklch(78% 0.17 150)`|`#4ce182`|Status OK, active system feedback|

\---

## 3\. Typography \& Text Hierarchy

### Font Families

* **Primary Display \& Body:** `Archivo` (Variable font with custom width settings)
* **Technical Telemetry \& Code:** `Fragment Mono` (Monospaced, used for timecode, coordinates, terminal outputs, and structural labels)

### Hierarchy Specification

```css
/\\\* Display Headlines \\\*/
h1, h2 {
  font-family: 'Archivo', sans-serif;
  font-variation-settings: "wdth" 125; /\\\* Expanded width for cinematic authority \\\*/
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.06;
  letter-spacing: -0.015em;
  color: var(--ink);
}

h1 { font-size: clamp(2.5rem, 6.5vw, 4.75rem); }
h2 { font-size: clamp(1.9rem, 4vw, 3rem); }

/\\\* Body \\\& Lead Copy \\\*/
.lead {
  font-family: 'Archivo', sans-serif;
  font-size: clamp(1.15rem, 2vw, 1.35rem);
  line-height: 1.55;
  color: var(--body);
  max-width: 62ch;
}

p {
  font-family: 'Archivo', sans-serif;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--body);
  max-width: 68ch;
}

/\\\* Technical / Code Text \\\*/
.mono, code, kbd, .term {
  font-family: 'Fragment Mono', monospace;
  font-size: 0.875em;
  letter-spacing: 0;
}
```

\---

## 4\. Iconic Visual Metaphors \& Components

### 1\. The Gaffer-Tape Label (`.tape`)

A signature visual signature used as a section header category marker.

* **Visual Representation:** Bright orange background with dark, heavy stencil text, slightly rotated (`-0.6deg`) to emulate real gaffer tape applied to gear.

```css
.tape {
  display: inline-block;
  background: var(--accent);
  color: var(--tape-ink);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  text-transform: uppercase;
  padding: 0.3rem 0.85rem;
  transform: rotate(-0.6deg);
  margin-bottom: 1.4rem;
}
```

### 2\. Linear Data Comparison Table (`.gap-table`)

Rather than standard card grids, comparison and pricing data are displayed in horizontal, thin-bordered list rows resembling technical equipment specifications.

```css
.gap-row {
  display: grid;
  grid-template-columns: minmax(7rem, 2fr) minmax(0, 3fr) minmax(8rem, 2fr) minmax(6rem, 1.5fr);
  gap: 1rem 2rem; align-items: baseline;
  padding-block: 1.4rem;
  border-bottom: 1px solid var(--line);
}
.gap-row--us {
  background: linear-gradient(90deg, color-mix(in oklch, var(--accent) 12%, transparent), transparent 70%);
}
.gap-row--us .gap-price { color: var(--accent); }
```

\---

## 3\. Layout Architecture \& Structural Rules

1. **No Monotonous Card Grids:** Content is organized using full-width horizontal bands, split text-and-diagram columns (`.split`), or bordered technical specs tables.
2. **Container Boundaries:**

   * Maximum Container Width: `1200px`
   * Section Vertical Spacing: `clamp(5rem, 10vw, 9rem)`
   * Dynamic Padding: `clamp(1.25rem, 4vw, 2.5rem)`
3. **Navigation Bar:**

   * Sticky positioned header with semi-transparent black mix (`oklch(13% / 92%)`) and native `backdrop-filter: blur(12px)`.
   * Clear brand logo with vector target mark and solid white links with subtle underline accents on hover/active states.

\---

## 4\. Guidelines for AI / LLM Code Generation

When instructing an LLM to generate UI layouts following this design system, adhere strictly to these rules:

* **DO NOT** use default white or off-white backgrounds. Always use the specified OKLCH dark charcoal palette (`#262322` base, `#0e0d0d` wells).
* **DO NOT** use generic rounded Bootstrap/Tailwind-style modern cards (`rounded-xl shadow-lg`). Use sharp or near-square borders (`border: 1px solid var(--line)`), clean inline dividers, and structural grid borders.
* **DO NOT** scatter bright colors randomly. Use Gaffer Tape Orange (`#f75c03`) exclusively for primary actions, current active timeline points, and headline focal points.
* **DO** use `Archivo` (with wide variable setting `"wdth" 125`) for uppercase headlines and `Fragment Mono` for all labels, tags, numbers, and system status readouts.
* **DO** wrap hero visual elements or complex diagrams inside `.viewfinder` target frame boxes with corner brackets and live timecode/coordinate readouts.

