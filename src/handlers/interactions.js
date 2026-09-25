const { randomUUID } = require('crypto');
const { getCategoryByValue, getCategoryLabel } = require('../config/categories');
const store = require('../data/store');
const {
  panelEmbed,
  listingConfirmEmbed,
  searchConfirmEmbed,
  matchDmEmbed,
  listEmbed,
  allListingsEmbed,
} = require('../ui/embeds');
const {
  panelButtons,
  categorySelectRow,
  listingSelectRow,
  sellModal,
  searchModal,
} = require('../ui/components');

async function handleInteraction(interaction) {
  try {
    if (interaction.isChatInputCommand()) return handleSlashCommand(interaction);
    if (interaction.isButton()) return handleButton(interaction);
    if (interaction.isStringSelectMenu()) return handleSelectMenu(interaction);
    if (interaction.isModalSubmit()) return handleModalSubmit(interaction);
  } catch (err) {
    console.error('Erreur interaction:', err);
    const payload = { content: "❌ Une erreur est survenue, réessaie.", ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}

// ---------------- Slash commands ----------------
async function handleSlashCommand(interaction) {
  if (interaction.commandName === 'market-panel') {
    if (!interaction.memberPermissions?.has('ManageGuild')) {
      return interaction.reply({ content: '🔒 Réservé aux modérateurs.', ephemeral: true });
    }
    await interaction.channel.send({ embeds: [panelEmbed()], components: panelButtons() });
    return interaction.reply({ content: '✅ Panneau publié.', ephemeral: true });
  }
}

// ---------------- Boutons du panneau ----------------
async function handleButton(interaction) {
  switch (interaction.customId) {
    case 'market_sell':
      return interaction.reply({
        content: 'Choisis le type de produit.',
        components: [categorySelectRow('market_sell_category')],
        ephemeral: true,
      });

    case 'market_search':
      return interaction.reply({
        content: 'Choisis le type de produit.',
        components: [categorySelectRow('market_search_category')],
        ephemeral: true,
      });

    case 'market_my_listings': {
      const items = store.getUserListings(interaction.user.id).map(
        (l) => `**${l.title}** — ${l.price} — ${getCategoryLabel(l.category)}${l.link ? `\n${l.link}` : ''}`
      );
      return interaction.reply({
        embeds: [listEmbed('🛒 Mes annonces', items, "Tu n'as encore publié aucune annonce.")],
        ephemeral: true,
      });
    }

    case 'market_my_searches': {
      const items = store.getUserSearches(interaction.user.id).map(
        (s) => `**${getCategoryLabel(s.category)}** — ${s.query}`
      );
      return interaction.reply({
        embeds: [listEmbed('🔍 Mes recherches', items, "Tu n'as encore activé aucune alerte de recherche.")],
        ephemeral: true,
      });
    }

    // ---- Leaderboard : toutes les annonces en cours, toutes catégories ----
    case 'market_all_listings': {
      return interaction.reply({
        embeds: [allListingsEmbed(store.getAllListings())],
        ephemeral: true,
      });
    }

    // ---- Suppression : on montre un menu adapté aux droits de qui clique ----
    case 'market_delete': {
      const isAdmin = interaction.memberPermissions?.has('ManageGuild');
      const listings = isAdmin ? store.getAllListings() : store.getUserListings(interaction.user.id);

      if (!listings.length) {
        return interaction.reply({
          content: isAdmin
            ? "Il n'y a aucune annonce à supprimer pour l'instant."
            : "Tu n'as encore publié aucune annonce à supprimer.",
          ephemeral: true,
        });
      }

      return interaction.reply({
        content: isAdmin
          ? 'Choisis une annonce à supprimer (droits modérateur : toutes les annonces).'
          : 'Choisis une de tes annonces à supprimer.',
        components: [listingSelectRow(listings)],
        ephemeral: true,
      });
    }
  }
}

// ---------------- Menus déroulants ----------------
async function handleSelectMenu(interaction) {
  if (interaction.customId === 'market_sell_category' || interaction.customId === 'market_search_category') {
    const category = interaction.values[0];
    const cat = getCategoryByValue(category);
    if (!cat) return interaction.reply({ content: 'Catégorie invalide.', ephemeral: true });

    if (interaction.customId === 'market_sell_category') {
      return interaction.showModal(sellModal(category));
    }
    return interaction.showModal(searchModal(category));
  }

  // ---- Sélection d'une annonce à supprimer ----
  if (interaction.customId === 'market_delete_select') {
    const listingId = interaction.values[0];
    const listing = store.getListingById(listingId);

    if (!listing) {
      return interaction.update({ content: "Cette annonce n'existe plus.", embeds: [], components: [] });
    }

    const isOwner = listing.userId === interaction.user.id;
    const isAdmin = interaction.memberPermissions?.has('ManageGuild');

    // Sécurité : même si le menu ne montre en théorie que les bonnes annonces,
    // on revérifie ici au cas où (annonce supprimée entre-temps, menu périmé, etc.)
    if (!isOwner && !isAdmin) {
      return interaction.update({
        content: "🔒 Tu ne peux supprimer que tes propres annonces.",
        embeds: [],
        components: [],
      });
    }

    store.removeListingById(listing.id);

    return interaction.update({
      content: `🗑️ Annonce supprimée : **${listing.title}** — ${listing.price}`,
      embeds: [],
      components: [],
    });
  }
}

// ---------------- Modals ----------------
async function handleModalSubmit(interaction) {
  const [action, category] = interaction.customId.split(':');
  const cat = getCategoryByValue(category);

  if (action === 'market_sell_modal') {
    const listing = {
      id: randomUUID(),
      userId: interaction.user.id,
      username: interaction.user.tag,
      category,
      title: interaction.fields.getTextInputValue('title'),
      price: interaction.fields.getTextInputValue('price'),
      link: interaction.fields.getTextInputValue('link'),
      createdAt: Date.now(),
    };
    store.addListing(listing);
    await interaction.reply({ embeds: [listingConfirmEmbed(listing, getCategoryLabel(category))], ephemeral: true });
    return notifyMatchingSearches(interaction, listing, cat);
  }

  if (action === 'market_search_modal') {
    const search = {
      id: randomUUID(),
      userId: interaction.user.id,
      username: interaction.user.tag,
      category,
      query: interaction.fields.getTextInputValue('query'),
      active: true,
      createdAt: Date.now(),
    };
    store.addSearch(search);
    await interaction.reply({ embeds: [searchConfirmEmbed(search, getCategoryLabel(category))], ephemeral: true });
    return notifyExistingListings(interaction, search, cat);
  }
}

// ---------------- Matching + DM ----------------
// Quand une annonce est publiée dans une catégorie, on DM tous les gens
// qui ont une alerte active sur cette même catégorie, avec le pseudo + l'ID du vendeur.
async function notifyMatchingSearches(interaction, listing, cat) {
  const matches = store.getActiveSearchesForCategory(listing.category);
  const label = getCategoryLabel(listing.category);

  for (const search of matches) {
    if (search.userId === listing.userId) continue; // pas de DM à soi-même
    try {
      const user = await interaction.client.users.fetch(search.userId);
      await user.send({ embeds: [matchDmEmbed(listing, label)] });
    } catch (err) {
      // DMs fermés ou utilisateur introuvable : on ignore silencieusement
      console.warn(`Impossible de DM ${search.userId}:`, err.message);
    }
  }
}

// Quand une alerte de recherche est créée, on DM aussi l'auteur pour toutes
// les annonces déjà publiées avant lui dans cette catégorie, sinon il ratait
// tout ce qui existait avant sa demande.
async function notifyExistingListings(interaction, search, cat) {
  const existing = store.getListingsForCategory(search.category);
  const label = getCategoryLabel(search.category);

  for (const listing of existing) {
    if (listing.userId === search.userId) continue; // pas de DM pour sa propre annonce
    try {
      const user = await interaction.client.users.fetch(search.userId);
      await user.send({ embeds: [matchDmEmbed(listing, label)] });
    } catch (err) {
      console.warn(`Impossible de DM ${search.userId}:`, err.message);
    }
  }
}

module.exports = { handleInteraction };
