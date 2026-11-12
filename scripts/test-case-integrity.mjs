// Independent data integrity regression checks. Run: node --test scripts/test-case-integrity.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,root),'utf8'));
const files=['competition_rules.json','competition_rule25_verified_cases.json','competition_rules_extra_5_10.json','competition_rules_extra_13_17.json','competition_rules_extra_20.json'];
const cases=files.flatMap(read);
const index=read('competition_official_index.json');
const headings=new Set(index.officialRuleSubrules.flatMap(g=>g.subrules.map(s=>s.id)));
const rules=new Set(index.officialRuleSubrules.map(g=>String(g.rule)));
function validReference(ref){
 if(typeof ref!=='string'||ref!==ref.trim().normalize('NFKC'))return false;
 if(headings.has(ref)||rules.has(ref))return true;
 const nested=ref.match(/^(\d{1,2}\.\d+[a-z]?)(?:\(\d+\))+$/);
 return Boolean(nested&&headings.has(nested[1]));
}
test('case inventory has exactly 444 unique safe integer IDs',()=>{
 assert.equal(cases.length,444);
 assert.deepEqual(cases.map(c=>Number(c.id)).sort((a,b)=>a-b),Array.from({length:444},(_,i)=>i+1));
});
test('every official citation resolves to a heading, rule, or indexed paragraph parent',()=>{
 for(const c of cases){
  assert.ok(Array.isArray(c.officialSubruleIds),'Case '+c.id+' missing reference array');
  for(const ref of c.officialSubruleIds)assert.ok(validReference(ref),'Case '+c.id+': '+ref);
 }
});
test('reference validation rejects malformed and fabricated nested headings',()=>{
 for(const ref of ['0','26','20.1c(3)<script>','20.1c()',' 1.3','１．３','99.1a(1)'])assert.equal(validReference(ref),false,ref);
});
test('case source links use HTTPS and have no embedded credentials',()=>{
 for(const c of cases){
  assert.equal(typeof c.source,'string','Case '+c.id);
  const url=new URL(c.source);
  assert.equal(url.protocol,'https:','Case '+c.id);
  assert.ok(url.hostname&&!url.username&&!url.password,'Case '+c.id);
 }
});
