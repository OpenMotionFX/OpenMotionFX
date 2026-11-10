---
name: hardware-test-card
description: Write a test card the owner can follow on real hardware or the phone (an L4 test). Use when a claim can only be checked on the bench, or when a phase needs a measurement.
---

# Hardware test card

The owner is not a programmer and runs the test alone. A card must be followable with no other document open.

## Steps

1. Find the claim ids the test will settle in `docs/ai/CLAIMS.md`. If none fits, add a row first.
2. Read the cited section of the digest so the pass numbers come from the spec, not from guesswork. If the spec gives no number, the card records a measurement and says "no pass threshold yet".
3. Check `docs/ai/HARDWARE.md`. If the card depends on an UNKNOWN item, add the human-queue item that settles it as a prerequisite.
4. Take the next free number: Grep `tests/hardware/` for `^# T-`.
5. Write `tests/hardware/T-NNN-short-name.md` in this shape:

```markdown
# T-NNN Short name

- **Purpose:** One sentence: what we learn.
- **Claims:** C-0NN, C-0NN
- **Spec:** (solo § Phase 0)
- **Time needed:** about N minutes
- **Equipment:** every item, including cables and software already installed.
- **Safety:** anything that can damage hardware or hurt, or "none".

## Before you start
1. One action per step. Say what the owner should see after it.

## Steps
1. One action per step.
2. Give each command as one copyable line, say what it does and what should appear.

## Record
- Exactly which numbers, files or photos to send back, and their units.

## Pass
- The numbers that count as a pass, or "measurement only".

## If something does not match
- Stop, note the step number and what you saw, and tell the session.
```

6. Add a human-queue item pointing at the card, with the expected result.
7. Run `node tools/check.mjs --fast`.

## Rules

- One action per step. "Plug in the cable and open the app" is two steps.
- Name things as they look, not by jargon: "the black USB stick with clips" before "logic analyser".
- No step asks the owner to edit code or a config file by hand. Provide a command or a file instead.
- A step with mains power, heat, moving parts or a short-circuit risk says so in the step.
- Do not mark a claim VERIFIED when writing a card. That happens only when results arrive (`verify-claim` skill).
