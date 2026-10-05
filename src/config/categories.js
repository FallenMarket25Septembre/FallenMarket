// ============================================================
// CATÉGORIES DU CATALOGUE
// Modifie cette liste pour ajouter / retirer / renommer des catégories.
// - value : identifiant interne stocké en base. Ne le change pas pour une
//           catégorie qui a déjà des annonces, sinon elles deviennent orphelines.
// - label : texte affiché dans les menus et les commandes
// - emoji : emoji affiché à côté du label
// Discord limite les menus et les choix de slash command à 25 entrées.
// ============================================================

const CATEGORIES = [
  { value: 'Stéroïdes injectables', label: 'Stéroïdes injectables', emoji: '💉' },
  { value: 'Peptides', label: 'Peptides', emoji: '🧬' },
  { value: 'Stimulants', label: 'Stimulants', emoji: '💊' },
  { value: 'Nootropics', label: 'Nootropics', emoji: '🚬' },
  { value: 'Stéroïded oraux', label: 'Stéroïded oraux', emoji: '⚗️' },
  { value: 'Autres', label: 'Autres', emoji: '📦' },
];

function getCategory(value) {
  return CATEGORIES.find((c) => c.value === value);
}

function getCategoryLabel(value) {
  const cat = getCategory(value);
  return cat ? `${cat.emoji} ${cat.label}` : value;
}

module.exports = { CATEGORIES, getCategory, getCategoryLabel };
