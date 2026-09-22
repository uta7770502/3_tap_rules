# Rule illustrations — 2026-09-22

Nine individual 1536 × 1024 WebP illustrations replace the thirteen simplified
SVG guides and the low-resolution contact-sheet assets. They are newly rendered
derivatives of the approved blue-polo / white-cap illustration, not enlarged
crops of the six-panel sheet. Source PNGs were generated with the built-in image
tool; WebP exports retain their original dimensions (quality 95).

Style references: ゴルフ救済ルール図解：ペナルティーエリア.png and
ゴルフの正しいドロップ方法ガイド.png. The former supplies the character, colour,
outlines and scenery; the latter supplies the knee-height drop pose.

Generation prompts: a single detailed landscape illustration with the same adult
golfer, blue polo, white cap, beige trousers and white shoes; no UI, labels or
measurement geometry. Individual scenes are red penalty boundary, yellow penalty
boundary, tree roots, cart path, embedded ball, bunker, OB boundary, replacing a
ball, and knee-height drop. Text, callouts and the drop arrow are rendered in HTML
and CSS to remain sharp and editable.

`../rule-guides.js` owns the dataset-specific rule mappings and the fourteen guide
variants. Do not select images by matching arbitrary words in a rule body.
`../rule-guides.css` caps the image width for retina display. Both the ordinary
detail page and the competition detail page use this renderer.

Important distinctions: bunker abnormal conditions vs. bunker unplayable;
E-5 vs. special forward tees; penalty-area relief vs. unplayable relief; and
re-dropping vs. replacing. Wind movement outside a green must not display a
generic replacement guide. Illustrations depict the situation; the applicable
rule text controls the actual relief area, exceptions and penalties.

Reference checks:
- https://www.randa.org/rog/the-rules-of-golf/rule-14
- https://www.randa.org/rog/committee-procedures/8

For a future release update the shared asset version and the service-worker
cache name together. Do not reintroduce the old SVGs as loading fallbacks.

## Additional scene illustrations — hd2

Three new 1536 × 1024 scenes, generated with the built-in image tool using
red-hd.webp as the character/style reference. Prompts: the same blue-polo,
white-cap golfer (1) crouching beside white OB stakes inspecting a ball,
(2) preparing a tee shot between blue tee markers, and (3) addressing a ball
on grass with shoes on a paved cart path. No text or measurement geometry in
the generated raster. WebP quality 95; original dimensions retained.

The renderer provides separate HTML/CSS OB boundary comparison and teeing-area
schematic, plus before/after stance checks. These are explanatory panels, not
measurement overlays on perspective paintings. Sources checked 2026-09-22:
https://www.randa.org/rog/the-rules-of-golf/rule-18
https://www.randa.org/rog/the-rules-of-golf/rule-6
https://www.randa.org/rog/the-rules-of-golf/rule-16
