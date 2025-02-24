const axios = require("axios");
const fs = require('fs')
const path = require('path')

const DOWNLOAD_FOLDER = path.join(__dirname, "public", "assets");

// extract folder id from provided google drive url, if invalid url returns null
const extractFolderId = (url) => {
  const match = url.match(/(?:folders\/|id=)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

// fetches files from google drive based on folder id extracted from the url.
const fetchDriveFiles = async (folderId) => {
  console.log("fetching files from drive")
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${process.env.GOOGLE_API_KEY}&fields=files(id,name,mimeType,webContentLink,thumbnailLink,size,hasThumbnail)`;

  try {
    // if there are many files, need to handle pagination here, but for now just fetch all
    const response = await axios.get(url);
    // console.log("response: ", response)
    return response.data.files || [];
  } catch (error) {
    console.error("Error fetching files:", error.response?.data || error.message);
    return [];
  }
};


let count = 1;
const downloadFile = async (file, ws) => {
  const { id, name, mimeType } = file;
  // this will only work for folder which are publicly shared, downloading content of private folder will require authentication token from user
  const fileUrl = `https://www.googleapis.com/drive/v3/files/${id}?key=${process.env.GOOGLE_API_KEY}&alt=media`;
  const filePath = path.join(DOWNLOAD_FOLDER, name);

  try {
    const response = await axios({
      url: fileUrl,
      method: "GET",
      responseType: "stream",
    });
    // console.log('response: ', response)

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        // ws.send(JSON.stringify({ type: "progress", file: name }));
        console.log("file downloaded successfully")
        resolve(name);
      });
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Error downloading ${name}:`, error.message);
    return null;
  }
};


module.exports = { extractFolderId, fetchDriveFiles, downloadFile, DOWNLOAD_FOLDER };