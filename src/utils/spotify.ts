import SpotifyWebApi from 'spotify-web-api-node';
import yts from 'yt-search';

// Initialize Spotify API client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Track for token refresh
let tokenExpirationTime = 0;
let refreshPromise: Promise<void> | null = null;

/**
 * Ensure we have a valid Spotify access token
 */
async function ensureValidToken() {
  const now = Date.now();

  if (now < tokenExpirationTime) return;

  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    await refreshPromise;
    return;
  }

  refreshPromise = (async () => {
    try {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body.access_token);
      // Set expiration time (expires_in is in seconds)
      tokenExpirationTime = Date.now() + (data.body.expires_in * 1000) - 60000; // Refresh 1 min early
      console.log('Spotify access token refreshed');
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  await refreshPromise;
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
 * Find YouTube URL for a Spotify track using yt-search
 */
export async function findYouTubeUrl(spotifyTrack: SpotifyTrack): Promise<string | null> {
  try {
    const searchQuery = spotifyTrackToYouTubeQuery(spotifyTrack);
    const result = await yts(searchQuery);

    if (result && Array.isArray(result.videos) && result.videos.length > 0) {
      return result.videos[0].url;
    }

    return null;
  } catch (err) {
    console.error('Error finding YouTube URL:', err);
    return null;
  }
}
