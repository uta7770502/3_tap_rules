# 3TAP Golf competition mode — launch readiness evidence ledger

Updated: 2026-11-25. Scope: `competition-golfer-mode`. No deployment, preview/device operation, main merge or production release is authorized by this work.

| Gate | Observed evidence | Remaining |
| --- | --- | --- |
| Inventory and citations | 444 unique IDs 1–444; typed references resolve to maintained index; 336/336 heading mappings | Index resolution does not certify official rulings |
| Search and details | Actual inline scripts executed in Node VM: every ID and full title searchable, 444 matching details; full-width Rule query; Rule 8.1 excludes 18.1; search survives missing official index | Browser/device interaction, broader Japanese synonyms |
| Judge graph | 10/10 complete paths, 14 reachable states; longest route 2 decisions; citations and actions present | Independent substantive review of remaining outcome text |
| Non-AI regression | 16/16 Node tests PASS; route audit, coverage audit and inventory verifier PASS | Hosted CI has not been run for this change |
| Illustrations | 284/444 cases have selected image references; all selected paths exist in the exact GitHub tree snapshot | 160 cases have no selection; determine which need illustrations. Visual/content/right-handed inspection not completed |
| Official text | Judge abnormal-condition/penalty-area outcomes corrected against Rules 16.1 and 17.1e. Targeted R&A reading: IDs 11,64,65,105,187,198,303; corrected 11,64,65,303 | Full 444-case sign-off remains incomplete; targeted reading is not full certification |
| AI | UI states development/unavailable. Original AI tests retained; workflow manual opt-in for deferred AI regression | AI validation and release remain deferred |
| Release | No deployment or preview/device operation performed; vercel.json disables automatic deployments for competition-golfer-mode until preview is authorized | User-authorized preview/device checks and final approval required |

## Targeted source review on 2026-11-25

- IDs 11,64,65: https://www.randa.org/en/rog/the-rules-of-golf/rule-14 — drop method, one-stroke versus general penalty, two drops and placement if the ball will not stay. ID 11 also explicitly flags partner/Rule 25 modifications; those linked special provisions need separate final sign-off.
- IDs 105,303: https://www.randa.org/en/rog/the-rules-of-golf/rule-22 — alternate order, first partner choice, correction and deadline. Added Rule 22.3 to ID 303's references; retained Rule 22.4.
- ID 187: https://www.randa.org/en/rog/the-rules-of-golf/rule-17 — opposite-side relief depends on adoption of MLR B-2; no data change.
- ID 198: https://www.randa.org/en/rog/the-rules-of-golf/rule-23 — wrong-ball exception affects the player rather than automatically penalizing the partner; no data change.

- Judge abnormal-condition outcome: https://www.randa.org/en/rog/the-rules-of-golf/rule-16 — distinguish general area, bunker and putting green; place on green instead of universally dropping.
- Judge penalty-area outcome: https://www.randa.org/en/rog/the-rules-of-golf/rule-17 — add no-play-zone obligation and distinguish ball inside versus stance/swing interference.

## Release gates

- Complete substantive official review of remaining rulings and judge outcomes.
- Resolve illustration necessity for the 160 unassigned cases and visually inspect selected illustrations.
- Verify browser/iPhone/PC behavior only after authorization.
- Keep AI deferred; do not represent deferred checks as passed.
- Obtain final user approval before production release.

## Additional review batch, 2026-11-25

Current content review is bound to exact case-content SHA-256 values for 32 cases: 45, 47, 108, 147, 194, 195, 196, 230, 266, 267, 268, 269, 270, 274, 280, 281, 283, 293, 312, 319, 322, 323, 327, 367, 368, 369, 370, 388, 403, 433, 434, 435. Older verification records for 24 other cases are retained separately without treating them as freshly rechecked. Inventory repaired from 442 to 444. No full 444-case certification is claimed.

Corrected 19 case records: 108, 147, 194, 196, 230, 266, 267, 274, 280, 283, 293, 322, 368, 370, 388, 403, 433, 434, 435. Critical changes: own/other ball distinction under Rules 8.2/8.3; green-only helping ball and stroke-triggered agreement penalty under 15.3a; not-found obstruction relief under 15.2b; natural-force exception under 9.3; advice giver's own playing round; match/stroke Foursomes distinction; handicap duties and correction deadlines; reasonable misunderstanding of concession; holing-out correction deadline.

Official sources used: R&A Rules 3, 5, 8, 9, 15, 22 and 24 at https://www.randa.org/en/rog/the-rules-of-golf/rule-N (N is the Rule number). Review scopes and exact per-case URLs are recorded in competition_official_verification_progress.json.

Illustration references added only for 399 (cart-ball) and 400 (embedded-fairway), reusing existing approved assets after visual inspection, alongside both approved style references. No illustration regenerated. Other 160 unmapped cases still require necessity/content triage. Script URL version changed so the competition detail page requests the updated mappings.
