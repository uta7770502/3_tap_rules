import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const files=['competition_rules.json','competition_rule25_verified_cases.json','competition_rules_extra_5_10.json','competition_rules_extra_13_17.json','competition_rules_extra_20.json'];
const cases=files.flatMap(f=>JSON.parse(read(f)));
function element(){
 return {value:'',dataset:{},classList:{add(){},remove(){}},childNodes:[],hidden:false,
  textContent:'',innerHTML:'',append(...nodes){this.childNodes.push(...nodes)},before(){},replaceChildren(...nodes){this.childNodes=nodes},
  setAttribute(){},addEventListener(){},get children(){return this.childNodes}};
}
async function page(file,query='',indexFailure=false){
 const nodes=new Map(),calls=[];
 const document={getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)},querySelectorAll(){return []},querySelector(){return null},createElement:element};
 const ctx=vm.createContext({document,window:{},location:{search:query,reload(){}},URLSearchParams,console:{log(){},warn(){},error(){}},fetch:async name=>{
  const path=name.split('?')[0];calls.push(path);
  if(indexFailure&&path==='competition_official_index.json')throw Error('offline index');
  return {ok:true,json:async()=>JSON.parse(read(path))};
 }});
 const source=read(file).match(/<script>([\s\S]*?)<\/script>/)[1];
 vm.runInContext(source,ctx);
 for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));
 return {ctx,nodes,calls};
}
test('real listing loads 444 cases and searches every ID, title and ruling keyword without AI',async()=>{
 const {ctx,nodes,calls}=await page('competition_rules.html');
 assert.equal(vm.runInContext('rules.length',ctx),444);
 assert.equal(nodes.get('count').textContent,'444件表示 / 読み込み済み444件');
 for(const c of cases){
  for(const query of [String(c.id),c.title]){
   nodes.get('q').value=query;vm.runInContext('draw()',ctx);
   assert.ok(nodes.get('list').innerHTML.includes('competition_rule.html?id='+c.id+'"'),'Missing '+c.id+' for '+query);
  }
 }
 for(const query of ['Rule 8.1','規則８．１','Ｒｕｌｅ ８．１']){
  nodes.get('q').value=query;vm.runInContext('draw()',ctx);
  assert.ok(nodes.get('list').innerHTML.includes('competition_rule.html?id=1')||nodes.get('list').innerHTML.includes('class="item"'),query);
 }
 nodes.get('q').value='Rule 8.1';vm.runInContext('draw()',ctx);
 for(const c of cases){
  const refs=[...String(c.rule).split(' / '),...(c.officialSubruleIds||[])];
  const expected=refs.some(ref=>/^8\.1(?:$|[a-z(])/.test(ref));
  assert.equal(nodes.get('list').innerHTML.includes('competition_rule.html?id='+c.id+'"'),expected,'Exact Rule 8.1 scope for case '+c.id);
 }
 assert.ok(calls.every(p=>!p.includes('golf-chat')),'Ordinary search must not call AI');
});
test('case search survives an unavailable official index',async()=>{
 const {ctx,nodes}=await page('competition_rules.html','',true);
 assert.equal(vm.runInContext('rules.length',ctx),444);
 assert.equal(nodes.get('count').textContent,'444件表示 / 読み込み済み444件');
 nodes.get('q').value='救済';vm.runInContext('draw()',ctx);
 assert.ok(nodes.get('list').innerHTML.includes('competition_rule.html?id='));
});
test('real detail loader resolves all 444 IDs to the matching escaped title and ruling',async()=>{
 for(const c of cases){
  const {nodes}=await page('competition_rule.html','?id='+c.id);
  const html=nodes.get('content').childNodes.map(n=>n.innerHTML).join('');
  const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  assert.ok(html.includes('<h1>'+esc(c.title)+'</h1>'),'Detail '+c.id);
  assert.ok(html.includes(esc(c.action||c.procedure)),'Ruling '+c.id);
  if(c.id===218)assert.ok(html.includes('tab=definitionClarifications&id=Club-Length%2F1'),'Definition clarification link');
  if(c.id===259)assert.ok(html.includes('tab=clarifications&id=5.2b%2F3'),'Rule clarification link');
 }
});
test('all selected illustration paths exist in the repository',()=>{
 const treePath=process.env.GOLF_TREE_SNAPSHOT;
 const inventory=treePath?new Set(JSON.parse(fs.readFileSync(treePath,'utf8')).tree.filter(x=>x.type==='blob').map(x=>x.path)):null;
 const exists=p=>inventory?inventory.has(p):fs.existsSync(new URL(p,root));
 const scenes=require('../assets/scene-guides.js');
 const guides=require('../assets/rule-guides.js');
 let mapped=0;const unmapped=[];
 for(const c of cases){
  const scene=scenes.select(c,'competition'),key=guides.select(c,'competition');
  const paths=[];
  if(scene?.dedicated&&!(scene.recovered&&key))paths.push(scene.src);
  else if(key){const g=guides.guides[key];paths.push(key==='bunker-contact'?'assets/dedicated-guides/bunker-hover-final-review-20261111.webp':'assets/minimal-guides/'+g.image+'-hd.png');if(scene?.recovered)paths.push(scene.src);}
  else if(scene)paths.push(scene.src);
  if(!paths.length){unmapped.push(c.id);continue;}
  for(const path of paths)assert.ok(exists(path),'Case '+c.id+': '+path);
  mapped++;
 }
 assert.equal(mapped+unmapped.length,444);
 assert.ok(mapped>0);
 console.log('Illustration references: '+mapped+'/444 mapped; '+unmapped.length+' without mapping (not certified as visually complete).');
});

