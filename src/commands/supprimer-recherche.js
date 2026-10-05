const { SlashCommandBuilder } = require('discord.js');
const store = require('../data/store');
const market = require('../services/market');
const { normalize } = require('../services/matching');
const { getCategoryLabel } = require('../config/categories');
const { ephemeral } = require('../utils/reply');

const data = new SlashCommandBuilder()
  .setName('supprimer-recherche')
  .setDescription('Supprimer une de tes alertes de recherche')
  .addStringOption((o) => o.setName('alerte').setDescription('Commence à taper ta recherche').setRequired(true).setAutocomplete(true));

async function autocomplete(interaction) {
  const typed = normalize(interaction.options.getFocused());
  const choices = store
    .getSearches({ userId: interaction.user.id })
    .filter((s) => normalize(s.query).includes(typed))
    .slice(0, 25)
    .map((s) => ({ name: `${s.query || 'Toute la catégorie'} — ${getCategoryLabel(s.category)}`.slice(0, 100), value: s.id }));
  return interaction.respond(choices);
}

async function execute(interaction) {
  const search = market.deleteSearch(interaction, interaction.options.getString('alerte', true));
  return ephemeral(interaction, `🔕 Alerte supprimée : **${search.query || 'toute la catégorie'}** — ${getCategoryLabel(search.category)}`);
}

module.exports = { data, execute, autocomplete };
