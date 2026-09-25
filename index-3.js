require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const { handleInteraction } = require('./handlers/interactions');
const { registerCommands } = require('./commands/register');

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN manquant. Vérifie ton fichier .env ou tes variables Railway.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel], // nécessaire pour pouvoir envoyer des DM
});

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Connecté en tant que ${c.user.tag}`);
  try {
    if (process.env.CLIENT_ID) {
      await registerCommands();
    }
  } catch (err) {
    console.warn('⚠️ Enregistrement des commandes échoué (le bot reste fonctionnel) :', err.message);
  }
});

client.on(Events.InteractionCreate, handleInteraction);

client.login(process.env.DISCORD_TOKEN);
