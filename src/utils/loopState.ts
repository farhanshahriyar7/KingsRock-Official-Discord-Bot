/**
 * Loop State Management for Music Player
 * Stores loop mode per guild with persistence in memory
 */

// Loop mode enum
export enum LoopMode {
    OFF = 'off',
    TRACK = 'track',
    QUEUE = 'queue'
}

// Per-guild loop state storage
const guildLoopModes = new Map<string, LoopMode>();

// Store played tracks for queue loop functionality
const guildPlayedTracks = new Map<string, any[]>();

/**
 * Get the current loop mode for a guild
 * @param guildId - The guild ID
 * @returns The current loop mode (defaults to OFF)
 */
export function getLoopMode(guildId: string): LoopMode {
    return guildLoopModes.get(guildId) || LoopMode.OFF;
}

/**
 * Set the loop mode for a guild
 * @param guildId - The guild ID
 * @param mode - The loop mode to set
 */
export function setLoopMode(guildId: string, mode: LoopMode): void {
    guildLoopModes.set(guildId, mode);

    // Clear played tracks when changing modes
    if (mode !== LoopMode.QUEUE) {
        guildPlayedTracks.delete(guildId);
    }
}

/**
 * Clear all loop state for a guild (call on player destroy/leave)
 * @param guildId - The guild ID
 */
export function clearLoopState(guildId: string): void {
    guildLoopModes.delete(guildId);
    guildPlayedTracks.delete(guildId);
}

/**
 * Add a track to the played tracks list (for queue loop)
 * @param guildId - The guild ID
 * @param track - The track that was played
 */
export function addPlayedTrack(guildId: string, track: any): void {
    const played = guildPlayedTracks.get(guildId) || [];
    played.push(track);
    guildPlayedTracks.set(guildId, played);
}

/**
 * Get all played tracks for a guild (for queue loop restoration)
 * @param guildId - The guild ID
 * @returns Array of played tracks
 */
export function getPlayedTracks(guildId: string): any[] {
    return guildPlayedTracks.get(guildId) || [];
}

/**
 * Clear played tracks for a guild
 * @param guildId - The guild ID
 */
export function clearPlayedTracks(guildId: string): void {
    guildPlayedTracks.delete(guildId);
}

/**
 * Get a display-friendly string for the loop mode
 * @param mode - The loop mode
 * @returns Display string with emoji
 */
export function getLoopModeDisplay(mode: LoopMode): string {
    switch (mode) {
        case LoopMode.TRACK:
            return '🔂 Track Loop';
        case LoopMode.QUEUE:
            return '🔁 Queue Loop';
        case LoopMode.OFF:
        default:
            return '➡️ No Loop';
    }
}
