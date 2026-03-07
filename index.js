const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Waguri API is Online! 🎀'));

app.get('/api/search', async (req, res) => {
    try {
        const r = await ytSearch(req.query.q || 'music');
        res.json({ success: true, results: r.videos.slice(0, 6) });
    } catch (err) { res.status(500).json({ error: 'Search failed' }); }
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('URL missing');
    try {
        res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
        
        // এখানে ইউটিউবের ব্লক এড়ানোর জন্য কুকি বা ইউজার এজেন্ট ব্যবহার করা হয়েছে
        const stream = ytdl(videoUrl, { 
            filter: 'audioonly', 
            quality: 'highestaudio',
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
                }
            }
        });

        stream.on('error', (err) => {
            console.error(err);
            if (!res.headersSent) res.status(500).send('Youtube blocked this request');
        });

        stream.pipe(res);
    } catch (err) { 
        console.error(err);
        if (!res.headersSent) res.status(500).send('Download error'); 
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        
