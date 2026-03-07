const express = require('express');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Home Page - সুন্দর ইন্টারফেস
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 50px; background-color: #f0f2f5;">
      <h1 style="color: #ff0000;">🎧 Waguri Premium Audio API 🎀</h1>
      <p style="font-size: 1.2em; color: #555;">Server is live and responding to requests.</p>
      <div style="background: white; display: inline-block; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <code style="color: #d63384;">GET /api/search?q=song+name</code><br>
        <code style="color: #0d6efd;">GET /api/download?url=youtube_url</code>
      </div>
      <p style="margin-top: 20px; color: #888;">Powered by Waguri-Chan Project</p>
    </div>
  `);
});

// Search Endpoint - উন্নত সার্চ রেজাল্ট
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ success: false, error: 'কি খুঁজছেন সেটা তো বললেন না!' });

    const searchResults = await ytSearch(query);
    const videos = searchResults.videos.slice(0, 6).map(v => ({
      title: v.title,
      url: v.url,
      duration: v.timestamp, // Duration format 03:45
      author: v.author.name,
      thumbnail: v.thumbnail
    }));

    res.json({ success: true, results: videos });
  } catch (err) {
    res.status(500).json({ success: false, error: 'সার্চ করতে সমস্যা হয়েছে।' });
  }
});

// Download Endpoint - ব্লক এড়ানোর জন্য উন্নত স্ট্রিমিং
app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;
  
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ success: false, error: 'সঠিক ইউটিউব লিঙ্ক দিন।' });
  }

  try {
    // ভিডিওর টাইটেল নেওয়া (ফাইলের নাম হিসেবে ব্যবহারের জন্য)
    const info = await ytdl.getInfo(videoUrl);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');

    const stream = ytdl(videoUrl, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25, // বড় বাফার যাতে মাঝপথে গান না থামে
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      }
    });

    stream.on('error', (err) => {
      console.error('Stream Error:', err.message);
      if (!res.headersSent) res.status(500).send('YouTube blocked this stream.');
    });

    stream.pipe(res);
  } catch (err) {
    console.error('Catch Error:', err.message);
    if (!res.headersSent) res.status(500).json({ success: false, error: 'ডাউনলোড শুরু করা যাচ্ছে না।' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
    
