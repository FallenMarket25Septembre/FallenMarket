const { EmbedBuilder } = require('discord.js');

// Gris "intégré" : la barre latérale de l'embed se fond dans le fond de
// l'embed lui-même au lieu de trancher avec une couleur vive. Même teinte
// utilisée partout pour un rendu cohérent et sobre.
const BRAND_COLOR = 0x2b2d31;

function panelEmbed() {
  const footer = process.env.CREDIT_FOOTER || 'by anzuko';
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle('🖤 __FALLEN MARKET PLACE__')
    .setDescription(
      [
        'Vends et retrouve des articles.',
        '',
        'Publie une annonce ou recherche une pièce du catalogue.',
        '',
        '**Quelques règles**',
        '• Aucun paiement ni échange privé sur Discord.',
        '• Signale toute annonce suspecte au staff.',
        '',
        'Fallen Market Place et son équipe ne sont pas responsables des transactions.',
        '',
        'Gère tes alertes dans #notifications.',
      ].join('\n')
    )
    .setFooter({ text: footer });
}

function listingConfirmEmbed(listing, categoryLabel) {
  const embed = new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle('✅ Annonce publiée')
    .addFields(
      { name: 'Catégorie', value: categoryLabel, inline: true },
      { name: 'Titre', value: listing.title, inline: true },
      { name: 'Prix', value: listing.price, inline: true }
    )
    .setTimestamp(new Date(listing.createdAt));
  if (listing.link) {
    embed.addFields({ name: 'Lien', value: listing.link });
  }
  return embed;
}

function searchConfirmEmbed(search, categoryLabel) {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle('🔔 Alerte de recherche activée')
    .addFields(
      { name: 'Catégorie', value: categoryLabel, inline: true },
      { name: 'Ce que tu cherches', value: search.query }
    )
    .setDescription("Tu recevras un DM dès qu'un article correspondant sera mis en vente.")
    .setTimestamp(new Date(search.createdAt));
}

function matchDmEmbed(listing, categoryLabel) {
  const embed = new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle('🖤 Quelqu\'un vend un article que tu cherches !')
    .addFields(
      { name: 'Catégorie', value: categoryLabel, inline: true },
      { name: 'Article', value: listing.title, inline: true },
      { name: 'Prix', value: listing.price, inline: true }
    );
  if (listing.link) {
    embed.addFields({ name: 'Lien', value: listing.link });
  }
  embed
    .addFields({ name: 'Vendeur', value: `${listing.username} (\`${listing.userId}\`)` })
    .setFooter({ text: 'Contacte-le directement pour conclure l\'échange.' })
    .setTimestamp();
  return embed;
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

function allListingsEmbed(listings) {
  const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle('🖤 Toutes les annonces');
  if (!listings.length) {
    embed.setDescription("Aucune annonce en cours pour l'instant.");
    return embed;
  }
  const sorted = [...listings].sort((a, b) => b.createdAt - a.createdAt);
  const shown = sorted.slice(0, 25);
  const lines = shown.map((l, i) => {
    const parts = [`**${i + 1}. ${l.title}** — ${l.price}`, `${l.username}`];
    if (l.link) parts.push(l.link);
    return parts.join('\n');
  });
  embed.setDescription(lines.join('\n\n'));
  if (sorted.length > shown.length) {
    embed.setFooter({ text: `+ ${sorted.length - shown.length} autre(s) annonce(s) non affichée(s)` });
  }
  return embed;
}

module.exports = {
  panelEmbed,
  listingConfirmEmbed,
  searchConfirmEmbed,
  matchDmEmbed,
  listEmbed,
  allListingsEmbed,
};
