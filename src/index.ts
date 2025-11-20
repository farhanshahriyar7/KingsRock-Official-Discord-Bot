// Discord Music Bot - Lavalink-based implementation
import { config } from 'dotenv';
config();

import { Client, GatewayIntentBits } from 'discord.js';
import { Bot } from './bot';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const bot = new Bot(client);

client.login(process.env.DISCORD_TOKEN);
