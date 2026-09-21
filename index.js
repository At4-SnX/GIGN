// ============================================================================
//  GIGN RP — BOT D'ARRIVÉE / DÉPART
//  - Message d'arrivée et de départ avec image, en Components V2
//  - Bouton "Dire bonjour" sous le message d'arrivée (envoie un MP à la recrue)
//  - Reste connecté en permanence sur un salon vocal d'attente support
//  - Statut du bot en "En direct" (Streaming) avec un lien configurable
//  - Toute la configuration se trouve dans config.js et .env
// ============================================================================

require('dotenv').config();
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  Partials,
  AttachmentBuilder,
  ActivityType,
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
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const config = require('./config');

// ----------------------------------------------------------------------------
// Client Discord
// ----------------------------------------------------------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // requis pour arrivée / départ (intent privilégié)
    GatewayIntentBits.GuildVoiceStates, // requis pour rejoindre le vocal support
  ],
  partials: [Partials.GuildMember],
});

// ----------------------------------------------------------------------------
// Connexion permanente au salon vocal d'attente support
// Le bot rejoint le salon et se reconnecte automatiquement en cas de coupure.
// ----------------------------------------------------------------------------
let voiceConnection = null;

async function connectToSupportVoiceChannel(guild) {
  if (!config.SUPPORT_VOICE_CHANNEL_ID) {
    return console.warn('⚠️ SUPPORT_VOICE_CHANNEL_ID non défini : le bot ne rejoint aucun salon vocal.');
  }

  try {
    voiceConnection = joinVoiceChannel({
      channelId: config.SUPPORT_VOICE_CHANNEL_ID,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true, // le bot n'a pas besoin d'entendre
      selfMute: true, // ni de parler : il occupe simplement le salon
    });

    voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        // Une simple coupure réseau ou un changement de région vocale se résout seul
        await Promise.race([
          entersState(voiceConnection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        // Vraie déconnexion (kick du salon, etc.) : on force une reconnexion propre
        voiceConnection.destroy();
      }
    });

    voiceConnection.on(VoiceConnectionStatus.Destroyed, () => {
      console.warn('🔌 Connexion vocale perdue, nouvelle tentative dans 5 secondes...');
      setTimeout(() => connectToSupportVoiceChannel(guild), 5_000);
    });

    await entersState(voiceConnection, VoiceConnectionStatus.Ready, 20_000);
    console.log('🎙️ Connecté en permanence au salon vocal d\'attente support.');
  } catch (err) {
    console.error('Erreur de connexion au vocal support, nouvelle tentative dans 10 secondes...', err);
    setTimeout(() => connectToSupportVoiceChannel(guild), 10_000);
  }
}

// ----------------------------------------------------------------------------
// Connexion + statut automatique
// ----------------------------------------------------------------------------
client.once('ready', async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  client.user.setPresence({
    status: config.PRESENCE_STATUS,
    activities: [
      {
        name: config.STATUS_TEXT, // 🔗discord.gg/bordeauxrp
        type: ActivityType.Streaming,
        url: config.STREAM_URL,
      },
    ],
  });

  const guild = client.guilds.cache.get(config.GUILD_ID);
  if (guild) {
    await connectToSupportVoiceChannel(guild);
  } else {
    console.warn('⚠️ GUILD_ID introuvable dans le cache : le bot ne rejoint aucun vocal pour l\'instant.');
  }
});

// ----------------------------------------------------------------------------
// Message TTS envoyé dans un salon texte quand un membre rejoint le vocal support
// ----------------------------------------------------------------------------
client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    if (newState.member?.user?.bot) return; // on ignore les bots (dont nous-même)
    if (newState.channelId !== config.SUPPORT_VOICE_CHANNEL_ID) return; // pas le salon support
    if (oldState.channelId === config.SUPPORT_VOICE_CHANNEL_ID) return; // déjà dedans (juste mute/deaf par ex.)

    if (!config.TTS_CHANNEL_ID) {
      return console.warn('⚠️ TTS_CHANNEL_ID non défini : aucune annonce TTS envoyée.');
    }

    const channel = newState.guild.channels.cache.get(config.TTS_CHANNEL_ID);
    if (!channel) return console.warn('⚠️ Salon TTS introuvable, vérifie TTS_CHANNEL_ID.');

    const text = config.TTS_MESSAGE.replace('{user}', newState.member.displayName);
    await channel.send({ content: text, tts: true });
  } catch (err) {
    console.error('Erreur lors de l\'annonce TTS (arrivée en vocal) :', err);
  }
});

// ----------------------------------------------------------------------------
// Construit le "Container" Components V2 commun à l'arrivée et au départ
// ----------------------------------------------------------------------------
function buildContainer({ title, description, color, footer, extraActionRow }) {
  const container = new ContainerBuilder()
    .setAccentColor(parseInt(color.replace('#', ''), 16))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${title}\n${description}`))
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL('attachment://gign.png').setDescription('Logo GIGN')
      )
    )
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${footer}`));

  if (extraActionRow) {
    container.addActionRowComponents(extraActionRow);
  }

  return container;
}

// ----------------------------------------------------------------------------
// Arrivée d'un membre
// ----------------------------------------------------------------------------
client.on('guildMemberAdd', async (member) => {
  try {
    const channel = member.guild.channels.cache.get(config.ARRIVAL_CHANNEL_ID);
    if (!channel) return console.warn('⚠️ Salon d\'arrivée introuvable, vérifie ARRIVAL_CHANNEL_ID.');

    const attachment = new AttachmentBuilder(path.join(__dirname, config.GIGN_IMAGE_PATH), { name: 'gign.png' });

    // Le customId embarque l'ID de la recrue, pour savoir à qui envoyer le MP
    // quand quelqu'un clique sur le bouton.
    const helloButton = new ButtonBuilder()
      .setCustomId(`say-hello:${member.id}`)
      .setLabel(config.HELLO_BUTTON_LABEL)
      .setStyle(ButtonStyle.Success);

    const container = buildContainer({
      title: config.ARRIVAL_TITLE,
      description: config.ARRIVAL_MESSAGE.replace('{user}', `<@${member.id}>`),
      color: config.ARRIVAL_COLOR,
      footer: config.ARRIVAL_FOOTER,
      extraActionRow: new ActionRowBuilder().addComponents(helloButton),
    });

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

    const attachment = new AttachmentBuilder(path.join(__dirname, config.GIGN_IMAGE_PATH), { name: 'gign.png' });

    const container = buildContainer({
      title: config.DEPARTURE_TITLE,
      description: config.DEPARTURE_MESSAGE.replace('{user}', member.user?.tag ?? 'Un membre'),
      color: config.DEPARTURE_COLOR,
      footer: config.DEPARTURE_FOOTER,
    });

    await channel.send({
      components: [container],
      files: [attachment],
      flags: MessageFlags.IsComponentsV2,
    });
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message de départ :', err);
  }
});

// ----------------------------------------------------------------------------
// Bouton "Dire bonjour" sous le message d'arrivée
// ----------------------------------------------------------------------------
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton() || !interaction.customId.startsWith('say-hello:')) return;

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
});

client.login(config.TOKEN);
