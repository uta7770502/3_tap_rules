const test=require('node:test'),assert=require('node:assert/strict');
const rules=require('../competition_rules.json'),scenes=require('../assets/scene-guides');
test('aborted downswing requires actual avoidance of contact, unlike an unsuccessful attempted stop',()=>{
 const r=rules.find(x=>x.id===221);
 assert.match(r.description,/止められずに球を打った場合はストローク/);
 assert.match(r.procedure,/接触を回避した場合/);
 assert.match(r.penalty,/1ストローク/);
 assert.doesNotMatch(r.procedure,/球に当たってもストロークにならない/);
 assert.equal(scenes.select(r,'competition').key,'stopped-downswing');
});
