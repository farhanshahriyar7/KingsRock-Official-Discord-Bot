import { LavalinkManager } from 'lavalink-client';
import { Client } from 'discord.js';

let manager: LavalinkManager | null = null;

export function initializeLavalink(client: Client): LavalinkManager {
    if (manager) return manager;

    manager = new LavalinkManager({
        nodes: [
            {
                id: 'Harmonix V4 Public',
                host: process.env.LAVALINK_HOST || 'zac.hidencloud.com',
                port: parseInt(process.env.LAVALINK_PORT || '24627'),
                authorization: process.env.LAVALINK_PASSWORD || 'Kaun.Yuvraj',
                secure: false,
            }
        ],
        sendToShard: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        },
        client: {
            id: client.user?.id || '',
            username: client.user?.username || 'KingsRock Bot',
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
            console.error(`❌ Lavalink node "${node.id}" error:`, error.message);
        });

    // Player events
    manager
        .on('playerCreate', (player) => {
            console.log(`Player created in guild ${player.guildId}`);
        })
        .on('playerDestroy', (player, reason) => {
            console.log(`Player destroyed in guild ${player.guildId}:`, reason);
        })
        .on('trackStart', (player, track) => {
            if (!track) return;
            const channel = client.channels.cache.get(player.textChannelId!);
            if (channel && 'send' in channel) {
                channel.send(`🎵 Now playing: **${track.info.title}** by **${track.info.author}**`);
            }
        })
        .on('trackEnd', (player, track, payload) => {
            console.log(`Track ended in guild ${player.guildId}`, payload?.reason || '');
        })
        .on('trackError', (player, track, error) => {
            console.error(`❌ Track error in guild ${player.guildId}:`, error);
            const channel = client.channels.cache.get(player.textChannelId!);
            if (channel && 'send' in channel) {
                const errorMsg = error.exception?.message || error.error || 'Unknown error';
                const trackTitle = track?.info?.title || 'Unknown track';
                channel.send(`❌ Error playing **${trackTitle}**: ${errorMsg}\n💡 This might be due to YouTube restrictions or Lavalink server issues.`);
            }
        })
        .on('trackStuck', (player, track, thresholdMs) => {
            console.warn(`⚠️ Track stuck in guild ${player.guildId} for ${thresholdMs}ms`);
            const channel = client.channels.cache.get(player.textChannelId!);
            if (channel && 'send' in channel) {
                const trackTitle = track?.info?.title || 'Unknown track';
                channel.send(`⚠️ Track **${trackTitle}** is stuck. Skipping...`);
            }
            // Auto-skip stuck tracks
            player.skip();
        })
        .on('playerMove', (player, oldChannel, newChannel) => {
            console.log(`Player moved from ${oldChannel} to ${newChannel} in guild ${player.guildId}`);
            if (!newChannel) {
                // User disconnected the bot, destroy the player
                player.destroy();
            }
        })
        .on('queueEnd', (player) => {
            const channel = client.channels.cache.get(player.textChannelId!);
            if (channel && 'send' in channel) {
                channel.send('✅ Queue finished! Add more songs or I\'ll leave in 5 minutes.');
            }
        });

    return manager;
}

export function getManager(): LavalinkManager {
    if (!manager) {
        throw new Error('Lavalink manager not initialized! Call initializeLavalink first.');
    }
    return manager;
}
