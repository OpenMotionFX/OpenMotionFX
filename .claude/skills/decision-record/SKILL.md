---
name: decision-record
description: Add a decision record to docs/ai/DECISIONS.md. Use when a choice must be respected by later sessions, when the owner accepts or rejects a proposal, or when an earlier decision is replaced.
---

# New decision record

Records are append-only and numbered in order. `node tools/check.mjs` rejects a record with a missing field or a number out of sequence.

## Steps

1. Grep `docs/ai/DECISIONS.md` for `^## D-` to find the last number and to check the choice is not already recorded.
2. Decide the status:
   - `accepted`: reversible and low risk, or the owner has said yes in this session.
   - `proposed`: hard to undo. That means interface freezes, licence, a programming language or framework, anything that costs money, anything that makes data public.
3. Append the record at the end of the file in this exact shape:

```markdown
## D-00NN Short title that states the choice

- **Status:** accepted (YYYY-MM-DD)
- **Context:** What forced the choice. Facts only, with where each fact came from.
- **Decision:** What is chosen, in one to three sentences a later session can follow.
- **Consequences:** What this makes easier, harder or impossible. Name follow-up items.
- **Spec:** A citation such as (solo § Phase 0), or "none; this is tooling".
```

4. If the status is `proposed`, add an item to `docs/ai/HUMAN_QUEUE.md` with the next free `H-NNN` number, a one-line recommendation, numbered steps and the expected result.
5. If the record replaces an older one, change only the old record's status line to `superseded by D-00NN (date)`. Leave the rest of the old record as it is.
6. If the owner accepted or changed a proposal, change that record's status line to `accepted (date)` or `superseded by D-00NN (date)`, and move the human-queue item to "Done" with the date.
7. Update any digest in `docs/spec/` that called the choice a proposal.
8. Run `node tools/check.mjs --fast`.

## Rules

- Quote the owner's words for the answer when recording an acceptance. Reason: later sessions must be able to tell what was actually agreed.
- Do not record a version number or price you did not check in this session; write "not checked".
- One decision per record. Reason: a record with two choices cannot be superseded cleanly.
