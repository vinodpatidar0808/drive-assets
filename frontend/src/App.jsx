import axios from "axios";
import { useState } from "react";
import './App.css';
import Container from "./components/Container";
import Sidebar from "./components/Sidebar";

function App() {
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [assets, setAssets] = useState([])


  const handleSubmit = async (url) => {
    setLoading(true)
    try {
      if (ws) {
        ws.close()
      }
      const socket = new WebSocket(import.meta.env.VITE_SOCKET_URL);

      socket.onopen = () => console.log("WebSocket connected");
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data)
        if (data.file) {
          setAssets((prevAssets) => [...prevAssets, data.file]);
          setProgress({
            completed: data.completedFiles,
            total: data.totalFiles
          });
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected")
        setLoading(false)
      };
      socket.onerror = (error) => console.error("WebSocket error:", error);
      setWs(socket);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/submit`, { url })
    } catch (error) {
      console.log(error)
    }

  }

  console.log("assets", assets)

  return (
    <>
      <main className="app">
        <Sidebar completed={progress?.completed} total={progress?.total} handleSubmit={handleSubmit} loading={loading} />
        <Container assets={assets} />
      </main>

    </>
  )
}

export default App
