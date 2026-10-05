const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder, InteractionContextType } = require('discord.js');
const store = require('../data/store');
const { ephemeral } = require('../utils/reply');

const data = new SlashCommandBuilder()
  .setName('market-backup')
  .setDescription('Télécharger une sauvegarde complète des annonces et alertes (staff)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setContexts(InteractionContextType.Guild);

async function execute(interaction) {
  store.backup('command');
  const stamp = new Date().toISOString().slice(0, 10);
  const file = new AttachmentBuilder(Buffer.from(store.exportJson()), { name: `fallenmarket-db-${stamp}.json` });
  return ephemeral(interaction, {
    content: '💾 Sauvegarde actuelle. Garde ce fichier en lieu sûr : il contient les ID Discord des membres.',
    files: [file],
  });
}

module.exports = { data, execute, adminOnly: true };
