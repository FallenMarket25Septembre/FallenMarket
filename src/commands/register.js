require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('market-panel')
    .setDescription('Publie le panneau Fallen Market Place dans ce salon (staff uniquement).')
    .toJSON(),
];

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const route = process.env.GUILD_ID
    ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    : Routes.applicationCommands(process.env.CLIENT_ID);

  await rest.put(route, { body: commands });
  console.log(
    process.env.GUILD_ID
      ? '✅ Slash commands enregistrées sur le serveur (instantané).'
      : '✅ Slash commands enregistrées globalement (jusqu\'à 1h de propagation).'
  );
}

if (require.main === module) {
  registerCommands().catch((err) => {
    console.error('Erreur enregistrement des commandes:', err);
    process.exit(1);
  });
}

module.exports = { registerCommands };
