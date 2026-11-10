---
paths:
  - "docs/**"
  - "README.md"
---

# Documentation rules

Scope: files under `docs/` and the root `README.md`.

- `docs/source/` is frozen. Do not edit it; the check compares sha256 values. Reason: digests cite it by heading.
- A digest in `docs/spec/` is at most 60 lines, and every bullet or table row carries a citation: `(stack § Heading)`, `(solo § Heading)`, `(review § Heading)`, `(research NN)` or `(D-NNNN)`. Reason: an uncited statement cannot be checked, and the check rejects it.
- When a digest and its source disagree, the source wins. Fix the digest. Reason: the source is the owner's own text.
- Do not fill in a passage marked `[deferred, not yet specified]`, and do not name the deferred topic. Reason: D-0002.
- Write "untested" for any capability whose row in `docs/ai/CLAIMS.md` is UNVERIFIED. Reason: only measured evidence verifies a claim.
- `docs/ai/DECISIONS.md` is append-only. Supersede; do not rewrite. Use the `decision-record` skill.
- `docs/ai/STATE.md` stays at 60 lines or fewer and holds only: phase, work in flight, next three actions, blockers, facts a new session needs. History goes to `docs/ai/LOG/`.
- `docs/ai/LESSONS.md` is curated: each entry has scope, reason and date. Remove an entry when its reason no longer holds.
- A new document gets a line in `docs/INDEX.md` in the same commit. Reason: sessions find files through the index.
- Research notes in `docs/research/` are at most 400 words with source URLs and a confidence line. Treat them as leads.
- Write short, concrete, checkable sentences in everyday words. State the scope and reason of each rule. Reason: the reader is a session with no context, or an owner who is not a programmer.
- Relative links must resolve; the check tests them. Refer to gitignored folders in code font, not as links.
