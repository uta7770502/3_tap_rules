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
if(!Array.isArray(idx.officialMlrIds)||idx.officialMlrIds.length<91)errors.push('official MLR code-by-code source checklist missing; count alone cannot certify completeness');
else for(const id of idx.officialMlrIds){if(!mlr.some(x=>x.id===id))errors.push('missing official MLR: '+id);}
if((idx.committeeProcedures||[]).length!==9)errors.push('committee procedures sections incomplete: '+(idx.committeeProcedures||[]).length);
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
for(const tab of ['definitions','committeeProcedureItems','committeeProcedureNumberedItems','clarificationGroups','modelLocalRules','ruleSubrules']){
  if(!mainHtml.includes(tab)||!indexHtml.includes(tab))errors.push('official navigation tab not wired in both pages: '+tab);
}
if(!mainHtml.includes('data-rule="25"')||!mainHtml.includes('data-rule="1"'))errors.push('Rule-number navigation missing');
if(new Set((idx.definitions||[]).map(x=>x.officialTerm)).size!==74)errors.push('Definitions official English terms are missing or duplicated');
if((idx.definitions||[]).some(x=>!x.title||!x.officialTerm||!x.source?.includes('randa.org')))errors.push('Definitions lack bilingual names or official source');
if(!idx.officialDefinitionsVerified?.nameSetMatched)errors.push('Definitions name set not checked against current official list');
if(!idx.officialDefinitionsVerified?.complete)errors.push('Definitions full content review remains incomplete');
if(!idx.navigationAudit?.verifiedOnDevice||!idx.navigationAudit?.evidence?.length)errors.push('end-to-end search/category/Rule-number navigation has no recorded verification evidence');
console.log(JSON.stringify({ok:!errors.length,cases:rules.length,definitions:(idx.definitions||[]).length,mlr:(idx.modelLocalRules||[]).length,individualClarifications:(idx.clarifications||[]).length,committee:(idx.committeeProcedures||[]).length,committeeFirstLevel:firstLevel.length,committeeNumbered:numbered.length,clarificationGroups:(idx.clarificationGroups||[]).length,subruleGroups:(idx.officialRuleSubrules||[]).length,unlinkedSubrules:unlinkedSubrules.length,errors},null,2));
if(errors.length)process.exitCode=1;
