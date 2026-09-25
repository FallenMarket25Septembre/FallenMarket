const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { CATEGORIES } = require('../config/categories');

// ---- Panneau principal (les 4 boutons de ta capture + 2 nouveaux) ----
function panelButtons() {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('market_sell').setLabel('Vendre un article').setEmoji('🛒').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('market_search').setLabel('Rechercher un article').setEmoji('🔍').setStyle(ButtonStyle.Primary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('market_my_listings').setLabel('Mes annonces').setEmoji('🛒').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('market_my_searches').setLabel('Mes recherches').setEmoji('🔍').setStyle(ButtonStyle.Secondary)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('market_all_listings').setLabel('Toutes les annonces').setEmoji('📋').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('market_delete').setLabel('Supprimer une annonce').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );
  return [row1, row2, row3];
}

// ---- Menu déroulant "Type de produit" (image 3 de ta capture) ----
function categorySelectRow(customId, placeholder = 'Type de produit') {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .addOptions(
      CATEGORIES.map((c) => ({ label: c.label, value: c.value, emoji: c.emoji }))
    );
  return new ActionRowBuilder().addComponents(menu);
}

// ---- Menu déroulant : choisir une annonce à supprimer ----
// `listings` : les annonces parmi lesquelles choisir (déjà filtrées selon les
// droits de qui a cliqué : soit ses propres annonces, soit toutes si admin).
// Discord limite un select menu à 25 options.
function listingSelectRow(listings) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('market_delete_select')
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

// ---- Modal : publier une annonce ----
function sellModal(category) {
  const modal = new ModalBuilder().setCustomId(`market_sell_modal:${category}`).setTitle('Vendre un article');
  const title = new TextInputBuilder()
    .setCustomId('title')
    .setLabel("Titre de l'article")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Hoodie noir, taille M')
    .setRequired(true)
    .setMaxLength(100);
  const price = new TextInputBuilder()
    .setCustomId('price')
    .setLabel('Prix')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 20€, ou "à négocier"')
    .setRequired(true)
    .setMaxLength(30);
  const link = new TextInputBuilder()
    .setCustomId('link')
    .setLabel('Lien (optionnel)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://... (laisse vide si pas de lien)')
    .setRequired(false)
    .setMaxLength(300);
  modal.addComponents(
    new ActionRowBuilder().addComponents(title),
    new ActionRowBuilder().addComponents(price),
    new ActionRowBuilder().addComponents(link)
  );
  return modal;
}

// ---- Modal : créer une alerte de recherche ----
function searchModal(category) {
  const modal = new ModalBuilder().setCustomId(`market_search_modal:${category}`).setTitle('Rechercher un article');
  const query = new TextInputBuilder()
    .setCustomId('query')
    .setLabel('Que cherches-tu exactement ?')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Ex: Hoodie noir, taille M ou L')
    .setRequired(true)
    .setMaxLength(300);
  modal.addComponents(new ActionRowBuilder().addComponents(query));
  return modal;
}

module.exports = { panelButtons, categorySelectRow, listingSelectRow, sellModal, searchModal };
