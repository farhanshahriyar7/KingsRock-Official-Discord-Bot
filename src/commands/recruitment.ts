import { Message, EmbedBuilder, TextChannel } from 'discord.js';
import { supabase } from '../utils/supabase';

// The channel where !recruitment command is allowed
const RECRUITMENT_CHANNEL_ID = '1347641785114951691';

// The channel where recruitment application notifications are sent
const RECRUITMENT_NOTIFICATION_CHANNEL_ID = '1474398800188670064';

// Timeout for each question (2 minutes)
const QUESTION_TIMEOUT = 120_000;

/**
 * Handles the !recruitment command.
 * 1. Checks if recruitment is enabled in bot_settings.
 * 2. Checks the command is used in the correct channel.
 * 3. DMs the user a series of questions.
 * 4. Saves the application to Supabase.
 * 5. Confirms in the channel.
 */
export async function recruitment(message: Message) {
    // 1. Must be used in the designated recruitment channel
    if (message.channel.id !== RECRUITMENT_CHANNEL_ID) {
        await message.reply(`❌ This command can only be used in <#${RECRUITMENT_CHANNEL_ID}>.`);
        return;
    }

    // 2. Check if recruitment is active
    const { data: setting, error: settingsError } = await supabase
        .from('bot_settings')
        .select('value')
        .eq('key', 'recruitment_active')
        .single();

    if (settingsError) {
        console.error('Error fetching recruitment status:', settingsError);
        await message.reply('❌ An error occurred. Please try again later.');
        return;
    }

    const isActive = setting?.value === true || setting?.value === 'true';
    if (!isActive) {
        const closedEmbed = new EmbedBuilder()
            .setColor(0xFF4444)
            .setTitle('🚫 Recruitment Closed')
            .setDescription('Recruitment is currently **closed**. Please check back later!')
            .setTimestamp();
        await message.reply({ embeds: [closedEmbed] });
        return;
    }

    // 3. Try to DM the user
    const dmChannel = await message.author.createDM().catch(() => null);
    if (!dmChannel) {
        await message.reply('❌ I couldn\'t send you a DM. Please make sure your DMs are open and try again.');
        return;
    }

    // Notify in channel
    const startEmbed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📬 Recruitment Application Started')
        .setDescription(`${message.author}, check your DMs! I've sent you the application form.`)
        .setTimestamp();
    await message.reply({ embeds: [startEmbed] });

    // 4. Ask questions via DM
    const questions = [
        { key: 'surname', prompt: '**What is your Surname (Last Name)?**\n_(Type "skip" to skip)_' },
        { key: 'ign', prompt: '**What is your In-Game Name (IGN)?**', required: true },
        { key: 'role', prompt: '**What role do you play?**\n_(e.g., Duelist, Controller, Initiator, Sentinel)_\n_(Type "skip" to skip)_' },
        { key: 'rank', prompt: '**What is your current rank?**\n_(e.g., Diamond 2, Immortal 1)_\n_(Type "skip" to skip)_' },
        { key: 'tracker_link', prompt: '**Provide your Tracker link:**\n_(e.g., https://tracker.gg/valorant/profile/...)_\n_(Type "skip" to skip)_' },
    ];

    const introEmbed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('👑 KingsRock Esports — Recruitment Application')
        .setDescription(
            'Welcome! Please answer the following questions to submit your trial application.\n\n' +
            '• You have **2 minutes** per question.\n' +
            '• Type **"cancel"** at any time to abort.\n' +
            '• Type **"skip"** to skip optional questions.\n\n' +
            '━━━━━━━━━━━━━━━━━━━\n' +
            'Let\'s get started! 🚀'
        )
        .setFooter({ text: 'KingsRock Esports Recruitment' })
        .setTimestamp();

    await dmChannel.send({ embeds: [introEmbed] });

    const answers: Record<string, string | null> = {};

    for (const q of questions) {
        await dmChannel.send(q.prompt);

        try {
            const collected = await dmChannel.awaitMessages({
                filter: (m) => m.author.id === message.author.id,
                max: 1,
                time: QUESTION_TIMEOUT,
                errors: ['time'],
            });

            const response = collected.first()?.content.trim();

            if (!response || response.toLowerCase() === 'cancel') {
                await dmChannel.send('❌ Application cancelled.');
                return;
            }

            if (response.toLowerCase() === 'skip' && !q.required) {
                answers[q.key] = null;
            } else if (response.toLowerCase() === 'skip' && q.required) {
                await dmChannel.send('⚠️ This field is required and cannot be skipped. Please provide an answer.');
                // Re-ask the same question
                const retryCollected = await dmChannel.awaitMessages({
                    filter: (m) => m.author.id === message.author.id,
                    max: 1,
                    time: QUESTION_TIMEOUT,
                    errors: ['time'],
                });
                const retryResponse = retryCollected.first()?.content.trim();
                if (!retryResponse || retryResponse.toLowerCase() === 'cancel') {
                    await dmChannel.send('❌ Application cancelled.');
                    return;
                }
                answers[q.key] = retryResponse;
            } else {
                answers[q.key] = response;
            }
        } catch {
            await dmChannel.send('⏰ You took too long to respond. Application cancelled.');
            return;
        }
    }

    // 5. Save to Supabase
    const applicationData = {
        surname: answers.surname || null,
        ign: answers.ign!,
        role: answers.role || null,
        rank: answers.rank || null,
        tracker_link: answers.tracker_link || null,
        discord_username: message.author.tag,
        discord_user_id: message.author.id,
        status: 'pending',
    };

    const { error: insertError } = await supabase
        .from('recruitment_applications')
        .insert(applicationData);

    if (insertError) {
        console.error('Error saving recruitment application:', insertError);
        await dmChannel.send('❌ There was an error submitting your application. Please try again later.');
        return;
    }

    // 6. Confirm via DM
    const confirmEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('✅ Application Submitted Successfully!')
        .setDescription('Your trial application has been submitted to KingsRock Esports. Our admins will review it shortly.')
        .addFields(
            { name: 'Surname', value: answers.surname || '_Skipped_', inline: true },
            { name: 'IGN', value: answers.ign!, inline: true },
            { name: 'Role', value: answers.role || '_Skipped_', inline: true },
            { name: 'Rank', value: answers.rank || '_Skipped_', inline: true },
            { name: 'Tracker', value: answers.tracker_link || '_Skipped_', inline: false },
        )
        .setFooter({ text: 'KingsRock Esports • Good luck!' })
        .setTimestamp();

    await dmChannel.send({ embeds: [confirmEmbed] });

    // 7. Confirm in the recruitment channel
    const channelConfirmEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('📋 New Recruitment Application')
        .setDescription(`${message.author} has submitted a trial application!`)
        .addFields(
            { name: 'IGN', value: answers.ign!, inline: true },
            { name: 'Role', value: answers.role || 'N/A', inline: true },
            { name: 'Rank', value: answers.rank || 'N/A', inline: true },
        )
        .setFooter({ text: 'Review this application on the KR Web Portal' })
        .setTimestamp();

    try {
        const notifChannel = message.client.channels.cache.get(RECRUITMENT_NOTIFICATION_CHANNEL_ID) as TextChannel | undefined;
        if (notifChannel) {
            await notifChannel.send({ embeds: [channelConfirmEmbed] });
        } else {
            console.warn('Recruitment notification channel not found:', RECRUITMENT_NOTIFICATION_CHANNEL_ID);
        }
    } catch (err) {
        console.error('Error sending confirmation to notification channel:', err);
    }
}
