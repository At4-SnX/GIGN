// ============================================================================
//  GIGN RP — BOT D'ARRIVÉE / DÉPART
//  - Envoie une image + un message à chaque arrivée / départ
//  - Se connecte automatiquement en statut "Inactif" avec un lien en statut
//  - Annonce en TTS (vocal) quand un membre du serveur Bordeaux RP lance un stream
//  - Toute la configuration se trouve dans config.js et .env
// ============================================================================

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  AttachmentBuilder,
  ActivityType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  REST,
  Routes,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const config = require('./config');

// ----------------------------------------------------------------------------
// Petite base de données locale (JSON) pour retenir le message TTS choisi
// même après un redémarrage du bot sur Railway.
// ----------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');

function loadSettings() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(SETTINGS_PATH)) {
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify({ ttsMessage: config.DEFAULT_TTS_MESSAGE }, null, 2));
    }
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
  } catch (err) {
    console.error('Impossible de charger data/settings.json, valeur par défaut utilisée.', err);
    return { ttsMessage: config.DEFAULT_TTS_MESSAGE };
  }
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

let settings = loadSettings();

// Empêche d'annoncer le même stream en boucle : on retient les membres déjà annoncés
const alreadyAnnounced = new Set();

// ----------------------------------------------------------------------------
// Client Discord
// ----------------------------------------------------------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,     // requis pour arrivée / départ (intent privilégié)
    GatewayIntentBits.GuildPresences,   // requis pour détecter les streams (intent privilégié)
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.GuildMember],
});

// ----------------------------------------------------------------------------
// Connexion + statut automatique
// ----------------------------------------------------------------------------
client.once('ready', async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  client.user.setPresence({
    status: config.PRESENCE_STATUS, // 'idle' => pastille "Inactif" / en attente
    activities: [
      {
        name: 'Custom Status',
        type: ActivityType.Custom,
        state: config.STATUS_TEXT, // 🔗discord.gg/bordeauxrp
      },
    ],
  });

  await registerSlashCommands();
});

// ----------------------------------------------------------------------------
// Arrivée d'un membre
// ----------------------------------------------------------------------------
client.on('guildMemberAdd', async (member) => {
  try {
    const channel = member.guild.channels.cache.get(config.ARRIVAL_CHANNEL_ID);
    if (!channel) return console.warn('⚠️ Salon d\'arrivée introuvable, vérifie ARRIVAL_CHANNEL_ID.');

    const attachment = new AttachmentBuilder(path.join(__dirname, config.ARRIVAL_IMAGE_PATH), {
      name: 'arrivee-gign.png',
    });

    // Le customId embarque l'ID de la recrue, pour savoir à qui envoyer le MP
    // quand quelqu'un clique sur le bouton.
    const helloButton = new ButtonBuilder()
      .setCustomId(`say-hello:${member.id}`)
      .setLabel(config.HELLO_BUTTON_LABEL)
      .setStyle(ButtonStyle.Success);

    const container = new ContainerBuilder()
      .setAccentColor(parseInt(config.ARRIVAL_COLOR.replace('#', ''), 16))
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ${config.ARRIVAL_TITLE}\n${config.ARRIVAL_MESSAGE.replace('{user}', `<@${member.id}>`)}`
        )
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL('attachment://arrivee-gign.png')
            .setDescription('Logo GIGN')
        )
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${config.ARRIVAL_FOOTER}`))
      .addActionRowComponents(new ActionRowBuilder().addComponents(helloButton));

    await channel.send({
      components: [container],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message d\'arrivée :', err);
  }
});

// ----------------------------------------------------------------------------
// Départ d'un membre
// ----------------------------------------------------------------------------
client.on('guildMemberRemove', async (member) => {
  try {
    const channel = member.guild.channels.cache.get(config.DEPARTURE_CHANNEL_ID);
    if (!channel) return console.warn('⚠️ Salon de départ introuvable, vérifie DEPARTURE_CHANNEL_ID.');

    const embed = new EmbedBuilder()
      .setTitle(config.DEPARTURE_TITLE)
      .setDescription(config.DEPARTURE_MESSAGE.replace('{user}', member.user?.tag ?? 'Un membre'))
      .setColor(config.DEPARTURE_COLOR)
      .setFooter({ text: config.DEPARTURE_FOOTER })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    alreadyAnnounced.delete(member.id);
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message de départ :', err);
  }
});

