// ============================================================
// LOGIQUE MÉTIER
// Utilisée à la fois par les boutons du panneau et par les slash commands,
// pour qu'il n'y ait qu'une seule version de chaque règle.
// ============================================================

const { randomUUID } = require('crypto');
const store = require('../data/store');
const { getCategory, getCategoryLabel } = require('../config/categories');
const { extractKeywords, listingMatchesSearch } = require('./matching');
const { matchDmEmbed, existingMatchesDmEmbed } = require('../ui/embeds');

const MAX_LISTINGS_PER_USER = 25;
const MAX_SEARCHES_PER_USER = 10;

class MarketError extends Error {}

function cleanLink(raw) {
  const link = String(raw || '').trim();
  if (!link) return '';
  try {
    const url = new URL(link);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error();
    return url.toString();
  } catch {
    throw new MarketError('Le lien doit commencer par https:// (ou laisse le champ vide).');
  }
}

function assertCategory(category) {
  if (!getCategory(category)) throw new MarketError('Catégorie invalide.');
}

function isAdmin(interaction) {
  return Boolean(interaction.memberPermissions?.has('ManageGuild'));
}

// ---------- Annonces ----------

async function createListing(interaction, { category, title, price, link }) {
  assertCategory(category);
  const user = interaction.user;
  if (store.getListings({ userId: user.id }).length >= MAX_LISTINGS_PER_USER) {
    throw new MarketError(`Tu as atteint la limite de ${MAX_LISTINGS_PER_USER} annonces. Supprime-en une d'abord.`);
  }

  const listing = store.addListing({
    id: randomUUID(),
    userId: user.id,
    username: user.tag,
    category,
    title: String(title).trim(),
    price: String(price).trim(),
    link: cleanLink(link),
    createdAt: Date.now(),
  });

  // Les DM partent en arrière-plan : la réponse à l'utilisateur n'attend pas.
  notifyMatchingSearches(interaction.client, listing).catch((err) =>
    console.error('Erreur notifications annonce :', err)
  );
  return listing;
}

function deleteListing(interaction, listingId) {
  const listing = store.getListingById(listingId);
  if (!listing) throw new MarketError("Cette annonce n'existe plus.");
  if (listing.userId !== interaction.user.id && !isAdmin(interaction)) {
    throw new MarketError('Tu ne peux supprimer que tes propres annonces.');
  }
  store.removeListing(listing.id);
  return listing;
}

// Annonces que l'utilisateur a le droit de supprimer
function deletableListings(interaction) {
  return isAdmin(interaction) ? store.getAllListings() : store.getListings({ userId: interaction.user.id });
}

// ---------- Recherches ----------

async function createSearch(interaction, { category, query }) {
  assertCategory(category);
  const user = interaction.user;
  if (store.getSearches({ userId: user.id }).length >= MAX_SEARCHES_PER_USER) {
    throw new MarketError(`Tu as atteint la limite de ${MAX_SEARCHES_PER_USER} alertes. Supprimes-en une d'abord.`);
  }

  const search = store.addSearch({
    id: randomUUID(),
    userId: user.id,
    username: user.tag,
    category,
    query: String(query).trim(),
    keywords: extractKeywords(query),
    active: true,
    createdAt: Date.now(),
  });

  notifyExistingListings(interaction.client, search).catch((err) =>
    console.error('Erreur notifications recherche :', err)
  );
  return search;
}

function deleteSearch(interaction, searchId) {
  const search = store.getSearchById(searchId);
  if (!search || search.userId !== interaction.user.id) {
    throw new MarketError("Cette alerte n'existe plus.");
  }
  store.removeSearch(search.id);
  return search;
}

// ---------- Notifications ----------

async function sendDm(client, userId, payload) {
  try {
    const user = await client.users.fetch(userId);
    await user.send(payload);
    return true;
  } catch (err) {
    // DM fermés ou utilisateur introuvable
    console.warn(`DM impossible vers ${userId} : ${err.message}`);
    return false;
  }
}

// Nouvelle annonce -> un seul DM par personne dont une alerte correspond vraiment.
async function notifyMatchingSearches(client, listing) {
  const recipients = new Map(); // userId -> recherche qui a matché
  for (const search of store.getSearches({ category: listing.category, activeOnly: true })) {
    if (search.userId === listing.userId) continue;
    if (!recipients.has(search.userId) && listingMatchesSearch(listing, search)) {
      recipients.set(search.userId, search);
    }
  }

  const label = getCategoryLabel(listing.category);
  for (const [userId, search] of recipients) {
    await sendDm(client, userId, { embeds: [matchDmEmbed(listing, label, search)] });
  }
  return recipients.size;
}

// Nouvelle alerte -> un seul DM récapitulant les annonces déjà en ligne qui correspondent.
async function notifyExistingListings(client, search) {
  const matches = store
    .getListings({ category: search.category })
    .filter((l) => l.userId !== search.userId && listingMatchesSearch(l, search));

  if (matches.length) {
    await sendDm(client, search.userId, {
      embeds: [existingMatchesDmEmbed(search, matches, getCategoryLabel(search.category))],
    });
  }
  return matches.length;
}

module.exports = {
  MarketError,
  isAdmin,
  createListing,
  deleteListing,
  deletableListings,
  createSearch,
  deleteSearch,
};
