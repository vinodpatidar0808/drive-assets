import './App.css';
import Container from "./components/Container";
import Sidebar from "./components/Sidebar";
import useWebSocket from "./hooks/useWebSocket";

function App() {
  const data = useWebSocket();
  
  return (
    <>
      <main className="app">
        <Sidebar completed={data?.completedFiles} total={data?.totalFiles} />
        <Container />
      </main>

    </>
  )
}

export default App
