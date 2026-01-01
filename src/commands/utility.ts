import { Message, EmbedBuilder } from 'discord.js';

/**
 * Display all available bot commands
 */
export async function help(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎮 KingsRock Bot Commands')
        .setDescription('Here are all the available commands:')
        .addFields(
            {
                name: '🎵 Music Commands',
                value:
                    '`!play <song>` - Play a song from YouTube\n' +
                    '`!join` - Join your voice channel\n' +
                    '`!leave` - Leave the voice channel\n' +
                    '`!skip` - Skip the current song\n' +
                    '`!stop` - Stop playback and clear queue\n' +
                    '`!pause` - Pause the current song\n' +
                    '`!resume` - Resume playback\n' +
                    '`!queue` - Show the current queue\n' +
                    '`!loop [track|queue|off]` - Set loop mode',
                inline: false
            },
            {
                name: '📋 Utility Commands',
                value:
                    '`!help` - Show this help message\n' +
                    '`!who` - Learn about KingsRock\n' +
                    '`!rules` - View server rules',
                inline: false
            }
        )
        .setFooter({ text: 'KingsRock Official Discord Bot' })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

/**
 * Display information about KingsRock with website link
 */
export async function who(message: Message): Promise<void> {
    const welcomeChannel = message.guild?.channels.cache.find(
        (channel) => channel.name === 'welcome'
    );

    const embed = new EmbedBuilder()
        .setColor('#00ccffff')
        .setTitle('👑 Welcome to KingsRock!')
        .setDescription(
            `Welcome to the **KingsRock Official Discord Server**! 🎮\n\n` +
            `We're a competitive esports organization dedicated to excellence in gaming.\n\n` +
            `${welcomeChannel ? `Check out ${welcomeChannel} for more information!\n\n` : ''}` +
            `📚 **Learn More:** [KingsRock Liquipedia](https://kingsrock-liquipedia.netlify.app/)`
        )
        .setFooter({ text: 'KingsRock Esports' })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

/**
 * Mention the rules channel
 */
export async function rules(message: Message): Promise<void> {
    const rulesChannel = message.guild?.channels.cache.find(
        (channel) => channel.name === 'rules'
    );

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('📜 Server Rules')
        .setDescription(
            rulesChannel
                ? `Please read and follow our server rules in ${rulesChannel}!`
                : 'Please check the rules channel for server guidelines!'
        )
        .setFooter({ text: 'Follow the rules to keep our community safe!' })
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}
