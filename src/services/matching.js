// ============================================================
// MATCHING ANNONCE <-> RECHERCHE
//
// Avant : toute annonce déclenchait un DM à toutes les alertes de la même
// catégorie, sans regarder le titre. D'où les DM "tu cherches ça" à tort.
//
// Maintenant : on extrait les mots-clés de la recherche et on vérifie qu'ils
// apparaissent dans le titre de l'annonce.
//   - 1 ou 2 mots-clés  -> tous doivent être présents
//   - 3 mots-clés ou +  -> au moins 2/3 doivent être présents
// Les accents, la casse, la ponctuation et les pluriels simples sont ignorés.
// Une recherche sans mot-clé utile (ex : "*" ou "tout") couvre toute la catégorie.
// ============================================================

const STOPWORDS = new Set([
  // mots courants FR
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'l', 'au', 'aux',
  'et', 'ou', 'en', 'a', 'pour', 'par', 'sur', 'avec', 'sans', 'dans',
  'je', 'cherche', 'recherche', 'veux', 'voudrais', 'besoin', 'svp', 'stp',
  'mon', 'ma', 'mes', 'ce', 'cet', 'cette', 'ces', 'tres', 'bon', 'bonne', 'etat',
  // mots courants EN
  'the', 'and', 'or', 'for', 'with', 'of',
  // tailles en lettres et mots génériques : trop vagues pour décider d'un match
  'taille', 'size', 'tg', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl',
  'tout', 'tous', 'nimporte', 'quoi',
]);

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Pluriels simples : "hoodies" -> "hoodie", "chapeaux" -> "chapeau"
function stem(word) {
  if (word.length > 3 && /[sx]$/.test(word)) return word.slice(0, -1);
  return word;
}

function extractKeywords(text) {
  const words = normalize(text).split(' ').filter(Boolean);
  const keywords = words.filter((w) => !STOPWORDS.has(w) && (w.length > 1 || /\d/.test(w))).map(stem);
  return [...new Set(keywords)];
}

function requiredMatches(keywordCount) {
  if (keywordCount <= 2) return keywordCount;
  return Math.ceil((keywordCount * 2) / 3);
}

/**
 * Indique si une annonce correspond à une recherche.
 * @param {{category: string, title: string}} listing
 * @param {{category: string, keywords?: string[], query?: string}} search
 */
function listingMatchesSearch(listing, search) {
  if (listing.category !== search.category) return false;

  const keywords = search.keywords || extractKeywords(search.query);
  if (!keywords.length) return true; // recherche "toute la catégorie"

  const titleWords = new Set(extractKeywords(listing.title));
  const hits = keywords.filter((k) => titleWords.has(k)).length;
  return hits >= requiredMatches(keywords.length);
}

module.exports = { extractKeywords, listingMatchesSearch, normalize };
