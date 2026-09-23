# AI chat integration

The competition assistant now calls `/api/golf-chat` (Vercel Node function), which calls OpenAI Responses. There is no keyword/demo answer fallback. API keys stay server-side.

Required server environment: `OPENAI_API_KEY`. Optional `OPENAI_MODEL` defaults to `gpt-4.1-mini` (vision + web search). Configure in the target Vercel environment and redeploy. Never place a key in HTML, browser JavaScript, a public-prefixed variable, Git, or chat. This change does not provision a key.

The API includes all conversation turns and compressed photos, `store:false`, official-domain web search (R&A, USGA, JGA), clickable source links, 1,800 output tokens and 2 tool calls maximum per response. Both model and search usage are billed. History is in tab memory only; new consultation/reload clears it. Images are sent to OpenAI on submission and in subsequent turns of that consultation. Service workers bypass the API.

Keep the preview protected while validating. Before public production release, configure an authenticated quota or Vercel Firewall rate limit and provider spending controls. Per-request bounds do not constitute a daily spending cap.

Validation: `node --test tests/golf-chat.test.js`. Tests mock upstream; they validate request history/images, errors and role validation, not live model quality. Browser DOM checks cover buttons, escaping, retry and reset. Real iPhone camera/speech, live AI answers and source correctness still need testing after credentials are configured.

Acceptance cases: broken club → normal stroke → penalty follow-up; red penalty area → lateral relief; photograph with uncertain boundary → clarify without inventing facts. Confirm the current rule and local rule with the competition committee where needed.

Official API documentation:
- https://developers.openai.com/api/docs/guides/images-vision
- https://developers.openai.com/api/docs/guides/conversation-state
- https://developers.openai.com/api/docs/guides/tools-web-search

Coverage update: the full local title/alias catalog now accompanies the model as search hints, not authoritative rulings. Verified double-hit guidance and intentional-moving-ball distinction are included. `tests/ai-acceptance.json` contains 16 live acceptance scenarios. These are a manual evaluation checklist, not passed model tests. Run all local contract/catalog tests with `node --test tests/*.test.js`. API credentials are still needed for actual answer evaluation.

Added six reviewed niche cases to both lists on 2026-09-23 (Rules 6.2b(5), 13.1c, 13.1e, 16.1a, 16.4); consolidated the double-hit duplicate without reusing its retired ID. Total entries: 503 (247 general, 256 competition; overlapping subjects are not unique rules). Live AI validation remains pending.
