const store = require('../data/store');
const market = require('../services/market');
const { myListingsEmbed, mySearchesEmbed, allListingsEmbed } = require('../ui/embeds');
const { IDS, categorySelectRow, listingSelectRow, searchSelectRow } = require('../ui/components');
const { ephemeral } = require('../utils/reply');

async function handleButton(interaction) {
  const userId = interaction.user.id;

  switch (interaction.customId) {
    case IDS.sell:
      return ephemeral(interaction, { content: 'Choisis le type de produit.', components: [categorySelectRow(IDS.sellCategory)] });

    case IDS.search:
      return ephemeral(interaction, { content: 'Choisis le type de produit.', components: [categorySelectRow(IDS.searchCategory)] });

    case IDS.myListings:
      return ephemeral(interaction, { embeds: [myListingsEmbed(store.getListings({ userId }))] });

    case IDS.mySearches:
      return ephemeral(interaction, { embeds: [mySearchesEmbed(store.getSearches({ userId }))] });

    case IDS.allListings:
      return ephemeral(interaction, { embeds: [allListingsEmbed(store.getAllListings())] });

    case IDS.deleteListing: {
      const admin = market.isAdmin(interaction);
      const listings = market.deletableListings(interaction);
      if (!listings.length) {
        return ephemeral(interaction, admin ? "Il n'y a aucune annonce à supprimer." : "Tu n'as aucune annonce à supprimer.");
      }
      const more = listings.length > 25 ? ' (25 plus récentes affichées, utilise `/supprimer-annonce` pour chercher)' : '';
      return ephemeral(interaction, {
        content: (admin ? 'Choisis une annonce à supprimer (droits modérateur).' : 'Choisis une de tes annonces à supprimer.') + more,
        components: [listingSelectRow(listings)],
      });
    }

    case IDS.deleteSearch: {
      const searches = store.getSearches({ userId });
      if (!searches.length) return ephemeral(interaction, "Tu n'as aucune alerte à supprimer.");
      return ephemeral(interaction, { content: 'Choisis une alerte à supprimer.', components: [searchSelectRow(searches)] });
    }
  }
}

module.exports = { handleButton };
