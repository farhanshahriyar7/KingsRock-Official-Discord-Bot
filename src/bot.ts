import { Client, Message } from 'discord.js';
import { join, leave, pause, play, queue, resume, skip, stop } from './commands/music';
import { initializeLavalink, getManager } from './utils/lavalink';

export class Bot {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
        this.initialize();
    }

    private initialize() {
        this.client.once('ready', () => {
            console.log(`✅ Logged in as ${this.client.user?.tag}!`);

            // Initialize Lavalink
            const manager = initializeLavalink(this.client);
            manager.init({ id: this.client.user!.id, username: this.client.user!.username });

            console.log('🎵 Lavalink manager initialized!');
        });

        // Handle raw events for Lavalink
        this.client.on('raw', (d) => {
            try {
                const manager = getManager();
                manager.sendRawData(d);
            } catch (error) {
                // Manager not initialized yet, ignore
            }
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            if (!message.content.startsWith('!')) return;

            const args = message.content.slice(1).trim().split(/ +/);
            const command = args.shift()?.toLowerCase();

            if (command === 'play') {
                await play(message, args);
            } else if (command === 'join') {
                await join(message);
            } else if (command === 'leave') {
                await leave(message);
            } else if (command === 'skip') {
                await skip(message);
            } else if (command === 'stop') {
                await stop(message);
            } else if (command === 'pause') {
                await pause(message);
            } else if (command === 'resume') {
                await resume(message);
            } else if (command === 'queue') {
                await queue(message);
            }
        });
    }
}
