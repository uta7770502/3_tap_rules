const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.join(__dirname,'..');const scenes=require('../assets/scene-guides.js');const guides=require('../assets/rule-guides.js');
class Element{constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.classList={add(){}};this.hidden=false;}append(...c){this.children.push(...c);}replaceChildren(){this.children=[];}setAttribute(){}addEventListener(){}get childNodes(){return this.children;}}
const walk=(el,tag)=>el.tag===tag?el:el.children.map(x=>walk(x,tag)).find(Boolean);
test('every standard and competition case renders existing precise artwork or a context scene',()=>{
 global.document={createElement:t=>new Element(t)};global.RuleScenes=scenes;
 try{for(const [mode,file,count] of [['standard','rules.json',247],['competition','competition_rules.json',258]]){
 const rules=JSON.parse(fs.readFileSync(path.join(root,file)));assert.equal(rules.length,count);
 for(const rule of rules){const el=new Element('section');guides.render(el,rule,mode);assert.equal(el.hidden,false,mode+rule.id);const img=walk(el,'img');assert.ok(img,mode+rule.id);assert.ok(fs.existsSync(path.join(root,img.src.split('?')[0])),img.src);if(!guides.select(rule,mode)){assert.ok(walk(el,'details'));assert.equal(walk(el,'h2').textContent,scenes.select(rule,mode).dedicated?'このケースの状況':'場面をイメージ');}}
 }}finally{delete global.document;delete global.RuleScenes;}
});
test('all 40 iroha pages resolve artwork, while unknown IDs do not gain arbitrary images',()=>{
 const h=fs.readFileSync(path.join(root,'basic_rule_detail.html'),'utf8');const ctx=vm.createContext({window:{RuleScenes:scenes},RuleScenes:scenes});vm.runInContext(h.slice(h.indexOf('const IROHA_VISUALS='),h.indexOf('document.addEventListener("DOMContentLoaded"')),ctx);
 const rules=JSON.parse(fs.readFileSync(path.join(root,'basic_rules.json')));assert.equal(rules.length,40);for(const r of rules){const v=ctx.visualFor(r);assert.ok(v,r.title);assert.ok(fs.existsSync(path.join(root,v.src)),v.src);}assert.equal(scenes.select({id:9999},'standard'),null);
});
test('context assets keep full resolution and compact total transfer size',()=>{let bytes=0;for(const scene of Object.values(scenes.scenes)){if(!scene.file)continue;const b=fs.readFileSync(path.join(root,'assets/scene-guides',scene.file+'.webp'));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');bytes+=b.length;}assert.ok(bytes<1200000);});
test('materially different situations never reuse the same dedicated picture',()=>{
 const pair=(a,b)=>assert.notEqual(scenes.select({id:a},'competition').src,scenes.select({id:b},'competition').src);
 pair(170,171);pair(94,217);pair(94,239);pair(217,239);
 for(const id of [94,170,171,175,211,217,238,239])assert.equal(scenes.select({id},'competition').dedicated,true);
 assert.equal(scenes.select({id:77},'standard').key,'lift-no-marker');
 assert.equal(scenes.select({id:61},'standard').key,'sand-contact');
});
