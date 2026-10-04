const { SlashCommandBuilder } = require('discord.js');
const store = require('../data/store');
const { mySearchesEmbed } = require('../ui/embeds');
const { ephemeral } = require('../utils/reply');

const data = new SlashCommandBuilder().setName('mes-recherches').setDescription('Voir tes alertes de recherche actives');

async function execute(interaction) {
  return ephemeral(interaction, { embeds: [mySearchesEmbed(store.getSearches({ userId: interaction.user.id }))] });
}

module.exports = { data, execute };
