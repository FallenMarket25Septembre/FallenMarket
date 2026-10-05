const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fm-'));
process.env.DATA_DIR = dir;

// Ancien format (v1), comme le db.json actuellement en prod
fs.writeFileSync(
  path.join(dir, 'db.json'),
  JSON.stringify({
    listings: [{ id: 'l1', userId: 'u1', username: 'a#1', category: 'hauts', title: 'Hoodie noir', price: '20€', link: '', createdAt: 1 }],
    searches: [{ id: 's1', userId: 'u2', username: 'b#1', category: 'hauts', query: 'hoodie noir', active: true, createdAt: 2 }],
  })
);
const store = require('../src/data/store');

test('migre un db.json v1 sans rien perdre', () => {
  store.init();
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'db.json'), 'utf8'));
  assert.strictEqual(saved.version, 2);
  assert.strictEqual(saved.listings.length, 1);
  assert.deepStrictEqual(saved.searches[0].keywords, ['hoodie', 'noir']);
});

test('import en fusion : dédoublonne par id et fait une sauvegarde', () => {
  const incoming = JSON.stringify({
    listings: [{ id: 'l1', userId: 'u1', title: 'doublon' }, { id: 'l2', userId: 'u3', title: 'Jean', category: 'bas' }],
    searches: [],
  });
  const totals = store.importJson(incoming, 'merge');
  assert.deepStrictEqual(totals, { listings: 2, searches: 1 });
  assert.strictEqual(store.getListingById('l1').title, 'Hoodie noir');
  assert.ok(fs.readdirSync(path.join(dir, 'backups')).length >= 1);
});

test('import refuse un fichier invalide', () => {
  assert.throws(() => store.importJson('{"foo": 1}'));
  assert.throws(() => store.importJson('pas du json'));
});

test('suppression', () => {
  assert.strictEqual(store.removeListing('l2'), true);
  assert.strictEqual(store.removeListing('l2'), false);
});
