#!/usr/bin/env node
// Structural audit only: passing does NOT certify official ruling accuracy or UI operation.
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const cases=read("competition_rules.json");
const index=read("competition_official_index.json");
const groups=index.officialRuleSubrules||[];
const reviewed=read("competition_reviewed_subrule_links.json").links;
const reviewed2=read("competition_reviewed_subrule_links_batch2.json").links;
const reviewed3=read("competition_reviewed_subrule_links_batch3.json").links;
const reviewed4=read("competition_reviewed_subrule_links_batch4.json").links;
const subrules=groups.flatMap(g=>(g.subrules||[]).map(s=>({...s,parentRule:g.rule})));
const norm=v=>String(v??"").toLowerCase().replace(/[^0-9a-z]/g,"");
const ruleOf=v=>String(v??"").match(/^(?:rule\s*)?(\d{1,2})(?:[.-]|$)/i)?.[1];
const mapped=subrules.map(s=>{
  const id=norm(s.id);
  const hits=cases.filter(c=>norm(c.rule)===id || (Array.isArray(c.officialSubruleIds)&&c.officialSubruleIds.some(v=>norm(v)===id)) || (reviewed[s.id]||[]).includes(c.id) || (reviewed2[s.id]||[]).includes(c.id) || (reviewed3[s.id]||[]).includes(c.id) || (reviewed4[s.id]||[]).includes(c.id));
  return {id:s.id,title:s.title,parentRule:s.parentRule,caseIds:hits.map(c=>c.id)};
});
const missing=mapped.filter(x=>!x.caseIds.length);
// Separate structural parent headings from unmapped leaf headings.
// A parent can be navigated via its children, but is NOT counted as case-verified.
const unmappedParents=missing.filter(x=>mapped.some(y=>y.id!==x.id&&y.id.startsWith(x.id)));
const unmappedLeaves=missing.filter(x=>!unmappedParents.includes(x));
const byRuleTriage=groups.map(g=>{
  const n=Number(g.rule),parents=unmappedParents.filter(x=>Number(x.parentRule)===n),leaves=unmappedLeaves.filter(x=>Number(x.parentRule)===n);
  return {rule:n,unmappedParents:parents.map(x=>x.id),unmappedLeaves:leaves.map(x=>x.id)};
});
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
// Static navigation checks do not replace browser end-to-end tests.
const listHtml=fs.readFileSync(path.join(root,"competition_rules.html"),"utf8");
const indexHtml=fs.readFileSync(path.join(root,"competition_official_index.html"),"utf8");
const detailHtml=fs.readFileSync(path.join(root,"competition_rule.html"),"utf8");
const navigationChecks={
  caseSearch:listHtml.includes('id="q"')&&listHtml.includes("function draw()"),
  categoryButtons:listHtml.includes("data-filter=")&&listHtml.includes('querySelectorAll("[data-filter]")'),
  ruleNumberButtons:listHtml.includes("data-rule=")&&listHtml.includes('querySelectorAll("[data-rule]")'),
  officialIndexLink:listHtml.includes("competition_official_index.html?tab="),
  officialIndexTabs:indexHtml.includes('data-k="ruleSubrules"')&&indexHtml.includes('data-k="definitions"'),
  officialDeepLinks:indexHtml.includes('p.get("id")')&&indexHtml.includes("exactId?x.id===exactId"),
  caseDetailNavigation:detailHtml.includes('new URLSearchParams(location.search).get("id")')
};
report.navigation={method:"static source inspection only",checks:navigationChecks,allPresent:Object.values(navigationChecks).every(Boolean),browserVerified:false};
report.gates.navigationStatic=report.navigation.allPresent;
if(!report.navigation.allPresent)report.errors.push("missing navigation source hooks: "+Object.entries(navigationChecks).filter(([k,v])=>!v).map(([k])=>k).join(", "));
const indexTabs=["definitions","committeeProcedures","committeeProcedureItems","committeeProcedureNumberedItems","clarificationGroups","clarifications","definitionClarifications","modelLocalRules"];
const indexEntries=indexTabs.flatMap(tab=>(index[tab]||[]).map(item=>({tab,id:String(item.id??""),title:item.title})))
  .concat(subrules.map(item=>({tab:"ruleSubrules",id:String(item.id??""),title:item.title})));
const duplicateIndexLinks=[];
const seenIndexLinks=new Set();
for(const item of indexEntries){
  const key=item.tab+":"+item.id;
  if(!item.id||seenIndexLinks.has(key))duplicateIndexLinks.push(key);
  seenIndexLinks.add(key);
}
const unsupportedIndexTabs=indexTabs.filter(tab=>!indexHtml.includes('data-k="'+tab+'"'));
const missingRuleButtons=groups.map(g=>Number(g.rule)).filter(n=>!listHtml.includes('data-rule="'+n+'"'));
const unlinkedCaseIds=mapped.flatMap(x=>x.caseIds).filter(id=>!cases.some(c=>c.id===id));
report.navigation.indexAudit={
  indexedItems:indexEntries.length,
  uniqueDeepLinkKeys:seenIndexLinks.size,
  duplicateOrMissingKeys:duplicateIndexLinks,
  unsupportedTabs:unsupportedIndexTabs,
  missingRuleButtons,
  orphanCaseReferences:unlinkedCaseIds,
  indexDeepLinkTemplatePresent:indexHtml.includes('p.get("tab")')&&indexHtml.includes('p.get("id")')
};
report.gates.indexStructural=duplicateIndexLinks.length===0&&unsupportedIndexTabs.length===0&&missingRuleButtons.length===0&&unlinkedCaseIds.length===0&&report.navigation.indexAudit.indexDeepLinkTemplatePresent;
if(!report.gates.indexStructural)report.errors.push("official index deep-link structural audit failed");
const stored=read("competition_coverage_audit.json");
const stale=stored.counts?.cases!==cases.length ||
  stored.counts?.officialSubrules!==subrules.length ||
  stored.counts?.linked!==report.mapping.mapped ||
  stored.counts?.needsReview!==report.mapping.unmapped ||
  JSON.stringify((stored.rows||[]).map(x=>[x.id,x.caseIds]))!==JSON.stringify(mapped.map(x=>[x.id,x.caseIds]));
report.gates.auditReportFresh=!stale;
if(stale)report.errors.push("stale competition_coverage_audit.json: regenerate after editing cases or index");
report.mapping.unmappedParentHeadings=unmappedParents.length;
report.mapping.unmappedLeafHeadings=unmappedLeaves.length;
report.mapping.byRuleTriage=byRuleTriage;
const output=process.argv.includes("--json")?JSON.stringify(report,null,2):[
  "Competition rules structural audit",
  JSON.stringify(report.counts),
  "Mapped subrules: "+report.mapping.mapped+"/"+mapped.length,
  "Unmapped: "+missing.map(x=>x.id).join(", "),
  "Structural errors: "+errors.join(", "),
  "Complete: NO (official text and end-to-end UI unverified)"
].join("\n");
console.log(output);
if(report.errors.length||missing.length)process.exitCode=1;
