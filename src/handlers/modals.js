const market = require('../services/market');
const { listingConfirmEmbed, searchConfirmEmbed } = require('../ui/embeds');
const { IDS } = require('../ui/components');
const { ephemeral } = require('../utils/reply');

async function handleModalSubmit(interaction) {
  const [action, category] = interaction.customId.split(':');
  const field = (id) => interaction.fields.getTextInputValue(id);

  if (action === IDS.sellModal) {
    const listing = await market.createListing(interaction, {
      category,
      title: field('title'),
      price: field('price'),
      link: field('link'),
    });
    return ephemeral(interaction, { embeds: [listingConfirmEmbed(listing)] });
  }

  if (action === IDS.searchModal) {
    const search = await market.createSearch(interaction, { category, query: field('query') });
    return ephemeral(interaction, { embeds: [searchConfirmEmbed(search)] });
  }
}

module.exports = { handleModalSubmit };
