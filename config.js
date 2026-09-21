// ============================================================================
//  CONFIG.JS — Tout ce qu'il y a à modifier se trouve dans ce fichier.
//  Les valeurs sensibles (token, IDs) viennent du fichier .env (voir .env.example)
// ============================================================================

module.exports = {
  // --- Discord ------------------------------------------------------------
  TOKEN: process.env.DISCORD_TOKEN,

  // ID du serveur "Bordeaux RP" (clic droit sur le serveur > Copier l'ID)
  GUILD_ID: process.env.GUILD_ID,

  // --- Salons (clic droit sur le salon > Copier l'ID) ----------------------
  ARRIVAL_CHANNEL_ID: process.env.ARRIVAL_CHANNEL_ID,     // salon des arrivées
  DEPARTURE_CHANNEL_ID: process.env.DEPARTURE_CHANNEL_ID, // salon des départs
  STREAM_CHANNEL_ID: process.env.STREAM_CHANNEL_ID,       // salon où le message TTS de stream est envoyé

  // --- Statut du bot --------------------------------------------------------
  // Le bot se connecte en "Inactif" (petite pastille orange = "en attente / support")
  PRESENCE_STATUS: 'idle', // 'online' | 'idle' | 'dnd' | 'invisible'
  STATUS_TEXT: '🔗discord.gg/bordeauxrp',

  // --- Message d'arrivée (Components V2) -------------------------------------
  ARRIVAL_IMAGE_PATH: './assets/arrivee-gign.png', // image envoyée à chaque arrivée
  ARRIVAL_TITLE: '🪖 Nouvelle recrue — GIGN',
  ARRIVAL_MESSAGE: 'Bienvenue {user} au sein du **GIGN** !\nMerci de suivre la procédure d\'intégration en attendant votre prise en charge.',
  ARRIVAL_COLOR: '#0b2545', // bleu GIGN (couleur d'accent du Container)
  ARRIVAL_FOOTER: 'Gendarmerie Nationale — GIGN RP',

  // Bouton "Dire bonjour" affiché sous le message d'arrivée
  HELLO_BUTTON_LABEL: '👋 Dire bonjour',
  // Message envoyé en MP à la nouvelle recrue quand quelqu'un clique sur le bouton
  // {clicker} = pseudo de la personne qui clique, {guild} = nom du serveur
  HELLO_DM_MESSAGE:
    '👋 **{clicker}** vous a dit bonjour sur **{guild}** !\nN\'hésitez pas à aller lui répondre pour faire connaissance 😊',

  // --- Message de départ -------------------------------------------------
  DEPARTURE_TITLE: '📤 Départ — GIGN',
  DEPARTURE_MESSAGE: '{user} a quitté le serveur.',
  DEPARTURE_COLOR: '#8b0000',
  DEPARTURE_FOOTER: 'Gendarmerie Nationale — GIGN RP',

  // --- TTS Stream (annonce vocale quand un membre passe en direct) --------
  // {user} est remplacé automatiquement par le pseudo du membre
  DEFAULT_TTS_MESSAGE: '{user} est en direct sur Bordeaux RP, venez le soutenir !',

  // Rôle autorisé à changer le message TTS avec la commande /tts-message
  // (laisser vide "" pour n'autoriser que les administrateurs du serveur)
  TTS_ADMIN_ROLE_ID: process.env.TTS_ADMIN_ROLE_ID || '',
};
