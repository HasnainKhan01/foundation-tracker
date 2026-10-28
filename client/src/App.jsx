import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Intro from './pages/Intro';
import Log from './pages/Log';
import Snapshot from './pages/Snapshot';
import Guide from './pages/Guide';
import { ServerProvider, WarmupGate } from './components/ServerStatus';
import './App.css';
import Prizes from './pages/Prizes';
import Rewards from './pages/Rewards';

function App() {
  return (
    <ServerProvider>
      <BrowserRouter>
        <nav className="nav">
          <Link to="/">Intro</Link>
          <Link to="/log">Log</Link>
          <Link to="/snapshot">Snapshot</Link>
          <Link to="/prizes">Prizes</Link>
          <Link to="/rewards">Rewards</Link>
          <Link to="/guide">Guide</Link>

        </nav>
        <main className="page">
          <Routes>
            {/* Intro is static, so recruiters never wait on the backend */}
            <Route path="/" element={<Intro />} />
            <Route path="/log" element={<WarmupGate><Log /></WarmupGate>} />
            <Route path="/snapshot" element={<WarmupGate><Snapshot /></WarmupGate>} />
            <Route path="/prizes" element={<WarmupGate><Prizes /></WarmupGate>} />
            <Route path="/rewards" element={<WarmupGate><Rewards /></WarmupGate>} />
            <Route path="/guide" element={<WarmupGate><Guide /></WarmupGate>} />
            {/* Old bookmarks to /note land on the Log page, where the note now lives */}
            <Route path="/note" element={<Navigate to="/log" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ServerProvider>
  );
}

export default App;
