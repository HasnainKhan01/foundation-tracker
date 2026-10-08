import { useState, useEffect } from 'react';

const today = new Date().toISOString().split('T')[0];

function Note() {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/entries/${today}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setNote(data.note);
        }
      })
      .catch((err) => console.error('Failed to load note:', err));
  }, []);

  function handleSave() {
    fetch(`http://localhost:5000/api/entries/${today}/note`, {
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
      <h1>{today}</h1>
      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        rows={6}
        placeholder="What got done today? How'd it feel?"
      />
      <br />
      <button onClick={handleSave}>Save</button>
      {saved && <span> Saved!</span>}
    </div>
  );
}

export default Note;