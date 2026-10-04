const { SlashCommandBuilder } = require('discord.js');
const market = require('../services/market');
const { normalize } = require('../services/matching');
const { ephemeral } = require('../utils/reply');

const data = new SlashCommandBuilder()
  .setName('supprimer-annonce')
  .setDescription('Supprimer une de tes annonces (les modérateurs peuvent supprimer toutes les annonces)')
  .addStringOption((o) => o.setName('annonce').setDescription("Commence à taper le titre").setRequired(true).setAutocomplete(true));

async function autocomplete(interaction) {
  const typed = normalize(interaction.options.getFocused());
  const choices = market
    .deletableListings(interaction)
    .filter((l) => normalize(l.title).includes(typed))
    .slice(0, 25)
    .map((l) => ({ name: `${l.title} — ${l.price} (${l.username})`.slice(0, 100), value: l.id }));
  return interaction.respond(choices);
}

async function execute(interaction) {
  const listing = market.deleteListing(interaction, interaction.options.getString('annonce', true));
  return ephemeral(interaction, `🗑️ Annonce supprimée : **${listing.title}** — ${listing.price}`);
}

module.exports = { data, execute, autocomplete };
