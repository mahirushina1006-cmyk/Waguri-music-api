const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const app = express();
const PORT = process.env.PORT || 3000;

// Home Route
app.get('/', (req, res) => {
    res.send('🎀 Waguri-Chan Music API is Running! 🌊');
});

// Download Route: /api/download?url=YOUR_URL
app.get('/api/download', async (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) return res.status(400).json({ error: 'URL is required' });

    try {
        res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
        ytdl(videoURL, {
            filter: 'audioonly',
            quality: 'highestaudio',
        }).pipe(res);
    } catch (err) {
        res.status(500).json({ error: 'Download failed', details: err.message });
    }
});

// Search Route: /api/search?q=SONG_NAME
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    try {
        const r = await ytSearch(query);
        const videos = r.videos.slice(0, 5);
        res.json({ success: true, results: videos });
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
                   
