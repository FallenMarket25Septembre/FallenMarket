// Options réutilisées par plusieurs commandes.
const { CATEGORIES } = require('../config/categories');

function addCategoryOption(builder, { required = true, description = 'Type de produit' } = {}) {
  return builder.addStringOption((o) =>
    o
      .setName('categorie')
      .setDescription(description)
      .setRequired(required)
      .addChoices(...CATEGORIES.slice(0, 25).map((c) => ({ name: `${c.emoji} ${c.label}`, value: c.value })))
  );
}

module.exports = { addCategoryOption };
