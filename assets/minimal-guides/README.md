# Minimal A illustration set

31 active instructional illustrations for standard rules, competition rules and iroha.

Style: rounded dark-teal monoline, white and pale mint, no facial details. Rule-significant stake colors remain distinct. Existing detailed illustrations are retained in their original folders but are no longer referenced by active page renderers.

Generation mode: built-in image generation, style-transfer edits. Style reference: approved board, leftmost column A. Initial batch mapping/prompt is in initial-batch.json; later generation prompts and source output paths are in the per-asset JSON files. OB and E-5 images received an additional white-stake correction.

Assets are the 31 PNG files in this directory. Consumers: assets/rule-guides.js and basic_rule_detail.html. Page script version: 20260930-minimal-a1.

Verification: node --test tests/minimal-illustrations.test.js tests/iroha-visuals.test.js tests/golf-coverage.test.js. This checks all active asset paths and renders every mapped rule with a DOM test double. Artwork was visually inspected separately. Live browser rendering is not covered by these tests.

API behavior is unchanged. This set is published to the competition-golfer-mode preview branch only; production promotion is separate.
