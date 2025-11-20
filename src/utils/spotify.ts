import SpotifyWebApi from 'spotify-web-api-node';

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Track for token refresh
let tokenExpirationTime = 0;

/**
 * Ensure we have a valid Spotify access token
 */
async function ensureValidToken() {
    const now = Date.now();

    if (now >= tokenExpirationTime) {
        try {
            const data = await spotifyApi.clientCredentialsGrant();
            spotifyApi.setAccessToken(data.body.access_token);
            // Set expiration time (expires_in is in seconds)
            tokenExpirationTime = now + (data.body.expires_in * 1000) - 60000; // Refresh 1 min early
            console.log('Spotify access token refreshed');
        } catch (error) {
            console.error('Error getting Spotify access token:', error);
            throw error;
        }
    }
}

export interface SpotifyTrack {
    name: string;
    artists: string[];
    url: string;
    duration: number;
    id: string;
}

/**
 * Search for a track on Spotify
 */
export async function searchSpotifyTrack(query: string): Promise<SpotifyTrack | null> {
    try {
        await ensureValidToken();

        const result = await spotifyApi.searchTracks(query, { limit: 1 });

        if (result.body.tracks && result.body.tracks.items.length > 0) {
            const track = result.body.tracks.items[0];
            return {
                name: track.name,
                artists: track.artists.map((artist: any) => artist.name),
                url: track.external_urls.spotify,
                duration: track.duration_ms,
                id: track.id,
            };
        }

        return null;
    } catch (error) {
        console.error('Error searching Spotify:', error);
        return null;
    }
}

/**
 * Get track details from a Spotify URL or URI
 */
export async function getSpotifyTrack(urlOrUri: string): Promise<SpotifyTrack | null> {
    try {
        await ensureValidToken();

        // Extract track ID from URL or URI
        let trackId: string;

        if (urlOrUri.includes('spotify.com/track/')) {
            // URL format: https://open.spotify.com/track/TRACK_ID
            trackId = urlOrUri.split('track/')[1].split('?')[0];
        } else if (urlOrUri.startsWith('spotify:track:')) {
            // URI format: spotify:track:TRACK_ID
            trackId = urlOrUri.split(':')[2];
        } else {
            return null;
        }

        const result = await spotifyApi.getTrack(trackId);
        const track = result.body;

        return {
            name: track.name,
            artists: track.artists.map((artist: any) => artist.name),
            url: track.external_urls.spotify,
            duration: track.duration_ms,
            id: track.id,
        };
    } catch (error) {
        console.error('Error getting Spotify track:', error);
        return null;
    }
}

/**
 * Convert Spotify track to YouTube search query
 */
export function spotifyTrackToYouTubeQuery(track: SpotifyTrack): string {
    return `${track.artists.join(', ')} - ${track.name}`;
}

/**
 * Find YouTube URL for a Spotify track
 */
export async function findYouTubeUrl(spotifyTrack: SpotifyTrack): Promise<string | null> {
    try {
        const searchQuery = spotifyTrackToYouTubeQuery(spotifyTrack);

        // Use ytdl-core's search functionality
        // We'll search YouTube for the track
        const searchUrl = `ytsearch1:${searchQuery}`;

        // Try to get info to validate
        // Note: ytdl-core doesn't have built-in search, so we'll use a simple approach
        // We'll construct a YouTube search URL and use the first result
        const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

        // For now, we'll return a search query that can be used with ytdl
        // The actual implementation would need a YouTube search library
        // Let's use a workaround: search using ytdl with the query

        return searchQuery; // Will be used to search YouTube
    } catch (error) {
        console.error('Error finding YouTube URL:', error);
        return null;
    }
}

export { spotifyApi };
