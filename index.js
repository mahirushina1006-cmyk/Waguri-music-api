const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Waguri API is Active! 🎀');
});

app.get('/api/search', async (req, res) => {
    try {
        const r = await ytSearch(req.query.q || 'ayna kori');
        res.json({ success: true, results: r.videos.slice(0, 6) });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('URL required');
    
    try {
        res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
        ytdl(videoUrl, { 
            filter: 'audioonly', 
            quality: 'highestaudio',
            // এই অপশনগুলো ইউটিউব ব্লক এড়াতে সাহায্য করবে
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
                }
            }
        }).pipe(res);
    } catch (err) {
        res.status(500).send('Download error');
    }
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
    
