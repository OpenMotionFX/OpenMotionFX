# How we work together

For the owner. Plain steps for running sessions so they stay correct and cheap.

## One task, one session

1. Start a new Claude Code session in the project folder for each task. A fresh session re-reads the state file by itself, so you do not need to explain the project again.
2. Say which task you want, or just say "do the next action". The session reads `docs/ai/STATE.md` and picks the first item under "Next three actions".
3. Let it finish. It ends by updating the state file and writing a short log.
4. Start the next task in a new session. Reason: a long session carries its whole history in every message, which costs more and makes mistakes likelier.

## Which effort level for which task

Type `/model` in Claude Code; it shows the model and lets you set the effort level for the session.

| Task | Effort | Why |
| --- | --- | --- |
| Recording your answers, updating documents, filing test results | low or medium | Simple edits; the check catches slips |
| Writing code with tests from an accepted spec | medium or high | Most of the work; tests guard it |
| Designing an interface, a schema or a decision record | high | Mistakes here are expensive later |
| Debugging something that does not match a measurement | high | Needs careful reading of evidence |
| A phase exit check | high | It decides whether to move on |

If a session seems to be guessing, stop it and start a new one at a higher level. Do not raise the level in the middle of a task.

## Changing the rules

- Change instructions between sessions, not in the middle of one. Reason: a rule changed halfway leaves the first half of the work done under the old rule.
- To change how the assistant behaves for good, ask a session to edit `CLAUDE.md` or a file in `.claude/rules/`, and say why. It records the change.
- If you only want something different once, just say so in that session.

## The guardrails

The assistant is blocked from a short list of dangerous actions (see the "Guardrails" section of `CLAUDE.md`). Some files are locked while the guardrails are armed.

- To see the state, type this in Claude Code and press Enter: `! node tools/arm.mjs status`. You should see "ARMED" or "NOT ARMED".
- To unlock, when a session asks you to: `! node tools/arm.mjs off`. You should see "Guardrails DISARMED".
- To lock again when the change is done: `! node tools/arm.mjs on`. You should see "Guardrails ARMED".

The `!` at the start runs the command yourself, inside the session. The assistant cannot run the "off" command.

## When you are asked to do something

- Your tasks are in `docs/ai/HUMAN_QUEUE.md`. Each has numbered steps and says what you should see.
- For a hardware test you get a test card from `tests/hardware/`. Follow the steps in order, one action each, and paste the numbers or photos back into a session.
- If a step does not match what you see, stop and tell the session exactly what you saw. Do not improvise; the mismatch is useful information.

## Following progress

- `docs/ai/STATE.md`: where things stand, in under a page.
- `docs/ai/LOG/`: one short file per session, newest date last.
- GitHub: milestones are the phases; issues are the deliverable groups.
- `docs/ai/CLAIMS.md`: what has been measured. If it does not say VERIFIED, it is untested.

## If something looks wrong

1. Type `! node tools/check.mjs` and press Enter. You should see "CHECK PASSED" on the last line.
2. If it says "CHECK FAILED", start a new session and say "the check fails, fix it".
3. If a session refuses to stop or keeps repeating itself, press `Esc`, close it and start a new one.
