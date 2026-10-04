// Registre des slash commands : ajoute un fichier dans ce dossier et
// référence-le ici, il sera enregistré auprès de Discord au démarrage.
const commands = [
  require('./vendre'),
  require('./rechercher'),
  require('./annonces'),
  require('./mes-annonces'),
  require('./mes-recherches'),
  require('./supprimer-annonce'),
  require('./supprimer-recherche'),
  require('./market-panel'),
  require('./market-backup'),
  require('./market-restore'),
];

const byName = new Map(commands.map((c) => [c.data.name, c]));

module.exports = { commands, byName };
