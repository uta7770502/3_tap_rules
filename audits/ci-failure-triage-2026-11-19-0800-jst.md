# CI failure triage — 2026-11-19 08:00 JST

Scope: competition-golfer-mode; no deployment, UI, main or production changes.

Evidence: https://github.com/uta7770502/3_tap_rules/actions/runs/44355217385 (historical run; not proof of latest branch CI).

Historical test output: 13 tests, 9 PASS, 4 FAIL. Syntax stage PASS.

1. scripts/test-case-integrity.mjs: official citation test FAIL at case 120; rule field is 'MLR A-4', which does not conform to ordinary numbered Rules. Must verify adopted Model Local Rule and update the schema/tests without inventing numbered citations.
2. scripts/test-case-integrity.mjs: reference-array test FAIL at case 112; officialSubruleIds is not an array. Inspect source semantics before repair.
3. scripts/test-golf-chat-validation.mjs: positive-image test FAIL because fixture bytes are Buffer.from('test') rather than actual PNG/JPEG/WebP signatures and dimensions; production validation correctly rejects them. Replace test fixtures with valid minimal image data, not weaken validation.
4. scripts/test-rule-references.mjs: rule-reference test FAIL at case 120 ('MLR A-4'); same category as item 1.

Next steps: inspect cases 112 and 120 and verify relevant R&A MLR; correct fixtures; run node --test and independent 444-case audit. Do not mark any legal/rule accuracy PASS from these structural tests.

This audit document records findings only; no tests were rerun and no production logic was changed in this pass.
