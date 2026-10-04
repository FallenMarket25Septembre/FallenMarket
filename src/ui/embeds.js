const { EmbedBuilder } = require('discord.js');
const { getCategoryLabel } = require('../config/categories');

// Gris "intégré" : la barre latérale se fond dans le fond de l'embed.
const BRAND_COLOR = 0x2b2d31;
const MAX_DESCRIPTION = 4000; // limite Discord : 4096

function base() {
  return new EmbedBuilder().setColor(BRAND_COLOR);
}

// Assemble des blocs de texte sans dépasser la limite Discord.
function joinWithinLimit(blocks, separator = '\n\n') {
  let out = '';
  let shown = 0;
  for (const block of blocks) {
    const next = out ? out + separator + block : block;
    if (next.length > MAX_DESCRIPTION) break;
    out = next;
    shown += 1;
  }
  return { text: out, hidden: blocks.length - shown };
}

function listingLine(l, { withCategory = false, withSeller = false } = {}) {
  const parts = [`**${l.title}** — ${l.price}`];
  if (withCategory) parts.push(getCategoryLabel(l.category));
  if (withSeller) parts.push(`<@${l.userId}>`);
  let line = parts.join(' · ');
  if (l.link) line += `\n${l.link}`;
  return line;
}

function panelEmbed() {
  const footer = process.env.CREDIT_FOOTER || 'by anzuko';
  return base()
    .setTitle('🖤 __FALLEN MARKET PLACE__')
    .setDescription(
      [
        'Vends et retrouve des articles.',
        '',
        'Publie une annonce ou crée une alerte : tu reçois un DM dès qu’un article correspondant est mis en vente.',
        'Tout est aussi disponible en slash commands (`/vendre`, `/rechercher`, `/annonces`…).',
        '',
        '**Quelques règles**',
        '• Aucun paiement ni échange privé sur le Discord.',
        '• Signale toute annonce suspecte au staff.',
        '',
        'Fallen Market Place et son équipe ne sont pas responsables des transactions.',
      ].join('\n')
    )
    .setFooter({ text: footer });
}

function listingConfirmEmbed(listing) {
  const embed = base()
    .setTitle('✅ Annonce publiée')
    .addFields(
      { name: 'Catégorie', value: getCategoryLabel(listing.category), inline: true },
      { name: 'Titre', value: listing.title, inline: true },
      { name: 'Prix', value: listing.price, inline: true }
    )
    .setFooter({ text: 'Les membres dont une alerte correspond à ton titre sont prévenus en DM.' })
    .setTimestamp(new Date(listing.createdAt));
  if (listing.link) embed.addFields({ name: 'Lien', value: listing.link });
  return embed;
}

function searchConfirmEmbed(search) {
  const keywords = search.keywords.length
    ? search.keywords.map((k) => `\`${k}\``).join(' ')
    : '_aucun : toute la catégorie_';
  return base()
    .setTitle('🔔 Alerte de recherche activée')
    .addFields(
      { name: 'Catégorie', value: getCategoryLabel(search.category), inline: true },
      { name: 'Ce que tu cherches', value: search.query || '—', inline: true },
      { name: 'Mots-clés utilisés pour le matching', value: keywords }
    )
    .setDescription(
      "Tu recevras un DM quand une annonce de cette catégorie contiendra ces mots dans son titre. Si des annonces correspondent déjà, tu les reçois tout de suite en DM."
    )
    .setTimestamp(new Date(search.createdAt));
}

function matchDmEmbed(listing, categoryLabel, search) {
  const embed = base()
    .setTitle("🖤 Quelqu'un vend un article que tu cherches !")
    .addFields(
      { name: 'Catégorie', value: categoryLabel, inline: true },
      { name: 'Article', value: listing.title, inline: true },
      { name: 'Prix', value: listing.price, inline: true }
    );
  if (listing.link) embed.addFields({ name: 'Lien', value: listing.link });
  embed
    .addFields(
      { name: 'Vendeur', value: `<@${listing.userId}> — ${listing.username} (\`${listing.userId}\`)` },
      { name: 'Ton alerte', value: search.query || 'Toute la catégorie' }
    )
    .setFooter({ text: "Contacte-le directement. Gère tes alertes avec /mes-recherches." })
    .setTimestamp();
  return embed;
}

function existingMatchesDmEmbed(search, listings, categoryLabel) {
  const { text, hidden } = joinWithinLimit(listings.map((l) => listingLine(l, { withSeller: true })));
  const embed = base()
    .setTitle(`🔔 ${listings.length} annonce(s) déjà en ligne pour ta recherche`)
    .setDescription(`**${categoryLabel}** — ${search.query || 'toute la catégorie'}\n\n${text}`)
    .setTimestamp();
  if (hidden) embed.setFooter({ text: `+ ${hidden} autre(s) : utilise /annonces pour tout voir` });
  return embed;
}

function listEmbed(title, lines, emptyText) {
  const embed = base().setTitle(title);
  if (!lines.length) return embed.setDescription(emptyText);
  const { text, hidden } = joinWithinLimit(lines);
  embed.setDescription(text);
  if (hidden) embed.setFooter({ text: `+ ${hidden} autre(s) non affiché(s)` });
  return embed;
}

function myListingsEmbed(listings) {
  return listEmbed(
    '🛒 Mes annonces',
    listings.map((l) => listingLine(l, { withCategory: true })),
    "Tu n'as encore publié aucune annonce."
  );
}

function mySearchesEmbed(searches) {
  return listEmbed(
    '🔍 Mes recherches',
    searches.map((s) => `**${getCategoryLabel(s.category)}** — ${s.query || 'toute la catégorie'}`),
    "Tu n'as encore activé aucune alerte de recherche."
  );
}

function allListingsEmbed(listings, categoryValue) {
  const title = categoryValue ? `🖤 Annonces — ${getCategoryLabel(categoryValue)}` : '🖤 Toutes les annonces';
  return listEmbed(
    title,
    listings.map((l) => listingLine(l, { withCategory: !categoryValue, withSeller: true })),
    "Aucune annonce en cours pour l'instant."
  );
}

module.exports = {
  panelEmbed,
  listingConfirmEmbed,
  searchConfirmEmbed,
  matchDmEmbed,
  existingMatchesDmEmbed,
  myListingsEmbed,
  mySearchesEmbed,
  allListingsEmbed,
};
