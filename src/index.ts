import { config } from 'dotenv';
config();

import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Bot } from './bot';
import http from 'http';

// Create a minimal server for health checks (required for cloud hosting like Deployr.cloud)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('OK');
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        Partials.Channel,
    ],
});

new Bot(client);

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('DISCORD_TOKEN is not set. Bot login skipped.');
} else {
    client.login(token).catch((error) => {
        console.error('Failed to login to Discord:', error);
        process.exit(1);
    });
}