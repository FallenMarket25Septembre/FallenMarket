// ============================================================
// CATÉGORIES DU CATALOGUE
// Modifie cette liste pour ajouter / retirer / renommer des catégories.
// - value  : identifiant interne (garde-le simple, sans espace, en minuscule)
// - label  : texte affiché dans le menu déroulant
// - emoji  : emoji affiché à côté du label
// ============================================================

const CATEGORIES = [
  { value: 'hauts', label: 'Hauts', emoji: '👕' },
  { value: 'bas', label: 'Bas', emoji: '👖' },
  { value: 'vestes', label: 'Vestes & Manteaux', emoji: '🧥' },
  { value: 'chaussures', label: 'Chaussures', emoji: '👟' },
  { value: 'accessoires', label: 'Accessoires', emoji: '🎒' },
  { value: 'autre', label: 'Autre', emoji: '📦' },
];

function getCategoryByValue(value) {
  return CATEGORIES.find((c) => c.value === value);
}

function getCategoryLabel(value) {
  const cat = getCategoryByValue(value);
  return cat ? `${cat.emoji} ${cat.label}` : value;
}

module.exports = { CATEGORIES, getCategoryByValue, getCategoryLabel };
