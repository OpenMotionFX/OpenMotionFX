---
name: verify-claim
description: Record test results and update a claim's status in docs/ai/CLAIMS.md. Use when the owner reports results from a test card, or when an automated test produces measured evidence for a claim.
---

# Verify a claim

A claim becomes VERIFIED only when measured data is stored in the repository and meets the pass numbers on the test card. A result that fails is just as valuable: it is recorded and the claim stays UNVERIFIED.

## Steps

1. Identify the test id (`T-NNN`) and the claim ids from the test card in `tests/hardware/`.
2. Store the raw data exactly as received in `tests/results/T-NNN/`. Do not edit it. For large media, store a checksum and a small extract and keep the full file in `private/`.
3. Check the data for anything private (faces, messages, locations). If present, do not commit it; ask the owner for a clean capture.
4. Add `tests/results/T-NNN/README.md`: date, who ran it, device models and software builds, deviations from the card.
5. Analyse the data with a script or a stated calculation. Put the analysis in a separate file in the same folder. State the number, its unit and how it was computed.
6. Compare with the card's "Pass" section:
   - **Pass:** in `docs/ai/CLAIMS.md` set the row's status to `VERIFIED`, the Test column to `T-NNN`, the Evidence column to the path of the raw data or analysis file.
   - **Fail or unclear:** leave the status `UNVERIFIED`, put `T-NNN` in the Test column, and keep the evidence path. Add what was learned to the session log and, if it changes the plan, a decision record.
   - **Measurement only (no threshold):** leave `UNVERIFIED`, record the number in the results README, and propose a threshold as a decision record.
7. Update every document that said "untested" for this capability, including the component README's "Verification" line and the digest.
8. If the result contradicts a plan assumption, add a line under Blockers in `docs/ai/STATE.md`.
9. Run `node tools/check.mjs --fast`. It fails if a VERIFIED row has no test id or its evidence file does not exist.

## Rules

- A claim is verified for the exact hardware and software build tested. Write the build in the results README. A system update on the phone returns phone claims to UNVERIFIED until the card is rerun.
- Do not verify from a description ("it looked fine"). Ask for the numbers or files the card lists.
- Do not widen a claim to fit the result. If the test covered half the claim, split the claim into two rows.
- Do not change a card's pass numbers after seeing results without a decision record.
