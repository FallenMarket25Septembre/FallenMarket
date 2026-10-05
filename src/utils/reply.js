const { MessageFlags } = require('discord.js');

// Réponse visible uniquement par l'auteur de l'interaction.
function ephemeral(interaction, payload) {
  const options = typeof payload === 'string' ? { content: payload } : payload;
  const full = { ...options, flags: MessageFlags.Ephemeral };
  if (interaction.deferred || interaction.replied) return interaction.followUp(full);
  return interaction.reply(full);
}

module.exports = { ephemeral };
