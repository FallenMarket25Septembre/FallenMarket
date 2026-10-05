const { SlashCommandBuilder } = require('discord.js');
const { addCategoryOption } = require('./options');
const market = require('../services/market');
const { searchConfirmEmbed } = require('../ui/embeds');
const { ephemeral } = require('../utils/reply');

const data = addCategoryOption(
  new SlashCommandBuilder().setName('rechercher').setDescription('Créer une alerte : DM dès qu’un article correspondant est mis en vente')
).addStringOption((o) =>
  o.setName('recherche').setDescription('Mots-clés (ex : hoodie nike noir) — "*" pour toute la catégorie').setRequired(true).setMaxLength(150)
);

async function execute(interaction) {
  const search = await market.createSearch(interaction, {
    category: interaction.options.getString('categorie', true),
    query: interaction.options.getString('recherche', true),
  });
  return ephemeral(interaction, { embeds: [searchConfirmEmbed(search)] });
}

module.exports = { data, execute };
