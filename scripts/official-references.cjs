// Typed reference validation against the maintained official index; no ruling certification.
'use strict';
const numbered=/^([1-9]|1\d|2[0-5])(?:\.\d+[a-z]?(?:\([a-z0-9]+\))*)?$/;
function validator(index){
 const headings=new Set(index.officialRuleSubrules.flatMap(g=>[String(g.rule),...g.subrules.map(s=>s.id)]));
 const clarifications=new Set([...index.clarifications,...index.definitionClarifications].map(x=>x.id));
 const definitions=new Set(index.definitions.map(x=>x.title));
 const mlrs=new Set(index.modelLocalRules.map(x=>x.id));
 const committee=new Set([...index.committeeProcedures,...index.committeeProcedureItems,...index.committeeProcedureNumberedItems].map(x=>x.id));
 function numberedRef(ref){if(typeof ref!=='string'||ref!==ref.trim().normalize('NFKC')||!numbered.test(ref))return false;return headings.has(ref)||Boolean(ref.match(/^(\d{1,2}\.\d+[a-z]?)(?:\([a-z0-9]+\))+$/)?.[1]&&headings.has(ref.split('(')[0]));}
 function classify(ref){
  if(typeof ref!=='string'||ref!==ref.trim())return null;
  if(numberedRef(ref))return 'rule';
  if(clarifications.has(ref))return 'clarification';
  if(ref==='定義'||ref.startsWith('定義：')&&definitions.has(ref.slice(3)))return 'definition';
  if(/^MLR /.test(ref)){
   const codes=ref.slice(4).split('/');
   if(codes.length&&codes.every(code=>mlrs.has(code)||/^A-4\.[12]$/.test(code)&&mlrs.has('A-4')))return 'mlr';
  }
  const cp=ref.match(/^(?:委員会|Committee Procedure )([1-9](?:[A-Z](?:\(\d+\))?)?)$/);
  if(cp&&committee.has('CP'+cp[1]))return 'committee';
  if(ref.startsWith('Clarification ')&&clarifications.has(ref.slice(14)))return 'clarification';
  return null;
 }
 function validateCase(c){
  const parts=String(c.rule).split(' / ');
  const types=parts.map(classify),errors=[];
  // 規則資料 is explanatory text attached only to Rule 4.3, not an invented citation.
  parts.forEach((part,i)=>{if(!types[i]&&!(part==='規則資料'&&parts[0]==='4.3'))errors.push('unknown citation '+part);});
  const refs=c.officialSubruleIds??[];
  if(!Array.isArray(refs))return [...errors,'officialSubruleIds must be an array'];
  if(new Set(refs).size!==refs.length)errors.push('duplicate references');
  for(const ref of refs)if(!numberedRef(ref)&&!clarifications.has(ref))errors.push('unknown indexed reference '+ref);
  for(let i=0;i<parts.length;i++){
   const ref=parts[i].replace(/^Clarification /,'');
   if((types[i]==='rule'||types[i]==='clarification')&&!refs.some(r=>typeof r==='string'&&(r===ref||types[i]==='rule'&&(r.startsWith(ref+'.')||r.startsWith(ref+'(')||/\d$/.test(ref)&&r.startsWith(ref)&&/^[a-z]/.test(r.slice(ref.length))))))errors.push('missing explicit reference '+ref);
  }
  const primary=types[0];
  if(primary==='mlr'&&refs.length)errors.push('MLR must not masquerade as numbered Rule references');
  const source=String(c.source);
  if(primary==='mlr'&&source!=='https://www.randa.org/en/rog/committee-procedures/8/model-local-rules')errors.push('invalid MLR source');
  if(primary==='committee'&&source!=='https://www.randa.org/en/rog/committee-procedures')errors.push('invalid committee source');
  if(primary==='definition'&&!types.includes('rule')&&source!=='https://www.randa.org/en/rog/the-rules-of-golf/definitions')errors.push('invalid definition source');
  return errors;
 }
 return {classify,numberedRef,validateCase};
}
module.exports={validator,numbered};

