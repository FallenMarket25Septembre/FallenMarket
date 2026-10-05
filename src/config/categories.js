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
  { value: 'Stéroïdes injectables', label: 'Haut', emoji: '💉' },
  { value: 'Peptides', label: 'Bas', emoji: '🧬' },
  { value: 'Stimulants', label: 'Vestes & manteaux', emoji: '💊' },
  { value: 'Nootropics', label: 'Chaussures', emoji: '🚬' },
  { value: 'Stéroïded oraux', label: 'Accessoires', emoji: '⚗️' },
  { value: 'Autres', label: 'Autre', emoji: '📦' },
];

function getCategory(value) {
  return CATEGORIES.find((c) => c.value === value);
}

function getCategoryLabel(value) {
  const cat = getCategory(value);
  return cat ? `${cat.emoji} ${cat.label}` : value;
}

module.exports = { CATEGORIES, getCategory, getCategoryLabel };
