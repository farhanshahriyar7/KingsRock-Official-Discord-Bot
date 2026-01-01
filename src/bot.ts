import { ActivityType, Client, Message } from 'discord.js';
import { join, leave, pause, play, queue, resume, skip, stop, loop } from './commands/music';
import { help, who, rules } from './commands/utility';
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

            // Set up animated activity status
            this.setupActivityStatus();
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

            // Utility commands
            if (command === 'help') {
                await help(message);
            } else if (command === 'who') {
                await who(message);
            } else if (command === 'rules') {
                await rules(message);
            }
            // Music commands
            else if (command === 'play') {
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
            } else if (command === 'loop') {
                await loop(message, args);
            }
        });
    }

    /**
     * Set up animated activity status that rotates through different messages
     */
    private setupActivityStatus() {
        const activities = [
            { name: 'KingsRock Official Server | !help', type: ActivityType.Watching },
            { name: 'over KingsRock Esports', type: ActivityType.Watching },
            { name: 'KingsRock Esports Watching You!', type: ActivityType.Watching },
            { name: '🎮 Type !help for commands', type: ActivityType.Playing },
            { name: '🎵 Music & More', type: ActivityType.Listening },
        ];

        let currentIndex = 0;

        // Set initial activity
        this.client.user?.setActivity(activities[0].name, { type: activities[0].type });

        // Rotate activities every 10 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % activities.length;
            this.client.user?.setActivity(activities[currentIndex].name, {
                type: activities[currentIndex].type
            });
        }, 10000);

        console.log('✨ Activity status animation started!');
    }
}
