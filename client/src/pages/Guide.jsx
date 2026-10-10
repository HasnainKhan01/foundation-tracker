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
        <pre>{content}</pre>
      </div>
    );
  }

  return (
    <div>
      <h1>Foundation Guide</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      <button onClick={handleUnlock}>Unlock</button>
      {error && <p>{error}</p>}
    </div>
  );
}

export default Guide;