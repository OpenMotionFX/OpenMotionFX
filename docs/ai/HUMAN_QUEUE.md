# Human queue

Things only the owner can do. Scope: decisions, physical checks, purchases and sign-ins. Each item has exact steps and what you should see. When an item is done, the session that receives the answer moves it to "Done" with the date and updates the files it names. Send photos and answers by pasting them into a Claude Code session.

## H-001 Choose a licence

- **Why:** Without a licence nobody else may legally use the code. Recommendation (D-0013): Apache-2.0 for code, CC BY 4.0 for documents.
- **Steps:**
  1. Read the "Decision" line of D-0013 in `docs/ai/DECISIONS.md`.
  2. Reply with one of: "accept D-0013", or the licence you prefer.
- **Expected:** The next session adds the licence file, updates the README and marks D-0013 accepted or superseded.

## H-002 Accept or change five proposed decisions

- **Why:** D-0008 (clock scheme), D-0009 (take package), D-0010 (firmware in C on ESP-IDF), D-0011 (laptop code in Python) and D-0012 (new phone app, copying tested parts) are hard to undo later, so they wait for you.
- **Steps:**
  1. Open `docs/ai/DECISIONS.md` and read the five records from D-0008 to D-0012.
  2. Reply "accept all", or name the ones to change and what you want instead.
- **Expected:** Each record becomes accepted or superseded. Phase 0 work starts only after D-0008 to D-0010 are settled.

## H-003 Supply two missing documents

- **Why:** The ideal capture spec ("the ideal doc") and the scenario tests are cited by the other plans but were not in the folder.
- **Steps:**
  1. Save each document as a `.md` file into the folder `private\inbox` inside the project.
  2. Tell the session "the missing documents are in private/inbox".
- **Expected:** The session checks them for the deferred topic, adds them to `docs/source/` with the manifest, and writes digests. If you do not have them, say so and the gap stays recorded.

## H-004 Identify the two ESP32-P4 boards

- **Why:** Several variants exist and they differ in PoE and connectors. Pin choices depend on it.
- **Steps:**
  1. Take one sharp photo of the top of one board.
  2. Take one sharp photo of the bottom of the same board.
  3. Read any text printed near the edge (for example a name ending in "POE-ETH") and write it down.
  4. Say whether a small flat ribbon socket (a camera connector) is present.
- **Expected:** Two photos and the printed name. `docs/ai/HARDWARE.md` gets the exact variant.

## H-005 Identify the stepper motor and its driver

- **Why:** Step angle and current limit set the slider's resolution and safe settings.
- **Steps:**
  1. Photograph the label on the back or side of the motor.
  2. Photograph the driver board so the chip marking is readable.
  3. Write down the text of both labels.
- **Expected:** A motor model (often starting "17HS") and a driver name (for example A4988, DRV8825 or TMC2209).

## H-006 Identify the encoder

- **Why:** A magnetic angle sensor and a pulse-type Hall sensor need different firmware and give very different resolution.
- **Steps:**
  1. Photograph both sides of the encoder board.
  2. Count the wires or pins and write down any labels next to them.
  3. Write down the marking on the largest chip.
- **Expected:** A chip marking (for example AS5600) or "no chip, three wires".

## H-007 Identify the logic analyser

- **Why:** Its sample rate limits how finely the two P4s can be compared.
- **Steps:**
  1. Photograph the label on the logic analyser.
  2. Write down the number of channels and any speed printed on it (for example "24M 8CH").
- **Expected:** A model or the "24M 8CH" style text.

## H-008 Measure the slider parts

- **Why:** Travel and millimetres per step depend on these lengths and tooth counts.
- **Steps:**
  1. Measure the length of one 2020 extrusion with a ruler, in millimetres.
  2. Count the teeth on the motor pulley.
  3. Read the belt marking if there is one (for example "GT2 6mm").
- **Expected:** Three values, for example "300 mm, 20 teeth, GT2 6 mm".

## H-009 Read the switch label

- **Why:** Hardware versions of the same switch differ in PoE power.
- **Steps:**
  1. Turn the switch over and photograph the label.
- **Expected:** "TL-SG1005P" and a version such as "Ver 2.0", plus the PoE power figure in watts.

## H-010 Read the phone's software version

- **Why:** Camera behaviour changes between system updates, so test results must name the build.
- **Steps:**
  1. On the phone open Settings, then "About phone".
  2. Take a screenshot showing the model, Android version and build number.
- **Expected:** One screenshot.

## H-011 Approve a C compiler for laptop tests

- **Why:** Firmware logic is tested on the laptop before it touches a board (D-0006). `node tools/doctor.mjs` shows no C compiler on this machine. Recommendation: approve a small portable compiler that needs no administrator rights, chosen and version-checked at the start of Phase 0.
- **Steps:**
  1. Reply "approve portable C compiler" or "no, use CI only".
- **Expected:** With approval, the Phase 0 session proposes one exact tool and install line for you to confirm. Without it, firmware logic tests run only on GitHub.

## H-012 Review the deferred-topic handling

- **Why:** The word list decides what is kept out of git. It was set conservatively and you may want it narrower or wider.
- **Steps:**
  1. Open the file `.claude\local\deferred-terms.txt` in Notepad and read the list.
  2. Open `private\redact.mjs` in Notepad; each line in the middle shows one replaced passage.
  3. Reply "list is fine", or say which words to add or remove.
- **Expected:** Either no change, or the next session (after you disarm the guardrails) updates the list.

## Done

Nothing yet.
