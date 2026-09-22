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

  // Salon vocal dans lequel le bot reste connecté en permanence
  // (clic droit sur le salon VOCAL > Copier l'ID)
  SUPPORT_VOICE_CHANNEL_ID: process.env.SUPPORT_VOICE_CHANNEL_ID,

  // Salon TEXTE dans lequel le bot envoie un message TTS (vocal) quand il se connecte
  // (clic droit sur le salon TEXTE > Copier l'ID)
  TTS_CHANNEL_ID: process.env.TTS_CHANNEL_ID,
  // Message envoyé avec le flag "TTS" (lu à voix haute pour les membres qui ont
  // l'option "Autoriser la lecture des messages TTS" activée dans ce salon)
  // {user} = pseudo du membre qui vient de rejoindre le vocal support
  TTS_MESSAGE: '{user} vient de rejoindre le salon d\'attente support. Un <@&1509884272801087598> va le prendre en charge.',

  // --- Statut du bot ----------------------------------------------------------
  // Le bot se connecte en ligne, avec une activité de type "En direct" (Streaming).
  PRESENCE_STATUS: 'online', // 'online' | 'idle' | 'dnd' | 'invisible'
  STATUS_TEXT: '🔗discord.gg/bordeauxrp', // texte affiché à côté du statut "En direct"
  // ⚠️ Limitation propre à Discord : le badge violet "En direct" (Streaming) ne
  // s'affiche vraiment que si cette URL pointe vers twitch.tv ou youtube.com.
  // Avec un autre lien (comme un lien d'invitation Discord), Discord peut
  // retomber sur un statut classique "Joue à ...". Mets ici un vrai lien
  // Twitch/YouTube si tu veux garantir le badge "En direct".
  STREAM_URL: process.env.STREAM_URL || 'https://discord.gg/bordeauxrp',

  // --- Image utilisée pour les arrivées ET les départs ------------------------
  GIGN_IMAGE_PATH: './assets/arrivee-gign.png',

  // --- Message d'arrivée (Components V2) -------------------------------------
  ARRIVAL_TITLE: '<:GIGN:1551745365810745374> - ARRIVANT',
  ARRIVAL_MESSAGE:
    '## <:Blue_fleche:1551746443713318942> Bienvenue au sein du GIGN, {user}.\n\n' +
    'Votre arrivée vient d\'être enregistrée par nos services. Le GIGN est une unité d\'élite exigeante : ' +
    'la discipline, la rigueur et l\'esprit de corps en sont les fondements. Chaque nouvelle recrue est ' +
    'accueillie avec la même attention et devra en retour se montrer digne des valeurs de l\'unité.\n\n' +
    '**Avant votre prise de fonction, merci de :**\n' +
    '- Prendre connaissance du règlement intérieur du serveur ;\n' +
    '- passez vos concours ;\n' +
    '- intégrer la famille qu\'est le GIGN !\n\n' +
    'Soyez fier de rejoindre nos rangs. **Honneur et Patrie.**',
  ARRIVAL_COLOR: '#1c2938', // bleu GIGN (couleur d'accent du Container)
  ARRIVAL_FOOTER: '<:GIGN:1551745365810745374> - Gendarmerie Nationale — GIGN',

  // Bouton "Dire bonjour" affiché sous le message d'arrivée
  HELLO_BUTTON_LABEL: '👋 Saluer !',
  // Message envoyé en MP à la nouvelle recrue quand quelqu'un clique sur le bouton
  // {clicker} = pseudo de la personne qui clique, {guild} = nom du serveur
  HELLO_DM_MESSAGE:
    '<:GIGN:1551745365810745374> - `{clicker} vous a dit bonjour sur **{guild}** !`\n`N\'hésitez pas à aller lui répondre pour faire connaissance !`',

  // --- Message de départ (Components V2) --------------------------------------
  DEPARTURE_TITLE: '<:GIGN:1551745365810745374> - DEPART',
  DEPARTURE_MESSAGE:
    '## <:Design_sans_titre__4_removebgpre:1551746757782929469> **{user}** a quitté nos rangs.\n\n' +
    'Conformément au protocole administratif en vigueur, son dossier a été clôturé et l\'ensemble de ses ' +
    'accréditations révoquées avec effet immédiat. L\'accès aux ressources internes de l\'unité lui est ' +
    'désormais retiré.\n\n' +
    'Nous saluons les services rendus au sein du GIGN durant sa présence parmi nous et lui souhaitons ' +
    'bonne continuation dans ses projets futurs.\n\n' +
    '*Que l\'honneur du GIGN continue de guider ceux qui restent.*',
  DEPARTURE_COLOR: '#682828',
  DEPARTURE_FOOTER: '<:GIGN:1551745365810745374> - Gendarmerie Nationale — GIGN',
};
