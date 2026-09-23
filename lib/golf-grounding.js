const general = require('../rules.json');
const competition = require('../competition_rules.json');
// This catalog guides search; unreviewed local descriptions are not authority.
const catalog = [...general, ...competition].map(r => `${r.title} | ${Array.isArray(r.keywords) ? r.keywords.join(' ') : r.keywords || ''}`).join('\n');
const guidance = `
表記ゆれを理解すること。「2度打ち」「２度打ち」「二度打ち」「ダブルヒット」「ダブルタッチ」「1回のスイングで2回当たった」は同じ相談の可能性がある。
確認済み基礎（2026-09-23、R&A規則10.1a https://www.randa.org/en/rog/the-rules-of-golf/rule-10）：1回のストローク中にクラブが偶然複数回球に当たった場合、1ストロークだけを数え、追加の罰はない。二度打ちの相談ではこの条件付きの結論を先に示す。故意の別ストローク、押し出し、かき寄せ等とは区別する。故意に動いている球へストロークをする場合は10.1dとその例外を確認する。
以下はサイト内の全項目の検索手掛かりで、裁定の根拠そのものではない。項目にないケースも公式規則本文・解釈・ローカルルールを検索する。単語一致で回答を決めず、元の相談と追質問を一体として解釈する。検索できなければ不足情報と確認先を具体的に示し、規則1.3などの一般論を繰り返さない。
` + catalog;
module.exports = {guidance, catalog, count: general.length + competition.length};
