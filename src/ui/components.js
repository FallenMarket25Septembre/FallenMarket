const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { CATEGORIES, getCategoryLabel } = require('../config/categories');

// Tous les customId au même endroit pour éviter les fautes de frappe.
const IDS = {
  sell: 'market_sell',
  search: 'market_search',
  myListings: 'market_my_listings',
  mySearches: 'market_my_searches',
  allListings: 'market_all_listings',
  deleteListing: 'market_delete',
  deleteSearch: 'market_delete_search',
  sellCategory: 'market_sell_category',
  searchCategory: 'market_search_category',
  deleteListingSelect: 'market_delete_select',
  deleteSearchSelect: 'market_delete_search_select',
  sellModal: 'market_sell_modal', // + ":<catégorie>"
  searchModal: 'market_search_modal', // + ":<catégorie>"
};

function button(id, label, emoji, style) {
  return new ButtonBuilder().setCustomId(id).setLabel(label).setEmoji(emoji).setStyle(style);
}

function panelButtons() {
  return [
    new ActionRowBuilder().addComponents(
      button(IDS.sell, 'Vendre un article', '🛒', ButtonStyle.Success),
      button(IDS.search, 'Rechercher un article', '🔍', ButtonStyle.Primary)
    ),
    new ActionRowBuilder().addComponents(
      button(IDS.myListings, 'Mes annonces', '🛒', ButtonStyle.Secondary),
      button(IDS.mySearches, 'Mes recherches', '🔍', ButtonStyle.Secondary),
      button(IDS.allListings, 'Toutes les annonces', '📋', ButtonStyle.Secondary)
    ),
    new ActionRowBuilder().addComponents(
      button(IDS.deleteListing, 'Supprimer une annonce', '🗑️', ButtonStyle.Danger),
      button(IDS.deleteSearch, 'Supprimer une alerte', '🔕', ButtonStyle.Danger)
    ),
  ];
}

function categorySelectRow(customId) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder('Type de produit')
    .addOptions(CATEGORIES.slice(0, 25).map((c) => ({ label: c.label, value: c.value, emoji: c.emoji })));
  return new ActionRowBuilder().addComponents(menu);
}

// Discord limite un menu à 25 options.
function listingSelectRow(listings) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(IDS.deleteListingSelect)
    .setPlaceholder('Choisis une annonce à supprimer')
    .addOptions(
      listings.slice(0, 25).map((l) => ({
        label: l.title.slice(0, 100),
        description: `${l.price} — ${l.username}`.slice(0, 100),
        value: l.id,
      }))
    );
  return new ActionRowBuilder().addComponents(menu);
}

function searchSelectRow(searches) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(IDS.deleteSearchSelect)
    .setPlaceholder('Choisis une alerte à supprimer')
    .addOptions(
      searches.slice(0, 25).map((s) => ({
        label: (s.query || 'Toute la catégorie').slice(0, 100),
        description: getCategoryLabel(s.category).slice(0, 100),
        value: s.id,
      }))
    );
  return new ActionRowBuilder().addComponents(menu);
}

function textInput(id, label, style, { placeholder, required = true, maxLength }) {
  const input = new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(required);
  if (placeholder) input.setPlaceholder(placeholder);
  if (maxLength) input.setMaxLength(maxLength);
  return new ActionRowBuilder().addComponents(input);
}

function sellModal(category) {
  return new ModalBuilder()
    .setCustomId(`${IDS.sellModal}:${category}`)
    .setTitle('Vendre un article')
    .addComponents(
      textInput('title', "Titre de l'article", TextInputStyle.Short, {
        placeholder: 'Ex : Hoodie Nike noir, taille M',
        maxLength: 100,
      }),
      textInput('price', 'Prix', TextInputStyle.Short, { placeholder: 'Ex : 20€, ou "à négocier"', maxLength: 30 }),
      textInput('link', 'Lien Vinted (optionnel)', TextInputStyle.Short, {
        placeholder: 'https://www.vinted.fr/items/...',
        required: false,
        maxLength: 300,
      })
    );
}

function searchModal(category) {
  return new ModalBuilder()
    .setCustomId(`${IDS.searchModal}:${category}`)
    .setTitle('Rechercher un article')
    .addComponents(
      textInput('query', 'Que cherches-tu ? (mots-clés)', TextInputStyle.Short, {
        placeholder: 'Ex : hoodie nike noir  —  "*" pour toute la catégorie',
        maxLength: 150,
      })
    );
}

module.exports = {
  IDS,
  panelButtons,
  categorySelectRow,
  listingSelectRow,
  searchSelectRow,
  sellModal,
  searchModal,
};
