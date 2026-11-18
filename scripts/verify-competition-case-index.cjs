#!/usr/bin/env node
// Static case inventory and ID-based search reachability check.
// Run from repository root: node scripts/verify-competition-case-index.cjs
const fs = require('node:fs');
const files = [
  'competition_rules.json',
  'competition_rule25_verified_cases.json',
  'competition_rules_extra_5_10.json',
  'competition_rules_extra_13_17.json',
  'competition_rules_extra_20.json'
];
const errors = [];
const cases = [];
for (const file of files) {
  try {
    const records = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(records)) throw new Error('expected array');
    cases.push(...records);
    console.log(file + ': ' + records.length);
  } catch (error) { errors.push(file + ': ' + error.message); }
}
const seen = new Set();
for (const item of cases) {
  const id = Number(item && item.id);
  if (!Number.isSafeInteger(id) || id < 1 || String(item.id) !== String(id)) {
    errors.push('invalid ID: ' + JSON.stringify(item && item.id)); continue;
  }
  if (seen.has(id)) errors.push('duplicate ID: ' + id);
  seen.add(id);
  if (!item.title || !(item.summary || item.description) || !(item.action || item.procedure))
    errors.push('missing required content: ' + id);
  // The list search normalizes each record and includes ID in textOf().
  const normalized = {
    ...item,
    summary: item.summary || item.description || '',
    action: item.action || item.procedure || '',
    cat: item.cat || item.category || '',
    keys: Array.isArray(item.keys) ? item.keys : String(item.keywords || '').split(/[\\s、,]+/).filter(Boolean)
  };
  const searchText = [normalized.id, normalized.title, normalized.summary, normalized.action,
    normalized.penalty, normalized.cat, normalized.rule,
    ...(Array.isArray(normalized.officialSubruleIds) ? normalized.officialSubruleIds : []),
    ...normalized.keys].join(' ').toLowerCase().normalize('NFKC');
  if (!searchText.includes(String(id))) errors.push('not ID-searchable: ' + id);
}
if (cases.length !== 444) errors.push('expected 444 cases, got ' + cases.length);
for (let id = 1; id <= 444; id++) if (!seen.has(id)) errors.push('missing ID: ' + id);
const listHtml = fs.readFileSync('competition_rules.html', 'utf8');
const detailHtml = fs.readFileSync('competition_rule.html', 'utf8');
if (!listHtml.includes('r.id,r.title')) errors.push('list search no longer includes ID');
if (!listHtml.includes('competition_rule.html?id=') || !detailHtml.includes('URLSearchParams'))
  errors.push('list-to-detail link contract missing');
console.log('Cases: ' + cases.length + '; unique IDs: ' + seen.size);
if (errors.length) { console.error(errors.join('\\n')); process.exitCode = 1; }
else console.log('PASS: static inventory, required content, ID search and link contract');
