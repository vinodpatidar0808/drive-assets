import axios from "axios"
import { useState } from "react"
import { validDriveUrl } from "../utils"
import ProgressBar from "./Progressbar"

const Sidebar = ({ completed, total }) => {
  const [url, setUrl] = useState("")
  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/submit`, { url })
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
      <ProgressBar completed={completed ?? 0} total={total} />
    </div>
  )
}

export default Sidebar