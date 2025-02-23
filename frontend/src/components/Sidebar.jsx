import axios from "axios"
import { useState } from "react"
import { validDriveUrl } from "../utils"

const Sidebar = () => {
  const [url, setUrl] = useState("")
  const handleSubmit = async () => {
    console.log("submit", url)
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/submit`, { url })
      console.log('res: ', res)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (e) => {
    setUrl(e.target.value)
  }

  return (
    <div className="sidebar">
      <label className="block text-sm font-medium text-gray-700">Paste Google Drive Folder URL:</label>
      <textarea
        className="input"
        rows="3"
        placeholder="Paste your Google Drive folder URL here..."
        value={url}
        onChange={handleChange}
      ></textarea>
      <button disabled={!validDriveUrl(url)} className="button" onClick={handleSubmit}>Send</button>
      {/* TODO: progress bar */}
    </div>
  )
}

export default Sidebar