# Tools

Repository tooling in plain Node.js (D-0001). Run `npm ci` once after cloning.

| Command | What it does |
| --- | --- |
| `node tools/check.mjs --fast` | Quick checks on the working files. Run by the Stop hook and before each commit. |
| `node tools/check.mjs` | Everything: adds hook self-tests, a git history scan and the mutation proof. Run before each push and in CI. |
| `node tools/selftest.mjs` | Mutation proof alone: breaks one thing per case and confirms the matching check fails. |
| `node tools/doctor.mjs` | Lists the toolchains each phase needs and whether they are installed. Installs nothing. |
| `node tools/arm.mjs on` / `status` | Arms the guardrails or shows their state. `off` is for the owner only. |
| `node tools/githook.mjs <hook>` | Called by `.githooks/`; not run by hand. |

Checks print at most 30 lines; full reports are in `.logs/`. Check logic is in `tools/lib/checks.mjs`.
