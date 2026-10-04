const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const guides = require('../assets/rule-guides.js');
test('all 34 active illustrations use the minimal A set', () => {
  const html = fs.readFileSync(path.join(root, 'basic_rule_detail.html'),'utf8');
  const code = html.slice(html.indexOf('const IROHA_VISUALS='),html.indexOf('document.addEventListener("DOMContentLoaded"'));
  const ctx = vm.createContext({}); vm.runInContext(code,ctx);
  const paths = new Set(Object.values(guides.guides).map(g=>'assets/minimal-guides/'+g.image+'-hd.png'));
  const rules = JSON.parse(fs.readFileSync(path.join(root,'basic_rules.json'),'utf8'));
  for(const rule of rules){ const visual=ctx.visualFor(rule); if(visual) paths.add(visual.src); }
  assert.equal(paths.size,34);
  for(const src of paths){
    assert.match(src,/^assets\/minimal-guides\//);
    const data=fs.readFileSync(path.join(root,src));
    assert.equal(data.subarray(1,4).toString(),'PNG');
    assert.ok(data.readUInt32BE(16)>=1000);
  }
  for(const file of ['rule_detail.html','competition_rule.html'])
    assert.match(fs.readFileSync(path.join(root,file),'utf8'),/rule-guides\.js\?v=20261005-dedicated1/);
});
test('guide renderer resolves minimal assets for every mapped rule',()=>{
  class Element {
    constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.classList={add(){}};}
    append(...children){this.children.push(...children);}
    replaceChildren(){this.children=[];}
    addEventListener(){} setAttribute(){}
    get childNodes(){return this.children;}
  }
  global.document={createElement:tag=>new Element(tag)};
  try{
    for(const mode of ['standard','competition']) for(const ids of Object.values(guides[mode])) for(const id of ids){
      const el=new Element('section');guides.render(el,{id},mode);
      const walk=e=>e.tag==='img'?e:e.children.map(walk).find(Boolean);
      const img=walk(el); assert.ok(img);assert.match(img.src,/^assets\/minimal-guides\//);
      assert.ok(fs.existsSync(path.join(root,img.src.split('?')[0])));
    }
  }finally{delete global.document;}
});

