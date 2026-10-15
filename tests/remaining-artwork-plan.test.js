const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const plan=require('../assets/dedicated-guides/remaining-plan-20261015.json'),scenes=require('../assets/scene-guides');
test('all 311 baseline review items have exactly one tracked decision',()=>{
 assert.equal(plan.items.length,311);assert.equal(new Set(plan.items.map(r=>r.mode+':'+r.id)).size,311);
 assert.equal(plan.counts.baselineNewAssets,48);assert.equal(plan.newAssets.length,51);
 for(const r of plan.items){assert.ok(r.reason);assert.ok(['new-asset','reuse-review','text-sufficient'].includes(r.decision));}
 assert.equal(plan.items.filter(r=>r.decision==='text-sufficient').length,223);
 assert.equal(plan.items.filter(r=>r.decision==='reuse-review').length,13);
 for(const group of [...plan.newAssets,...plan.reuseCandidates])for(const [mode,ids]of Object.entries(group.targets))for(const id of ids)assert.equal(plan.items.find(r=>r.mode===mode&&r.id===id)?.group,group.key);
});
test('reviewed sharing is limited to ten verified targets and three rejected cases remain planned',()=>{
 let approved=0,rejected=0;
 for(const g of plan.reuseCandidates){
  for(const [mode,ids] of Object.entries(g.targets))for(const id of ids){
   const scene=scenes.select({id},mode);
   if(g.status==='implemented'){
    approved++;assert.equal(scene.key,g.implementedScene);assert.equal(scene.src,g.asset);assert.equal(scene.dedicated,true);
    assert.ok(fs.existsSync(path.join(__dirname,'..',scene.src)));
   }else{
    rejected++;assert.equal(g.status,'rejected-new-asset');assert.notEqual(scene?.key,g.scene);
    assert.equal(plan.newAssets.find(x=>x.key===g.key)?.status,'planned');
   }
  }
 }
 assert.equal(approved,10);assert.equal(rejected,3);
 assert.equal(plan.progress.reusePendingItems,0);
 assert.equal(plan.progress.remainingNewAssets,plan.newAssets.filter(x=>x.status==='planned').length);
});
test('completed planned artwork exists and is mapped, unlike unverified sharing candidates',()=>{
 for(const group of plan.newAssets.filter(r=>r.status==='implemented'))for(const [mode,ids]of Object.entries(group.targets))for(const id of ids){const s=scenes.select({id},mode);assert.equal(s.key,group.key);assert.ok(fs.existsSync(path.join(__dirname,'..',s.src)));}
 assert.notEqual(scenes.select({id:147},'competition').src,scenes.select({id:7},'competition').src);
 assert.notEqual(scenes.select({id:176},'competition').src,scenes.select({id:87},'competition').src);
});
