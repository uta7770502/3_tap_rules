const fs=require('fs');
const rules=JSON.parse(fs.readFileSync('competition_rules.json','utf8'));
const idx=JSON.parse(fs.readFileSync('competition_official_index.json','utf8'));
const errors=[];
const ids=rules.map(x=>String(x.id));
if(new Set(ids).size!==ids.length) errors.push('duplicate competition rule IDs');
for(const r of rules){if(!r.id||!r.rule||!r.title||!(r.description||r.summary)||!(r.procedure||r.action)||!r.penalty)errors.push('missing required field: '+(r.id||'?'));}
for(let n=1;n<=25;n++){if(!rules.some(x=>parseInt(String(x.rule),10)===n))errors.push('Rule '+n+' has no case');}
if((idx.definitions||[]).length<74)errors.push('definitions index incomplete: '+(idx.definitions||[]).length);
const mlr=idx.modelLocalRules||[];
if(mlr.length<91)errors.push('MLR index below known 2026 minimum: '+mlr.length);
if(!mlr.some(x=>x.id==='E-14'))errors.push('2026 MLR E-14 missing');
if(new Set(mlr.map(x=>x.id)).size!==mlr.length)errors.push('duplicate MLR codes');
if(mlr.some(x=>!x.id||!x.title))errors.push('MLR with missing code or title');
if(mlr.some(x=>!x.source?.startsWith('https://www.randa.org/')))errors.push('MLR official source URL missing');
if(!Array.isArray(idx.officialMlrIds)||idx.officialMlrIds.length<91)errors.push('official MLR code-by-code source checklist missing; count alone cannot certify completeness');
else for(const id of idx.officialMlrIds){if(!mlr.some(x=>x.id===id))errors.push('missing official MLR: '+id);}
if((idx.committeeProcedures||[]).length!==9)errors.push('committee procedures sections incomplete: '+(idx.committeeProcedures||[]).length);
if((idx.committeeProcedures||[]).some(x=>!x.source?.startsWith('https://www.randa.org/')))errors.push('committee section source URL missing');
if((idx.clarificationGroups||[]).length!==24)errors.push('clarification groups incomplete: '+(idx.clarificationGroups||[]).length);
if(!Array.isArray(idx.officialRuleSubrules)||idx.officialRuleSubrules.length<25)errors.push('official Rule 1-25 subrule-by-subrule checklist missing');
else for(const x of idx.officialRuleSubrules){if(!x.rule||!Array.isArray(x.subrules)||!x.subrules.length)errors.push('incomplete official subrule mapping: '+x.rule);}
for(const x of idx.officialRuleSubrules||[]){
  if(!x.source?.includes('randa.org'))errors.push('official Rule source missing: '+x.rule);
  const ids=(x.subrules||[]).map(s=>s.id);
  if(new Set(ids).size!==ids.length)errors.push('duplicate subrule ID in Rule '+x.rule);
  for(const sub of x.subrules||[])if(!sub.id||!sub.title||!sub.url?.includes('randa.org'))errors.push('unlinked official subrule in Rule '+x.rule);
}
const caseRuleIds=new Set(rules.map(x=>String(x.rule).trim()));
const unlinkedSubrules=(idx.officialRuleSubrules||[]).flatMap(g=>(g.subrules||[]).filter(x=>!caseRuleIds.has(x.id)&&!(Array.isArray(x.verifiedCaseIds)&&x.verifiedCaseIds.length)).map(x=>x.id));
if(unlinkedSubrules.length)errors.push(unlinkedSubrules.length+' official subrules lack an explicit case ID or reviewed cross-reference: '+unlinkedSubrules.slice(0,15).join(', '));
if((idx.officialRuleSubrules||[]).some(x=>x.verificationScope?.includes('pending')))errors.push('Rule subrule full-text and case review incomplete');

