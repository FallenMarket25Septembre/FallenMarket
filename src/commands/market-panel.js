const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { panelEmbed } = require('../ui/embeds');
const { panelButtons } = require('../ui/components');
const { ephemeral } = require('../utils/reply');

const data = new SlashCommandBuilder()
  .setName('market-panel')
  .setDescription('Publie le panneau Fallen Market Place dans ce salon (staff)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setContexts(InteractionContextType.Guild);

async function execute(interaction) {
  await interaction.channel.send({ embeds: [panelEmbed()], components: panelButtons() });
  return ephemeral(interaction, '✅ Panneau publié.');
}

module.exports = { data, execute, adminOnly: true };
