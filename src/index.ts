import { config } from 'dotenv';
config();

import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Bot } from './bot';

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
