const { SlashCommandBuilder } = require('discord.js');
const { addCategoryOption } = require('./options');
const market = require('../services/market');
const { listingConfirmEmbed } = require('../ui/embeds');
const { ephemeral } = require('../utils/reply');

const data = addCategoryOption(new SlashCommandBuilder().setName('vendre').setDescription('Publier une annonce'))
  .addStringOption((o) => o.setName('titre').setDescription("Titre de l'article (ex : Hoodie Nike noir, taille M)").setRequired(true).setMaxLength(100))
  .addStringOption((o) => o.setName('prix').setDescription('Prix (ex : 20€, à négocier)').setRequired(true).setMaxLength(30))
  .addStringOption((o) => o.setName('lien').setDescription('Lien Vinted (optionnel)').setMaxLength(300));

async function execute(interaction) {
  const listing = await market.createListing(interaction, {
    category: interaction.options.getString('categorie', true),
    title: interaction.options.getString('titre', true),
    price: interaction.options.getString('prix', true),
    link: interaction.options.getString('lien'),
  });
  return ephemeral(interaction, { embeds: [listingConfirmEmbed(listing)] });
}

module.exports = { data, execute };
