const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');
const store = require('../data/store');

const MAX_SIZE = 5 * 1024 * 1024;

const data = new SlashCommandBuilder()
  .setName('market-restore')
  .setDescription('Importer un db.json (ancien ou nouveau format) (staff)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setContexts(InteractionContextType.Guild)
  .addAttachmentOption((o) => o.setName('fichier').setDescription('Le fichier db.json').setRequired(true))
  .addStringOption((o) =>
    o
      .setName('mode')
      .setDescription('Fusionner avec les données actuelles (défaut) ou tout remplacer')
      .addChoices({ name: 'Fusionner', value: 'merge' }, { name: 'Remplacer', value: 'replace' })
  );

async function execute(interaction) {
  const file = interaction.options.getAttachment('fichier', true);
  const mode = interaction.options.getString('mode') || 'merge';

  if (file.size > MAX_SIZE) {
    return interaction.reply({ content: '❌ Fichier trop gros (5 Mo max).', flags: MessageFlags.Ephemeral });
  }
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const res = await fetch(file.url);
    if (!res.ok) throw new Error(`téléchargement impossible (HTTP ${res.status})`);
    const totals = store.importJson(await res.text(), mode);
    return interaction.editReply(
      `✅ Import terminé (${mode === 'replace' ? 'remplacement' : 'fusion'}). ` +
        `Total : ${totals.listings} annonce(s), ${totals.searches} alerte(s). ` +
        "Une sauvegarde de l'état précédent a été faite."
    );
  } catch (err) {
    return interaction.editReply(`❌ Import refusé : ${err.message}`);
  }
}

module.exports = { data, execute, adminOnly: true };
