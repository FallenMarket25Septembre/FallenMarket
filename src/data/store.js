const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ listings: [], searches: [] }, null, 2));
  }
}

function read() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function write(db) {
  ensureDb();
  // écriture atomique : on écrit dans un fichier temporaire puis on renomme
  const tmp = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

function addListing(listing) {
  const db = read();
  db.listings.push(listing);
  write(db);
  return listing;
}

function addSearch(search) {
  const db = read();
  db.searches.push(search);
  write(db);
  return search;
}

function getUserListings(userId) {
  return read().listings.filter((l) => l.userId === userId);
}

function getUserSearches(userId) {
  return read().searches.filter((s) => s.userId === userId);
}

function getActiveSearchesForCategory(category) {
  return read().searches.filter((s) => s.category === category && s.active);
}

function removeSearch(searchId, userId) {
  const db = read();
  const before = db.searches.length;
  db.searches = db.searches.filter((s) => !(s.id === searchId && s.userId === userId));
  write(db);
  return db.searches.length < before;
}

function removeListing(listingId, userId) {
  const db = read();
  const before = db.listings.length;
  db.listings = db.listings.filter((l) => !(l.id === listingId && l.userId === userId));
  write(db);
  return db.listings.length < before;
}

module.exports = {
  addListing,
  addSearch,
  getUserListings,
  getUserSearches,
  getActiveSearchesForCategory,
  removeSearch,
  removeListing,
};
