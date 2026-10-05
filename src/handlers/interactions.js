// Routeur : envoie chaque interaction Discord au bon gestionnaire et
// centralise la gestion des erreurs.
const { byName } = require('../commands');
const { handleButton } = require('./buttons');
const { handleSelectMenu } = require('./selects');
const { handleModalSubmit } = require('./modals');
const { MarketError, isAdmin } = require('../services/market');
const { ephemeral } = require('../utils/reply');

async function handleInteraction(interaction) {
  try {
    if (interaction.isAutocomplete()) {
      const command = byName.get(interaction.commandName);
      return command?.autocomplete ? await command.autocomplete(interaction) : interaction.respond([]);
    }
    if (interaction.isChatInputCommand()) {
      const command = byName.get(interaction.commandName);
      if (!command) return;
      if (command.adminOnly && !isAdmin(interaction)) {
        return ephemeral(interaction, '🔒 Réservé aux modérateurs.');
      }
      return await command.execute(interaction);
    }
    if (interaction.isButton()) return await handleButton(interaction);
    if (interaction.isStringSelectMenu()) return await handleSelectMenu(interaction);
    if (interaction.isModalSubmit()) return await handleModalSubmit(interaction);
  } catch (err) {
    if (interaction.isAutocomplete()) return;
    const message = err instanceof MarketError ? `❌ ${err.message}` : '❌ Une erreur est survenue, réessaie.';
    if (!(err instanceof MarketError)) console.error('Erreur interaction :', err);
    await ephemeral(interaction, message).catch(() => {});
  }
}

module.exports = { handleInteraction };
