require("dotenv").config();
const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");
const fs = require("fs");
const { extractFolderId, fetchDriveFiles, downloadFile, DOWNLOAD_FOLDER } = require("./utils");

const app = express();
const PORT = 8080;


app.use(express.json());
app.use(express.static("public"));
app.use(
  cors({
    origin: ["http://localhost:5173"], // Allowed origins
  })
);

// WebSocket Server
const wss = new WebSocket.Server({ port: 8081 });


app.post("/api/submit", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Invalid URL" });

  // TODO:
  // 1. get folder id and start download process
  // 2. Send progress updates
  // 3. Send completion message
  const folderId = extractFolderId(url);
  if (!folderId) return res.status(400).json({ error: "Invalid Google Drive URL" });

  const files = await fetchDriveFiles(folderId);
  // return res.json({ files });


  if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER, { recursive: true });
  }

  files.forEach((file) => {
    if (file.mimeType.startsWith("image/") || file.mimeType.startsWith("video/")) {
      downloadFile(file, wss.clients.values().next().value);
    }
  });

  res.json({ message: "Download process started!" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
