# Market Lucid — Bot Discord

Bot de petites annonces (via Vinted) avec alertes DM automatiques.

## ⚠️ Avant toute chose

Le token que tu as collé dans le chat est grillé. Va sur le
[portail développeur Discord](https://discord.com/developers/applications) →
ton appli → **Bot** → **Reset Token**, et utilise le nouveau token ci-dessous.
Ne colle **jamais** un token dans un fichier suivi par git (`.env` est déjà
ignoré via `.gitignore`).

## Fonctionnalités

- Panneau avec 4 boutons : **Vendre un article**, **Rechercher un article**,
  **Mes annonces**, **Mes recherches**.
- Choix de catégorie par menu déroulant (modifiable dans
  `src/config/categories.js`).
- Publier une annonce = titre + lien Vinted (via une fenêtre modale).
- Créer une alerte de recherche = catégorie + description de ce que tu cherches.
- **Dès que quelqu'un publie une annonce dans une catégorie où tu as une
  alerte active, tu reçois un DM avec le pseudo et l'ID Discord du vendeur.**
- Stockage simple en fichier JSON (`data/db.json`), pas de base de données
  externe à configurer.

## Installation locale

```bash
npm install
cp .env.example .env
# remplis DISCORD_TOKEN et CLIENT_ID dans .env
npm start
```

Le bot enregistre automatiquement la commande `/market-panel` au démarrage.
Renseigne `GUILD_ID` dans `.env` pendant le développement pour que la
commande apparaisse instantanément sur ton serveur (sinon ça peut prendre
jusqu'à 1h en enregistrement global).

Une fois le bot en ligne, tape `/market-panel` dans le salon voulu (droits
"Gérer le serveur" requis) pour poster le panneau.

## Modifier les catégories

Tout se passe dans `src/config/categories.js` — ajoute, renomme ou retire
une entrée de la liste `CATEGORIES`, rien d'autre à toucher.

## Déploiement sur Railway (via GitHub)

1. Crée un repo GitHub et pousse ce dossier (le `.gitignore` protège déjà
   `.env` et `node_modules`).
2. Sur [railway.app](https://railway.app), **New Project → Deploy from GitHub repo**.
3. Dans l'onglet **Variables** du service Railway, ajoute :
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID` (optionnel)
   - `CREDIT_FOOTER` (optionnel)
4. Railway détecte `npm start` automatiquement via `package.json`.

### ⚠️ Persistance des données sur Railway

Le système de fichiers de Railway est **éphémère** par défaut : un
redéploiement efface `data/db.json`, donc les annonces/alertes en cours
seraient perdues. Pour du stable, ajoute un **Volume** Railway monté sur
`/app/data`, ou migre `src/data/store.js` vers une vraie base (Postgres,
que Railway propose en un clic) le jour où le nombre d'annonces grossit.

## Structure

```
src/
  index.js                 point d'entrée
  config/categories.js     liste des catégories (à éditer)
  data/store.js            lecture/écriture JSON
  ui/embeds.js              tous les embeds
  ui/components.js         boutons, menus, modals
  handlers/interactions.js logique métier + matching + DM
  commands/register.js     enregistrement du slash command
```
