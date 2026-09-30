const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
test('iroha images match their topic and exist on disk', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root,'basic_rule_detail.html'),'utf8');
  const code = html.slice(html.indexOf('const IROHA_VISUALS='), html.indexOf('document.addEventListener("DOMContentLoaded"'));
  const context = vm.createContext({}); vm.runInContext(code, context);
  const rules = JSON.parse(fs.readFileSync(path.join(root,'basic_rules.json'),'utf8'));
  for (const rule of rules) {
    const visual = context.visualFor(rule);
    if (visual) { assert.ok(fs.existsSync(path.join(root,visual.src)), visual.src); assert.ok(visual.caption); }
  }
  for (const id of [20,21,23,40,43,60,61,62,63,64,65,66,80,81,82,83,84]) assert.ok(context.visualFor(rules.find(r=>r.id===id)));
  assert.match(context.visualFor(rules.find(r=>r.id===65)).src,/red-hd/);
  assert.match(context.visualFor(rules.find(r=>r.id===83)).caption,/仕上げ/);
  assert.match(context.visualFor(rules.find(r=>r.id===84)).caption,/コースの案内/);
  assert.match(context.visualFor(rules.find(r=>r.id===21)).src,/dress-v1/);
  assert.match(context.visualFor(rules.find(r=>r.id===43)).src,/warmup-v1/);
  assert.match(context.visualFor(rules.find(r=>r.id===80)).src,/safety-wait/);
  assert.equal(context.visualFor({id:999,title:'スコアの数え方',detail:'OBやバンカーについて'}),null);
});
