const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const scenes = require('../assets/scene-guides.js');
test('all 51 planned assets are implemented; final nine are intact and mapped', () => {
  const plan = require('../assets/dedicated-guides/remaining-plan-20261015.json');
  assert.equal(plan.newAssets.length, 51);
  assert.equal(plan.progress.remainingNewAssets, 0);
  assert.ok(plan.newAssets.every(x => x.status === 'implemented'));
  for (const name of ['final-precise-batch', 'replacement-batch']) {
    const manifest = require('../assets/dedicated-guides/' + name + '-20261017.json');
    for (const r of manifest.records) {
      const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, r.src))).digest('hex');
      assert.equal(hash, r.sha256);
      for (const [mode, ids] of Object.entries(r.targets)) {
        for (const id of ids) assert.equal(scenes.select({id}, mode).src, r.src);
      }
    }
  }
  for (const key of ['snake-in-pa', 'drop-instead-place']) {
    assert.equal(plan.newAssets.find(x => x.key === key).originalRecoveryStatus, 'unresolved');
  }
  assert.match(scenes.select({id:246}, 'competition').caption, /誤った方法/);
});
