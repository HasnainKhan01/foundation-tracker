import { useState } from 'react';

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
        <pre className="guide-content">{content}</pre>
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