const fs=require('fs');
const rules=JSON.parse(fs.readFileSync('competition_rules.json','utf8'));
const idx=JSON.parse(fs.readFileSync('competition_official_index.json','utf8'));
const errors=[];
const ids=rules.map(x=>String(x.id));
if(new Set(ids).size!==ids.length) errors.push('duplicate competition rule IDs');
for(const r of rules){if(!r.id||!r.rule||!r.title||!(r.description||r.summary)||!(r.procedure||r.action)||!r.penalty)errors.push('missing required field: '+(r.id||'?'));}
for(let n=1;n<=25;n++){if(!rules.some(x=>parseInt(String(x.rule),10)===n))errors.push('Rule '+n+' has no case');}
if((idx.definitions||[]).length<74)errors.push('definitions index incomplete: '+(idx.definitions||[]).length);
if((idx.modelLocalRules||[]).length<90)errors.push('MLR index incomplete: '+(idx.modelLocalRules||[]).length);
if((idx.committeeProcedures||[]).length!==9)errors.push('committee procedures sections incomplete: '+(idx.committeeProcedures||[]).length);
if((idx.clarificationGroups||[]).length!==24)errors.push('clarification groups incomplete: '+(idx.clarificationGroups||[]).length);
console.log(JSON.stringify({ok:!errors.length,cases:rules.length,definitions:(idx.definitions||[]).length,mlr:(idx.modelLocalRules||[]).length,committee:(idx.committeeProcedures||[]).length,clarificationGroups:(idx.clarificationGroups||[]).length,errors},null,2));
if(errors.length)process.exitCode=1;
