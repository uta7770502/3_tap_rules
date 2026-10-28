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
if(!Array.isArray(idx.clarifications)||!idx.clarifications.length)errors.push('individual Clarifications have not been indexed');
if(!Array.isArray(idx.committeeProcedureItems)||idx.committeeProcedureItems.length<=9)errors.push('Committee Procedures subsection-by-subsection checklist missing');
if(!idx.navigationAudit?.verifiedOnDevice)errors.push('search/category/Rule-number end-to-end navigation not verified on device');
console.log(JSON.stringify({ok:!errors.length,cases:rules.length,definitions:(idx.definitions||[]).length,mlr:(idx.modelLocalRules||[]).length,individualClarifications:(idx.clarifications||[]).length,committee:(idx.committeeProcedures||[]).length,clarificationGroups:(idx.clarificationGroups||[]).length,errors},null,2));
if(errors.length)process.exitCode=1;
