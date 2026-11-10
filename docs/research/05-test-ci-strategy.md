# Test and CI strategy

## Decision this feeds
Which test framework to use per language, and how to lay out GitHub Actions.

## Findings
- ESP-IDF `linux` target runs Unity/CMock on a host, but needs an installed IDF, Linux or macOS, GCC, libbsd; docs do not mention Windows. https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/host-apps.html
- QEMU for IDF apps is "work in progress" per that page; pytest-embedded does have a `qemu` service. https://docs.espressif.com/projects/pytest-embedded/en/latest/
- Espressif's CI action wraps the `espressif/idf` Docker image; needs Linux Docker (`ubuntu-latest`). https://github.com/espressif/esp-idf-ci-action
- Android local tests run on the laptop JVM (JUnit 4, `src/test`), but cannot use the real Android framework. The Gradle plugin supplies a stub framework library that throws "not mocked"; use fakes, mocks or Robolectric. https://developer.android.com/training/testing/local-tests
- Public repos: standard runners are free. Private repos get a monthly allowance, then pay per minute; Windows costs more than Linux. https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions
- `paths` filters work on push and pull_request. A workflow skipped by a path filter leaves required checks "Pending" and blocks merge. https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions
- check-jsonschema is a CLI built on jsonschema; schema may be a local file. https://check-jsonschema.readthedocs.io/en/latest/
- Current versions, read 2026-11-10 from each releases page: checkout v7.0.1; setup-node v7.1.0; setup-python v7.1.0; setup-java v6.2.0; gradle/actions v6.4.1.
  - https://github.com/actions/checkout/releases
  - https://github.com/actions/setup-node/releases
  - https://github.com/actions/setup-python/releases
  - https://github.com/actions/setup-java/releases
  - https://github.com/gradle/actions/releases

## Recommendation
- Firmware: plain C with no IDF headers for hardware-independent logic, tested on the host with Unity. Run it in Ubuntu CI. Add an IDF build job only when firmware changes.
- Android: JUnit on the JVM; Robolectric only if needed. No emulator jobs at first.
- Python: pytest, ruff, one type checker, plus jsonschema.
- Contract tests: one `fixtures/` folder of JSON files and schemas that every language loads. Golden files are compared byte for byte.
- CI: an always-on `check` job on every PR. Separate workflows for firmware, android and python with `paths` filters. Skipped workflows block required checks, so make only `check` required.
- Pin actions to a major tag or commit SHA; use Linux runners.

## Not verified
- Whether the IDF `linux` target runs on Windows (WSL assumed).
- Robolectric, emulator cost in CI, reusable workflows, caching details.
- pytest, ruff, mypy, pyright docs not fetched.
- Release years; SHA-pinning guidance.
- Golden-file patterns (my suggestion, no source).

## Confidence
Medium: host-test and release facts confirmed from official pages; Android emulator, Python and reuse topics were not checked.
