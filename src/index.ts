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

const bot = new Bot(client);

client.login(process.env.DISCORD_TOKEN);
