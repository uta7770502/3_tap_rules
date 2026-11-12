# 3TAP Golf competition mode — launch readiness evidence ledger

Updated: 2026-11-13. Scope: `competition-golfer-mode` only. Do not merge to `main` or deploy while Vercel is restricted.

## Evidence gates (do not infer PASS from the existence of test code)

| Gate | Required evidence | Status |
| --- | --- | --- |
| 444 case inventory | Five JSON files total exactly 444; IDs unique and 1–444; fields and rule references validated | Automated assertions present; latest PASS not yet recorded |
| R&A/USGA accuracy | Human comparison of every case's ruling, penalty, exceptions and current effective rule against official sources, with reviewer/date and corrections logged | NOT VERIFIED |
| Judge graph | All reachable states, every branch, citations and next action; separately manually review legal accuracy and three-tap promise | Automated assertions present; legal review NOT VERIFIED |
| Search and details | Every ID navigates, Rule 1–25 filters and search variants work, errors/retry, safe rendering | Static assertions present; browser test NOT VERIFIED |
| CI | Node syntax, rule-reference regression and static audit pass on the target branch SHA | NOT VERIFIED |
| AI photo consultation | API validation, failure/timeout, large photos, camera/library permission, mobile/browser behavior and privacy | NOT VERIFIED |
| Illustrations | Referenced assets exist, no broken links, visual correctness and right-handed depiction | NOT VERIFIED |
| Responsive | Small-phone and desktop navigation, overflow, accessible controls | NOT VERIFIED |
| Vercel / production | Build restriction lifted, deployment succeeds, smoke test on public URL | BLOCKED; DO NOT TRIGGER BUILD |

## Required release sign-off

- [ ] Record target commit SHA and successful GitHub Actions run URL.
- [ ] Attach machine-readable report of all 444 case checks; identify any false-positive or unreviewed legal assertions.
- [ ] Record R&A/USGA reference, effective date, reviewer, and result for each case. Do not copy the full official rules without permission.
- [ ] Record every judge path, destination, outcome and rule basis; flag paths needing more than three decisions.
- [ ] Verify list/detail access for every case ID in a browser, not only by source-string checks.
- [ ] Verify AI photo consultation on actual supported devices, including failure and retry.
- [ ] Verify illustration file references and inspect visual quality.
- [ ] Verify responsive views, keyboard access, and external links.
- [ ] After Vercel restriction is confirmed lifted, perform authorized preview/production validation separately.

## Completion metric

Report *verified gates / total gates* alongside outstanding critical blockers. Do not translate a historical 80% estimate into 90%, 95% or 100% without fresh test evidence. CI PASS proves static consistency only; it does not certify the legal interpretation of any case.
