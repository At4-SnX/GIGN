# 🪖 GIGN RP — Bot d'arrivée / départ

Bot Discord.js v14 prêt à déployer sur **Railway**.

## Ce que fait le bot

- **Arrivée** : envoie un message de bienvenue en **Components V2** (le nouveau format de mise en page de Discord) avec l'image du logo GIGN, et un bouton **👋 Dire bonjour** en dessous.
  - Quand quelqu'un clique sur ce bouton, la nouvelle recrue reçoit un **MP** : *"{clicker} vous a dit bonjour sur {guild} !"*.
- **Départ** : envoie un message dans le salon des départs.
- **Statut automatique** : se connecte en **Inactif** (pastille d'attente) avec comme statut personnalisé `🔗discord.gg/bordeauxrp`.
- **Annonce vocale (TTS)** : quand un membre du serveur Bordeaux RP lance un stream, le bot envoie un message TTS dans le salon configuré. Le texte est modifiable à tout moment avec la commande `/tts-message`, sans toucher au code.

## 1. Modifier le bot (tout est dans `config.js`)

Ouvre `config.js` : titres, couleurs, textes d'arrivée/départ, image, message TTS par défaut. Rien n'est codé en dur ailleurs — c'est le seul fichier à éditer pour changer les textes.

Pour changer l'image d'arrivée : remplace `assets/arrivee-gign.png` par ta propre image (même nom, ou change `ARRIVAL_IMAGE_PATH` dans `config.js`).

## 2. Créer l'application Discord

1. Va sur https://discord.com/developers/applications → **New Application**.
2. Onglet **Bot** → **Reset Token** → copie le token (à mettre dans `DISCORD_TOKEN`).
3. Toujours dans l'onglet **Bot**, active les deux intents privilégiés :
   - **Server Members Intent** (nécessaire pour les arrivées/départs)
   - **Presence Intent** (nécessaire pour détecter les streams)
4. Onglet **OAuth2 → URL Generator** : coche `bot` + `applications.commands`, permissions `Send Messages`, `Embed Links`, `Attach Files`, `Use Voice Activity`/`Send TTS Messages`, puis invite le bot sur ton serveur avec le lien généré.

## 3. Récupérer les IDs

Active le **Mode développeur** (Discord → Paramètres → Avancés), puis clic droit :
- sur le serveur → Copier l'ID → `GUILD_ID`
- sur le salon des arrivées → Copier l'ID → `ARRIVAL_CHANNEL_ID`
- sur le salon des départs → Copier l'ID → `DEPARTURE_CHANNEL_ID`
- sur le salon des annonces de stream → Copier l'ID → `STREAM_CHANNEL_ID`

## 4. Déployer sur Railway

1. Crée un nouveau projet Railway → **Deploy from GitHub repo** (ou upload direct du dossier).
2. Dans l'onglet **Variables**, ajoute les variables du fichier `.env.example` (jamais le fichier `.env` lui-même).
3. Railway détecte automatiquement `package.json` et lance `npm install` puis `npm start`.
4. (Recommandé) Ajoute un **Volume** monté sur `/app/data` pour que le message TTS choisi via `/tts-message` survive aux redéploiements.

## 5. Test en local (optionnel)

```bash
npm install
cp .env.example .env   # puis remplis les valeurs
npm start
```

## Notes

- Le fichier `.env` et `data/settings.json` sont ignorés par Git (`.gitignore`) — ne les commit jamais.
- Pour changer le message TTS : `/tts-message message: {user} vient de lancer un live !` (réservé aux admins, ou au rôle défini par `TTS_ADMIN_ROLE_ID`).
- Le bouton "Dire bonjour" nécessite que la nouvelle recrue ait ses **MP ouverts** (paramètres de confidentialité du serveur) — sinon le bot prévient la personne qui a cliqué que le MP n'a pas pu être envoyé.
- Le message de MP est modifiable dans `config.js` → `HELLO_DM_MESSAGE` (utilise `{clicker}` et `{guild}`).