// ----------------------------------------------------------------------------
// Détection du stream + message TTS (uniquement sur le serveur Bordeaux RP)
// ----------------------------------------------------------------------------
client.on('presenceUpdate', async (oldPresence, newPresence) => {
  try {
    if (!newPresence?.guild || newPresence.guild.id !== config.GUILD_ID) return;

    const wasStreaming = oldPresence?.activities?.some((a) => a.type === ActivityType.Streaming);
    const isStreaming = newPresence.activities?.some((a) => a.type === ActivityType.Streaming);

    if (isStreaming && !wasStreaming && !alreadyAnnounced.has(newPresence.userId)) {
      alreadyAnnounced.add(newPresence.userId);

      const channel = newPresence.guild.channels.cache.get(config.STREAM_CHANNEL_ID);
      if (!channel) return console.warn('⚠️ Salon de stream introuvable, vérifie STREAM_CHANNEL_ID.');

      const member = newPresence.member;
      const text = settings.ttsMessage.replace('{user}', member?.displayName ?? 'Un membre');

      await channel.send({ content: text, tts: true });
    }

    if (!isStreaming && wasStreaming) {
      alreadyAnnounced.delete(newPresence.userId);
    }
  } catch (err) {
    console.error('Erreur lors de la détection de stream :', err);
  }
});

// ----------------------------------------------------------------------------
// Commande /tts-message pour changer le message TTS sans toucher au code
// ----------------------------------------------------------------------------
async function registerSlashCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('tts-message')
      .setDescription('Modifie le message vocal (TTS) annoncé quand un membre lance un stream')
      .addStringOption((option) =>
        option
          .setName('message')
          .setDescription('Utilise {user} pour insérer le pseudo. Laisse vide pour voir le message actuel.')
          .setRequired(false)
      ),
  ];

  const rest = new REST({ version: '10' }).setToken(config.TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, config.GUILD_ID), { body: commands });
    console.log('✅ Commande /tts-message enregistrée sur le serveur.');
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement des commandes :', err);
  }
}

client.on('interactionCreate', async (interaction) => {
  // --- Bouton "Dire bonjour" sous le message d'arrivée -----------------------
  if (interaction.isButton() && interaction.customId.startsWith('say-hello:')) {
    const targetId = interaction.customId.split(':')[1];

    if (targetId === interaction.user.id) {
      return interaction.reply({ content: '😄 Tu ne peux pas te dire bonjour à toi-même !', ephemeral: true });
    }

    try {
      const targetMember = await interaction.guild.members.fetch(targetId);
      const text = config.HELLO_DM_MESSAGE
        .replace('{clicker}', interaction.member.displayName)
        .replace('{guild}', interaction.guild.name);

      await targetMember.send(text);
      await interaction.reply({ content: `✅ Tu as dit bonjour à **${targetMember.displayName}** !`, ephemeral: true });
    } catch (err) {
      console.error('Erreur lors de l\'envoi du MP "Dire bonjour" :', err);
      await interaction.reply({
        content: '❌ Impossible d\'envoyer le MP (la personne a peut-être quitté le serveur ou bloqué ses MP).',
        ephemeral: true,
      });
    }
    return;
  }

  // --- Commande /tts-message --------------------------------------------------
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'tts-message') return;

  const hasPermission =
    interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
    (config.TTS_ADMIN_ROLE_ID && interaction.member.roles.cache.has(config.TTS_ADMIN_ROLE_ID));

  if (!hasPermission) {
    return interaction.reply({ content: '❌ Tu n\'as pas la permission de modifier ce message.', ephemeral: true });
  }

  const newMessage = interaction.options.getString('message');

  if (!newMessage) {
    return interaction.reply({ content: `Message TTS actuel :\n> ${settings.ttsMessage}`, ephemeral: true });
  }

  settings.ttsMessage = newMessage;
  saveSettings(settings);

  await interaction.reply({ content: `✅ Nouveau message TTS enregistré :\n> ${newMessage}`, ephemeral: true });
});

client.login(config.TOKEN);
