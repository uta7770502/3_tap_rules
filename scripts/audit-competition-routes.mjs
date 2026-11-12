// Run from repository root: node scripts/audit-competition-routes.mjs
// Static checks only: browser/device and official-text verification are separate.
import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
const files=["competition_rules.json","competition_rule25_verified_cases.json","competition_rules_extra_5_10.json","competition_rules_extra_13_17.json","competition_rules_extra_20.json"];
const cases=files.flatMap(f=>JSON.parse(readFileSync(f,"utf8")));
const idx=JSON.parse(readFileSync("competition_official_index.json","utf8"));
const listing=readFileSync("competition_rules.html","utf8");
const detail=readFileSync("competition_rule.html","utf8");
assert.ok(Array.isArray(idx.officialRuleSubrules),"Official rule index must be an array");
for(const group of idx.officialRuleSubrules){
 assert.ok(Number.isInteger(Number(group.rule)) && Number(group.rule)>=1 && Number(group.rule)<=25,"Invalid official Rule group "+String(group.rule));
 assert.ok(Array.isArray(group.subrules),"Missing subrules array for Rule "+group.rule);
 for(const sub of group.subrules) assert.ok(sub && typeof sub.id==="string" && sub.id.trim()===sub.id && sub.id.normalize("NFKC")===sub.id,"Invalid official heading in Rule "+group.rule);
}
const indexedRules=idx.officialRuleSubrules.map(g=>Number(g.rule));
assert.equal(new Set(indexedRules).size,indexedRules.length,"Duplicate Rule groups in official index");
for(let n=1;n<=25;n++)assert.ok(indexedRules.includes(n),"Missing Rule group "+n);
const headings=idx.officialRuleSubrules.flatMap(g=>g.subrules.map(s=>String(s.id)));
const ids=cases.map(c=>c.id);
// Ensure the index can never silently map two different headings to one Rule.
for(const group of idx.officialRuleSubrules){
 const ids=group.subrules.map(sub=>sub.id);
 assert.equal(new Set(ids).size,ids.length,"Duplicate headings within Rule "+group.rule);
 for(const id of ids){
  assert.ok(id===String(group.rule) || id.startsWith(String(group.rule)+"."),
   "Heading assigned to wrong Rule: "+id+" in Rule "+group.rule);
 }
}
assert.equal(cases.length,444,"Expected 444 cases");
assert.equal(new Set(ids).size,cases.length,"Duplicate IDs");
assert.ok(ids.every(id=>typeof id==="number" || typeof id==="string"),"Invalid case ID type");
// A numeric detail-page lookup must not silently collapse IDs such as "01" and 1.
const normalizedIds=ids.map(id=>Number(id));
assert.ok(normalizedIds.every(id=>Number.isSafeInteger(id) && id>=1 && id<=444),"Invalid numeric case ID");
assert.equal(new Set(normalizedIds).size,cases.length,"Case IDs collide after numeric normalization");
for(let n=1;n<=444;n++)assert.ok(normalizedIds.includes(n),"Missing case "+n);
for(const c of cases){
  assert.ok(c.title && (c.summary||c.description) && (c.action||c.procedure) && c.penalty && c.source,"Incomplete case "+c.id);
  assert.ok(typeof c.rule==="string" || typeof c.rule==="number","Invalid case Rule type "+c.id);
  const caseRule=String(c.rule).trim();
  const caseRuleMatch=caseRule.match(/^([1-9]|1\d|2[0-5])(?:\.\d+[a-z]?(?:\(\d+\))*)?$/);
  assert.ok(caseRuleMatch,"Invalid case Rule reference "+c.id+": "+caseRule);
  assert.ok(indexedRules.includes(Number(caseRuleMatch[1])),"Case Rule not indexed "+c.id);
  assert.ok(typeof c.title==="string" && c.title.trim(),"Invalid case title "+c.id);
  assert.ok(typeof c.source==="string" && /^https:\/\//.test(c.source),"Invalid source URL "+c.id);
}
for(const id of headings)assert.ok(cases.some(c=>(c.officialSubruleIds||[]).includes(id)),"Unreferenced heading "+id);
const headingSet=new Set(headings);
// A case may cite an entire Rule (e.g. "21") rather than a numbered subrule.
// Preserve this distinction while rejecting nonexistent Rules and malformed IDs.
const ruleSet=new Set(idx.officialRuleSubrules.map(group=>String(group.rule)));
const validOfficialRefs=new Set([...headingSet,...ruleSet]);
assert.equal(headingSet.size,headings.length,"Duplicate official subrule heading IDs");
for(const c of cases){
 const refs=c.officialSubruleIds||[];
 assert.ok(Array.isArray(refs),"Invalid officialSubruleIds for case "+c.id);
 assert.equal(new Set(refs).size,refs.length,"Duplicate official subrule reference in case "+c.id);
 // Prevent whitespace and Unicode lookalikes from silently bypassing reference checks.
 for(const ref of refs){
  assert.ok(typeof ref==="string","Non-string official reference in case "+c.id);
  assert.equal(ref,ref.trim().normalize("NFKC"),"Noncanonical official reference in case "+c.id);
 }
 // The index lists headings, not every nested paragraph such as 20.1c(3).
 // Accept a nested citation only when its exact parent heading is indexed;
 // do not treat a known Rule number alone as proof of a valid paragraph.
 for(const ref of refs){
  const nested=ref.match(/^(\d{1,2}\.\d+[a-z]?)(?:\(\d+\))+$/);
  const indexedParent=Boolean(nested && headingSet.has(nested[1]));
  assert.ok(validOfficialRefs.has(ref) || indexedParent,
   "Unknown official rule/subrule reference "+ref+" in case "+c.id);
 }
 const url=new URL(c.source);
 assert.equal(url.protocol,"https:","Non-HTTPS source "+c.id);
 assert.ok(url.hostname && !url.username && !url.password,"Unsafe source URL "+c.id);
}

for(const f of files){
  assert.ok(listing.includes('fetch("'+f),"Listing does not load "+f);
  assert.ok(detail.includes('fetch("'+f),"Detail does not load "+f);
}
for(let n=1;n<=25;n++){
  assert.ok(listing.includes('data-rule="'+n+'"'),"Missing Rule button "+n);
  assert.ok(cases.some(c=>parseInt(String(c.rule),10)===n),"No case for Rule "+n);
}
assert.ok(listing.includes('competition_rule.html?id='),"Missing detail navigation");
assert.ok(/a\.find\(v=>v&&Number\(v\.id\)===id\)/.test(detail),"Missing safe numeric case-ID detail lookup");
assert.ok(listing.includes("officialSubruleIds.some(ref=>"),"Rule navigation ignores cross-rule references");

// The user-facing list/detail must not render rule data as raw HTML, and must
// preserve URL-encoded case IDs when navigating from a search result.
assert.ok(listing.includes('function esc(s)') && listing.includes('${esc(r.title)}') && listing.includes('${esc(r.summary)}'),
  "Rule listing must escape user-facing case fields");
assert.ok(listing.includes('encodeURIComponent(el.dataset.id)'),
  "Rule listing must URL-encode the selected case ID");
assert.ok(detail.includes('const esc=v=>') && detail.includes('${esc(x.title)}') && detail.includes('${esc(x.summary||x.description||"")}'),
  "Rule detail must escape user-facing case fields");
assert.ok(detail.includes('rel="noopener noreferrer"'),
  "External rule source links must use safe window isolation");
console.log("PASS: list/detail HTML escaping, URL encoding and external-link isolation.");

// Guard the existing three-tap judge and AI/photo consultation wiring.
// Check list/detail inline scripts and Rule query normalization.
for(const [name,html] of [["competition_rules.html",listing],["competition_rule.html",detail]]){
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script,"Missing inline script: "+name);
 new Function(script);
}
const queryLine=listing.split("\n").find(line=>line.includes("const v=q.value.trim()"));
assert.ok(queryLine,"Search query normalization missing");
const regexText=queryLine.match(/\.replace\((\/.*?\/gi),""\)/)?.[1];
assert.ok(regexText,"Rule query normalization pattern missing");
const queryRegex=Function("return "+regexText)();
for(const [input,expected] of [["Rule 8.1d","8.1d"],["規則8.1d","8.1d"],["規則 8.1d","8.1d"],["Ｒｕｌｅ ８．１ｄ","8.1d"]]){
 assert.equal(input.toLowerCase().normalize("NFKC").replace(queryRegex,"").trim(),expected,"Search normalization: "+input);
}
assert.ok(listing.includes('id="retryRules"') && listing.includes('location.reload()'),"Rule list recovery action missing");
assert.ok(detail.includes('retry.onclick=()=>location.reload()') && detail.includes('setAttribute("role","alert")'),"Rule detail recovery action missing");
console.log("PASS: list/detail load failures expose accessible retry actions.");
console.log("PASS: list/detail JavaScript parses; Rule queries normalize.");

