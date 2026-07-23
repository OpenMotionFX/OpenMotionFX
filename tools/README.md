# tools/

Bench and bring-up tooling — bus sniffers, NCD schema validators, logic-analyzer capture parsers.
Default to Python unless there's a specific reason not to.

Nothing here yet. Likely first additions (`ROADMAP.md` Phase 1 & 3):

- A CAN frame decoder for the `OMFX-CB` identifier layout (spec §7.1), to make sense of
  logic-analyzer captures during T-02/T-06 bring-up tests.
- A validator that checks an NCD JSON document against `schemas/ncd.schema.json`.
