# Fallen Market Place — bot Discord

Bot de marketplace : les membres publient des annonces (titre, prix, lien Vinted)
et créent des alertes de recherche. Quand une annonce correspond vraiment à une
alerte, l'auteur de l'alerte reçoit un DM avec le vendeur.

## Fonctionnalités

- **Panneau** (`/market-panel`) avec boutons : vendre, rechercher, mes annonces,
  mes recherches, toutes les annonces, supprimer une annonce, supprimer une alerte.
- **Slash commands** : tout est aussi faisable sans le panneau.
- **Matching par mots-clés** : une alerte « hoodie noir » ne déclenche un DM que
  si le titre de l'annonce contient ces mots (accents, casse, pluriels et tailles
  en lettres ignorés). 1-2 mots-clés : tous requis ; 3 ou plus : 2/3 requis.
  `*` comme recherche = toute la catégorie.
- Un seul DM par personne et par annonce, même avec plusieurs alertes qui matchent.
- En créant une alerte, tu reçois **un** DM récapitulant les annonces déjà en ligne qui correspondent.
- **Stockage persistant** sur volume Railway, avec sauvegardes automatiques avant
  chaque import et commandes de backup/restauration.

## Slash commands

| Commande | Qui | Rôle |
|---|---|---|
| `/vendre categorie titre prix [lien]` | tous | Publier une annonce |
| `/rechercher categorie recherche` | tous | Créer une alerte |
| `/annonces [categorie]` | tous | Voir les annonces en cours |
| `/mes-annonces` · `/mes-recherches` | tous | Voir les siennes |
| `/supprimer-annonce annonce` | tous (modos : toutes) | Supprimer, avec autocomplétion |
| `/supprimer-recherche alerte` | tous | Supprimer une alerte |
| `/market-panel` | Gérer le serveur | Poster le panneau |
| `/market-backup` | Gérer le serveur | Télécharger la base complète |
| `/market-restore fichier [mode]` | Gérer le serveur | Importer un db.json (fusion ou remplacement) |

Limites par membre : 25 annonces, 10 alertes (modifiables en haut de `src/services/market.js`).

## Installation locale

```bash
npm install
cp .env.example .env   # remplis DISCORD_TOKEN et CLIENT_ID
npm start
npm test               # tests du matching et du stockage
```

Les commandes sont enregistrées automatiquement au démarrage. Renseigne `GUILD_ID`
en dev pour qu'elles apparaissent instantanément (sinon jusqu'à 1h en global).

## Déploiement Railway sans perte de données

1. Dans le service Railway : **Settings → Volumes → New Volume**, monté sur `/app/data`.
   Le bot détecte le volume tout seul (`RAILWAY_VOLUME_MOUNT_PATH`), rien d'autre à configurer.
2. Variables : `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID` (optionnel), `CREDIT_FOOTER` (optionnel).
3. À chaque démarrage, les logs indiquent où sont les données et combien d'annonces
   ont été chargées. Sans volume, un avertissement s'affiche.

L'ancien format de `db.json` est migré automatiquement. Les 10 dernières
sauvegardes sont gardées dans `backups/` sur le volume.

## Modifier les catégories

Tout se passe dans `src/config/categories.js`. Ne change pas le `value` d'une
catégorie qui a déjà des annonces (c'est lui qui est stocké en base).

## Structure

```
src/
  index.js                 point d'entrée
  deploy-commands.js       enregistrement des slash commands (npm run register)
  config/categories.js     liste des catégories
  data/store.js            stockage JSON persistant, migration, backup/import
  services/matching.js     matching annonce <-> recherche
  services/market.js       logique métier partagée (création, suppression, DM)
  commands/                une slash command par fichier + index.js
  handlers/                routeur + boutons, menus, modals
  ui/                      embeds et composants
  utils/reply.js           réponses éphémères
test/                      tests (node --test)
```
