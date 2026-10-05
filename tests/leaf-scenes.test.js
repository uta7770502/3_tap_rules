const test=require('node:test');
const assert=require('node:assert/strict');
const scenes=require('../assets/scene-guides');
test('leaf removal scenes distinguish locations and stationary versus moved balls',()=>{
 const cases={42:'green-debris-remove',64:'bunker-leaf-remove',148:'rough-leaf-remove',190:'penalty-leaf-remove'};
 for(const [id,key] of Object.entries(cases)){
  const scene=scenes.select({id},'standard');
  assert.equal(scene.key,key);assert.equal(scene.dedicated,true);
 }
 assert.equal(scenes.select({id:67},'competition').key,'leaf-ball');
 assert.equal(new Set(Object.values(cases)).size,4);
});
