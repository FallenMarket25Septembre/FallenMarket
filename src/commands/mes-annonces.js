const { SlashCommandBuilder } = require('discord.js');
const store = require('../data/store');
const { myListingsEmbed } = require('../ui/embeds');
const { ephemeral } = require('../utils/reply');

const data = new SlashCommandBuilder().setName('mes-annonces').setDescription('Voir tes annonces en cours');

async function execute(interaction) {
  return ephemeral(interaction, { embeds: [myListingsEmbed(store.getListings({ userId: interaction.user.id }))] });
}

module.exports = { data, execute };
