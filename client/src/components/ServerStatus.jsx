import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import './ServerStatus.css';

const API = import.meta.env.VITE_API_URL;
const RETRY_MS = 2000;
const GIVE_UP_MS = 90000;
const SHOW_AFTER_MS = 400; // don't flash the loading screen when the server is already awake

const ServerContext = createContext({ status: 'checking', retry: () => {} });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Pings the backend as soon as the app loads so it starts waking up while the
// visitor is still reading the intro page. status: 'checking' | 'ready' | 'error'
export function ServerProvider({ children }) {
  const [status, setStatus] = useState('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    async function warmUp() {
      while (!cancelled) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const res = await fetch(`${API}/api/health`, { signal: controller.signal });
          if (res.ok) {
            const data = await res.json();
            if (data.db) {
              if (!cancelled) setStatus('ready');
              return;
            }
          }
        } catch {
          // server still asleep or unreachable, try again below
        } finally {
          clearTimeout(timeout);
        }
        if (Date.now() - startedAt > GIVE_UP_MS) {
          if (!cancelled) setStatus('error');
          return;
        }
        await sleep(RETRY_MS);
      }
    }

    warmUp();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setStatus('checking');
    setAttempt((n) => n + 1);
  }, []);

  return (
    <ServerContext.Provider value={{ status, retry }}>{children}</ServerContext.Provider>
  );
}

function LoadingScreen({ status, onRetry }) {
  const [visible, setVisible] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    const slowTimer = setTimeout(() => setSlow(true), 6000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(slowTimer);
    };
  }, []);

  if (!visible && status !== 'error') {
    return <div className="warmup" aria-hidden="true" />;
  }

  if (status === 'error') {
    return (
      <div className="warmup" role="alert">
        <p className="warmup-title">Couldn’t reach the server</p>
        <p className="warmup-text">It didn’t respond after a minute and a half. Check your connection and try again.</p>
        <button className="warmup-retry" onClick={onRetry}>Try again</button>
      </div>
    );
  }

  return (
    <div className="warmup" role="status" aria-live="polite">
      <div className="warmup-cells" aria-hidden="true">
        <span /><span /><span />
      </div>
      <p className="warmup-title">Waking up the server</p>
      <p className="warmup-text">
        {slow
          ? 'The backend sleeps when it’s idle, so the first load can take up to a minute. It’s on its way.'
          : 'One moment.'}
      </p>
    </div>
  );
}

// Wrap any page that needs the API. Pages that don't (Intro) stay outside it.
export function WarmupGate({ children }) {
  const { status, retry } = useContext(ServerContext);
  if (status === 'ready') return children;
  return <LoadingScreen status={status} onRetry={retry} />;
}
