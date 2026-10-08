import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Intro from './pages/Intro';
import Log from './pages/Log';
import Note from './pages/Note';
import Snapshot from './pages/Snapshot';
import Guide from './pages/Guide';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Intro</Link>
        <Link to="/log">Log</Link>
        <Link to="/note">Note</Link>
        <Link to="/snapshot">Snapshot</Link>
        <Link to="/guide">Guide</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/log" element={<Log />} />
        <Route path="/note" element={<Note />} />
        <Route path="/snapshot" element={<Snapshot />} />
        <Route path="/guide" element={<Guide />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;