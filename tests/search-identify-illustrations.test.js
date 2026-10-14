const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const scenes=require('../assets/scene-guides'),batch=require('../assets/dedicated-guides/search-identify-batch-20261014.json');
test('putter outside the green is shared only between the two equivalent cases',()=>{
 for(const id of [30,51]){const s=scenes.select({id},'standard');assert.equal(s.key,'fringe-putter');assert.ok(fs.existsSync(path.join(__dirname,'..',s.src)));}
 assert.notEqual(scenes.select({id:29},'standard').key,'fringe-putter');
});
test('search and identification artwork covers seven exact reviewed targets',()=>{
 let count=0;
 for(const r of batch.records){
  assert.ok(fs.statSync(path.join(__dirname,'..',r.src)).size>10000);
  for(const [mode,ids] of Object.entries(r.targets))for(const id of ids){
   const data=require(mode==='standard'?'../rules.json':'../competition_rules.json');
   assert.ok(data.find(x=>x.id===id));
   const scene=scenes.select({id},mode);assert.equal(scene.key,r.key);assert.equal(scene.src,r.src);assert.equal(scene.dedicated,true);count++;
  }
 }
 assert.equal(count,7);
 assert.notEqual(scenes.select({id:7},'competition').src,scenes.select({id:87},'competition').src);
 assert.notEqual(scenes.select({id:241},'competition').src,scenes.select({id:7},'competition').src);
});
