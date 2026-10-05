const market = require('../services/market');
const { getCategory, getCategoryLabel } = require('../config/categories');
const { IDS, sellModal, searchModal } = require('../ui/components');
const { ephemeral } = require('../utils/reply');

async function handleSelectMenu(interaction) {
  const value = interaction.values[0];

  switch (interaction.customId) {
    case IDS.sellCategory:
    case IDS.searchCategory:
      if (!getCategory(value)) return ephemeral(interaction, 'Catégorie invalide.');
      return interaction.showModal(interaction.customId === IDS.sellCategory ? sellModal(value) : searchModal(value));

    case IDS.deleteListingSelect: {
      let content;
      try {
        const listing = market.deleteListing(interaction, value);
        content = `🗑️ Annonce supprimée : **${listing.title}** — ${listing.price}`;
      } catch (err) {
        if (!(err instanceof market.MarketError)) throw err;
        content = `❌ ${err.message}`;
      }
      return interaction.update({ content, embeds: [], components: [] });
    }

    case IDS.deleteSearchSelect: {
      let content;
      try {
        const search = market.deleteSearch(interaction, value);
        content = `🔕 Alerte supprimée : **${search.query || 'toute la catégorie'}** — ${getCategoryLabel(search.category)}`;
      } catch (err) {
        if (!(err instanceof market.MarketError)) throw err;
        content = `❌ ${err.message}`;
      }
      return interaction.update({ content, embeds: [], components: [] });
    }
  }
}

module.exports = { handleSelectMenu };
