const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Waguri API is Active! 🎀'));

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
    // অডিও স্ট্রিমিং ফিক্স
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    ytdl(videoUrl, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Connection': 'keep-alive',
          'Cookie': '' // এখানে চাইলে আপনার ইউটিউব কুকি দিতে পারেন যদি বেশি ব্লক করে
        }
      }
    }).pipe(res);

  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).send('Youtube Blocked or Error');
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
          
