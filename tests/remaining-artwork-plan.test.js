const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const plan=require('../assets/dedicated-guides/remaining-plan-20261015.json'),scenes=require('../assets/scene-guides');
test('all 311 baseline review items have exactly one tracked decision',()=>{
 assert.equal(plan.items.length,311);assert.equal(new Set(plan.items.map(r=>r.mode+':'+r.id)).size,311);
 assert.equal(plan.newAssets.length,48);
 for(const r of plan.items){assert.ok(r.reason);assert.ok(['new-asset','reuse-review','text-sufficient'].includes(r.decision));}
 assert.equal(plan.items.filter(r=>r.decision==='text-sufficient').length,223);
 assert.equal(plan.items.filter(r=>r.decision==='reuse-review').length,13);
 for(const group of [...plan.newAssets,...plan.reuseCandidates])for(const [mode,ids]of Object.entries(group.targets))for(const id of ids)assert.equal(plan.items.find(r=>r.mode===mode&&r.id===id)?.group,group.key);
});
test('completed planned artwork exists and is mapped, unlike unverified sharing candidates',()=>{
 for(const group of plan.newAssets.filter(r=>r.status==='implemented'))for(const [mode,ids]of Object.entries(group.targets))for(const id of ids){const s=scenes.select({id},mode);assert.equal(s.key,group.key);assert.ok(fs.existsSync(path.join(__dirname,'..',s.src)));}
 assert.notEqual(scenes.select({id:147},'competition').src,scenes.select({id:7},'competition').src);
 assert.notEqual(scenes.select({id:176},'competition').src,scenes.select({id:87},'competition').src);
});
