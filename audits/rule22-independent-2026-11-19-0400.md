# 2026-11-19 04:00 JST — Rule 22 independent audit

Scope: competition-golfer-mode, no production deployment. Audit against R&A Rule 22 page accessed 2026-11-19: https://www.randa.org/en/rog/the-rules-of-golf/rule-22

## Case 105 — Foursomes wrong order (22.3)
- Source fields inspected: title, summary, action, penalty, officialSubruleIds, source.
- PASS (basic disposition): match play loss of hole; stroke play general penalty (two penalty strokes), correction from original wrong-order stroke location by correct partner, subsequent strokes on wrong ball not counted, disqualification if not corrected before next hole / returning final scorecard.
- NOT FULL PASS: clarification/exception coverage and end-to-end branching not verified.
- Additional Rule 22.3 conditions to test: provisional ball played by next partner; stroke cancelled or replayed (same partner plays next); penalty strokes do not alter order.

## Case 303 — Foursomes first tee partner (22.4a)
- Source fields inspected: title, summary, action, penalty, officialSubruleIds, source.
- PASS (basic disposition): side chooses which partner starts unless Terms of Competition specify first partner; alternate first teeing player on subsequent holes.
- NOT FULL PASS: Rule 22.4b start-time/presence distinctions not tested; UI branch paths not verified.

## Other previously flagged cases
- IDs 11, 15, 16, 64, 65, 72: source content retrieved in this run, but no complete independent official rules/clarifications comparison; status UNVERIFIED, not PASS.
- Source JSON counts observed: 341 + 33 + 20 + 14 + 36 = 444. This is only file count, NOT a full rules audit or browser reachability proof.

## Run ledger
- Cases fetched: 444
- Priority cases inspected: 8
- Rule 22 cases partially checked against official source: 2
- Fully certified cases this run: 0
- Failures established: 0; unresolved checks are UNVERIFIED, not PASS.
- No code behavior changed in this audit. No main/Production merge, Vercel deployment, or device preview.