// Verified against R&A Rule 25 section headings (2026-10-29).
const expected25=['25.1','25.2',...'abcdefgh'.split('').map(x=>'25.2'+x),'25.3',...'abcd'.split('').map(x=>'25.3'+x),'25.4',...'abcdefghijklmn'.split('').map(x=>'25.4'+x),'25.5',...'abcde'.split('').map(x=>'25.5'+x),'25.6','25.6a','25.6b'];
const rule25=(idx.officialRuleSubrules||[]).find(x=>x.rule===25);
const actual25=(rule25?.subrules||[]).map(x=>x.id);
for(const id of expected25)if(!actual25.includes(id))errors.push('missing official Rule 25 subrule: '+id);
for(const id of actual25)if(!expected25.includes(id))errors.push('unverified extra Rule 25 subrule: '+id);
if(new Set(actual25).size!==actual25.length)errors.push('duplicate Rule 25 subrule');
if(!rule25?.source?.includes('randa.org'))errors.push('Rule 25 official source URL missing');

if(!Array.isArray(idx.clarifications)||!idx.clarifications.length)errors.push('individual Clarifications have not been indexed');
if(!idx.clarificationCoverage?.allGroupsComplete||!idx.clarificationCoverage?.contentAudited)errors.push('individual Clarifications are not fully verified against every official group and full text');
const clarificationGroupIds=new Set((idx.clarificationGroups||[]).map(x=>x.id));
const reviewedGroupIds=new Set(idx.clarificationCoverage?.verifiedGroupIds||[]);
for(const id of clarificationGroupIds)if(!reviewedGroupIds.has(id))errors.push('unverified Clarification group: '+id);
if((idx.clarifications||[]).some(x=>!x.verifiedDate||!x.verificationScope))errors.push('individual Clarifications lack provenance and review scope');
if((idx.clarifications||[]).some(x=>x.verificationScope?.includes('not audited')))errors.push('individual Clarification full-content review pending');

if((idx.clarifications||[]).some(x=>!x.id||!x.title||!x.source?.includes('randa.org')))errors.push('individual Clarifications contain missing IDs, titles or official sources');
if(new Set((idx.clarifications||[]).map(x=>x.id)).size!==(idx.clarifications||[]).length)errors.push('duplicate individual Clarification IDs');

// Regression checks for individually source-verified Clarification heading inventories.
// These are *minimums*, not a declaration that all 24 groups have been audited.
const clarificationMinimums={1:9,3:19,4:10,5:18,6:7,7:5};
for(const [rule,min] of Object.entries(clarificationMinimums)){
  const actual=(idx.clarifications||[]).filter(x=>Number(x.rule)===Number(rule));
  if(actual.length<min)errors.push('verified Rule '+rule+' Clarification headings regressed: '+actual.length+' < '+min);
}
const expectedRule3=['3.2b(1)/1','3.2b(1)/2','3.2b(2)/1','3.2c(1)/1','3.2c(1)/2','3.2d(1)/1','3.2d(1)/2','3.2d(1)/3','3.2d(1)/4','3.2d(2)/1','3.2d(3)/1','3.2d(4)/1','3.3b/1','3.3b/2','3.3b/3','3.3b(2)/1','3.3b(2)/2','3.3b(3)/1','3.3b(4)/1'];
const rule3Ids=new Set((idx.clarifications||[]).filter(x=>Number(x.rule)===3).map(x=>x.id));
for(const id of expectedRule3)if(!rule3Ids.has(id))errors.push('source-verified Rule 3 Clarification missing: '+id);
const expectedRule5=['5.2b/1','5.2b/2','5.2b/3','5.2/1','5.3a/1','5.3a/2','5.3a/3','5.3a/4','5.3a/5','5.5a/1','5.5c/1','5.6a/1','5.6a/2','5.7a/1','5.7b/1','5.7b(1)/1','5.7c/1','5.7d(1)/1'];
const rule5Ids=new Set((idx.clarifications||[]).filter(x=>Number(x.rule)===5).map(x=>x.id));
for(const id of expectedRule5)if(!rule5Ids.has(id))errors.push('source-verified Rule 5 Clarification missing: '+id);
for(const id of rule5Ids)if(!expectedRule5.includes(id))errors.push('Rule 5 Clarification not in reviewed source heading inventory: '+id);
const expectedRule6=['6.1b(1)/1','6.2b(4)/1','6.3a/1','6.3c(1)/1','6.4b(1)/1','6.4c/1','6.5/1'];
const rule6Ids=new Set((idx.clarifications||[]).filter(x=>Number(x.rule)===6).map(x=>x.id));
for(const id of expectedRule6)if(!rule6Ids.has(id))errors.push('source-verified Rule 6 Clarification missing: '+id);
for(const id of rule6Ids)if(!expectedRule6.includes(id))errors.push('Rule 6 Clarification not in reviewed source heading inventory: '+id);
const expectedRule7=['7.1a/1','7.2/1','7.4/1','7.4/2','7.4/3'];
const rule7Ids=new Set((idx.clarifications||[]).filter(x=>Number(x.rule)===7).map(x=>x.id));
for(const id of expectedRule7)if(!rule7Ids.has(id))errors.push('source-verified Rule 7 Clarification missing: '+id);
for(const id of rule7Ids)if(!expectedRule7.includes(id))errors.push('Rule 7 Clarification not in reviewed source heading inventory: '+id);
if((idx.clarifications||[]).some(x=>!x.source?.includes('/clarifications/rule-')||!x.verifiedDate))errors.push('individual Clarification source provenance incomplete');

