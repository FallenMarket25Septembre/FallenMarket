// ============================================================
// STOCKAGE JSON PERSISTANT
//
// Dossier des données, par ordre de priorité :
//   1. DATA_DIR (variable d'env, si tu veux forcer un chemin)
//   2. RAILWAY_VOLUME_MOUNT_PATH (défini automatiquement par Railway quand
//      un volume est attaché au service)
//   3. ./data à la racine du projet (dev local)
//
// La base est gardée en mémoire et réécrite de façon atomique à chaque
// modification. Un fichier db.json de l'ancien format est migré au démarrage.
// ============================================================

const fs = require('fs');
const path = require('path');
const { extractKeywords } = require('../services/matching');

const SCHEMA_VERSION = 2;
const LEGACY_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_DIR = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || LEGACY_DIR;
const DB_PATH = path.join(DATA_DIR, 'db.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const MAX_BACKUPS = 10;

let db = null;

function emptyDb() {
  return { version: SCHEMA_VERSION, listings: [], searches: [] };
}

// Met n'importe quelle version (v1 sans champ "version", ou import manuel)
// au format actuel, sans perdre de données.
function migrate(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Contenu JSON invalide.');
  if (!Array.isArray(raw.listings) || !Array.isArray(raw.searches)) {
    throw new Error('Le fichier doit contenir les tableaux "listings" et "searches".');
  }

  const listings = raw.listings
    .filter((l) => l && l.id && l.userId && l.title)
    .map((l) => ({
      id: String(l.id),
      userId: String(l.userId),
      username: l.username || 'inconnu',
      category: l.category || 'autre',
      title: String(l.title),
      price: l.price ? String(l.price) : 'Non précisé',
      link: l.link || '',
      createdAt: Number(l.createdAt) || Date.now(),
    }));

  const searches = raw.searches
    .filter((s) => s && s.id && s.userId)
    .map((s) => ({
      id: String(s.id),
      userId: String(s.userId),
      username: s.username || 'inconnu',
      category: s.category || 'autre',
      query: String(s.query || ''),
      keywords: extractKeywords(s.query), // recalculés si l'algo de matching évolue
      active: s.active !== false,
      createdAt: Number(s.createdAt) || Date.now(),
    }));

  return { version: SCHEMA_VERSION, listings, searches };
}

function writeFileAtomic(file, data) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function persist() {
  writeFileAtomic(DB_PATH, db);
}

function init() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Premier démarrage sur un volume : on récupère l'éventuel db.json local.
  const legacyPath = path.join(LEGACY_DIR, 'db.json');
  if (!fs.existsSync(DB_PATH) && DATA_DIR !== LEGACY_DIR && fs.existsSync(legacyPath)) {
    fs.copyFileSync(legacyPath, DB_PATH);
    console.log(`📦 db.json existant copié vers ${DB_PATH}`);
  }

  if (fs.existsSync(DB_PATH)) {
    db = migrate(JSON.parse(fs.readFileSync(DB_PATH, 'utf8')));
  } else {
    db = emptyDb();
  }
  persist();

  console.log(`💾 Données : ${DB_PATH} (${db.listings.length} annonce(s), ${db.searches.length} recherche(s))`);
  if (process.env.RAILWAY_ENVIRONMENT && !process.env.RAILWAY_VOLUME_MOUNT_PATH && !process.env.DATA_DIR) {
    console.warn('⚠️ Aucun volume Railway détecté : les données seront perdues au prochain redéploiement.');
  }
}

function getDb() {
  if (!db) init();
  return db;
}

// ---------- Sauvegarde / restauration ----------

function backup(reason = 'manual') {
  getDb();
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(BACKUP_DIR, `db-${stamp}-${reason}.json`);
  writeFileAtomic(file, db);

  // Rotation : on garde les MAX_BACKUPS plus récentes
  const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json')).sort();
  for (const old of files.slice(0, Math.max(0, files.length - MAX_BACKUPS))) {
    fs.unlinkSync(path.join(BACKUP_DIR, old));
  }
  return file;
}

function exportJson() {
  return JSON.stringify(getDb(), null, 2);
}

/**
 * Importe un db.json (ancien ou nouveau format).
 * mode "merge"   : ajoute ce qui manque, garde l'existant (dédoublonné par id)
 * mode "replace" : remplace tout
 * Une sauvegarde de l'état actuel est faite avant.
 */
function importJson(text, mode = 'merge') {
  const incoming = migrate(JSON.parse(text));
  getDb();
  backup('before-import');

  if (mode === 'replace') {
    db = incoming;
  } else {
    const listingIds = new Set(db.listings.map((l) => l.id));
    const searchIds = new Set(db.searches.map((s) => s.id));
    db.listings.push(...incoming.listings.filter((l) => !listingIds.has(l.id)));
    db.searches.push(...incoming.searches.filter((s) => !searchIds.has(s.id)));
  }
  persist();
  return { listings: db.listings.length, searches: db.searches.length };
}

// ---------- Annonces ----------

function addListing(listing) {
  getDb().listings.push(listing);
  persist();
  return listing;
}

function getAllListings() {
  return [...getDb().listings].sort((a, b) => b.createdAt - a.createdAt);
}

function getListings({ userId, category } = {}) {
  return getAllListings().filter(
    (l) => (!userId || l.userId === userId) && (!category || l.category === category)
  );
}

function getListingById(id) {
  return getDb().listings.find((l) => l.id === id);
}

function removeListing(id) {
  const d = getDb();
  const before = d.listings.length;
  d.listings = d.listings.filter((l) => l.id !== id);
  if (d.listings.length === before) return false;
  persist();
  return true;
}

// ---------- Recherches ----------

function addSearch(search) {
  getDb().searches.push(search);
  persist();
  return search;
}

function getSearches({ userId, category, activeOnly = false } = {}) {
  return getDb()
    .searches.filter(
      (s) =>
        (!userId || s.userId === userId) &&
        (!category || s.category === category) &&
        (!activeOnly || s.active)
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}

function getSearchById(id) {
  return getDb().searches.find((s) => s.id === id);
}

function removeSearch(id) {
  const d = getDb();
  const before = d.searches.length;
  d.searches = d.searches.filter((s) => s.id !== id);
  if (d.searches.length === before) return false;
  persist();
  return true;
}

module.exports = {
  init,
  DB_PATH,
  backup,
  exportJson,
  importJson,
  addListing,
  getAllListings,
  getListings,
  getListingById,
  removeListing,
  addSearch,
  getSearches,
  getSearchById,
  removeSearch,
};
