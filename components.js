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

// ---- Panneau principal (les 4 boutons de ta capture) ----
function panelButtons() {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('market_sell').setLabel('Vendre un article').setEmoji('🛒').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('market_search').setLabel('Rechercher un article').setEmoji('🔍').setStyle(ButtonStyle.Primary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('market_my_listings').setLabel('Mes annonces').setEmoji('🛒').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('market_my_searches').setLabel('Mes recherches').setEmoji('🔍').setStyle(ButtonStyle.Secondary)
  );
  return [row1, row2];
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

// ---- Modal : publier une annonce ----
function sellModal(category) {
  const modal = new ModalBuilder().setCustomId(`market_sell_modal:${category}`).setTitle('Vendre un article');
  const title = new TextInputBuilder()
    .setCustomId('title')
    .setLabel("Titre de l'article")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: Hoodie Lucid noir, taille M')
    .setRequired(true)
    .setMaxLength(100);
  const link = new TextInputBuilder()
    .setCustomId('link')
    .setLabel('Lien de ton annonce Vinted')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('https://www.vinted.fr/...')
    .setRequired(true)
    .setMaxLength(300);
  modal.addComponents(
    new ActionRowBuilder().addComponents(title),
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
    .setPlaceholder('Ex: Hoodie Lucid noir, taille M ou L')
    .setRequired(true)
    .setMaxLength(300);
  modal.addComponents(new ActionRowBuilder().addComponents(query));
  return modal;
}

module.exports = { panelButtons, categorySelectRow, sellModal, searchModal };
