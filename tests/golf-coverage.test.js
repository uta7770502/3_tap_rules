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
