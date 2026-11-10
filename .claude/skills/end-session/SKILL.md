---
name: end-session
description: Close a work session. Use before the final message of any session that changed files, so the next session with an empty context can continue.
---

# End of session

## Steps

1. Run `git status --short` and `git log --oneline -5` to see what changed.
2. Update `docs/ai/STATE.md` (60 lines at most):
   - **Phase:** one or two sentences.
   - **In flight:** unfinished work with the branch name and the next concrete step, or "Nothing".
   - **Next three actions:** exactly three, each doable in one session, most important first.
   - **Blockers:** what stops progress and which human-queue item clears it.
   - **Facts a new session needs:** only facts that are not obvious from the files.
3. Create `docs/ai/LOG/YYYY-MM-DD-topic.md` (use `-2`, `-3` if the name exists). At most 40 lines:

```markdown
# YYYY-MM-DD topic

## What changed and why
- ...

## Evidence
- Commands run and what they showed (check result, test counts).

## Failures and root causes
- What went wrong, why, and what now prevents it. "None" if none.

## Next
- The first action for the next session.
```

4. If something went wrong in a way a future session could repeat, add an entry to `docs/ai/LESSONS.md` with scope, reason and date.
5. If the owner must do something, make sure it is in `docs/ai/HUMAN_QUEUE.md` with exact steps.
6. If new capabilities were claimed anywhere, make sure each has a row in `docs/ai/CLAIMS.md`.
7. Run `node tools/check.mjs`. Fix what fails.
8. Commit with a conventional message. Push only if the owner asked for pushes in this session or the task says so.
9. The final message to the owner covers: what was done, the check result, what they must do next (with exact steps), and anything that could not be verified.

## Rules

- Write the log from evidence in the session, not from intentions. If a step was skipped, the log says so.
- Do not end with a list of work you still owe in this session. Either do it or record it in STATE.md as the next action and say why it was not done.
