const {test}=require('node:test');const assert=require('node:assert/strict');
const {catalog,count}=require('../lib/golf-grounding');
const general=require('../rules.json'), competition=require('../competition_rules.json');
test('all local topics reach AI search context, including uncommon cases',()=>{
 assert.equal(count,general.length+competition.length);
 for(const r of [...general,...competition]) assert.ok(catalog.includes(r.title),r.title);
 for(const term of ['二度打ち','ダブルヒット','空振り','暫定球','誤球','クラブ','バンカー']) assert.ok(catalog.includes(term),term);
});
test('double hit is discoverable in both catalogs with numeric and Japanese aliases',()=>{
 for(const records of [general,competition]) {
  const r=records.find(r=>r.title.includes('偶然') && /二度|2度/.test(r.title));assert.ok(r);
  for(const q of ['2度打ち','２度打ち','二度打ち','ダブルヒット','2回当たった']) assert.ok(String(r.keywords).includes(q),q);
 }
 assert.equal(competition.find(r=>r.id===155).rule,'10.1d');
});

test('new niche cases have unique IDs, official sources and search aliases',()=>{
 for(const records of [general,competition]) {
  assert.equal(new Set(records.map(r=>r.id)).size,records.length);
  for(const keyword of ['エアレーション','救済確認','茂みで打てない','落ちている途中','速さを調べる']) {
   const r=records.find(r=>r.title.includes(keyword));assert.ok(r,keyword);
   assert.match(r.source,/^https:\/\/www\.randa\.org\/en\/rog\/the-rules-of-golf\/rule-/);
   assert.ok(r.rule && r.procedure && r.penalty && r.keywords.length);
  }
 }
 assert.equal(general.filter(r=>/二度打ち|二重打ち/.test(r.title)).length,1);
});
