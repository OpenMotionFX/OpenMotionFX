# Frozen source documents

These are the owner's plan documents, stored unchanged. Scope: everything in this folder. Reason: digests and decisions cite these files by heading, so the text must not move under them.

| Key | File | First heading | Pasted as |
| --- | --- | --- | --- |
| `stack` | [modular-capture-stack.md](modular-capture-stack.md) | Modular Capture Stack: Real Plan | `Ideals.md` |
| `solo` | [solo-build-plan.md](solo-build-plan.md) | Solo build plan | `Solo build plan.md` |
| `review` | [stakeholder-review.md](stakeholder-review.md) | Stakeholder review | `Stakeholder review of Ideals.md` |

## Rules

- Do not edit these files. `node tools/check.mjs` compares each file with the sha256 in [MANIFEST.json](MANIFEST.json) and fails on any change. When the guardrails are armed, the edit is blocked before it happens.
- Read a digest in `docs/spec/` first. Open a source file only for the section a digest cites. Reason: the three files are about 17,000 tokens together.
- A passage that reads `[deferred, not yet specified]` covers a topic the owner has put on hold. Do not guess what it said and do not fill it in. The untouched originals stay on the owner's machine in a folder that git ignores.
- To replace or add a source document, the owner disarms the guardrails, the file is added, and the manifest is updated in the same commit with a decision record.

## Gaps

- The **ideal capture spec** ("the ideal doc") was expected but not supplied. Statements that depend on it are marked as gaps in the digests.
- The **scenario tests** document is linked from the stack plan but was not supplied.

Both are tracked as H-003 in [HUMAN_QUEUE.md](../ai/HUMAN_QUEUE.md).
