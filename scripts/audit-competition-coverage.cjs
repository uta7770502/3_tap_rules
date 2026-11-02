#!/usr/bin/env node
// Structural audit only: passing does NOT certify official ruling accuracy or UI operation.
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const cases=read("competition_rules.json");
const index=read("competition_official_index.json");
const groups=index.officialRuleSubrules||[];
const subrules=groups.flatMap(g=>(g.subrules||[]).map(s=>({...s,parentRule:g.rule})));
const norm=v=>String(v??"").toLowerCase().replace(/[^0-9a-z]/g,"");
const ruleOf=v=>String(v??"").match(/^(?:rule\s*)?(\d{1,2})(?:[.-]|$)/i)?.[1];
const mapped=subrules.map(s=>{
  const id=norm(s.id);
  const hits=cases.filter(c=>norm(c.rule)===id || (Array.isArray(c.officialSubruleIds)&&c.officialSubruleIds.some(v=>norm(v)===id)));
  return {id:s.id,title:s.title,parentRule:s.parentRule,caseIds:hits.map(c=>c.id)};
});
const missing=mapped.filter(x=>!x.caseIds.length);
const duplicates=(items,label)=>{const seen=new Set(),dups=[];for(const x of items){const k=String(x.id);if(seen.has(k))dups.push(label+":"+k);seen.add(k)}return dups};
const errors=[
  ...duplicates(cases,"case"),
  ...duplicates(subrules,"subrule"),
  ...groups.filter(g=>!(Number(g.rule)>=1&&Number(g.rule)<=25)).map(g=>"invalid Rule:"+g.rule),
  ...cases.filter(c=>!ruleOf(c.rule)&&!/^(?:MLR|Clarification|Committee)/i.test(String(c.rule))).map(c=>"unrecognized case rule:"+c.id)
];
const report={
  auditType:"structural-only",
  disclaimer:"Heading presence and exact subrule-to-case references are NOT substantive Rules verification. UI end-to-end checks must run separately.",
  counts:{cases:cases.length,ruleGroups:groups.length,subrules:subrules.length,definitions:(index.definitions||[]).length,clarifications:(index.clarifications||[]).length,definitionClarifications:(index.definitionClarifications||[]).length,modelLocalRules:(index.modelLocalRules||[]).length,committeeProcedureItems:(index.committeeProcedureItems||[]).length},
  mapping:{method:"exact case.rule or explicit officialSubruleIds only",mapped:mapped.length-missing.length,unmapped:missing.length,unmappedItems:missing},
  errors,
  gates:{structure:errors.length===0&&groups.length===25,subruleCaseMapping:missing.length===0,officialTextVerified:false,uiEndToEndVerified:false,complete:false}
};
const output=process.argv.includes("--json")?JSON.stringify(report,null,2):[
  "Competition rules structural audit",
  JSON.stringify(report.counts),
  "Mapped subrules: "+report.mapping.mapped+"/"+mapped.length,
  "Unmapped: "+missing.map(x=>x.id).join(", "),
  "Structural errors: "+errors.join(", "),
  "Complete: NO (official text and end-to-end UI unverified)"
].join("\n");
console.log(output);
if(errors.length||missing.length)process.exitCode=1;
