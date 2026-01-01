import { LavalinkManager } from 'lavalink-client';
import { Client, TextBasedChannel } from 'discord.js';
import { clearLoopState } from './loopState';

let manager: LavalinkManager | null = null;

export function initializeLavalink(client: Client): LavalinkManager {
  if (manager) return manager;

  const host = process.env.LAVALINK_HOST;
  const portStr = process.env.LAVALINK_PORT;
  const auth = process.env.LAVALINK_PASSWORD;
  const secure = process.env.LAVALINK_SECURE === 'true';

  if (!host || !portStr || !auth) {
    throw new Error(
      'Lavalink configuration missing. Set LAVALINK_HOST, LAVALINK_PORT, and LAVALINK_PASSWORD in the environment.'
    );
  }

  const port = Number.parseInt(portStr, 10);
  if (Number.isNaN(port)) {
    throw new Error('LAVALINK_PORT is not a valid integer.');
  }

  manager = new LavalinkManager({
    nodes: [
      {
        id: 'lavalink-node',
        host,
        port,
        authorization: auth,
        secure,
      }
    ],
    sendToShard: (guildId, payload) => {
      // Prefer shard via guild if available, otherwise fallback to client.shard
      const guild = client.guilds.cache.get(guildId);
      try {
        if (guild?.shard?.send) {
          guild.shard.send(payload);
        } else if (client.shard?.send) {
          client.shard.send(payload);
        } else {
          console.warn('Could not send payload to shard for guild', guildId);
        }
      } catch (e) {
        console.warn('Error sending payload to shard:', e);
      }
    },
    client: {
      id: client.user?.id ?? '',
      username: client.user?.username ?? 'KingsRock Bot',
    },
    playerOptions: {
      clientBasedPositionUpdateInterval: 150,
      defaultSearchPlatform: 'ytsearch',
      volumeDecrementer: 0.75,
      onDisconnect: {
        autoReconnect: true,
        destroyPlayer: false,
      },
      onEmptyQueue: {
        destroyAfterMs: 300_000, // 5 minutes
      },
    },
    queueOptions: {
      maxPreviousTracks: 10,
    },
  });

  // Node events
  manager.nodeManager
    .on('connect', (node) => {
      console.log(`✅ Lavalink node "${node.id}" connected!`);
    })
    .on('disconnect', (node, reason) => {
      console.warn(`⚠️ Lavalink node "${node.id}" disconnected:`, reason);
    })
    .on('error', (node, error) => {
      console.error(`❌ Lavalink node "${node.id}" error:`, error?.message ?? error);
    });

  // Player events
  manager
    .on('playerCreate', (player) => {
      console.log(`Player created in guild ${player.guildId}`);
    })
    .on('playerDestroy', (player, reason) => {
      console.log(`Player destroyed in guild ${player.guildId}:`, reason);
      // Clear loop state when player is destroyed
      clearLoopState(player.guildId);
    })
    .on('trackStart', (player, track) => {
      if (!track) return;
      const channelId = player.textChannelId;
      if (!channelId) return;
      const channel = client.channels.cache.get(channelId) as TextBasedChannel | undefined;
      if (channel?.isTextBased && channel.isTextBased()) {
        channel.send(`🎵 Now playing: **${track.info.title}** by **${track.info.author}**`).catch(console.error);
      }
    })
    .on('trackEnd', async (player, track, payload) => {
      console.log(`Track ended in guild ${player.guildId}`, payload?.reason || '');
      // Loop handling delegated to lavalink-client repeat mode where possible
    })
    .on('trackError', (player, track, error) => {
      console.error(`❌ Track error in guild ${player.guildId}:`, error);
      const channelId = player.textChannelId;
      if (!channelId) return;
      const channel = client.channels.cache.get(channelId) as TextBasedChannel | undefined;
      if (channel?.isTextBased && channel.isTextBased()) {
        const errorMsg = (error as any)?.exception?.message || (error as any)?.error || 'Unknown error';
        const trackTitle = track?.info?.title || 'Unknown track';
        channel.send(`❌ Error playing **${trackTitle}**: ${errorMsg}`).catch(console.error);
      }
    });

  return manager;
}
