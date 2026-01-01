import { Message, GuildMember, EmbedBuilder } from 'discord.js';
import { getManager } from '../utils/lavalink';
import { LoopMode, getLoopMode, setLoopMode } from '../utils/loopState';

export async function join(message: Message) {
    const member = message.member as GuildMember;
    const voiceChannel = member?.voice.channel;

    if (!voiceChannel) {
        return message.reply('❌ You need to be in a voice channel!');
    }

    const manager = getManager();
    const player = manager.createPlayer({
        guildId: message.guild!.id,
        voiceChannelId: voiceChannel.id,
        textChannelId: message.channel.id,
        selfDeaf: true,
        selfMute: false,
    });

    await player.connect();
    message.reply(`✅ Joined **${voiceChannel.name}**!`);
}

export async function leave(message: Message) {
    const manager = getManager();
    const player = manager.getPlayer(message.guild!.id);

    if (!player) {
        return message.reply('❌ I\'m not in a voice channel!');
    }

    await player.destroy();
    message.reply('👋 Left the voice channel!');
}

export async function play(message: Message, args: string[]) {
    const member = message.member as GuildMember;
    const voiceChannel = member?.voice.channel;

    if (!voiceChannel) {
        return message.reply('❌ You need to be in a voice channel!');
    }

    const query = args.join(' ');
    if (!query) {
        return message.reply('❌ Please provide a song name or URL!');
    }

    const manager = getManager();
    let player = manager.getPlayer(message.guild!.id);

    if (!player) {
        player = manager.createPlayer({
            guildId: message.guild!.id,
            voiceChannelId: voiceChannel.id,
            textChannelId: message.channel.id,
            selfDeaf: true,
            selfMute: false,
        });
        await player.connect();
    }

    // Search for tracks
    const res = await player.search(
        { query },
        message.author
    );

    if (!res || !res.tracks || res.tracks.length === 0) {
        return message.reply('❌ No results found!');
    }

    if (res.loadType === 'playlist') {
        await player.queue.add(res.tracks);
        message.reply(`✅ Added playlist **${res.playlist?.name}** with **${res.tracks.length}** tracks to the queue!`);
    } else {
        const track = res.tracks[0];
        await player.queue.add(track);
        message.reply(`✅ Added **${track.info.title}** by **${track.info.author}** to the queue!`);
    }

    if (!player.playing && !player.paused) {
        await player.play();
    }
}

export async function skip(message: Message) {
    const manager = getManager();
    const player = manager.getPlayer(message.guild!.id);

    if (!player) {
        return message.reply('❌ Nothing is playing!');
    }

    if (!player.queue.current) {
        return message.reply('❌ Nothing is playing!');
    }

    const current = player.queue.current;

    // Check if there are more tracks in the queue or if we should just stop
    if (player.queue.tracks.length === 0) {
        // No more tracks, stop playback instead of skipping
        await player.stopPlaying();
        message.reply(`⏭️ Skipped **${current.info.title}**! No more tracks in queue.`);
    } else {
        // There are more tracks, skip to the next one
        await player.skip();
        message.reply(`⏭️ Skipped **${current.info.title}**!`);
    }
}

export async function stop(message: Message) {
    const manager = getManager();
    const player = manager.getPlayer(message.guild!.id);

    if (!player) {
        return message.reply('❌ Nothing is playing!');
    }

    // Clear the queue first
    player.queue.tracks.splice(0, player.queue.tracks.length);

    // Stop playback properly without causing crash
    if (player.queue.current) {
        await player.stopPlaying();
    }

    message.reply('⏹️ Stopped playback and cleared the queue!');
}

export async function pause(message: Message) {
    const manager = getManager();
    const player = manager.getPlayer(message.guild!.id);

    if (!player) {
        return message.reply('❌ Nothing is playing!');
    }

    if (player.paused) {
        return message.reply('❌ Playback is already paused!');
    }

    await player.pause();
    message.reply('⏸️ Paused playback!');
}

