# KingsRock Discord Bot

An **AI-ready, full-featured bot** built with **TypeScript**, **Lavalink**, and **Discord.js** — designed for high-performance music playback and seamless audio streaming.  
Built by **KingsRock Management** ❤️‍🔥

---

## 🚀 Current Overview

KingsRock Discord Bot is a high-performance music bot engineered with **TypeScript** and **Lavalink v4**. It currently delivers **stable, high-quality audio streaming**, a **smart queue system** with track duration tracking, and **reliable playback controls**. Designed for speed and stability, it serves as a robust foundation for advanced music features.

---

## ⚙️ Tech Stack

| Layer | Technology |
|--------|-------------|
| Language | TypeScript (Node.js) |
| Bot Framework | discord.js (v14) |
| Music Backend | Lavalink (v4) |
| Client Library | lavalink-client |
| Hosting | VPS / Pterodactyl |
| Auth | Discord OAuth2 |

---

## ✨ Features

✅ **Prefix Commands (!)**  
✅ **High-quality music playback via Lavalink v4**  
✅ **Smart Queue system with duration tracking**  
✅ **Multi-source support (YouTube, Spotify, SoundCloud)**  
✅ **Playlist loading support**  
✅ **Auto-reconnect and idle timeout**  
✅ **Real-time voice state updates**  
✅ **Type-safe architecture**

---

## 🧱 Project Structure

```
KingsRock-Official-Discord-Bot/
├── src/
│   ├── commands/
│   │   └── music.ts      # Playback, queue, controls
│   ├── utils/
│   │   └── lavalink.ts   # Lavalink manager & events
│   ├── bot.ts            # Bot client & event handling
│   └── index.ts          # Entry point
├── package.json
├── tsconfig.json
└── .env
```

---

## 🔑 .env Configuration

```bash
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id

# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Lavalink Node Configuration
LAVALINK_HOST=#
LAVALINK_PORT=#
LAVALINK_PASSWORD=#
```

> ⚠️ **Never commit your `.env` file** — only keep `.env.example` for reference.

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/yourname/kingsrock-discord-bot.git
cd kingsrock-discord-bot
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Build the project

```bash
npm run build
```

### 4️⃣ Setup Lavalink

* Ensure you have a working Lavalink v4 server.
* Update `.env` with your node credentials.

### 5️⃣ Run the bot

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

---

## 🧠 Command Examples

| Command | Description |
| :--- | :--- |
| `!play [song/url]` | Play or queue a song (YouTube/Spotify) |
| `!pause` | Pause playback |
| `!resume` | Resume playback |
| `!skip` | Skip to next track |
| `!stop` | Stop playback and clear queue |
| `!queue` | View current queue with durations |
| `!join` | Join your voice channel |
| `!leave` | Disconnect from voice channel |

---

## 🧩 Contributing

We love contributions! 🫶

1. Fork this repo
2. Create your branch

   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes

   ```bash
   git commit -m "feat(music): add fade transition between songs"
   ```
4. Push & create Pull Request

   ```bash
   git push origin feature/your-feature
   ```

---

## 🧾 Commit Style Guide

Follow **Conventional Commits**:

```
feat(scope): add something new
fix(scope): fix something broken
chore: update dependency or config
docs: update documentation
```

---

## 📈 Roadmap

* [ ] **Minor-Major Updates** (Updating the bot with new features, bug fixes, and performance improvements) — *ToDo*
* [ ] **Slash Commands Support** (`/play`, `/queue`) — *High Priority*
* [ ] **Spotify playlist import** (using Spotify API) — *Future Update*
* [ ] **Audio Filters** (Bassboost, Nightcore, 8D) — *Planned*
* [ ] **Lyrics Integration** (Genius API) — *In Consideration*
* [ ] **AI-powered song recommendation** (using OpenAI) — *Future Update*
* [ ] **DM Verification** (Verifying users in DM) — *Future*
* [ ] **Mass DM** (Sending messages to multiple users) — *Future*
* [ ] **Announcement** (Streamers/Clan/News or Video Announcement) — *Future*


---

## 🧑‍💻 Authors

**Farhan Shahriyar** — [@farhanshahriyar7](https://github.com/farhanshahriyar)
**Mashrur Bin Morshed** — [@MashrurBinMorshed](https://github.com/MashrurBinMorshed)

---

## 🪪 License

MIT License © 2025 Farhan Shahriyar & Mashrur Bin Morshed
Feel free to fork, extend, or remix — just give credit 🎶

---

## 💬 Support

Need help?
Join our Discord or open an issue on GitHub!
