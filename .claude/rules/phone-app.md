---
paths:
  - "apps/phone/**"
---

# Phone app rules

Scope: files under `apps/phone/`. Digests: `docs/spec/phone-app.md`, `docs/spec/OPENCAMERA.md`.

- Check `docs/ai/DECISIONS.md` first: D-0012 must be `accepted` before app code is written.
- Build the verification suite before features. Reason: the plan says each feature is unverified until its test gives a number.
- Copy code from `reference/OpenCamera` only when a decision record names the module. Keep its MIT notice in `apps/phone/THIRD_PARTY_NOTICES`. Add L1 tests for the copied code in the same commit. Reason: the reference app has no tests.
- One module of the reference app is out of scope (D-0002). Do not open, copy or describe it.
- Put logic that does not need Android classes (metadata records, parsers, take-package writing, timing maths) in plain Kotlin with JUnit tests on the JVM. Reason: such tests run on the laptop and in CI without a phone.
- Log per-frame values exactly as the camera reports them, with the clock source. Do not correct or convert them at capture time. Reason: the solve needs raw values to judge whether the phone is honest.
- Call the output "log", not "ACES", until claim C-005 is VERIFIED. Reason: `docs/spec/colour-keys-mattes.md`.
- Building needs the JDK and Android SDK paths; run `node tools/doctor.mjs` to find them. Write `local.properties` with the Write tool, not PowerShell redirection. Reason: PowerShell 5.1 adds a byte-order mark that breaks the file.
- Tests on the phone are L4: write a test card and queue it for the owner.