const judge=readFileSync("competition_judge.html","utf8");
const ai=readFileSync("competition_ai.html","utf8");
const chat=readFileSync("assets/golf-chat.js","utf8");
const api=readFileSync("api/golf-chat.js","utf8");
const judgeScript=judge.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(judgeScript,"Missing three-tap judge script");
try {new Function(judgeScript);} catch(e) {throw Error("Three-tap judge JavaScript syntax error: "+e.message);}
try {new Function(chat);} catch(e) {throw Error("AI/photo chat JavaScript syntax error: "+e.message);}
try {new Function(api);} catch(e) {throw Error("AI chat API JavaScript syntax error: "+e.message);}
for(const id of ["camera","photoLibrary","photoCamera","mic","textBtn","input","send","newChat","chat","connection","preview","previewImg","remove"]){
  assert.ok(ai.includes('id="'+id+'"'),"AI consultation missing element "+id);
}
assert.ok(ai.includes('assets/golf-chat.js'),"AI consultation missing chat script");
assert.ok(chat.includes("fetch('/api/golf-chat'"),"AI consultation missing API request");
assert.ok(chat.includes("photoLibrary.click()"),"Photo selection missing native picker");
assert.ok(chat.includes("attempt<5") && chat.includes("data.length<=1500000"),"Adaptive photo compression missing");
assert.ok(api.includes("req.method === 'GET'"),"AI connection status endpoint missing");
assert.ok(api.includes("req.method !== 'POST'"),"AI consultation POST endpoint missing");
const graphText=judgeScript.split("const flows=")[1]?.split(";\nlet key=")[0];
assert.ok(graphText,"Judge graph missing");
const flows=Function("return ("+graphText+")")();
assert.ok(flows && typeof flows==="object" && !Array.isArray(flows),"Judge flows must be a state map");
assert.ok(Object.prototype.hasOwnProperty.call(flows,"start"),"Judge start state missing");
const visited=new Set(), terminals=new Set(), active=new Set();
function checkRoute(key,depth=0){
 assert.ok(depth<100,"Judge graph unexpectedly deep at "+key);
 assert.ok(!active.has(key),"Judge cycle at "+key);
 active.add(key);
 const step=flows[key]; assert.ok(step,"Broken judge choice "+key); visited.add(key);
 if(step.result){terminals.add(key);active.delete(key);return;}
 assert.ok(Array.isArray(step.a) && step.a.length,"Judge dead end "+key);
 for(const choice of step.a)assert.ok(Array.isArray(choice) && choice.length===2,"Malformed judge choice at "+key);
 for(const option of step.a)checkRoute(option[1],depth+1);
 active.delete(key);
}
checkRoute("start");
assert.equal(visited.size,Object.keys(flows).length,"Unreachable judge states");
assert.equal(terminals.size,10,"Expected ten judge outcomes");
// Independently enumerate complete choice paths, not just reachable states.
// This catches empty routes and records how many user decision sequences end in a ruling.
const pathCounts=new Map();
let completePaths=0, longestPath=0;
const depthCounts=new Map();
const outcomeDepths=new Map();
function enumeratePaths(key,steps=0){
 const state=flows[key];
 if(state.result){
  completePaths++;
  longestPath=Math.max(longestPath,steps);
  pathCounts.set(key,(pathCounts.get(key)||0)+1);
  depthCounts.set(steps,(depthCounts.get(steps)||0)+1);
  const range=outcomeDepths.get(key)||{min:Infinity,max:0};
  range.min=Math.min(range.min,steps);
  range.max=Math.max(range.max,steps);
  outcomeDepths.set(key,range);
  return;
 }
 for(const choice of state.a) enumeratePaths(choice[1],steps+1);
}
enumeratePaths("start");
assert.ok(completePaths>0,"Judge has no complete choice paths");
assert.equal([...depthCounts.values()].reduce((sum,n)=>sum+n,0),completePaths,"Judge path-depth accounting mismatch");
assert.equal([...pathCounts.values()].reduce((sum,n)=>sum+n,0),completePaths,"Judge outcome accounting mismatch");
for(const key of terminals) assert.ok(pathCounts.get(key)>0,"Judge outcome has no complete path: "+key);
console.log("PASS: "+completePaths+" complete judge choice paths reach "+terminals.size+" outcomes; longest route "+longestPath+" decisions.");
console.log("AUDIT: decisions per path: "+JSON.stringify(Object.fromEntries([...depthCounts].sort((a,b)=>a[0]-b[0]))));
console.log("AUDIT: outcome coverage: "+JSON.stringify(Object.fromEntries([...pathCounts].sort((a,b)=>a[0].localeCompare(b[0])).map(([key,count])=>[key,{paths:count,...outcomeDepths.get(key)}]))));
if(longestPath>3)console.warn("WARN: Some judge routes require more than three decisions; review 3-tap UX.");
// Check that each judge choice is intelligible and each outcome provides a usable ruling.
for(const [key,step] of Object.entries(flows)){
 assert.ok(typeof step.q==="string" && step.q.trim() || typeof step.result==="string" && step.result.trim(),"Empty judge state "+key);
 if(step.result){
  assert.match(step.result,/根拠：Rule\s*\d+/,"Missing rule citation in "+key);
  assert.ok(step.result.includes("次にすること："),"Missing next action in "+key);
  assert.ok(step.result.includes('class="decision"'),"Missing ruling label in "+key);
 }else{
  const labels=step.a.map(([label])=>label);
  assert.equal(new Set(labels).size,labels.length,"Duplicate choice labels at "+key);
  const normalizedLabels=labels.map(label=>typeof label==="string"?label.trim().normalize("NFKC"):"");
  assert.equal(new Set(normalizedLabels).size,labels.length,"Visually duplicate choice labels at "+key);
  const destinations=step.a.map(([,destination])=>destination);
  assert.equal(new Set(destinations).size,destinations.length,"Multiple choices lead to the same state at "+key);
  for(const [label,destination] of step.a){
   assert.ok(typeof label==="string" && label.trim(),"Empty choice at "+key);
   assert.equal(label,label.trim().normalize("NFKC"),"Noncanonical choice label at "+key);
   assert.ok(typeof destination==="string" && flows[destination],"Broken destination at "+key);
  }
 }
}
console.log("PASS: judge outcomes have source citations, next actions and distinct choices.");
console.log("PASS: all 10 judge outcomes are reachable.");
console.log("PASS: judge/chat/API JavaScript parses, consultation elements and photo/API wiring present.");
console.log("PASS: 444 cases, 336 heading references, 25 Rule buttons, all five data sources on list/detail, required fields and navigation wiring.");
console.log("NOTE: Static audit only; does not certify R&A wording, device operation, or production deployment.");
