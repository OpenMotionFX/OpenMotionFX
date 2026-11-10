# ESP32-P4 timing

## Decision this feeds
Clock scheme v0 and firmware approach: ESP-IDF version, PTP component, pulse method, laptop testing.

## Findings
- Hardware-timestamped PTP/gPTP on the P4 EMAC is real. Community component scrambletools/esp_ptp, latest 1.14.0 (read today), Apache-2.0, supports PTP and gPTP, targets esp32p4 and esp32c6, tested on Waveshare ESP32-P4-ETH and P4-WiFi6-PoE-ETH. https://components.espressif.com/components/scrambletools/esp_ptp/versions/1.14.0/readme
- Official ESP-IDF example examples/ethernet/ptp exists for ESP32-P4 and ESP32-S31. It toggles a GPIO on both boards so a scope can compare edges. https://github.com/espressif/esp-idf/tree/master/examples/ethernet/ptp
- ESP-IDF exposes EMAC clock calls esp_eth_clock_gettime and esp_eth_clock_settime; the daemon is a NuttX ptpd port. https://developer.espressif.com/blog/2026/06/aes67-audio-over-ip-on-the-esp32-p4/
- Newest ESP-IDF release page shows v6.1 (27 Aug) marked Latest and v5.5.6 (16 Oct). v6.1 makes P4 revision v3.0 the default. https://github.com/espressif/esp-idf/releases
- Pulse method: the example schedules pulses from synced time with a configurable width. The exact mechanism (hardware PPS, target-time interrupt or software toggle) is not stated, and no jitter figure is published. https://github.com/espressif/esp-idf/tree/master/examples/ethernet/ptp
- Waveshare ESP32-P4-ETH: 100M RJ45, 27 free GPIOs on two 20-pin headers, 2-lane MIPI-CSI connector, PoE header. PHY and PoE power not stated. https://docs.waveshare.com/ESP32-P4-ETH
- Listed variants: ETH, ETH-M, POE-ETH, POE-ETH-KIT-A/B, POE-ETH-NH and NH-KIT-A/B. The page does not say how they differ. Same URL.
- Laptop testing: ESP-IDF linux target (experimental, COMPONENTS limited to main) and CMock/Unity mocks. QEMU is undocumented. https://docs.espressif.com/projects/esp-idf/en/latest/esp32p4/api-guides/host-apps.html
- Wokwi lists the P4 as beta; Ethernet not mentioned. https://docs.wokwi.com/guides/esp32
- The only sub-microsecond claim found is a general one for MAC hardware timestamping. https://developer.espressif.com/blog/2026/06/aes67-audio-over-ip-on-the-esp32-p4/

## Recommendation
Use ESP-IDF v6.1 (or v5.5.x if the example builds there) with the official ptp example as the base, adding esp_ptp 1.14.0 only if needed. Put the pulse-time maths in a plain C module, tested on the laptop with Unity or the linux target. Measure jitter with the logic analyser rather than assume it.

## Not verified
- Minimum IDF version for esp_ptp and the example.
- Pulse mechanism and jitter.
- PoE variant differences, PoE power budget, PHY chip.
- Unmanaged switch (TL-SG1005P) behaviour and offset numbers; nothing found.
- P4 QEMU support; Wokwi Ethernet.

## Confidence
Medium: PTP support is confirmed, but pulse jitter, variant differences and switch effects are unconfirmed.
