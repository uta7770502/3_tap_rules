// Regression tests for official Rule reference parsing in the 444-case audit.
// Run: node --test scripts/test-rule-references.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const audit=readFileSync(new URL('./audit-competition-routes.mjs',import.meta.url),'utf8');
const source=audit.match(/const caseRuleMatch=caseRule\.match\((\/\^.*?\$\/)\);/);
assert.ok(source,'Cannot locate the production Rule-reference pattern');
const rulePattern=Function('return '+source[1])();

test('accepts valid top-level and nested Rule references',()=>{
 for(const rule of ['1','25','1.3','3.3b','20.1c(3)','20.1c(3)(a)','8.1d']){
  const match=rule.match(rulePattern);
  assert.ok(match,rule);
  assert.ok(Number(match[1])>=1 && Number(match[1])<=25,rule);
 }
});
test('rejects malformed or out-of-range Rule references',()=>{
 for(const rule of ['0','26','99','1.','1.3.4','3.3B','3.3b()','20.1c(3)extra','Rule 8','8.1 d','8.1d<script>']){
  assert.equal(rulePattern.test(rule),false,rule);
 }
});
test('checks actual 444 case references without silently skipping files',()=>{
 const files=['competition_rules.json','competition_rule25_verified_cases.json','competition_rules_extra_5_10.json','competition_rules_extra_13_17.json','competition_rules_extra_20.json'];
 const cases=files.flatMap(file=>JSON.parse(readFileSync(new URL('../'+file,import.meta.url),'utf8')));
 assert.equal(cases.length,444);
 for(const c of cases){
  if(c.rule==='定義'){
   assert.equal(c.source,'https://www.randa.org/en/rog/the-rules-of-golf/definitions','Definition source: '+c.id);
   continue;
  }
  assert.match(String(c.rule).trim(),rulePattern,'Case '+c.id);
 }
});
