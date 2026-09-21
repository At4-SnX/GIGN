# 🪖 GIGN RP — Bot d'arrivée / départ

Bot Discord.js v14 prêt à déployer sur **Railway**.

## Ce que fait le bot

- **Arrivée** : message en **Components V2** (nouveau format de mise en page de Discord), texte long et sérieux, avec l'image du logo GIGN, et un bouton **👋 Dire bonjour** en dessous.
  - Quand quelqu'un clique sur ce bouton, la nouvelle recrue reçoit un **MP** : *"{clicker} vous a dit bonjour sur {guild} !"*.
- **Départ** : même mise en forme (Components V2), même image, texte long et sérieux, dans le salon des départs.
- **Vocal support permanent** : le bot rejoint un salon vocal dédié ("attente support") au démarrage et **reste connecté en permanence** — il se reconnecte tout seul en cas de coupure ou de déconnexion.
- **Annonce TTS** : quand un membre rejoint le salon vocal support, le bot envoie un message **TTS** (lu à voix haute) dans un salon texte dédié. Texte modifiable dans `config.js` → `TTS_MESSAGE` (utilise `{user}`).
- **Statut "En direct"** : le bot affiche une activité de type **Streaming** avec comme texte `🔗discord.gg/bordeauxrp`.
  - ⚠️ **Limitation Discord** : le badge violet "En direct" ne s'affiche vraiment que si le lien associé pointe vers **twitch.tv** ou **youtube.com**. Avec un lien `discord.gg`, Discord peut retomber sur un statut classique. Renseigne un vrai lien Twitch/YouTube dans `STREAM_URL` (`.env`) si tu veux garantir l'affichage du badge — le texte affiché (`STATUS_TEXT`) reste `🔗discord.gg/bordeauxrp` dans tous les cas.

## 1. Modifier le bot (tout est dans `config.js`)

Ouvre `config.js` : titres, couleurs, textes d'arrivée/départ, image, message du bouton, message du MP. Rien n'est codé en dur ailleurs — c'est le seul fichier à éditer pour changer les textes.

Pour changer l'image (utilisée pour l'arrivée ET le départ) : remplace `assets/arrivee-gign.png` par ta propre image (même nom, ou change `GIGN_IMAGE_PATH` dans `config.js`).

## 2. Créer l'application Discord

1. Va sur https://discord.com/developers/applications → **New Application**.
2. Onglet **Bot** → **Reset Token** → copie le token (à mettre dans `DISCORD_TOKEN`).
3. Toujours dans l'onglet **Bot**, active l'intent privilégié :
   - **Server Members Intent** (nécessaire pour les arrivées/départs)
4. Onglet **OAuth2 → URL Generator** : coche `bot` + `applications.commands`, permissions `Send Messages`, `Send TTS Messages`, `Embed Links`, `Attach Files`, `Connect`, `Speak` (pour rejoindre et rester dans le vocal), puis invite le bot sur ton serveur avec le lien généré.

## 3. Récupérer les IDs

Active le **Mode développeur** (Discord → Paramètres → Avancés), puis clic droit :
- sur le serveur → Copier l'ID → `GUILD_ID`
- sur le salon des arrivées → Copier l'ID → `ARRIVAL_CHANNEL_ID`
- sur le salon des départs → Copier l'ID → `DEPARTURE_CHANNEL_ID`
- sur le salon **vocal** d'attente support → Copier l'ID → `SUPPORT_VOICE_CHANNEL_ID`
- sur le salon **texte** où envoyer l'annonce TTS → Copier l'ID → `TTS_CHANNEL_ID`

## 4. Déployer sur Railway

1. Crée un nouveau projet Railway → **Deploy from GitHub repo** (ou upload direct du dossier).
2. Dans l'onglet **Variables**, ajoute les variables du fichier `.env.example` (jamais le fichier `.env` lui-même).
3. Railway détecte automatiquement `package.json` et lance `npm install` puis `npm start`.

## 5. Test en local (optionnel)

```bash
npm install
cp .env.example .env   # puis remplis les valeurs
npm start
```

## Notes

- Le fichier `.env` est ignoré par Git (`.gitignore`) — ne le commit jamais.
- Le bouton "Dire bonjour" nécessite que la nouvelle recrue ait ses **MP ouverts** — sinon le bot prévient la personne qui a cliqué que le MP n'a pas pu être envoyé.
- Le message de MP est modifiable dans `config.js` → `HELLO_DM_MESSAGE` (utilise `{clicker}` et `{guild}`).
- Si le bot est expulsé du salon vocal ou perd la connexion, il retente automatiquement de le rejoindre après quelques secondes — aucune action manuelle n'est nécessaire.
