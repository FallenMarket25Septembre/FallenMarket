require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Events } = require('discord.js');
const store = require('./data/store');
const { handleInteraction } = require('./handlers/interactions');
const { registerCommands } = require('./deploy-commands');

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ DISCORD_TOKEN manquant. Vérifie ton fichier .env ou tes variables Railway.');
  process.exit(1);
}

// Charge (et migre si besoin) la base avant d'accepter la moindre interaction.
store.init();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel], // nécessaire pour envoyer des DM
});

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Connecté en tant que ${c.user.tag}`);
  try {
    await registerCommands();
  } catch (err) {
    console.warn('⚠️ Enregistrement des commandes échoué (le bot reste fonctionnel) :', err.message);
  }
});

client.on(Events.InteractionCreate, handleInteraction);

// Railway envoie SIGTERM avant d'arrêter le conteneur.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`Arrêt (${signal})`);
    client.destroy();
    process.exit(0);
  });
}

client.login(process.env.DISCORD_TOKEN);
