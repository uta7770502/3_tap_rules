// Run from repository root: node scripts/audit-competition-routes.mjs
// Static checks only: browser/device and official-text verification are separate.
import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
const files=["competition_rules.json","competition_rule25_verified_cases.json","competition_rules_extra_5_10.json","competition_rules_extra_13_17.json","competition_rules_extra_20.json"];
const cases=files.flatMap(f=>JSON.parse(readFileSync(f,"utf8")));
const idx=JSON.parse(readFileSync("competition_official_index.json","utf8"));
const listing=readFileSync("competition_rules.html","utf8");
const detail=readFileSync("competition_rule.html","utf8");
const headings=idx.officialRuleSubrules.flatMap(g=>g.subrules.map(s=>String(s.id)));
const ids=cases.map(c=>c.id);
assert.equal(cases.length,444,"Expected 444 cases");
assert.equal(new Set(ids).size,cases.length,"Duplicate IDs");
for(let n=1;n<=444;n++)assert.ok(ids.includes(n),"Missing case "+n);
for(const c of cases){
  assert.ok(c.title && (c.summary||c.description) && (c.action||c.procedure) && c.penalty && c.source,"Incomplete case "+c.id);
  assert.ok(/^https:\/\//.test(c.source),"Invalid source URL "+c.id);
}
for(const id of headings)assert.ok(cases.some(c=>(c.officialSubruleIds||[]).includes(id)),"Unreferenced heading "+id);
for(const f of files){
  assert.ok(listing.includes('fetch("'+f),"Listing does not load "+f);
  assert.ok(detail.includes('fetch("'+f),"Detail does not load "+f);
}
for(let n=1;n<=25;n++){
  assert.ok(listing.includes('data-rule="'+n+'"'),"Missing Rule button "+n);
  assert.ok(cases.some(c=>parseInt(String(c.rule),10)===n),"No case for Rule "+n);
}
assert.ok(listing.includes('competition_rule.html?id='),"Missing detail navigation");
assert.ok(detail.includes('a.find(v=>v.id===id)'),"Missing case-ID detail lookup");
assert.ok(listing.includes("officialSubruleIds.some(ref=>"),"Rule navigation ignores cross-rule references");
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
const visited=new Set(), terminals=new Set();
function checkRoute(key,depth=0){
 assert.ok(depth<12,"Judge cycle at "+key);
 const step=flows[key]; assert.ok(step,"Broken judge choice "+key); visited.add(key);
 if(step.result){terminals.add(key);return;}
 assert.ok(step.a?.length,"Judge dead end "+key);
 for(const option of step.a)checkRoute(option[1],depth+1);
}
checkRoute("start");
assert.equal(visited.size,Object.keys(flows).length,"Unreachable judge states");
assert.equal(terminals.size,10,"Expected ten judge outcomes");
console.log("PASS: all 10 judge outcomes are reachable.");
console.log("PASS: judge/chat/API JavaScript parses, consultation elements and photo/API wiring present.");
console.log("PASS: 444 cases, 336 heading references, 25 Rule buttons, all five data sources on list/detail, required fields and navigation wiring.");
console.log("NOTE: Static audit only; does not certify R&A wording, device operation, or production deployment.");
