const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// AUDIO
app.get("/audio", (req, res) => {
  const url = req.query.url;
  if (!url) return res.send("No URL");

  const file = "audio.mp3";

  exec(`yt-dlp -x --audio-format mp3 -o "${file}" ${url}`, (err) => {
    if (err) return res.send("Download error");

    res.download(file, () => {
      fs.unlinkSync(file);
    });
  });
});

// VIDEO
app.get("/video", (req, res) => {
  const url = req.query.url;
  if (!url) return res.send("No URL");

  const file = "video.mp4";

  exec(`yt-dlp -f best -o "${file}" ${url}`, (err) => {
    if (err) return res.send("Download error");

    res.download(file, () => {
      fs.unlinkSync(file);
    });
  });
});

app.listen(PORT, () => console.log("Server running on " + PORT));
