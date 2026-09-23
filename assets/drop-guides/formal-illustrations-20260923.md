# Formal artwork integration — 2026-09-23

Built-in image generation, using drop-hd.webp as character/style reference: blue polo, white cap, beige trousers, detailed illustrated golf course. No contact-sheet crops or upscaling. Encoded directly from original PNG into WebP quality 92.

New assets:
- drop-sequence-hd.webp (1086 × 1448): full portrait three-step scene, measuring / knee-height release / resting ball. The complete image is displayed without cropping. Japanese step captions and a resting-area highlight are HTML/CSS.
- bunker-unplayable-hd.webp (1536 × 1024): dry deep bunker and steep lip.
- bunker-water-hd.webp (1536 × 1024): ball partly submerged in temporary water, dry sand elsewhere in same bunker.
- local-e5-hd.webp (1536 × 1024): fairway, rough and white OB stakes; scene only, no inferred exact E-5 relief boundary.
- replace-action-hd.webp (1536 × 1024): hand replacing ball beside marker.

Prompt set: all prompts specify the reference golfer and full textured course, natural anatomy, no generated text or precise rule geometry. Drop uses three vertically stacked scenes in one full image, not cropped panels. Bunker-water was edited to move the ball into the water and raise the club. Existing 15 high-resolution assets retained for other scenes. All simple SVG diagrams and CSS schematic plates removed from rendering; condition comparisons retained as readable text.

Rules: 9 existing catalog entries corrected, 2 competition entries added. R&A official rule pages 9, 11, 14, 16 consulted. Sources stored per corrected entry. No claim of exhaustive review of all golf rules.

Local verification: 4 existing Node contract/catalog tests passed; UI DOM harness passed camera trigger, focus, microphone fallback, multi-turn history, escaping, retry and reset. All 118 mapped guides render a present image with no SVG or undefined text. Voice simulation covers 6 recognition error types, unsupported browser, synchronous start failure, result delivery, restart and manual stop. These are NOT live AI or iPhone hardware tests.

Deployment/browser verification is recorded separately after release. Preview currently redirects the cloud browser to Vercel login. No authentication protection was disabled.
