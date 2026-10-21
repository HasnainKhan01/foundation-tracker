import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Floating button that appears once you've scrolled down the guide
function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 400);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToTop() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  return (
    <button
      className={show ? 'scroll-top show' : 'scroll-top'}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      tabIndex={show ? 0 : -1}
    >
      ↑ Top
    </button>
  );
}

function Guide() {
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');

  function handleUnlock() {
    fetch(`${import.meta.env.VITE_API_URL}/api/guide/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setContent(data.content);
          setError('');
        } else {
          setError('Incorrect password');
        }
      })
      .catch((err) => console.error('Unlock failed:', err));
  }

  if (content) {
    return (
      <div>
        <div className="page-header">
          <h1>Guide</h1>
          <p className="subline">Personal reference</p>
        </div>
        <div className="guide-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Wrap tables so wide ones scroll sideways on phones instead of breaking the layout
              table: ({ children }) => (
                <div className="table-wrap"><table>{children}</table></div>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        <ScrollToTop />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Guide</h1>
        <p className="subline">Personal reference</p>
      </div>
      <div className="unlock-row">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
        <button onClick={handleUnlock}>Unlock</button>
      </div>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

export default Guide;