import { config } from 'dotenv';
config();

import { Client, GatewayIntentBits } from 'discord.js';
import { Bot } from './bot';

if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN is not set. Please add it to your environment.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
  // Initialize the bot only after the client is ready
  new Bot(client);
});

client.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error('Failed to login Discord client:', err);
  process.exit(1);
});
