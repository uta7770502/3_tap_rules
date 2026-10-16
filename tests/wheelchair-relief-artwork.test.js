const test=require('node:test'),assert=require('node:assert/strict');
const scenes=require('../assets/scene-guides');
test('conditional MLR M-4 scene is distinct from bunker unplayable relief',()=>{
 const s=scenes.select({id:263},'competition');
 assert.equal(s.key,'wheelchair-bunker-relief');
 assert.notEqual(s.src,scenes.select({id:207},'competition').src);
 assert.match(s.caption,/MLR M-4採用時/);
 assert.match(s.caption,/単にバンカーに近いだけでは救済になりません/);
 assert.match(s.caption,/球がバンカーの外/);
});
