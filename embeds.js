const { EmbedBuilder } = require('discord.js');

const BRAND_COLOR = 0x8b5cf6; // violet, assorti à l'emoji 👁️

function panelEmbed() {
  const footer = process.env.CREDIT_FOOTER || 'by @market-lucid.';
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle('👁️ __MARKET LUCID__')
    .setDescription(
      [
        'Vends et retrouve les articles Lucid.',
        '',
        'Publie une annonce Vinted ou recherche une pièce du catalogue.',
        '',
        '**Quelques règles**',
        '• Annonces et achats via **Vinted** uniquement.',
        '• Aucun paiement ni échange privé sur Discord.',
        '• Signale toute annonce suspecte au staff.',
        '',
        'Lucid et son équipe ne sont pas responsables des transactions.',
        '',
        'Gère tes alertes dans #notifications.',
      ].join('\n')
    )
    .setFooter({ text: footer });
}

function listingConfirmEmbed(listing, categoryLabel) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('✅ Annonce publiée')
    .addFields(
      { name: 'Catégorie', value: categoryLabel, inline: true },
      { name: 'Titre', value: listing.title, inline: true },
      { name: 'Lien Vinted', value: listing.link }
    )
    .setTimestamp(new Date(listing.createdAt));
}

function searchConfirmEmbed(search, categoryLabel) {
  return new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('🔔 Alerte de recherche activée')
    .addFields(
      { name: 'Catégorie', value: categoryLabel, inline: true },
      { name: 'Ce que tu cherches', value: search.query }
    )
    .setDescription("Tu recevras un DM dès qu'un article correspondant sera mis en vente.")
    .setTimestamp(new Date(search.createdAt));
}

function matchDmEmbed(listing, categoryLabel) {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle('👁️ Quelqu\'un vend un article que tu cherches !')
    .addFields(
      { name: 'Catégorie', value: categoryLabel, inline: true },
      { name: 'Article', value: listing.title, inline: true },
      { name: 'Lien Vinted', value: listing.link },
      { name: 'Vendeur', value: `${listing.username} (\`${listing.userId}\`)` }
    )
    .setFooter({ text: 'Contacte-le uniquement via Vinted.' })
    .setTimestamp();
}

function listEmbed(title, items, emptyText) {
  const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(title);
  if (!items.length) {
    embed.setDescription(emptyText);
    return embed;
  }
  embed.setDescription(items.join('\n\n'));
  return embed;
}

module.exports = {
  panelEmbed,
  listingConfirmEmbed,
  searchConfirmEmbed,
  matchDmEmbed,
  listEmbed,
};
