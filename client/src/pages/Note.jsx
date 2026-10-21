import { useState, useEffect } from 'react';
import { toDateString } from '../utils/date';

function Note() {
  const today = toDateString();
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/entries/${today}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setNote(data.note);
        }
      })
      .catch((err) => console.error('Failed to load note:', err));
  }, [today]);

  function handleSave() {
    fetch(`${import.meta.env.VITE_API_URL}/api/entries/${today}/note`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
      .then(() => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      })
      .catch((err) => console.error('Failed to save note:', err));
  }

  return (
    <div>
      <div className="page-header">
        <h1>Note</h1>
        <p className="subline">{today}</p>
      </div>

      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        rows={6}
        placeholder="What got done today? How'd it feel?"
      />

      <div className="save-row">
        <button onClick={handleSave}>Save</button>
        {saved && <span className="saved-msg">Saved!</span>}
      </div>
    </div>
  );
}

export default Note;