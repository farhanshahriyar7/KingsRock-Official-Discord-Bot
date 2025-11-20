import { Message, GuildMember } from 'discord.js';
import { getManager } from '../utils/lavalink';

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
    await player.skip();
    message.reply(`⏭️ Skipped **${current.info.title}**!`);
}

export async function stop(message: Message) {
    const manager = getManager();
    const player = manager.getPlayer(message.guild!.id);

    if (!player) {
        return message.reply('❌ Nothing is playing!');
    }

    // Clear the queue
    player.queue.tracks.splice(0, player.queue.tracks.length);

    // Stop playback properly without causing crash
    await player.stopPlaying();

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

    let queueMessage = '';

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

function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
