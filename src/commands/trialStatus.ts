import { Message, EmbedBuilder } from 'discord.js';
import { supabase } from '../utils/supabase';

// Status display configuration
const STATUS_CONFIG: Record<string, { emoji: string; color: number; message: string }> = {
    pending: {
        emoji: '🟡',
        color: 0xFEE75C,
        message: 'Your application is **pending** review. Our admins will get to it shortly!',
    },
    reviewed: {
        emoji: '🔵',
        color: 0x5865F2,
        message: 'Your application has been **reviewed** by our admins. A decision will be made soon!',
    },
    accepted: {
        emoji: '🟢',
        color: 0x57F287,
        message: '🎉 Congratulations! Your trial application has been **accepted**! Welcome to KingsRock Esports!',
    },
    rejected: {
        emoji: '🔴',
        color: 0xED4245,
        message: 'Unfortunately, your application has been **rejected**. Feel free to apply again in the future!',
    },
};

/**
 * Handles the !trial-status command.
 * Queries Supabase for the user's most recent recruitment application
 * and displays its current status.
 */
export async function trialStatus(message: Message) {
    // 1. Query Supabase for the user's most recent application
    const { data: application, error } = await supabase
        .from('recruitment_applications')
        .select('*')
        .eq('discord_user_id', message.author.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !application) {
        const noAppEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📋 Trial Application Status')
            .setDescription(
                'You haven\'t submitted a trial application yet.\n\n' +
                '💡 Use `!recruitment` to apply for a trial position!'
            )
            .setFooter({ text: 'KingsRock Esports' })
            .setTimestamp();

        await message.reply({ embeds: [noAppEmbed] });
        return;
    }

    // 2. Get status config
    const status = (application.status || 'pending').toLowerCase();
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    // 3. Build the status embed
    const statusEmbed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`${config.emoji} Trial Application Status`)
        .setDescription(config.message)
        .addFields(
            { name: 'IGN', value: application.ign || 'N/A', inline: true },
            { name: 'Role', value: application.role || 'N/A', inline: true },
            { name: 'Rank', value: application.rank || 'N/A', inline: true },
            { name: 'Status', value: `${config.emoji} **${status.charAt(0).toUpperCase() + status.slice(1)}**`, inline: true },
            {
                name: 'Submitted', value: new Date(application.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }), inline: true
            },
        )
        .setFooter({ text: 'KingsRock Esports • Status updates are managed by our KR Admins' })
        .setTimestamp();

    await message.reply({ embeds: [statusEmbed] });
}
