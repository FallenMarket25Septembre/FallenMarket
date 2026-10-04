// Enregistre les slash commands auprès de Discord.
// Appelé automatiquement au démarrage, ou à la main : npm run register
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const { commands } = require('./commands');

async function registerCommands() {
  const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
  if (!CLIENT_ID) throw new Error('CLIENT_ID manquant');

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);

  await rest.put(route, { body: commands.map((c) => c.data.toJSON()) });
  console.log(
    `✅ ${commands.length} slash commands enregistrées ` +
      (GUILD_ID ? 'sur le serveur (instantané).' : "globalement (jusqu'à 1h de propagation).")
  );
}

if (require.main === module) {
  registerCommands().catch((err) => {
    console.error('Erreur enregistrement des commandes :', err);
    process.exit(1);
  });
}

module.exports = { registerCommands };
