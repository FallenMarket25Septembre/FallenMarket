const test = require('node:test');
const assert = require('node:assert');
const { extractKeywords, listingMatchesSearch } = require('../src/services/matching');

const search = (category, query) => ({ category, query, keywords: extractKeywords(query) });
const listing = (category, title) => ({ category, title });

test('extrait les mots-clés sans accents, mots vides ni tailles', () => {
  assert.deepStrictEqual(extractKeywords('Je cherche un Hoodie NOIR, taille M ou L'), ['hoodie', 'noir']);
  assert.deepStrictEqual(extractKeywords('Vestes à capuche'), ['veste', 'capuche']);
  assert.deepStrictEqual(extractKeywords('*'), []);
});

test("le bug d'origine : même catégorie mais article différent -> pas de DM", () => {
  assert.strictEqual(listingMatchesSearch(listing('hauts', 'T-shirt blanc Zara'), search('hauts', 'Hoodie noir taille M')), false);
  assert.strictEqual(listingMatchesSearch(listing('hauts', 'Hoodie gris'), search('hauts', 'Hoodie noir')), false);
});

test('match réel : mots présents, ordre/accents/pluriel/casse ignorés', () => {
  assert.strictEqual(listingMatchesSearch(listing('hauts', 'HOODIE Nike noir - M'), search('hauts', 'hoodie noir')), true);
  assert.strictEqual(listingMatchesSearch(listing('chaussures', 'Air Force 1 blanches 42'), search('chaussures', 'air force blanche')), true);
  assert.strictEqual(listingMatchesSearch(listing('vestes', 'Veste en jean délavée'), search('vestes', 'vestes jean')), true);
});

test('3 mots-clés ou plus : 2/3 suffisent', () => {
  assert.strictEqual(listingMatchesSearch(listing('hauts', 'Hoodie Nike noir'), search('hauts', 'hoodie nike noir oversize')), true);
  assert.strictEqual(listingMatchesSearch(listing('hauts', 'Hoodie Adidas gris'), search('hauts', 'hoodie nike noir oversize')), false);
});

test('autre catégorie -> jamais de match', () => {
  assert.strictEqual(listingMatchesSearch(listing('bas', 'Hoodie noir'), search('hauts', 'hoodie noir')), false);
});

test('recherche "*" -> toute la catégorie', () => {
  assert.strictEqual(listingMatchesSearch(listing('hauts', 'Peu importe'), search('hauts', '*')), true);
});

test('anciennes recherches sans keywords stockés', () => {
  assert.strictEqual(listingMatchesSearch(listing('hauts', 'Hoodie noir'), { category: 'hauts', query: 'hoodie noir' }), true);
});
