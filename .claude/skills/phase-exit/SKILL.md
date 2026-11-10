---
name: phase-exit
description: Check whether a phase of the solo plan is finished and tag it. Use when the work of a phase seems complete, or when the owner asks whether to move to the next phase.
---

# Phase exit check

A phase ends on evidence, not on effort. The result is either a tag `phase-N-exit` or a list of what is missing.

## Steps

1. Read the phase's "Done when" and "Film test" lines in the cited section of `docs/source/solo-build-plan.md` (find the section through the digests; read only that section).
2. List the phase's deliverables from its GitHub milestone: `gh issue list --milestone "Phase N" --state all`.
3. For each deliverable, find its evidence:
   - Code: merged on `main` with L0 to L3 tests in the same commits.
   - Measurement: a folder in `tests/results/` and a row in `docs/ai/CLAIMS.md`.
   - Film test: a note in `tests/results/` with the owner's verdict and the numbers the plan asks for.
4. Check the claims the phase depends on. Each is either VERIFIED, or UNVERIFIED with a recorded reason why the phase can still close.
5. Check that no decision the phase needed is still `proposed` in `docs/ai/DECISIONS.md`.
6. Run `node tools/check.mjs` and confirm the latest CI run on `main` is green: `gh run list --branch main --limit 1`.
7. Write the result into the session log as a table: deliverable, evidence path, met or not met.
8. If everything is met:
   1. Ask the owner to confirm the film test verdict in their own words and record it.
   2. Tag: `git tag -a phase-N-exit -m "chore: phase N exit"` and push the tag.
   3. Close the milestone and update `docs/ai/STATE.md` to the next phase.
9. If something is not met: do not tag. Put the missing items in STATE.md as the next actions, or in the human queue if only the owner can do them.

## Rules

- "Done when" comes from the plan. Do not soften it. If it turns out to be wrong or unreachable, write a `proposed` decision record and ask the owner.
- A phase whose exit number was never measured is not done, even if all code is merged.
- Phases 1 and 2 overlap, and so do 6 and 7; each still gets its own exit check.
