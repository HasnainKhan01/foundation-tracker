import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Intro from './pages/Intro';
import Log from './pages/Log';
import Note from './pages/Note';
import Snapshot from './pages/Snapshot';
import Guide from './pages/Guide';
import { ServerProvider, WarmupGate } from './components/ServerStatus';
import './App.css';
import Prizes from './pages/Prizes';

function App() {
  return (
    <ServerProvider>
      <BrowserRouter>
        <nav className="nav">
          <Link to="/">Intro</Link>
          <Link to="/log">Log</Link>
          <Link to="/note">Note</Link>
          <Link to="/snapshot">Snapshot</Link>
          <Link to="/guide">Guide</Link>
          <Link to="/prizes">Prizes</Link>
        </nav>
        <main className="page">
          <Routes>
            {/* Intro is static, so recruiters never wait on the backend */}
            <Route path="/" element={<Intro />} />
            <Route path="/log" element={<WarmupGate><Log /></WarmupGate>} />
            <Route path="/note" element={<WarmupGate><Note /></WarmupGate>} />
            <Route path="/snapshot" element={<WarmupGate><Snapshot /></WarmupGate>} />
            <Route path="/prizes" element={<WarmupGate><Prizes /></WarmupGate>} />
            <Route path="/guide" element={<WarmupGate><Guide /></WarmupGate>} />
          </Routes>
        </main>
      </BrowserRouter>
    </ServerProvider>
  );
}

export default App;