const firstLevel=idx.committeeProcedureItems||[];
const numbered=idx.committeeProcedureNumberedItems||[];
if(firstLevel.length!==53)errors.push('Committee Procedures first-level index not matched to 53 official headings: '+firstLevel.length);
if(numbered.length!==80)errors.push('Committee Procedures numbered subheading index not matched to 80 official headings: '+numbered.length);
for(const group of [firstLevel,numbered]){
  if(new Set(group.map(x=>x.id)).size!==group.length)errors.push('duplicate Committee Procedures heading ID');
  for(const x of group)if(!x.id||!x.title||!x.source||!x.source.includes('randa.org'))errors.push('Committee Procedures heading lacks official source: '+(x.id||'?'));
}
if(!idx.committeeProcedureAudit?.complete||[...firstLevel,...numbered].some(x=>!x.contentAudited))errors.push('Committee Procedures full-text/content review incomplete');
const mainHtml=fs.readFileSync('competition_rules.html','utf8');
const indexHtml=fs.readFileSync('competition_official_index.html','utf8');
for(const tab of ['definitions','committeeProcedureItems','committeeProcedureNumberedItems','clarificationGroups','clarifications','modelLocalRules','ruleSubrules']){
  if(!mainHtml.includes(tab)||!indexHtml.includes(tab))errors.push('official navigation tab not wired in both pages: '+tab);
}
if(!mainHtml.includes('data-rule="25"')||!mainHtml.includes('data-rule="1"'))errors.push('Rule-number navigation missing');
if(!mainHtml.includes('encodeURIComponent(x.id)')||!mainHtml.includes('&id=${encodeURIComponent(x.id)}'))errors.push('official index exact-ID deep link missing');
if(!indexHtml.includes('exactId')||!indexHtml.includes('x.id===exactId'))errors.push('official index exact-ID selection missing');
if(!indexHtml.includes('(x.url||x.source)'))errors.push('official source fallback link missing');
if(new Set((idx.definitions||[]).map(x=>x.officialTerm)).size!==74)errors.push('Definitions official English terms are missing or duplicated');
if((idx.definitions||[]).some(x=>!x.title||!x.officialTerm||!x.source?.includes('randa.org')))errors.push('Definitions lack bilingual names or official source');
if(!idx.officialDefinitionsVerified?.nameSetMatched)errors.push('Definitions name set not checked against current official list');
if(!idx.officialDefinitionsVerified?.complete)errors.push('Definitions full content review remains incomplete');
if(!idx.navigationAudit?.verifiedOnDevice||!idx.navigationAudit?.evidence?.length)errors.push('end-to-end search/category/Rule-number navigation has no recorded verification evidence');
console.log(JSON.stringify({ok:!errors.length,cases:rules.length,definitions:(idx.definitions||[]).length,mlr:(idx.modelLocalRules||[]).length,individualClarifications:(idx.clarifications||[]).length,committee:(idx.committeeProcedures||[]).length,committeeFirstLevel:firstLevel.length,committeeNumbered:numbered.length,clarificationGroups:(idx.clarificationGroups||[]).length,subruleGroups:(idx.officialRuleSubrules||[]).length,unlinkedSubrules:unlinkedSubrules.length,errors},null,2));
if(errors.length)process.exitCode=1;
