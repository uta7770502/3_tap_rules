# 444-case static ID inventory — 2026-11-17 20:00 JST

Scope: `competition-golfer-mode`, read-only inspection of five JSON files. This is **data inventory, not a test execution or rules correctness certification**.

| Source | Records | ID span |
|---|---:|---|
| competition_rules.json | 341 | 1–374 (332–364 are in Rule 25 file) |
| competition_rule25_verified_cases.json | 33 | 332–364 |
| competition_rules_extra_5_10.json | 20 | 375–394 |
| competition_rules_extra_13_17.json | 14 | 395–408 |
| competition_rules_extra_20.json | 36 | 409–444 |
| **Total** | **444** | **1–444** |

Independent static JSON parsing of all five files at branch head `9be4b20859ae9d26939f95d9d69809d580ef832d` found **444 records, 444 unique integer IDs, no duplicate IDs, and no missing IDs in 1–444**.

Historical `competition_runtime_442_case_reconciliation.json` records 442 unique IDs from the same five files when the last file contained 34 entries (409–442). Current file has 36 entries (409–444). The old reconciliation document is a **historical snapshot**; do not interpret its 442 figure as current runtime count.

**Boundaries:** This establishes only static record/ID completeness. It does not establish that every case is reachable via the UI, has accurate adjudication, or is compliant with current R&A/USGA/JGA rules. Old 442-case audit ledger version equivalence and all-field historical comparison remain separate tasks. No official rule text is copied here.

**Explicitly not performed:** automated tests (including additions), CI/Actions checks, Vercel previews/deploys, browser/iPhone/PC runtime checks. `main` and Production untouched.

## 2026-11-17 21:00 JST — historical ledger and UI source review

- Read `competition_runtime_442_case_reconciliation.json` directly on `competition-golfer-mode`. Its `generatedAt` is **2026-11-04**, `totalLoadedCases=442`, `uniqueIds=442`, `duplicateIds=[]`. It lists source counts **341 + 33 + 20 + 14 + 34 = 442**. This is a historical snapshot, not a current count or proof of content correctness.
- Its `remainingRisks` explicitly records **163 divergent base-file records** whose `summary/action` versus `description/procedure` fields need editorial review. This number is **a risk recorded in the historical ledger**, not a fresh independent recount, and must not be conflated with the four IDs changed since the pre-addition Git SHA.
- Read `competition_rules.html` at the current branch. `normalize()` prefers `summary` over `description`, and `action` over `procedure`; `textOf()` searches the normalized display fields. Consequently, historical divergence can materially affect search hits and what users read. Reviewing the 163 records is a launch-content priority; do not blindly overwrite one field with another.
- The list links to `competition_rule.html?id=<ID>` and the source constructs links using `encodeURIComponent`. This verifies **link construction only**, not successful navigation to every detail page.
- The five case JSON loads are grouped in `Promise.all`: failure of any one case source triggers the whole-page load error. The official-index fetch has a separate fallback. This is a **source-level availability risk**, not a verified runtime defect; resilience changes require deliberate design and later authorized validation.
- No app code changed in this pass. No official rules newly certified. No automated tests/CI, preview/deploy, browser, or device checks performed. No changes to `main` or Production.
