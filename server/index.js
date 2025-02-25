require("dotenv").config();
const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");
const fs = require("fs");
const path = require('path')
const { extractFolderId, fetchDriveFiles, downloadFile } = require("./utils");

const app = express();
const PORT = 8080;


const BASE_DOWNLOAD_FOLDER = path.join(__dirname, "public", "assets");

const FRONTEND_URL = process.env.FRONTEND_URL

app.use(express.json());
app.use(cors({
  origin: [FRONTEND_URL],
})
);
// app.use(cors());
// this will server static assets when called from ui
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));



// WebSocket Server
const wss = new WebSocket.Server({ port: 8081 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log("Received:", message);
  });

  ws.on("close", () => console.log("Client disconnected"));
});

app.post("/api/submit", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Invalid URL" });

  const folderId = extractFolderId(url);
  if (!folderId) return res.status(400).json({ error: "Invalid Google Drive URL" });

  const files = await fetchDriveFiles(folderId);

  const DOWNLOAD_FOLDER = path.join(BASE_DOWNLOAD_FOLDER, folderId);
  if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER, { recursive: true });
  }

  // keep track of total files and completed files
  const totalFiles = files.length;
  let completedFiles = 0;
  files.forEach((file) => {
    if (file.mimeType.startsWith("image/") || file.mimeType.startsWith("video/")) {
      downloadFile(DOWNLOAD_FOLDER, folderId, file, (progressData) => {
        completedFiles++;
        wss?.clients?.forEach((client) => {
          client.send(JSON.stringify({ totalFiles, completedFiles, file: { ...progressData } }));
        });
      });
    }
  });

  res.json({ message: "Download process started!" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