export async function resume(message: Message) {
    const manager = getManager();
    const player = manager.getPlayer(message.guild!.id);

    if (!player) {
        return message.reply('❌ Nothing is playing!');
    }

    if (!player.paused) {
        return message.reply('❌ Playback is not paused!');
    }

    await player.resume();
    message.reply('▶️ Resumed playback!');
}

export async function queue(message: Message) {
    const manager = getManager();
    const player = manager.getPlayer(message.guild!.id);

    if (!player) {
        return message.reply('❌ Nothing is playing!');
    }

    const current = player.queue.current;
    const queueTracks = player.queue.tracks;

    if (!current && queueTracks.length === 0) {
        return message.reply('❌ Queue is empty!');
    }

    // Get current loop mode from player
    const repeatMode = player.repeatMode || 'off';
    let loopStatus: string;
    switch (repeatMode) {
        case 'track':
            loopStatus = '🔂 Track Loop';
            break;
        case 'queue':
            loopStatus = '🔁 Queue Loop';
            break;
        default:
            loopStatus = '➡️ No Loop';
    }

    let queueMessage = `**${loopStatus}**\n\n`;

    if (current) {
        queueMessage += `**🎵 Now Playing:**\n${current.info.title} by ${current.info.author}\n`;
        queueMessage += `Duration: ${formatDuration(current.info.duration || 0)} | Requested by: ${current.requester}\n\n`;
    }

    if (queueTracks.length > 0) {
        queueMessage += '**📋 Queue:**\n';
        const tracks = queueTracks.slice(0, 10);
        tracks.forEach((track, index) => {
            queueMessage += `${index + 1}. ${track.info.title} by ${track.info.author} [${formatDuration(track.info.duration || 0)}]\n`;
        });

        if (queueTracks.length > 10) {
            queueMessage += `\n...and **${queueTracks.length - 10}** more tracks`;
        }
    }

    message.reply(queueMessage || '❌ Queue is empty!');
}

export async function loop(message: Message, args: string[]) {
    const manager = getManager();
    const player = manager.getPlayer(message.guild!.id);

    if (!player) {
        return message.reply('❌ Nothing is playing!');
    }

    const guildId = message.guild!.id;
    const currentMode = getLoopMode(guildId);
    let newMode: LoopMode;

    // Parse argument or cycle through modes
    const arg = args[0]?.toLowerCase();

    if (arg === 'track' || arg === 't' || arg === 'song') {
        newMode = LoopMode.TRACK;
    } else if (arg === 'queue' || arg === 'q' || arg === 'all') {
        newMode = LoopMode.QUEUE;
    } else if (arg === 'off' || arg === 'disable' || arg === 'none') {
        newMode = LoopMode.OFF;
    } else if (!arg) {
        // Cycle through modes: off -> track -> queue -> off
        if (currentMode === LoopMode.OFF) {
            newMode = LoopMode.TRACK;
        } else if (currentMode === LoopMode.TRACK) {
            newMode = LoopMode.QUEUE;
        } else {
            newMode = LoopMode.OFF;
        }
    } else {
        return message.reply('❌ Invalid option! Use: `!loop [track|queue|off]`');
    }

    // Update our state tracker
    setLoopMode(guildId, newMode);

    // Use lavalink-client's built-in repeat mode
    // RepeatMode: 'off' | 'track' | 'queue'
    await player.setRepeatMode(newMode as 'off' | 'track' | 'queue');

    // Create embed response
    const embed = new EmbedBuilder()
        .setTimestamp();

    switch (newMode) {
        case LoopMode.TRACK:
            embed
                .setColor('#00FF00')
                .setTitle('🔂 Looping Current Track')
                .setDescription(`Now repeating: **${player.queue.current?.info.title || 'Current track'}**`);
            break;
        case LoopMode.QUEUE:
            embed
                .setColor('#0099FF')
                .setTitle('🔁 Queue Loop Activated')
                .setDescription('The entire queue will repeat when it ends.');
            break;
        case LoopMode.OFF:
            embed
                .setColor('#FF6600')
                .setTitle('➡️ Loop Disabled')
                .setDescription('Playback will continue normally.');
            break;
    }

    message.reply({ embeds: [embed] });
}

function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
