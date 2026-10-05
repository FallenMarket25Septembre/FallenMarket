const { SlashCommandBuilder } = require('discord.js');
const { addCategoryOption } = require('./options');
const store = require('../data/store');
const { allListingsEmbed } = require('../ui/embeds');
const { ephemeral } = require('../utils/reply');

const data = addCategoryOption(new SlashCommandBuilder().setName('annonces').setDescription('Voir les annonces en cours'), {
  required: false,
  description: 'Filtrer par catégorie (optionnel)',
});

async function execute(interaction) {
  const category = interaction.options.getString('categorie') || undefined;
  return ephemeral(interaction, { embeds: [allListingsEmbed(store.getListings({ category }), category)] });
}

module.exports = { data, execute };
